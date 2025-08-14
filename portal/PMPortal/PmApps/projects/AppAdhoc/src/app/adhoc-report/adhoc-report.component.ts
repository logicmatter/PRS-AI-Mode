import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { Component, OnInit } from "@angular/core";
import { AdhocReportutilityService } from "../adhoc-reportutility.service";
import { TenantService, ReportingService } from "src/app/PmCore/services";
import { takeUntil } from "rxjs/operators";
import { Subject, throwError } from "rxjs";
import { Chart, registerables } from "chart.js";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { Router } from "@angular/router";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { Location } from "@angular/common";
import { DatePickerHelper } from 'src/app/core/commondatepicker/datepicker-helper';
import { DatepickerService } from 'src/app/core/commondatepicker/datepicker.service';
import { SearchUtilityService } from 'src/app/pages/search/search-utility.service';
import { CategoryScale } from 'chart.js';
Chart.register(CategoryScale);
Chart.register(...registerables);
@Component({
  selector: "app-adhoc-report",
  templateUrl: "./adhoc-report.component.html",
  styleUrls: ["./adhoc-report.component.scss"]
})
export class AdhocReportComponent implements OnInit {
  tenants: any;
  dr: string;
  resolution: string;
  startDate: Date;
  endDate: Date;
  dataAvailability: boolean;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  public commonDateModel: CommonDateModel;
  previousTenant: any = "";
  previousDuration: any;

  showBackButton: boolean = true;
  previousStartDate: Date;
  previousEndDate: Date;
  maxStartDate = new Date();
  maxEndDate = new Date();
  isDateRangeValid: boolean = true;
  dateError: string;
  accessGlobal: boolean = true;
  durations: any;
  searchText: string;
  constructor(
    private router: Router,
    public adhocUtility: AdhocReportutilityService,
    public _appUtil: AppUtilService,
    public tenantService: TenantService,
    public utility: UtilityService,
    public _adhocReport: ReportingService,
    private _location: Location,
    public datePickerHelper: DatePickerHelper,
    public dateService: DatepickerService,
    public coreService: CoreUtilityService,
    public searchUtility: SearchUtilityService,
  ) {
    this.adhocUtility.reportParams = this.coreService.reportParams;
    this.datePickerHelper.getDateTimeDurations().subscribe(data => {
      this.durations = data.durations;
      //this.dr = this.durations[1].value;	
    });
  }

  ngOnInit() {

    this.maxStartDate.setHours(0, 0, 0, 0);
    this.maxEndDate.setHours(23, 59, 59, 59);
    this.commonDateModel = this.tenantService.currentDateValue;
    this.adhocUtility.reportParams = this.coreService.reportParams;
    this.getTenants();
  }
  getAdhocReporting() {
    this.tenantService.currentTenant
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.commonDateModel = this.tenantService.currentDateValue;
        this.adhocUtility.tenantID = this.tenantService.currentTenantValue.tenantId;
        this.adhocUtility.userID = this.tenantService.currentTenantValue.userId;

        if (this.adhocUtility.reportParams.sidArray == undefined) {
          this.router.navigate(['./search'], { queryParams: { objectType: 'Alarm', keyword: this.searchUtility.model.keyWord, app: 'adhoc' } });
        }
        if (this.adhocUtility.reportParams.sidArray.length > 0) {
          this.adhocUtility.reportParams.sid = this.adhocUtility.reportParams.sidArray.toString();
        } else {
          this.router.navigate(['./search'], { queryParams: { objectType: 'Alarm', keyword: this.searchUtility.model.keyWord, app: 'adhoc' } });
        }
        if (this.commonDateModel.duration) {
          this.adhocUtility.reportParams.duration = this.commonDateModel.duration; //"daily";
        }

        this.adhocUtility.reportParams.startDate = this.adhocUtility.convert(
          this.commonDateModel.startDate
        );
        this.adhocUtility.reportParams.endDate = this.adhocUtility.convert(
          this.commonDateModel.endDate
        );

        this.resolution = this.commonDateModel.resolution;

        if (this.adhocUtility.tenantID === undefined) {
          this.router.navigate(['./search'], { queryParams: { objectType: 'Alarm', keyword: this.searchUtility.model.keyWord, app: 'adhoc' } });
          return;
        }
        //this.setDuration();
        this.dr = this.adhocUtility.reportParams.duration;
        this.startDate = new Date(this.adhocUtility.reportParams.startDate);
        this.endDate = new Date(this.adhocUtility.reportParams.endDate);
        this.adhocUtility.reportParams.resolution = this.resolution;
        this.getReportData();
        this.adhocUtility.adhocDurationChg = true;
        if (this.adhocUtility.adhocChart && this.adhocUtility.adhocChart != null) {
          this.adhocUtility.adhocChart.destroy();
          this.adhocUtility.adhocChart = null;
        } else {
          this.adhocUtility.adhocChart = new Chart(
            "myChart",
            this.adhocUtility.adhocConfig
          );
        }
      });
  }
  goBack() {
    this._location.back();
    //  this.router.navigate(['/search/'+this.adhocUtility.reportParams.objectType.toLowerCase()], { queryParams: { objectType: this.adhocUtility.reportParams.objectType, keyword: this.adhocUtility.reportParams.keyWord,DevNum: this.adhocUtility.paramDevNum,app: this.adhocUtility.reportParams.app } });
  }
  getTenants() {
    this.tenantService.currentTenant
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        tenant => {
          this.tenants = tenant;
          if (tenant === undefined) {
            this.utility.reportParams.objectType = "";
            return;
          }
          if (this._appUtil.previousTenant === undefined) {
            this._appUtil.previousTenant = this.tenantService.currentTenantValue.tenantName;
          }
          if (this.tenantService.currentTenantValue.tenantName != this._appUtil.previousTenant) {
            this._appUtil.previousTenant = this.tenantService.currentTenantValue.tenantName;
            this.adhocUtility.tenantID = this.tenantService.currentTenantValue.tenantId;
            this.adhocUtility.userID = this.tenantService.currentTenantValue.userId;
            this.adhocUtility.saveFilter = '';
            this._appUtil.selectedItems = [];
            this.adhocUtility.checkNames = [];
            this.adhocUtility.checkedList = [];
            this.router.navigate(['./search'], { queryParams: { objectType: 'Alarm', keyword: this.searchUtility.model.keyWord, app: 'adhoc' } });

          }
          this.getDates();
        },
        err => {
          console.log(err);
        }
      );
  }

  getDates() {
    this.tenantService.currentDate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        tenant => {
          this.tenants = tenant;
          if (tenant === undefined) {
            this.utility.reportParams.objectType = "";
            return;
          }
          this.adhocUtility.tenantID = this.tenantService.currentTenantValue.tenantId;
          this.adhocUtility.userID = this.tenantService.currentTenantValue.userId;

          if (
            this.tenantService.currentDateValue.duration !== this.dr || this.tenantService.currentDateValue.startDate.getTime() !== this.startDate.getTime()
            || this.tenantService.currentDateValue.endDate.getTime() !== this.endDate.getTime() || this.tenantService.currentDateValue.resolution !== this.resolution
          ) {
            this.previousDuration = this.tenantService.currentDateValue.duration;
            this.isDateRangeValid = true;
            this.getAdhocReporting();
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  changeDuration() {
    this.isDateRangeValid = true;
    if (this.dr != "custom") {
      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 59);
      this.getstartEndDates(this.dr);
      this._appUtil.getDefaultReportResolution(this.dr);
    } else {
      let tempStartDate = new Date();
      let tempEndDate = new Date();
      this.startDate = new Date(tempStartDate.setHours(0, 0, 0, 0));
      this.endDate = new Date(tempEndDate.setHours(23, 59, 59, 59));
      this._appUtil.getDefaultReportResolution(
        this.dr,
        this.startDate,
        this.endDate
      );
    }
    this.resolution = this._appUtil.resolution;
    this.adhocUtility.resolution = this._appUtil.resolution;
  }
  changeDateDuration() {
    //this.datePickerHelper._duration = this.dr;
    this.isDateRangeValid = true;
    let fromDate = this.coreService.convert(this.startDate);
    let toDate = this.coreService.convert(this.endDate);
    var newStartDate = new Date(fromDate);
    var newEndDate = new Date(toDate);
    if (newStartDate > newEndDate) {
      this.dateError = "Start Date should be less than End Date";
      //this.getErrorMsg("Start date is greater than End date");
      //this._toastr.error("Start date is greater than End date");
      this.isDateRangeValid = false;
    }
    else {
      this.isDateRangeValid = true;
      this.dateError = "";
    }
    if (this.dr != "custom") {
      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 59);
      this.getstartEndDates(this.dr);
      this._appUtil.getDefaultReportResolution(this.dr);
    } else {
      this._appUtil.getDefaultReportResolution(
        this.dr,
        this.startDate,
        this.endDate
      );
    }
    this.resolution = this._appUtil.resolution;
    this.adhocUtility.resolution = this._appUtil.resolution;
  }
  getstartEndDates(duration) {
    this.tenantService
      .getDurationDates(duration)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(resp => {
        this.startDate = new Date(resp.startDate);
        this.endDate = new Date(resp.endDate);
        return this.startDate, this.endDate;
      });
  }
  getReportData() {

    this.adhocUtility.adhocShowSpinner = true;
    this.adhocUtility.adhocDurationChg = true;
    let dataset = [];
    let occurances = [];
    let labels = [];
    let tempObj = {};
    this.adhocUtility.reportParams.startDate = this.adhocUtility.convert(
      this.startDate
    );
    this.adhocUtility.reportParams.endDate = this.adhocUtility.convert(this.endDate);
    this.adhocUtility.reportParams.resolution = this.resolution;
    if (
      this.datePickerHelper._duration !== this.dr || this.datePickerHelper.arsStartDate.getTime() !== this.startDate.getTime()
      || this.datePickerHelper.arsEndDate.getTime() !== this.endDate.getTime() || this.datePickerHelper.resolution !== this.resolution
    ) {
      this.isDateRangeValid = true;
      this.coreService.isDateRangeValid = true;
      this.coreService.dateError = '';
      this.tenantService.currentDateValue.duration = this.dr;
      this.tenantService.currentDateValue.startDate = this.startDate;
      this.tenantService.currentDateValue.endDate = this.endDate;
      this.tenantService.currentDateValue.resolution = this.resolution;
      this.datePickerHelper._duration = this.dr;
      this.datePickerHelper.arsStartDate = this.startDate;
      this.datePickerHelper.arsEndDate = this.endDate;
      this.datePickerHelper.arsStartTime = new Date(this.startDate.setHours(this.startDate.getHours(), this.startDate.getMinutes(), this.startDate.getSeconds()));
      this.datePickerHelper.arsEndTime = new Date(this.endDate.setHours(this.endDate.getHours(), this.endDate.getMinutes(), this.endDate.getSeconds()));
      setTimeout(() => {
        this.datePickerHelper.resolution = this.resolution;
        this.dateService.changeMessage(this.resolution);
      }, 2000);
      this.tenantService.currentDateValue.src = 'local';
      this.commonDateModel = this.tenantService.currentDateValue;
      this.tenantService.setCommonDate(this.commonDateModel);
    }

    this.adhocUtility.adhocConfig.data = {
      labels: [],
      datasets: []
    };
    let yLabelString = "";
    let xLabelString = "";
    switch (this.adhocUtility.reportParams.resolution) {
      case "actual": {
        xLabelString = "Actual";
        break;
      }
      case "hourly": {
        xLabelString = "Hour";
        break;
      }
      case "daily": {
        xLabelString = "Day";
        break;
      }
      case "weekly": {
        xLabelString = "Week";
        break;
      }
      case "monthly": {
        xLabelString = "Month";
        break;
      }
      case "quarterly": {
        xLabelString = "Quarter";
        break;
      }
      case "yearly": {
        xLabelString = "Year";
        break;
      }
    }

    yLabelString = this.adhocUtility.reportParams.objectType == "Alarm" ? 'Count' : 'Log Value'
    this.adhocUtility.adhocConfig.options.scales = {
      x:
      {

        display: true,
        scaleLabel: {
          display: true,
          labelString: xLabelString, //this.resolution.toLocaleUpperCase(),
          fontStyle: "bold",
          fontSize: 15
        }
      },
      y:
      {

        ticks: {
          min: 0,
          suggestedMax: 7
        },
        display: true,
        scaleLabel: {
          display: true,
          labelString: yLabelString,
          fontStyle: "bold",
          fontSize: 15
        }
      }
    };

    this._adhocReport
      .getAhdocReportData(this.adhocUtility.reportParams, this.adhocUtility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          if (this.adhocUtility.adhocChart) {
            this.adhocUtility.adhocChart.destroy();
          }
          this.adhocUtility.adhocChart = new Chart(
            "myChart",
            this.adhocUtility.adhocConfig
          );
          this.updateChartWithData(data);

          // Update the Chart instance
          this.adhocUtility.adhocChart.update();

          // Hide spinner or perform other actions as needed
          this.adhocUtility.adhocShowSpinner = false;
        },
        error => {
          console.log(error);
          this.adhocUtility.adhocShowSpinner = false;
          this.adhocUtility.adhocDurationChg = false;
        }
      );

  }

  updateChartWithData(data) {
    let labels = [];
    let dataset = [];
    let occurances = [];
    let xLabelString = "X Axis Label"; // Set your X axis label here
    let yLabelString = ""; // Set your Y axis label here
    let size = this.size(data);

    for (let [key, Value] of Object.entries(data)) {
      labels.push(Value["x-Axis"]);
    }

    let uniqueXAxis = [...new Set(labels)];
    let sids = this.adhocUtility.reportParams.sidArray;

    for (let i = 0; i < sids.length; i++) {
      for (let temp = 0; temp < uniqueXAxis.length; temp++) {
        occurances[temp] = 0;
      }

      let j = 0;
      let desc = "No Data Available";
      let tempObj = {};

      sids.sort();

      if (size != 0) {
        this.adhocUtility.adhocDurationChg = true;

        if (desc === "No Data Available") {
          this.adhocUtility.reportParams.objectName.forEach(item => {
            if (item["key"] == sids[i]) {
              desc = item["value"] + " (No Data Available)";
            }
          });
        }

        for (j; j < size; j++) {
          if (sids[i] == data[j]["sid"]) {
            let index = uniqueXAxis.indexOf(data[j]["x-Axis"]);
            desc = data[j]["logDescription"] + ' (' + data[j]["objName"] + ')';

            if (index != -1) {
              occurances[index] = data[j]["y_Axis"];
            }
          }
        }

        if (desc === "No Data Available") {
          this.adhocUtility.reportParams.objectName.forEach(item => {
            if (item["key"] == sids[i]) {
              desc = item["value"] + " (No Data Available)";
            }
          });
        }

        tempObj["label"] = desc;
        tempObj["data"] = occurances;
        tempObj["fill"] = false;
        tempObj["borderColor"] = this.adhocUtility.color[i];
        tempObj["backgroundColor"] = tempObj["borderColor"];
        tempObj["pointRadius"] = 4;
        dataset.push(tempObj);

        desc = "";
        occurances = [];
      } else {
        this.adhocUtility.adhocDurationChg = false;
      }
    }

    this.adhocUtility.adhocConfig.data = {
      labels: uniqueXAxis,
      datasets: dataset
    };

    if (this.adhocUtility.reportParams.objectType == "Alarm") {
      this.adhocUtility.adhocConfig.type = "bar";
      yLabelString = "Count";
      this.adhocUtility.adhocConfig.options.scales = {
        x: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: xLabelString,
            fontStyle: "bold",
            fontSize: 15
          }
        },
        y: {
          ticks: {
            min: 0,
            suggestedMax: 7
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: yLabelString,
            fontStyle: "bold",
            fontSize: 15
          }
        }
      };
    } else {
      this.adhocUtility.adhocConfig.type = "line";
      yLabelString = "Log Value";
      this.adhocUtility.adhocConfig.options.scales = {
        x: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: xLabelString,
            fontStyle: "bold",
            fontSize: 15
          }
        },
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: yLabelString,
            fontStyle: "bold",
            fontSize: 15
          }
        }
      };
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  size(obj) {
    let size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  }
  setResolution(event) {
    this.resolution = event.target.value;
    this.getReportData();
  }
}


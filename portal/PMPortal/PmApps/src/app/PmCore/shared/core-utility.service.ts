import { Injectable } from "@angular/core";
import { AdhocReporting } from "../../PmModel/adhoc-reporting";
import { range, Subject } from "rxjs";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { TenantService, ReportingService } from "../services";
import { takeUntil } from "rxjs/operators";
import { CommonModel } from "src/app/PmModel/common.model";
@Injectable({
  providedIn: "root"
})
export class CoreUtilityService {
  public _counter: number = 15;
  status: boolean = false;
  sids: any = [];
  checkNames: any = [];
  adhocChart: any;
  adhocDurationChg: boolean = false;
  adhocDurationDesc: string;
  adhocDataDesc: string;
  adhocShowSpinner: boolean;
  adhocglobalStartDate: string;
  adhocglobalEndDate: string;
  adhocglobalDuration: string;
  adhocPreviousRoute: string;
  haspages: boolean;
  presentPageNo: number;
  totalPageNo: number;
  isDisable: boolean;
  isDisablefirst: boolean;
  isDisablefirstpre: boolean;
  isDisablelast: boolean;
  isDisablelastnxt: boolean;
  isDateRangeValid: boolean = true;
  pageRange: any;
  testRange: any;
  rptObj: any;
  reportsList: any;
  reportInnerHtml: string;
  isTabLink: boolean;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  hasChild: boolean;
  rptPathName: string;
  reportData: string;
  rptParamValues: any = {};
  public reportObj: ReportObj = new ReportObj();
  showSpinner: boolean;
  public reportParams: AdhocReporting = new AdhocReporting();
  filter;
  rtpType: any;
  resolution: string;
  currentUrl: string;
  maxRecords: any = '10';
  datePicker: any = {
    "startDate": '',
    "endDate": '',
    "duration": '',
    "resolution": ''
  }
  public adhocConfig: any = {
    type: "line",
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      fill: false,
      maintainAspectRatio: true,
      hover: {
        mode: "point",
        intersect: true
      },
      legend: {
        position: "bottom"
      },
      scales: {
        x:
        {

          display: true,
          scaleLabel: {
            display: true,
            labelString: ""
          }
        },
        y:
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Count"
          }
        }
      },
      elements: {
        point: {
          pointStyle: "rectRounded"
        }
      }
    }
  };
  parrentReportPath: string;

  key: string;
  reverse: boolean;
  disableTime: boolean;
  minDate: any;
  maxDate: any;
  dateError: string;
  previousTenant: string = '';
  selectedTenantName: any;
  resolutions = [];
  alarmKeyWord: string;
  trendKeyWord: string;
  sort(key: string) {
    if (key !== "") {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  constructor(
    private tenantService: TenantService,
    private reportService: ReportingService
  ) { }

  // Get the Report List
  getReportsList() {
    this.reportService
      .getSystemActivities()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.reportsList = data[1];
        if (this.reportsList) {
          //this.getParentReport(type);
        }
      });
  }
  public convert(str) {
    if (str) {
      var date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2),
        hours = ("0" + date.getHours()).slice(-2),
        minutes = ("0" + date.getMinutes()).slice(-2),
        seconds = ("0" + date.getSeconds()).slice(-2);

      var mySQLDate = [date.getFullYear(), month, day].join("-");
      var mySQLTime = [hours, minutes, seconds].join(":");
      return [mySQLDate, mySQLTime].join(" ");
    } return '';
  }

  getDefaultReportResolution(duration: string, startDate: Date, endDate: Date) {
    switch (duration.toLowerCase()) {
      case "today": {
        this.resolution = "actual";
        break;
      }
      case "yesterday": {
        this.resolution = "hourly";
        break;
      }
      case "currentweek": {
        this.resolution = "daily";
        break;
      }
      case "lastweek": {
        this.resolution = "daily";
        break;
      }
      case "currentmonth": {
        this.resolution = "daily";
        break;
      }
      case "lastmonth": {
        this.resolution = "daily";
        break;
      }
      case "currentquarter": {
        this.resolution = "weekly";
        break;
      }
      case "lastquarter": {
        this.resolution = "weekly";
        break;
      }
      case "currentyear": {
        this.resolution = "monthly";
        break;
      }
      case "lastyear": {
        this.resolution = "monthly";
        break;
      }
      case "custom": {
        let nod = this.getDateDifference(startDate, endDate);
        this.getCustomResolution(nod);
        break;
      }
      default: {
        //statements;
        // this.resolution = "custom";
        break;
      }
    }
    // this.getJson().subscribe(data => {
    //   if ("custom" === duration) {
    //     //
    //     return;
    //   }
    //   for (let [key, value] of Object.entries(data)) {
    //     if (value['dr'] === duration) {
    //       this.resolution = value['resolution'];
    //     }
    //   }
    // }, error => {
    // });
  }
  getDateDifference(startDate: Date, endDate: Date): number {
    // var d1 = new Date(this._utility.reportParams.startDate);
    // var d2 = new Date(this._utility.reportParams.endDate);
    var timeDiff = endDate.getTime() - startDate.getTime();
    var DaysDiff = timeDiff / (1000 * 3600 * 24);
    return Math.round(DaysDiff);
  }
  getCustomResolution(numberOfDay: number) {
    if (numberOfDay < 1) {
      this.resolution = "actual";
    } else if (numberOfDay == 1) {
      this.resolution = "hourly";
    } else if (numberOfDay > 1 && numberOfDay < 90) {
      this.resolution = "daily";
    }
    // else if(numberOfDay >30 && numberOfDay <90){
    //   this.resolution = "daily";
    // }
    else if (numberOfDay >= 90 && numberOfDay < 365) {
      this.resolution = "weekly";
    } else {
      this.resolution = "monthly";
    }
  }

}

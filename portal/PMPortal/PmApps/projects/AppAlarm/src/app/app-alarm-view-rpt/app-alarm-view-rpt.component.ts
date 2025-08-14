import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

import { Component, OnInit, OnDestroy } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";

import { ReportingService, TenantService } from "src/app/PmCore/services";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { CommonModel } from 'src/app/PmModel/common.model';
import { Search } from 'src/app/PmModel/search.model';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getBaseUrl } from "src/main";

@Component({
  selector: "app-alarm-view-rpt",
  templateUrl: "./app-alarm-view-rpt.component.html",
  styleUrls: ["./app-alarm-view-rpt.component.scss"]
})
export class AppAlarmViewRptComponent implements OnInit, OnDestroy {
  isClicked: boolean = false;
  stateObj;
  rptParamObj;
  id;
  isGrafana: boolean = false;
  public commonModel: CommonModel;
  public model: Search = new Search();
  public reportObj: ReportObj = new ReportObj();
  mainWidth: boolean = false;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  GfromValue: string;
  GtoValue: string;
  rptGParamval;



  constructor(
    private _rptService: ReportingService,
    public _route: Router,
    public activatedRoute: ActivatedRoute,
    public _utility: AppUtilService,
    public _Adhocutility: AdhocReportutilityService,
    private tenantService: TenantService,
    public coreService: CoreUtilityService,
    private sanitizer: DomSanitizer

  ) {
    this.id = this._utility.reportID;
    this._utility.validTemplateForm = false;
  }

  ngOnDestroy(): void {

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  reportData: any;

  ngOnInit() {
    if (this._utility.appID == undefined) {
      this._utility.appID = this._route.url.split("/").slice(-2, -1)[0];
      this._route.navigateByUrl('appAlarm/' + this._utility.appID);
    }
    if (this._utility.isReportRun) {
      this.isGrafana = this._utility.isGrafana;
      this._utility.isGrafanaedit == false;

    }
    else {
      this._utility.isGrafana = false;

    }

    this.commonModel = this.tenantService.currentTenantValue;
    // create object Model
    // if(this._utility.selectedItems){
    //   this._utility.selectedItems = [];
    //   this._utility.selectedItems.forEach(element => {
    //     if(typeof element == "string"){
    //       this._utility.selectedItems.push(element);
    //     }
    //     else {
    //       this._utility.selectedItems.push(element.sid);
    //     }
    //   });
    //   this.model.sidParams = this._utility.selectedItems.toString();
    // }
    this.model.objectType = 'Alarm'
    this.model.tenantId = this.commonModel.tenantId;
    this.model.userId = this.commonModel.userId;
    this.model.app = 'app'
    this.model.sidParams = '';
    this.id = this._utility.reportID;
    if (this._utility.reportID) {
      this._utility.createRpt = false;
      this.rptParamObj = this._utility.rptObj.find(
        p => p.reportId == this._utility.reportID
      );
      this.reportObj.Id = this.rptParamObj["reportId"];
      this.reportObj.ReportName = this.rptParamObj["reportName"];
      this.reportObj.ReportDescription = this.rptParamObj["reportDescription"];
      this._utility.reportObjUtil = this.reportObj;
      if (this.isGrafana) {
        this._rptService.getGrafanaDashboardUrl(this._utility.reportID, this._utility.tenantID)
          .pipe(
            takeUntil(this.ngUnsubscribe),
            switchMap(a => {
              console.log(a);
              this._utility.grafanabase = a;
              return this._rptService.getReportParameterValue(this._utility.reportID, this._utility.tenantID);
            })
          )
          .subscribe(
            data => {
              this.rptGParamval = data;
              const tid = this._utility.tenantID;
              const base = this._utility.grafanabase;
              const kiosk = "kiosk";
              const { startDate, endDate, resolution, duration } = this.tenantService.commonDateModel;
              let grafanaBaseUrl = `${base}&var-tn=${tid}&var-kiosk=${kiosk}&kiosk&theme=light&from=${new Date(startDate).getTime()}&to=${new Date(endDate).getTime()}&var-dr=${duration}&var-res=${resolution}`;
              let grafanaUrl = `${grafanaBaseUrl}&${this.rptGParamval
                .filter(param => param.parameterName !== 'dr' && param.parameterName !== 'res')
                .map(param => `var-${param.parameterName}=${param.parameterValue}`)
                .join('&')}`;
              grafanaUrl = grafanaUrl.endsWith('&') ? grafanaUrl.slice(0, -1) : grafanaUrl;
              this._utility.Grafanaurl = this.sanitizer.bypassSecurityTrustResourceUrl(grafanaUrl);
              this._utility.isObjectGrafana = true;
              console.log(this._utility.Grafanaurl);
            },
            error => {
              console.error(error);
            }
          );
      }

    } else {
      this._utility.createRpt = true;
    }
  }

  goBack() {
    window.history.back();
  }

  openNav() {
    this._utility.toggle = !this._utility.toggle;
    if (this._utility.toggle) {
      this._utility.isClickedToggle = true;
      this._utility.mainWidthToggle = true;
    } else {
      this._utility.isClickedToggle = false;
      this._utility.mainWidthToggle = false;
    }
  }

  closeNav() {
    this.isClicked = false;
    this.mainWidth = false;
  }
  discard() {
    this._utility.isConfigure = false;
    this._utility.isReportList = true;
    this._utility.isCreateReport = false;
    this._utility.isGrafana = this._utility.isGrafanareset;
    this._utility.isGrafanaedit = false;
    this._route.navigateByUrl('appAlarm/' + this._utility.appID);
  }
  // downloadCSV() {
  //   const tenantName = this.tenantService.currentTenantValue.tenantName;
  //   if (this._utility.hasPreview) {
  //     this.reportObj = this._utility.reportObjUtil;
  //     this._utility.rptParamValues = this._utility.rptTempParamValues;
  //   } else {
  //     this.reportObj = this._utility.reportObjUtil;
  //   }
  //   this._utility.reportObjUtil.HasChild = this._utility.hasChild;
  //   this._utility.reportObjUtil.ReportFormat = 'csv';
  //   this._utility.reportObjUtil.ReportParams = JSON.stringify(this._utility.rptParamValues);
  //   this._utility.reportObjUtil.TenantId = this._utility.tenantID;
  //   this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat + ' export has started');
  //   this._rptService
  //     .downloadCSV(
  //       this._utility.reportObjUtil
  //     )
  //     .subscribe(
  //       data => {
  //         const a = document.createElement("a");
  //         a.href = URL.createObjectURL(new Blob([data]));
  //         a.download = this.reportObj.ReportName + '_' + tenantName + '_' + this._utility.reportTime() + ".xlsx";
  //         document.body.appendChild(a);
  //         a.click();
  //         document.body.removeChild(a);
  //       },
  //       error => {
  //         console.log(error);
  //       }
  //     );
  // }
  downloadCSV() {
    const tenantName = this.tenantService.currentTenantValue.tenantName;
    if (this._utility.hasPreview) {
      this.reportObj = this._utility.reportObjUtil;
      this._utility.rptParamValues = this._utility.rptTempParamValues;
    } else {
      this.reportObj = this._utility.reportObjUtil;
    }
    this._utility.reportObjUtil.HasChild = this._utility.hasChild;
    this._utility.reportObjUtil.ReportFormat = 'csv'; // Changed to CSV
    this._utility.reportObjUtil.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this._utility.reportObjUtil.TenantId = this._utility.tenantID;
    this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat + ' export has started');
    this._rptService
      .downloadCSV(
        this._utility.reportObjUtil
      )
      .subscribe(
        data => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([data], { type: 'text/csv' })); // Changed type to CSV
          a.download = this.reportObj.ReportName + '_' + tenantName + '_' + this._utility.reportTime() + ".csv"; // Changed extension to CSV
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error => {
          console.log(error);
        }
      );
  }

  downloadPdf() {
    const tenantName = this.tenantService.currentTenantValue.tenantName;
    if (this._utility.hasPreview) {
      this.reportObj = this._utility.reportObjUtil;
      this._utility.rptParamValues = this._utility.rptTempParamValues;
    } else {
      this.reportObj = this._utility.reportObjUtil;
      this._utility.rptParamValues;
    }
    this._utility.reportObjUtil.HasChild = this._utility.hasChild;
    this._utility.reportObjUtil.ReportFormat = 'pdf';
    this._utility.reportObjUtil.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this._utility.reportObjUtil.TenantId = this._utility.tenantID;
    this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat + ' export has started');
    this._rptService
      .download(
        this._utility.reportObjUtil
      )
      .subscribe(
        data => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([data]));
          a.download = this.reportObj.ReportName + '_' + tenantName + '_' + this._utility.reportTime() + ".pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error => {
          console.log(error);
        }
      );
  }
  downloadExcel() {
    const tenantName = this.tenantService.currentTenantValue.tenantName;
    if (this._utility.hasPreview) {
      this.reportObj = this._utility.reportObjUtil;
      this._utility.rptParamValues = this._utility.rptTempParamValues;
    } else {
      this.reportObj = this._utility.reportObjUtil;
      this._utility.rptParamValues;
    }
    this._utility.reportObjUtil.HasChild = this._utility.hasChild;
    this._utility.reportObjUtil.ReportFormat = 'excel';
    this._utility.reportObjUtil.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this._utility.reportObjUtil.TenantId = this._utility.tenantID;
    this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat + ' export has started');
    this._rptService
      .download(
        this._utility.reportObjUtil
      )
      .subscribe(
        data => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([data]));
          a.download = this.reportObj.ReportName + '_' + tenantName + '_' + this._utility.reportTime() + ".xlsx";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error => {
          console.log(error);
        }
      );
  }
}

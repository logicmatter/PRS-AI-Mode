import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { Subject } from 'rxjs';
import { ReportingService, TenantService } from 'src/app/PmCore/services';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { CommonModel } from 'src/app/PmModel/common.model';
import { ReportObj } from 'src/app/PmModel/ReportObj';
import { Search } from 'src/app/PmModel/search.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss']
})
export class ViewReportComponent implements OnInit {

  isClicked: boolean = false;
  stateObj;
  rptParamObj;
  id;
  public commonModel: CommonModel;
  public model: Search = new Search();
  public reportObj: ReportObj = new ReportObj();
  mainWidth: boolean = false;
  ngUnsubscribe: Subject<void> = new Subject<void>();



  constructor(

    private _rptService: ReportingService,
    public activatedRoute: ActivatedRoute,
    public _utility: AppUtilService,
    public _Adhocutility: AdhocReportutilityService,
    private tenantService: TenantService,
    public coreService: CoreUtilityService,
    private router: Router,
    private location: Location
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
    this.model.objectType = 'Inventory'
    this.model.tenantId = this.commonModel.tenantId;
    this.model.userId = this.commonModel.userId;
    this.model.app = 'app'
    this.model.sidParams ='';
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
    } else {
      this._utility.createRpt = true;
    }
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
  //   this._utility.reportObjUtil.ReportFormat='csv';
  //   this._utility.reportObjUtil.ReportParams =JSON.stringify(this._utility.rptParamValues);
  //   this._utility.reportObjUtil.TenantId = this._utility.tenantID;
  //   this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat+' export has started');
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
    this._utility.reportObjUtil.ReportFormat='pdf';
    this._utility.reportObjUtil.ReportParams =JSON.stringify(this._utility.rptParamValues);
    this._utility.reportObjUtil.TenantId = this._utility.tenantID;
    this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat+' export has started');
    this._rptService
      .download(
        this._utility.reportObjUtil
      )
      .subscribe(
        data => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([data]));
          a.download = this.reportObj.ReportName +'_' + tenantName + '_' + this._utility.reportTime() + ".pdf";
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
    this._utility.reportObjUtil.ReportFormat='excel';
    this._utility.reportObjUtil.ReportParams =JSON.stringify(this._utility.rptParamValues);
    this._utility.reportObjUtil.TenantId = this._utility.tenantID;
    this._rptService.toastr.info(this._utility.reportObjUtil.ReportFormat+' export has started');
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

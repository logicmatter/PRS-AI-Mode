import { Component, OnInit, Input } from "@angular/core";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { ReportingService } from "src/app/PmCore/services";

@Component({
  selector: "app-rpt-pagination",
  templateUrl: "./rpt-pagination.component.html",
  styleUrls: ["./rpt-pagination.component.scss"]
})
export class RptPaginationComponent implements OnInit {
  @Input("appType") appType: string;
  // APPTYPE = ["alarmDashboard", "trendlogDashboard", "energylogDashboard"];
  pageInput: number;
  nextPageNo: boolean;
  previousPageNo: boolean;

  constructor(
    public _utility: AppUtilService,
    private _rptService: ReportingService
  ) {
    this.pageInput = this._utility.currentPage;
  }

  ngOnInit() {
    this.pageInput = this._utility.currentPage;
  }

  previousPage() {
    if (this._utility.currentPage < 1) {
      this._utility.currentPage = 1;
    } else {
      this._utility.currentPage = this._utility.currentPage - 1;
      this.pageInput = this._utility.currentPage;
      this.previousPageNo = true;
      this.setPageNo('');
    }
  }
  nextPage() {
    if (this._utility.currentPage > this._utility.totalNoPages) {
      this._utility.currentPage;
    } else {
      this._utility.currentPage = this._utility.currentPage + 1;
      this.pageInput = this._utility.currentPage;
      this.nextPageNo = true;
      this.setPageNo('');
    }
  }
  setPageNo(evt) {
    if (evt) {
      evt.currentTarget.blur();
    }
    let reg = new RegExp("^[0-9]+$");

    if (!reg.test(this._utility.currentPage.toString())) {
      return;
    } else if (this._utility.currentPage < 1) {
      this._utility.currentPage = 1;
      //return;
    } else if (this._utility.currentPage > this._utility.totalNoPages) {
      this._utility.currentPage = this._utility.totalNoPages;
      //return;
    }
    if (this._utility.hasPreview) {
      this._utility.reportObjUtil.Id = 0;
      this._utility.rptParamValues = {};
      this._utility.rptParamValues = this._utility.rptTempParamValues;
    }
    if (this._utility.APPTYPE.includes(this.appType)) {
      //this._utility.hasChild = true;
      // if (
      //   this.appType === "trendlogDashboard" ||
      //   this.appType === "energylogDashboard"
      // ) {
      //   this._utility.appType = this.appType;
      //   if (this._utility.hasPreview) {
      //     this._utility.hasChild = false;
      //   } else {
      //     //this._utility.reportObjUtil.RptPath = "";
      //     this._utility.hasChild = false;
      //   }
      // }
    } else {
      if (this._utility.hasPreview) {
        this._utility.reportObjUtil.Id = 0;
      } else {
        this._utility.reportObjUtil.Id = this._utility.reportID;
      }
      // this._utility.hasChild = false;
    }
    this._utility.currentPage = +this._utility.currentPage;

    this._utility.reportData = "";
    this._utility.isReportRun = true;
    this._utility.rptParamValues["Section"] = this._utility.currentPage;
    //console.log(JSON.stringify(this._utility.rptParamValues));
    //console.log("---------report obj---", this._utility.reportObjUtil);
    this._utility.showSpinner = true;
    this._utility.reportObjUtil.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this._utility.reportObjUtil.TenantId = this._utility.tenantID;
    this._utility.reportObjUtil.ReportFormat = this._utility.reportFormat;
    this._utility.reportObjUtil.HasChild = this._utility.hasChild;
    this._rptService
      .runReport(
        this._utility.reportObjUtil
      )
      .subscribe(
        data => {
          this._utility.showSpinner = false;
          this._utility.reportData = data;
          this._utility.setPage();
          this._utility.reportClick();
          this._utility.isRunFeatures = true;
        },
        error => {
          this._utility.reportData = "";
          this._utility.showSpinner = false;
          //console.log("Error :", error);
        }
      );
  }

}

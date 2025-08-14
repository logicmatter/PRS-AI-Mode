import { Injectable } from "@angular/core";
import { range, Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TenantService, ReportingService } from "../services";
import { CommonModel } from "src/app/PmModel/common.model";
import { ReportObj } from "src/app/PmModel/ReportObj";
import * as $ from "jquery";
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';

import { AppUtilService } from './app-util.service';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: "root"
})
export class ReportHelper {

  presentPageNo: number;
  reportInnerHtml: any = '<p></p>';
  haspages: boolean;
  totalPageNo: number;
  isDisable: boolean;
  isDisablefirst: boolean;
  isDisablefirstpre: boolean;
  isDisablelast: boolean;
  isDisablelastnxt: boolean;

  pageRange: any;
  testRange: any;
  hasChild: boolean;
  rptObj: any = {};
  showSpinner: boolean;
  parrentReportPath: string;
  reportsList: any;
  rptPathName: string;
  tenantId: string;
  userId: string;
  isAuthorized: any;
  helper = new JwtHelperService();
  userDetails: any;

  public reportObj: ReportObj = new ReportObj();
  rptParamValues: {};
  ngUnsubscribe: Subject<void> = new Subject<void>();
  private reportSubscription: Subscription;
  public commonDateModel: CommonDateModel;
  public commonModel: CommonModel;
  hasGrandChild: boolean;
  parentReportPath: string;
  pageNum;
  constructor(
    private http: HttpClient,
    private _route: Router,
    private tenantService: TenantService,
    private reportService: ReportingService,
    private utility: UtilityService,
    private AppUtilityService: AppUtilService,
    public _utility: AppUtilService,
    private router: Router,

  ) {
    this.commonDateModel = this.tenantService.currentDateValue;
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    this.reportService
      .getSystemActivities()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.reportsList = data[1];
      });
  }

  setPage() {
    this.presentPageNo = 1;
    var d = this.reportInnerHtml;
    var da = new DOMParser();
    var p = da.parseFromString(d, "text/html");
    this.pageNum = p.querySelector("[TITLE='page_number']");
    if (this.pageNum !== null) {
      var pages: number[] = this.pageNum.textContent.match(/\d+/g).map(Number);
      this.haspages = false;
      this.presentPageNo = pages[0];
      this.totalPageNo = pages[1];
      this.isDisable = false;
      this.isDisablefirst = false;
      this.isDisablefirstpre = false;
      this.isDisablelast = false;
      this.isDisablelastnxt = false;
      if (this.presentPageNo > 1 && this.presentPageNo <= this.totalPageNo) {
        this.isDisable = true;
        this.isDisablefirst = true;
        this.isDisablefirstpre = true;
        this.isDisablelast = true;
        this.isDisablelastnxt = true;
      }
      if (this.presentPageNo == this.totalPageNo) {
        this.isDisable = true;
        this.isDisablelast = false;
        this.isDisablelastnxt = false;
      }
      if (this.presentPageNo == 1) {
        this.isDisable = true;
        this.isDisablelast = true;
        this.isDisablelastnxt = true;
      }
      if (this.totalPageNo == 1) {
        this.isDisable = false;
        this.isDisablelast = false;
        this.isDisablelastnxt = false;
      }
      this.pageRange = range(1, this.totalPageNo);
      this.testRange = this.pageRange.subscribe(val => {
        this.pageRange = val;
      });
    } else {
      this.haspages = true;
    }
  }


  // Fetech the Main Report
  getParentReport() {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
    this.rptObj.format = this.AppUtilityService.reportFormat;
    this.showSpinner = true;
    this.reportObj.HasChild = this.hasChild;
    this.reportObj.ReportFormat = this.rptObj.format;
    this.reportObj.TenantId = this.tenantService.currentTenantValue.tenantId;
    this.reportObj.ReportParams = JSON.stringify(this.rptParamValues);
    this.reportSubscription = this.reportService
      .runReport(
        this.reportObj
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          this.reportInnerHtml = data;
          this.showSpinner = false;
          this.reportClick();
          this.setPage();
        },
        error => {
          this.showSpinner = false;
          console.log("Error :", error);
        }
      );
  }

  // Fetch Child Reports
  getChildReport() {

    const newPath1 = this.reportObj.RptPath.split("&");
    const subRpt = newPath1[0].split("%2F")[3];
    const getTent = newPath1[2].split("=");
    if (this.reportObj.RptPath.includes("Tenant-Dashboard") == true) {
      var mastertenantValue = localStorage.getItem('mastertenant');
      if (mastertenantValue == "true") {
        localStorage.setItem('mastertenant', 'false');
      }
      const newPath = this.reportObj.RptPath.split("&");
      const getTent = newPath[1].split("=");
      this.AppUtilityService.tenantId = getTent[1];
      this.commonModel = new CommonModel();

      this.tenantService.getAllTenants(this.isAuthorized.userId).subscribe((resp) => {
        if (resp) {
          if (resp.length > 0) {
            const i = resp;
            i.forEach((element) => {
              if (element["id"] == this.AppUtilityService.tenantId) {
                this._utility.tenants = resp;
                this._utility.Dtenant = element;
                this._utility.tenantId = this._utility.Dtenant;
                this.commonModel.tenantId = this._utility.Dtenant.id;
                this.commonModel.tenantName = this._utility.Dtenant.tenantName;
                this.tenantService.setData(this.commonModel);
                this.rptObj.format = this.AppUtilityService.reportFormat;
                this.reportObj.HasChild = this.hasChild;
                this.reportObj.ReportFormat = this.rptObj.format;
                this.reportObj.TenantId =
                  this.tenantService.currentTenantValue.tenantId;
                this._route.navigateByUrl("home/apps");
                this.showSpinner = false;
              } else {
                return;
              }
            });
          }
        }
      });
    }

    else if (this.reportObj.ReportName == "Home" && subRpt) {
      const newPath = this.reportObj.RptPath.split("&");
      const getTent = newPath[2].split("=");
      this.AppUtilityService.tenantId = getTent[1];
      this.commonModel = new CommonModel();
      this.tenantService.getAllTenants(this.isAuthorized.userId).subscribe((resp) => {
        if (resp) {
          if (resp.length > 0) {
            const i = resp;
            i.forEach((element) => {
              if (element["id"] == this.AppUtilityService.tenantId) {
                this._utility.tenants = resp;
                this._utility.Dtenant = element;
                this._utility.tenantId = this._utility.Dtenant;
                this.commonModel.tenantId = this._utility.Dtenant.id;
                this.commonModel.tenantName = this._utility.Dtenant.tenantName;
                this.tenantService.setData(this.commonModel);
                this.rptObj.format = this.AppUtilityService.reportFormat;
                this.reportObj.HasChild = this.hasChild;
                this.reportObj.ReportFormat = this.rptObj.format;
                this.reportObj.TenantId =
                  this.tenantService.currentTenantValue.tenantId;
                  this._route.navigate(['/tDashboard', getTent[1], subRpt]);
                // this.showSpinner = false;
              } else {
                return;
              }
            });
          }
        }
      });
      
    }

    else if (this.reportObj.RptPath.split("%2F")[5].split('&')[0] == "Data%20Collection%20Status%20ODS") {
      this.router.navigateByUrl("sysactivity/DataSources");
    }

    else if (this.reportObj.RptPath.split("%2F")[5].split('&')[0] == "Data%20Collection%20Status") {
      this.router.navigateByUrl("sysactivity/DataFlows");
    }


    this.showSpinner = true;
    this.rptObj.format = this.AppUtilityService.reportFormat;
    this.reportObj.HasChild = this.hasChild;
    this.reportObj.ReportFormat = this.rptObj.format;
    this.reportObj.TenantId = this.tenantService.currentTenantValue.tenantId;
    this.reportObj.ReportParams = JSON.stringify(this.rptParamValues);
    this._utility.dummy = true;

    this.reportSubscription = this.reportService
      .runReport(this.reportObj)

      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.reportInnerHtml = data;
        this.reportClick();
        this.showSpinner = false;
        this.setPage();
      });

  }
  reportClick() {
    this.presentPageNo = 1;
    this.totalPageNo = null;
    let self = this;
    $(document).ready(function () {
      $("#report a").bind("click", e => {
        if (e.currentTarget.href.indexOf("javascript") > -1) {
          self.reportObj.RptPath = self.parentReportPath;
          if (self.reportObj.RptPath.includes("/SLA")) {
            self.hasChild = false;
          }
          else {
            self.hasChild = true;
          }

          e.preventDefault();
          self.getParentReport();
          return;
        }
        if (e.currentTarget.href.indexOf("Data%20Collection%20Status") > -1) {
          self.hasGrandChild = true;
          self.parrentReportPath = e.currentTarget.href.split("?")[1];
        } // else { self.hasGrandChild = false;}
        var ahref = e.currentTarget.href.split("?");
        // On SSRS error - handle report URL
        if (ahref[1].indexOf("LinkId") == -1) {
          e.preventDefault();
          self.rptObj.hasChild = true;
          self.hasChild = true;
          self.hasGrandChild = true;
          self.reportObj.RptPath = ahref[1];
          let fromDate = self.utility.convert(self.commonDateModel.startDate);
          let toDate = self.utility.convert(self.commonDateModel.endDate);
          let userId = self.isAuthorized.userId
          self.rptParamValues = {
            Section: 1,
            uid: userId,
            Home: true,
            sdt: fromDate,
            edt: toDate,
          };
          // self.rptObj.rptPath =
          self.getChildReport();
        }
      });
    });
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onGoTo(pageNo) {
    this.rptObj.format = this.AppUtilityService.reportFormat;
    this.isDisable = false;
    this.presentPageNo = pageNo;
    if (this.presentPageNo > this.totalPageNo) {
      this.presentPageNo = this.totalPageNo;
    }
    if (this.presentPageNo <= 0) {
      this.presentPageNo = 1;
    }
    if (this.hasChild == true) {
      this.rptParamValues = {
        Section: this.presentPageNo
      };
      this.getChildReport();
    } else {
      let fromDate = this.utility.convert(this.commonDateModel.startDate);
      let toDate = this.utility.convert(this.commonDateModel.endDate);
      let userId = this.isAuthorized.userId
      if (this.rptObj.params !== '') {
        this.rptParamValues = {
          Section: this.presentPageNo,
          sdt: fromDate,
          edt: toDate,
          uid: userId,
          Home: true,


        };
      }
      this.getParentReport();
    }
  }

  previousPage() {
    this.isDisable = false;
    if (this.presentPageNo - 1 > 0) {
      this.presentPageNo = this.presentPageNo - 1;
      if (this.hasChild == true) {
        this.rptParamValues = {
          Section: this.presentPageNo
        };
        this.getChildReport();
      } else {
        if (this.router.url.includes("home-dashboard") || this.router.url.includes("tDashboard")) {
          let fromDate = this.utility.convert(this.commonDateModel.startDate);
          let toDate = this.utility.convert(this.commonDateModel.endDate);
          let userId = this.isAuthorized.userId
          if (this.rptObj.params !== '') {
            this.rptParamValues = {
              Section: this.presentPageNo,
              sdt: fromDate,
              edt: toDate,
              uid: userId,
              Home: true,
              tn: this._utility.tenantId.id
            };
          }
        }
        else {
          let fromDate = this.utility.convert(this.commonDateModel.startDate);
          let toDate = this.utility.convert(this.commonDateModel.endDate);
          let userId = this.isAuthorized.userId
          if (this.rptObj.params !== '') {
            this.rptParamValues = {
              Section: this.presentPageNo,
              sdt: fromDate,
              edt: toDate,
              uid: userId,
              Home: true,

            };
          }
        }
        this.getParentReport();
      }
    }
  }

  firstPage() {
    this.isDisable = false;
    this.presentPageNo = 1;
    this.presentPageNo = this.presentPageNo;
    if (this.hasChild == true) {
      this.rptParamValues = {
        Section: this.presentPageNo
      };
      this.getChildReport();
    } else {
      if (this.router.url.includes("home-dashboard") || this.router.url.includes("tDashboard")) {
        let fromDate = this.utility.convert(this.commonDateModel.startDate);
        let toDate = this.utility.convert(this.commonDateModel.endDate);
        let userId = this.isAuthorized.userId
        if (this.rptObj.params !== '') {
          this.rptParamValues = {
            Section: this.presentPageNo,
            sdt: fromDate,
            edt: toDate,
            uid: userId,
            Home: true,
            tn: this._utility.tenantId.id
          };
        }
      }
      else {
        let fromDate = this.utility.convert(this.commonDateModel.startDate);
        let toDate = this.utility.convert(this.commonDateModel.endDate);
        let userId = this.isAuthorized.userId
        if (this.rptObj.params !== '') {
          this.rptParamValues = {
            Section: this.presentPageNo,
            sdt: fromDate,
            edt: toDate,
            uid: userId,
            Home: true,

          };
        }
      }
      this.getParentReport();
    }
  }

  nextPage() {
    this.isDisable = false;
    if (
      this.totalPageNo != null &&
      this.presentPageNo + 1 <= this.totalPageNo
    ) {
      this.presentPageNo = this.presentPageNo + 1;
      if (this.hasChild == true) {
        this.rptParamValues = {
          Section: this.presentPageNo
        };
        this.getChildReport();
      } else {
        if (this.router.url.includes("home-dashboard") || this.router.url.includes("tDashboard")) {
          let fromDate = this.utility.convert(this.commonDateModel.startDate);
          let toDate = this.utility.convert(this.commonDateModel.endDate);
          let userId = this.isAuthorized.userId
          if (this.rptObj.params !== '') {
            this.rptParamValues = {
              Section: this.presentPageNo,
              sdt: fromDate,
              edt: toDate,
              uid: userId,
              Home: true,
              tn: this._utility.tenantId.id
            };
          }
        }
        else {
          let fromDate = this.utility.convert(this.commonDateModel.startDate);
          let toDate = this.utility.convert(this.commonDateModel.endDate);
          let userId = this.isAuthorized.userId
          if (this.rptObj.params !== '') {
            this.rptParamValues = {
              Section: this.presentPageNo,
              sdt: fromDate,
              edt: toDate,
              uid: userId,
              Home: true,
            };
          }
        }
        this.getParentReport();
      }
    } else if (this.totalPageNo == null) {
      this.getParentReport();
    }
  }

  lastPage() {
    this.isDisable = false;
    let lastpage = this.totalPageNo;
    this.presentPageNo = lastpage;
    if (this.hasChild == true) {
      this.rptParamValues = {
        Section: this.presentPageNo
      };
      this.getChildReport();
    } else {
      if (this.router.url.includes("home-dashboard") || this.router.url.includes("tDashboard")) {
        let fromDate = this.utility.convert(this.commonDateModel.startDate);
        let toDate = this.utility.convert(this.commonDateModel.endDate);
        let userId = this.isAuthorized.userId
        if (this.rptObj.params !== '') {
          this.rptParamValues = {
            Section: this.presentPageNo,
            sdt: fromDate,
            edt: toDate,
            uid: userId,
            Home: true,
            tn: this._utility.tenantId.id
          };
        }
      }
      else {
        let fromDate = this.utility.convert(this.commonDateModel.startDate);
        let toDate = this.utility.convert(this.commonDateModel.endDate);
        let userId = this.isAuthorized.userId
        if (this.rptObj.params !== '') {
          this.rptParamValues = {
            Section: this.presentPageNo,
            sdt: fromDate,
            edt: toDate,
            uid: userId,
            Home: true,


          };
        }
      }
      this.getParentReport();
    }
  }

  onRefresh() {
    if (this.hasChild == true) {
      this.getChildReport();
      this.hasChild = true;
    } else {
      this.getParentReport();
    }
  }

  downloadAsPdf() {
    this.rptObj.format = "PDF";
    this.reportObj.ReportParams = JSON.stringify(this.rptParamValues);
    this.reportObj.ReportFormat = 'pdf';
    this.reportObj.TenantId = this.tenantService.currentTenantValue.tenantId;
    this.reportObj.HasChild = this.hasChild;
    this.reportService.toastr.info(this.reportObj.ReportFormat + ' export has started');
    this.reportService
      .download(
        this.reportObj
      )
      .subscribe(
        data => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([data]));
          a.download = this.reportObj.ReportName + ".pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error => {
          //console.log(error);
        }
      );
  }
  downloadAsExcel() {
    this.rptObj.format = "excel";
    this.reportObj.ReportParams = JSON.stringify(this.rptParamValues);
    this.reportObj.ReportFormat = 'excel';
    this.reportObj.TenantId = this.tenantService.currentTenantValue.tenantId;
    this.reportObj.HasChild = this.hasChild;
    this.reportService.toastr.info(this.reportObj.ReportFormat + ' export has started');
    this.reportService
      .download(
        this.reportObj
      )
      .subscribe(
        data => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([data]));
          a.download = this.reportObj.ReportName + ".xlsx";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error => {
          console.log(error);
        }
      );
  }
  downloadAsCSV() {
    // this.rptObj.format = "csv";
    // this.reportService
    //   .downloadCSV(
    //     this.reportObj,
    //     this.tenantID,
    //     this.templateName
    //   )
    //   .subscribe(
    //     data => {
    //       
    //       const a = document.createElement("a");
    //       a.href = URL.createObjectURL(new Blob([data]));
    //       a.download = this.reportObj.ReportName + ".csv";
    //       document.body.appendChild(a);
    //       a.click();
    //       document.body.removeChild(a);
    //     },
    //     error => {
    //       console.log(error);
    //     }
    //   );
  }
  ngOnDestroy() {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

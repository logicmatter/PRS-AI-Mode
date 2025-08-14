import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Apps } from 'src/app/PmModel/apps.model';
import { ReportingService, TenantService, AppService } from '../services';
import { UtilityService } from '../services/utility.service';
import { AppUtilService } from './app-util.service';
@Injectable({
  providedIn: 'root'
})
export class AppSharedService {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  private CurrentAppSource: BehaviorSubject<Apps>;
  public currentApp: Observable<Apps>;
  public appModel: Apps = new Apps();
  constructor(private router: Router,
    private activatedroute: ActivatedRoute,
    public appUtility: AppUtilService,
    public mainUtility: UtilityService,
    private rptService: ReportingService,
    public tenantService: TenantService,
    public appService: AppService,
    public adhocutility: AdhocReportutilityService,
    public toastrService: ToastrService,
    public dialog: MatDialog,) {
    this.CurrentAppSource = new BehaviorSubject<Apps>(this.appModel);
    this.currentApp = this.CurrentAppSource.asObservable();
  }

  public get currentAppValue(): Apps {
    return this.CurrentAppSource.value;
  }

  setData(data: Apps) {
    this.CurrentAppSource.next(data);
  }

  setRptData() {
    this.rptService
      .getReportList(
        this.appUtility.userID,
        this.appUtility.appID,
        this.appUtility.tenantID,
        this.mainUtility.entitySelected
      ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          let reportobj;
          if(data){
            this.appUtility.reportsList = data;
            this.appUtility.rptObj = data;
            reportobj = this.appUtility.rptObj.find(
              p => p.reportId == this.appUtility.reportID
            );
            if (reportobj == undefined) {
              this.appUtility.isConfigure = false;
              this.appUtility.isReportList = true;
              this.appUtility.isCreateReport = false;
            } else if (reportobj.reportId == this.appUtility.reportID) {
              if (this.hasAction() == "run") {
                this.appUtility.toggle = false;
                this.appUtility.isClickedToggle = false;
                this.appUtility.mainWidthToggle = false;
                this.appUtility.reportData = "";
                this.appUtility.isReportRun = true;
                this.appUtility.totalNoPages = "";
                this.appUtility.currentPage = 1;
                this.appUtility.isCreateReport = true;
                this.appUtility.isReportList = false;
              } else if (this.hasAction() == "edit") {
                this.appUtility.reportData = "";
                this.appUtility.totalNoPages = "";
                this.appUtility.currentPage = 1;
                this.appUtility.isConfigure = false;
                this.appUtility.isReportList = false;
                this.appUtility.toggle = true;
                this.appUtility.isReportRun = false;
                this.appUtility.isRunFeatures = false;
                // this.appUtility.isReportRun = false;
                this.appUtility.isCreateReport = true;
              }
            } else {
              this.appUtility.isConfigure = false;
              this.appUtility.isReportList = true;
              this.appUtility.isCreateReport = false;
            }
          }
          else {
            this.appUtility.isConfigure = false;
            this.appUtility.isReportList = true;
            this.appUtility.isCreateReport = false;
          }
        },
        error => {
          console.log(error);
          this.appUtility.isConfigure = false;
          this.appUtility.isReportList = true;
          this.appUtility.isCreateReport = false;
        }
      );
  }
  hasAction() {
    let itHasAction;
    this.activatedroute.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      if (paramMap.get("action")) {
        this.appUtility.action = paramMap.get("action");
        itHasAction = paramMap.get("action");
      } else {
        itHasAction = paramMap.get("action");
      }
    });
    return itHasAction;
  }
  hasReportId() {
    let itHasReportId: boolean;
    this.activatedroute.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      if (paramMap.get("id")) {
        this.appUtility.reportID = Number(paramMap.get("id"));

        itHasReportId = true;
        this.appUtility.isConfigure = false;
        this.appUtility.isReportList = false;
        this.appUtility.isCreateReport = false;
      } else {
        itHasReportId = false;
        this.appUtility.isConfigure = false;
        this.appUtility.isReportList = true;
        this.appUtility.isCreateReport = false;
      }
    });
    return itHasReportId;
  }
  hasAppId(): boolean {
    let itHasAppId: boolean = false;
    this.appUtility.appID = this.activatedroute.snapshot.paramMap.get('appId')
    this.activatedroute.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      if (paramMap.get("appId")) {
        this.appUtility.appID = paramMap.get("appId");
        this.appService.getAppInfo(this.appUtility.appID).pipe(takeUntil(this.ngUnsubscribe)).subscribe((resp) => {
          if (resp) {
            itHasAppId = resp.isActive;
            if (!itHasAppId) {
              this.toastrService.warning('This App is not Licensed. Please contact LogicMatter Support');
              this.router.navigateByUrl("home/apps");
              return false;
            } else {
              if (this.hasReportId()) {
                this.setRptData();
              } else {
                this.appUtility.reportData = "";
                this.appUtility.isReportRun = false;
                this.appUtility.isConfigure = false;
                this.appUtility.isReportList = true;
                this.appUtility.isCreateReport = false;
                this.appUtility.isRunFeatures = false;
              }
              return true;
            }
          } else {
            this.toastrService.error('No such App found');
            this.router.navigateByUrl("home/apps");
            return false;
          }
        }, err => {
          this.toastrService.error('Error occurred to get App details');
          this.router.navigateByUrl("home/apps");
          return false;
        });
      } else {
        this.toastrService.error('App Id is not valid');
        this.router.navigateByUrl("home/apps");
        return false;
      }
    });
    return itHasAppId;
  }
  getAppID() {
    if (this.hasAppId()) {

    }
  }

}

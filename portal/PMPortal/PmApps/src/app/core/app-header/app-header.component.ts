import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { ReportingService } from 'src/app/PmCore/services';
import { AppSharedService } from 'src/app/PmCore/shared/app-shared.service';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {

  constructor(public appSharedService: AppSharedService,
    public _utility: AppUtilService,
    public dialog: MatDialog,
    public _Adhocutility: AdhocReportutilityService,
    private _rptService: ReportingService,) { }

  ngOnInit(): void {
  }
  reportList() {
    this._utility.isObjectSelection = false;
    this._utility.isConfigure = false;
    this._utility.isReportList = true;
    this._utility.isCreateReport = false;
  }
  createReport() {
    if (this._utility.licenseInfo.isLimitedEdition) {
      this._rptService.checkDeviceLimitOnInstance().subscribe(
        (isWithinDeviceLimit: boolean) => {
          let message = "";
  
          if (!isWithinDeviceLimit) {
            message = "You have reached the maximum number of devices allowed under your current license. To continue creating or editing reports, you need to update your license to allow more devices.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>";
          } 
          else 
          {
            if (this._utility.reportsList.length >= this._utility.licenseInfo.reportLimit) {
              message = "Reached the report creation limit in this Edition.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>";
            }
            else
            {
            this._utility.selectedItems = [];
            this._Adhocutility.checkedList = [];
            this._utility.isObjectSelection = false;
            this._utility.isReportRun = false;
            this._utility.isRunFeatures = false;
            this._utility.toggle = false;
            this._utility.isClickedToggle = false;
            this._utility.mainWidthToggle = false;
            this._utility.isConfigure = false;
            this._utility.isReportList = false;
            this._utility.isCreateReport = true;
            this._utility.reportData = undefined;
            this._utility.reportID = "";
          }

          }
         
  
          if (message) {
            this.dialog.open(DeleteDialog, {
              width: "390px",
              data: { id: 0, type: "", message, action: "Warning", title: "⚠️ Notice" },
            });
            return;
          }
        },
        (error) => console.error("Error checking device limit:", error)
      );
    }
    else
    {
    this._utility.selectedItems = [];
    this._Adhocutility.checkedList = [];
    this._utility.isObjectSelection = false;
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.isConfigure = false;
    this._utility.isReportList = false;
    this._utility.isCreateReport = true;
    this._utility.reportData = undefined;
    this._utility.reportID = "";
  }
  }
}

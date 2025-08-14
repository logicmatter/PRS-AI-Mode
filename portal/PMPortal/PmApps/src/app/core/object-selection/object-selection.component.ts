import { Component, OnInit } from '@angular/core';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { SearchUtilityService } from "src/app/pages/search/search-utility.service";

@Component({
  selector: 'app-object-selection',
  templateUrl: './object-selection.component.html',
  styleUrls: ['./object-selection.component.scss']
})
export class ObjectSelectionComponent implements OnInit {

  constructor( public _utility: AppUtilService,
    public utility: UtilityService,
    public searchUtility: SearchUtilityService,
    public _Adhocutility: AdhocReportutilityService) { }

  ngOnInit() {

  }
  openObjectList(){
    this._utility.isObjectSelection = !this._utility.isObjectSelection;
    this._utility.isRunFeatures = false;
    this._utility.isGrafana = false;
     this._utility.isReportRun = false;
     this._utility.hasPreview = false;
     this._utility.toggle = false;
    // this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    // this._utility.isConfigure = false;
      this._utility.isReportList = false;
     this._utility.isCreateReport = true;
     this._utility.reportData = undefined;
     this._utility.newReport = true;
     this.utility.routerValue = true;
     this._Adhocutility.saveFilter='';
  }

}

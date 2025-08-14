import { EqpLocObj } from "./../../models/EqpLocObj";
import { Facet } from "./../../models/facet";
import { Component, OnInit } from "@angular/core";
import { StandardObj } from "src/app/PmModel/StandardObj";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import {Complianceprofile} from "./../../models/complianceprofile.model"
import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { AdhocReportutilityService } from "projects/AppAdhoc/src/app/adhoc-reportutility.service";

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.scss"]
})
export class ConfigureComponent implements OnInit {


  constructor(public _util: AppUtilService,

    public _config: LookupServiceService,
    public adhocUtility: AdhocReportutilityService) { }
  facet() {
    this._util.isFacet = true;
    this._util.showFacet = false;
    this._util.isStandard = false;
    this._util.isLocation = false;
    this._util.iscompilanceprofile = false;
  }
  standard() {
    this._util.isFacet = false;
    this._util.showStandard = false;
    this._util.isStandard = true;
    this._util.isLocation = false;
    this._util.iscompilanceprofile = false;
  }
  location() {
    this._util.isFacet = false;
    this._util.showLocation = false;
    this._util.isStandard = false;
    this._util.isLocation = true;
    this._util.iscompilanceprofile = false;
  }
  compilanceprofile()
  {
    this._util.isFacet = false;
    this._util.showcompilanceprofile = false;
    this._util.isStandard = false;
    this._util.isLocation = false;
    this._util.iscompilanceprofile = true;
  }
  addFacet() {
    this._util.facetObject = new Facet();
    this._util.showFacet = true;
    this._util.showStandard = false;
    this._util.showLocation = false;
    this._util.showcompilanceprofile = false;
  }
  addStandard() {
    this._util.standardObject = new StandardObj();
    this._util.showStandard = true;
    this._util.showFacet = false;
    this._util.showLocation = false;
    this._util.showcompilanceprofile = false;
  }
  addLocation() {
    this._util.eqpLocationObject = new EqpLocObj();
    this._util.showLocation = true;
    this._util.showStandard = false;
    this._util.showFacet = false;
    this.adhocUtility.alrmcheckedList = [];
    this.adhocUtility.alrmcheckNames = [];
    this.adhocUtility.trndcheckedList = [];
    this.adhocUtility.trndcheckNames = [];
    this._config.selectedSIDsItems = [];
    this._config.alrmselectedSIDsItems = [];
    this._util.showcompilanceprofile = false;
    this._util.configedit = false;
  }

  addcompilanceprofile()
  {
    this._util.profileObject = new Complianceprofile();
    this._util.showcompilanceprofile = true;
    this._util.showLocation = false;
    this._util.showStandard = false;
    this._util.showFacet = false;
    this._util.compprofileedit = false;
  }

  ngOnInit() {

    this._util.isFacet = true;
    this._util.isStandard = false;
    this._util.isLocation = false;
    this._util.showFacet = false;
    this._util.iscompilanceprofile = false;
  }

}



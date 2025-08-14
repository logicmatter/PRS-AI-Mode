import { EnvLocObj } from "./../../models/EnvLocObj";
import { Facet } from "./../../models/facet";
import { Component, OnInit } from "@angular/core";
import {Complianceprofile} from "./../../models/complianceprofile.model"
import { StandardObj } from "src/app/PmModel/StandardObj";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.scss"]
})
export class ConfigureComponent implements OnInit {

  constructor(public _util: AppUtilService) { }
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
    this._util.locationObject = new EnvLocObj();
    this._util.showLocation = true;
    this._util.showStandard = false;
    this._util.showFacet = false;
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
    this._util.iscompilanceprofile = false;
    this._util.showFacet = false;
  }
}
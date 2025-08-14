import { Facet } from "./../../models/facet";

import { Component, OnInit } from "@angular/core";

import { Router, ActivatedRoute } from "@angular/router";

import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { StandardObj } from "src/app/PmModel/StandardObj";
import { ReportingService } from "src/app/PmCore/services";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-add-standard",
  templateUrl: "./add-standard.component.html",
  styleUrls: ["./add-standard.component.scss"]
})
export class AddStandardComponent implements OnInit {
  criteriaStandard: string;
  sid;
  standardid = "";
  eqpType = "";
  rulecode = "";
  regulation = "";
  facet = "";
  facetunit = "";
  criteria = "";
  acceptablelow;
  acceptablehigh;
  hasValid: boolean = true;
  errorMsg: string;
  criteriaErrorMsg: string;
  ngUnsubscribe: Subject<void> = new Subject<void>();

  public standardObj: StandardObj = new StandardObj();
  public facetObj: Facet = new Facet();
  isSelected = true;
  facets;
  // facetUnit;
  dropdownList = [];
  selectedItems = [];
  selectionItems = [];
  dropdownCriteriaList = [];
  selectedCriteriaItems = [];
  selectionCriteriaItems = [];
  selectedLocationsItems = [];
  dropdownSettings = {};
  dropdownCriteriaSettings = {};
  dropdownStandardIdsList = [];
  selectedStandardIdsItems = [];
  dropdownStandardIdsSettings = {};
  dropdownRegulationList = [];
  selectedRegulationItems = [];
  dropdownRegulationSettings = {};
  dropdownRoomTypeList = [];
  selectedRoomTypeItems = [];
  dropdownRoomTypeSettings = {};
  dropdownRuleCodeList = [];
  selectedRuleCodeItems = [];
  dropdownRuleCodeSettings = {};
  roomTypeIds: any;
  regulationIds: any;
  ruleCodeIds: any;
  standardIds: any;
  saveDisable: boolean;
  isValid: boolean;
  isValidValue: boolean;
  hasValid1: boolean;
  errorMsg1: string;
  count: any;
  constructor(
    private _route: Router,
    private _config: LookupServiceService,
    private route: ActivatedRoute,
    private _rptService: ReportingService,
    public _util: AppUtilService
  ) {
    this.criteriaStandard = this.selectedCriteriaItems["id"];
    if (!this._util.isEmpty(this._util.standardObject)) {
      ////console.log(this._util.facetObject);
      this.saveDisable = true;
      this._util.showStandardBack = true;
      this.sid = this._util.standardObject.SID;
      this.standardObj.AppId = this._util.standardObject.AppId;
      this.standardid = this._util.standardObject.StandardID;
      this.rulecode = this._util.standardObject.RuleCode;
      this.regulation = this._util.standardObject.Regulation;
      this.eqpType = this._util.standardObject.classType;
      this.selectedItems.push({
        id: this._util.facetObject.ID,
        itemName:
          this._util.facetObject.FacetName +
          " - " +
          this._util.facetObject.FaceUnit
      });
      this.facet = "";
      this.selectedCriteriaItems.push({
        id: this._util.standardObject.Criteria,
        itemName: this._util.standardObject.Criteria
      });
      this.selectedStandardIdsItems.push({
        id: this._util.standardObject.StandardID,
        itemName:
          this._util.standardObject.StandardID
      });
      this.selectedRoomTypeItems.push({
        id: this._util.standardObject.classTypeID,
        itemName:
          this._util.standardObject.classType
      });
      this.selectedRegulationItems.push({
        id: this._util.standardObject.SID,
        itemName:
          this._util.standardObject.Regulation
      });
      this.selectedRuleCodeItems.push({
        id: this._util.standardObject.SID,
        itemName:
          this._util.standardObject.RuleCode
      });
      this.acceptablelow = this._util.standardObject.AcceptableLow;
      this.acceptablehigh = this._util.standardObject.AcceptableHigh;
      this.criteriaStandard = this._util.standardObject.Criteria;
      // this.form.setValue({
      //   standardid: this.standardObj.StandardID,
      //   rulecode: this.standardObj.RuleCode,
      //   regulation: this.standardObj.Regulation,
      //   facet: this.standardObj.Facet.FacetName,
      //   facetunit: this.standardObj.Facet.FaceUnit,
      //   criteria: this.standardObj.Criteria,
      //   acceptablelow: this.standardObj.AcceptableLow,
      //   acceptablehigh: this.standardObj.AcceptableHigh
      // });
    } else {
      this.saveDisable = true;
      this._util.showStandardBack = false;
      this.standardid;
      this.rulecode = "";
      this.regulation = "";
      this.facet = "";
      this.facetunit = "";
      this.criteria = "";
      this.acceptablelow;
      this.acceptablehigh;
    }

  }

  ngOnInit() {
    this.disableButton();
    this.getRoomTypes();
    this.getStandardsIds();
    this.getRegulations();
    this.getRuleCode();
    this._config.getFacet("false", this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.facets = data;
      this.facets.forEach(element => {
        this.dropdownList.push({
          id: element["id"],
          itemName: element["facetName"] + " - " + element["facetUnit"]
        });
      });
    });
    this.dropdownCriteriaList = [
      { id: "IsLessThan", itemName: "IsLessThan" },
      { id: "IsLessThanEqualTo", itemName: "IsLessThanEqualTo" },
      { id: "IsGreaterThan", itemName: "IsGreaterThan" },
      { id: "IsGreaterThanEqualTo", itemName: "IsGreaterThanEqualTo" },
      { id: "IsEqualTo", itemName: "IsEqualTo" },
      { id: "IsNotEqualTo", itemName: "IsNotEqualTo" },
      { id: "IsBetween", itemName: "IsBetween" },
      { id: "IsNotInBetween", itemName: "IsNotInBetween" }
    ];
    this.dropdownSettings = {
      singleSelection: true,
      text: "Select Facet (e.g. Coolent Temperature)",
      badgeShowLimit: 1,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
    this.dropdownCriteriaSettings = {
      singleSelection: true,
      text: "Select Criteria (e.g. Greather Than)",
      badgeShowLimit: 1,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      classes: "myclass custom-class"
    };
    this.dropdownRoomTypeSettings = {
      singleSelection: true,
      text: "Select Equipment Type (e.g. Generator)",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      classes: "myclass custom-class",
      searchPlaceholderText: "Enter Text to Add New Equipment"
    };
    this.dropdownStandardIdsSettings = {
      singleSelection: true,
      text: "Select Standard (e.g. 1987-AIA)",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      classes: "myclass custom-class"
    };
    this.dropdownRegulationSettings = {
      singleSelection: true,
      text: "Select Regulation (e.g. 1987 AIA Guidelines)",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      classes: "myclass custom-class",
      searchPlaceholderText: "Enter Text to Add New Regulation"
    };
    this.dropdownRuleCodeSettings = {
      singleSelection: true,
      text: "Select RuleCode (e.g. r1-TEMP)",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      classes: "myclass custom-class"
    };
  }

  goBack() {
    this._util.showStandard = false;
    const appCrEqRoute = `home/apps/appCrEq/${this._util.appID}/${this._util.tenantID}/config`;
    this._route.navigateByUrl(appCrEqRoute);
  }
  updateStandard() {

    this._util.standardObject.StandardID = this.standardid;
    this._util.standardObject.RuleCode = this.rulecode.trim();
    this._util.standardObject.Regulation = this.regulation;
    this._util.facetObject.ID = this.selectedItems[0].id;
    this._util.standardObject.Facet = this._util.facetObject;
    this._util.standardObject.classType = this.eqpType.trim();
    if (this.selectedCriteriaItems.length == 0) {
      this._util.standardObject.Criteria = "";
    } else {
      this._util.standardObject.Criteria = this.selectedCriteriaItems[0].id;
    }
    if (this._util.standardObject.Criteria == "") {
      this.acceptablehigh = 0;
      this.acceptablelow = 0;
      this._util.standardObject.AcceptableLow = this.acceptablelow.toString().trim();
      this._util.standardObject.AcceptableHigh = this.acceptablehigh.toString().trim();
    } else if (this._util.standardObject.Criteria == "IsGreaterThan" || this._util.standardObject.Criteria == "IsGreaterThanEqualTo") {
      this.acceptablelow = 0;
      if (this.acceptablehigh.toString().trim()) {
        this._util.standardObject.AcceptableHigh = this.acceptablehigh.toString().trim();
      } else {
        this._rptService.showError('Enter value for Acceptable high');
        return;
      }
      this._util.standardObject.AcceptableLow = this.acceptablelow.toString().trim();

    } else if (this._util.standardObject.Criteria == "IsLessThan" || this._util.standardObject.Criteria == "IsLessThanEqualTo" || this._util.standardObject.Criteria == "IsLessThan" || this._util.standardObject.Criteria == "IsEqualTo" || this._util.standardObject.Criteria == "IsNotEqualTo") {
      this.acceptablehigh = 0;
      if (this.acceptablelow.toString().trim()) {
        this._util.standardObject.AcceptableLow = this.acceptablelow.toString().trim();
      } else {
        this._rptService.showError('Enter value for Acceptable low');
        return;
      }
      this._util.standardObject.AcceptableHigh = this.acceptablehigh.toString().trim();
    } else if (this._util.standardObject.Criteria == "IsBetween" || this._util.standardObject.Criteria == "IsNotInBetween") {
      if (this.acceptablelow.toString().trim() && this.acceptablehigh.toString().trim()) {
        this._util.standardObject.AcceptableLow = this.acceptablelow.toString().trim();
        this._util.standardObject.AcceptableHigh = this.acceptablehigh.toString().trim();
      } else {
        this._rptService.showError('Enter value for Acceptable low and Acceptable high');
        return;
      }
    }
    // this._util.standardObject.Criteria = this.selectedCriteriaItems[0].id;
    //this._util.standardObject.AcceptableLow = this.acceptablelow;
    //this._util.standardObject.AcceptableHigh = this.acceptablehigh;

    this._util.standardObject.AppId = this._util.appID;
    let tenantId = this._util.tenantID;
    //console.log("--------", this._util.standardObject);
    this._config
      .updateStandards(this._util.standardObject, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {

          this._util.showStandard = false;
          this._rptService.showSuccess("Updated Successfully");
          const appCrEqRoute = `home/apps/appCrEq/${this._util.appID}/${this._util.tenantID}/config`;
          this._route.navigateByUrl(appCrEqRoute);
        },
        error => {
          if (error.status == 400) {
            this._rptService.showError("Bad Input");
          } else {
            this._rptService.showError(error.error);
          }
        }
      );
  }
  onItemSelect(item: any) {
    //console.log("------------selected items-----------", this.selectedItems);
    this.selectionItems = [];
    this.selectedItems.forEach(element => {
      this.selectionItems.push(element.id);
    });
    this.rulecode = this.selectedItems.length > 0 ? this.selectedItems[0].itemName : '';
    //console.log(this.selectionItems);
    this.disableButton();
  }
  OnItemDeSelect(item: any) {

    this.selectedItems = [];
    this.disableButton();
  }
  onCriteriaItemSelect(item: any) {
    this.criteriaErrorMsg = "";
    this.acceptablehigh = "";
    this.acceptablelow = "";
    this.selectionCriteriaItems = [];
    this.selectedCriteriaItems.forEach(element => {
      this.selectionCriteriaItems.push(element.id);
    });
    this.criteriaStandard = item.id;
  }
  OnCriteriaItemDeSelect(item: any) {
    this.criteriaErrorMsg = "";
    this.acceptablehigh = "";
    this.acceptablelow = "";
    this.criteriaStandard = "";
    this.selectedCriteriaItems = [];
  }
  onRoomTypeItemSelect(item: any) {
    this.eqpType = this.selectedRoomTypeItems.length > 0 ? this.selectedRoomTypeItems[0].itemName : '';
    this.disableButton();
  }
  OnItemRoomTypeDeSelectAll(item: any) {
    this.selectedRoomTypeItems = [];
    this.eqpType = '';
    this.disableButton();
  }
  OnRoomTypeItemDeSelect(item: any) {
    this.selectedRoomTypeItems = [];
    this.eqpType = '';
    this.disableButton();
  }
  onStandardIdsItemSelect(item: any) {
    this.standardid = this.selectedStandardIdsItems.length > 0 ? this.selectedStandardIdsItems[0].itemName : '';
    this.disableButton();
  }
  OnStandardIdsItemDeSelect(item: any) {
    this.selectedStandardIdsItems = [];
    this.standardid = '';
    this.disableButton();
  }
  OnItemStandardIdsDeSelectAll(item: any) {
    this.selectedStandardIdsItems = [];
    this.standardid = '';
    this.disableButton();
  }
  onRegulationItemSelect(item: any) {

    this.regulation = this.selectedRegulationItems.length > 0 ? this.selectedRegulationItems[0].itemName : '';
    this.standardid = this.selectedRegulationItems.length > 0 ? this.selectedRegulationItems[0].itemName : '';
    this.disableButton();
  }
  OnRegulationItemDeSelect(item: any) {
    this.selectedRegulationItems = [];
    this.regulation = '';
    this.disableButton();
  }
  OnRegulationItemDeSelectDeSelectAll(item: any) {
    this.selectedRegulationItems = [];
    this.regulation = '';
    this.disableButton();
  }
  onRuleCodeItemSelect(item: any) {
    this.rulecode = this.selectedRuleCodeItems.length > 0 ? this.selectedRuleCodeItems[0].itemName : '';
    this.disableButton();
  }
  OnRuleCodeItemDeSelect(item: any) {
    this.selectedRuleCodeItems = [];
    this.rulecode = '';
    this.disableButton();
  }
  OnItemRuleCodeDeSelectAll(item: any) {
    this.selectedRuleCodeItems = [];
    this.rulecode = '';
    this.disableButton();
  }
  onAddRoomTypeItem(data: string) {
    this.selectedRoomTypeItems = [];
    this.count++;
    this.dropdownRoomTypeList.push({ "id": this.count, "itemName": data, "name": data });
    this.selectedRoomTypeItems.push({ "id": this.count, "itemName": data, "name": data });
    this.eqpType = this.selectedRoomTypeItems.length > 0 ? this.selectedRoomTypeItems[0].itemName : '';
    this.disableButton();
  }
  onAddRegulationItem(data: string) {
    this.selectedRegulationItems = [];
    this.count++;
    this.regulation = '';
    this.standardid = '';
    this.dropdownRegulationList.push({ "id": this.count, "itemName": data, "name": data });
    this.selectedRegulationItems.push({ "id": this.count, "itemName": data, "name": data });
    this.regulation = this.selectedRegulationItems.length > 0 ? this.selectedRegulationItems[0].itemName : '';
    this.standardid = this.selectedRegulationItems.length > 0 ? this.selectedRegulationItems[0].itemName : '';
    this.disableButton();
  }
  onAddStandardIdsItem(data: string) {
    this.selectedStandardIdsItems = [];
    this.count++;
    this.dropdownStandardIdsList.push({ "id": this.count, "itemName": data, "name": data });
    this.selectedStandardIdsItems.push({ "id": this.count, "itemName": data, "name": data });
    this.standardid = this.selectedStandardIdsItems.length > 0 ? this.selectedStandardIdsItems[0].itemName : '';
    this.disableButton();
  }
  onAddRuleCodeItem(data: string) {
    this.selectedRuleCodeItems = [];
    this.count++;
    this.dropdownRuleCodeList.push({ "id": this.count, "itemName": data, "name": data });
    this.selectedRuleCodeItems.push({ "id": this.count, "itemName": data, "name": data });
    this.rulecode = this.selectedRuleCodeItems.length > 0 ? this.selectedRuleCodeItems[0].itemName : '';
    this.disableButton();
  }
  getRoomTypes() {
    this.selectedRoomTypeItems = [];
    this.dropdownRoomTypeList = [];
    this._config
      .getLocation(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this.roomTypeIds = data;
          this.roomTypeIds.forEach((element, index) => {
            this.dropdownRoomTypeList.push({
              id: index + 1,
              itemName:
                element["classType"]
            });
          });
          this.dropdownRoomTypeList.forEach((ele) => {
            if (this._util.standardObject.classType == ele.itemName) {
              this.selectedRoomTypeItems.push({ id: ele.id, itemName: ele.itemName });
              return;
            }
          });

        },
        error => {
          console.log(error);
        }
      );
  }
  getStandardsIds() {
    this.selectedStandardIdsItems = [];
    this.dropdownStandardIdsList = [];
    this._config
      .getStandards(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this.standardIds = data;
          this.standardIds.forEach(element => {
            this.dropdownStandardIdsList.push({
              id: this.count + 1,
              itemName:
                element["standardId"]
            });
          });
          this.dropdownStandardIdsList.forEach(ele => {
            if (this._util.standardObject.StandardID == ele.itemName) {
              this.selectedStandardIdsItems.push({ id: ele.id, itemName: ele.itemName });
              return;
            }
          });
        },
        error => {
          console.log(error);
        }
      );
  }
  getRegulations() {
    this.selectedRegulationItems = [];
    this.dropdownRegulationList = [];
    this._config
      .getRegulations(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this.standardIds = data;
          this.standardIds.forEach((element, index) => {
            this.dropdownRegulationList.push({
              id: index + 1,
              itemName:
                element["regulation"]
            });
          });
          this.dropdownRegulationList.forEach((ele) => {
            if (this._util.standardObject.Regulation == ele.itemName) {
              this.selectedRegulationItems.push({ id: ele.id, itemName: ele.itemName });
              return;
            }
          });
          //this.selectedRegulationItems.length>0 ? this.getRegulations() : null;
        },
        error => {
          console.log(error);
        }
      );
  }
  getRuleCode() {
    this.selectedRuleCodeItems = [];
    this.dropdownRuleCodeList = [];
    this._config
      .getRuleCode(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this.standardIds = data;
          this.standardIds.forEach((element, index) => {
            this.dropdownRuleCodeList.push({
              id: index + 1,
              itemName:
                element["ruleCode"]
            });
          });
          this.dropdownRuleCodeList.forEach((ele) => {
            if (this._util.standardObject.RuleCode == ele.itemName) {
              this.selectedRuleCodeItems.push({ id: ele.id, itemName: ele.itemName });
              return;
            }
          });
          //this.selectedRuleCodeItems.length>0 ? this.getRuleCode() : null;
        },
        error => {
          console.log(error);
        }
      );
  }
  onSave() {
    this._util.initialState = true;
    this.standardObj.classType = this.eqpType.trim();
    this.standardObj.StandardID = this.standardid.trim();;
    this.standardObj.RuleCode = this.rulecode.trim();
    this.standardObj.Regulation = this.regulation;
    this.facetObj.ID = this.selectedItems[0].id;
    this.standardObj.Facet = this.facetObj;
    //this._util.locationObject.Type = this.selectedLocationsItems[0].itemName;
    //this._util.locationObject.TypeID = this.selectedLocationsItems[0].id;
    if (this.selectedCriteriaItems.length == 0) {
      this.standardObj.Criteria = "";
    } else {
      this.standardObj.Criteria = this.selectedCriteriaItems[0].id;
    }

    if (this.standardObj.Criteria == "") {
      this.acceptablehigh = 0;
      this.acceptablelow = 0;
      this.standardObj.AcceptableLow = this.acceptablelow;
      this.standardObj.AcceptableHigh = this.acceptablehigh;
    } else if (this.standardObj.Criteria == "IsGreaterThan" || this.standardObj.Criteria == "IsGreaterThanEqualTo") {
      this.acceptablelow = 0;
      if (this.acceptablehigh.toString().trim()) {
        this.standardObj.AcceptableHigh = this.acceptablehigh.toString().trim();
      } else {
        this._rptService.showError('Enter value for ' + this.standardObj.Criteria);
        return;
      }
      this.standardObj.AcceptableLow = this.acceptablelow.toString().trim();
    } else if (this.standardObj.Criteria == "IsLessThan" || this.standardObj.Criteria == "IsLessThanEqualTo" || this.standardObj.Criteria == "IsNotEqualTo" || this.standardObj.Criteria == "IsEqualTo") {
      this.acceptablehigh = 0;
      if (this.acceptablelow.toString().trim()) {
        this.standardObj.AcceptableLow = this.acceptablelow.toString().trim();
      } else {
        this._rptService.showError('Enter value for ' + this.standardObj.Criteria);
        return;
      }
      this.standardObj.AcceptableHigh = this.acceptablehigh.toString().trim();
    } else if (this.standardObj.Criteria == "IsBetween" || this.standardObj.Criteria == "IsNotInBetween") {
      if (this.acceptablelow.toString().trim() && this.acceptablehigh.toString().trim()) {
        this.standardObj.AcceptableLow = this.acceptablelow.toString().trim();
        this.standardObj.AcceptableHigh = this.acceptablehigh.toString().trim();
      } else {
        this._rptService.showError('Enter value for ' + this.standardObj.Criteria);
        return;
      }

    }
    this.standardObj.AppId = this._util.appID;
    let tenantId = this._util.tenantID;
    this._config.addStandard(this.standardObj, this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {

        this._util.showStandard = false;
        this._rptService.showSuccess("Saved Successfully");
        const appCrEqRoute = `home/apps/appCrEq/${this._util.appID}/${this._util.tenantID}/config`;
        this._route.navigateByUrl(appCrEqRoute);
      },
      error => {
        if (error.status == 400) {
          this._rptService.showError("Bad Input");
        } else if (error.error == "This record is already exists") {
          this._rptService.showError(
            "This records already exists with combination of StandardID,RuleCode and Facet"
          );
        } else {
          this._rptService.showError(error.error);
        }
      }
    );
  }
  disableButton() {
    if (this.eqpType.trim() === "") {
      this.hasValid1 = false;
      this.errorMsg1 = "Type cant be empty";
    } else {
      this.hasValid1 = true;
      this.errorMsg1 = "";
    }
    this.hasValid = this._util.validateStandardID(this.standardid);

    if (this.regulation.trim() === "") {
      this.hasValid1 = false;
      this.errorMsg1 = "Regulation cant be empty";
    } else {
      this.hasValid1 = true;
      this.errorMsg1 = "";
    }
    if (this.standardid.toString().trim() === "") {
      this.errorMsg = "";
    } else if (this.hasValid == false) {
      this.errorMsg = "Please enter valid Standard ID  (allowed special characters: !@#$%^)";
    }
    if (
      this.standardid.toString().trim() === "" ||
      this.rulecode.toString().trim() === "" ||
      this.selectedItems.length == 0 ||
      !this.hasValid ||
      !this.hasValid1 || this.eqpType == ''
    ) {
      this.saveDisable = true;
    } else {
      this.saveDisable = false;
    }
    if (this.criteriaStandard === 'IsBetween' || this.criteriaStandard === 'IsNotInBetween') {
      this.criteriaErrorMsg = this._util.validateStandardCriteria(
        this.selectedCriteriaItems[0].id,
        this.acceptablelow.toString().trim(),
        this.acceptablehigh.toString().trim()
      );
      if (this.criteriaErrorMsg != "" || !this.hasValid1 || this.standardid.toString().trim() === "" ||
        this.rulecode.toString().trim() === "" ||
        this.eqpType === "" ||
        this.selectedItems.length == 0 ||
        !this.hasValid) {
        this.saveDisable = true;
      }
      else {
        this.saveDisable = false;
      }
    }
  }
  validateAccLow() {
    let isValid = this._util.validateAcceptablLowandHigh(
      this.acceptablelow.toString().trim()
    );
    if (isValid) {
      this.criteriaErrorMsg = this._util.validateStandardCriteria(
        this.selectedCriteriaItems[0].id,
        this.acceptablelow.toString().trim(),
        this.acceptablehigh.toString().trim()
      );
      if (this.acceptablehigh.toString().trim() !== "") {
        this.disableButton();
      } else {
        this.criteriaErrorMsg = "";
      }
    } else {
      if (this.acceptablelow !== "") {
        this.criteriaErrorMsg =
          "Criteria value must be either Integer or Decimal.";
      } else {
        this.criteriaErrorMsg = "";
      }
    }
  }

  validateAccHigh() {
    let isValid = this._util.validateAcceptablLowandHigh(this.acceptablehigh);
    if (isValid) {
      this.criteriaErrorMsg = this._util.validateStandardCriteria(
        this.selectedCriteriaItems[0].id,
        this.acceptablelow,
        this.acceptablehigh
      );
      if (this.acceptablehigh.toString().trim() !== "") {
        this.disableButton();
      } else {
        this.criteriaErrorMsg = "";
      }
    } else {
      if (this.acceptablehigh !== "") {
        this.criteriaErrorMsg =
          "Criteria value must be either Integer or Decimal.";
      } else {
        this.criteriaErrorMsg = "";
      }
    }
  }
}

import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Facet } from "../../models/facet";
import { Router, ActivatedRoute } from "@angular/router";

import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { ReportingService } from "src/app/PmCore/services";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-add-facet",
  templateUrl: "./add-facet.component.html",
  styleUrls: ["./add-facet.component.scss"]
})
export class AddFacetComponent implements OnInit, OnDestroy {
  // @Input("facetInput") facetInput;
  facetName = "";
  facetUnit;
  // form = new FormGroup({
  //   facetName: new FormControl(),
  //   facetUnit: new FormControl()
  // });
  public facetObj: Facet = new Facet();
  saveDisable: boolean;
  dropdownFacetList = [];
  selectedFacetItems = [];
  dropdownFacetSettings = {};
  ngUnsubscribe: Subject<void> = new Subject<void>();
  count: any;
  facetValue: any = [];
  constructor(
    private _config: LookupServiceService,
    private route: ActivatedRoute,
    private _route: Router,
    private _rptService: ReportingService,
    public _util: AppUtilService
  ) {
    if (!this._util.isEmpty(this._util.facetObject)) {
      this._util.showFacetBack = true;
      this.facetObj.ID = this._util.facetObject.ID;
      this.facetObj.FacetName = this._util.facetObject.FacetName;
      this.facetObj.FaceUnit = this._util.facetObject.FaceUnit;
      this.facetName = this._util.facetObject.FacetName;
      this.facetUnit = this._util.facetObject.FaceUnit;
      this.selectedFacetItems.push({
        id: this._util.facetObject.ID,
        itemName:
          this._util.facetObject.FaceUnit
      });
      // this.form.setValue({
      //   facetName: this.facetObj.FacetName,
      //   facetUnit: this.facetObj.FaceUnit
      // });
    } else {
      this._util.showFacetBack = false;
      this.facetName = "";
      this.facetUnit = "";
      // this.form.setValue({
      //   facetName: "",
      //   facetUnit: ""
      // });
      // if (this.facetName === "" || this.facetUnit === "") {
      //   this.saveDisable = true;
      //   return;
      // }
    }

    // this.route.queryParams.subscribe(params => {
    //   if (!this._util.isEmpty(params)) {
    //     this.facetObj.ID = params["id"];
    //     this.facetObj.FacetName = params["facetName"];
    //     this.facetObj.FaceUnit = params["facetUnit"];
    //     this.form.setValue({
    //       facetName: this.facetObj.FacetName,
    //       facetUnit: this.facetObj.FaceUnit
    //     });
    //   }
    // });
  }

  ngOnInit() {
    this.getBackNetUnits();
    this.dropdownFacetSettings = {
      singleSelection: true,
      text: "Select Facet",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,

      classes: "myclass custom-class"
    };
    this.disableButton();
    // if (this.facetName === "" || this.facetUnit === "") {
    //   this.saveDisable = true;
    //   return;
    // }

  }
  getBackNetUnits() {
    this.dropdownFacetList = [];
    this._config.getBackNetUnits(this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        this.facetValue = data;
        this.facetValue.forEach((element, index) => {
          this.dropdownFacetList.push({
            id: index + 1,
            itemName:
              element["category"] +
              ":" +
              element["engineeringUnit"] +
              " (" +
              element["id"] + ")" +
              ":" +
              element["symbol"]
          });
        });
        this.dropdownFacetList.forEach((ele) => {
          if (this.selectedFacetItems == ele.itemName) {
            this.selectedFacetItems.push({ id: ele.id, itemName: ele.itemName });
            return;
          }
        });
        // this.selectedFacetItems.length > 0 ? this.getBackNetUnits() : null;
      },
      error => {
        console.log(error);
        //sthis._util.showFacet = true;
        //this._route.navigateByUrl("appCrEnv/" + this._util.appID);
      }
    );
  }
  onSubmit() {
    this.facetObj.FacetName = this.facetName;
    this.facetObj.FaceUnit = this.facetUnit;
    this._config.createFacet(this.facetObj, this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        //this._util.showFacet = false;
        //this._route.navigateByUrl("appCrEnv/" + this._util.appID);
      },
      error => {
        console.log(error);
        //sthis._util.showFacet = true;
        //this._route.navigateByUrl("appCrEnv/" + this._util.appID);
      }
    );
  }
  onFacetItemSelect(item: any) {
    this.facetUnit = this.selectedFacetItems.length > 0 ? this.selectedFacetItems[0].itemName : '';
    this.disableButton();
  }
  OnFacetItemDeSelect(item: any) {
    //this.rulecode = this.selectedRuleCodeItems.length > 0 ? this.selectedRuleCodeItems[0].itemName : '';
    this.disableButton();
  }
  OnItemFacetDeSelectAll(item: any) {
    this.facetUnit = '';
    //this.rulecode = '';
    this.disableButton();
  }

  onAddFacetItem(data: string) {
    this.selectedFacetItems = [];
    this.count++;
    this.dropdownFacetList.push({ "id": this.count, "itemName": data, "name": data });
    this.selectedFacetItems.push({ "id": this.count, "itemName": data, "name": data });
    //this.eqpType = this.selectedRoomTypeItems.length > 0 ? this.selectedRoomTypeItems[0].itemName : '';
    this.disableButton();
  }
  resetForm() {
    this.facetName = "";
    this.facetUnit = "";
    // this.form.setValue({
    //   facetName: "",
    //   facetUnit: ""
    // });
    this._util.showFacet = true;
  }
  goBack() {
    this._util.showFacet = false;
    const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
    this._route.navigateByUrl(appCrEnvRoute);
  }
  updateFacet() {
    if (!this._util.isEmpty(this._util.facetObject)) {
      this.facetUnit = this.selectedFacetItems[0].itemName;
      this._util.facetObject.ID;
      this._util.facetObject.FacetName = this.facetName;
      this._util.facetObject.FaceUnit = this.facetUnit;
      this._config
        .updateFacet(this._util.facetObject, this._util.tenantID)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          data => {

            this._util.showFacet = false;
            this._rptService.showSuccess("Updated Successfully");
            const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
            this._route.navigateByUrl(appCrEnvRoute);
          },
          error => {
            console.log(error);
            //this._util.showFacet = false;
            this._rptService.showError("Error :" + error.error);
            //this._route.navigateByUrl("appCrEnv/" + this._util.appID);
          }
        );
    } else {
    }
  }
  onSave() {
    this.facetObj.FacetName = this.facetName;
    this.facetObj.FaceUnit = this.facetUnit;
    this._config.createFacet(this.facetObj, this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        this._util.showFacet = false;
        this._rptService.showSuccess("Saved Successfully");
        const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
        this._route.navigateByUrl(appCrEnvRoute);
      },
      error => {
        console.log(error);
        // errorMsg=""
        // this._util.showFacet = false;
        this._rptService.showError(error.error);
        //this._route.navigateByUrl("appCrEnv/" + this._util.appID);
      }
    );
  }

  disableButton() {
    if (this.facetName.toString().trim() === "" || this.facetUnit.toString().trim() === "") {
      this.saveDisable = true;
    } else {
      this.saveDisable = false;
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { Facet } from "./../../models/facet";
import { StandardObj } from "./../../models/StandardObj";
import { Router, NavigationExtras } from "@angular/router";

import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";

import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { ReportingService } from "src/app/PmCore/services";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-crenv-standard",
  templateUrl: "./crenv-standard.component.html",
  styleUrls: ["./crenv-standard.component.scss"]
})
export class CrenvStandardComponent implements OnInit, OnDestroy {
  // MatPaginator Inputs
  length: number;
  pageSize = 10;
  currentPageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  // MatPaginator Output
  displayedColumns = ['classType', 'regulation', 'facetName', 'facetUnit', 'criteria', 'actions'];
  pageEvent: PageEvent;
  startingIndex: number;
  endingIndex: any;
  appID = 1;
  tHeader;
  tHeaderObj = [];
  stdObjs = new MatTableDataSource();
  fctObjs;
  standardCount: number;
  public standardObj: StandardObj = new StandardObj();
  public facetObj: Facet = new Facet();
  distinctLocationObj: any;
  selectedLocation = 'all';
  filterValue: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  message: string;
  showSpinner: boolean;
  config: { currentPage: number; itemsPerPage: number };
  tests: any[];
  count: any;
  p: number;
  collectionSize: any;
  selectedItems = {};
  @ViewChild('crenvStdPaginator', { static: false }) crenvStdPaginator: MatPaginator;
  @ViewChild('crenvStdSort', { static: false }) crenvStdSort: MatSort;
  constructor(
    private _config: LookupServiceService,
    private _route: Router,
    private _rptService: ReportingService,
    private _utility: AppUtilService,
    public dialog: MatDialog,
    public _core: CoreUtilityService
  ) {
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
    this._core.filter = "";
    this._core.reverse = true;
    this._core.key = "";
    this.selectItem(this._core.maxRecords, 1);
    this.isSelectedItem(this._core.maxRecords, 1);
    this.getDistinctLocationList();
  }
  selectItem(item, id) {
    this.config.itemsPerPage = item;
    this.selectedItems[id] = item;
    // console.log(item);
    this.showSpinner = true;
    this._core.maxRecords = item;
    this.showSpinner = false;
  }
  isSelectedItem(item, id) {
    return this.selectedItems[id] && this.selectedItems[id] === item;
  }
  compare(a, b) {
    if (a.standardID < b.standardID) {
      return -1;
    }
    if (a.standardID > b.standardID) {
      return 1;
    }
    return 0;
  }

  getData(obj) {
    if (localStorage.getItem('ItemPerPage') !== null) {
      if (parseInt(localStorage.getItem('ItemPerPage')) == obj.pageSize) {
        this.currentPageSize = +localStorage.getItem('ItemPerPage');
      }
      else {
        localStorage.setItem('ItemPerPage', obj.pageSize.toString());
        this.currentPageSize = obj.pageSize;
      }
    }
    else {
      localStorage.setItem('ItemPerPage', obj.pageSize.toString());
      this.currentPageSize = obj.pageSize;
    }
    let index = 0
    this.startingIndex = obj.pageIndex * obj.pageSize,
      this.endingIndex = this.startingIndex + obj.pageSize;

  }
  getStandards() {
    this.showSpinner = true;
    let tenantId = "1";
    this._config
      .getStandardsList(this._utility.appID, this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          setTimeout(() => {
            this.filterValue = data;
            this.stdObjs.data = this.filterValue;
            this.length = this.stdObjs.data.length;
            this.stdObjs.paginator = this.crenvStdPaginator;
            this.stdObjs.sort = this.crenvStdSort;
            this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
          });
          // this.stdObjs= data;
          /*  if(this.stdObjs.length > 0){
               this.filterValue = this.stdObjs;
               if (!this._utility.initialState) {
                 this.stdObjs.sort(this.compare);
               }
               this._utility.initialState = false;
   
               this.tHeader = Object.keys(this.stdObjs[0]);
               this.tHeader.forEach(element => {
                 if (this._config.standardCols.includes(element)) {
                   this.tHeaderObj.push(element);
                 }
               });
             }
             else{
               this.message = "No Standards Configured";
             } */

          /*    if(this.filterValue){
                this.count = this.filterValue.length;
                this.length = this.filterValue.length;
            this.getData({pageIndex: this.page, pageSize: this.size});
                this.p = 1;
                this.collectionSize = this.filterValue.length;
    
                if (this.count >= '100') {
                  this.tests = [
                    {
                      id: 1,
                      items: ['10', '25', '50', '100']
                    }
                  ];
                } else if (this.count >= '50') {
                  this.tests = [
                    {
                      id: 1,
                      items: ['10', '25', '50', '100']
                    }
                  ];
                } else if (this.count >= '25') {
                  this.tests = [
                    {
                      id: 1,
                      items: ['10', '25', '50', '100']
                    }
                  ];
                } else if (this.count >= '10') {
                  this.tests = [
                    {
                      id: 1,
                      items: ['10', '25', '50', '100']
                    }
                  ];
                }
              }   */

          this.showSpinner = false;
        },

        error => {
          console.log(error);
        }

      );
  }
  editStandard(obj) {
    ////console.log(obj);
    this._utility.showStandard = true;
    this._utility.standardObject.SID = obj["sid"];
    this._utility.standardObject.classType = obj["classType"];
    this._utility.standardObject.StandardID = obj["standardID"];
    this._utility.standardObject.RuleCode = obj["ruleCode"];
    this._utility.standardObject.Regulation = obj["regulation"];
    this._utility.facetObject.ID = obj["id"];
    this._utility.facetObject.FacetName = obj["facetName"];
    this._utility.facetObject.FaceUnit = obj["facetUnit"];
    this._utility.standardObject.Facet = this._utility.facetObject;
    this._utility.standardObject.Criteria = obj["criteria"];
    this._utility.standardObject.AcceptableLow = obj["acceptableLow"];
    this._utility.standardObject.AcceptableHigh = obj["acceptableHigh"];
    this._utility.standardObject.AppId = this._utility.appID;

    // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     sid: obj["sid"],
    //     standardID: obj["standardID"],
    //     RuleCode: obj["ruleCode"],
    //     Regulation: obj["regulation"],
    //     FacetUnit: obj["facetUnit"],
    //     Facet: obj["facet"],
    //     Criteria: obj["criteria"],
    //     AcceptableLow: obj["acceptableLow"],
    //     AcceptableHigh: obj["acceptableHigh"]
    //   }
    // };
    // this._route.navigate(["appCrEnv/config/addStandard"], navigationExtras);
  }
  deleteStandard(obj) {
    //////console.log(obj);
    ////console.log(obj);
    this._config.deleteStandard(obj["sid"], this._utility.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        this._rptService.showSuccess("Deleted Successfully");
        this.getStandards();
        // //this._route.navigateByUrl("appCrEnv/config");
        // this._utility.showLocation = false;
        //this.locObjs.splice(obj["id"], 1);
      },
      error => {
        this._rptService.showError("Error :" + error.error);
        this.getStandards();
        console.log(error);
      }
    );
  }
  deleteAssociatedStandard(obj) {
    //////console.log(obj);
    ////console.log(obj);
    this._config
      .deleteAssociatedStandard(obj["sid"], this._utility.tenantID, "appcrenv")
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this.getStandards();
          // //this._route.navigateByUrl("appCrEnv/config");
          // this._utility.showLocation = false;
          //this.locObjs.splice(obj["id"], 1);
        },
        error => {
          this.getStandards();
          console.log(error);
        }
      );
  }
  ngOnInit() {
    if (localStorage.getItem('ItemPerPage') !== null) {
      this.currentPageSize = +localStorage.getItem('ItemPerPage');
      this.size = +localStorage.getItem('ItemPerPage');
    }
    else {
      this.currentPageSize = 10;
      this.size = 10;
    }
    this.stdObjs = new MatTableDataSource();
    this.getStandards();
  }
  getStandardCount(obj) {
    this._config
      .getStandardCount(obj["sid"], this._utility.tenantID, "appcrenv")
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {

          this.standardCount = data[0].count;
          this.openDialog(obj, this.standardCount);
        },
        error => {
          console.log(error);
        }
      );
  }
  openDialog(obj, count: number): void {
    let msg;
    if (count != 0) {
      msg =
        "This Standard is associated with " +
        count +
        " Locations. \n Are you sure, still you want to delete this Standard?";
    } else {
      msg = "Are you sure, you want to delete this Standard?";
    }
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: count, type: "", message: msg, action: 'Delete', title: 'Confirmation' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        if (this.standardCount == 0) {
          //count = this.standardCount;
          this.deleteStandard(obj);
        } else {
          this.deleteAssociatedStandard(obj);
          //count = this.standardCount;
        }
        // this.deleteStandard(obj);
        ////console.log(result, "The dialog was closed");
      } else {
        ////console.log(result, "The dialog was closed");
      }
      //this.deleteReport(id);
      //////console.log(result, "The dialog was closed");
      //this.animal = result;
    });
  }
  getDistinctLocationList() {
    this._config
      .getCriticalRegularionList("true", this._utility.tenantID, this._utility.appID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          //return data;
          this.distinctLocationObj = data;
        },
        error => {
          //console.log(error);
          //return 'null';
        }
      );
  }

  onChangeLocation() {
    if (this.selectedLocation === "all") {
      this.getStandards();
    } else {
      this._config
        .getOnlyFilterStandards(
          this._utility.appID,
          this._utility.tenantID,
          this.selectedLocation
        ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          data => {
            this.filterValue = data;
            this.stdObjs.data = this.filterValue;
          },
          error => { }
        );
    }
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.stdObjs.filter = filterValue;
  }
  filterByText(initial: string) {
    if (initial === "") {
      this.filterValue = this.stdObjs;
    } else {
      if (this.filterValue == undefined) {
        this.filterValue = this.stdObjs;
      }
    }
    this.filterValue = this.stdObjs;
    this.filterValue = this.filterValue.filter(
      i =>
        i.standardID.toString().toLowerCase().indexOf(initial.toLocaleLowerCase()) !==
        -1 ||
        i.ruleCode.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        || i.regulation.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        || i.facetName.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        || i.facetUnit.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        || i.classType.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
      // || i.criteria.toString()
      //   .toLowerCase()
      //   .indexOf(initial.toLocaleLowerCase()) !== -1
      // || i.acceptableLow
      //   .toLowerCase()
      //   .indexOf(initial.toLocaleLowerCase()) !== -1
      // || i.acceptableHigh
      //   .toLowerCase()
      //   .indexOf(initial.toLocaleLowerCase()) !== -1
    );
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

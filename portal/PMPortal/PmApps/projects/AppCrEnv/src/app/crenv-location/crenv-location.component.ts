import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";

import { Router, NavigationExtras } from "@angular/router";
import { EnvLocObj } from "../../models/EnvLocObj";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ReportingService } from "src/app/PmCore/services";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { Observer } from 'rxjs';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RowSpanComputer, Span } from "./row-span-computer";

@Component({
  selector: "app-crenv-location",
  templateUrl: "./crenv-location.component.html",
  styleUrls: ["./crenv-location.component.scss"]
})
export class CrenvLocationComponent implements OnInit, OnDestroy {
  // MatPaginator Inputs
  length;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  currentPageSize = 10;
  // MatPaginator Output
  displayedColumns = ['roomName', 'location', 'roomType', 'pointType', 'trend', 'actions'];
  pageEvent: PageEvent;
  startingIndex: number;
  endingIndex: any;
  appID = 1;
  stdObjs;
  tHeader;
  tHeaderObj = [];
  locObjs = new MatTableDataSource();
  @ViewChild('crenvlocPaginator', { static: false }) crenvlocPaginator: MatPaginator;
  @ViewChild('crenvlocSort', { static: false }) crenvlocSort: MatSort;
  searchRpt: string = "";
  public locationObj: EnvLocObj = new EnvLocObj();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  filterValue: any;
  showSpinner: boolean;
  config: { currentPage: number; itemsPerPage: number };
  tests: any[];
  count: any;
  p: number;
  collectionSize: any;
  selectedItems = {};
  locationsList: any = [];
  spans = [];
  rowSpans: Array<Span[]>;
  private rowSpanComputer = new RowSpanComputer();
  distinctLocationObj: any;
  constructor(
    private _config: LookupServiceService,
    private _route: Router,
    private _rptService: ReportingService,
    public _utility: AppUtilService,
    public dialog: MatDialog,
    public _core: CoreUtilityService
  ) {
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
    this.getLocations();
    this._core.filter = "";
    this._core.reverse = true;
    this._core.key = "";
    this.selectItem(this._core.maxRecords, 1);
    this.isSelectedItem(this._core.maxRecords, 1);

  }

  cacheSpan(key, accessor) {
    for (let i = 0; i < this.locObjs.data.length;) {
      let currentValue = accessor(this.locObjs.data[i]);
      let count = 1;

      // Iterate through the remaining rows to see how many match
      // the current value as retrieved through the accessor.
      for (let j = i + 1; j < this.locObjs.data.length; j++) {
        if (currentValue != accessor(this.locObjs.data[j])) {
          break;
        }

        count++;
      }

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // Store the number of similar values that were found (the span)
      // and skip i to the next unique row.
      this.spans[i][key] = count;
      i += count;
    }
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
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
    if (a.location < b.location) {
      return -1;
    }
    if (a.location > b.location) {
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
  getLocations() {
    this.showSpinner = true;
    this.spans = [];
    this._config
      .getCriticalRoomsList("false", this._utility.tenantID, this._utility.appID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          setTimeout(() => {
            this.filterValue = data;
            data.table1.forEach(dtLoc => {
              dtLoc.trend = [];
              data.table.forEach(dtTrend => {
                if (dtLoc.locRoom.toString()
                  .toLowerCase() == dtTrend.locRoom.toString()
                    .toLowerCase() && dtLoc.location.toString()
                      .toLowerCase() == dtTrend.location.toString()
                        .toLowerCase()) {
                  if (dtTrend.classType != null) {
                    dtLoc.roomType = dtTrend.classType;
                  }

                  dtLoc.site = dtTrend.site;
                  dtLoc.trend.push(dtTrend);
                  // const tempObj = {
                  //   roomName: dtLoc.roomName,
                  //   location: dtLoc.location,
                  //   roomType: dtTrend.classType,
                  //   trend: [dtTrend]
                  // }
                  //this.locationsList.push(tempObj);
                  //return;
                }
              });
            });
            this.locObjs.data = data.table1;
            this.locationsList = data.table1;
            this.locObjs.data = this.locationsList.reduce((current, next) => {
              next.trend.forEach(b => {
                current.push({ id: b.id, pointType: b.pointType, roomID: b.roomID, roomName: next.roomName, site: next.site, location: next.location, roomType: next.roomType, trend: b.logDescription })
              });
              return current;
            }, []);
            //this.computeRowSpans();
            console.log(this.locObjs.data);
            this.cacheSpan('Room Name', d => d.roomName);
            this.cacheSpan('Location', d => d.location);
            console.log(this.spans);

            this.length = this.locObjs.data.length;
            this.locObjs.paginator = this.crenvlocPaginator;
            this.locObjs.sort = this.crenvlocSort;
            this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });

          });

          /*    this.locObjs = data;
              if(this.locObjs.length > 0) {
                if (!this._utility.initialState) {
                  this.locObjs.sort(this.compare);
                }
                this.filterValue = this.locObjs;
                this._utility.initialState = false;
                this.tHeader = Object.keys(this.locObjs[0]);
                this.tHeader.forEach(element => {
                  if (this._config.locationCols.includes(element)) {
                    this.tHeaderObj.push(element);
                  }
                });
              } */

          this.showSpinner = false;
        },
        error => {
          console.log(error);
        }
      );
  }
  private computeRowSpans(): void {
    this.rowSpans = this.rowSpanComputer.compute(this.locObjs.data, this.displayedColumns);
  }
  editLocation(obj) {
    this._utility.showLocation = true;
    this._utility.locationObject.ID = obj["id"];
    this._utility.locationObject.roomID = obj["roomID"]
    this._utility.locationObject.Location = obj["location"];
    this._utility.locationObject.PointType = obj["pointType"];
    this._utility.locationObject.Site = obj["site"];
    this._utility.locationObject.PointSID = obj["pointSID"];
    this._utility.locLogDevNum = obj["logDevNum"];
    this._utility.locObjName = obj["objName"];
    this._utility.locLogDescription = obj["logDescription"];
    this._utility.locationObject.StandardSID = obj["standardSID"];
    this._utility.locStandardID = obj["standardID"];
    this._utility.locRuleCode = obj["ruleCode"];
    this._utility.locRegulation = obj["regulation"];
    this._utility.locFacet = obj["facet"];
    this._utility.locfacetUnit = obj["facetUnit"];
    this._utility.locationObject.classType = obj["roomType"];
    this._utility.locationObject.roomName = obj["roomName"];
    this._utility.configedit = true;
    this._utility.itemcrenvedit = true;

    // Synchronous call
    this._config.getEditEnvironmentRegulation(this._utility.appID,this._utility.tenantID,obj["roomName"],obj["id"]).subscribe((data: any) => {
      console.log('Regulations:', data);
      this._utility.distinctLocationObj = data;
  }, error => {
      console.error('Error retrieving regulation data:', error);
  });
      // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     site: obj["site"],
    //     location: obj["location"],
    //     pointType: obj["pointType"],
    //     pointSID: obj["pointSID"],
    //     standardSID: obj["standardSID"]
    //   }
    // };
    // this._route.navigate(["appCrEnv/config/addLocation"], navigationExtras);
  }

  loadRegulations(obj) {
    this._config.getEditEnvironmentRegulation(this._utility.appID, this._utility.tenantID, obj["roomName"],obj["id"]).subscribe(
      (data: any) => {
        console.log('Regulations:', data);
        if (Array.isArray(data)) {
          const valueToMatch = data[0];
          const selectedIndex = this.distinctLocationObj.indexOf(valueToMatch);
          if (selectedIndex !== -1) {
            this.distinctLocationObj.splice(selectedIndex, 1);
            this.distinctLocationObj.unshift(valueToMatch);
          }
        } else {
          console.error('Invalid data received.');
        }
      },
      error => {
        console.error('Error retrieving regulation data:', error);
      }
    );

    this._config.getDistinctRegulations(this._utility.appID, this._utility.tenantID,  obj["roomType"]).subscribe(
      (data: any) => {
        console.log('Regulations:', data);
        // Assuming data is an array of strings
        this.distinctLocationObj = data;
      },
      error => {
        console.error('Error retrieving regulation data:', error);
      }
    );
  }
  deleteLocation(obj) {
    //console.log(obj);
    this._config
      .deleteCriticalEnvLocation(obj["roomName"], obj["location"], this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this._rptService.showSuccess("Deleted Successfully");
          this.getLocations();
          // //this._route.navigateByUrl("appCrEnv/config");
          // this._utility.showLocation = false;
          //this.locObjs.splice(obj["id"], 1);
        },
        error => {
          this._rptService.showError("Error :" + error.error);
          this.getLocations();
          //console.log(error);
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
  }
  getStandards() {
    let tenantId = "1";
    this._config.getStandardsList(this.appID, this._utility.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        this.stdObjs = data;
      },
      error => {
        console.log(error);
      }
    );
  }
  openDialog(obj): void {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: "", message: "Are you sure, you want to delete this location?", action: 'Delete', title: 'Confirmation' }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result == true) {
        this.deleteLocation(obj);
      }
      //this.deleteReport(id);
      //this.animal = result;
    });
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.locObjs.filter = filterValue;
  }
  filterByText(initial: string) {
    if (initial === "") {
      this.filterValue = this.locObjs;
    } else {
      if (this.filterValue == undefined) {
        this.filterValue = this.locObjs;
      }
    }
    this.filterValue = this.locObjs;
    this.filterValue = this.filterValue.filter(
      i =>
        i.site.toString().toLowerCase().indexOf(initial.toLocaleLowerCase()) !==
        -1 ||
        i.location.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        ||
        i.pointType.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        ||
        i.logDescription.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        ||
        i.facet.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        ||
        i.facetUnit.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        ||
        i.regulation.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        ||
        i.standardID.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        || i.roomName.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
        || i.classType.toString()
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1

    );
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

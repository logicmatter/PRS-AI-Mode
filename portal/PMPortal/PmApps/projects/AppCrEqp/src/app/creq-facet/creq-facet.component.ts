import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Facet } from "../../models/facet";

import { Router, NavigationExtras } from "@angular/router";
import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: "app-creq-facet",
  templateUrl: "./creq-facet.component.html",
  styleUrls: ["./creq-facet.component.scss"]
})
export class CreqFacetComponent implements OnInit, OnDestroy {
  // MatPaginator Inputs
  length;
  pageSize = 10;
  currentPageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  // MatPaginator Output
  displayedColumns = ['facetName', 'facetUnit', 'actions'];
  facetObjs = new MatTableDataSource();
  pageEvent: PageEvent;
  startingIndex: number;
  endingIndex: any;
  appID = this._utility.appID;
  tHeader;
  tHeaderObj = [];

  public facetObj: Facet = new Facet();
  filterValue: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  showSpinner: boolean;
  config: { currentPage: number; itemsPerPage: number };
  tests: any[];
  count: any;
  p: number;
  collectionSize: any;
  selectedItems = {};
  @ViewChild(MatPaginator, { static: false }) facetPaginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) facetSort: MatSort;
  constructor(
    private _config: LookupServiceService,
    private _route: Router,
    private _utility: AppUtilService,
    public _core: CoreUtilityService
  ) {
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
    this._core.filter = "";
    this._core.key = "";
    this._core.reverse = true;
    this.selectItem(this._core.maxRecords, 1);
    this.isSelectedItem(this._core.maxRecords, 1);
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
  getFacets() {
    this.showSpinner = true;
    this._config.getFacet("false", this._utility.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        setTimeout(() => {
          this.filterValue = data;
          this.facetObjs.data = this.filterValue;
          //this.reportsList.data.forEach(s => (s["checked"] = false));
          this.length = this.facetObjs.data.length;
          this.facetObjs.paginator = this.facetPaginator;
          this.facetObjs.sort = this.facetSort;
          this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
        });
        ////console.log(this.facetObjs);
        if (this.filterValue) {
          this.count = this.filterValue.length;
          this.length = this.filterValue.length;
          this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
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
        }
        this.showSpinner = false;
      },
      error => {
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
    this.getFacets();
  }
  editFacet(obj) {
    //console.log(obj);

    this._utility.facetObject.ID = obj["id"];
    this._utility.facetObject.FacetName = obj["facetName"];
    this._utility.facetObject.FaceUnit = obj["facetUnit"];
    this._utility.showFacet = true;

    // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     id: obj["id"],
    //     facetName: obj["facetName"],
    //     facetUnit: obj["facetUnit"]
    //   }
    // };
    // this._route.navigate(["appCrEnv/config/addFacet"], navigationExtras);
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.facetObjs.filter = filterValue;
  }
  filterByText(initial: string) {
    if (initial === "") {
      this.filterValue = this.facetObjs;
    } else {
      if (this.filterValue == undefined) {
        this.filterValue = this.facetObjs;
      }
    }
    this.filterValue = this.facetObjs;
    this.filterValue = this.filterValue.filter(
      i =>
        i.facetName.toLowerCase().indexOf(initial.toLocaleLowerCase()) !==
        -1 ||
        i.facetUnit
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
    );
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

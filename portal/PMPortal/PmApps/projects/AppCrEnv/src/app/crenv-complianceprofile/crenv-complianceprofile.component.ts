import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import {Complianceprofile} from "../../models/complianceprofile.model";

import { Router, NavigationExtras } from "@angular/router";
import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { AppUtilService, DeleteDialog } from "src/app/PmCore/shared/app-util.service";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { ReportingService } from "src/app/PmCore/services";

@Component({
  selector: 'app-crenv-complianceprofile',
  templateUrl: './crenv-complianceprofile.component.html',
  styleUrls: ['./crenv-complianceprofile.component.scss']
})
export class CrenvComplianceprofileComponent implements OnInit {

 // MatPaginator Inputs
 length;
 pageSize = 10;
 currentPageSize = 10;
 pageSizeOptions: number[] = [10, 25, 50, 100];
 page = 0;
 size = 10;
 // MatPaginator Output
 displayedColumns = ['profile', 'standardName', 'ruleCode','criteria','acceptableHigh','acceptableLow' ,'actions'];
 pageEvent: PageEvent;
 startingIndex: number;
 endingIndex: any;
 appID = 1;
 tHeader;
 spans = [];
 tHeaderObj = [];
 profileObjs = new MatTableDataSource();
 searchRpt: string = "";
 filterValue: any;
 ngUnsubscribe: Subject<void> = new Subject<void>();
 public profileObj: Complianceprofile = new Complianceprofile();
 showSpinner: boolean;
 config: { currentPage: number; itemsPerPage: number };
 tests: any[];
 count: any;
 p: number;
 collectionSize: any;
 distinctprofileObj: any;
 selectedItems = {};
 @ViewChild(MatPaginator, { static: false }) profilePaginator: MatPaginator;
 @ViewChild(MatSort, { static: false }) profileSort: MatSort;
 constructor(
   private _config: LookupServiceService,
   private _route: Router,
   private _utility: AppUtilService,
   public _core: CoreUtilityService,
   public dialog: MatDialog, private _rptService: ReportingService,

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
 getprofile() {
   this.showSpinner = true;
   this.spans = [];
   this._config.getAllProfileList(this._utility.appID, this._utility.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
     data => {
       setTimeout(() => {
         this.filterValue = data;
        //  this.profileObjs.data = this.filterValue;

         this.profileObjs.data = this.filterValue.sort((a, b) => a.profile.localeCompare(b.profile));
         //this.reportsList.data.forEach(s => (s["checked"] = false));
         this.cacheSpan('Profile' ,d=> d.profile)
         this.length = this.profileObjs.data.length;
         this.profileObjs.paginator = this.profilePaginator;
         this.profileObjs.sort = this.profileSort;
         this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
       });
       if (this.filterValue) {
         this.count = this.filterValue.length;
         this.length = this.filterValue.length;
         this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
         this.p = 1;
         this.collectionSize = this.filterValue.length;
       }
       this.showSpinner = false;
     },
     error => {
       console.log(error);
     }
   );
 }
 getRowSpan(col, index) {
  return this.spans[index] && this.spans[index][col];
}


cacheSpan(key, accessor) {
  for (let i = 0; i < this.profileObjs.data.length;) {
    let currentValue = accessor(this.profileObjs.data[i]);
    let count = 1;

    // Iterate through the remaining rows to see how many match
    // the current value as retrieved through the accessor.
    for (let j = i + 1; j < this.profileObjs.data.length; j++) {
      if (currentValue != accessor(this.profileObjs.data[j])) {
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

 ngOnInit() {
   if (localStorage.getItem('ItemPerPage') !== null) {
     this.currentPageSize = +localStorage.getItem('ItemPerPage');
     this.size = +localStorage.getItem('ItemPerPage');
   }
   else {
     this.currentPageSize = 10;
     this.size = 10;
   }
   this.getprofile();
 }
 editprofile(obj) {

   this._utility.profileObject.appID = obj["appID"];
   this._utility.profileObject.classType = obj["classType"];
   this._utility.profileObject.facetID = obj["facetID"];
   this._utility.profileObject.facetName = obj["facetName"];
   this._utility.profileObject.id  = obj["id"];
   this._utility.profileObject.profile  = obj["profile"];
   this._utility.profileObject.ruleCode  = obj["ruleCode"];
   this._utility.profileObject.siteName  = obj["siteName"];
   this._utility.profileObject.standardID  = obj["standardID"];
   this._utility.profileObject.standardName  = obj["standardName"];
   this._utility.compprofileedit = true;

   this._config.getProfileDetailsById(this._utility.profileObject.id,this._utility.profileObject.classType,this._utility.profileObject.appID,this._utility.tenantID).subscribe((data: any) => {
    this._utility.distinctprofileObj = data;
    this._utility.showcompilanceprofile = true;

  }, error => {
    console.error('Error retrieving regulation data:', error);
});


 }

 applyFilter1(filterValue: string) {
   filterValue = filterValue.trim(); // Remove whitespace
   filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
   this.profileObjs.filter = filterValue;
 }
 filterByText(initial: string) {
   if (initial === "") {
     this.filterValue = this.profileObjs;
   } else {
     if (this.filterValue == undefined) {
       this.filterValue = this.profileObjs;
     }
   }
   this.filterValue = this.profileObjs;
   this.filterValue = this.filterValue.filter(
     i =>
       i.ProfileName.toLowerCase().indexOf(initial.toLocaleLowerCase()) !== -1 ||
       i.Rulecode.toLowerCase().indexOf(initial.toLocaleLowerCase()) !== -1 ||
       i.standard.toLowerCase().indexOf(initial.toLocaleLowerCase()) !== -1

   );
 }

 openDialog(obj): void {
  const dialogRef = this.dialog.open(DeleteDialog, {
    width: "390px",
    data: { id: 0, type: "", message: "Are you sure, you want to delete this location?", action: 'Delete', title: 'Confirmation' }
  });

  dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
    if (result == true) {
      this.deleteprofile(obj);
    }
    //this.deleteReport(id);
    //this.animal = result;
  });
}

deleteprofile(obj)
{
  this._config
      .deleteProfile(obj["id"], this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this._rptService.showSuccess("Deleted Successfully");
          this.getprofile();
          // //this._route.navigateByUrl("appCrEnv/config");
          // this._utility.showLocation = false;
          //this.locObjs.splice(obj["id"], 1);
        },
        error => {
          this._rptService.showError("Error :" + error.error);
          this.getprofile();
          //console.log(error);
        }
      );
}

 ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
 }
}

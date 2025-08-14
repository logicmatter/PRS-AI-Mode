import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReportingService, TenantService } from 'src/app/PmCore/services';
import { LookupServiceService } from 'src/app/PmCore/services/LookupService/lookup-service.service';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import clonedeep from 'lodash.clonedeep';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-room-equipment-selection',
  templateUrl: './room-equipment-selection.component.html',
  styleUrls: ['./room-equipment-selection.component.scss']
})
export class RoomEquipmentSelectionComponent implements OnInit {
  _inputparams
  currentPageSize = 10;
  currentPageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  startingIndex: number;
  endingIndex: any;
  displayedColumns = ['checked', 'roomName', 'location', 'classType'];
  roomsList = new MatTableDataSource();
  sortDirection;
  sortProperty;
  length: number;
  index1: any;
  tempAray1: any;
  tempAray: unknown[];
  dataLength: number;
  showSpinner: boolean = false;
  dummyreportID: any; 

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.roomsList) {
      this.roomsList.paginator = value;
    }
  }
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.roomsList) {
      this.roomsList.sort = value;
    }
  }
  @Input() set Inputparams(Inputparams: string) {
    this._inputparams = Inputparams;
  }
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(public _utility: AppUtilService, public _configure: LookupServiceService, public utility: UtilityService,
    private tenantService: TenantService, public adhocUtility: AdhocReportutilityService, private _rptService: ReportingService, public dialog: MatDialog,) { }

  ngOnInit() {
    this.roomsList = this._utility.getSelectObjectsList(this._inputparams);
    console.log(this.roomsList);
    if (this._inputparams == 'lid') {
      this.getLocationsObject();
    }
    else if(this._inputparams ==  'eid')
    {
         this.getEquipmentObjects();
    }
  }
  openObjectList() {
    // this._utility.isObjectSelection = !this._utility.isObjectSelection;
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
    this.adhocUtility.saveFilter = '';
  }
  getLocationsObject(): any {
    this.showSpinner = true;
    this._configure
      .getCriticalLocationsList("true", this.tenantService.currentTenantValue.tenantId)
      .subscribe(
        data => {
          let locations: any;
          locations = data;
          this.roomsList = new MatTableDataSource(locations);
          this.length = this.roomsList.data.length;
          this.roomsList.paginator = this.paginator; // For pagination
          this.roomsList.sort = this.sort; // For sort
          console.log(data);
          this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
          // locations.forEach(element => {
          //   this.roomsList.push({
          //     id: element["roomName"],
          //     itemName: element["roomName"]
          //   });
          // });

          if (this._utility.selectedItems.length > 0) {
            var temp = new Array();
            this._utility.selectedItems.forEach(s => {
              if (typeof s == "string" || typeof s == "number") {
                this.roomsList.data.forEach(l => {
                  if (s == (l["sid"])) {
                    temp.push({ "roomName": l["roomName"], "location": l["location"], "classType": l["classType"], "sid": l["sid"],"checked": true });
                  }
                });
              }
              else {
                this.roomsList.data.forEach(l => {
                  if (s.sid == l["sid"] ) {
                    temp.push({ "roomName": l["roomName"], "location": l["location"], "classType": l["classType"],"sid": l["sid"], "checked": true });
                  }
                });
              }



            });

            this.adhocUtility.roomsList = temp;
          }
          if (this.adhocUtility.roomsList.length > 0) {
            this.adhocUtility.roomsList.forEach(s => {
              this.roomsList.data.forEach(l => {
                if (s.sid == (l["sid"])) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          if (this._utility.selectedItems) {
            if (this._utility.selectedItems.length > 0 || this.adhocUtility.roomsList.length > 0) {
              this.checked();
              //this.sort.sort(({ id: 'checked', start: 'desc' }) as MatSortable);
            }
          }
        },
        error => {
        }
      );
    this._utility.openNav();
    this.showSpinner = false;
    return this.roomsList;
  }
  getEquipmentObjects(): any {
    this.showSpinner = true;
    this._configure
      .getCriticalEquipmentsList("true", this.tenantService.currentTenantValue.tenantId)
      .subscribe(
        data => {
          let locations: any;
          locations = data;
          this.roomsList = new MatTableDataSource(locations);
          this.length = this.roomsList.data.length;
          this.roomsList.paginator = this.paginator; // For pagination
          this.roomsList.sort = this.sort; // For sort
          console.log(data);
          this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
          // locations.forEach(element => {
          //   this.roomsList.push({
          //     id: elemenrt["roomName"],
          //     itemName: element["roomName"]
          //   });
          // });

          if (this._utility.selectedItems.length > 0) {
            var temp = new Array();
            this._utility.selectedItems.forEach(s => {
              if (typeof s == "string" || typeof s == "number") {
                this.roomsList.data.forEach(l => {
                  if (s == (l["sid"])) {
                    temp.push({ "equipmentName": l["equipmentName"], "location": l["location"], "classType": l["classType"], "sid": l["sid"],"checked": true });
                  }
                });
              }
              else {
                this.roomsList.data.forEach(l => {
                  if (s.sid == l["sid"] ) {
                    temp.push({ "equipmentName": l["equipmentName"], "location": l["location"], "classType": l["classType"],"sid": l["sid"], "checked": true });
                  }
                });
              }



            });

            this.adhocUtility.roomsList = temp;
          }
          if (this.adhocUtility.roomsList.length > 0) {
            this.adhocUtility.roomsList.forEach(s => {
              this.roomsList.data.forEach(l => {
                if (s.sid == (l["sid"])) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          if (this._utility.selectedItems) {
            if (this._utility.selectedItems.length > 0 || this.adhocUtility.roomsList.length > 0) {
              this.checked();
              //this.sort.sort(({ id: 'checked', start: 'desc' }) as MatSortable);
            }
          }
        },
        error => {
        }
      );
    this._utility.openNav();
    this.showSpinner = false;
    return this.roomsList;
  }
  

  onListDrop(event: CdkDragDrop<string[]>) {
    this.roomsList.sort.active = this.roomsList.sort.active == "checked" ? "" : "";
    this._utility.selectedItems = [];
    this.roomsList.data.forEach((element, i) => {
      console.log(`Moving item from ${event.previousIndex} to index ${event.currentIndex}`);
      if (element["checked"] == true) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        console.log(`event.container ${event.container.data}`)
        this.roomsList.data = clonedeep(this.roomsList.data);
      }
    });
    if (this.adhocUtility.roomsList.length > 0) {
      this.roomsList.data.forEach(l => {
        if (l["checked"] == true) {
          this._utility.selectedItems.push({ "roomName": l["roomName"], "location": l["location"], "classType": l["classType"], "sid": l["sid"],"checked": true });
          console.log(this._utility.selectedItems);
        }
      });
    }

    // this.roomsList.data = this.tempAray1.map((x: any) => Object.assign({}, x));
    // Swap the elements around
    // console.log(`Moving item from ${event.previousIndex} to index ${event.currentIndex}`)
    // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // console.log(`event.container ${event.container.data}`)
    // this.roomsList.data = clonedeep(this.roomsList.data);
    // this.swapPositions(this.adhocUtility.roomsList,`${event.previousIndex}`,`${event.currentIndex}`);
    // if(this.adhocUtility.roomsList.length > 1){
    //   this.adhocUtility.roomsList.forEach(function(i, idx, array){
    //     console. log("Last callback call at index " + idx + " with value " + i );
    //     // if (idx === array.length - 1){
    //     // console. log("Last callback call at index " + idx + " with value " + i );
    //     // }
    //   });

    // }
  }

  swapPositions = (array, a, b) => {

    [array[a], array[b]] = [array[b], array[a]]
  }
  getData(obj) {
    let index = 0
    this.startingIndex = obj.pageIndex * obj.pageSize,
      this.endingIndex = this.startingIndex + obj.pageSize;
  }

  ngAfterViewInit(): void {
    this.roomsList.paginator = this.paginator; // For pagination
    this.roomsList.sort = this.sort; // For sort
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.roomsList.filter = filterValue;
  }
  checked() {
    this.tempAray = [];
    this.tempAray = this.roomsList.data;
    if (this.adhocUtility.roomsList.length > 0) {
      this.adhocUtility.roomsList.forEach(s => {
        this.tempAray.forEach((l, i) => {
          if ((s.sid == l["sid"]) && (s.location == l["location"])) {
            this.roomsList.data.splice(i, 1);
            return;
          }
        });
      });
    }
    this.tempAray1 = this.adhocUtility.roomsList.concat(this.roomsList.data);
    this.roomsList.data = this.tempAray1.map((x: any) => Object.assign({}, x));
    this.sortProperty = 'checked';
    this.sortDirection = 'desc';
    if (this.roomsList.sort) {
      this.roomsList.sort.active = this.roomsList.sort.active != "checked" ? "checked" : "checked";
      this.roomsList.sort.direction = "desc";
    }

    //this.paginator.pageIndex = this.page, // number of the page you want to jump.
    if (this.roomsList.paginator) {
      this.roomsList.paginator.firstPage();
    }
  }
  findIndexToUpdate(obj) {
    // return obj.roomName + obj.location === this;
    return obj.sid  === this;
  }


  findIndexToUpdate1(obj) {
    return obj.logDescription + obj.trendlogName === this;
  }
  findIndexToUpdate2(obj) {
    return obj.descr + obj.objName === this;
  }

  // Method to Clear Checkbox
  checkedState(obj, evt) {
   if (this._utility.licenseInfo.isLimitedEdition) {
    if(this._utility.reportID == "")
    {
      this.dummyreportID = -1;
    }
    else
    {
      this.dummyreportID = this._utility.reportID;
    }
    this._rptService.getReportObjectExistsByRooms(this.dummyreportID, obj.sid, this._utility.tenantID, this._utility.appID, obj.checked)
    .subscribe(response => {
      if (response) {
        const updateItem = this.adhocUtility.roomsList.find(this.findIndexToUpdate, obj.sid );
        let index = this.adhocUtility.roomsList.indexOf(updateItem);
        if (index > -1) {
          this.adhocUtility.roomsList.splice(index, 1);
        } else {
          this.adhocUtility.roomsList.push(obj);
        }
        this._utility.selectedItems = this.adhocUtility.roomsList;
        if (this._utility.selectedItems.length < 0) {
          this._utility.hasSelectedBacknetObject = false;
          this._utility.isObjectSelectionEnable = false;
        }
        else {
          this._utility.hasSelectedBacknetObject = true;
          this._utility.isObjectSelectionEnable = true;
        }
          }
     else {
      obj.checked = false
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: "",
          message:
            "Reached the Object limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>",
          action: "Warning",
          title: "Info",
        },
      });
      return;
      }
    }, error => {
      console.error('Error:', error);
    });
  }
else{
    const updateItem = this.adhocUtility.roomsList.find(this.findIndexToUpdate, obj.sid );
    let index = this.adhocUtility.roomsList.indexOf(updateItem);
    if (index > -1) {
      this.adhocUtility.roomsList.splice(index, 1);
    } else {
      this.adhocUtility.roomsList.push(obj);
    }
    this._utility.selectedItems = this.adhocUtility.roomsList;
    if (this._utility.selectedItems.length < 0) {
      this._utility.hasSelectedBacknetObject = false;
      this._utility.isObjectSelectionEnable = false;
    }
    else {
      this._utility.hasSelectedBacknetObject = true;
      this._utility.isObjectSelectionEnable = true;
    }
  }
  }
  clearSelection() {
    this.roomsList.data.filter(g => {
      g["checked"] = false;
      return true;
    });
    this.adhocUtility.roomsList = [];
    this._utility.selectedItems = [];
  }
}

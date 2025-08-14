import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup } from "@angular/forms";
import { EnvLocObj } from "../../models/EnvLocObj";
import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import {
  ReportingService,
  SearchServiceService,
  TenantService,
} from "src/app/PmCore/services";
import {
  AppUtilService,
  DeleteDialog,
} from "src/app/PmCore/shared/app-util.service";
import { CommonModel } from "src/app/PmModel/common.model";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Search } from "src/app/PmModel/search.model";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { AdhocReportutilityService } from "projects/AppAdhoc/src/app/adhoc-reportutility.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { MatTableDataSource } from "@angular/material/table";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { PageEvent } from "@angular/material/paginator";

//import { Location } from '@angular/common';

@Component({
  selector: "app-add-location",
  templateUrl: "./add-location.component.html",
  styleUrls: ["./add-location.component.scss"],
})
export class AddLocationComponent implements OnInit, OnDestroy {
  site = "";
  location = "";

  pointtype = "Alarm";
  pointDesc = "";
  roomname = "";
  pointSID;
  standardSID;
  standardID = "";
  profileTypeIds: any;
  public commonModel: CommonModel;
  public model: Search = new Search();
  page = 0;
  size = 10;
  page1 = 0;
  size1 = 10;
  currentPageSize = 10;
  trendlogPanel = false;
  trndlength: number;
  alrmlength: number;
  startingIndex: number;
  endingIndex: any;
  trendDataLength: any;
  alarmDataLength: any;
  alarmSortProperty: string;
  alarmSortDirection: string;
  pageSize = 10;
  pageSize1 = 10;
  currentPageIndex = 0;
  filter: any;
  sortDirection;
  sortProperty;
  standards;
  tempAray: any[];
  tempAray1: any[];
  standardCount: any;
  alarmPanel = false;
  isShowAlarm: boolean;
  displayedColumns = [
    "checked",
    "objName",
    "alarmType",
    "descr",
    "propDescr",
    "devInst",
    "standardId",
  ];
  displayedColumns1 = [
    "checked",
    "trendlogName",
    "logDescription",
    "logDevNum",
    "logInst",
    "engineeringUnit",
    "standardId",
  ];
  displayedColumns2 = [
    "checked",
    "objName",
    "logDescription",
    "logDevNum",
    "logInst",
    "standardId",
  ];
  // currentPageSize = 10;
  trendlogList = new MatTableDataSource();
  alarmLength: any;
  isDisable: boolean = false;
  isDetails: any;
  startingIndex1: number;
  endingIndex1: any;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  alarmList = new MatTableDataSource();
  stdObjs = new MatTableDataSource();
  dropdownLocationList = [];
  selectedLocation : any;
  selectedLocationsItems = [];
  selectionStandardsItems = [];
  selectionLocationsItems = [];
  dropdownSIDsList = [];
  selectedSIDsItems = [];
  selectionSIDsItems = [];
  dropdownStandardsList = [];
  selectedStandardsItems = [];
  selectedEnvNameItems = [];
  dropdownStandardsSettings = {};
  dropdownLocationsSettings = {};
  // dropdownProfileTypeSettings = {};
  dropdownSIDsSettings = {};
  dropdownEnvLocationsList = [];
  selectedEnvLocationsItems = [];
  dropdownEqpLocationsSettings = {};
  selectionEqpLocationsItems = [];
  dropdownRoomNameList = [];
  selectedRoomNameItems = [];
  dropdownEnvNameList = [];
  dropdownRoomNameSettings = {};
  selectionRoomNameItems = [];
  trendlogData: any;
  alarmData: any;
  trndfilter: any;
  isShowBoth: boolean;
  isShowTrends: boolean;
  currentPageIndex1 = 0;
  // selectedProfileTypeItems = [];
  // dropdownProfileTypeList = [];
  index1: any;
  alarmStandards: any;
  pageSize3 = 10;
  currentPageIndex3 = 0;
  energylogList = new MatTableDataSource();
  energyfilter: any;
  energyList = new MatTableDataSource();
  energyPanel = false;
  energyDataLength: any;
  energylength: number;
  startingIndex2: number;
  endingIndex2: any;
  energySortProperty: string;
  energySortDirection: string;
  energyStandards: any;
  energyData: any;

  standard: any[];
  tempObj: { PointSID: any; StandardSID: any };

  config: { currentPage: number; itemsPerPage: number };
  selectedItems = {};

  // form = new FormGroup({
  //   site: new FormControl(),
  //   location: new FormControl(),
  //   pointtype: new FormControl(),
  //   pointDesc: new FormControl(),
  //   pointSID: new FormControl(),
  //   standardSID: new FormControl(),
  //   standardID: new FormControl()
  // });
  public locationObj: EnvLocObj = new EnvLocObj();
  isSelected = true;
  pointSids;
  standardSIDs;
  facetUnit;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  criteria = [
    { Lessthan: "< Lessthan" },
    { Greaterthan: "> Greaterthan" },
    { Between: "[ ] Between" },
  ];
  loopLength: number;
  saveDisable: boolean;
  locationIds: any;
  http: any;
  alrmfilter: any;
  count: any;
  count1: any;
  classType: string;
  filterValue: any;
  selectedOption: any;
  length: number;
  showSpinner: boolean;
  distinctLocationObj: any;
  isDisabledd: boolean = false;
  Roomtypechanged: boolean = false;
  @ViewChild("energySort", { static: false })
  set energySort(value: MatSort) {
    if (this.energyList) {
      this.energyList.sort = value;
    }
  }
  @ViewChild("paginator", { static: false })
  set paginator(value: MatPaginator) {
    if (this.alarmList) {
      this.alarmList.paginator = value;
    }
  }
  @ViewChild(MatPaginator, { static: false }) userPaginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) userSort: MatSort;
  @ViewChild("sort", { static: false })
  set sort(value: MatSort) {
    if (this.alarmList) {
      this.alarmList.sort = value;
    }
  }

  @ViewChild("energyPaginator", { static: false })
  set energyPaginator(value: MatPaginator) {
    if (this.energyList) {
      this.energyList.paginator = value;
    }
  }
  @ViewChild("trendlogPaginator", { static: false })
  set trendlogPaginator(value: MatPaginator) {
    if (this.trendlogList) {
      this.trendlogList.paginator = value;
    }
  }
  @ViewChild("trendlogSort", { static: false })
  set trendlogSort(value: MatSort) {
    if (this.trendlogList) {
      this.trendlogList.sort = value;
    }
  }

  constructor(
    private _route: Router,
    public _config: LookupServiceService,
    private route: ActivatedRoute,
    private _rptService: ReportingService,
    private tenantService: TenantService,
    public _util: AppUtilService,
    private _utility: AppUtilService,

    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    // private search: SearchServiceService,
    public adhocUtility: AdhocReportutilityService,
    public _core: CoreUtilityService,
    public utility: UtilityService
  ) // private loction: Location
  {
    this.config = {
      currentPage: 1,
      itemsPerPage: 10,
    };
    // this._core.filter = "";
    // this._core.reverse = true;
    // this._core.key = "";
    // this.selectItem(this._core.maxRecords, 1);
    // this.isSelectedItem(this._core.maxRecords, 1);
    // this.getDistinctLocationList(true);
    // this.getDistinctLocationList1();
    this.disableButton();
    if (!this._util.isEmpty(this._util.locationObject)) {
      this._util.showLocationBack = true;
      // this._util.saveDisable = false;
      this.locationObj.Site = this._util.locationObject.Site;
      this.locationObj.classTypeID = this._util.locationObject.classTypeID;
      this.locationObj.classType = this._util.locationObject.classType;
      this.locationObj.roomName = this._util.locationObject.roomName;
      this.locationObj.PointSID = this._util.locationObject.PointSID;
      this.locationObj.StandardSID = this._util.locationObject.StandardSID;
      this.locationObj.Location = this._util.locationObject.Location;
      this.pointtype = this._util.eqpLocationObject.PointType;
      this.roomname = this._util.locationObject.roomName;
      this.site = this._util.locationObject.Site;
      this.location = this._util.locationObject.Location;
      this.classType = this._util.locationObject.classType;
      // this._config.selectedStandardsItems = 1;
      // this.model.objectType = this._util.locationObject.PointType;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = "lookUpApp";
      this.model.roomName = this.roomname;
      this.model.location = this.locationObj.Location;
      this.model.appId = this._util.appID;
      this.model.classType = this._util.locationObject.classType;
      // this.classType = this._util.locationObject.classType;
      // this.adhocUtility.classType = this.classType;
      // this.adhocUtility.saveFilter = '';
      //this.classType = this._util.locationObject.classType;
      // this._config.editLookUpLoc(this.model, this.roomname, this.location)
      // .pipe(takeUntil(this.ngUnsubscribe))
      // .subscribe(data => {
      //     console.log(data);
      // });
      // this.selectedProfileTypeItems.push({
      //   id: this._util.locationObject.classTypeID,
      //   itemName: this._util.locationObject.classType,
      // });
      this.selectedSIDsItems.push({
        id: this._util.locationObject.PointSID,
        itemName:
          this._util.locLogDevNum +
          " - " +
          this._util.locObjName +
          " - " +
          this._util.locLogDescription,
      });
      if (this.pointtype == "Trendlog") {
        this.selectedSIDsItems.push({
          id: this._util.locationObject.PointSID,
          itemName:
            this._util.locLogDevNum +
            " - " +
            this._util.locInst +
            " - " +
            this._util.locObjName +
            " - " +
            this._util.locLogDescription,
        });
      } else {
        this.selectedSIDsItems.push({
          id: this._util.locationObject.PointSID,
          itemName:
            this._util.locLogDevNum +
            " - " +
            this._util.locObjName +
            " - " +
            this._util.locLogDescription,
        });
      }
      this.selectedRoomNameItems.push({
        id: this._util.locationObject.ID,
        itemName: this._util.locationObject.roomName,
      });
      this.selectedEnvNameItems.push({
        id: this._util.locationObject.ID,
        itemName: this._util.locationObject.roomName,
      });
      this.selectedStandardsItems.push({
        id: this._util.locationObject.StandardSID,
        itemName:
          this._util.locationObject.classType +
          " - " +
          this._util.locStandardID +
          " - " +
          this._util.locRuleCode +
          " - " +
          this._util.locRegulation +
          " - " +
          this._util.locFacet +
          " - " +
          this._util.locfacetUnit,
      });
      this.selectedLocationsItems.push({
        id: this._util.locationObject.classTypeID,
        itemName: this._util.locationObject.classType,
      });

      this.dropdownEnvLocationsList.push({
        id: this._util.locationObject.ID,
        itemName: this._util.locationObject.Location,
      });
      this.dropdownRoomNameList.push({
        id: this._util.locationObject.ID,
        itemName: this._util.locationObject.roomName,
      });
      this.getLocations();
      this.getSearchResultsLookUp(this.model);

      // this.form.setValue({
      //   site: this.locationObj.Site,
      //   location: this.locationObj.Location,
      //   pointtype: this.locationObj.PointType,
      //   pointDesc: "",
      //   pointSID: this.locationObj.PointSID,
      //   standardSID: "",
      //   standardID: this.locationObj.StandardSID
      // });
    } else {
      this._util.showLocationBack = false;
      this.site = "";
      this.location = "";
      this.roomname = "";
      this.pointtype = "Alarm";
      this.getPointSid();
      this.pointDesc = "";
      this.pointSID;
      this.standardSID;
      this.standardID = "";
      // this._config.selectedSIDsItems = [];
      // this.form.setValue({
      //   site: "",
      //   location: "",
      //   pointtype: "",
      //   pointDesc: "",
      //   pointSID: "",
      //   standardSID: "",
      //   standardID: ""
      // });
      this.getLocations();
    }
    // this.route.queryParams.subscribe(params => {
    //   if (!this._util.isEmpty(params)) {
    //     this.locationObj.Site = params["site"];
    //     this.locationObj.Location = params["location"];
    //     this.locationObj.PointType = params["pointType"];
    //     this.locationObj.PointSID = params["pointSID"];
    //     this.locationObj.StandardSID = params["standardSID"];
    //     this.form.setValue({
    //       site: this.locationObj.Site,
    //       location: this.locationObj.Location,
    //       pointtype: this.locationObj.PointType,
    //       pointSID: this.locationObj.PointSID,
    //       standardID: this.locationObj.StandardSID
    //     });
    //   }
    // });
  }


  ngOnInit() {
    // this.adhocUtility.trndcheckedList = [];
    // this.adhocUtility.checkNames = [];
    // this._config.selectedSIDsItems = [];
    // this.adhocUtility.alrmcheckedList = [];
    // this.adhocUtility.checkNames = [];
    // this._config.alrmselectedSIDsItems = [];
    // this.getStandards();
    // this.getLocations();
    // this.getEnvLocations();
    // this.getRoomNames();
    //  this.getProfileList();
    //  this.getDistinctLocationList();
    //  this._config.selectedSIDsItems = [];
    //  this._config.alrmselectedSIDsItems = [];
    // this.commonModel = this.tenantService.currentTenantValue;
    // this.model.tenantId = this.commonModel.tenantId;
    // this.model.userId = this.commonModel.userId;
    // this.model.objectType = "Trendlog";
    // this.model.app = 'lookUpApp';
    // this.model.appId = this._util.appID;
    // this.adhocUtility.checkedList = [];
    // this.adhocUtility.alrmcheckedList = [];
    // this.adhocUtility.trndcheckedList = [];
    // this.adhocUtility.checkNames = [];
    // this.adhocUtility.saveFilter = "";
    this.adhocUtility.trndcheckedList = [];
    this.adhocUtility.checkNames = [];
    this._config.selectedSIDsItems = [];
    this.adhocUtility.alrmcheckedList = [];
    this.adhocUtility.energycheckedList = [];
    this.adhocUtility.checkNames = [];
    this._config.alrmselectedSIDsItems = [];
    this.adhocUtility.saveFilter = "";
    this.getStandards();
    // this.getProfileList();
    if(this._utility.configedit)
    {
         this.getDistinctLocationList();
    }
    if (localStorage.getItem("ItemPerPage") !== null) {
      this.currentPageSize = +localStorage.getItem("ItemPerPage");
      this.pageSize = +localStorage.getItem("ItemPerPage");
      this.pageSize1 = +localStorage.getItem("ItemPerPage");
    } else {
      this.currentPageSize = 10;
      this.pageSize = 10;
      this.pageSize1 = 10;
    }
    this._util.saveDisable = true;
    // this.alarmList = new MatTableDataSource();
    // this.trendlogList = new MatTableDataSource();
    this.commonModel = this.tenantService.currentTenantValue;
    if (this.site == "" || this.site == null || this.site == undefined) {
      this.site = this.commonModel.tenantName;
    }
    this.disableButton();
    //this.getPointSid();

    this.getRoomNames();

    this.dropdownStandardsSettings = {
      singleSelection: true,
      text: "Select Standard (e.g. 1987-AIA)",
      badgeShowLimit: 1,
      position: "bottom",
      maxHeight: 200,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class",
    };
    this.dropdownLocationsSettings = {
      singleSelection: true,
      text: "Select Environment Type (e.g. ROOM.OR_SURGERY)",
      badgeShowLimit: 1,
      position: "bottom",
      maxHeight: 200,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class",
    };
    this.dropdownSIDsSettings = {
      singleSelection: true,
      text: "Select  Object (e.g. Trendlog 4539)",
      badgeShowLimit: 1,
      position: "bottom",
      maxHeight: 200,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class",
      searchAutofocus: true,
      searchBy: ["sid", "logdevnum", "objectName", "logdescription", "loginst"],
    };
    this.dropdownLocationsSettings = {
      singleSelection: true,
      text: "Select Environment Type (e.g. Generator)",
      badgeShowLimit: 1,
      position: "bottom",
      maxHeight: 200,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class",
    };
    this.dropdownEqpLocationsSettings = {
      singleSelection: true,
      text: "Enter Location / Department (e.g. Surgery)",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      classes: "myclass custom-class",
    };
    this.dropdownRoomNameSettings = {
      singleSelection: true,
      text: "Select Environment Name (e.g. OR ROOM 1)",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      classes: "myclass custom-class",
    };

  }
  onLocationsItemSelect(item: any, isEdit1: boolean = false) {
    this.classType =
      this.selectedLocationsItems.length > 0
        ? this.selectedLocationsItems[0].itemName
        : "";
    if (!this.location) {
      this.selectedEnvLocationsItems = [];
      this.onAddEnvLocItem(this.selectedLocationsItems[0].itemName);
    }
    // this.model.objectType = "Trendlog";
    this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.model.userId = this.tenantService.currentTenantValue.userId;
    this.model.app = "lookUpApp";
    this.model.appId = this._util.appID;
    this.model.classType = this.classType;
    this.model.roomName = this.roomname;
    // this.adhocUtility.classType = this.classType;
    // this.model.regfiltertype = this.selectedLocation;
    this.model.location = this.location;
    this.model.pageNumber = 1;

    this.disableButton();

    const savedValues = this.getDistinctLocationList();
    console.log(savedValues);
    this._utility.itemcrenvedit = false;
    this.Roomtypechanged = true;

  }
  OnLocationsItemDeSelect(item: any) {
    // this.selectedEnvLocationsItems = [];
    // this.location = '';
    this.dropdownStandardsList = [];
    this.selectedStandardsItems = [];
    this.selectedLocationsItems = [];
    this.distinctLocationObj = [];
    this.selectedLocation = "";
    this.classType = "";
    this.disableButton();
  }
  onChangeLocation(isEdit: boolean = false) {
    if (this.selectedLocation === "all") {
      this.getStandards();
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = "lookUpApp";
      this.model.appId = this._util.appID;
      this.model.classType = this.classType;
      this.model.roomName = this.roomname;
      this.model.location = this.location;
      this.model.pageNumber = 1;
      this.model.regfiltertype = this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.getSearchResultsLookUp(this.model);
      this.getStandardSid();
    } else {
      this._config
        .getFilterStandards(
          this._utility.appID,
          this._utility.tenantID,
          this.classType,
          this.selectedLocation.id,

        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (data) => {
            this.filterValue = data;
            this.stdObjs.data = this.filterValue;
            this.model.tenantId =
              this.tenantService.currentTenantValue.tenantId;
            this.model.userId = this.tenantService.currentTenantValue.userId;
            this.model.app = "lookUpApp";
            this.model.appId = this._util.appID;
            this.model.classType = this.classType;
            this.model.roomName = this.roomname;
            this.model.regfiltertype =  this.selectedLocation.profile;
            this.model.ProfileSID = this.selectedLocation.id;
            this.model.location = this.location;
            this.model.pageNumber = 1;
            this.getSearchResultsLookUp(this.model);
            this.getStandardSid();
          },
          (error) => {}
        );
    }
    this.Roomtypechanged = false;
    this._util.saveDisable = true;


  }

  getData2(obj) {
    if (localStorage.getItem("ItemPerPage") !== null) {
      if (parseInt(localStorage.getItem("ItemPerPage")) == obj.pageSize) {
        this.currentPageSize = +localStorage.getItem("ItemPerPage");
      } else {
        localStorage.setItem("ItemPerPage", obj.pageSize.toString());
        this.currentPageSize = obj.pageSize;
      }
    } else {
      localStorage.setItem("ItemPerPage", obj.pageSize.toString());
      this.currentPageSize = obj.pageSize;
    }
    let index = 0;
    (this.startingIndex = obj.pageIndex * obj.pageSize),
      (this.endingIndex = this.startingIndex + obj.pageSize);
  }


  getDistinctLocationList() {
    this.distinctLocationObj = [];
    this._config
      .getDistinctProfileList(
        this._utility.appID,
        this._utility.tenantID,
        this.classType
      )
      .pipe(takeUntil(this.ngUnsubscribe)) // Unsubscribe when component is destroyed
      .subscribe(
        (data) => {
          console.log("Regulations:", data);
          // Assuming data is an array of strings
          this.distinctLocationObj = data;
        if(this._utility.configedit &&  this._utility.itemcrenvedit)
        {
          this.onChangeLocationEdit();
        }
        else{
          this.dropdownStandardsList = []
        }

        },
        (error) => {
          console.error("Error retrieving regulation data:", error);
        }
      );
  }

  onChangeLocationEdit() {
  const utilityIds = this._utility.distinctLocationObj.map(item => item.id);
  const distinctIds = this.distinctLocationObj.map(item => item.id);
  const index = distinctIds.findIndex(id => utilityIds.includes(id));
    this.selectedLocation = this.distinctLocationObj[index];
    if (this.selectedLocation === "all") {
      this.getStandards();
      // this.model.objectType = "Trendlog";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = "lookUpApp";
      this.model.roomName = this.roomname;
      this.model.appId = this._util.appID;
      this.model.classType = this.classType;
      // this.adhocUtility.classType = this.classType;
      this.model.location = this.location;
      this.model.pageNumber = 1;
      this.model.regfiltertype = this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.getSearchResultsLookUp(this.model);
      this.getStandardSid();
    } else {
      this._config
        .getFilterStandards(
          this._utility.appID,
          this._utility.tenantID,
          this.classType,
          this.selectedLocation.id,

        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (data) => {
            this.filterValue = data;
            this.stdObjs.data = this.filterValue;
            // this.model.objectType = "Trendlog";
            this.model.tenantId =
              this.tenantService.currentTenantValue.tenantId;
            this.model.userId = this.tenantService.currentTenantValue.userId;
            this.model.app = "lookUpApp";
            this.model.appId = this._util.appID;
            this.model.roomName = this.roomname;
            this.model.classType = this.classType;
            this.model.location = this.location;
            this.model.regfiltertype = this.selectedLocation.profile;
            this.model.ProfileSID = this.selectedLocation.id;
            this.model.pageNumber = 1;
            this.getSearchResultsLookUp(this.model);
            // this.adhocUtility.classType = this.classType;

            this.getStandardSid();
            if (
              this.adhocUtility.trndcheckedList.standardID === undefined ||
              this.adhocUtility.alrmcheckedList.standardID === undefined
            ) {
              this.saveDisable = false;
            } else {
              this.saveDisable = true;
            }
            // if ( this.adhocUtility.alrmcheckedList.standardID === undefined) {
            //   this.saveDisable = false;
            // } else {
            //   this.saveDisable = true;
            // }
          },
          (error) => {}
        );
    }
  }

  getData(pageEvent: PageEvent, type) {
    if (localStorage.getItem("ItemPerPage") !== null) {
      if (parseInt(localStorage.getItem("ItemPerPage")) == pageEvent.pageSize) {
        this.pageSize = +localStorage.getItem("ItemPerPage");
      } else {
        localStorage.setItem("ItemPerPage", pageEvent.pageSize.toString());
        this.pageSize1 = pageEvent.pageSize;
        (this.startingIndex1 = pageEvent.pageIndex * pageEvent.pageSize),
          (this.endingIndex1 =
            this.startingIndex1 +
            (pageEvent.pageSize < pageEvent.length - this.startingIndex1
              ? pageEvent.pageSize
              : pageEvent.length - this.startingIndex1));
      }
    } else {
      localStorage.setItem("ItemPerPage", pageEvent.pageSize.toString());
      this.currentPageSize = pageEvent.pageSize;
    }
    this.isDisable = true;
    let index = 0;
    this.currentPageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    (this.startingIndex = pageEvent.pageIndex * pageEvent.pageSize),
      (this.endingIndex =
        this.startingIndex +
        (pageEvent.pageSize < pageEvent.length - this.startingIndex
          ? pageEvent.pageSize
          : pageEvent.length - this.startingIndex));
    // this.endingIndex1 = this.startingIndex1 + pageEvent.pageSize;
    this.isDisable = false;
    pageEvent.previousPageIndex = pageEvent.pageIndex;
    if (this.trendlogList.paginator) {
      setTimeout(() => {
        this.trendlogList.paginator.length = this.trendDataLength;
        this.alarmList.paginator.length = this.alarmDataLength;
      });
    }
    if (
      this.endingIndex + this.pageSize > this.trndlength &&
      this.trndlength != this.trendDataLength &&
      pageEvent.pageIndex != 0
    ) {
      if (type == "Trendlog") {
        this.isDisable = true;
        if (this.adhocUtility.trndcheckedList) {
          this._util.selectedSIDsItems = [];
          this.adhocUtility.trndcheckedList.forEach((element) => {
            if (typeof element == "string") {
              this._util.selectedSIDsItems.push(element);
            } else {
              this._util.selectedSIDsItems.push(element.sid);
            }
          });
          this.model.sidParams = this._util.selectedSIDsItems.toString();
          this.model.keyWord = this.adhocUtility.trndsaveFilter;
        }
        this.model.filterType = "Trendlog";
        this.model.pageNumber = Math.round(
          this.trendDataLength / this.trndlength
        );
        this._config
          .getEnvLookUpObjects(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data) => {
            //this._util.standard = data.table1
            // setTimeout(() => {
            this.standards = data.table;

            this.trendlogList = new MatTableDataSource(data.table1);
            this.trendlogList.data = data.table1.concat(this.trendlogData);
            this.trendlogData = this.trendlogList.data;
            // this.trndlength = this.trendlogList.data.length;
            if (this.trndlength > 0) {
              this.trendlogList.sort = this.trendlogSort;
              this.trendlogList.paginator = this.trendlogPaginator;
              this.trendDataLength = data.table2[0].totalTrendCount;
              setTimeout(() => {
                this.trendlogList.paginator.pageIndex = pageEvent.pageIndex;
                this.alarmList.paginator.length = this.alarmDataLength;
                this.trendlogList.paginator.length = this.trendDataLength;
              });
            }

            if (this.model.app == "lookUpApp") {
              var temp = new Array();
              var temp2 = new Array();
              this.trendlogList.data.forEach((l) => {
                if (
                  l["location"] == this.model.location &&
                  l["roomName"] == this.model.roomName
                ) {
                  temp.push({
                    sid: l["sid"],
                    trendlogName: l["trendlogName"],
                    logInst: l["logInst"],
                    logDevNum: l["logDevNum"],
                    logDescription: l["logDescription"],
                    engineeringUnit: l["engineeringUnit"],
                    PointSID: l["sid"],
                    standardID: l["standardID"],
                    standard: l["standard"],
                    checked: true,
                  });
                  temp2.push({
                    PointSID: l["sid"],
                    StandardSID: parseInt(l["standardID"]),
                  });
                }
              });
              this.trndfilter = this.adhocUtility.trndsaveFilter;
              if (this.adhocUtility.trndcheckedList.length > 0) {
                this.adhocUtility.trndcheckedList.forEach((s) => {
                  this.trendlogList.data.forEach((l) => {
                    if (s.sid == l["sid"]) {
                      l["checked"] = true;
                      return;
                    }
                  });
                });
              }
              if (this.adhocUtility.trndcheckedList.length > 0) {
                this.checked();
              }
              // this.adhocUtility.trndcheckedList = temp;
              // this._config.selectedSIDsItems = temp2;
            }

            this.showSpinner = false;
          });
        this.isDisable = false;
      }
    }
  }
  getData1(pageEvent1: PageEvent, type) {
    if (localStorage.getItem("ItemPerPage") !== null) {
      if (
        parseInt(localStorage.getItem("ItemPerPage")) == pageEvent1.pageSize
      ) {
        this.pageSize1 = +localStorage.getItem("ItemPerPage");
      } else {
        localStorage.setItem("ItemPerPage", pageEvent1.pageSize.toString());
        this.pageSize = pageEvent1.pageSize;
        (this.startingIndex = pageEvent1.pageIndex * pageEvent1.pageSize),
          (this.endingIndex =
            this.startingIndex +
            (pageEvent1.pageSize < pageEvent1.length - this.startingIndex
              ? pageEvent1.pageSize
              : pageEvent1.length - this.startingIndex));
      }
    } else {
      localStorage.setItem("ItemPerPage", pageEvent1.pageSize.toString());
      this.currentPageSize = pageEvent1.pageSize;
    }
    this.isDisable = true;
    this.currentPageIndex1 = pageEvent1.pageIndex;
    this.pageSize1 = pageEvent1.pageSize;
    (this.startingIndex1 = pageEvent1.pageIndex * pageEvent1.pageSize),
      (this.endingIndex1 =
        this.startingIndex1 +
        (pageEvent1.pageSize < pageEvent1.length - this.startingIndex1
          ? pageEvent1.pageSize
          : pageEvent1.length - this.startingIndex1));
    // this.endingIndex1 = this.startingIndex1 + pageEvent1.pageSize;
    this.isDisable = false;
    pageEvent1.previousPageIndex = pageEvent1.pageIndex;

    setTimeout(() => {
      this.alarmList.paginator.length = this.alarmDataLength;
      this.trendlogList.paginator.length = this.trendDataLength;
    });
    if (
      this.endingIndex1 + this.pageSize1 > this.alrmlength &&
      this.alrmlength != this.alarmDataLength &&
      pageEvent1.pageIndex != 0
    ) {
      if (type == "Alarm") {
        this.isDisable = true;
        if (this.adhocUtility.alrmcheckedList) {
          this._util.selectedItems = [];
          this.adhocUtility.alrmcheckedList.forEach((element) => {
            if (typeof element == "string") {
              this._util.selectedItems.push(element);
            } else {
              this._util.selectedItems.push(element.sid);
            }
          });
          this.model.sidParams = this._util.selectedItems.toString();
          this.model.keyWord = this.adhocUtility.alrmsaveFilter;
        }
        this.model.filterType = "Alarm";
        this.model.pageNumber = Math.round(
          this.alarmDataLength / this.alrmlength
        );
        this._config
          .getEnvLookUpObjects(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data) => {
            //this._util.standard = data.table1
            // setTimeout(() => {
            this.alarmStandards = data.table;

            this.alarmList = new MatTableDataSource(data.table1);
            this.alarmList.data = data.table1.concat(this.alarmData);
            this.alarmData = this.alarmList.data;
            // this.alarmDataLength = data.table2[0].totalCount;
            // this.alrmlength = this.alarmList.data.length;
            this.isShowAlarm = false;
            if (this.alrmlength > 0) {
              this.alarmList.sort = this.sort;
              this.alarmList.paginator = this.paginator;
              setTimeout(() => {
                this.alarmList.paginator.pageIndex = pageEvent1.pageIndex;
                this.alarmList.paginator.length = this.alarmDataLength;
                this.trendlogList.paginator.length = this.trendDataLength;
              });
            }
            // if (this.model.DevNum == null || this.model.DevNum == '') {
            //   this.dataLength = data.table1[0].totalCount;
            // }
            this.alarmPanel = true;
            if (this.model.app == "lookUpApp") {
              var alrmtemp = new Array();
              var alrmtemp2 = new Array();
              this.alarmList.data.forEach((l) => {
                if (
                  l["location"] == this.model.location &&
                  l["roomName"] == this.model.roomName
                ) {
                  alrmtemp.push({
                    sid: l["sid"],
                    objName: l["objName"],
                    devInst: l["devInst"],
                    objInst: l["objInst"],
                    descr: l["descr"],
                    propDescr: l["propDescr"],
                    alarmType: l["alarmType"],
                    PointSID: l["sid"],
                    standardID: l["standardID"],
                    standard: l["standard"],
                    checked: true,
                  });
                  alrmtemp2.push({
                    PointSID: l["sid"],
                    StandardSID:
                      l["standardID"] == undefined ? 0 : l["standardID"],
                  });
                }
              });

              // this.adhocUtility.alrmcheckedList = alrmtemp;
              // this._config.alrmselectedSIDsItems = alrmtemp2;

              this.alrmfilter = this.adhocUtility.alrmsaveFilter;
              if (this.adhocUtility.alrmcheckedList.length > 0) {
                this.adhocUtility.alrmcheckedList.forEach((s) => {
                  this.alarmList.data.forEach((l) => {
                    if (s.sid == l["sid"]) {
                      l["checked"] = true;
                      return;
                    }
                  });
                });
              }
              if (this.adhocUtility.alrmcheckedList) {
                this.alrmchecked();
              }
            }

            this.showSpinner = false;
          });

        this.isDisable = false;
      }
    }
  }
  alrmchecked() {
    this.tempAray = [];
    this.tempAray = this.alarmList.data;
    if (this.adhocUtility.alrmcheckedList.length > 0) {
      this.adhocUtility.alrmcheckedList.forEach((s) => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.alarmList.data.splice(i, 1);
            return;
          }
        });
      });
      let trendDisabled = false;
      let alarmDisabled = false;
      if (!this.isShowAlarm) {
        if (
          this.adhocUtility.trndcheckedList.length > 0 &&
          this.adhocUtility.alrmcheckedList.length > 0
        ) {
          for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
            if (
              this.adhocUtility.trndcheckedList[i].standardID == null ||
              this.adhocUtility.trndcheckedList[i].standardID == "none" ||
              this.adhocUtility.trndcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              trendDisabled = true;

              //   this.isDisabledd = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
              trendDisabled = false;
            }
          }
          for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
            if (
              this.adhocUtility.alrmcheckedList[i].standardID == null ||
              this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
              this.adhocUtility.alrmcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              alarmDisabled = true;
              break;
            } else {
              this.standardCount = 0;
              alarmDisabled = false;
              this._util.saveDisable = false;
            }
          }
        } else {
          this._util.saveDisable = false;
        }
      } else {
        if (this.adhocUtility.alrmcheckedList.length > 0) {
          for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
            if (
              this.adhocUtility.alrmcheckedList[i].standardID == null ||
              this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
              this.adhocUtility.alrmcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
            }
          }
        } else {
          this._util.saveDisable = true;
        }
      }
      if (alarmDisabled) {
        this._util.saveDisable = false;
      }
    }
    this.tempAray1 = this.alarmList.data.concat(
      this.adhocUtility.alrmcheckedList
    );
    this.alarmList.data = this.tempAray1.map((x) => Object.assign({}, x));
    this.alarmSortProperty = "checked";
    this.alarmSortDirection = "desc";
    if (this.alarmList.sort) {
      this.alarmList.sort.active =
        this.alarmList.sort.active != "checked" ? "checked" : "checked";
      this.alarmList.sort.direction = "desc";
    }

    if (this.alarmList.paginator) {
      this.alarmList.paginator.firstPage();
      setTimeout(() => {
        this.alarmList.paginator.length = this.alarmDataLength;
        this.trendlogList.paginator.length = this.trendDataLength;
      });
    }

    //this.onChange(newValue,obj)
  }

  getStandards() {
    this.showSpinner = true;
    let tenantId = "1";
    this._config
      .getStandardsList(this._utility.appID, this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          setTimeout(() => {
            this.filterValue = data;
            this.stdObjs.data = this.filterValue;

            this.length = this.stdObjs.data.length;
            this.stdObjs.paginator = this.userPaginator;
            this.stdObjs.sort = this.userSort;
            this.getData2({
              pageIndex: this.page,
              pageSize:
                localStorage.getItem("ItemPerPage") != null
                  ? (this.size = +localStorage.getItem("ItemPerPage"))
                  : this.size,
            });
          });

          this.showSpinner = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  applyFilter(filterValue: string, event) {
    const tempsid = [];
    //filterValue = filterValue.trim(); // Remove whitespace
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }
    if (this.adhocUtility.trndcheckedList) {
      this._util.selectedSIDsItems = [];
      this.adhocUtility.trndcheckedList.forEach((element) => {
        if (typeof element == "string") {
          this._util.selectedSIDsItems.push(element);
        } else {
          this._util.selectedSIDsItems.push(element.sid);
        }
      });
      this.model.sidParams = this._util.selectedSIDsItems.toString();
    }

    let temp = filterValue;
    temp = temp.trim();
    // temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.trendlogList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.trndsaveFilter = temp;
    if (this.model.app == "lookUpApp") {
      if (this.adhocUtility.trndcheckedList) {
        this.adhocUtility.trndcheckedList.forEach((element) => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      this.model.objectType = "Trendlog";
      this.model.filterType = "Trendlog";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = "lookUpApp";
      this.model.appId = this._util.appID;
      this.model.roomName = this.roomname;
      this.model.classType = this.classType;
      this.model.regfiltertype =  this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.model.location = this.location;
      this.model.keyWord = temp == "" ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUpfilterByTrend(this.model);
    } else {
      this.model.objectType = "Trendlog";
      this.model.filterType = "Trendlog";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = this.model.app;
      this.model.appId = this._util.appID;
      this.model.keyWord = temp == "" ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUp(this.model);
    }
  }
  filterByKey(filterValue: string, event) {
    const tempsid = [];
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }

    let temp = filterValue;
    temp = temp.trim();
    temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.trendlogList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.trndsaveFilter = filterValue;
    if (this.adhocUtility.trndcheckedList) {
      this._util.selectedSIDsItems = [];
      this.adhocUtility.trndcheckedList.forEach((element) => {
        if (typeof element == "string") {
          this._util.selectedSIDsItems.push(element);
        } else {
          this._util.selectedSIDsItems.push(element.sid);
        }
      });
      this.model.sidParams = this._util.selectedSIDsItems.toString();
    }

    if (this.model.app == "lookUpApp") {
      if (this.adhocUtility.trndcheckedList) {
        this.adhocUtility.trndcheckedList.forEach((element) => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      if (
        (this.trendlogList.filteredData.length > 0 ||
          this.trendlogList.filteredData.length == 0) &&
        temp == "" &&
        event.keyCode === 8
      ) {
        this.model.objectType = "Trendlog";
        this.model.filterType = "Trendlog";
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.app = "lookUpApp";
        this.model.appId = this._util.appID;
        this.model.roomName = this.roomname;
        this.model.classType = this.classType;
        this.model.regfiltertype = this.selectedLocation.profile;
        this.model.ProfileSID = this.selectedLocation.id;
        this.model.location = this.location;
        this.model.pageNumber = 1;
        this.model.keyWord = temp == "" ? null : filterValue;
        this.getSearchResultsLookUpfilterByTrend(this.model);
      }
    } else {
      if (
        (this.trendlogList.filteredData.length > 0 ||
          this.trendlogList.filteredData.length == 0) &&
        temp == "" &&
        event.keyCode === 8
      ) {
        this.model.objectType = "Trendlog";
        this.model.filterType = "Trendlog";
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.app = "lookUpApp";
        this.model.app = "lookUpApp";
        this.model.appId = this._util.appID;
        this.model.roomName = this.roomname;
        this.model.classType = this.classType;
        this.model.regfiltertype = this.selectedLocation.profile;
        this.model.ProfileSID = this.selectedLocation.id;
        this.model.location = this.location;
        this.model.pageNumber = 1;
        this.model.keyWord = temp == "" ? null : filterValue;
        this.getSearchResultsLookUpfilterByTrend(this.model);
      }
    }
  }
  getData3(pageEvent3: PageEvent, type) {
    if (localStorage.getItem("ItemPerPage") !== null) {
      if (
        parseInt(localStorage.getItem("ItemPerPage")) == pageEvent3.pageSize
      ) {
        this.pageSize3 = +localStorage.getItem("ItemPerPage");
      } else {
        localStorage.setItem("ItemPerPage", pageEvent3.pageSize.toString());
        this.pageSize = pageEvent3.pageSize;
        (this.startingIndex = pageEvent3.pageIndex * pageEvent3.pageSize),
          (this.endingIndex =
            this.startingIndex +
            (pageEvent3.pageSize < pageEvent3.length - this.startingIndex
              ? pageEvent3.pageSize
              : pageEvent3.length - this.startingIndex));
      }
    } else {
      localStorage.setItem("ItemPerPage", pageEvent3.pageSize.toString());
      this.currentPageSize = pageEvent3.pageSize;
    }
    this.isDisable = true;
    this.currentPageIndex3 = pageEvent3.pageIndex;
    this.pageSize3 = pageEvent3.pageSize;
    (this.startingIndex2 = pageEvent3.pageIndex * pageEvent3.pageSize),
      (this.endingIndex2 =
        this.startingIndex1 +
        (pageEvent3.pageSize < pageEvent3.length - this.startingIndex1
          ? pageEvent3.pageSize
          : pageEvent3.length - this.startingIndex1));
    // this.endingIndex1 = this.startingIndex1 + pageEvent1.pageSize;
    this.isDisable = false;
    pageEvent3.previousPageIndex = pageEvent3.pageIndex;

    setTimeout(() => {
      this.alarmList.paginator.length = this.alarmDataLength;
      this.trendlogList.paginator.length = this.trendDataLength;
      this.energylogList.paginator.length = this.energyDataLength;
    });
    if (
      this.endingIndex2 + this.pageSize3 > this.alrmlength &&
      this.alrmlength != this.alarmDataLength &&
      pageEvent3.pageIndex != 0
    ) {
      if (type == "Energy") {
        this.isDisable = true;
        if (this.adhocUtility.energycheckedList) {
          this._util.selectedItems = [];
          this.adhocUtility.energycheckedList.forEach((element) => {
            if (typeof element == "string") {
              this._util.selectedItems.push(element);
            } else {
              this._util.selectedItems.push(element.sid);
            }
          });
          this.model.sidParams = this._util.selectedItems.toString();
          this.model.keyWord = this.adhocUtility.energysaveFilter;
        }
        this.model.filterType = "Energy";
        this.model.pageNumber = Math.round(
          this.energyDataLength / this.energylength
        );
        this._config
          .getEnvLookUpObjects(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data) => {
            //this._util.standard = data.table1
            // setTimeout(() => {
            this.energyStandards = data.table;

            this.energyList = new MatTableDataSource(data.table5);
            this.energyList.data = data.table1.concat(this.energyData);
            this.energyData = this.energyList.data;
            // this.alarmDataLength = data.table2[0].totalCount;
            // this.alrmlength = this.alarmList.data.length;
            this.isShowAlarm = false;
            if (this.energylength > 0) {
              this.energyList.sort = this.sort;
              this.energyList.paginator = this.energyPaginator;
              setTimeout(() => {
                this.energyList.paginator.pageIndex = pageEvent3.pageIndex;
                this.energyList.paginator.length = this.energyDataLength;
                this.trendlogList.paginator.length = this.trendDataLength;
              });
            }
            // if (this.model.DevNum == null || this.model.DevNum == '') {
            //   this.dataLength = data.table1[0].totalCount;
            // }
            this.energyPanel = true;
            if (this.model.app == "lookUpApp") {
              var energytemp = new Array();
              var energytemp2 = new Array();
              this.energyList.data.forEach((l) => {
                if (
                  l["location"] == this.model.location &&
                  l["equipmentName"] == this.model.roomName
                ) {
                  energytemp.push({
                    sid: l["sid"],
                    objName: l["objName"],
                    devInst: l["devInst"],
                    objInst: l["objInst"],
                    descr: l["descr"],
                    propDescr: l["propDescr"],
                    alarmType: l["alarmType"],
                    PointSID: l["sid"],
                    standardID: l["standardID"],
                    standard: l["standard"],
                    checked: true,
                  });
                  energytemp2.push({
                    PointSID: l["sid"],
                    StandardSID:
                      l["standardID"] == undefined ? 0 : l["standardID"],
                  });
                }
              });

              // this.adhocUtility.alrmcheckedList = alrmtemp;
              // this._config.alrmselectedSIDsItems = alrmtemp2;

              this.energyfilter = this.adhocUtility.energysaveFilter;
              if (this.adhocUtility.energycheckedList.length > 0) {
                this.adhocUtility.energycheckedList.forEach((s) => {
                  this.energyList.data.forEach((l) => {
                    if (s.sid == l["sid"]) {
                      l["checked"] = true;
                      return;
                    }
                  });
                });
              }
              if (this.adhocUtility.energycheckedList) {
                // this.energychecked();
              }
            }

            this.showSpinner = false;
          });

        this.isDisable = false;
      }
    }
  }
  getSearchResultsLookUp(lookUpObject) {
    this.showSpinner = true;
    this.standard = [];
    this.length = 0;
    this._config
      .getEnvLookUpObjects(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        //this._util.standard = data.table1
        // setTimeout(() => {
        this.standards = data.table;
        this.alarmStandards = data.table;
        this.energyStandards = data.table;
        const uniqueData = data.table1.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.sid === item.sid)
        );

        // Assign the unique data to data.table
        data.table1 = uniqueData;
        this.trendlogList = new MatTableDataSource(data.table1);
        this.trendlogData = data.table1;
        this.trndlength = this.trendlogList.data.length;

        if (this.trndlength > 0) {
          // this.trendDataLength = data.table2[0].totalCount;
          this.trendlogList.sort = this.trendlogSort;
          this.trendlogList.paginator = this.trendlogPaginator;
          this.trendDataLength = data.table2[0].totalTrendCount;
          if (this.trendlogList.paginator) {
            setTimeout(() => {
              this.trendlogList.paginator.length = this.trendDataLength;
            });
          }
          this.getData(
            {
              pageIndex: this.page,
              pageSize:
                localStorage.getItem("ItemPerPage") != null
                  ? (this.size = +localStorage.getItem("ItemPerPage"))
                  : this.pageSize,
              length: this.trndlength,
            },
            "Trendlog"
          );
        }
        this.trendlogList.data.forEach((s) => (s["checked"] = false));

        this.alarmList = new MatTableDataSource(data.table3);
        this.alarmData = data.table3;
        this.alrmlength = this.alarmList.data.length;

        if (this.alrmlength > 0) {
          this.isShowAlarm = false;
          this.alarmList.sort = this.sort;
          this.alarmList.paginator = this.paginator;
          this.alarmDataLength = data.table4[0].totalAlarmCount;
          if (this.alarmList.paginator) {
            setTimeout(() => {
              this.alarmList.paginator.length = this.alarmDataLength;
            });
          }
          this.getData1(
            {
              pageIndex: this.page1,
              pageSize:
                localStorage.getItem("ItemPerPage") != null
                  ? (this.size = +localStorage.getItem("ItemPerPage"))
                  : this.pageSize1,
              length: this.alrmlength,
            },
            "Alarm"
          );
        } else {
          this.isShowAlarm = true;
        }
        this.energyList = new MatTableDataSource(data.table5);
        this.energyData = data.table5;
        this.energylength = this.energyList.data.length;

        if (this.energylength > 0) {
          this.isShowAlarm = false;
          this.energyList.sort = this.sort;
          this.energyList.paginator = this.energyPaginator;
          this.energyDataLength = data.table6[0].totalEnergyCount;
          if (this.energyList.paginator) {
            setTimeout(() => {
              this.energyList.paginator.length = this.energyDataLength;
            });
          }
          this.getData3(
            {
              pageIndex: this.page1,
              pageSize:
                localStorage.getItem("ItemPerPage") != null
                  ? (this.size = +localStorage.getItem("ItemPerPage"))
                  : this.pageSize3,
              length: this.energylength,
            },
            "Energy"
          );
        } else {
          this.isShowAlarm = true;
        }
        this.energyList.data.forEach((s) => (s["checked"] = false));

        if (
          this.trndlength > 0 &&
          this.alarmLength > 0 &&
          this.energylength > 0
        ) {
          this.isShowBoth = true;
        } else {
          this.isShowBoth = false;
        }
        if (this.trndlength > 0 && this.alarmLength == 0) {
          this.isShowTrends = true;
        } else {
          this.isShowTrends = false;
        }
        this.trendlogPanel = true;
        this.alarmList.data.forEach((s) => (s["checked"] = false));
        // this.trendlogPanel = true;
        // });

        if (this._util.showLocationBack) {
          if (this.isShowBoth) {
            this.classType =
              this.selectedLocationsItems.length > 0
                ? this.selectedLocationsItems[0].itemName
                : "";
            if (!this.location) {
              this.selectedEnvLocationsItems = [];
              this.onAddEnvLocItem(this.selectedLocationsItems[0].itemName);
            }
          }
          if (this.isShowAlarm) {
            if (
              this._util.locationObject.classType !=
              this.selectedLocationsItems[0].itemName
            ) {
              let msgTitle = "info";
              let msgBody =
                "Can't Switch to " +
                this._util.locationObject.classType +
                " to " +
                this.selectedLocationsItems[0].itemName;
              this._util.warningCommonDialog(msgBody, msgTitle);
              this.classType = this._util.locationObject.classType;
              this.model.classType = this._util.locationObject.classType;
              this.selectedLocationsItems = [];
              this.selectedLocationsItems.push({
                id: this._util.locationObject.classTypeID,
                itemName: this.classType,
              });
              this.getSearchResultsLookUp(this.model);
            }
          }
        }

        if (this.model.app == "lookUpApp") {
          var temp = new Array();
          var temp2 = new Array();
          this.trendlogList.data.forEach((l) => {
            if (
              l["location"] == this.model.location &&
              l["roomName"] == this.model.roomName
            ) {
              temp.push({
                sid: l["sid"],
                trendlogName: l["trendlogName"],
                logInst: l["logInst"],
                logDevNum: l["logDevNum"],
                logDescription: l["logDescription"],
                engineeringUnit: l["engineeringUnit"],
                PointSID: l["sid"],
                standardID: l["standardID"],
                standard: l["standard"],
                checked: true,
              });
              temp2.push({
                PointSID: l["sid"],
                StandardSID: parseInt(l["standardID"]),
              });
            }
          });

          this.adhocUtility.trndcheckedList = temp;
          this._config.selectedSIDsItems = temp2;
        }
        if (this.alrmlength > 0) {
          var alrmtemp = new Array();
          var alrmtemp2 = new Array();
          this.alarmList.data.forEach((l) => {
            if (
              l["location"] == this.model.location &&
              l["roomName"] == this.model.roomName
            ) {
              alrmtemp.push({
                sid: l["sid"],
                objName: l["objName"],
                devInst: l["devInst"],
                objInst: l["objInst"],
                descr: l["descr"],
                propDescr: l["propDescr"],
                alarmType: l["alarmType"],
                PointSID: l["sid"],
                standardID: l["standardID"],
                standard: l["standard"],
                checked: true,
              });
              alrmtemp2.push({
                PointSID: l["sid"],
                StandardSID: l["standardID"] == undefined ? 0 : l["standardID"],
              });
            }
          });

          this.adhocUtility.alrmcheckedList = alrmtemp;
          this._config.alrmselectedSIDsItems = alrmtemp2;
          if (this.adhocUtility.alrmcheckedList.length > 0) {
            this.adhocUtility.alrmcheckedList.forEach((s) => {
              this.alarmList.data.forEach((l) => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          if (this.adhocUtility.alrmcheckedList) {
            this.alrmchecked();
          }
        }
        if (this.energylength > 0) {
          var energytemp = new Array();
          var energytemp2 = new Array();
          this.energyList.data.forEach((l) => {
            if (
              l["location"] == this.model.location &&
              l["equipmentName"] == this.model.eqpName
            ) {
              energytemp.push({
                sid: l["sid"],
                objName: l["objName"],
                logDevNum: l["logDevNum"],
                logInst: l["logInst"],
                logDescription: l["logDescription"],
                alarmType: l["alarmType"],
                standardID: l["standardID"],
                standard: l["standard"],
                checked: true,
              });
              energytemp2.push({
                PointSID: l["sid"],
                StandardSID: l["standardID"] == undefined ? 0 : l["standardID"],
              });
            }
          });

          this.adhocUtility.energycheckedList = energytemp;
          this._config.energyselectedSIDsItems = energytemp2;
          if (this.adhocUtility.energycheckedList.length > 0) {
            this.adhocUtility.energycheckedList.forEach((s) => {
              this.energyList.data.forEach((l) => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          if (this.adhocUtility.energycheckedList) {
            this.energychecked();
          }
        }

        // this.filter = this.adhocUtility.saveFilter;
        if (this.adhocUtility.trndcheckedList.length > 0) {
          this.adhocUtility.trndcheckedList.forEach((s) => {
            this.trendlogList.data.forEach((l) => {
              if (s.sid == l["sid"]) {
                l["checked"] = true;
                return;
              } else {
                l["standardID"] = "";
              }
            });
          });
        }
        if (this.adhocUtility.trndcheckedList) {
          this.checked();
        }
        this.showSpinner = false;
      });
  }

  getSearchResultsLookUpfilterByAlarm(lookUpObject) {
    this.showSpinner = true;
    this.standard = [];
    this.length = 0;
    this._config
      .getEnvLookUpObjects(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        //this._util.standard = data.table1
        // setTimeout(() => {
        this.alarmStandards = data.table;
        const uniqueData = data.table1.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.sid === item.sid)
        );

        // Assign the unique data to data.table
        data.table1 = uniqueData;
        this.alarmList = new MatTableDataSource(data.table3);
        this.alarmDataLength = data.table4[0].totalAlarmCount;
        if (this.trendlogList.paginator) {
          setTimeout(() => {
            this.alarmList.paginator.length = this.alarmDataLength;
          });
        }
        this.alrmlength = this.alarmList.data.length;
        this.isShowAlarm = false;
        if (this.alrmlength > 0) {
          this.alarmList.sort = this.sort;
          this.alarmList.paginator = this.paginator;
          this.getData1(
            {
              pageIndex: this.page1,
              pageSize:
                localStorage.getItem("ItemPerPage") != null
                  ? (this.size = +localStorage.getItem("ItemPerPage"))
                  : this.pageSize1,
              length: this.alrmlength,
            },
            "Alarm"
          );
          this.alarmList.data.forEach((s) => (s["checked"] = false));
        }
        // if (this.model.DevNum == null || this.model.DevNum == '') {
        //   this.dataLength = data.table1[0].totalCount;
        // }
        this.alarmPanel = true;
        if (this.alrmlength > 0) {
          var alrmtemp = new Array();
          var alrmtemp2 = new Array();
          this.alarmList.data.forEach((l) => {
            if (
              l["location"] == this.model.location &&
              l["roomName"] == this.model.roomName
            ) {
              alrmtemp.push({
                sid: l["sid"],
                objName: l["objName"],
                devInst: l["devInst"],
                objInst: l["objInst"],
                descr: l["descr"],
                propDescr: l["propDescr"],
                alarmType: l["alarmType"],
                checked: true,
              });
              alrmtemp2.push({
                PointSID: l["sid"],
                StandardSID: l["standardID"] == undefined ? 0 : l["standardID"],
              });
            }
          });

          // this.adhocUtility.alrmcheckedList = alrmtemp;
          // this._config.alrmselectedSIDsItems = alrmtemp2;

          this.alrmfilter = this.adhocUtility.alrmsaveFilter;
          if (this.adhocUtility.alrmcheckedList.length > 0) {
            this.adhocUtility.alrmcheckedList.forEach((s) => {
              this.alarmList.data.forEach((l) => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                } else {
                  l["standardID"] = "";
                }
              });
            });
          } else {
            this.alarmList.data.forEach((l) => {
              l["standardID"] = "";
            });
          }
          if (this.adhocUtility.alrmcheckedList) {
            this.alrmchecked();
          }
        }

        this.showSpinner = false;
      });
  }
  getSearchResultsLookUpfilterByTrend(lookUpObject) {
    this.showSpinner = true;
    this.standard = [];
    this.length = 0;
    this._config
      .getEnvLookUpObjects(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        //this._util.standard = data.table1
        // setTimeout(() => {
        this.standards = data.table;
        const uniqueData = data.table1.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.sid === item.sid)
        );

        // Assign the unique data to data.table
        data.table1 = uniqueData;

        this.trendlogList = new MatTableDataSource(data.table1);
        this.trendlogData = data.table1;
        this.trendDataLength = data.table2[0].totalTrendCount;
        setTimeout(() => {
          this.trendlogList.paginator.length = this.trendDataLength;
          this.alarmList.paginator.length = this.alarmDataLength;
        });
        this.trndlength = this.trendlogList.data.length;
        // if (this.model.DevNum == null || this.model.DevNum == '') {
        //   this.dataLength = data.table1[].totalCount;
        // }
        this.getData(
          {
            pageIndex: this.page,
            pageSize:
              localStorage.getItem("ItemPerPage") != null
                ? (this.pageSize = +localStorage.getItem("ItemPerPage"))
                : this.size,
            length: this.trndlength,
          },
          "Trendlog"
        );
        this.trendlogList.sort = this.trendlogSort;
        this.trendlogList.paginator = this.trendlogPaginator;
        // if (this.model.DevNum == null || this.model.DevNum == '') {
        //   this.dataLength = data.table1[0].totalCount;
        // }
        this.trendlogList.data.forEach((s) => (s["checked"] = false));
        this.trendlogPanel = true;
        this.alarmPanel = false;
        if (this.model.app == "lookUpApp") {
          var temp = new Array();
          var temp2 = new Array();
          this.trendlogList.data.forEach((l) => {
            if (
              l["location"] == this.model.location &&
              l["roomName"] == this.model.roomName
            ) {
              temp.push({
                sid: l["sid"],
                trendlogName: l["trendlogName"],
                logInst: l["logInst"],
                logDevNum: l["logDevNum"],
                logDescription: l["logDescription"],
                engineeringUnit: l["engineeringUnit"],
                PointSID: l["sid"],
                standardID: l["standardID"],
                standard: l["standard"],
                checked: true,
              });
              temp2.push({
                PointSID: l["sid"],
                StandardSID: parseInt(l["standardID"]),
              });
            }
          });
          this.trndfilter = this.adhocUtility.trndsaveFilter;
          if (this.adhocUtility.trndcheckedList.length > 0) {
            this.adhocUtility.trndcheckedList.forEach((s) => {
              this.trendlogList.data.forEach((l) => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                } else {
                  l["standardID"] = "";
                }
              });
            });
          } else {
            this.trendlogList.data.forEach((l) => {
              l["standardID"] = "";
            });
          }
          if (this.adhocUtility.trndcheckedList.length > 0) {
            this.checked();
          }
          // this.adhocUtility.trndcheckedList = temp;
          // this._config.selectedSIDsItems = temp2;
        }

        this.showSpinner = false;
      });
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.trendlogList.filter = filterValue;
  }

  clearSelection() {
    this.trendlogList.data.filter((g) => {
      g["checked"] = false;
      return true;
    });

    this.adhocUtility.trndcheckedList.forEach((s) => {
      this.trendlogList.data.forEach((l) => {
        if (s["sid"] == l["sid"]) {
          l["standardID"] = "none";
          return;
        }
      });
    });

    this.adhocUtility.trndcheckedList = [];
    this.adhocUtility.checkNames = [];
    this._config.selectedSIDsItems = [];
    if(this.adhocUtility.trndcheckedList.length > 0 ||
      this.adhocUtility.alrmcheckedList.length > 0 ||
      this.adhocUtility.energycheckedList.length > 0)
      {
        this._util.saveDisable = false;
      }
    else
    {
        this._util.saveDisable = true;
    }
  }

  checked() {
    this.tempAray = [];
    this.tempAray = this.trendlogList.data;
    if (this.adhocUtility.trndcheckedList.length > 0) {
      this.adhocUtility.trndcheckedList.forEach((s) => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.trendlogList.data.splice(i, 1);
            return;
          }
        });
      });
      let trendDisabled = false;
      let alarmDisabled = false;
      let energyDisabled = false;
      if (!this.isShowAlarm) {
        if (
          this.adhocUtility.trndcheckedList.length > 0 &&
          this.adhocUtility.alrmcheckedList.length > 0
        ) {
          for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
            if (
              this.adhocUtility.trndcheckedList[i].standardID == null ||
              this.adhocUtility.trndcheckedList[i].standardID == "none" ||
              this.adhocUtility.trndcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              trendDisabled = true;
              this.isDisabledd = true;
              break;
            } else {
              this.standardCount = 0;
              trendDisabled = false;
              this._util.saveDisable = false;
            }
          }
          for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
            if (
              this.adhocUtility.alrmcheckedList[i].standardID == null ||
              this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
              this.adhocUtility.alrmcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              alarmDisabled = true;
              // this.isDisabledd = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
              alarmDisabled = false;
            }
          }
          for (var i = 0; i < this.adhocUtility.energycheckedList.length; i++) {
            if (
              this.adhocUtility.energycheckedList[i].standardID == null ||
              this.adhocUtility.energycheckedList[i].standardID == "none" ||
              this.adhocUtility.energycheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              energyDisabled = true;
              // this.isDisabledd = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
              energyDisabled = false;
            }
          }
        } else {
          this._util.saveDisable = false;
        }
      } else {
        if (this.adhocUtility.trndcheckedList.length > 0) {
          for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
            if (
              this.adhocUtility.trndcheckedList[i].standardID == null ||
              this.adhocUtility.trndcheckedList[i].standardID == "none" ||
              this.adhocUtility.trndcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
            }
          }
        } else {
          this._util.saveDisable = true;
        }
      }
      if (trendDisabled) {
        this._util.saveDisable = true;
      }
    }
    // if(this._config.selectedSIDsItems){
    //   this.adhocUtility.trndcheckedList.forEach(data => {
    //     if(this.adhocUtility.trndcheckedList["sid"] == this.lookUpConfig.selectedSIDsItems["PointSID"])
    //     this.adhocUtility.trndcheckedList["standardID"] = this.lookUpConfig.selectedSIDsItems["standardID"]
    //   })
    // }
    this.tempAray1 = this.trendlogList.data.concat(
      this.adhocUtility.trndcheckedList
    );
    this.trendlogList.data = this.tempAray1.map((x) => Object.assign({}, x));
    this.sortProperty = "checked";
    this.sortDirection = "desc";
    if (this.trendlogList.sort) {
      this.trendlogList.sort.active =
        this.trendlogList.sort.active != "checked" ? "checked" : "checked";
      this.trendlogList.sort.direction = "desc";
    }

    if (this.trendlogList.paginator) {
      this.trendlogList.paginator.firstPage();
      setTimeout(() => {
        this.trendlogList.paginator.length = this.trendDataLength;
        this.alarmList.paginator.length = this.alarmDataLength;
      });
    }

    //this.onChange(newValue,obj)
  }

  alrmapplyFilter(filterValue: string, event) {
    const tempsid = [];
    //filterValue = filterValue.trim(); // Remove whitespace
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }
    if (this.adhocUtility.alrmcheckedList) {
      this._util.selectedItems = [];
      this.adhocUtility.alrmcheckedList.forEach((element) => {
        if (typeof element == "string") {
          this._util.selectedItems.push(element);
        } else {
          this._util.selectedItems.push(element.sid);
        }
      });
      this.model.sidParams = this._util.selectedItems.toString();
    }

    let temp = filterValue;
    temp = temp.trim();
    // temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.alarmList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.alrmsaveFilter = temp;
    if (this.model.app == "lookUpApp") {
      if (this.adhocUtility.alrmcheckedList) {
        this.adhocUtility.alrmcheckedList.forEach((element) => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      this.model.objectType = "Alarm";
      this.model.filterType = "Alarm";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = "lookUpApp";
      this.model.appId = this._util.appID;
      this.model.roomName = this.roomname;
      this.model.classType = this.classType;
      this.model.regfiltertype = this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.model.location = this.location;
      this.model.keyWord = temp == "" ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUpfilterByAlarm(this.model);
    } else {
      this.model.objectType = "Alarm";
      this.model.filterType = "Alarm";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.appId = this._util.appID;
      this.model.roomName = this.roomname;
      this.model.classType = this.classType;
      this.model.regfiltertype = this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.model.location = this.location;
      this.model.keyWord = temp == "" ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUpfilterByAlarm(this.model);
    }
  }

  alrmfilterByKey(filterValue: string, event) {
    const tempsid = [];
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }

    let temp = filterValue;
    temp = temp.trim();
    temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.alarmList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.alrmsaveFilter = temp;
    if (this.adhocUtility.alrmcheckedList) {
      this._util.selectedItems = [];
      this.adhocUtility.alrmcheckedList.forEach((element) => {
        if (typeof element == "string") {
          this._util.selectedItems.push(element);
        } else {
          this._util.selectedItems.push(element.sid);
        }
      });
      this.model.sidParams = this._util.selectedItems.toString();
    }
    if (this.model.app == "lookUpApp") {
      if (this.adhocUtility.alrmcheckedList) {
        this.adhocUtility.alrmcheckedList.forEach((element) => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      if (
        (this.alarmList.filteredData.length > 0 ||
          this.alarmList.filteredData.length == 0) &&
        temp == "" &&
        event.keyCode === 8
      ) {
        this.model.objectType = "Alarm";
        this.model.filterType = "Alarm";
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.app = "lookUpApp";
        this.model.appId = this._util.appID;
        this.model.roomName = this.roomname;
        this.model.classType = this.classType;
        this.model.regfiltertype = this.selectedLocation.profile;
        this.model.ProfileSID = this.selectedLocation.id;
        this.model.location = this.location;
        this.model.pageNumber = 1;
        this.model.keyWord = temp == "" ? null : temp;
        this.getSearchResultsLookUpfilterByAlarm(this.model);
      }
    } else {
      if (
        (this.alarmList.filteredData.length > 0 ||
          this.alarmList.filteredData.length == 0) &&
        temp == "" &&
        event.keyCode === 8
      ) {
        this.model.objectType = "Alarm";
        this.model.filterType = "Alarm";
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.appId = this._util.appID;
        this.model.roomName = this.roomname;
        this.model.classType = this.classType;
        this.model.regfiltertype = this.selectedLocation.profile;
        this.model.ProfileSID = this.selectedLocation.id;
        this.model.location = this.location;
        this.model.pageNumber = 1;
        this.model.keyWord = temp == "" ? null : temp;
        this.getSearchResultsLookUpfilterByAlarm(this.model);
      }
    }
  }

  alrmapplyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.trendlogList.filter = filterValue;
  }
  alrmfindIndexToUpdate(obj) {
    return obj.sid === this;
  }
  alrmfindIndexToUpdate1(obj) {
    return obj.logDescription + obj.trendlogName === this;
  }
  alrmfindIndexToUpdate2(obj) {
    return obj.descr + obj.objName === this;
  }
  checkedState(obj, evt) {
    if (this.model.app === "lookUpApp" && !this._config.madateValidate) {
      this.updateCheckedLists(obj);

      this._util.selectedItems = this.adhocUtility.trndcheckedList;

      if (obj.checked) {
        this.addSelectedSID(obj);
      } else {
        this.removeSelectedSID(obj);
        obj.standardID = "none";
      }

      this.checkSaveDisableState();
    } else if (this.model.app !== "lookUpApp") {
      this.updateCheckedLists(obj);

      this._util.selectedItems = this.adhocUtility.trndcheckedList;

      if (obj.checked) {
        this.addSelectedSID(obj);
      } else {
        this.removeSelectedSID(obj);
        obj.standardID = "none";
      }

      this.checkSaveDisableState();
    } else {
      this.showMandatoryFieldWarning(obj, evt);
    }
  }

  updateCheckedLists(obj) {
    const updateItem = this.adhocUtility.trndcheckedList.find(this.findIndexToUpdate, obj.sid);
    const updateObjName = this.findUpdateObjName(obj);

    this.index1 = this.adhocUtility.alrmcheckNames.indexOf(updateObjName);

    this.toggleItemInList(this.adhocUtility.trndcheckedList, updateItem, obj);
    this.toggleItemInList(this.adhocUtility.alrmcheckNames, updateObjName, obj);
  }

  findUpdateObjName(obj) {
    if (this.model.objectType === "Trendlog") {
      return this.adhocUtility.alrmcheckNames.find(this.findIndexToUpdate1, obj.logDescription + obj.trendlogName);
    } else {
      return this.adhocUtility.alrmcheckNames.find(this.findIndexToUpdate2, obj.descr + obj.objName);
    }
  }


  toggleItemInList(list, item, obj) {
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(obj);
    }
  }

  addSelectedSID(obj) {
    this.tempObj = {
      PointSID: obj.sid,
      StandardSID: obj.standardID ?? 0,
    };
    this._config.selectedSIDsItems.push(this.tempObj);
  }

  removeSelectedSID(obj) {
    const foundIndex = this._config.selectedSIDsItems.findIndex(element => element.PointSID === obj.sid);
    if (foundIndex !== -1) {
      this._config.selectedSIDsItems.splice(foundIndex, 1);
    }
  }

  checkSaveDisableState() {
    const trendDisabled = this.checkStandardID(this.adhocUtility.trndcheckedList);
    const alarmDisabled = this.checkStandardID(this.adhocUtility.alrmcheckedList);
    const energyDisabled = this.checkStandardID(this.adhocUtility.energycheckedList);

    this._util.saveDisable = trendDisabled || alarmDisabled || energyDisabled ||
    (this.adhocUtility.trndcheckedList.length === 0 &&
     this.adhocUtility.alrmcheckedList.length === 0 &&
     this.adhocUtility.energycheckedList.length === 0);
  }

  checkStandardID(list) {
    for (const item of list) {
      if (!item.standardID || item.standardID === "none" || item.standardID === "") {
        this.standardCount++;
        return true;
      }
    }
    this.standardCount = 0;
    return false;
  }

  showMandatoryFieldWarning(obj, evt) {
    obj.checked = false;
    evt.source.checked = false;
    const msgTitle = "Info";
    const msgBody = "Provide All mandatory fields first";
    this._util.warningCommonDialog(msgBody, msgTitle);
  }

  onChange(newValue, obj, isEdit4: boolean = false) {
    if(obj.checked == false)
    {
      newValue.source.value = 'none'
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: "",
          message:
            "Please Check the Check Box",
          action: "Warning",
          title: "Info",
        },
      });
      return;
    }
    else
    {
      console.log(newValue);
    obj.standardID = newValue.source.value;
    console.log(this.adhocUtility.trndcheckedList.standardID);
    if (this._util.showLocationBack) {

      this.saveDisable = false;

    }


    if (this.adhocUtility.trndcheckedList.length > 0) {
      this.adhocUtility.trndcheckedList.forEach((data) => {
        if (obj.sid == data.sid) {
          this.adhocUtility.trndcheckedList.standardID = +newValue.source.value;
        }
      });
    }
    // this.trendlogList.data.forEach(data => {
    //     if(obj.sid == data["sid"]){
    //       data["standardID"] = newValue.target.value;
    //       console.log(data);
    //       this.trendlogList.data["standardID"] = newValue.target.value;
    //     }
    // });
    this.adhocUtility.trndcheckedList.forEach((element) => {
      if (element.sid == obj.sid) {
        element.standardID =
          newValue.source == undefined ? 0 : newValue.source.value;
        return;
      }
    });
    let alarmDisabled = false;
    let trendDisabled = false;
    let energyDisabled = false;
    this.loopLength =
      this.adhocUtility.alrmcheckedList.length >=
      this.adhocUtility.trndcheckedList.length
        ? this.adhocUtility.alrmcheckedList.length
        : this.adhocUtility.trndcheckedList.length;
    if (!this.isShowAlarm) {
      if (
        this.adhocUtility.trndcheckedList.length > 0 &&
        this.adhocUtility.alrmcheckedList.length > 0
      ) {
        for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
          if (
            this.adhocUtility.trndcheckedList[i].standardID == null ||
            this.adhocUtility.trndcheckedList[i].standardID == "none" ||
            this.adhocUtility.trndcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            trendDisabled = true;
            this.isDisabledd = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            trendDisabled = false;
          }
        }
        for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
          if (
            this.adhocUtility.alrmcheckedList[i].standardID == null ||
            this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
            this.adhocUtility.alrmcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            alarmDisabled = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            alarmDisabled = false;
          }
        }
        for (var i = 0; i < this.adhocUtility.energycheckedList.length; i++) {
          if (
            this.adhocUtility.energycheckedList[i].standardID == null ||
            this.adhocUtility.energycheckedList[i].standardID == "none" ||
            this.adhocUtility.energycheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            energyDisabled = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            energyDisabled = false;
          }
        }
      } else {
        this._util.saveDisable = false;
      }
    } else {
      if (this.adhocUtility.trndcheckedList.length > 0) {
        for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
          if (
            this.adhocUtility.trndcheckedList[i].standardID == null ||
            this.adhocUtility.trndcheckedList[i].standardID == "" ||
            this.adhocUtility.trndcheckedList[i].standardID == "none"
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
          }
        }
      } else {
        this._util.saveDisable = false;
      }
    }
    if (trendDisabled) {
      this._util.saveDisable = true;
    }

    if (this._config.selectedSIDsItems.length == 0) {
      this.tempObj = {
        PointSID: obj.sid,
        StandardSID: newValue.source == undefined ? 0 : newValue.source.value,
      };
      this._config.selectedStandardsItems.push(this.tempObj);
    } else {
      this._config.selectedSIDsItems.forEach((element) => {
        if (element.PointSID == obj.sid) {
          element.StandardSID =
            newValue.source == undefined ? 0 : newValue.source.value;
          return;
        }
      });
    }
    }

  }
  alarmOnChange(newValue, obj, isEdit3: boolean = false) {
    if(obj.checked == false)
    {
      newValue.source.value = 'none'
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: "",
          message:
            "Please Check the Check Box",
          action: "Warning",
          title: "Info",
        },
      });
      return;
    }
    else
    {
      console.log(newValue);
    obj.standardID = newValue.source.value;
    if (this._util.showLocationBack) {

      this.saveDisable = false;
    }

    if (this.adhocUtility.alrmcheckedList.length > 0) {
      this.adhocUtility.alrmcheckedList.forEach((data) => {
        if (obj.sid == data.sid) {
          this.adhocUtility.alrmcheckedList.standardID = +newValue.source.value;
        }
      });
    }
    // this.trendlogList.data.forEach(data => {
    //     if(obj.sid == data["sid"]){
    //       data["standardID"] = newValue.target.value;
    //       console.log(data);
    //       this.trendlogList.data["standardID"] = newValue.target.value;
    //     }
    // });
    this.adhocUtility.alrmcheckedList.forEach((element) => {
      if (element.sid == obj.sid) {
        element.standardID =
          newValue.source == undefined ? 0 : newValue.source.value;
        return;
      }
    });
    let alarmDisabled = false;
    let trendDisabled = false;
    let energyDisabled = false;
    this.loopLength =
      this.adhocUtility.alrmcheckedList.length >=
      this.adhocUtility.trndcheckedList.length
        ? this.adhocUtility.alrmcheckedList.length
        : this.adhocUtility.trndcheckedList.length;
    if (!this.isShowAlarm) {
      if (
        this.adhocUtility.trndcheckedList.length > 0 &&
        this.adhocUtility.alrmcheckedList.length > 0
      ) {
        for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
          if (
            this.adhocUtility.trndcheckedList[i].standardID == null ||
            this.adhocUtility.trndcheckedList[i].standardID == "none" ||
            this.adhocUtility.trndcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            trendDisabled = true;
            this.isDisabledd = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            trendDisabled = false;
          }
        }
        for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
          if (
            this.adhocUtility.alrmcheckedList[i].standardID == null ||
            this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
            this.adhocUtility.alrmcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            alarmDisabled = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            alarmDisabled = false;
          }
        }
      } else {
        this._util.saveDisable = false;
      }
    } else {
      if (this.adhocUtility.alrmcheckedList.length > 0) {
        for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
          if (
            this.adhocUtility.alrmcheckedList[i].standardID == null ||
            this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
            this.adhocUtility.alrmcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
          }
        }
      } else {
        this._util.saveDisable = false;
      }
    }
    if (alarmDisabled) {
      this._util.saveDisable = true;
    }

    if (this._config.alrmselectedSIDsItems.length == 0) {
      this.tempObj = {
        PointSID: obj.sid,
        StandardSID: newValue.source == undefined ? 0 : newValue.source.value,
      };
      this._config.alrmselectedSIDsItems.push(this.tempObj);
    } else {
      this._config.alrmselectedSIDsItems.forEach((element) => {
        if (element.PointSID == obj.sid) {
          element.StandardSID =
            newValue.source == undefined ? 0 : newValue.source.value;
          return;
        }
      });
    }
    }

  }
  findIndexToUpdate(obj) {
    return obj.sid === this;
  }
  findIndexToUpdate1(obj) {
    return obj.logDescription + obj.trendlogName === this;
  }
  findIndexToUpdate2(obj) {
    return obj.descr + obj.objName === this;
  }
  alrmclearSelection() {
    this.alarmList.data.filter((g) => {
      g["checked"] = false;
      return true;
    });
    this.adhocUtility.alrmcheckedList.forEach((s) => {
      this.alarmList.data.forEach((l) => {
        if (s["sid"] == l["sid"]) {
          l["standardID"] = "none";
          return;
        }
      });
    });
    this.adhocUtility.alrmcheckedList = [];
    this.adhocUtility.checkNames = [];
    this._config.alrmselectedSIDsItems = [];
    if(this.adhocUtility.trndcheckedList.length > 0 ||
      this.adhocUtility.alrmcheckedList.length > 0 ||
      this.adhocUtility.energycheckedList.length > 0)
      {
        this._util.saveDisable = false;
      }
    else
    {
        this._util.saveDisable = true;
    }
  }

  alrmcheckedState(obj, evt) {
    if (this.model.app === "lookUpApp") {
      if (!this._config.madateValidate) {
        this.alrmUpdateCheckedLists(obj);
        this.alrmHandleAlarmSelection(obj);
        this.alrmCheckSaveDisableState(this.adhocUtility.alrmcheckedList);
      } else {
        this.alrmHandleMandatoryFieldWarning(obj, evt);
      }
    } else {
      this.alrmUpdateCheckedLists(obj);
      this.alrmHandleAlarmSelection(obj);
      this.alrmCheckSaveDisableState(this.adhocUtility.alrmcheckedList);
    }
  }

  alrmUpdateCheckedLists(obj) {
    const updateItem = this.adhocUtility.alrmcheckedList.find(item => item.sid === obj.sid);
    const updateObjName = this.alrmFindUpdateObjName(obj);
    this.index1 = this.adhocUtility.alrmcheckNames.indexOf(updateObjName);

    this.alrmToggleItemInList(this.adhocUtility.alrmcheckedList, updateItem, obj);
    this.alrmToggleItemInList(this.adhocUtility.alrmcheckNames, updateObjName, obj);
  }

  alrmFindUpdateObjName(obj) {
    if (this.model.objectType === "Alarm") {
      return this.adhocUtility.alrmcheckNames.find(item => item.descr === obj.descr && item.objName === obj.objName);
    } else {
      return this.adhocUtility.alrmcheckNames.find(item => item.logDescription === obj.logDescription && item.trendlogName === obj.trendlogName);
    }
  }

  alrmToggleItemInList(list, item, obj) {
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(obj);
    }
  }

  alrmHandleAlarmSelection(obj) {
    this._util.selectedItems = this.adhocUtility.alrmcheckedList;

    if (obj.checked) {
      this.alrmAddSelectedSID(obj, this._config.alrmselectedSIDsItems);
    } else {
      this.alrmRemoveSelectedSID(obj, this._config.alrmselectedSIDsItems);
      obj.standardID = "none";
    }
  }

  alrmAddSelectedSID(obj, selectedSIDsItems) {
    const tempObj = {
      PointSID: obj.sid,
      StandardSID: obj.standardID ?? 0,
    };
    selectedSIDsItems.push(tempObj);
  }

  alrmRemoveSelectedSID(obj, selectedSIDsItems) {
    const foundIndex = selectedSIDsItems.findIndex(element => element.PointSID === obj.sid);
    if (foundIndex !== -1) {
      selectedSIDsItems.splice(foundIndex, 1);
    }
  }

  alrmCheckSaveDisableState(checkedList) {
    // const disabled = this.alrmCheckStandardID(checkedList);
    // this._util.saveDisable = disabled || checkedList.length === 0;

    const trendDisabled = this.checkStandardID(this.adhocUtility.trndcheckedList);
    const alarmDisabled = this.checkStandardID(this.adhocUtility.alrmcheckedList);
    const energyDisabled = this.checkStandardID(this.adhocUtility.energycheckedList);

    this._util.saveDisable = trendDisabled || alarmDisabled || energyDisabled ||
    (this.adhocUtility.trndcheckedList.length === 0 &&
     this.adhocUtility.alrmcheckedList.length === 0 &&
     this.adhocUtility.energycheckedList.length === 0);
  }

  alrmCheckStandardID(list) {
    for (const item of list) {
      if (!item.standardID || item.standardID === "none" || item.standardID === "") {
        this.standardCount++;
        return true;
      }
    }
    this.standardCount = 0;
    return false;
  }

  alrmHandleMandatoryFieldWarning(obj, evt) {
    obj.checked = false;
    evt.source.checked = false;
    const msgTitle = "Info";
    const msgBody = "Provide All mandatory fields first";
    this._util.warningCommonDialog(msgBody, msgTitle);
  }

  onSubmit() {
    ////console.log(this.form.value);
    // this.locationObj.Site = this.form.value.site; //"Lmi";
    // this.locationObj.Location = this.form.value.location; //"Service Room";
    // this.locationObj.PointType = this.form.value.pointtype; //"trend";
    // this.locationObj.PointSID = this.form.value.pointSID; //212;
    // this.locationObj.StandardSID = this.form.value.standardID; //11.09;
    let tenantId = "1";
    ////console.log('--------',this.locationObj);
    this._config
      .addCriticalEnvLocation(this.locationObj, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this._util.showLocation = false;
          const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
          this._route.navigateByUrl(appCrEnvRoute);
        },
        (error) => {
          console.log(error);
          this._util.showLocation = false;
          const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
          this._route.navigateByUrl(appCrEnvRoute);
        }
      );
  }
  goBack() {
    this._util.showLocation = false;
    const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
    this._route.navigateByUrl(appCrEnvRoute);
  }

  getPointDesc(pointType) {
    this.dropdownSIDsList = [];

    this._config
      .getPointSID(pointType, this._util.tenantID, "")
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.pointSids = data;
          //console.log(data, "-------", this.pointSids);
          if (pointType == "Trendlog") {
            this.pointSids.forEach((element) => {
              this.dropdownSIDsList.push({
                id: element["sid"],
                itemName:
                  element["logDevNum"] +
                  " - " +
                  element["logInst"] +
                  " - " +
                  element["objName"] +
                  " - " +
                  element["logDescription"],
              });
            });
          } else {
            this.pointSids.forEach((element) => {
              this.dropdownSIDsList.push({
                id: element["sid"],
                itemName:
                  element["logDevNum"] +
                  " - " +
                  element["objName"] +
                  " - " +
                  element["logDescription"],
              });
            });
          }
        },
        (error) => {
          //console.log(error);
        }
      );
  }

  getStandardSid(isEdit: boolean = false) {
    this.selectedStandardsItems = [];
    this.dropdownStandardsList = [];

    this._config
      .getEnvStandardSID(
        this._util.appID,
        this._util.tenantID,
        this.selectedLocationsItems[0]?.itemName,
        this.selectedLocation.id
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.standardSIDs = data;

          this.standardSIDs.forEach((element) => {
            if (
              element.criteria == "IsLessThan" ||
              element.criteria == "IsLessThanEqualTo" ||
              element.criteria == "IsNotEqualTo" ||
              element.criteria == "IsEqualTo"
            ) {
              this.dropdownStandardsList.push({
                id: element["sid"],
                itemName:
                  element["regulation"] +
                  " : " +
                  element["facetName"] +
                  " : " +
                  element["criteria"] +
                  " (is) " +
                  element["acceptableLow"],
              });
            }
            if (
              element.criteria == "IsGreaterThan" ||
              element.criteria == "IsGreaterThanEqualTo"
            ) {
              this.dropdownStandardsList.push({
                id: element["sid"],
                itemName:
                  element["regulation"] +
                  " : " +
                  element["facetName"] +
                  " : " +
                  element["criteria"] +
                  " (is) " +
                  element["acceptableHigh"],
              });
            }
            if (
              element.criteria == "IsBetween" ||
              element.criteria == "IsNotInBetween"
            ) {
              this.dropdownStandardsList.push({
                id: element["sid"],
                itemName:
                  element["regulation"] +
                  " : " +
                  element["facetName"] +
                  " : " +
                  element["criteria"] +
                  " (is) " +
                  "[" +
                  element["acceptableLow"] +
                  " - " +
                  element["acceptableHigh"] +
                  "]",
              });
            }
            if (element.criteria == "" || element.criteria == null || element.criteria == "NA") {
              this.dropdownStandardsList.push({
                id: element["sid"],
                itemName:
                  element["regulation"] +
                  " : " +
                  element["facetName"] +
                  " (is) " +
                  "N/R",
              });
            }
          });
          this.dropdownStandardsList.forEach((ele) => {
            if (this._util.locationObject.StandardSID == ele.id) {
              this.selectedStandardsItems.push(ele);
              return;
            }
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }


  onSearch(evt: any, pointType) {
    console.log(evt.target.value);
    this.dropdownSIDsList = [];
    if (evt.target.value == "") {
      this.getPointDesc(this.pointtype);
    } else {
      this._config
        .getPointSID(pointType, this._util.tenantID, evt.target.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (data) => {
            this.pointSids = data;
            //console.log(data, "-------", this.pointSids);
            if (this.pointtype == "Trendlog") {
              this.pointSids.forEach((element) => {
                this.dropdownSIDsList.push({
                  id: element["sid"],
                  itemName:
                    element["logDevNum"] +
                    " - " +
                    element["logInst"] +
                    " - " +
                    element["objName"] +
                    " - " +
                    element["logDescription"],
                });
              });
            } else {
              this.pointSids.forEach((element) => {
                this.dropdownSIDsList.push({
                  id: element["sid"],
                  itemName:
                    element["logDevNum"] +
                    " - " +
                    element["objName"] +
                    " - " +
                    element["logDescription"],
                });
              });
            }
          },
          (error) => {
            //console.log(error);
          }
        );
    }
  }

  getLocations() {
    if (this.selectedSIDsItems.length != 0) {
      this.getonlocations();
    } else {
      // ----------------------hided to ----------------------------//
      // if (this._util.licenseInfo.isLimitedEdition) {
      //   this._config
      //     .getCriticalRoomsList("false", this._util.tenantID, this._util.appID)
      //     .pipe(takeUntil(this.ngUnsubscribe))
      //     .subscribe((data) => {
      //       if (data.table1.length < this._util.licenseInfo.reportLimit) {
      //         this.getonlocations();
      //       } else {
      //         const currentUrl = this._route.url;
      //         this._route
      //           .navigateByUrl("/", { skipLocationChange: true })
      //           .then(() => {
      //             this._route.navigate([currentUrl]);
      //           });
      //         const dialogRef = this.dialog.open(DeleteDialog, {
      //           width: "390px",
      //           data: {
      //             id: 0,
      //             type: "",
      //             message:
      //               "Locations are limited to only " +
      //               this._util.licenseInfo.reportLimit +
      //               " in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>",
      //             action: "Warning",
      //             title: "Info",
      //           },
      //         });
      //         return;
      //       }
      //     });
      // }
      // else {
        this.getonlocations();
      // }
      // ----------------------hided to ----------------------------//
    }
  }

  getonlocations() {
    this.selectedLocationsItems = [];
    this.dropdownLocationList = [];
    this._config
      .getLocation(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.locationIds = data;
          this.locationIds.forEach((element, index) => {
            this.dropdownLocationList.push({
              id: index + 1,
              itemName: element["classType"],
            });
          });
          this.dropdownLocationList.forEach((ele) => {
            if (this._util.locationObject.classType == ele.itemName) {
              this.selectedLocationsItems.push({
                id: ele.id,
                itemName: ele.itemName,
              });
              return;
            }
          });

          this.selectedLocationsItems.length > 0 ? this.getStandardSid() : null;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  updateLocation() {
    // ----------------------hided to ----------------------------//
    // if (this._util.licenseInfo.isLimitedEdition) {
    //   if (
    //     this._config.selectedSIDsItems.length <=
    //     this._util.licenseInfo.objectLimit
    //   ) {
    //     this.updateonlocation();
    //   } else {
    //     this._config.selectedSIDsItems ==
    //       this._config.selectedSIDsItems.splice(
    //         this._util.licenseInfo.objectLimit
    //       );
    //     this._config.alrmselectedSIDsItems ==
    //       this._config.alrmselectedSIDsItems.splice(
    //         this._util.licenseInfo.objectLimit
    //       );
    //     this.updateonlocation();
    //   }
    // } else {
      this.updateonlocation();
    // }
    // ----------------------hided to ----------------------------//
  }
  updateonlocation() {
    // var tempArray = {};
    // var temp = [];

    console.log(this._config.selectedStandardsItems);
    console.log(this._config.selectedStandardsItems);
    // this._config.selectedSIDsItems.forEach(data => {
    //  this._config.selectedStandardsItems.forEach(data1 => {
    //   if(data.sid == data1.PointSID){
    //     tempArray = {
    //       PointSID: data.sid,
    //       StandardSID:data1.StandardSID ? data1.StandardSID : 0
    //     }
    //     temp.push(tempArray)
    //     return;
    //   }
    //  })
    // });
    // console.log(temp);
    // this._util.locationObject.lookUpObj = this._config.selectedSIDsItems;
    ////console.log("damo1", this._util.locationObject);
    // this._util.locationObject.Site = this.form.value.site; //"Lmi";
    // this._util.locationObject.Location = this.form.value.location; //"Service Room";
    // this._util.locationObject.PointType = this.form.value.pointtype; //"trend";
    // this._util.locationObject.PointSID = this.form.value.pointSID; //212;
    // this._util.locationObject.StandardSID = this.form.value.standardID; //11.09;
    if ((this._util.locationObject.roomName != this.roomname && this._util.locationObject.Location != this.location)) {
    // Perform your action here
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: {
        id: 0,
        type: "",
        message:
          "You can't Update Profile & Room Name at a time",
        action: "Warning",
        title: "Info",
      },
    });
    return

}else{
    this._util.locationObject.ID;
    this._util.locationObject.roomID;
    this._util.locationObject.Site = this.site; //"Lmi";
    this._util.locationObject.Location = this.selectedLocation.profile; //"Service Room";
    this._util.locationObject.ProfileSID = this.selectedLocation.id
    // this._util.locationObject.PointType = this.pointtype; //"trend";
    this._util.locationObject.PointSID = this.selectedSIDsItems[0].id; //212;
    this._util.locationObject.roomName = this.roomname;
    this._util.locationObject.classType =
      this.selectedLocationsItems.length > 0
        ? this.selectedLocationsItems[0].itemName
        : "";

    // if (this._config.selectedStandardsItems.length == 0) {
    //   this._util.locationObject.StandardSID = 0;
    // } else {
    //   this._util.locationObject.StandardSID = this._config.selectedStandardsItems;
    // }

    //this._util.locationObject.StandardSID = this.selectedStandardsItems[0].id; //11.09;
    this._util.locationObject.TrendlogLookUpObj =
      this._config.selectedSIDsItems;
    this._util.locationObject.AlarmLookUpObj =
      this._config.alrmselectedSIDsItems;
    this._util.locationObject.EnergylogLookUpObj =
      this._config.energyselectedSIDsItems;
    // let tenantId = "1";
    const trendlogCheck = this.checkStandardSID(this._util.locationObject.TrendlogLookUpObj, 'TrendlogLookUpObj');
    const alarmCheck = this.checkStandardSID( this._util.locationObject.AlarmLookUpObj, 'AlarmLookUpObj');
    const energylogCheck = this.checkStandardSID(this._util.locationObject.EnergylogLookUpObj, 'EnergylogLookUpObj');

    if (!trendlogCheck && !alarmCheck && !energylogCheck) {

    this._config
      .updateCriticalEnvLocation(this._util.locationObject, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this._util.showLocation = false;
          this._rptService.showSuccess("Updated Successfully");
          const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
          this._route.navigateByUrl(appCrEnvRoute);
        },
        (error) => {
          console.log(error);
          // this._util.showLocation = false;
          this._rptService.showError(error.error);
          // this._route.navigateByUrl("appCrEnv/" + this._util.appID);
        }
      );
    }
    }
  }


  onStandardsItemSelect(item: any) {
    this.disableButton();
  }

  OnStandardsItemDeSelect(item: any) {
    this.selectedStandardsItems = [];
    this.disableButton();
  }
  // OnLocationsItemDeSelect(item: any) {
  //   this.dropdownStandardsList = [];
  //   this.selectedStandardsItems = [];
  //   this.selectedLocationsItems = [];
  //   this.classType = '';
  //   this.disableButton();
  // }
  onSIDsItemSelect(item: any) {
    this.selectionSIDsItems = [];
    this.selectedRoomNameItems = [];
    this.selectedSIDsItems.forEach((element) => {
      this.selectionSIDsItems.push(element.id);
      if (this.selectedRoomNameItems.length == 0) {
        this.selectedRoomNameItems.push(element);

        //var fields = this.selectedRoomNameItems[0].itemName.split('-');
        if (this.pointtype == "Alarm") {
          const logDescription =
            this.selectedRoomNameItems[0].itemName.substring(
              this.selectedRoomNameItems[0].itemName.indexOf("-") + 1
            );
          const logDescription1 = logDescription.substring(
            logDescription.indexOf("-") + 1
          );
          // logDevNum = fields[0];
          // objName = fields[1];
          // logDescription = fields[2];
          this.onAddRoomNameItem(logDescription1);
        } else {
          const logDescription =
            this.selectedRoomNameItems[0].itemName.substring(
              this.selectedRoomNameItems[0].itemName.indexOf("-") + 1
            );
          const logDescription1 = logDescription.substring(
            logDescription.indexOf("-") + 1
          );
          const logDescription2 = logDescription1.substring(
            logDescription1.indexOf("-") + 1
          );
          // var logDevNum = fields[0];
          // var logInst = fields[1];
          // var objName = fields[2];
          // var logDescription = fields[3];
          this.onAddRoomNameItem(logDescription2);
        }
      }
    });

    this.disableButton();
  }
  OnSIDsItemDeSelect(item: any) {
    this.selectedSIDsItems = [];
    this.disableButton();
  }
  onEnvLocationsItemSelect(item: any) {
    this.selectedEnvLocationsItems = this.selectedEnvLocationsItems;
    this.location =
      this.selectedEnvLocationsItems.length > 0
        ? this.selectedEnvLocationsItems[0].itemName
        : "";
    this.disableButton();
  }
  OnEnvLocationsItemDeSelect(item: any) {
    this.selectedEnvLocationsItems = [];
    this.location = "";
    this.disableButton();
  }
  OnItemEnvLocationsDeSelectAll(item: any) {
    this.selectedEnvLocationsItems = [];
    this.location = "";
    this.disableButton();
  }
  onEnvNameItemSelect(item: any) {
    this.roomname =
      this.selectedRoomNameItems.length > 0
        ? this.selectedRoomNameItems[0].itemName
        : "";
    this.disableButton();
  }
  OnEnvNameItemDeSelect(item: any) {
    this.selectedEnvNameItems = [];
    this.roomname = "";
    this.disableButton();
  }
  OnItemEnvNameDeSelectAll(item: any) {
    this.selectedEnvNameItems = [];
    this.roomname = "";
    this.disableButton();
  }
  onAddEnvNameItem(data: string) {
    this.selectedEnvNameItems = [];
    this.count1++;
    this.dropdownEnvNameList.push({
      id: this.count1,
      itemName: data,
      name: data,
    });
    this.selectedEnvNameItems.push({
      id: this.count1,
      itemName: data,
      name: data,
    });
    this.roomname =
      this.selectedEnvNameItems.length > 0
        ? this.selectedEnvNameItems[0].itemName
        : "";
    this.disableButton();
  }

  OnItemLocationsDeSelectAll(item: any) {
    this.selectedEnvLocationsItems = [];
    this.location = "";
    this.disableButton();
  }
  onRoomNameItemSelect(item: any) {
    this.roomname =
      this.selectedRoomNameItems.length > 0
        ? this.selectedRoomNameItems[0].itemName
        : "";
    this.disableButton();
  }
  OnRoomNameItemDeSelect(item: any) {
    this.selectedRoomNameItems = [];
    this.roomname = "";
    this.disableButton();
  }
  OnItemRoomNameDeSelectAll(item: any) {
    this.selectedRoomNameItems = [];
    this.roomname = "";
    this.disableButton();
  }
  onAddEnvLocItem(data: string) {
    this.selectedEnvLocationsItems = [];
    this.count++;
    this.dropdownEnvLocationsList.push({
      id: this.count,
      itemName: data,
      name: data,
    });
    this.selectedEnvLocationsItems.push({
      id: this.count,
      itemName: data,
      name: data,
    });
    this.location =
      this.selectedEnvLocationsItems.length > 0
        ? this.selectedEnvLocationsItems[0].itemName
        : "";
    this.disableButton();
  }
  onAddRoomNameItem(data: string) {
    this.selectedRoomNameItems = [];
    this.count1++;
    this.dropdownRoomNameList.push({
      id: this.count1,
      itemName: data,
      name: data,
    });
    this.selectedRoomNameItems.push({
      id: this.count1,
      itemName: data,
      name: data,
    });
    this.roomname =
      this.selectedRoomNameItems.length > 0
        ? this.selectedRoomNameItems[0].itemName
        : "";
    this.disableButton();
  }
  getEnvLocations() {
    // this.selectedEnvLocationsItems = [];
    this.dropdownEnvLocationsList = [];
    this._config
      .getEnvLocation(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.locationIds = data;
          this.locationIds.forEach((element, index) => {
            this.dropdownEnvLocationsList.push({
              id: index + 1,
              itemName: element["location"],
            });
          });
          this.dropdownEnvLocationsList.forEach((ele) => {
            if (this._util.locationObject.Location == ele.itemName) {
              this.selectedEnvLocationsItems.push({
                id: ele.id,
                itemName: ele.itemName,
              });
              return;
            }
          });
          //this.selectedEnvLocationsItems.length>0 ? this.getEnvLocations() : null;
        },
        (error) => {
          console.log(error);
        }
      );
  }
  getRoomNames() {
    this.selectedRoomNameItems = [];
    this.dropdownRoomNameList = [];
    this._config
      .getRoomName(this._util.appID, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.locationIds = data;
          this.locationIds.forEach((element, index) => {
            this.dropdownRoomNameList.push({
              id: index + 1,
              itemName: element["roomName"],
            });
          });
          this.dropdownRoomNameList.forEach((ele) => {
            if (this._util.locationObject.roomName == ele.itemName) {
              this.selectedRoomNameItems.push({
                id: ele.id,
                itemName: ele.itemName,
              });
              return;
            }
          });
          //this.selectedRoomNameItems.length>0 ? this.getEnvLocations() : null;
        },
        (error) => {
          console.log(error);
        }
      );
  }
  onSave() {
    // ----------------------hided to ----------------------------//
    // if (this._util.licenseInfo.isLimitedEdition) {
    //   this._config
    //     .getCriticalRoomsList("false", this._util.tenantID, this._util.appID)
    //     .pipe(takeUntil(this.ngUnsubscribe))
    //     .subscribe((data) => {
    //       if (
    //         this._config.selectedSIDsItems.length <=
    //         this._util.licenseInfo.objectLimit
    //       ) {
    //         this.saveLocation();
    //       } else {
    //         this._config.selectedSIDsItems ==
    //           this._config.selectedSIDsItems.splice(
    //             this._util.licenseInfo.objectLimit
    //           );
    //         this._config.alrmselectedSIDsItems ==
    //           this._config.alrmselectedSIDsItems.splice(
    //             this._util.licenseInfo.objectLimit
    //           );
    //         this._config.energyselectedSIDsItems ==
    //           this._config.energyselectedSIDsItems.splice(
    //             this._util.licenseInfo.objectLimit
    //           );
    //         this.saveLocation();
    //         return;
    //       }
    //     });
    // } else {
    // ----------------------hided to ----------------------------//
      this.saveLocation();
    // }
  }
  saveLocation() {
    // var tempArray = {};
    // var temp = [];

    console.log(this._config.selectedSIDsItems);
    // console.log(this._config.selectedStandardsItems);
    // this._config.selectedSIDsItems.forEach(data => {
    //  this._config.selectedStandardsItems.forEach(data1 => {
    //   if(data.sid == data1.PointSID){
    //     tempArray = {
    //       PointSID: data.sid,
    //       StandardSID:data1.StandardSID ? data1.StandardSID : 0
    //     }
    //     temp.push(tempArray)
    //     return;
    //   }
    //  })
    // });
    // console.log(temp);
    // this.locationObj.lookUpObj = this._config.selectedSIDsItems;
    this._util.initialState = true;
    this.locationObj.Site = this.site.trim(); //"Lmi";
    this.locationObj.classType = this.classType;
    this.locationObj.PointType = this.pointtype; //"trend";
    // this.locationObj.PointSID = this._config.selectedSIDsItems[0]; //212;
    this.locationObj.classTypeID =
      this.selectedLocationsItems.length != 0
        ? this.selectedLocationsItems[0].id
        : 0; //"Service Room";
    this.locationObj.roomName = this.roomname;
    this.locationObj.Location = this.selectedLocation.profile;
    this.locationObj.ProfileSID = this.selectedLocation.id;

    // if (this._config.selectedStandardsItems.length == 0) {
    //   this.locationObj.StandardSID = 0;
    // } else {
    //   this.locationObj.StandardSID = this._config.selectedStandardsItems[0].sid;
    // }
    //this.locationObj.StandardSID = this.selectedStandardsItems[0].id; //11.09;
    // let tenantId = "1";
    this.locationObj.TrendlogLookUpObj = this._config.selectedSIDsItems;
    this.locationObj.AlarmLookUpObj = this._config.alrmselectedSIDsItems;
    this.locationObj.EnergylogLookUpObj = this._config.energyselectedSIDsItems;

    const trendlogCheck = this.checkStandardSID(this.locationObj.TrendlogLookUpObj, 'TrendlogLookUpObj');
    const alarmCheck = this.checkStandardSID(this.locationObj.AlarmLookUpObj, 'AlarmLookUpObj');
    const energylogCheck = this.checkStandardSID(this.locationObj.EnergylogLookUpObj, 'EnergylogLookUpObj');

    if (!trendlogCheck && !alarmCheck && !energylogCheck) {

    this._config
      .addCriticalEnvLocation(this.locationObj, this._util.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this._util.showLocation = false;
          this._rptService.showSuccess("Saved Successfully");
          const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
          this._route.navigateByUrl(appCrEnvRoute);
        },
        (error) => {
          console.log(error);
          // this._util.showLocation = false;
          this._rptService.showError(error.error);
          // this._route.navigateByUrl("appCrEnv/" + this._util.appID);
        }
      );
    }
  }

  checkStandardSID(logObj: any[], logType: string): boolean {
    for (let i = 0; i < logObj.length; i++) {
      if (logObj[i].StandardSID === 0 || logObj[i].StandardSID === "") {
        const friendlyLogType = this.getFriendlyLogType(logType);
        this._rptService.showError(`A Particular ${friendlyLogType} is Checked but its Standard is Not selected in ${friendlyLogType}s .`);
        return true;
      }
    }
    return false;
  }

  getFriendlyLogType(logType: string): string {
    switch (logType) {
      case 'TrendlogLookUpObj':
        return 'Trendlog';
      case 'AlarmLookUpObj':
        return 'Alarm';
      case 'EnergylogLookUpObj':
        return 'Energylog';
      default:
        return logType;
    }
  }



  getPointSid() {
    // console.log(this.pointtype, "-------------");
    this.selectedLocationsItems = [];
    this.selectedSIDsItems = [];
    this._util.selectedItems = [];
    this.selectionStandardsItems = [];
    this.selectedRoomNameItems = [];
    this.disableButton();
    //this.getStandardSid();
    if (this._util.isEmpty(this._util.locationObject)) {
      this.selectedSIDsItems = [];
    }
    if (this.pointtype === undefined) {
      return;
    } else if (this.pointtype == "Alarm") {
      this.selectedStandardsItems = [];
      this.getPointDesc(this.pointtype);
    } else if (this.pointtype == "Trendlog") {
      //this.selectedSIDsItems = [];
      this.getPointDesc(this.pointtype);
      this.getLocations();
      //  this.getEqpLocations();
    } else if (this.pointtype == "Energy") {
      this.selectedStandardsItems = [];
      this.getPointDesc(this.pointtype);
    }
  }
  energyapplyFilter(filterValue: string, event) {
    const tempsid = [];
    //filterValue = filterValue.trim(); // Remove whitespace
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }
    if (this.adhocUtility.energycheckedList) {
      this._util.selectedItems = [];
      this.adhocUtility.energycheckedList.forEach((element) => {
        if (typeof element == "string") {
          this._util.selectedItems.push(element);
        } else {
          this._util.selectedItems.push(element.sid);
        }
      });
      this.model.sidParams = this._util.selectedItems.toString();
    }

    let temp = filterValue;
    temp = temp.trim();
    // temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.energyList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.energysaveFilter = temp;
    if (this.model.app == "lookUpApp") {
      if (this.adhocUtility.energycheckedList) {
        this.adhocUtility.energycheckedList.forEach((element) => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      this.model.objectType = "Energy";
      this.model.filterType = "Energy";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = "lookUpApp";
      this.model.appId = this._util.appID;
      this.model.roomName = this.roomname;
      this.model.classType = this.classType;
      this.model.regfiltertype = this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.model.location = this.location;
      this.model.keyWord = temp == "" ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUpfilterByEnergy(this.model);
    } else {
      this.model.objectType = "Energy";
      this.model.filterType = "Energy";
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.appId = this._util.appID;
      this.model.roomName = this.roomname;
      this.model.classType = this.classType;
      this.model.regfiltertype = this.selectedLocation.profile;
      this.model.ProfileSID = this.selectedLocation.id;
      this.model.location = this.location;
      this.model.keyWord = temp == "" ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUpfilterByEnergy(this.model);
    }
  }
  getSearchResultsLookUpfilterByEnergy(lookUpObject) {
    this.showSpinner = true;
    this.standard = [];
    this.length = 0;
    this._config
      .getEnvLookUpObjects(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        //this._util.standard = data.table1
        // setTimeout(() => {
        this.energyStandards = data.table;
        const uniqueData = data.table1.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.sid === item.sid)
        );

        // Assign the unique data to data.table
        data.table1 = uniqueData;
        this.energyList = new MatTableDataSource(data.table5);
        this.energyDataLength = data.table6[0].totalEnergyCount;
        if (this.energyList.paginator) {
          setTimeout(() => {
            this.energyList.paginator.length = this.energyDataLength;
          });
        }
        this.energylength = this.energyList.data.length;
        this.isShowAlarm = false;
        if (this.energylength > 0) {
          this.energyList.sort = this.sort;
          this.energyList.paginator = this.energyPaginator;
          this.getData3(
            {
              pageIndex: this.page1,
              pageSize:
                localStorage.getItem("ItemPerPage") != null
                  ? (this.size = +localStorage.getItem("ItemPerPage"))
                  : this.pageSize1,
              length: this.energylength,
            },
            "Energy"
          );
          this.energyList.data.forEach((s) => (s["checked"] = false));
        }
        // if (this.model.DevNum == null || this.model.DevNum == '') {
        //   this.dataLength = data.table1[0].totalCount;
        // }
        this.energyPanel = true;
        if (this.energylength > 0) {
          var energytemp = new Array();
          var energytemp2 = new Array();
          this.alarmList.data.forEach((l) => {
            if (
              l["location"] == this.model.location &&
              l["equipmentName"] == this.model.roomName
            ) {
              energytemp.push({
                sid: l["sid"],
                objName: l["objName"],
                devInst: l["devInst"],
                objInst: l["objInst"],
                descr: l["descr"],
                propDescr: l["propDescr"],
                energyType: l["energyType"],
                checked: true,
              });
              energytemp2.push({
                PointSID: l["sid"],
                StandardSID: l["standardID"] == undefined ? 0 : l["standardID"],
              });
            }
          });

          // this.adhocUtility.alrmcheckedList = alrmtemp;
          // this._config.alrmselectedSIDsItems = alrmtemp2;

          this.energyfilter = this.adhocUtility.energysaveFilter;
          if (this.adhocUtility.energycheckedList.length > 0) {
            this.adhocUtility.energycheckedList.forEach((s) => {
              this.energyList.data.forEach((l) => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                } else {
                  l["standardID"] = "";
                }
              });
            });
          } else {
            this.energyList.data.forEach((l) => {
              l["standardID"] = "";
            });
          }
          if (this.adhocUtility.energycheckedList) {
            this.energychecked();
          }
        }

        this.showSpinner = false;
      });
  }
  energyfilterByKey(filterValue: string, event) {
    const tempsid = [];
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }

    let temp = filterValue;
    temp = temp.trim();
    temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.energyList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.energysaveFilter = temp;
    if (this.adhocUtility.energycheckedList) {
      this._util.selectedItems = [];
      this.adhocUtility.energycheckedList.forEach((element) => {
        if (typeof element == "string") {
          this._util.selectedItems.push(element);
        } else {
          this._util.selectedItems.push(element.sid);
        }
      });
      this.model.sidParams = this._util.selectedItems.toString();
    }
    if (this.model.app == "lookUpApp") {
      if (this.adhocUtility.energycheckedList) {
        this.adhocUtility.energycheckedList.forEach((element) => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      if (
        (this.energyList.filteredData.length > 0 ||
          this.energyList.filteredData.length == 0) &&
        temp == "" &&
        event.keyCode === 8
      ) {
        this.model.objectType = "Energy";
        this.model.filterType = "Energy";
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.app = "lookUpApp";
        this.model.appId = this._util.appID;
        this.model.roomName = this.roomname;
        this.model.classType = this.classType;
        this.model.regfiltertype = this.selectedLocation.profile;
        this.model.ProfileSID = this.selectedLocation.id;
        this.model.location = this.location;
        this.model.pageNumber = 1;
        this.model.keyWord = temp == "" ? null : temp;
        this.getSearchResultsLookUpfilterByEnergy(this.model);
      }
    } else {
      if (
        (this.energyList.filteredData.length > 0 ||
          this.energyList.filteredData.length == 0) &&
        temp == "" &&
        event.keyCode === 8
      ) {
        this.model.objectType = "Energy";
        this.model.filterType = "Energy";
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.appId = this._util.appID;
        this.model.roomName = this.roomname;
        this.model.classType = this.classType;
        this.model.regfiltertype = this.selectedLocation.profile;
        this.model.ProfileSID = this.selectedLocation.id;
        this.model.location = this.location;
        this.model.pageNumber = 1;
        this.model.keyWord = temp == "" ? null : temp;
        this.getSearchResultsLookUpfilterByEnergy(this.model);
      }
    }
  }
  energyapplyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.energylogList.filter = filterValue;
  }
  energyfindIndexToUpdate(obj) {
    return obj.sid === this;
  }
  energyfindIndexToUpdate1(obj) {
    return obj.logDescription + obj.trendlogName === this;
  }
  energyfindIndexToUpdate2(obj) {
    return obj.descr + obj.objName === this;
  }

  energycheckedState(obj, evt) {
    if (this.model.app === "lookUpApp") {
      if (!this._config.madateValidate) {
        this.energyUpdateCheckedLists(obj);
        this.energyHandleEnergySelection(obj);
        this.energyCheckSaveDisableState(this.adhocUtility.energycheckedList);
      } else {
        this.energyHandleMandatoryFieldWarning(obj, evt);
      }
    } else {
      this.energyUpdateCheckedLists(obj);
      this.energyHandleEnergySelection(obj);
      this.energyCheckSaveDisableState(this.adhocUtility.energycheckedList);
    }
  }

  energyUpdateCheckedLists(obj) {
    const updateItem = this.adhocUtility.energycheckedList.find(item => item.sid === obj.sid);
    const updateObjName = this.energyFindUpdateObjName(obj);
    this.index1 = this.adhocUtility.energycheckNames.indexOf(updateObjName);

    this.energyToggleItemInList(this.adhocUtility.energycheckedList, updateItem, obj);
    this.energyToggleItemInList(this.adhocUtility.energycheckNames, updateObjName, obj);
  }

  energyFindUpdateObjName(obj) {
    if (this.model.objectType === "Energy") {
      return this.adhocUtility.energycheckNames.find(item => item.descr === obj.descr && item.objName === obj.objName);
    } else {
      return this.adhocUtility.energycheckNames.find(item => item.logDescription === obj.logDescription && item.energylogName === obj.energylogName);
    }
  }

  energyToggleItemInList(list, item, obj) {
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(obj);
    }
  }

  energyHandleEnergySelection(obj) {
    this._util.selectedItems = this.adhocUtility.energycheckedList;

    if (obj.checked) {
      this.energyAddSelectedSID(obj, this._config.energyselectedSIDsItems);
    } else {
      this.energyRemoveSelectedSID(obj, this._config.energyselectedSIDsItems);
      obj.standardID = "none";
    }
  }

  energyAddSelectedSID(obj, selectedSIDsItems) {
    const tempObj = {
      PointSID: obj.sid,
      StandardSID: obj.standardID ?? 0,
    };
    selectedSIDsItems.push(tempObj);
  }

  energyRemoveSelectedSID(obj, selectedSIDsItems) {
    const foundIndex = selectedSIDsItems.findIndex(element => element.PointSID === obj.sid);
    if (foundIndex !== -1) {
      selectedSIDsItems.splice(foundIndex, 1);
    }
  }

  energyCheckSaveDisableState(checkedList) {
    // const disabled = this.energyCheckStandardID(checkedList);
    // this._util.saveDisable = disabled || checkedList.length === 0;

    const trendDisabled = this.checkStandardID(this.adhocUtility.trndcheckedList);
    const alarmDisabled = this.checkStandardID(this.adhocUtility.alrmcheckedList);
    const energyDisabled = this.checkStandardID(this.adhocUtility.energycheckedList);

    this._util.saveDisable = trendDisabled || alarmDisabled || energyDisabled ||
    (this.adhocUtility.trndcheckedList.length === 0 &&
     this.adhocUtility.alrmcheckedList.length === 0 &&
     this.adhocUtility.energycheckedList.length === 0);
  }

  energyCheckStandardID(list) {
    for (const item of list) {
      if (!item.standardID || item.standardID === "none" || item.standardID === "") {
        this.standardCount++;
        return true;
      }
    }
    this.standardCount = 0;
    return false;
  }

  energyHandleMandatoryFieldWarning(obj, evt) {
    obj.checked = false;
    evt.source.checked = false;
    const msgTitle = "Info";
    const msgBody = "Provide All mandatory fields first";
    this._util.warningCommonDialog(msgBody, msgTitle);
  }

  energyclearSelection() {
    this.energyList.data.filter((g) => {
      g["checked"] = false;
      return true;
    });
    this.adhocUtility.energycheckedList.forEach((s) => {
      this.energyList.data.forEach((l) => {
        if (s["sid"] == l["sid"]) {
          l["standardID"] = "none";
          return;
        }
      });
    });
    this.adhocUtility.energycheckedList = [];
    this.adhocUtility.checkNames = [];
    this._config.energyselectedSIDsItems = [];
    if(this.adhocUtility.trndcheckedList.length > 0 ||
      this.adhocUtility.alrmcheckedList.length > 0 ||
      this.adhocUtility.energycheckedList.length > 0)
      {
        this._util.saveDisable = false;
      }
    else
    {
        this._util.saveDisable = true;
    }
  }

  energychecked() {
    this.tempAray = [];
    this.tempAray = this.energyList.data;
    if (this.adhocUtility.energycheckedList.length > 0) {
      this.adhocUtility.energycheckedList.forEach((s) => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.energyList.data.splice(i, 1);
            return;
          }
        });
      });
      let trendDisabled = false;
      let alarmDisabled = false;
      let energyDisabled = false;
      if (!this.isShowAlarm) {
        if (
          this.adhocUtility.trndcheckedList.length > 0 &&
          this.adhocUtility.alrmcheckedList.length &&
          this.adhocUtility.energycheckedList.length > 0
        ) {
          for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
            if (
              this.adhocUtility.trndcheckedList[i].standardID == null ||
              this.adhocUtility.trndcheckedList[i].standardID == "none" ||
              this.adhocUtility.trndcheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              trendDisabled = true;

              //   this.isDisabledd = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
              trendDisabled = false;
            }
          }
          for (var i = 0; i < this.adhocUtility.energycheckedList.length; i++) {
            if (
              this.adhocUtility.energycheckedList[i].standardID == null ||
              this.adhocUtility.energycheckedList[i].standardID == "none" ||
              this.adhocUtility.energycheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              energyDisabled = true;
              break;
            } else {
              this.standardCount = 0;
              energyDisabled = false;
              this._util.saveDisable = false;
            }
          }
        } else {
          this._util.saveDisable = false;
        }
      } else {
        if (this.adhocUtility.energycheckedList.length > 0) {
          for (var i = 0; i < this.adhocUtility.energycheckedList.length; i++) {
            if (
              this.adhocUtility.energycheckedList[i].standardID == null ||
              this.adhocUtility.energycheckedList[i].standardID == "none" ||
              this.adhocUtility.energycheckedList[i].standardID == ""
            ) {
              this.standardCount++;
              this._util.saveDisable = true;
              break;
            } else {
              this.standardCount = 0;
              this._util.saveDisable = false;
            }
          }
        } else {
          this._util.saveDisable = true;
        }
      }
      if (alarmDisabled || trendDisabled || energyDisabled) {
        this._util.saveDisable = true;
      }
    }
    this.tempAray1 = this.energyList.data.concat(
      this.adhocUtility.energycheckedList
    );
    this.energyList.data = this.tempAray1.map((x) => Object.assign({}, x));
    this.energySortProperty = "checked";
    this.energySortDirection = "desc";
    if (this.energyList.sort) {
      this.energyList.sort.active =
        this.energyList.sort.active != "checked" ? "checked" : "checked";
      this.energyList.sort.direction = "desc";
    }

    if (this.energyList.paginator) {
      this.energyList.paginator.firstPage();
      setTimeout(() => {
        this.energyList.paginator.length = this.energyDataLength;
        this.alarmList.paginator.length = this.alarmDataLength;
        this.trendlogList.paginator.length = this.trendDataLength;
      });
    }

    //this.onChange(newValue,obj)
  }
  energyOnChange(newValue, obj) {
    if(obj.checked == false)
    {
      newValue.source.value = 'none'
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: "",
          message:
            "Please Check the Check Box",
          action: "Warning",
          title: "Info",
        },
      });
      return;
    }
    else
    {
      console.log(newValue);
    obj.standardID = newValue.source.value;
    if (this._util.showLocationBack) {

      this.saveDisable = false;

    }


    if (this.adhocUtility.energycheckedList.length > 0) {
      this.adhocUtility.energycheckedList.forEach((data) => {
        if (obj.sid == data.sid) {
          this.adhocUtility.energycheckedList.standardID =
            +newValue.source.value;
        }
      });
    }
    // this.trendlogList.data.forEach(data => {
    //     if(obj.sid == data["sid"]){
    //       data["standardID"] = newValue.target.value;
    //       console.log(data);
    //       this.trendlogList.data["standardID"] = newValue.target.value;
    //     }
    // });
    this.adhocUtility.energycheckedList.forEach((element) => {
      if (element.sid == obj.sid) {
        element.standardID =
          newValue.source == undefined ? 0 : newValue.source.value;
        return;
      }
    });
    let alarmDisabled = false;
    let trendDisabled = false;
    let energyDisabled = false;
    this.loopLength =
      this.adhocUtility.alrmcheckedList.length >=
      this.adhocUtility.trndcheckedList.length
        ? this.adhocUtility.alrmcheckedList.length
        : this.adhocUtility.trndcheckedList.length;
    if (!this.isShowAlarm) {
      if (
        this.adhocUtility.trndcheckedList.length > 0 &&
        this.adhocUtility.alrmcheckedList.length > 0 &&
        this.adhocUtility.energycheckedList.length > 0
      ) {
        for (var i = 0; i < this.adhocUtility.trndcheckedList.length; i++) {
          if (
            this.adhocUtility.trndcheckedList[i].standardID == null ||
            this.adhocUtility.trndcheckedList[i].standardID == "none" ||
            this.adhocUtility.trndcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            trendDisabled = true;
            this.isDisabledd = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            trendDisabled = false;
          }
        }
        for (var i = 0; i < this.adhocUtility.alrmcheckedList.length; i++) {
          if (
            this.adhocUtility.alrmcheckedList[i].standardID == null ||
            this.adhocUtility.alrmcheckedList[i].standardID == "none" ||
            this.adhocUtility.alrmcheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            alarmDisabled = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            alarmDisabled = false;
          }
        }
        for (var i = 0; i < this.adhocUtility.energycheckedList.length; i++) {
          if (
            this.adhocUtility.energycheckedList[i].standardID == null ||
            this.adhocUtility.energycheckedList[i].standardID == "none" ||
            this.adhocUtility.energycheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            energyDisabled = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
            energyDisabled = false;
          }
        }
      } else {
        this._util.saveDisable = false;
      }
    } else {
      if (this.adhocUtility.energycheckedList.length > 0) {
        for (var i = 0; i < this.adhocUtility.energycheckedList.length; i++) {
          if (
            this.adhocUtility.energycheckedList[i].standardID == null ||
            this.adhocUtility.energycheckedList[i].standardID == "none" ||
            this.adhocUtility.energycheckedList[i].standardID == ""
          ) {
            this.standardCount++;
            this._util.saveDisable = true;
            break;
          } else {
            this.standardCount = 0;
            this._util.saveDisable = false;
          }
        }
      } else {
        this._util.saveDisable = true;
      }
    }
    if (energyDisabled) {
      this._util.saveDisable = true;
    }

    if (this._config.energyselectedSIDsItems.length == 0) {
      this.tempObj = {
        PointSID: obj.sid,
        StandardSID: newValue.source == undefined ? 0 : newValue.source.value,
      };
      this._config.energyselectedSIDsItems.push(this.tempObj);
    } else {
      this._config.energyselectedSIDsItems.forEach((element) => {
        if (element.PointSID == obj.sid) {
          element.StandardSID =
            newValue.source == undefined ? 0 : newValue.source.value;
          return;
        }
      });
    }
    }

  }

  disableButton() {
    if (
      this.classType == "" ||
      this.classType == undefined ||
      this.site.toString().trim() === "" ||
      this.roomname.toString().trim() == "" ||
      this.location.toString().trim() == ""
      // || this.selectedLocationsItems.length == 0
    ) {
      this.saveDisable = true;
      this._config.madateValidate = true;
    } else {
      // if (this.selectedCriteriaItems.length == 0) {
      //   console.log(this.selectedCriteriaItems[0].id);
      //   this.selectedCriteriaItems[0].id = "";
      // }
      this._config.madateValidate = false;
      this.saveDisable = false;
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngAfterViewInit(): void {
    this.alarmList.paginator = this.paginator; // For pagination
    this.trendlogList.paginator = this.trendlogPaginator; // For pagination
    this.energylogList.paginator = this.energyPaginator;
    this.trendlogList.sort = this.trendlogSort; // For sort
    this.cdr.detectChanges();
  }
}

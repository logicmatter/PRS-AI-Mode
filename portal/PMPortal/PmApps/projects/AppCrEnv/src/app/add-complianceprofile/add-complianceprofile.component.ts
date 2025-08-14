import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReportingService, TenantService } from 'src/app/PmCore/services';
import { LookupServiceService } from 'src/app/PmCore/services/LookupService/lookup-service.service';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import { CommonModel } from 'src/app/PmModel/common.model';
import { takeUntil, catchError } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { Search } from 'src/app/PmModel/search.model';
import { MatTableDataSource } from '@angular/material/table';
import { Complianceprofile ,CompilanceprofileStds } from 'src/app/PmModel/complianceprofile.model';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-add-complianceprofile',
  templateUrl: './add-complianceprofile.component.html',
  styleUrls: ['./add-complianceprofile.component.scss']
})
export class AddComplianceprofileComponent implements OnInit, OnDestroy {
  site = "";
  profileName: string = '';
  public commonModel: CommonModel;
  public profileModel: Complianceprofile = new Complianceprofile();
  dropdownLocationList = [];
  selectedLocationsItems = [];
  selectedEnvLocationsItems = [];
  dropdownEnvLocationsList = [];
  ngUnsubscribe: Subject<void> = new Subject<void>();
  locationIds: any;
  location = "";
  dropdownLocationsSettings = {};
  classType: string;
  count: number = 0; // Initialize count
  dataSource: MatTableDataSource<any>;
  model: Search = new Search();
  saveDisable: boolean;
  displayedColumns: string[] = ['select', 'facetName', 'facetRuleCode', 'dropdown'];

  roomTypeSelected = false; // Track if a room type is selected
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;

  constructor(
    private _route: Router,
    public _util: AppUtilService,
    private tenantService: TenantService,
    private _config: LookupServiceService,
    public dialog: MatDialog,
    private _rptService: ReportingService,
  ) {}

  ngOnInit(): void {
    this.commonModel = this.tenantService.currentTenantValue;
    this._util.showCompilanceprofileBack = false;
    this._util.saveDisable = true;
    if (!this.site) {
      this.site = this.commonModel.tenantName;
    }
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
    this.getonlocations();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goBack() {
    this._util.showcompilanceprofile = false;
    const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
    this._route.navigateByUrl(appCrEnvRoute);
  }

  getonlocations() {
    this.selectedLocationsItems = [];
    this.dropdownLocationList = [];
    this._config.getLocation(this._util.appID, this._util.tenantID)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((error) => {
          console.error("Error retrieving locations:", error);
          return throwError(error);
        })
      )
      .subscribe(
        (data) => {
          this.locationIds = data;
          this.locationIds.forEach((element, index) => {
            this.dropdownLocationList.push({
              id: index + 1,
              itemName: element["classType"],
            });
          });
          this._util.locationObject.classType = "";
          const defaultLocation = this._util.profileObject.classType;
          const selectedLocation = this.dropdownLocationList.find(ele => ele.itemName === defaultLocation);
          if (selectedLocation) {
            this.selectedLocationsItems.push({
              id: selectedLocation.id,
              itemName: selectedLocation.itemName,
            });
            this.onLocationsItemSelect(selectedLocation);
          }
        },
        (error) => {
          console.error("Error retrieving locations:", error);
        }
      );
  }

  onLocationsItemSelect(item: any) {
    this.classType = item.itemName; // Simplified assignment
    this.roomTypeSelected = true; // Room type is selected
    
    if(this._util.compprofileedit == true)
    { 
      this.profileName = this._util.profileObject.profile;
      if( this._util.distinctprofileObj.length > 0 )
      {
      if(this._util.distinctprofileObj[0].classType != this.classType )
        {
          
            this._util.distinctprofileObj = [] ;
        }
      }
    }
    
     // Open expansion panel
    
    if (!this.site) {
      this.onAddEnvLocItem(this.classType);
    }
    this._util.classType = this.classType;
    this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.model.appId = this._util.appID;
    this.model.classType = this.classType;
    this.model.pageNumber = 1;
    this.getDistinctFacets();
    setTimeout(() => {
      this.expansionPanel.open();
    }, 1);
  }

  OnLocationsItemDeSelect(item: any) {
    this.classType = ''; // Reset classType
    this.roomTypeSelected = false; // Room type is deselected

    if(this._util.compprofileedit == true)
      { 
        this.profileName = this._util.profileObject.profile;
        if( this._util.distinctprofileObj.length > 0 )
        {
        if(this._util.distinctprofileObj[0].classType != this.classType )
          {
            
              this._util.distinctprofileObj = [] ;
          }
        }
      }
    this.dataSource = new MatTableDataSource();
    if (this.expansionPanel) {
      this.expansionPanel.close();
      this._util.saveDisable = true; // Close expansion panel
    }
  }

  OnLocationsItemDeSelectAll(event: any) {
    this.classType = ''; // Reset classType
    this.roomTypeSelected = false; // Room type is deselected
    if(this._util.compprofileedit == true)
      { 
        this.profileName = this._util.profileObject.profile;
        if( this._util.distinctprofileObj.length > 0 )
        {
        if(this._util.distinctprofileObj[0].classType != this.classType )
          {
            
              this._util.distinctprofileObj = [] ;
          }
        }
      }
    this.dataSource = new MatTableDataSource();
    if (this.expansionPanel) {
      this.expansionPanel.close(); // Close expansion panel
      this._util.saveDisable = true;
    }
  }

  onAddEnvLocItem(data: string) {
    this.count++;
    this.dropdownEnvLocationsList.push({
      id: this.count,
      itemName: data,
      name: data,
    });
    this.selectedEnvLocationsItems = [{
      id: this.count,
      itemName: data,
      name: data,
    }];
    this.location = data;
  }

  getDistinctFacets() {
    if(this._util.compprofileedit == false || this._util.distinctprofileObj == '')
    { this._config.getDistinctFacets(this._util.appID, this._util.tenantID, this.classType)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((error) => {
          console.error("Error retrieving facets:", error);
          return throwError(error);
        })
      )
      .subscribe(
        (data: any) => {
          console.log("Facets:", data);
          data.forEach((row: any) => {
            row.showDropdown = false;
            row.dropdownOptions = [];
            row.selectedOptions = [];
          });
          this.dataSource = new MatTableDataSource(data);
        },
        (error) => {
          console.error("Error retrieving facets:", error);
        }
      );}
      else
      { 
     
     let    data = this._util.distinctprofileObj;
            data.forEach((row: any) => {
              row.isChecked = (row.isChecked === 'true');
              if(row.isChecked == true)
              {
                row.showDropdown = false;
                this.toggleDropdown(row);    
              }
            });
            this.dataSource = new MatTableDataSource(data);
        }
   
      this._util.saveDisable = true;

  }

  onProfileNameChange(newValue: string) {
    if (this.dataSource.data.some(item => item.selectedOption)) {
      // Enable the save button or perform some action
      this._util.saveDisable = false;
      this.saveDisable = false;
  }
  }

  toggleDropdown(row: any): void {
  
    row.showDropdown = !row.showDropdown;
   
    if (row.showDropdown) {
      const facetId = row.id; 
      this._config.getDistinctStandardsInfo(this._util.appID, this._util.tenantID, this.classType, facetId)
        .pipe(
          takeUntil(this.ngUnsubscribe),
          catchError((error) => {
            console.error("Error retrieving facet details:", error);
            return throwError(error);
          })
        )
        .subscribe(
          (data: any) => {
            this.dataSource.data = [...this.dataSource.data];  
            row.dropdownOptions = data.map(item => item.standardDetails);
            row.selectedOption = row.standardDetails;
            this._util.saveDisable = true
          },
          (error) => {
            console.error("Error retrieving facet details:", error);
          }
        );
    } else {
      row.selectedOption = ""
      let abc = []
      abc = this.dataSource.data.map(item=> item.showDropdown);
      if (abc.some(value => value === true)) {
        this._util.saveDisable = false;
      } else {
        this._util.saveDisable = true;
      }
    }
  }

  onSelectionChange(row: any) {
    console.log('Selected option:', row.selectedOption);
    this._util.saveDisable = false;
  }

  onSave() {
    if (this.profileName.trim() === "") {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: '',
          message: 'Profile Name is Mandatory',
          action: "Warning",
          title: "Info"
        }
      });
      return;
    } else {
      let dummysid = 0;
      let profileid = -1;
      let filteredData = this.dataSource.data.filter(item => item.showDropdown === true);
      let extractedData = filteredData.map(item => ({
        AppId: this._util.appID,
        Site: this.commonModel.tenantName,
        classType: this._util.classType,
        profileId: profileid,
        facetID: item.id,
        facetName: item.facetName,
        ruleCode: item.facetRuleCode,
        standardName: item.selectedOption,
        standardID: dummysid
      }));
      console.log("Extracted data:", extractedData);
      this.profileModel.appID = this._util.appID;
      this.profileModel.compilanceprofile = extractedData;
      this.profileModel.profileName = this.profileName;
      let complianceProfile = this.profileModel.compilanceprofile;
      let hasUndefinedStandardName = complianceProfile.some(item => item.standardName === undefined || item.standardName === null);

      if (hasUndefinedStandardName)
 {
    this._rptService.showError("Particular Facet is checked and its 'standardDetails' is undefined.");
 } 
else 
{
  this._config.addProfile(this.profileModel, this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
    data => {
      this._util.showcompilanceprofile = false;
      const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
      this._route.navigateByUrl(appCrEnvRoute);
      this._rptService.showSuccess("Saved Successfully");
    },
    error => {
      this._rptService.showError("Profile name already exists");
    }
  );
}

}
}

updateLocation(){

  if (this.profileName.trim() === "") {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: {
        id: 0,
        type: '',
        message: 'Profile Name is Mandatory',
        action: "Warning",
        title: "Info"
      }
    });
    return;
  } else {
    let dummysid = 0;
    let profileid = this._util.profileObject.id;
    let filteredData = this.dataSource.data.filter(item => item.showDropdown === true);
    let extractedData = filteredData.map(item => ({
      AppId: this._util.appID,
      Site: this.commonModel.tenantName,
      classType: this._util.classType,
      profileId: profileid,
      facetID: item.id,
      facetName: item.facetName,
      ruleCode: item.facetRuleCode,
      standardName: item.selectedOption,
      standardID: dummysid
    }));
    console.log("Extracted data:", extractedData);
    this.profileModel.appID = this._util.appID;
    this.profileModel.compilanceprofile = extractedData;
    this.profileModel.profileName = this.profileName;
    this.profileModel.id = profileid;
    let complianceProfile = this.profileModel.compilanceprofile;
    let hasUndefinedStandardName = complianceProfile.some(item => item.standardName === undefined || item.standardName === null);

    if (hasUndefinedStandardName)
{
  this._rptService.showError("Particular Facet is checked and its 'standardDetails' is undefined.");
} 
else 
{
this._config.editProfile(this.profileModel, this._util.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
  data => {
    this._util.showcompilanceprofile = false;
    const appCrEnvRoute = `home/apps/appCrEnv/${this._util.appID}/${this._util.tenantID}/config`;
    this._route.navigateByUrl(appCrEnvRoute);
    this._rptService.showSuccess("Profile has been updated, please re-map the Room aligned with Profile for modified Standards");
  },
  error => {
    this._rptService.showError("Profile name already exists");
  }
);
}

}
  

}


}

import { Injectable, Inject } from "@angular/core";
import { Facet } from "src/app/PmModel/facet";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { StandardObj } from "src/app/PmModel/StandardObj";
import { CompilanceprofileStds } from "src/app/PmModel/complianceprofile.model";
import { EnvLocObj } from "src/app/PmModel/EnvLocObj";
import { EqpLocObj } from "src/app/PmModel/EqpLocObj";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Search } from "src/app/PmModel/search.model";
import { tap } from "rxjs/operators";

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/LookupManager/`;

@Injectable({
  providedIn: "root"
})
export class LookupServiceService {
  dropdownStandardsList = [];
  selectedStandardsItems: any = [];
  selectedSIDsItems: any = [];
  selectionSIDsItems = [];
  dropdownStandardsSettings = {};
  selectedProfileTypeItems:any = [];
  standardSIDs
  standardCols = [
    "acceptableHigh",
    "acceptableLow",
    "criteria",
    "facetName",
    "facetUnit",
    "regulation",
    "ruleCode",
    "standardID",
    "roomType",
  ];
  locationCols = [
    "site",
    "location",
    "logDescription",
    "facet",
    "logInst",
    "facetUnit",
    "regulation",
    "ruleCode",
    "standardID",
    "roomTypeID",
    "roomType",
  ];
  facetCols = ["facetName", "facetUnit"];
  configureUrl = API_URL; //"api/LookupManager/";
  options = {
    headers: new HttpHeaders({
      responseType: "text"
    })
  };
  madateValidate: boolean;
  alrmselectedSIDsItems: any = [];
  energyselectedSIDsItems: any = [];

  onStandardsItemSelect(item: any) {
  }

  OnStandardsItemDeSelect(item: any) {
    this.selectedStandardsItems = [];
  }
  constructor(public _http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    this.dropdownStandardsSettings = {
      singleSelection: true,
      text: "Select Standard (e.g. 1987-AIA)",
      badgeShowLimit: 1,
      position: "bottom",
      maxHeight: 200,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
  }
  createFacet(facet: Facet, tenantId: string) {
    return this._http.post(
      this.configureUrl + "createFacet?TenantId=" + tenantId,
      facet,
      {
        responseType: "text"
      }
    );
  }

  getFacet(hasDistinct: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getFacet", {
      params: { hasDistinct: hasDistinct, TenantId: tenantId }
    });
  }

  getFacetUnit(facetName, tenantId: string) {
    return this._http.get(this.configureUrl + "getFacetUnit", {
      params: { FacetName: facetName, TenantId: tenantId }
    });
  }

  getStandardsList(appID, tenantId: string) {
    return this._http.get(this.configureUrl + "getStandardsList", {
      params: { appId: appID, TenantId: tenantId }
    });
  }
  getAllProfileList(appID, tenantId: string) {
    return this._http.get(this.configureUrl + "getAllProfileList", {
      params: { appId: appID, TenantId: tenantId }
    });
  }



  getBackNetUnits(tenantId: string) {
    return this._http.get(this.configureUrl + "getBackNetUnits", {
      params: { TenantId: tenantId }
    });
  }

  getTrendLogListLookUp(searchObj: Search): Observable<any> {
    return this._http.post<any>(this.configureUrl + 'GetLookUpObjects', searchObj).pipe(tap(resp => {

    }));
  }
  getEnvLookUpObjects(searchObj: Search): Observable<any> {
    return this._http.post<any>(this.configureUrl + 'GetEnvLookUpObjects', searchObj).pipe(tap(resp => {

    }));
  }

  getCriticalRoomsList(hasDistinct: string, tenantId: string, appId: string): Observable<any> {
    return this._http.get(this.configureUrl + "getCriticalRoomsList", {
      params: {
        hasDistinct: hasDistinct,
        TenantId: tenantId,
        appId: appId
      }
    });
  }
  getCriticalRegularionList(hasDistinct: string, tenantId: string, appId: string): Observable<any> {
    return this._http.get(this.configureUrl + "getCriticalRegularionList", {
      params: {
        hasDistinct: hasDistinct,
        TenantId: tenantId,
        appId: appId
      }
    });
  }
  getCriticalLocationsList(hasDistinct: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getCriticalLocationsList", {
      params: {
        hasDistinct: hasDistinct,
        TenantId: tenantId
      }
    });
  }

  addStandard(standardObj: StandardObj, tenantId: string) {
    return this._http.post(
      this.configureUrl + "addStandard?TenantId=" + tenantId,
      standardObj,
      {
        responseType: "text"
      }
    );
  }

  addProfile(profileObj: CompilanceprofileStds, tenantId: string) {
    return this._http.post(
      this.configureUrl + "addProfile?TenantId=" + tenantId,
      profileObj,
      {
        responseType: "text"
      }
    );
  }

  editProfile(profileObj: CompilanceprofileStds, tenantId: string) {
    return this._http.post(
      this.configureUrl + "editProfile?TenantId=" + tenantId,
      profileObj,
      {
        responseType: "text"
      }
    );
  }

  getProfileDetailsById(profileID: number, classType: string, appId: string,tenantId:string)
  { return this._http.get(this.configureUrl + "getProfileDetailsById", {
    params: {
      profileID: profileID,
      classType: classType,
      appId: appId,
      tenantId: tenantId
    }
  });
}

  deleteProfile( profileID : number, TenantId :string ){
    return this._http.post(
      this.configureUrl + "deleteProfile?TenantId=" + TenantId,
      profileID,
      {
        responseType: "text"
      }
    );
  }


  addCriticalEnvLocation(envLocObj: EnvLocObj, tenantId: string) {
    return this._http.post(
      this.configureUrl + "addCriticalEnvLocation?TenantId=" + tenantId,
      envLocObj,
      {
        responseType: "text"
      }
    );
  }

  getPointSID(pointType: string, tenantId: string, keyword: string) {
    return this._http.get(this.configureUrl + "getPointSID", {
      params: {
        PointType: pointType,
        TenantId: tenantId,
        keyword: keyword
      }
    });
  }

  getStandardSID(appId: string, tenantId: string ,locationName: string,) {
    return this._http.get(this.configureUrl + "getStandardSID", {
      params: {
        appId: appId,
        TenantId: tenantId,
        locationName : locationName
      }
    });
  }


  getEnvStandardSID(appId: string, tenantId: string, locationName: string, profileID: number) {
    return this._http.get(this.configureUrl + "getEnvStandardSID", {
      params: {
        appId: appId,
        TenantId: tenantId,
        locationName: locationName,
        profileID: profileID
       
      }
    });
  }

  getLocation(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getLocation", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }
  getEqpLocation(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getEqpLocation", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }
  getEnvLocation(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getLocationName", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }
  getRoomName(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getRoomNames", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }
  getEqpName(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getEqpName", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }
  getStandards(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getStandards", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }
  getRegulations(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getRegulations", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }

  getDistinctRegulations(appId: string, tenantId: string, classType: string) {
    return this._http.get(this.configureUrl + "getDistinctRegulations", {
      params: {
        appId: appId,
        TenantId: tenantId,
        classType: classType
      }
    });

  }
  getDistinctFacets(appId: string, tenantId: string, classType: string) {
    return this._http.get(this.configureUrl + "getDistinctFacets", {
      params: {
        appId: appId,
        TenantId: tenantId,
        classType: classType
      }
    });

  }

  getDistinctStandardsInfo(appId: string, tenantId: string, classType: string,facetID :string ){
    return this._http.get(this.configureUrl + "getDistinctStandardsInfo", {
      params: {
        appId: appId,
        TenantId: tenantId,
        classType: classType,
        facetID:facetID
      }
    });

  }

  getEditEnvironmentRegulation(appId: string, tenantId: string, roomName: string, roomId: string) {
    return this._http.get(this.configureUrl + "getEditEnvironmentRegulation", {
      params: {
        appId: appId,
        TenantId: tenantId,
        roomName: roomName,
        roomId: roomId
      }
    });

  }
  getEditEquipmentRegulation(appId: string, tenantId: string, equipmentName: string, roomId: string) {
    return this._http.get(this.configureUrl + "getEditEquipmentRegulation", {
      params: {
        appId: appId,
        TenantId: tenantId,
        equipmentName: equipmentName,
        roomId: roomId
      }
    });

  }
  getProfileList(appId: string, tenantId: string){
    return this._http.get(this.configureUrl + "getProfileList", {
      params: {
        appId: appId,
        TenantId: tenantId,

      }
    });
  }

  getDistinctProfileList(appId: string, TenantId: string, classType: string){
    return this._http.get(this.configureUrl + "getDistinctProfileList", {
      params: {
        appId: appId,
        TenantId: TenantId,
        classType: classType
      }
    });
  }

  getRuleCode(appId: string, tenantId: string) {
    return this._http.get(this.configureUrl + "getRuleCode", {
      params: {
        appId: appId,
        TenantId: tenantId
      }
    });
  }

  updateCriticalEnvLocation(envLocObj: EnvLocObj, tenantId: string) {
    return this._http.post(
      this.configureUrl + "updateCriticalEnvLocation?TenantId=" + tenantId,
      envLocObj,
      {
        responseType: "text"
      }
    );
  }
  updateStandards(standardObj: StandardObj, tenantId: string) {
    return this._http.post(
      this.configureUrl + "updateStandards?TenantId=" + tenantId,
      standardObj,
      {
        responseType: "text"
      }
    );
  }
  deleteCriticalEnvLocation(roomName: string, locName: string, tenantId: string) {
    return this._http.get(
      this.configureUrl + "deleteCriticalEnvLocation",
      {
        params: {
          roomName: roomName,
          locName: locName,
          TenantId: tenantId
        },
        responseType: "text"
      }
    );
  }

  updateFacet(facetObj: Facet, tenantId: string) {
    return this._http.post(
      this.configureUrl + "updateFacet?TenantId=" + tenantId,
      facetObj,
      {
        responseType: "text"
      }
    );
  }
  getStandardCount(standardID: string, tenantId: string, appName: string) {
    return this._http.get(this.configureUrl + "getStandardCount", {
      params: {
        StandardID: standardID,
        TenantId: tenantId,
        appName: appName
      }
    });
  }
  deleteAssociatedStandard(
    standardID: string,
    tenantId: string,
    appName: string
  ) {
    return this._http.get(this.configureUrl + "deleteAssociatedStandard", {
      params: {
        StandardID: standardID,
        TenantId: tenantId,
        appName: appName
      },
      responseType: "text"
    });
  }
  deleteStandard(standardID: string, tenantId: string) {
    return this._http.post(this.configureUrl + "deleteStandard", standardID, {
      params: {
        TenantId: tenantId
      },
      responseType: "text"
    });
  }

  getCriticalEquipmentsList(hasDistinct: string, tenantId: string): Observable<any> {
    return this._http.get(this.configureUrl + "getCriticalEquipmentsList", {
      params: {
        hasDistinct: hasDistinct,
        TenantId: tenantId
      }
    });
  }
  addCriticalEqpLocation(eqpLocObj: EqpLocObj, tenantId: string) {
    return this._http.post(
      this.configureUrl + "addCriticalEqLocation?TenantId=" + tenantId,
      eqpLocObj,
      {
        responseType: "text"
      }
    );
  }
  updateCriticalEqLocation(eqpLocObj: EqpLocObj, tenantId: string) {
    return this._http.post(
      this.configureUrl + "updateCriticalEqLocation?TenantId=" + tenantId,
      eqpLocObj,
      {
        responseType: "text"
      }
    );
  }
  deleteCriticalEqLocation(equipmentName: string, locName: string, tenantId: string) {
    return this._http.get(
      this.configureUrl + "deleteCriticalEqLocation",
      {
        params: {
          equipmentName: equipmentName,
          locName: locName,
          TenantId: tenantId
        },
        responseType: "text"
      }
    );
  }


  getFilterStandards(appID, tenantId: string, classType: string, profileId: string) {
    return this._http.get(this.configureUrl + "getFilterStandards", {
      params: { appId: appID, TenantId: tenantId, classType: classType,  profileId:  profileId}
    });
  }

  getOnlyFilterStandards(appID, tenantId: string, classType: string) {
    return this._http.get(this.configureUrl + "getOnlyFilterStandards", {
      params: { appId: appID, TenantId: tenantId, classType: classType}
    });
  }
}

import { AdhocReporting } from "./../../../PmModel/adhoc-reporting";

import { Injectable, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { ReportObj } from "projects/AppAlarm/src/models/ReportObj";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { Trailicmodel } from "src/app/PmModel/trailicmodel.model";

//const API_URL = "api/ReportManager/";
const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/ReportManager/`;
const API_GRAFANA_URL = `${BASE_API_URL}/GrafanaAPI/`;

@Injectable({
  providedIn: "root"
})
export class ReportingService {
  constructor(private http: HttpClient, public toastr: ToastrService, @Inject('BASE_URL') private baseUrl: string) { }
  url = "api/ReportManager/";
  configureUrl = "api/LookupManager/";
  options = {
    headers: this.jwt(),
    params: null
  };
  private jwt() {
    // create authorization header with jwt token
    const currentUserToken = localStorage.getItem("bearerToken");
    if (currentUserToken) {
      let headers = new HttpHeaders({
        Authorization: "Bearer " + currentUserToken
      });
      return headers;
    }
  }

  public getSystemActivities(): Observable<any> {
    return this.http.get<any>(API_URL + "GetSystemActivities").pipe(
      tap(resp => {
      })
    );
  }

  runReport(
    reportObj: ReportObj,
  ) {
    return this.http.post(API_URL +
      "runReport",
      reportObj,
      {
        responseType: "text"
      }
    );
  }

  runReport1(
    reportObj: ReportObj,
    rptParamValues: string,
    tenantId: string,
    format: string,
    haschild: boolean
  ) {
    return this.http.post(API_URL +
      "runReport?ReportParams=" +
      rptParamValues +
      "&TenantID=" +
      tenantId +
      "&Format=" +
      format +
      "&HasChild=" +
      haschild,
      reportObj,
      {
        responseType: "text"
      }
    );
  }

  // tslint:disable-next-line: align
  getReportList(userId: string, appId: string, tenantId: string, rType: string): Observable<any> {
    return this.http.get(API_URL + "getReportsList", {
      params: {
        UserId: userId,
        AppId: appId,
        TenantId: tenantId,
        rType:
          rType === 'Reports' ? 'Report' :
            rType === 'Transformers' ? 'Transformer' :
              rType === 'Maintainers' ? 'Maintainer' :
                rType === 'Exporters' ? 'Exporter' :
                  rType === 'Importers' ? 'Importer' :
                    rType
      }
    });
  }

  getTransformersList(userId: string, appId: string, tenantId: string,): Observable<any> {
    return this.http.get(API_URL + "getTransformersList", {
      params: {
        UserId: userId,
        AppId: appId,
        TenantId: tenantId,

      }
    });
  }

  // Fetch the Appsetting.json file data
  getAppSettingConfig(): Observable<any> {
    return this.http.get(API_URL + 'ConfigurationData');
  }
  getTemplateParameterListAsync(templateId: string, tenantId: string): Observable<any> {
    return this.http.get(API_URL + "getTemplateParameterList",
      {
        params: { TemplateId: templateId, TenantId: tenantId }
      }
    );
  }

  getReportParameterValue(reportId: string, tenantId: string) {
    return this.http.get(API_URL + "getReportParameterValue", {
      params: { ReportId: reportId, TenantId: tenantId }
    });
  }

  getGrafanaDashboardUrl(reportId: string, tenantId: string) {
    return this.http.get(API_GRAFANA_URL + "GetGrafanaDashboardUrl", {
      params: { ReportId: reportId, TenantId: tenantId },
      responseType: 'text'
    });
  }

  getAnalyticDashboardUrl(tenantId: string) {
    return this.http.get(API_GRAFANA_URL + "getAnalyticDashboardUrl", {
      params: { TenantId: tenantId },
      responseType: 'text'
    });
  }

  getActiveReportedSIDsa(tenantId: string) {
    return this.http.get(API_URL + "getActiveReportedSIDs", {
      params: { TenantId: tenantId },
      responseType: 'text'
    });
  }


  getActiveReportedSIDs(tenantId: string, additionalData: Trailicmodel) {
    return this.http.post(API_URL + "getActiveReportedSIDs", { tenantId, additionalData }, {
      responseType: "text"
    });
  }

  saveReport(reportObj: ReportObj) {
    return this.http.post(API_URL + "saveReport", reportObj, {
      responseType: "text"
    }
    );
  }

  SaveMasterReport(TenantId: string, userid: string,) {
    return this.http.post(API_URL + "SaveMasterReport?TenantId=" + TenantId + "&userid=" + userid,
      {
        responseType: "text"
      });
  }

  CreatePredefinedReports(TenantId: string, userid: string, TabName: string,) {
    return this.http.post(API_URL + "CreatePredefinedReports?TenantId=" + TenantId + "&userid=" + userid + "&TabName=" + TabName,
      {
        responseType: "text"
      });
  }


  updateReport(reportObj: ReportObj) {
    return this.http.post(API_URL +
      "updateReport", reportObj, {
      responseType: "text"
    }
    );
  }

  deleteReport(ReportId: number, tenantId: string) {
    return this.http.post(API_URL + "deleteReport?TenantId=" + tenantId,
      ReportId,
      {
        responseType: "text"
      }
    );
  }

  getReportObjectExistsByRooms(reportId :string ,objectSID: string ,TenantId : string ,appId: string ,isChecked : boolean )
  {
    return this.http.get(API_URL + "getReportObjectExistsByRooms", {
      params: { reportId: reportId, objectSID: objectSID,TenantId : TenantId,appId:appId, isChecked : isChecked }
    }); 
  }



  checkReportName(reportName: string, tenantId: string): Observable<any> {
    return this.http.get(API_URL + "checkReportName", {
      params: { ReportName: reportName, TenantId: tenantId }
    });
  }

  checkDeviceLimitOnInstance(): Observable<boolean> {
    return this.http.get<boolean>(API_URL + "checkDeviceLimitOnInstance");
  }
  downloadCSV(reportObj: ReportObj) {
    return this.http.post(API_URL + "runReport", reportObj, {
      responseType: "blob"
    });
  }
  download(
    reportObj: ReportObj,
  ) {
    return this.http.post(API_URL + "runReport", reportObj, {
      responseType: "blob"
    });
  }
  download1(
    reportObj: ReportObj,
    rptParamValues: string,
    tenantId: string,
    format: string,
    hasChild: string
  ) {
    return this.http.post(API_URL + "runReport", reportObj, {
      params: {
        ReportParams: rptParamValues,
        TenantID: tenantId,
        Format: format,
        HasChild: hasChild
      },
      responseType: 'blob' as 'json',
      observe: 'response' as 'body',
    });

  }
  getPointSID(pointType: string, tenantId: string) {
    return this.http.get(this.configureUrl + "getPointSID", {
      params: {
        PointType: pointType,
        TenantId: tenantId
      }
    });
  }
  updateReportRunTime(ReportId, tenantId: string) {
    return this.http.post(API_URL + "updateReportRunTime?TenantId=" + tenantId,
      ReportId,
      {
        responseType: "text"
      }
    );
  }
  getEnergyLogUnits(tenantId: string, eUnitID: string) {
    return this.http.get(API_URL + "getEnergyLogUnits", {
      params: {
        TenantId: tenantId,
        EUnitID: eUnitID
      }
    });
  }
  getBacknetObjectList(objType: string, tenantId: string, queryParam: string) {
    return this.http.get(API_URL + "getBacknetObjectList", {
      params: {
        objType: objType,
        TenantId: tenantId,
        queryParam: queryParam
      }
    });
  }
  getHomeDashboardPath(rptPath: string, rptName: string, tenantId: string) {
    return this.http.get(API_URL + "getHomeDashboardPathForPortal", {
      params: {
        rptPath: rptPath,
        rptName: rptName,
        TenantId: tenantId
      },
      responseType: 'text'
    });
  }
  getAhdocReportData(adhocRpt: AdhocReporting, tenantId: string) {
    return this.http.post(API_URL + "AhdocReporting?TenantId=" + tenantId,
      adhocRpt,
      {
        responseType: "json"
      }
    );
  }
  connectToReportServerForQuickConnectivityInApps(tenantId: string) {
    return this.http.get(API_URL + "ConnectToRSForAppsAsync",
      {
        params: { TenantId: tenantId }
      }
    );
  }

  showSuccess(msg: string) {
    this.toastr.success(msg);
  }

  showError(msg: string) {
    this.toastr.error(msg);
  }


}


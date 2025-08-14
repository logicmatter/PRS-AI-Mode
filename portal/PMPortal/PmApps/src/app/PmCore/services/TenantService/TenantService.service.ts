import { Injectable, Inject, EventEmitter } from '@angular/core';

// import { switchMap, distinctUntilChanged, debounceTime, map, catchError } from 'rxjs/operators';
// Rxjs
import { map, catchError, debounceTime } from 'rxjs/operators';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Tenant } from '../../../PmModel/tenant.model';
import { CommonModel } from '../../../PmModel/common.model';
import { CommonDateModel } from '../../../PmModel/common-date.model';
import { TemplateConfiguration } from '../../../pages/template-manager/template-configuration/template-configuration';
import { AppTemplates } from '../../../pages/template-manager/template-deployment/template-model';
import { environment } from 'src/environments/environment';
// import { AppConfig } from '../app.config';
// import { User, Tenant } from '../_models/index';

// const API_URL = 'api/TenantManager/';
// const API_TEMPL_URL = 'api/TemplateManager/';
// const API_RPT_URL = 'api/ReportManager/';

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/TenantManager/`;
const API_TEMPL_URL = `${BASE_API_URL}/TemplateManager/`;
const API_RPT_URL = `${BASE_API_URL}/ReportManager/`;
const API_GRAFANA_URL = `${BASE_API_URL}/GrafanaAPI/`;


@Injectable({
  providedIn: 'root'
})
export class TenantService {
  options = {
    headers: this.jwt(),
    params: null
  }
  tenantSelected: EventEmitter<any> = new EventEmitter<any>();
  private currentTenantSubject: BehaviorSubject<CommonModel>;
  private currentDateSubject: BehaviorSubject<CommonDateModel>;
  public currentTenant: Observable<CommonModel>;
  public currentDate: Observable<CommonDateModel>;
  public tenant: Tenant = new Tenant();
  public commonModel: CommonModel = new CommonModel();
  public commonDateModel: CommonDateModel = new CommonDateModel();
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    this.commonDateModel.duration = 'today';
    this.commonDateModel.startDate = new Date(new Date().setHours(0, 0, 0));
    this.commonDateModel.endDate = new Date(new Date().setHours(23, 59, 59));
    this.commonDateModel.resolution = 'actual';
    this.currentTenantSubject = new BehaviorSubject<CommonModel>(this.commonModel);
    this.currentDateSubject = new BehaviorSubject<CommonDateModel>(this.commonDateModel);
    this.currentTenant = this.currentTenantSubject.asObservable();
    this.currentDate = this.currentDateSubject.asObservable();
  }
  public get currentTenantValue(): CommonModel {
    return this.currentTenantSubject.value;
  }
  public get currentDateValue(): CommonDateModel {
    return this.currentDateSubject.value;
  }

  getAllTenants(userId): Observable<any> {
    var headers = this.jwt();
    return this.http.get(API_URL + 'GetAllTenantsByUser', { params: { userId } }).pipe(tap(resp => {
      var tnt = resp[0];
      Object.assign(this.tenant, resp[0]);
      this.commonModel.tenantId = this.tenant.id;
      this.commonModel.tenantName = this.tenant.tenantName;
    }));
  }

  triggerTenantSelected(obj: any) {
    this.tenantSelected.emit(obj);
  }
  getTenantsList(): Observable<any> {
    return this.http.get(API_URL + 'GetAllTenants');
  }
  getTenantDetails(tenantId): Observable<any> {
    return this.http.get(API_URL + 'GetTenantInfo', { params: { tenantId } });
  }

  verifyTenant(tenantName): Observable<any> {
    return this.http.get(API_URL + 'CheckTenantExist', { params: { tenantName, 'dealerId': '' } });
  }
  private jwt() {
    // create authorization header with jwt token
    const currentUserToken = localStorage.getItem('bearerToken');
    if (currentUserToken) {
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + currentUserToken });
      return headers;
    }
  }

  setData(data: any) {
    this.currentTenantSubject.next(data);
  }

  setCommonDate(data: any) {
    this.currentDateSubject.next(data);
  }

  getRoutes(obj) {
    return this.http.get(API_URL + 'GetAllTenants', this.options).pipe(tap(resp => {
      var tnt = resp[0];
      Object.assign(this.tenant, resp[0]);
      this.commonModel.tenantId = this.tenant.id;
      this.commonModel.tenantName = this.tenant.tenantName;

      this.currentTenantSubject.next(this.commonModel);
    }));
  }

  getDurationDates(duration): Observable<any> {
    return this.http.get(API_URL + 'GetStartEndDates', { params: { duration } });
  }
  public saveTemplateConfiguration(templateConfiguration: any): Observable<any> {
    return this.http.post<any>(API_TEMPL_URL + 'SaveTemplateConfiguration', templateConfiguration);
  }
  public getTemplateConfiguration(selectedTenantId: string): Observable<TemplateConfiguration> {
    return this.http.get<TemplateConfiguration>(API_TEMPL_URL + 'GetTemplateConfiguration', { params: { selectedTenantId } });
  }
  public verifyTemplateExists(templateName: string, tenantId: string): Observable<any> {
    return this.http.get<any>(API_TEMPL_URL + 'VerifyTemplateNameExists?templateName=' + templateName + '&tenantId=' + tenantId);
  }
  public verifyGrafanaTemplateExists(templateName: string, tenantId: string): Observable<any> {
    return this.http.get<any>(API_GRAFANA_URL + 'VerifyTemplateNameExists?templateName=' + templateName + '&tenantId=' + tenantId);
  }
  public validateTemplate(templateModel: FormData): Observable<AppTemplates> {
    return this.http.post<AppTemplates>(API_TEMPL_URL + 'ValidateTemplate', templateModel);
  }

  public deployTemplate(templateInfo: FormData): Observable<any> {
    return this.http.post<any>(API_TEMPL_URL + 'DeployTemplate', templateInfo);
  }
  public validateGrafanaTemplate(templateModel: FormData): Observable<AppTemplates> {
    return this.http.post<AppTemplates>(API_GRAFANA_URL + 'ValidateTemplate', templateModel);
  }

  public deployGrafanaTemplate(templateInfo: FormData): Observable<any> { return this.http.post<any>(API_GRAFANA_URL + 'DeployTemplate', templateInfo); }

  public getTemplatesList(tenantId: any): Observable<any> {
    return this.http.get<any>(API_TEMPL_URL + 'GetAllAppTemplatesList', { params: { tenantId } });
  }
  public getGrafanaTemplatesList(tenantId: any): Observable<any> {
    return this.http.get<any>(API_GRAFANA_URL + 'GetAllGrafanaTemplatesList', { params: { tenantId } });
  }
  public downloadReportDefinition(tenantId: string, reportPath: string): Observable<any> {
    return this.http.get(API_TEMPL_URL + 'DownloadReportDefinition', {
      params: {
        tenantId, reportPath
      }, responseType: 'blob'
    });
  }
  public downloadDashboardDefinition(tenantId: string, reportName: string): Observable<any> {
    return this.http.get(API_GRAFANA_URL + 'DownloadDashboardDefinition', {
      params: {
        tenantId, reportName
      }, responseType: 'blob'
    });
  }
  public validateProcExists(templateModel: FormData): Observable<AppTemplates> {
    return this.http.post<AppTemplates>(API_TEMPL_URL + 'ValidateSQLProc', templateModel);
  }
  public getLicenseInfo(): Observable<any> {
    return this.http.get(API_RPT_URL + 'GetLicenseInfo');
  }
}

import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Datasource, DataFlow } from '../../../PmModel/datasource';
import { ConnectorsList } from '../../../PmModel/connectorsList';
import { TemplatesList } from '../../../PmModel/templatesLst';
import { SourceFiles } from '../../../PmModel/sourceFiles';
import { DataLoadHistory } from '../../../PmModel/dataLoadHistory';
import { ExceptionLogHistory } from '../../../PmModel/exceptionLogHistory';
import { environment } from 'src/environments/environment';

//const API_URL = 'api/FlowManager/';
const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/FlowManager/`;



@Injectable({
  providedIn: 'root'
})

export class FlowService {
  options = {
    headers: this.jwt(),
    params: null
  }
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  private url =  'api/FlowManager/';

  public getExceptionHistory(dataSourceId: number, tenantId: string): Observable<ExceptionLogHistory[]> {
    return this.http.get<ExceptionLogHistory[]>(API_URL + 'GetExceptionLogHistory/' + dataSourceId.toString() + '/' + tenantId.toString());
  }

  public getDataLoadHistory(dataSourceId: number, tenantId: string): Observable<DataLoadHistory[]> {
    return this.http.get<DataLoadHistory[]>(API_URL + 'GetDataLoadHistory/' + dataSourceId.toString() + '/' + tenantId.toString());
  }

  public getErrorRecordsByDatasourceHistory(dataSourceId: number, historyId: number, tenantId:string): Observable<any> {
    return this.http.get<any>(API_URL + 'GetErrorRecordsByDatasourceHistory/' + dataSourceId.toString() + '/' + historyId + '/' + tenantId.toString());
  }

  public getDataSourcesList(tenantId: string): Observable<Datasource[]> {
    return this.http.get<Datasource[]>(API_URL + 'GetDataSourcesList/' + tenantId);
  }

  public getDataFlowsList(tenantId: string): Observable<DataFlow[]> {
    return this.http.get<DataFlow[]>(API_URL + 'GetDataFlowList/' + tenantId);
  }

  public getConnectorsList(tenantId: string): Observable<ConnectorsList[]> {
    return this.http.get<ConnectorsList[]>(API_URL + 'GetConnectorsList/' + tenantId);
  }

  public getTemplatesList(selectedConnector: string, tenantId: string): Observable<TemplatesList[]> {
    return this.http.get<TemplatesList[]>(API_URL + 'GetTemplatesList/' + selectedConnector + '/' + tenantId);
  }

  public getGatewayCmdList(selectedConnector: string, tenantId: string): Observable<TemplatesList[]> {
    return this.http.get<TemplatesList[]>(API_URL + 'GetGatewayCmdList/' + selectedConnector + '/' + tenantId);
  }

  public GetIntialDaysListForCompass(selectedConnector: string, tenantId: string): Observable<TemplatesList[]> {
     return this.http.get<TemplatesList[]>(API_URL + 'GetIntialDaysListForCompass/' + selectedConnector + '/' + tenantId);
    }
  public getDataFlowTemplatesList(tenantId: string): Observable<TemplatesList[]> {
    return this.http.get<TemplatesList[]>(API_URL + 'GetTransformTemplatesList/' + tenantId);
  }

  public GetCompassSourceDetails(tenantId: string): Observable<TemplatesList[]> {
    return this.http.get<TemplatesList[]>(API_URL + 'GetCompassSourceDetails/' + tenantId);
  }

  public saveDatasource(datasource: Datasource): Observable<Datasource> {
    return this.http.post<any>(API_URL + 'SaveDatasource', datasource, this.options);
  }

  public SaveMasterDataSource(TenantId : string , userid : string, ) {
    return this.http.post( API_URL + "SaveMasterDataSource?TenantId="+TenantId+"&userid="+userid,
    {
      responseType: "text"    });
  }

  public CreatePredefinedDataSource(TenantId : string , userid : string, ) {
    return this.http.post( API_URL + "CreatePredefinedDataSource?TenantId="+TenantId+"&userid="+userid,
    {
      responseType: "text"    });
  }

  public saveDataFlow(dataFlow: DataFlow): Observable<DataFlow> {
    return this.http.post<any>(API_URL + 'SaveDataFlow', dataFlow, this.options);
  }

  public uploadSourceFile(file): Observable<any> {
    return this.http.post<any>(API_URL + 'UploadSourceFile', file);
  }

  public getDatasourceById(dataSourceId, tenantId): Observable<Datasource> {
    return this.http.get<Datasource>(API_URL + 'GetDatasourceById/' + dataSourceId.toString() + '/' + tenantId.toString());
  }

  public getDataFlowById(dataFlowId, tenantId): Observable<DataFlow> {
    return this.http.get<DataFlow>(API_URL + 'GetDataFlowById/' + dataFlowId.toString() + '/' + tenantId.toString());
  }

  public deleteDatasource(dataSourceId, tenantId): Observable<any> {
    return this.http.get<any>(API_URL + 'DeleteDatasorce/' + dataSourceId.toString() + '/' + tenantId.toString());
  }

  public deleteDataFlow(dataFlowId, tenantId): Observable<any> {
    return this.http.get<any>(API_URL + 'DeleteDataFlow/' + dataFlowId.toString() + '/' + tenantId.toString());
  }

  public saveSubscriptionTemplate(dataSourceId, tenantId): Observable<any> {
    return this.http.get<any>(API_URL + 'SaveSubscriptionTemplate/' + dataSourceId.toString() + '/' + tenantId.toString());
  }

  private jwt() {
    // create authorization header with jwt token
    const currentUserToken = localStorage.getItem('bearerToken');
    if (currentUserToken) {
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + currentUserToken });
      return headers;
    }
  }

  
}


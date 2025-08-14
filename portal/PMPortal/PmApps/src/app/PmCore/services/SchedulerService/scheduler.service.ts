import { Injectable, Inject } from '@angular/core';
// Rxjs
import { map, catchError, debounceTime } from 'rxjs/operators';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";

// Search Model
import { Apps } from '../../../PmModel/apps.model';
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { environment } from 'src/environments/environment';


// const API_URL = 'api/ScheduleManager/';
// const API_REPORT_URL = 'api/ReportManager/';
// const API_Flow_URL = 'api/FlowManager/';

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/ScheduleManager/`;
const API_REPORT_URL = `${BASE_API_URL}/ReportManager/`;
const API_Flow_URL = `${BASE_API_URL}/FlowManager/`;


@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  constructor(private http: HttpClient, public toastr: ToastrService, @Inject('BASE_URL') private baseUrl: string) { }

  getReportsSchedulesList(userObj: ReportUserModel): Observable<any> {
    return this.http.post<any>(API_URL + 'GetAllReportSchedules', userObj).pipe(tap(resp => {

    }));
  }
  getFlowSchedulesList(userObj: ReportUserModel): Observable<any> {
    return this.http.post<any>(API_URL + 'GetAllFlowSchedules', userObj).pipe(tap(resp => {

    }));
  }

  getGatewaySchedulesList(userObj: ReportUserModel): Observable<any> {
    return this.http.post<any>(API_URL + 'GetAllGatewaySchedules', userObj).pipe(tap(resp => { }));
  }

  getReportsScheduledFiles(userObj: ReportUserModel): Observable<any> {
    return this.http.post<any>(API_URL + 'GetReportScheduleFiles', userObj).pipe(tap(resp => {

    }));
  }


  DeleteReportsScheduledFiles(filePath: string) {
    return this.http.post(API_URL + "DeleteReportsScheduledFiles?filePath=" + filePath,
      {
        responseType: "text"
      }
    );
  }



  getReportDetails(userObj: ReportUserModel) {
    return this.http.post<any>(API_REPORT_URL + 'GetReportDetails', userObj).pipe(tap(resp => {

    }));
  }
  getDataSourceDetails(userObj: ReportUserModel, flowType) {
    if (flowType == 'dataFlow') {
      return this.http.get<any>(API_Flow_URL + 'GetDataFlowById/' + userObj.dataFlowId + '/' + userObj.tenantId);
    } else {
      return this.http.get<any>(API_Flow_URL + 'GetDatasourceById/' + userObj.dataSourceId + '/' + userObj.tenantId);
    }
  }

  createSchedule(scheduleObj): Observable<any> {
    return this.http.post<any>(API_URL + 'CreateReportSchedule', scheduleObj).pipe(tap(resp => { }));
  }
  createFlowSchedule(scheduleObj, flowType): Observable<any> {
    if (flowType == 'dataFlow') {
      return this.http.post<any>(API_URL + 'CreateDataFlowSchedule', scheduleObj).pipe(tap(resp => { }));
    }
    else if (flowType == 'dataSource') {
      return this.http.post<any>(API_URL + 'CreateFlowSchedule', scheduleObj).pipe(tap(resp => { }));
    }

    else if (flowType == 'gateway') {
      //  else{
      return this.http.post<any>(API_URL + 'CreateGatewaySchedule', scheduleObj).pipe(tap(resp => { }));
    }
    else if (flowType == 'Transformers') {
      return this.http.post<any>(API_URL + 'CreateFlowSchedule', scheduleObj).pipe(tap(resp => { }));
    }

  }
  getReportScheduleDetails(scheduleObj): Observable<any> {
    return this.http.post<any>(API_URL + 'GetScheduleDetails', scheduleObj).pipe(tap(resp => { }));
  }



  getFlowScheduleDetails(scheduleObj, flowType): Observable<any> {
    if (flowType == 'dataFlow') {
      return this.http.post<any>(API_URL + 'GetDataFlowScheduleDetails', scheduleObj).pipe(tap(resp => { }));
    }
    else if (flowType == 'dataSource') {
      return this.http.post<any>(API_URL + 'GetFlowScheduleDetails', scheduleObj).pipe(tap(resp => { }));
    } else if (flowType == 'gateway') {
      return this.http.post<any>(API_URL + 'GetGatewayScheduleDetails', scheduleObj).pipe(tap(resp => { }));
    }
    else if (flowType == 'Transformers') {
      return this.http.post<any>(API_URL + 'GetFlowScheduleDetails', scheduleObj).pipe(tap(resp => { }));
    }
  }


  pauseSchedule(model): Observable<any> {
    return this.http.post<any>(API_URL + 'PauseSchedule', model).pipe(tap(resp => { }));
  }
  resumeSchedule(model): Observable<any> {
    return this.http.post<any>(API_URL + 'ResumeSchedule', model).pipe(tap(resp => { }));
  }
  deleteSchedule(model): Observable<any> {
    return this.http.post<any>(API_URL + 'RemoveSchedule', model).pipe(tap(resp => { }));
  }
  pauseFlowSchedule(model, flowType): Observable<any> {
    if (flowType == 'dataFlow') {
      return this.http.post<any>(API_URL + 'PauseDataFlowSchedule', model).pipe(tap(resp => { }));
    } else {
      return this.http.post<any>(API_URL + 'PauseFlowSchedule', model).pipe(tap(resp => { }));
    }
  }
  resumeFlowSchedule(model, flowType): Observable<any> {
    if (flowType == 'dataFlow') {
      return this.http.post<any>(API_URL + 'ResumeDataFlowSchedule', model).pipe(tap(resp => { }));
    } else {
      return this.http.post<any>(API_URL + 'ResumeFlowSchedule', model).pipe(tap(resp => { }));
    }
  }
  deleteFlowSchedule(model, flowType): Observable<any> {
    if (flowType == 'dataFlow') {
      return this.http.post<any>(API_URL + 'RemoveDataFlowSchedule', model).pipe(tap(resp => { }));
    }
    else if (flowType == 'dataSource') {
      return this.http.post<any>(API_URL + 'RemoveFlowSchedule', model).pipe(tap(resp => { }));
    } else if (flowType == 'gateway') {
      return this.http.post<any>(API_URL + 'RemoveGatewaySchedule', model).pipe(tap(resp => { }));
    }
    else if (flowType == 'Transformers') {
      return this.http.post<any>(API_URL + 'RemoveFlowSchedule', model).pipe(tap(resp => { }));
    }
  }
  getServerTime(): Observable<any> {
    return this.http.get<any>(API_URL + 'GetServerTime').pipe(tap(resp => { }));
  }

  showSuccess(msg: string) {
    this.toastr.success(msg);
  }

  showError(msg: string) {
    this.toastr.error(msg);
  }
}

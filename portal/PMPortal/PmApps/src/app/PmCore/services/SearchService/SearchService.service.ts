import { Injectable, Inject } from '@angular/core';
// Rxjs
import { map, catchError, debounceTime } from 'rxjs/operators';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// Search Model
import { Search } from '../../../PmModel/search.model';
import { environment } from 'src/environments/environment';
//const API_URL = 'api/SearchManager/';
const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/SearchManager/`;

@Injectable({
  providedIn: 'root'
})
export class SearchServiceService {
  options = {
    headers: this.jwt(),
    params: null
  }
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getSearchList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getAlarmList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getDeviceList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getTrendLogList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getTrendLogListLookUp(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetLookUpObjects', searchObj).pipe(tap(resp => {

    }));
  }
  getEnergyList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getPointsList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getReportsList(searchObj: Search): Observable<any> {
    return this.http.post<any>(API_URL + 'GetSearchList', searchObj).pipe(tap(resp => {

    }));
  }
  getSearchListBySid(searchObj: Search) {
    return this.http.post<any>(API_URL + 'GetSearchBySid', searchObj).pipe(tap(resp => {

    }));
  }

  public getReportPaths(): Observable<any> {
    return this.http.get<any>(API_URL + 'GetReportPath').pipe(tap(resp => {

    }));
  }
  public GetSearchObject(): Observable<any> {
    return this.http.get<any>(API_URL + 'GetSearchObject').pipe(tap(resp => {

    }));
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

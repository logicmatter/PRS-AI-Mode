import { Injectable, Inject } from '@angular/core';
// Rxjs
import { map, catchError, debounceTime } from 'rxjs/operators';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// Search Model
import { Apps } from '../../../PmModel/apps.model';
import { environment } from 'src/environments/environment';

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/AppsManager/`;


@Injectable({
  providedIn: 'root'
})
export class AppService {
  options = {
    headers: this.jwt(),
    params: null
  }
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getAppsList(): Observable<any> {
    return this.http.get<any>(API_URL + 'GetAllApps').pipe(tap(resp => {
    }));
  }

  getAppInfo(appId): Observable<Apps> {
    return this.http.get<Apps>(API_URL + 'GetAppInfo', { params: { appId } }).pipe(tap(resp => {
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

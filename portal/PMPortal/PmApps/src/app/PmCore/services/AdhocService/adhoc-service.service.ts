import { Injectable, Inject } from '@angular/core';


// Adhoc Model
import { AdhocAnalysis } from '../../../PmModel/adhoc-analysis';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/AdhocManager/`;

@Injectable({
  providedIn: 'root'
})
export class AdhocService {
  options = {
    headers: this.jwt(),
    params: null
  }
  constructor(private http: HttpClient,@Inject('BASE_URL') private baseUrl: string) { }

  getAdhocList(adhocObj: AdhocAnalysis): Observable<any> {
    return this.http.post<any>( API_URL + 'GetObjectList', adhocObj).pipe(tap(resp => {
      }));
}

getObjectBySid(adhocObj: AdhocAnalysis) {
  return this.http.post<any>( API_URL + 'GetObjectBySid', adhocObj).pipe(tap(resp => {
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

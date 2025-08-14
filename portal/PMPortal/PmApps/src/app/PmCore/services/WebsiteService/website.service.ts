import { Injectable, Inject } from '@angular/core';
// Rxjs
import { map, catchError, debounceTime } from 'rxjs/operators';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { WebsiteConfigModel } from 'src/app/PmModel/WebsiteConfig.model';
import { environment } from 'src/environments/environment';
import { TenantConfigModel } from 'src/app/PmModel/TenantConfigModel';


//const API_URL = 'api/websiteManager/';
const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/websiteManager/`;

@Injectable({
  providedIn: 'root'
})
export class WebsiteService {
  siteTopLogo: any = '';
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  saveWebsiteLogo(siteConfig: WebsiteConfigModel): Observable<any> {
    return this.http.post<any>(API_URL + 'SaveWebsiteConfig', siteConfig).pipe(tap(resp => { }));
  }

  getWebsiteLogo(): Observable<any> {
    return this.http.get<any>(API_URL + 'GetWebsiteConfig').pipe(tap(resp => { }));
  }

  SaveTenantFriendlyDetails(tenantConfig: TenantConfigModel): Observable<any> {
    return this.http.post<any>(API_URL + 'SaveTenantFriendlyDetails', tenantConfig).pipe(tap(resp => { }));
  }
}

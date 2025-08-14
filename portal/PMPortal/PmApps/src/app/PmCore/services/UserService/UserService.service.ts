// Angular
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
// Http Request
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Rxjs
import { map, catchError } from 'rxjs/operators';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Models
import { AppUser, AppUserAuth } from 'src/app/PmModel/auth.model';
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { JwtHelperService } from '@auth0/angular-jwt';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

// Account Managemnet Api URL
//const API_URL = 'api/AccountManager/';
// user Managemnet Api URL
//const API_URL2 = 'api/UserManager/';

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/AccountManager/`;
const API_URL2 = `${BASE_API_URL}/UserManager/`;


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userObject: AppUserAuth = new AppUserAuth();
  jwtHelper = new JwtHelperService();
  constructor(private http: HttpClient, private router: Router, @Inject('BASE_URL') private baseUrl: string) { }
  login(entity: AppUser): Observable<AppUserAuth> {
    // Initialize security object
    // this.resetuserObject();

    return this.http.post<AppUserAuth>(API_URL + 'login',
      entity, httpOptions).pipe(
        tap(resp => {
          // Use object assign to update the current object
          // NOTE: Don't create a new AppUserAuth object
          //       because that destroys all references to object
          Object.assign(this.userObject, resp);
          // Store into local storage

        }));
  }

  logout(): Observable<any> {
    this.resetuserObject();
    localStorage.clear();
    return this.http.get<any>(API_URL + 'logout').pipe(tap(resp => {
      window.location.href = 'auth/login';
      window.location.reload();
    }));
  }

  resetuserObject(): void {
    this.userObject.userName = '';
    this.userObject.bearerToken = '';
    this.userObject.isAuthenticated = false;
    localStorage.removeItem('bearerToken');
  }

  isTokenExpired(): boolean {
    if (localStorage.bearerToken) {
      return this.jwtHelper.isTokenExpired(localStorage.bearerToken);
    }
    return false;
  }

  getLoginUserRoles(): any {
    if (localStorage.bearerToken) {
      var val = this.jwtHelper.decodeToken(localStorage.bearerToken);
      return val.roles;
    }
  }

  // get User Permissons amd Components
  public getUserPermissions(): Observable<any> {
    return this.http.get<any>(API_URL2 + 'GetUserPermissions').pipe(tap(resp => {

    }));
  }

  public forgotPassword(email): Observable<any> {
    return this.http.get<any>(API_URL + 'ForgotPassword', { params: { email } });
  }

  public resetSession(): Observable<any> {
    return this.http.get<any>(API_URL2 + 'ManageSession').pipe(tap(resp => {

    }));
  }
  public resetPassword(resetObject: any): Observable<any> {
    return this.http.post<any>(API_URL + 'ResetPassword', resetObject);
  }
  public userResetPassword(resetObject: any): Observable<any> {
    return this.http.post<any>(API_URL2 + 'ResetPassword', resetObject);
  }
  // public getUserPermissions(): Observable<any> {
  //   return this.http.get('../../../../../assets/files/UserManagement.json').pipe(
  //     map((res: any) => res),
  //     catchError(this.errorHandler));
  // }

  errorHandler(error: Response) {
    return observableThrowError(error);
  }

  public createNewUser(regForm: any) {
    return this.http.post<any>(API_URL2 + 'CreateUser', regForm);
  }
  public updateDefaultUser(regForm: any) {
    return this.http.post<any>(API_URL2 + 'UpdateDefaultUser', regForm);
  }
  public updateUser(regForm: any) {
    return this.http.post<any>(API_URL2 + 'UpdateUser', regForm);
  }
  public GetUserInfoById(userId: any) {
    return this.http.get<any>(API_URL2 + 'GetUserInfoById', { params: { userId } });
  }

  public updateUserStatus(userId: string) {
    return this.http.get<any>(API_URL2 + 'UpdateUserStatus', { params: { userId } });
  }

  public updateUserRole(userId: string, canManage: any) {
    return this.http.get<any>(API_URL2 + 'UpdateUserRole', { params: { userId, canManage } });
  }

  public verifyUserExists(emailId: any): Observable<any> {
    return this.http.get<any>(API_URL2 + 'VerifyUserExists', { params: { emailId } });
  }

  public verifyUserExistsById(userId: string): Observable<any> {
    return this.http.get<any>(API_URL + 'VerifyUserExistsById', { params: { userId } });
  }

  public updateUserDetails(rptObj: any): Observable<any> {
    return this.http.post<any>(API_URL2 + 'UpdateReportUserAccess', rptObj.reportObj, { params: { 'tenantId': rptObj.tenantId } });
  }

  // get the list of Users
  public getUsersList(): Observable<any> {
    return this.http.post<any>(API_URL2 + 'GetAllUsers', {});
  }

  public getReportsList(tenantId: string): Observable<any> {
    return this.http.get<any>(API_URL2 + 'GetAllReportsByTenant', { params: { 'tenantId': tenantId } });
  }

  public getUserReportsList(rptUserObj: ReportUserModel): Observable<any> {
    return this.http.post<any>(API_URL2 + 'GetReportsByUser', rptUserObj);
  }

  public getReportUsersList(rptUserObj: ReportUserModel): Observable<any> {
    return this.http.post<any>(API_URL2 + 'GetReportAccessUsers', rptUserObj);
  }

  public updateAssignedReports(usrObj: any): Observable<any> {
    return this.http.post<any>(API_URL2 + 'UpdateReportsAccess', usrObj.userObj, { params: { 'tenantId': usrObj.tenantId } });
  }

  public updateAssignedUsers(rptObj: any): Observable<any> {
    return this.http.post<any>(API_URL2 + 'UpdateReportUserAccess', rptObj.reportObj, { params: { 'tenantId': rptObj.tenantId } });
  }

  // get the list of Users with reports
  public getUsersListWithReports(): Observable<any> {
    return this.http.post<any>(API_URL2 + 'GetAllUsers', httpOptions);
  }

  public validateLicense(): Observable<any> {
    return this.http.get<any>(API_URL + 'ValidateLicense');
  }
}
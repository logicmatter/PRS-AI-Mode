import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthGuard } from './auth-guard.service';
import { JwtHelperService } from '@auth0/angular-jwt';
@Injectable({
  providedIn: 'root'
})
export class RoleguardService implements CanActivate {
  userDetails: any;
  isRoleExists: boolean = false;
  jwtHelper = new JwtHelperService();
  isAuthenticate: any;
  constructor(public auth: AuthGuard, public router: Router) {
    this.userDetails = localStorage.bearerToken;
    this.isAuthenticate = this.jwtHelper.decodeToken(this.userDetails);
  }
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
    const expectedRole = route.data.expectedRole;

    const token = localStorage.bearerToken;

    // decode the token to get its payload
    const tokenPayload = this.jwtHelper.decodeToken(this.userDetails);
    expectedRole.forEach(role => {
      if (tokenPayload.roles === role) {
        this.isRoleExists = true;
      }
      if (!this.isRoleExists) {
        this.router.navigate(['/home/apps']);
        return false;
      }
    });
    return true;
  }
  getRoutesList() {
    var token = this.jwtHelper.decodeToken(this.userDetails);
    return JSON.parse(token.userPrivileges);
  }
}

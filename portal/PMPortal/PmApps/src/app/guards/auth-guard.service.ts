import { UserService } from './../PmCore/services/UserService/UserService.service';
import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
//import { RoleguardService } from './roleguard.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  userDetails: any;
  jwtHelper = new JwtHelperService();
  isAuthenticate: any;
  isValid: boolean;
  constructor(
    private router: Router,
    private userService: UserService,
    @Inject('BASE_URL') private baseUrl: string
    //private roleGaurd: RoleguardService
  ) {
    this.userDetails = localStorage.bearerToken;
    this.isAuthenticate = this.jwtHelper.decodeToken(this.userDetails);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.bearerToken) {
      const token = localStorage.bearerToken;
      this.isValid = this.jwtHelper.isTokenExpired(token);
      if (!this.isValid) {
        return true;
      }
      else {
            // you can save redirect url so after authoring we can move them back to the page they requested
            this.userService.logout().pipe().subscribe(
              resp=>{
                window.location.href = 'auth/login';
                window.location.reload();
              }
            );
    //location.reload();
      }
    }
    else {
      this.userService.logout().pipe().subscribe(
      resp=>{
        window.location.href = 'auth/login';
        window.location.reload();
      }
    );
      
      return;
      //this.router.navigateByUrl('/auth/login');
    }

    return false;

  }
  canLoad(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //var privList = this.roleGaurd.getRoutesList();
    //if (privList) {
    //  privList.forEach(x => {
    //    if (x.value == route.url)
    //      return true;
    //  });
    //}

    return true;
  }
  public isAuthenticated(): boolean {

    const token = localStorage.bearerToken;

    // Check whether the token is expired and return
    // true or false
    return !this.jwtHelper.isTokenExpired(token);
  }
}

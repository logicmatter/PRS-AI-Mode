import { Injectable, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(@Inject('BASE_URL') private baseUrl: string) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 441) {
        // auto logout if 401 response returned from api
        //this.authenticationService.logout();
        console.log("License validation error occurred");
        //alert("License validation error occurred");
        location.href = "auth/license";
        location.reload();
        return;
      }
      if (err.url.indexOf("Account/Login") > 0) {
        localStorage.clear();
        location.href = "auth/login";
        location.reload();
        return;
      }
      //const error = err.error.message || err.statusText;
      return throwError(err);
    }))
  }
}

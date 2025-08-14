import { Component, OnInit, ChangeDetectorRef, HostListener} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from, Subscription } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { AppUtilService, DeleteDialog } from "src/app/PmCore/shared/app-util.service";

// Jwt Decoder
import { JwtHelperService } from '@auth0/angular-jwt';

// Material
import { MatDialog } from '@angular/material/dialog';
import { TimeoutService } from './PmCore/services/timeout.service';
import { ReportingService } from './PmCore/services';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'PortalClientApp';
  userDetails: any;
  helper = new JwtHelperService();
  isAuthorized: any;
  validUser: boolean;

  constructor() { }

  ngOnInit() {
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    if (localStorage.bearerToken) {
      if (this.isAuthorized.isAuthenticated) {
        this.validUser = true;
      } else {
        this.validUser = false;
      }
    }

  }

  }


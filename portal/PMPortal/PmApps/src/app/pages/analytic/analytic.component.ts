import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { TenantService } from '../../PmCore/services/TenantService/TenantService.service';
import { Tenant } from '../../PmModel/tenant.model';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { ToolbarComponent } from 'src/app/layout';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportingService } from 'src/app/PmCore/services/ReportingService/ReportingService.service';

@Component({
  selector: 'app-analytic',
  templateUrl: './analytic.component.html',
  styleUrls: ['./analytic.component.scss']
})
export class AnalyticComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  Grafanaurl: any;


  constructor(private route: ActivatedRoute, public tenantService: TenantService, private formBuilder: FormBuilder, private _utility: AppUtilService,
    public utility: UtilityService, private _route: Router, public _toolbar: ToolbarComponent, private _rptService: ReportingService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this._utility.pmanalyticmode = true;
    this.utility.entitySelected = "Reports"
    this._utility.showSpinner = false;
    this.getanalytic();
  }

  goBack() {
    this._route.navigateByUrl("home/apps");
  }

  getanalytic() {
    const tid = window.location.href.split("/").pop();
    this._rptService.getAnalyticDashboardUrl(tid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        a => {
          const base = a;
          const { startDate, endDate, resolution, duration } = this.tenantService.commonDateModel;
          let grafanaBaseUrl = `${base}&var-tn=${tid}&theme=light&from=${new Date(startDate).getTime()}&to=${new Date(endDate).getTime()}&var-dr=${duration}&var-res=${resolution}`;
          let grafanaUrl = grafanaBaseUrl;
          this.Grafanaurl = this.sanitizer.bypassSecurityTrustResourceUrl(grafanaUrl);
        }
      );
  }
}

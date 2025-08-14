import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantService } from 'src/app/PmCore/services/TenantService/TenantService.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';




@Component({
  selector: 'app-template-manager-dashboard',
  templateUrl: './template-manager-dashboard.component.html',
  styleUrls: ['./template-manager-dashboard.component.css']
})
export class TemplateManagerDashboardComponent implements OnInit {
  public isExpanded = false;
  navLinks: any[];
  activeLinkIndex = -1;
  dummy;
  tenants: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    private router: Router,
    public tenantService: TenantService,
    private route: ActivatedRoute,
    private _utility: AppUtilService,
    public utility: UtilityService,) {
    this.navLinks = [];
    this.navLinks = [
      {
        label: 'Template Configuration',
        link: './template-config',
        index: 0
      },
      {
        label: 'Template List',
        link: './template-list',
        index: 1
      },
      {
        label: 'Template Deployment',
        link: './template-deploy',
        index: 2
      },
      {
        label: 'Website Configuration',
        link: './site-config',
        index: 3
      },
      {
        label: 'Tenant Friendly Name',
        link: './tenant-friendly',
        index: 4

      }

    ];
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this.utility.entitySelected = "Reports";
    this.getTenants();
    this._utility.showSpinner = false;

    const urlSegments = this.router.url.split('/');
    const dummy = this.navLinks.map(item => item.link);

    this.activeLinkIndex = dummy.findIndex(link => {
      const targetLink = './' + urlSegments[2];
      return link === targetLink || link === './' + urlSegments[3];
    });
  }

  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        }
        //   this.tenantService.getTenantsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        //     this.tenantsList = resp;

        //   });
      }, err => {
        console.log(err);
      });

  }

  getRouterLink(index: number): string {
    switch (index) {
      case 1:
        return "/template-manager/template-config";
      case 2:
        return "/template-manager/template-list";
      case 3:
        return "/template-manager/template-deploy";
      case 4:
        return "/template-manager/template-site-config";
      case 5:
        return "/template-manager/template-tenant-friendly";
      default:
        return "/";
    }
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }


}
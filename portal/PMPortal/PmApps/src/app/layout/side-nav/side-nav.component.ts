
// Angular
import { Component, OnInit, Input, ViewChild, OnChanges, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
// Model Components
import { ToolbarComponent } from '../toolbar/toolbar.component';

// Service Call
import { UserService } from '../../PmCore/services/UserService/UserService.service';
import { RoleguardService } from 'src/app/guards/roleguard.service';
import { UserIdleService } from 'angular-user-idle';

const SMALL_WIDTH_BREAKPOINT = 720;

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  @ViewChild(MatSidenav, { static: true }) sidenav: MatSidenav;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  @Input() subMenuState;
  // create child component
  //@ViewChild(MatSidenav, { static: true }) sidenav: MatSidenav;
  @ViewChild(ToolbarComponent, { static: false }) toolbar;
  _isExpand: number = 0;

  @Input()
  set isExpand(isExpand: number) {
    this._isExpand = isExpand;
    console.log(isExpand);
  }
  sideNavs: any = [];
  navCntrl: any = [];
  private mediaMatcher: MediaQueryList =
    matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);

  constructor(private router: Router,
    private userService: UserService,
    private roleGaurd: RoleguardService,
    private userIdle: UserIdleService,
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'template-manager',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/svg/template-manager.svg'));
  }

  ngOnInit() {
    this.generateSideNav();
    this.router.events.subscribe(() => {
      if (this.isScreenSmall()) {
        this.sidenav.open();
      }
    });
  }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }
  generateSideNav() {
    this.navCntrl = this.roleGaurd.getRoutesList();

    //this.userService.getUserPermissions().subscribe(
    //    access => {
    //      this.navCntrl = access;
    //    });
  }


}
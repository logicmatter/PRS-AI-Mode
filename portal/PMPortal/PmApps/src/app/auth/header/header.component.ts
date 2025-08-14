import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/PmCore/services';
import { UserService } from '../../PmCore/services/UserService/UserService.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(public userService: UserService,public websiteService: WebsiteService,) { }

  ngOnInit() {
    this.getWebsiteConfig();
  }
  clickLog() {
    console.log('Clicked');
  }

  getWebsiteConfig(){
    this.websiteService.getWebsiteLogo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp=>{
      this.websiteService.siteTopLogo = resp.siteLogo;
    },err=>{

    });
  }
}

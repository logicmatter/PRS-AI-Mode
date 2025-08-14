import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { WebsiteService } from 'src/app/PmCore/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WebsiteConfigModel } from 'src/app/PmModel/WebsiteConfig.model';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnInit, OnDestroy {
  fileToUpload: any;
  imageUrl: any;
  imageType: string;
  siteConfigModel: WebsiteConfigModel;
  saveConfig: boolean = false;
  siteImageSize:boolean = false;
  width:number;
  height:number;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(public websiteService: WebsiteService, public _utility: AppUtilService,private _toastr: ToastrService,) {

  }

  ngOnInit() {
    this.siteConfigModel = new WebsiteConfigModel();
    this.getWebsiteLogo();
  }
  handleFileInput(file: FileList) {
    this.siteImageSize = false;
    if (file.length == 0) {
      return;
    }
    if(file.item(0).size > 300000){
      this.width = null;
      this.height = null;
      this.siteImageSize = true;
      return;
    }
    this.fileToUpload = file.item(0);
    this.imageType = file.item(0).type;
    //Show image preview
    let reader = new FileReader();
    reader.onload = (event: any) => {
      var img = new Image();
      this.imageUrl = event.target.result;
      img.src = event.target.result;
      img.onload = () => {
        this.width = img.width;
        this.height = img.height;
    };
    }
    reader.readAsDataURL(this.fileToUpload);
  }

  saveWebsiteLogo() {
    if (!this._utility.licenseInfo.customizationEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      this.imageUrl=this.websiteService.siteTopLogo;
      return;
    }
    if (this.imageUrl == undefined || this.imageUrl == '' || this.imageUrl == this.siteConfigModel.siteLogo  ) {
      this._toastr.success("Image url is empty or Same url");
      return;
    }
    else
    {
      
    this.saveConfig = true;
    this.siteConfigModel.siteLogo = this.imageUrl;
    this.siteConfigModel.siteLogoType = this.imageType;
    this.websiteService.saveWebsiteLogo(this.siteConfigModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.saveConfig = false;
        this.websiteService.siteTopLogo = resp;
        this._toastr.success("Uploaded logo successfully");
        
        
      }
    }, err => {
      this.saveConfig = false;

    });

    }
    
  }
  getWebsiteLogo() {
    this.websiteService.getWebsiteLogo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.siteConfigModel = resp;
      this.imageUrl = this.siteConfigModel.siteLogo;
    }, err => {

    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
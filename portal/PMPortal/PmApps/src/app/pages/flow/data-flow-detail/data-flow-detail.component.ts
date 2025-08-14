import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FlowService } from '../../../PmCore/services/FlowService/flow.service';
import { TenantService } from '../../../PmCore/services/TenantService/TenantService.service';
import { CommonModel } from '../../../PmModel/common.model';
import { ConnectorsList } from '../../../PmModel/connectorsList';
import {  DataFlow } from '../../../PmModel/datasource';
import { SourceFiles } from '../../../PmModel/sourceFiles';
import { TemplatesList } from '../../../PmModel/templatesLst';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-data-flow-detail',
  templateUrl: './data-flow-detail.component.html',
  styleUrls: ['./data-flow-detail.component.scss']
})
export class DataFlowDetailComponent implements OnInit, OnDestroy {
   dataFlowModel:  DataFlow = new  DataFlow();
  originalDataFlow:  DataFlow;
  showLoadButton: false;
  connectorType: string;
  connectorsList: ConnectorsList[];
  templatesList: TemplatesList[];
  dataFlowId: number;
  fileToUpload: File;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  formData = new FormData();
  sourceFileName = "Choose file...";
  subModel: SourceFiles = new SourceFiles();
  showFields: boolean;
  tenants: CommonModel;
  showSpinner: boolean;
  constructor(
    private _route: ActivatedRoute,
    private _service: FlowService,
    private _router: Router,
    private _configService: TenantService,
    private _toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.dataFlowId = +this._route.snapshot.paramMap.get('dataFlowId');
    this.getTenants();
  }

  getTenants() {
    this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        } else if (!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")) {
          return;
        } else {
          this.createOrLoad(this.dataFlowId);
        }
      }, err => {
        console.log(err);
      });
  }

  createOrLoad(dataFlowId: number) {
    this.showSpinner = true;
    this.getTemplatesList('');
    if (dataFlowId === -1) {
      this.initDataFlow();
    } else {
      this._service.getDataFlowById(dataFlowId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.dataFlowModel = resp[0];
        var subArr = resp[0].sourceFileLocation.split("\'");
        this.sourceFileName = subArr[subArr.length - 1];
        this.originalDataFlow = Object.assign({}, this.dataFlowModel);
        //this.getConnectorsList();
        //let id = this.dataFlowModel.connectorType;

      });
    }
    this.showSpinner = false;
  }

  initDataFlow(): void {
    this.dataFlowModel = new  DataFlow({
    });
    this.originalDataFlow = Object.assign({}, this.originalDataFlow);
    //this.getConnectorsList();
  }

  onChangeConnector(event): void {
    if (event.target.value == "1454C60D-B03D-42A7-8154-0ED6A6DA253B" || event.target.value == "EA090389-27DB-4AC3-B7B5-6C3E46DA5591") {
      this.showFields = true;
    } else {
      this.showFields = false;
    }
    this.dataFlowModel.connectorType = event.target.value;
    this.getTemplatesList(event.target.value);
  }

  editFlow(): void {
    this._router.navigate(['/flow-edit/', '1']);
  }

  getConnectorsList(): void {
    this._service.getConnectorsList(this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.connectorsList = resp;
      }
    });
  }

  getTemplatesList(selectedConnector: string): void {
    this._service.getDataFlowTemplatesList(this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.templatesList = resp;
      }
    });
  }

  saveDataFlow(): void {
    this.dataFlowModel.tenantId = this.tenants.tenantId;
    if (this.dataFlowId === -1) {
      this.dataFlowModel.createdBy = this.tenants.userId;
    }
    this.dataFlowModel.modifiedBy = this.tenants.userId;
    this._service.saveDataFlow(this.dataFlowModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this._toastr.success("Data Flow saved successfully");
      this._router.navigate(['/data-flow-list/']);
    }, err => {
        this._toastr.error("Failed to save DataFlow");
    });
  }

  sourceFileInputOnchange(fileInput): void {
    if (fileInput.target.files.length == 1) {
      this.fileToUpload = fileInput.target.files[0];
      this.formData.append('sourceFile', this.fileToUpload, this.fileToUpload.name);
      this.formData.append('defineFlow', this.dataFlowModel.defineFlow);
      this.formData.append('tenantId', this.tenants.tenantId);
      this.sourceFileName = this.fileToUpload.name;
      this._service.uploadSourceFile(this.formData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        if (resp) {
          this.dataFlowModel.sourceFileLocation = resp.sourceFileLocation;
          this.dataFlowModel.savedSourceFileName = resp.sourceFileName;
        }
      });
    } else {
      this.sourceFileName = "Choose file..."
    }
  }
  saveDatasource(): void {

  }
  Navigate() {
    window.history.back();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

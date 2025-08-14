
import { Datasource } from "./../../../PmModel/datasource";
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, EmptyError, Subject } from "rxjs";
import { takeUntil, filter } from 'rxjs/operators';
import { FlowService } from "../../../PmCore/services/FlowService/flow.service";
import { TenantService } from "../../../PmCore/services/TenantService/TenantService.service";
import { CommonModel } from "../../../PmModel/common.model";
import { ConnectorsList } from "../../../PmModel/connectorsList";

import { SourceFiles } from "../../../PmModel/sourceFiles";
import { TemplatesList } from "../../../PmModel/templatesLst";
import { ToastrService } from "ngx-toastr";
import { AppUtilService } from "../../../PmCore/shared/app-util.service";
import { CoreUtilityService } from "../../../PmCore/shared/core-utility.service";
import * as _moment from "moment";
import { MatButtonToggleChange } from '@angular/material/button-toggle';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { MatRadioChange } from "@angular/material/radio";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
export interface IOption<T> {
  displayValue: string;
  value: string;
  viewValue: string;

}
@Component({
  selector: 'app-gateway-detail',
  templateUrl: './gateway-detail.component.html',
  styleUrls: ['./gateway-detail.component.scss']

})
export class GatewayDetailComponent implements OnInit, OnDestroy {


  datasourceModel: Datasource = new Datasource();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  connectorsList: ConnectorsList[];
  templatesList: TemplatesList[];
  commonModel: CommonModel;
  startDate = new Date();
  endDate = new Date();
  fileToUpload: File;
  tenants: CommonModel;
  datasource!: FormGroup;
  fields: any[] = [];
  duplicateArray: any[] = [];
  dataSourceId: number = -1;
  selectedToggle: string;
  formData = new FormData();
  showSpinner: boolean = true;
  showToggle: boolean;
  sourceFileName: string;
  originalDatasource: Datasource;
  defineFlow: any;
  option: any;
  showLoadButton: boolean;
  disableLinkButton: boolean;
  disableLinkButton1: boolean;
  disableProtocol: any;
  connectorChange: any;
  gatewayNames: string[] = [];
  initialLoadingDays: Array<any>;
  chosenauthenticationType: any;
  authenticationType: any;
  disableicon: boolean = false;
  showPassword: boolean = false;


  constructor(
    public _utility: AppUtilService,
    private _route: ActivatedRoute,
    private _service: FlowService,
    private _router: Router,
    private _configService: TenantService,
    private _toastr: ToastrService,
    private _coreService: CoreUtilityService,
    private formBuilder: FormBuilder
  ) { }


  ngOnInit() {
    this.datasource = this.formBuilder.group({});

    this.fields = [

      {
        label: "Name",
        hidden: false,
        type: "text",
        placeHolder: "DataSource Name",
        fieldName: "dataSourceName",
        rules: {
          required: true,
        },
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859", disableMessage: null },
        ],
      },
      {
        label: "Description",
        hidden: false,
        type: "text",
        placeHolder: "DataSource Description",
        fieldName: "dataSourceDescription",
        rules: {
          required: true,
        },
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },


      {
        label: "Select Task",
        hidden: false,
        type: "select",
        fieldName: "gatewayName",
        rules: {
          required: true,
        },
        placeHolder: "Select Task",
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "Select Interval",
        hidden: false,
        type: "select",
        fieldName: "initialLoadingDays",
        rules: {
          required: true,
        },
        placeHolder: "Select Interval",
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "SQL Server Name",
        hidden: false,
        type: "text",
        fieldName: "serverUrl",
        disableMessage: false,
        rules: {
          required: true,
        },
        placeHolder: "Sql Server Name",
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "SQL Server Instance",
        hidden: false,
        type: "message",
        fieldName: "serverInstance",
        disableMessage: false,
        rules: {
          required: false,
        },
        placeHolder: "SQL Server Instance",
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "PortNumber",
        hidden: false,
        type: "message",
        fieldName: "portNumber",
        disableMessage: false,
        rules: {
          required: false,
        },
        placeHolder: "PortNumber",
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "SourceDBName",
        hidden: false,
        type: "text",
        fieldName: "sourceDBName",
        disableMessage: false,
        rules: {
          required: true,
        },
        placeHolder: "SourceDBName",
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "Client Authentication",
        hidden: false,
        type: "radio",
        placeHolder: "",
        fieldName: "authenticationType",
        // disableMessage: false,
        rules: {
          required: true,
        },
        options: [
          { key: "sql", value: "Sql Authentication", dis: false },
          { key: "windows", value: "Window Authentication", dis: false },
        ],
        selectedOption: { key: "sql", value: "Sql Authentication" },
        connectors: [
          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "User Name",
        hidden: false,
        type: "text",
        fieldName: "username",
        disableMessage: false,
        rules: {
          required: true,
        },
        placeHolder: "User Name",
        connectors: [
          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "Password",
        hidden: false,
        type: "password",
        fieldName: "password",
        disableMessage: false,
        rules: {
          required: true,
        },
        placeHolder: "Password",
        connectors: [
          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },

      {
        label: "Load Start From",
        hidden: false,
        type: "date",
        placeHolder: "",
        fieldName: "loadStartFrom",
        rules: {
          required: true,
        },
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "Load End to ",
        hidden: false,
        type: "date",
        placeHolder: "",
        fieldName: "loadEndTo",
        rules: {
          required: true,
        },
        connectors: [

          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
    ];
    this.duplicateArray = this.fields;

    // for (const field of this.fields) {
    //   this.datasource.addControl(field.fieldName, this.formBuilder.control('', Validators.required));
    // }
    this.dataSourceId = +this._route.snapshot.paramMap.get("dataSourceId");

    this.commonModel = this._configService.currentTenantValue;
    this.getTenants();

  }

  createFormControls(filterArray: any) {
    for (const field of filterArray) {
      const control = this.formBuilder.control("");
      this.datasource.addControl(field.fieldName, control);
      if (field.type === "radio" && field.selectedOption) {
        control.setValue(field.selectedOption.key);
      }
    }
  }
  removeFormControls(filterArray: any) {
    for (const field of filterArray) {
      this.datasource.removeControl(field.fieldName);
    }
  }
  initDatasource(): void {
    if (this.connectorsList[0].connectorName.includes("Alerton") || this.connectorsList[0].connectorName.includes("Trane")) {
      this._service
        .GetCompassSourceDetails(this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((resp) => {
          if (resp) {
            for (const field of this.fields) {
              if (resp[0][field.fieldName]) {
                //  this.datasource.get(field.fieldName).patchValue(resp[0][field.fieldName]);
                this.chosenauthenticationType = resp[0].authentication;
                this.datasource.get("sourceDBName").patchValue(resp[0].databaseName);
                this.datasource.get("authenticationType").patchValue(resp[0].authentication);
                this.datasource.get("serverInstance").patchValue(resp[0].sqlServerInstance);
                this.datasource.get("portNumber").patchValue(resp[0].sqlServerPort);
                this.datasource.get("serverUrl").patchValue(resp[0].sqlServerName);
                this.datasource.get("username").patchValue(resp[0].username);
                this.datasource.get("password").patchValue(resp[0].password);

              }
            }
            this.fields.forEach((resp) => {
              if ((this.datasource.get("authenticationType").value) === "windows") {
                if (resp.fieldName === "username" || resp.fieldName === "password") {
                  return (resp.hidden = true);
                }
              }
            });
          }
        })
    }
  }


  authchange(event: string, field) {
    console.log(event);
    console.log(field.fieldName)

    switch (field) {
      case "authenticationType":
        this.datasource.get(field).patchValue(event);
        if (event === 'sql') {
          this.fields.forEach(data => {
            if (data.fieldName === 'username') {
              this.datasource.controls[data.fieldName].setValidators(Validators.required);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = false;
            }
            if (data.fieldName === 'password') {
              this.datasource.controls[data.fieldName].setValidators(Validators.required);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = false;
            }
          })
        }
        if (event === 'windows') {
          this.fields.forEach(data => {
            if (data.fieldName === 'username') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'password') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
          })
        }
    }
  }
  getTenants() {
    if (this._utility.previousPage.includes("Gateway") == true) {
      this._configService.currentTenant
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (tenant) => {
            this.tenants = tenant;
            if (tenant.tenantId === undefined) {
              return;
            } else if (
              !tenant.hasOwnProperty("tenantId") ||
              !tenant.hasOwnProperty("userId")
            ) {
              return;
            } else {
              this.showSpinner = true;
              this.getConnectorsGatewayList();
              this.createOrLoad(this.dataSourceId);
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  getConnectorsGatewayList() {
    this._service
      .getConnectorsList(this.tenants.tenantId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((resp) => {
        if (resp) {
          this.connectorsList = resp.filter((item) => (item.connectorName.toLowerCase().includes('alerton') || item.connectorName.toLowerCase().includes('trane') ));

          this.datasourceModel.connectorType = this.connectorsList[0].connectorId;
          this.datasourceModel.templateName = this.connectorsList[0].connectorName;
          this.createOrLoad(this.dataSourceId);
        }
        // this.showSpinner = false;
      });
  }
  createOrLoad(dataSourceId: number) {
    // this.showSpinner = true;
    if (dataSourceId === -1) {
      this.initDatasource();
      let id = this.datasourceModel.connectorType;
      this.onChangeConnector(id, 'onLoad');
      this.getTemplatesList(this.datasourceModel.connectorType);
      this.startDate = new Date(new Date(new Date(new Date().setDate(new Date().getDate()-30))).setHours(0, 0, 0));
      this.endDate = new Date();
      this.fields.forEach((data) => {
        if (this.datasource.get('serverInstance' && 'portNumber')) {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
        }
      });
      this.showSpinner = false;

    } else {
      this.getDataByDatasourceId(dataSourceId)
    }

  }

  getDataByDatasourceId(dataSourceId: number) {
    this._service
      .getDatasourceById(this.dataSourceId, this.tenants.tenantId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((resp) => {
        this.onChangeConnector(resp[0].connectorType, 'onLoad');
        this.datasourceModel.templateName = resp[0].templateName;
        this.selectedToggle = resp[0].manualMethod;
        if (resp) {
          this.datasourceModel = resp[0];
          // this.datasourceModel.loadStartFrom = resp[0].loadStartFrom != null ? resp[0].loadStartFrom : this._coreService.convert(new Date(new Date(new Date(new Date().setHours(-24))).setHours(0, 0, 0)));
          this.startDate = resp[0].loadStartFrom != null ? new Date(moment(new Date(resp[0].loadStartFrom), "YYYY.MM.DD HH.mm.ss A").toDate()) : null;
          if(this.startDate != null && this.startDate.toString() == "Invalid Date") {
            this.startDate = resp[0].loadStartFrom != null ? new Date(moment(resp[0].loadStartFrom, "YYYY.MM.DD HH.mm.ss A").toDate()) : null;
          }

          // this.datasourceModel.loadEndTo = resp[0].loadStartFrom != null ? resp[0].loadEndTo : this._coreService.convert(new Date());
          this.endDate = resp[0].loadEndTo != null ? new Date(moment(new Date( resp[0].loadEndTo), "YYYY.MM.DD HH.mm.ss A").toDate()) : null;
          if(this.endDate != null && this.endDate.toString() == "Invalid Date") {
            this.endDate = resp[0].loadEndTo != null ? new Date(moment(resp[0].loadEndTo, "YYYY.MM.DD HH.mm.ss A").toDate()) : null;
          }
          this.defineFlow = resp[0].defineFlow;
          this.dataSourceId = resp[0].dataSourceId;
          this.fields.forEach((resp) => {
            if (dataSourceId !== -1 && (resp.fieldName === "serverInstance" || resp.fieldName === "serverUrl" || resp.fieldName === "portNumber" || resp.fieldName === "sourceDBName" || resp.fieldName === "username" || resp.fieldName === "password")) {
              this.datasource.controls[resp.fieldName].setValidators(null);
              this.datasource.get(resp.fieldName).updateValueAndValidity();
              return (resp.disableMessage = true);
            }

          });

          this.fields.forEach((resp) => {
            if (dataSourceId !== -1) {
              if (this.datasource.get('authenticationType')) {
                return (resp.dis = true);
              }

            }
          });
          this.datasourceModel.connectorType = resp[0].connectorType;

          for (const field of this.fields) {
            if (resp[0][field.fieldName]) {
              this.datasource
                .get(field.fieldName)
                .patchValue(resp[0][field.fieldName]);
            }

            if (field.fieldName === "loadStartFrom") {
              this.datasource
                .get("loadStartFrom")
                .patchValue(
                  new Date(
                    moment(
                      resp[0][field.fieldName],
                      "YYYY.MM.DD HH.mm.ss A"
                    ).toDate()
                  )
                );
            }
            if (field.fieldName === "loadEndTo") {
              this.datasource
                .get("loadEndTo")
                .patchValue(
                  new Date(
                    moment(
                      resp[0][field.fieldName],
                      "YYYY.MM.DD HH.mm.ss A"
                    ).toDate()
                  )
                );
            }
            switch (field.fieldName) {
              case "authenticationType":
                if (resp[0][field.fieldName] === "windows") {
                  this.datasource.get(field.fieldName).patchValue("windows");
                  // this.onChangeRadio('windows',field.fieldName);
                  this.fields.forEach(data => {
                    if (data.fieldName === 'username') {
                      this.datasource.controls[data.fieldName].setValidators(null);
                      this.datasource.get(data.fieldName).updateValueAndValidity();
                      return data.hidden = true;
                    }
                    if (data.fieldName === 'password') {
                      this.datasource.controls[data.fieldName].setValidators(null);
                      this.datasource.get(data.fieldName).updateValueAndValidity();
                      return data.hidden = true;
                    }
                  })


                }
            }

          }
          this.getTemplatesList(this.datasourceModel.connectorType);
          // this.onChangeConnector(this.datasourceModel.connectorType);
          //this.onChangeRadio(resp[0].extractionMethod);
          this.showSpinner = false;
        }
      });
  }
  getTemplatesList(selectedConnector: string): void {
    // this.showSpinner = true;
    this._service
      .getTemplatesList(selectedConnector, this.tenants.tenantId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((resp) => {
        if (resp) {
          if (resp.length == 0) {
            this.templatesList = resp;

            this.datasourceModel.connectorType == "15E4EBC7-6814-4F8C-BE83-B04E19EA1859";
            this._service.GetIntialDaysListForCompass(selectedConnector, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
              if (resp) {
                this.initialLoadingDays = resp

              }
            });
            this._service.getGatewayCmdList(selectedConnector, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
              if (resp) {
                this.gatewayNames = resp.map(task => task['gatewayName']);

              }
            });
            console.log(this.datasourceModel.connectorType);
            //  this.datasourceModel.defineFlow = this.datasourceModel.defineFlow  ? this.datasourceModel.defineFlow  : resp[0].templateId;
          }
          else {
            this.templatesList = resp;
            if (this.dataSourceId != -1 && this.connectorChange == 'cChange') {
              // this.updateDatasource(resp[0]);
              // this.datasource.get('templateEmbedUrl').patchValue(resp[0].templateEmbedUrl);
              // this.datasource.get('templateName').patchValue(resp[0].templateName);

            } else {
              this.datasourceModel.defineFlow = this.datasourceModel.defineFlow
                ? this.datasourceModel.defineFlow
                : resp[0].templateId;
            }

          }
          this.showSpinner = false;
        }

      });
  }

  onChangeGateway(event): void {
    console.log(event)
    this.datasourceModel.gatewayName = event.target.value;
  }
  onintialdays(event): void {
    this.datasourceModel.initialLoadingDays = event.target.value;
  }


  onChangeConnector(event, type): void {
    console.log(event);
    if (event != undefined) {
      if (typeof event === 'string') {
        this.datasourceModel.connectorType = event;
      }
      else {
        this.datasourceModel.connectorType = event.target.value;
        this.removeFormControls(this.fields);
        console.log(this.datasource);
      }
    }

    this.connectorsList.forEach((data: any) => {
      if (data.connectorId == this.datasourceModel.connectorType) {
        this.datasourceModel.templateName = data.connectorName;
      }
    });

    this.fields = this.duplicateArray;
    let filteredArray: any[] = [];
    filteredArray = this.fields.filter((item: any) =>
      item.connectors.some(
        (connector) => connector.value == this.datasourceModel.connectorType
      )
    );
    console.log(filteredArray);

    this.fields = filteredArray;
    this.createFormControls(filteredArray);
    this.datasource
      .get("loadStartFrom")
      .patchValue(
        new Date(
          new Date(
            new Date(new Date().setDate(new Date().getDate() - 30))
          ).setHours(0, 0, 0)
        )
      );
    this.datasource.get("loadEndTo").patchValue(new Date());
    filteredArray.forEach(resp => {
      if (resp.fieldName) {
        this.datasource.controls[resp.fieldName].setValidators(Validators.required);
        this.datasource.get(resp.fieldName).updateValueAndValidity();

      }

    });

    console.log(this.datasource.controls);
    if (type == 'cChange') {
      this.connectorChange = type;
      if (this.dataSourceId != -1) {
        this._service
          .getDatasourceById(this.dataSourceId, this.tenants.tenantId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((resp) => {



          });
      }

    }
  }
  saveDatasource(): void {
    console.log(this.datasource);
    //if (this.datasource.valid) {
    // this.datasource.value.fileExtraction=this.datasourceModel.fileExtraction != null ? this.datasourceModel.fileExtraction.trim() : '';
    this.datasource.value.tenantId = this.tenants.tenantId;
    this.datasource.value.connectorType = this.datasourceModel.connectorType;
    this.datasource.value.createdBy = this.tenants.userId;
    this.datasource.value.modifiedBy = this.tenants.userId;
    this.datasource.value.templateName = this.datasourceModel.templateName;
    this.datasource.value.fileType = "raw";
    this.datasource.value.manualMethod = this.selectedToggle ? this.selectedToggle : "";
    this.datasource.value.defineFlow = this.defineFlow ? this.defineFlow : "";

    if (this.datasourceModel.connectorType != "15E4EBC7-6814-4F8C-BE83-B04E19EA1859") {
      this.datasourceModel.templateName = this.datasourceModel.templateName.split(" ")[0];
    }

    this.datasource.value.dataSourceId = this.dataSourceId ? this.dataSourceId : 0;
    this.datasourceModel.loadStartFrom = this.startDate != null ? this._coreService.convert(new Date(this.startDate.setSeconds(0))) : null;
    this.datasourceModel.loadEndTo = this.endDate != null ? this._coreService.convert(new Date(this.endDate.setSeconds(59))): null;
    this.datasource.value.loadStartFrom = this.datasourceModel.loadStartFrom;
    this.datasource.value.loadEndTo = this.datasourceModel.loadEndTo;

    this._service
      .saveDatasource(this.datasource.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (resp) => {
          this._toastr.success("Datasource saved successfully");
          if (this._utility.previousPage.includes("Gateway") == true) {
            this.Navigate()
          }
          else {
            this._router.navigate(['/data-source-list/']);
          }
          // this._router.navigate(["/data-source-list/"]);
          // this.showLoadButton = false;
          //  this.disableLinkButton = false;
        },
        (e) => {
          this._toastr.error(e.error ? e.error : "Failed to save DataSource");
          // this.showLoadButton = false;
          //this.disableLinkButton = false;
        }
      );
    // } else {
    //   this._toastr.error("Please validate your form first");
    // }
  }


  validateDuration() {
    this._utility.datesValidator = false;
    if (this.startDate == null) {
      if (this.endDate != null) {
        this._utility.datesValidator = true;
        return;
      }
      return;
    }
    this.datasourceModel.loadStartFrom = this.startDate ? this.startDate.toString() : null;
    if (this.startDate == null && this.endDate != null) {
      this._utility.datesValidator = true;
      return;
    }
    this.datasourceModel.loadEndTo = this.endDate ? this.endDate.toString() : null;
    if (this.datasourceModel.loadStartFrom) {
      this._utility.datesValidator = true;
    } else {
      return;
    }
    if (!this.datasourceModel.loadEndTo) {
      return;
    }
    if (new Date(this.startDate).getTime() > new Date(this.endDate).getTime()) {
      this._utility.datesValidator = true;
      return;
    } else {
      this._utility.datesValidator = false;
    }
  }
  changeContent() {
    if (this.datasource.get('sourceGoogleSheetId').touched) {
      return false
    }
  }

  // Navigate() {
  //   // window.history.back();
  //   this._router.navigate(["/data-source-list/"]);
  // }

  Navigate() {
    // window.history.back();

    if (this._utility.previousPage.includes("Gateway") == true) {
      this._router.navigate(['Gateway/']);
    }
    else {
      this._router.navigate(['/data-source-list/']);
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}


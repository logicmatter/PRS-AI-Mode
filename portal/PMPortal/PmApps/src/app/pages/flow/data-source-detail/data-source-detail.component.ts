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
import { MatButtonToggleChange } from "@angular/material/button-toggle";
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
  selector: 'app-data-source-detail',
  templateUrl: './data-source-detail.component.html',
  styleUrls: ['./data-source-detail.component.scss']
})

export class DataSourceDetailComponent implements OnInit, OnDestroy {


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
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
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
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },

      {
        label: "Protocol",
        hidden: false,
        type: "radio",
        placeHolder: "",
        fieldName: "fileProtocol",
        rules: {
          required: true,
        },
        options: [

          { key: "rDrive", value: "Remote Drive", disabled: null },
          { key: "gDrive", value: "Local Drive", disabled: false },
        ],
        selectedOption: { key: "rDrive", value: "Remote Drive" },
        connectors: [
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
        ],
      },

      {
        label: "Extraction Method",
        hidden: false,
        type: "radio",
        placeHolder: "",
        fieldName: "extractionMethod",
        rules: {
          required: true,
        },
        options: [
          { key: "gfolder", value: "This Folder", disabled: null },
          { key: "single", value: "Single File", disabled: null },
          { key: "gfolders", value: "All Child Folders", disabled: null },
        ],
        selectedOption: { key: "gfolder", value: "This Folder" },
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      {
        label: "",
        hidden: true,
        type: "button",
        fieldName: "singleFolder",
        rules: {
          required: true,
        },

        options: [
          { key: "manual", value: "Local", hideToggle: false, disabled: null },
          { key: "gsheet", value: "Google Sheet", hideToggle: false, disabled: null },
          // { key: "fName", value: "Service Location",hideToggle:true,disabled:null },
        ],
        extractionMethod: "Single File",
        connectors: [
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      {
        label: "",
        hidden: true,
        type: "button",
        fieldName: "singleFolder",
        rules: {
          required: true,
        },

        options: [
          { key: "manual", value: "Local", hideToggle: false, disabled: null },
          { key: "fName", value: "Server Location", hideToggle: false, disabled: null },
        ],
        extractionMethod: "Single File",
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },

        ],
      },
      {
        label: "Upload Method",
        hidden: false,
        type: "radio",
        placeHolder: "",
        fieldName: "uploadMethod",
        rules: {
          required: true,
        },
        options: [
          { key: "automatic", value: "Automatic", disabled: null },
          { key: "manual", value: "Manual", disabled: null },
        ],
        selectedOption: { key: "automatic", value: "Automatic" },
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      {
        label: "File Package",
        hidden: false,
        type: "radio",
        placeHolder: "",
        fieldName: "filePackage",
        rules: {
          required: true,
        },
        options: [
          { key: "compressed", value: "Compressed", disabled: true },
          { key: "uncompressed", value: "UnCompressed", disabled: null },
        ],
        selectedOption: { key: "uncompressed", value: "uncompressed" },
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      {
        label: "Import SpreadSheet data",
        hidden: true,
        type: "text",
        fieldName: "sourceGoogleSheetId",
        placeHolder: "Google Sheet URL",
        rules: {
          required: true,
        },
        toggle: "gsheet",
        connectors: [
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      {
        label: "Setup Data Flow Template",
        hidden: false,
        type: "text",
        placeHolder: "Source Path Url",
        fieldName: "templateEmbedUrl",
        rules: {
          required: true,
        },
        connectors: [
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },

        ],
      },
      {
        label: "Upload source File",
        hidden: true,
        type: "file",
        fieldName: "sourceFileLocation",
        placeHolder: "Upload File",
        rules: {
          required: true,
        },
        toggle: "manual",
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      
      {
        label: "File Name",
        hidden: true,
        type: "text",
        fieldName: "sourceGoogleSheetId",
        placeHolder: "File Name",
        rules: {
          required: true,
        },
        toggle: "fName",
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },

        ],
      },
      {
        label: "Import Folder Data",
        hidden: false,
        type: "text",
        placeHolder: "Folder Url",
        fieldName: "sourceGoogleFolderId",
        rules: {
          required: true,
        },
        connectors: [

          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },
      {
        label: "Folder Path",
        hidden: false,
        type: "text",
        placeHolder: "Folder Path",
        fieldName: "sourceGoogleFolderId",
        rules: {
          required: true,
        },
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },

        ],
      },
      {
        label: "File Selection Expression",
        hidden: false,
        type: "text",
        placeHolder: "Ex: p*.xlsx/.csv/.db",
        fieldName: "fileExtraction",
        rules: {
          required: true,
        },
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
        ],
      },


      {
        label: "Client ID",
        hidden: false,
        type: "text",
        fieldName: "clientSecretID",
        rules: {
          required: true,
        },
        placeHolder: "Client ID",
        connectors: [
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
        ],
      },
      {
        label: "Secret Key",
        hidden: false,
        type: "text",
        fieldName: "clientSecretKey",
        rules: {
          required: true,
        },
        placeHolder: "Client Secret Key",
        connectors: [
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
        ],
      },
      {
        label: "System ID",
        hidden: false,
        type: "text",
        fieldName: "systemID",
        rules: {
          required: true,
        },
        placeHolder: "System guid",
        connectors: [
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },

        ],
      },

      {
        label: "Customer ID",
        hidden: false,
        type: "text",
        fieldName: "customerID",
        rules: {
          required: true,
        },
        placeHolder: "Customer ID",
        connectors: [
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
        ],
      },
      {
        label: "Cloud data Keys",
        hidden: false,
        type: "text",
        fieldName: "cloudDataKeys",
        rules: {
          required: true,
        },
        placeHolder: "Cloud data Keys",
        connectors: [
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
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
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
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
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
          { key: "tridium", value: "AF407BFB-6F78-4EF3-BE4F-D432DF96F5A2" },
          { key: "alerton", value: "15E4EBC7-6814-4F8C-BE83-B04E19EA1859" },
        ],
      },
      {
        label: "Connector Options(optional) ",
        hidden: false,
        type: "message",
        placeHolder: "Connector Options",
        fieldName: "connectorOptions",
        rules: {
          required: false,
        },
        connectors: [
          { key: "sqllite", value: "C26785C7-6077-4F1A-A91C-CA3859ABED67" },
          { key: "excel", value: "EA090389-27DB-4AC3-B7B5-6C3E46DA5591" },
          { key: "csv", value: "1454C60D-B03D-42A7-8154-0ED6A6DA253B" },
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

  onInputChange(event: any, field) {
    this.disableLinkButton1 = true;


    if (event.target.value == '' && (field == 'sourceGoogleSheetId' || field == 'sourceGoogleFolderId' || field == 'fileExtraction')) {
      this.datasource.controls[field].setValidators(Validators.required);
      this.datasource.get(field).updateValueAndValidity();
    }
    if (field == 'sourceGoogleSheetId') {
      console.log(this.datasource)
    }
    console.log(this.datasource.controls);
  }



  onChangeRadio(event: string, field) {

    switch (field) {
      case "fileProtocol":
        this.datasource.get(field).patchValue(event);

        break;
      case "extractionMethod":
        this.datasource.get(field).patchValue(event);
        if (event === 'single') {
          this.fields.forEach(data => {
            if (data.fieldName === 'singleFolder') {
              this.changeToggle(this.selectedToggle);
              this.datasource.get('uploadMethod').setValue('manual');
              this.datasource.controls[data.fieldName].setValidators(Validators.required);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = false;
            }


            if (data.fieldName === 'sourceGoogleFolderId') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'fileExtraction') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
          })
          this.datasource.get('singleFolder').patchValue('manual');
        }
        if (event === 'gfolders') {
          this.datasource.get('uploadMethod').setValue('automatic');
          this.fields.forEach(data => {

            if (data.fieldName === 'singleFolder') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'sourceFileLocation') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'sourceGoogleSheetId') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'sourceGoogleFolderId') {
              if (this.datasourceModel.connectorType === '1454C60D-B03D-42A7-8154-0ED6A6DA253B') {
                console.log(this.datasourceModel.connectorType)
                this.datasource.controls[data.fieldName].setValidators(Validators.required);
                this.datasource.get(data.fieldName).updateValueAndValidity();
                return data.hidden = false;
              } else {
                this.datasource.controls[data.fieldName].setValidators(null);
                this.datasource.get(data.fieldName).updateValueAndValidity();
                return data.hidden = true;
              }

            }
            if (data.fieldName === 'fileExtraction') {
              this.datasource.controls[data.fieldName].setValidators(Validators.required);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = false;
            }
          })
        } if (event === 'gfolder') {
          this.datasource.get('uploadMethod').setValue('automatic');
          this.fields.forEach(data => {

            if (data.fieldName === 'singleFolder') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'sourceFileLocation') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'sourceGoogleSheetId') {
              this.datasource.controls[data.fieldName].setValidators(null);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = true;
            }
            if (data.fieldName === 'sourceGoogleFolderId') {
              this.datasource.controls[data.fieldName].setValidators(Validators.required);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = false;
            }
            if (data.fieldName === 'fileExtraction') {
              this.datasource.controls[data.fieldName].setValidators(Validators.required);
              this.datasource.get(data.fieldName).updateValueAndValidity();
              return data.hidden = false;
            }
          })
        }
        break;
      case "uploadMethod":
        this.datasource.get(field.fieldName).patchValue(event);
        break;
      case "filePackage":
        this.datasource.get(field.fieldName).patchValue(event);
        break;
    }
  }

  changeToggle(toogleVal: string) {

    if (toogleVal == 'manual') {
      this.selectedToggle = 'manual',
        this.fields.forEach(data => {
          if (data.fieldName === 'sourceFileLocation') {
            this.datasource.controls[data.fieldName].setValidators(Validators.required);
            this.datasource.get(data.fieldName).updateValueAndValidity();
            return data.hidden = false;
          }
          if (data.fieldName === 'sourceGoogleFolderId') {
            this.datasource.controls[data.fieldName].setValidators(null);
            this.datasource.get(data.fieldName).updateValueAndValidity();
            return data.hidden = true;
          }
          if (data.fieldName === 'fileExtraction') {
            this.datasource.controls[data.fieldName].setValidators(null);
            this.datasource.get(data.fieldName).updateValueAndValidity();
            return data.hidden = true;
          }
          if (data.fieldName === 'sourceGoogleSheetId') {
            this.datasource.controls[data.fieldName].setValidators(null);
            this.datasource.get(data.fieldName).updateValueAndValidity();
            return data.hidden = true;
          }
        })
    }
    else if (toogleVal == 'gsheet') {
      this.selectedToggle = 'gsheet';
      console.log(this.selectedToggle)
      this.fields.forEach(data => {
        if (data.fieldName === 'sourceGoogleSheetId') {
          this.datasource.controls[data.fieldName].setValidators(Validators.required);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = false;
        }
        if (data.fieldName === 'sourceFileLocation') {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = true;
        }
        if (data.fieldName === 'sourceGoogleFolderId') {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = true;
        }
        if (data.fieldName === 'fileExtraction') {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = true;
        }
      })
    }
    else if (toogleVal == 'fName') {

      this.selectedToggle = 'fName';
      console.log(this.selectedToggle)
      this.fields.forEach(data => {
        if (data.fieldName === 'sourceGoogleSheetId') {
          this.datasource.controls[data.fieldName].setValidators(Validators.required);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = false;
        }
        if (data.fieldName === 'sourceFileLocation') {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = true;
        }
        if (data.fieldName === 'sourceGoogleFolderId') {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = true;
        }
        if (data.fieldName === 'fileExtraction') {
          this.datasource.controls[data.fieldName].setValidators(null);
          this.datasource.get(data.fieldName).updateValueAndValidity();
          return data.hidden = true;
        }
      })
    }
  }
  getTenants() {

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
            this.getConnectorsList();
            this.createOrLoad(this.dataSourceId);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }


  getConnectorsList(): void {
    // this.showSpinner = true;
    this._service
      .getConnectorsList(this.tenants.tenantId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((resp) => {
        if (resp) {
          this.connectorsList = resp.filter((item) => !(item.connectorName.toLowerCase().includes('alerton') || item.connectorName.toLowerCase().includes('trane')));

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
            if (dataSourceId > -1 && resp.fieldName === "templateEmbedUrl") {
              return (resp.type = "select");
            }
            // if (dataSourceId !== 1 && (resp.fieldName === "serverInstance" || resp.fieldName ===  "serverUrl" || resp.fieldName ===  "portNumber" || resp.fieldName ===  "sourceDBName"|| resp.fieldName ===  "username" || resp.fieldName ===  "password"  )) {
            //   return ( resp.disableMessage = true);
            // }
          });
          // this.fields.forEach((resp) => {
          //   if(this.datasource.get('serverInstance' && 'portNumber')){
          //     this.datasource.controls[resp.fieldName].setValidators(null);
          //     this.datasource.get(resp.fieldName).updateValueAndValidity();
          //   }
          // });

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
              case "fileProtocol":
                if (resp[0][field.fieldName] === "gDrive") {
                  this.datasource.get(field.fieldName).patchValue("gDrive");
                }
                if (resp[0][field.fieldName] === "rDrive") {
                  this.datasource.get(field.fieldName).patchValue("rDrive");
                }
                break;
              case "extractionMethod":
                if (resp[0][field.fieldName] === "This Folder") {
                  this.datasource.get(field.fieldName).patchValue("gfolder");
                }
                if (resp[0][field.fieldName] === "Single File" || resp[0][field.fieldName] === "single") {
                  this.datasource.get(field.fieldName).patchValue("single");
                  this.onChangeRadio('single', field.fieldName);
                  // resp[0].sourceFileLocation == null? this.changeToggle('gsheet'):this.changeToggle('local');
                }
                if (resp[0][field.fieldName] === "gfolders") {
                  this.datasource.get(field.fieldName).patchValue("gfolders");
                  this.onChangeRadio('gfolders', field.fieldName);
                }
                break;
              case "uploadMethod":
                if (resp[0][field.fieldName] === "Automatic") {
                  this.datasource
                    .get(field.fieldName)
                    .patchValue("automatic");
                }
                if (resp[0][field.fieldName] === "Manual") {
                  this.datasource.get(field.fieldName).patchValue("manual");
                }
                break;
              case "filePackage":
                if (resp[0][field.fieldName] === "Compressed") {
                  this.datasource
                    .get(field.fieldName)
                    .patchValue("compressed");
                }
                if (resp[0][field.fieldName] === "UnCompressed") {
                  this.datasource
                    .get(field.fieldName)
                    .patchValue("uncompressed");
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
            // this._service.GetIntialDaysListForCompass(selectedConnector, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
            //   if(resp)
            //   {
            //     this.initialLoadingDays = resp

            //   }
            // });
            // this._service.getGatewayCmdList(selectedConnector, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
            //   if(resp)
            //   {
            //     this.gatewayNames = resp.map(task => task['gatewayName']);

            //   }
            // });
            console.log(this.datasourceModel.connectorType);

            //  this.datasourceModel.defineFlow = this.datasourceModel.defineFlow  ? this.datasourceModel.defineFlow  : resp[0].templateId;
          }
          else {
            this.templatesList = resp;
            if (this.dataSourceId != -1 && this.connectorChange == 'cChange') {

              this.updateDatasource(resp[0]);

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


  sourceFileInputOnchange(fileInput: any): void {

    if (fileInput.target.files.length == 1) {
      this.fileToUpload = fileInput.target.files[0];
      console.log(this.fileToUpload.name)
      this.formData.append('sourceFile', this.fileToUpload, this.fileToUpload.name);
      this.formData.append('defineFlow', this.datasourceModel.defineFlow);
      this.formData.append('tenantId', this.tenants.tenantId);
      this.formData.append('sourceFileName', this.fileToUpload.name);

      this.datasource.get('sourceFileLocation').patchValue(this.fileToUpload.name)

      this.sourceFileName = this.fileToUpload.name;

      this._service.uploadSourceFile(this.formData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        if (resp) {
          this.datasource.get('sourceFileLocation').patchValue(resp.sourceFileLocation)
          this.datasourceModel.sourceFileLocation = resp.sourceFileLocation;
          this.datasourceModel.savedSourceFileName = resp.sourceFileName;
          this._toastr.success("Uploaded successfully");

        }
      });
    } else {
      // this.sourceFileName = "Choose file..."

    }
  }

  updateDatasource(template: any) {
    this.disableLinkButton = true;
    console.log(template)
    const control = this.formBuilder.control("");
    if (typeof template === 'string') {

      const newTemplateId = this.datasource.get('templateEmbedUrl').value
      this.templatesList.forEach(info => {
        if (info.templateEmbedUrl === newTemplateId) {
          console.log(info.templateId)
          this.datasource.get('templateEmbedUrl').patchValue(info.templateEmbedUrl);
          // this.datasource.addControl('templateSheetId', control);
          // this.datasource.get('templateSheetId').patchValue(info.templateSheetId);
          this.defineFlow = info.templateId;

        }
      })
    } else {
      const newTemplateId = template.templateEmbedUrl;
      this.templatesList.forEach(info => {
        if (info.templateEmbedUrl === newTemplateId) {
          console.log(info.templateId)
          this.datasource.get('templateEmbedUrl').patchValue(info.templateEmbedUrl);
          // this.datasource.addControl('templateSheetId', control);
          // this.datasource.get('templateSheetId').patchValue(info.templateSheetId);
          this.defineFlow = info.templateId;

        }
      })
    }

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
    this.fields.forEach(field => {
      if (field.fieldName === 'fileProtocol') {
        if (this.datasourceModel.connectorType === "C26785C7-6077-4F1A-A91C-CA3859ABED67") {
          field.selectedOption.key = 'gDrive'
        } else {
          field.selectedOption.key = 'rDrive'
        }
      }
    })


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
      if (resp.fieldName === 'singleFolder' || resp.fieldName === 'sourceFileLocation' || resp.fieldName === 'sourceGoogleFolderId' || resp.fieldName === 'sourceGoogleSheetId' || resp.fieldName === 'connectorOptions' || resp.fieldName === 'fileExtraction') {
        this.fields.forEach(resp => {
          if (resp.fieldName === 'singleFolder') {
            this.datasource.controls[resp.fieldName].setValidators(null);
            this.datasource.get(resp.fieldName).updateValueAndValidity();
            return resp.hidden = true;
          }
          if (resp.fieldName === 'extractionMethod') {
            this.onChangeRadio('gfolder', resp.fieldName);
          }
        });
        this.datasource.controls[resp.fieldName].setValidators(null);
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


            if (resp) {
              this.defineFlow = resp[0].defineFlow;
              this.dataSourceId = resp[0].dataSourceId;
              this.fields.forEach((resp) => {
                if (this.dataSourceId !== 1 && resp.fieldName === "templateEmbedUrl") {
                  return (resp.type = "select");
                }
              });



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
                  case "fileProtocol":
                    if (resp[0][field.fieldName] === "gDrive") {
                      this.datasource.get(field.fieldName).patchValue("gDrive");
                    }
                    if (resp[0][field.fieldName] === "rDrive") {
                      this.datasource.get(field.fieldName).patchValue("rDrive");
                    }
                    if (this.datasourceModel.connectorType === "C26785C7-6077-4F1A-A91C-CA3859ABED67") {
                      this.selectedToggle = resp[0].manualMethod == 'gsheet' ? 'fName' : resp[0].manualMethod;
                      this.datasource.get(field.fieldName).patchValue("gDrive");
                    } else {
                      this.selectedToggle = resp[0].manualMethod == 'fName' ? 'gsheet' : resp[0].manualMethod;
                      this.datasource.get(field.fieldName).patchValue("rDrive");
                    }
                    break;
                  case "extractionMethod":
                    if (resp[0][field.fieldName] === "This Folder") {
                      this.datasource.get(field.fieldName).patchValue("gfolder");
                    }
                    if (resp[0][field.fieldName] === "Single File" || resp[0][field.fieldName] === "single") {
                      this.datasource.get(field.fieldName).patchValue("single");
                      this.onChangeRadio('single', field.fieldName);
                      // resp[0].sourceFileLocation == null? this.changeToggle('gsheet'):this.changeToggle('local');
                    }
                    if (resp[0][field.fieldName] === "gfolders") {
                      this.datasource.get(field.fieldName).patchValue("gfolders");
                      this.onChangeRadio('gfolders', field.fieldName);
                    }
                    break;
                  case "uploadMethod":
                    if (resp[0][field.fieldName] === "Automatic") {
                      this.datasource
                        .get(field.fieldName)
                        .patchValue("automatic");
                    }
                    if (resp[0][field.fieldName] === "Manual") {
                      this.datasource.get(field.fieldName).patchValue("manual");
                    }
                    break;
                  case "filePackage":
                    if (resp[0][field.fieldName] === "Compressed") {
                      this.datasource
                        .get(field.fieldName)
                        .patchValue("compressed");
                    }
                    if (resp[0][field.fieldName] === "UnCompressed") {
                      this.datasource
                        .get(field.fieldName)
                        .patchValue("uncompressed");
                    }
                }
              }
              this.getTemplatesList(this.datasourceModel.connectorType);

              // this.onChangeConnector(this.datasourceModel.connectorType);
              //this.onChangeRadio(resp[0].extractionMethod);

            }
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

            this._router.navigate(['/data-source-list/']);


        },
        (e) => {
          this._toastr.error(e.error ? e.error : "Failed to save DataSource");
          // this.showLoadButton = false;
          //this.disableLinkButton = false;
        }
      );

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

  Navigate() {
    // window.history.back();
    this._router.navigate(["/data-source-list/"]);
  }

  // Navigate() {
  //   window.history.back();

  //   if (this._utility.previousPage.includes("Gateway") == true) {
  //     this._router.navigate(['Gateway/']);
  //   }
  //   else {
  //     this._router.navigate(['/data-source-list/']);
  //   }
  // }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

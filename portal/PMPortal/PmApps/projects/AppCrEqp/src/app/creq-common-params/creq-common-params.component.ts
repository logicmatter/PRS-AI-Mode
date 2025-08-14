import { CoreUtilityService } from "./../../../../../src/app/PmCore/shared/core-utility.service";

import { Component, OnInit, Input, Output, OnDestroy, ChangeDetectorRef } from "@angular/core";

import { EventEmitter } from "events";
import { AbstractControl,FormGroup, FormControl, Validators } from "@angular/forms";

import { Router } from "@angular/router";
import { ReportingService, TenantService } from "src/app/PmCore/services";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { LookupServiceService } from "src/app/PmCore/services/LookupService/lookup-service.service";
import { CommonModel } from './../../../../../src/app/PmModel/common.model';
import { AdhocReportutilityService } from './../../../../AppAdhoc/src/app/adhoc-reportutility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import * as $ from "jquery";

import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { MatDialog } from "@angular/material/dialog";
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { DatePickerHelper } from 'src/app/core/commondatepicker/datepicker-helper';
import { DatepickerService } from 'src/app/core/commondatepicker/datepicker.service';
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: "creq-common-params",
  templateUrl: "./creq-common-params.component.html",
  styleUrls: ["./creq-common-params.component.scss"]
})
export class CREqCommonParamsComponent implements OnInit, OnDestroy {
  @Input() id;
  loadPattern = new RegExp('^[0-9,]*$');

  parameterslist: any;
  promptParameters = [];
  FormData = [];
  DataForm: FormGroup = new FormGroup({});
  rptParamObj;
  rptParamval;
  reportData: any;
  startDate = this._utility.globalSDT;
  endDate = this._utility.globalEDT;
  dr: string = "";
  showSpinner: boolean = false;
  tempObj = {};
  public commonDateModel: CommonDateModel;
  form = new FormGroup({
    reportName: new FormControl("", Validators.required),
    reportDescription: new FormControl()
  });
  drForm = new FormGroup({
    startDate: new FormControl(new Date(new Date().setHours(0, 0, 0, 0))),
    endDate: new FormControl(new Date(new Date().setHours(23, 59, 59, 59))),
    dr: new FormControl("", Validators.required),
    resolution: new FormControl("")
  });
  loadValid: boolean;
  // form = new FormGroup({
  //   reportName: new FormControl("", [Validators.required]),
  //   reportDescription: new FormControl(),
  //   startDate: new FormControl(),
  //   endDate: new FormControl(),
  //   dr: new FormControl()
  // });

  public noWhitespaceValidator(control: FormControl) {
    const p = typeof control.value === 'number';
    if (p) {
      const isValid = true;
      return isValid ? null : { 'whitespace': false };
    }
    else {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { 'whitespace': true };
    }
  }
  public reportObj: ReportObj = new ReportObj();
  templateID: string;
  templateChanged: boolean;
  isObjectSelectionEnable: boolean;
  maxStartDate = new Date();
  maxEndDate = new Date();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: any;
  public commonModel: CommonModel;
  previousStartDate: Date;
  previousEndDate: Date;
  previousDuration: any;
  isDateRangeValid: boolean = true;
  flag = false;
  runSubscription: Subscription;
  previewSubscription: Subscription;
  isEnableResolution: boolean;
  durations: any;
  searchText: string;
  dummyreportID: any;
  constructor(
    public _utility: AppUtilService,
    private utility: UtilityService,
    private _configure: LookupServiceService,
    private _rptService: ReportingService,
    private _route: Router,
    public _core: CoreUtilityService,
    public dialog: MatDialog,
    public tenantService: TenantService,
    private _adhocService: AdhocReportutilityService,
    public datePickerHelper: DatePickerHelper,
    public dateService: DatepickerService,
    public _Adhocutility: AdhocReportutilityService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {
    this.datePickerHelper.getDateTimeDurations().subscribe(data => {
      this.durations = data.durations;
      this.dr = this.durations[2].value;
    });
    this.commonDateModel = this.tenantService.currentDateValue;
    this._utility.hasSelectedBacknetObject = true;
    if (this._utility.reportID) {
    } else {
      this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this._utility.tenantID = data.tenantId;
        if (this._utility.tenantID === undefined) {
          // this._route.navigateByUrl("home/apps");
          return;
        }
        this._utility.globalDr = this.commonDateModel.duration;
        this.dr = this.commonDateModel.duration;
        if (this._utility.globalDr === "custom") {
          this._utility.globalSDT = this.commonDateModel.startDate;
          this._utility.globalEDT = this.commonDateModel.endDate;
          this._utility.getDefaultReportResolution(
            this._utility.globalDr,
            this._utility.globalSDT,
            this._utility.globalEDT
          );

          this.drForm.setValue({
            dr: this.commonDateModel.duration,
            startDate: this._utility.globalSDT,
            endDate: this._utility.globalEDT,
            resolution: this.commonDateModel.resolution
          });
          this._utility.resolution = this.commonDateModel.resolution;
        } else {
          this._utility.getDefaultReportResolution(
            this._utility.globalDr,
            this._utility.globalSDT,
            this._utility.globalEDT
          );
          const tempStartDate = new Date();
          tempStartDate.setHours(0, 0, 0, 0);
          const tempEndDate = new Date();
          tempEndDate.setHours(23, 59, 59, 59);
          this.drForm.setValue({
            dr: this.commonDateModel.duration,
            startDate: tempStartDate,
            endDate: tempEndDate,
            resolution: this.commonDateModel.resolution
          });
          this._utility.resolution = this.commonDateModel.resolution;
        }
        //this.dr = this._utility.globalDr;

      });
      this._utility.hasSelectedBacknetObject = false;
    }
  }
  dropdownList = [];
  selectedItems = [];
  selectionItems = [];
  dropdownSettings = {
    singleSelection: false,
    text: "Select Equipment",
    badgeShowLimit: 3,
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    classes: "myclass custom-class",
    position: "bottom",
    enableFilterSelectAll: false
  };
  ngOnInit() {
    this._utility.btnLoading = false;
    this.getDates();
    this.maxStartDate.setHours(0, 0, 0, 0);
    this.maxEndDate.setHours(23, 59, 59, 59);
    this.commonDateModel = this.tenantService.currentDateValue;
    this._utility.canEdit = true;
    this._utility.hasSelectedBacknetObject = true;
    //this._utility.showSpinner = true;
    this._utility.datesValidator = false;
    if (this._utility.reportID) {
      this.templateID = this._utility.templateID;
      this._utility.hasSelectedBacknetObject = true;
      let rptParams = this._utility.rptObj;
      this.rptParamObj = this._utility.rptObj.find(
        p => p.reportId == this._utility.reportID
      );
      //console.log("-----Rrport param Object------", this.rptParamObj);
      this._utility.canEdit = this._utility.hasEditPermission(this.rptParamObj);
      this._rptService
        .getReportParameterValue(this._utility.reportID, this._utility.tenantID)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          data => {
            if (data) {
              this.rptParamval = data;
              this.rptParamval.forEach(element => {
                if (element.parameterName === "sdt") {
                  ////console.log(new Date(element["parameterValue"]));
                  this.drForm.value.startDate = new Date(
                    element["parameterValue"]
                  );
                  ////console.log(this.drForm.value.startDate, element.parameterValue);
                } else if (element.parameterName === "edt") {
                  this.drForm.value.endDate = new Date(element["parameterValue"]);
                } else if (element.parameterName === "eid") {

               this._utility.isObjectSelectionEnable = true;
                var elementParms = element["parameterValue"];
                this._utility.selectedItems = elementParms.split(",");
                this._adhocService.roomsList = elementParms.split(",");



              }
              else if (element.parameterName === "asid") {
                this._utility.isObjectSelectionEnable = true;
                var elementParms = element["parameterValue"];
                this._utility.selectedItems = elementParms.split(",");
                this._adhocService.checkedList = elementParms.split(",");
              }
                 else if (element.parameterName === "dr") {
                  this.dr = element["parameterValue"];
                  if (element.parameterValue != "custom") {
                    let StartDate = new Date();
                    let EndDate = new Date();
                    StartDate.setHours(0, 0, 0, 0);
                    EndDate.setHours(23, 59, 59, 59);
                    this.drForm.value.startDate = StartDate;
                    this.drForm.value.endDate = EndDate;
                  }
                } else if (element.parameterName === "res") {
                  this.drForm.value.resolution = element["parameterValue"];
                  this._utility.resolution = element["parameterValue"];
                }
              });
              this.form.setValue({
                reportName: this.rptParamObj.reportName,
                reportDescription: this.rptParamObj.reportDescription
              });
              this.checkReportName();
              this.getTemplates(this._utility.appID);
            }
          },
          error => {
            console.log(error);
          }
        );
    } else {
      this.getTemplates(this._utility.appID);
    }

    this.dropdownList = this._utility.getSelectObjectsList('eid');
  }
  onItemSelect(item: any) {
    if (this._utility.licenseInfo.isLimitedEdition)
      {
    if(this._utility.reportID == "")
    {
      this.dummyreportID = -1;
    }
    else
    {
      this.dummyreportID = this._utility.reportID;
    }
    this._rptService.getReportObjectExistsByRooms(this.dummyreportID, item.id, this._utility.tenantID, this._utility.appID, true)
    .subscribe(response => {
      if (response) {
        if (this.selectedItems.length < 1) {
          this._utility.validTemplateForm = false;
          this._utility.hasSelectedBacknetObject = false;
        } else {
          this._utility.hasSelectedBacknetObject = true;
          this._utility.validatorTemplateForm(
            this.DataForm,
            this.form,
            this.drForm
          );
        }

      }
      else
      {
        item = [];
        this.OnItemDeSelect(item)
        const dialogRef = this.dialog.open(DeleteDialog, {
          width: "390px",
          data: {
            id: 0,
            type: "",
            message:
              "Reached the Object limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>",
            action: "Warning",
            title: "Info",
          },
        });
        return;
      }
    }, error => {
      console.error('Error:', error);
    });
  }
      else{
        if (this.selectedItems.length < 1) {
          this._utility.validTemplateForm = false;
          this._utility.hasSelectedBacknetObject = false;
        } else {
          this._utility.hasSelectedBacknetObject = true;
          this._utility.validatorTemplateForm(
            this.DataForm,
            this.form,
            this.drForm
          );
        }

      }

  }
  OnItemDeSelect(item: any) {
    if (this.selectedItems.length < 1) {

      this._utility.validTemplateForm = false;

      this._utility.hasSelectedBacknetObject = false;

    } else {

      this._utility.hasSelectedBacknetObject = true;

      this._utility.validatorTemplateForm(

        this.DataForm,

        this.form,

        this.drForm

      );

    }

    // //console.log(item, "---------", this.selectedItems);

    // this.selectedItems;

    // this.selectionItems = [];

    // //console.log(item, "---------", this.selectedItems);

    // this.selectedItems.forEach(element => {

    //   this.selectionItems.push(element.itemName);

    // });

    //this.selectionItems.pop(item["itemName"]);

    //////console.log(this.selectedItems);

  }

  onSelectAll(items: any) {

    if (this.selectedItems.length < 1) {

      this._utility.validTemplateForm = false;

      this._utility.hasSelectedBacknetObject = false;

    } else {

      this._utility.hasSelectedBacknetObject = true;

      this._utility.validatorTemplateForm(

        this.DataForm,

        this.form,

        this.drForm

      );

    }

  }

  onFilterSelectAll(items: any) {
    if (this.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = false;
    } else {
      this._utility.hasSelectedBacknetObject = true;
      this._utility.validatorTemplateForm(
        this.DataForm,
        this.form,
        this.drForm
      );
    }
  }
  onDeSelectAll(items: any) {
    this.selectedItems = [];

    if (this.selectedItems.length < 1) {

      this._utility.validTemplateForm = false;

      this._utility.hasSelectedBacknetObject = false;

    } else {

      this._utility.hasSelectedBacknetObject = true;

      this._utility.validatorTemplateForm(

        this.DataForm,

        this.form,

        this.drForm

      );

    }

  }

  onFilterDeSelectAll(items: any) {

    this.selectedItems = [];

    if (this.selectedItems.length < 1) {

      this._utility.validTemplateForm = false;

      this._utility.hasSelectedBacknetObject = false;

    } else {

      this._utility.hasSelectedBacknetObject = true;

      this._utility.validatorTemplateForm(

        this.DataForm,

        this.form,

        this.drForm

      );

    }
  }
  getTemplates(appID: string) {
    const tempArray = [];
    const tempArray1 = [];
    this._utility.templateObjects = [];
    this._utility.viewobjname = 'eid'
    this._utility.getAppTemplates(this._utility.tenantID, appID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        //this._utility.templateObjects = data;//----my
        if (this.utility.entitySelected == 'Reports') {
          data.forEach(element => {
            if (element.reportType.toLowerCase() == 'report') {
              tempArray.push(element);
              this._utility.templateObjects = tempArray;
            }
          });
        }
        else {
          data.forEach(element => {
            if (element.reportType.toLowerCase() == 'transformer') {
              tempArray.push(element);
              this._utility.templateObjects = tempArray;
            }
          });
        }
        console.log(tempArray);
        console.log(tempArray1);

        let tempTemplateobjects: any;
        if (this._utility.reportID && this._utility.templateObjects) {

          //if (this._utility.reportID) {
          // this._utility.templateID = data[0]["id"];
          // tempTemplateobjects = this._utility.templateObjects.find(
          //   p => p.id == this._utility.templateID
          // );
          // if (this._utility.isEmpty(tempTemplateobjects)) {
          this.templateID = this._utility.templateID;
          //} else {
          //   this._rptService.showError("No template found");
          //   this._route.navigateByUrl("appAlarm/" + this._utility.appID);
          // }
        } else {
          this._utility.templateID = this._utility.templateObjects[0]["id"];
          this.templateID = this._utility.templateID;
        }
        this.getParams(this._utility.templateID);
      },
      error => {
        console.log(error);
      }
    );
  }
  // getLocations() {
  //   this._configure
  //     .getCriticalEquipmentsList("true", this._utility.tenantID)
  //     .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
  //       data => {

  //         let locations: any;
  //         // let locationsList: any;
  //         locations = data;
  //         locations.forEach(element => {
  //           this.dropdownList.push({
  //             id: element["equipmentName"],
  //             itemName: element["equipmentName"] // + "(" + element["site"] + ")"
  //           });
  //         });
  //       },
  //       error => {
  //         console.log(error);
  //       }
  //     );
  // }
  saveReport() {
    if (!this._utility.canEdit) {
      return;
    }
    this._utility.btnLoading = true;
    if (this._utility.licenseInfo.isLimitedEdition) {
      this._rptService
        .getReportList(
          this._utility.userID,
          this._utility.appID,
          this._utility.tenantID,
          this.utility.entitySelected == 'Reports' ? 'Report' : 'Transformer'
        ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          data => {

            if (data) {
              if (data.length < this._utility.licenseInfo.reportLimit) {
                this.onSaveReport();
              } else {
                const dialogRef = this.dialog.open(DeleteDialog, {
                  width: "390px",
                  data: {
                    id: 0,
                    type: '',
                    message: 'Reached the report creation limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>',
                    action: "Warning",
                    title: "Info"
                  }
                });
                this._utility.btnLoading = false;
                return;
              }
            }
            else {
              this.onSaveReport();
            }
          }, err => {
            this._utility.btnLoading = false;
            this._rptService.showError('Failed to check report count');
          });
    } else {
      this.onSaveReport();
    }
  }
  onSaveReport() {
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
    this.selectionItems = [];
    // this.selectedItems.forEach(element => {
    //   this.selectionItems.push(element.id);
    // });
    if (this._utility.selectedItems) {
      this._utility.selectedItems.forEach(element => {

        if (typeof element == "string" || typeof element == "number") {
          this.selectionItems.push(element);
        }
        else {
          this.selectionItems.push( element.sid);
        }
      });
    }
    if (this.drForm.value.dr === "custom") {
      if (this._utility.isObjectSelectionEnable) {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
          sdt: this._core.convert(this.drForm.value.startDate),
          edt: this._core.convert(this.drForm.value.endDate)
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr,
          sdt: this._core.convert(this.drForm.value.startDate),
          edt: this._core.convert(this.drForm.value.endDate)
        };
      }

    } else {
      if (this._utility.isObjectSelectionEnable) {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr,
        };
      }
    }
    if (this._utility.isEnableResolution) {
      this._utility.rptParamValues.res = this.drForm.value.resolution;
    }
    if (this._utility.isUserIdRequiredForTemplate) {
      this._utility.rptParamValues.uid = this._utility.userName;
    }
    if (this._utility.isTenantNameRequiredForTemplate) {
      this._utility.rptParamValues.tn = this.tenantService.currentTenantValue.tenantId;
    }
    if (this._utility.isBatchIdRequiredForTemplate) {
      this._utility.rptParamValues.bt = 0;
    }
    if (this.promptParameters) {
      this.promptParameters.forEach(element => {
        if (element.validValues !== undefined && element.multiValue) {
          this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]].toString();
        } else {
          this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]];
        }
      });
    }
    this._utility.rptTempParamValues = this._utility.rptParamValues;
    this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this.reportObj.TenantId = this._utility.tenantID;
    this._rptService
      .saveReport(
        this.reportObj
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          this._utility.btnLoading = false;
          this._utility.isReportList = true;
          this._utility.isCreateReport = false;
          this._rptService.showSuccess("Saved Successfully");
          if (this._utility.Transpage.includes("Transformers") == true) {
            this._route.navigateByUrl(this._utility.Transpage);
          }
          else {
            this._route.navigateByUrl("/appCrEq/" + this._utility.appID);
          }
        },
        error => {
          this._utility.btnLoading = false;
          this._rptService.showError("Error :" + error.error);
          this._route.navigateByUrl("/appCrEq/" + this._utility.appID);
        }
      );
  }
  checkReportParams(dynamicForm: AbstractControl, paramValue) {
    let ParamValue = dynamicForm.value[paramValue].trim();
    if (ParamValue != '') {
      this.DataForm.controls[paramValue].setValue(
        dynamicForm.value[paramValue]
      );
    } else {
      this.DataForm.controls[paramValue].setValue(ParamValue);
    }
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
    this.checkIsloadValid(paramValue);
  }

  checkIsloadValid(paramValue) {
    if (paramValue == 'lper') {
      if (this.DataForm.controls.lper.value != '') {
        this.loadValid = this.loadPattern.test(this.DataForm.controls.lper.value);
        if (!this.loadValid) {
          this.loadValid = true;
          this._utility.validTemplateForm = false;
        }
        else {
          this.loadValid = false;
          this._utility.validTemplateForm = true;
        }
      }
    }
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  generateFormControls(formData: any) {
    let tempGroup: FormGroup = new FormGroup({});
    formData.forEach(i => {
      if (i.parameterTypeName !== "String") {
        tempGroup.addControl(i.name, new FormControl("", Validators.compose([Validators.required])));
      } else if (i.validValues !== undefined && i.multiValue) {
        // i.defaultValues = [];
        tempGroup.addControl(i.name, new FormControl(i.defaultValues, Validators.compose([Validators.required])));
      } else {
        tempGroup.addControl(i.name, new FormControl("", Validators.compose([Validators.required, this.noWhitespaceValidator])));
      }
    });
    if (tempGroup.valid) {
      this._utility.validReportParams = true;
    }
    this._utility.showSpinner = false;
    this._utility.toggle = true;
    this._utility.isClickedToggle = true;
    this._utility.mainWidthToggle = true;
    this.templateChanged = true;
    return tempGroup;
  }
  getParams(templatePath: string) {
    if (templatePath == undefined) {
      window.history.back();
      return;
    }
    this._utility.isObjectSelectionEnable = false;
    this._utility.isEnableResolution = false;
    this._utility.hasSelectedBacknetObject = true;
    this._utility.isUserIdRequiredForTemplate = false;
    this._utility.isTenantNameRequiredForTemplate = false;
    this._utility.isBatchIdRequiredForTemplate = false;
    this._utility.isEnableAggregation = false;
    let tempParam = [];
    this.FormData = [];
    this.promptParameters = [];
    this._utility.showSpinner = true;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._rptService
      .getTemplateParameterListAsync(templatePath, this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {

          this.parameterslist = data;
          if (this.parameterslist) {
            this.parameterslist.forEach(element => {
              if (element["name"] === "res") {
                this._utility.isEnableResolution = true;
              }
              if (element["name"] === "asid") {
                this._utility.isObjectSelectionEnable = true;
              }
              if (element["name"] == 'eid') {
                this._utility.isObjectSelectionEnable = true;
              }
              if (element["name"] === "uid") {
                this._utility.isUserIdRequiredForTemplate = true;
              }
              if (element["name"] === "tn") {
                this._utility.isTenantNameRequiredForTemplate = true;
              }
              if (element["name"] === "bt") {
                this._utility.isBatchIdRequiredForTemplate = true;
              }
              if (
                this._utility.ignoredPrompts.indexOf(element["name"]) === -1 &&
                element["promptUser"]
              ) {
                let suffix = element["name"].split('_').reverse()[0];
                if (suffix == 'TIME') {
                  element["parameterTypeName"] = 'TIME';
                }
                this.promptParameters.push(element);
                this.FormData.push(element);
              } else if (element["name"] === "tip") {
                if (element["validValues"] !== null) {
                  tempParam = element["validValues"];
                  tempParam.forEach(e => {
                    this.tempObj[e["label"]] = e["value"];
                  });
                }
              }
            });
          }
          this.DataForm = this.generateFormControls(this.FormData);
          this.promptParameters.forEach(promptParam => {
            if (promptParam['defaultValues'] && promptParam['defaultValues'][0] !== null) {

              // this.DataForm.get(promptParam['name']).setValue(promptParam['defaultValues'][0]);
              const joinedValues = promptParam['defaultValues'].join(', ');

              this.DataForm.get(promptParam['name']).setValue(joinedValues);
            } else {

              this.DataForm.get(promptParam['name']).setValue('');
            }
          });

          if (this.rptParamval) {
            this.promptParameters.forEach(element => {
              this.rptParamval.forEach(elements => {
                if (elements["parameterName"] === element.name) {
                  if (element.validValues !== undefined && element.multiValue) {
                    const val = elements["parameterValue"].split(',');
                    this.DataForm.controls[element.name].setValue(
                      val
                    );
                    element["defaultValues"] = val;
                  } else {
                    this.DataForm.controls[element.name].setValue(
                      elements["parameterValue"]
                    );
                  }
                  return;
                }
              });
            });
          }
          this.dr = this.commonDateModel.duration;
          this.drForm.setValue({
            dr: this.commonDateModel.duration,
            startDate: this.commonDateModel.startDate,
            endDate: this.commonDateModel.endDate,
            resolution: this.commonDateModel.resolution
          });
          this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
          this._utility.resolution = this.commonDateModel.resolution;

          this._utility.showSpinner = false;
          this._utility.toggle = true;
          this._utility.isClickedToggle = true;
          this._utility.mainWidthToggle = true;
          if (this._utility.isReportRun) {
            this._utility.toggle = false;
            this._utility.isClickedToggle = false;
            this._utility.mainWidthToggle = false;
            this.runReport();
          }
          this.templateChanged = true;
          //this.runReport();
        },
        error => {
          this._utility.showSpinner = false;
          this._utility.toggle = true;
          this._utility.isClickedToggle = true;
          this._utility.mainWidthToggle = true;
          this._rptService.showError("Error :" + error.error);
          this.templateChanged = true;
        }
      );
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
  }
  PreviewData() {
  }
  onClickResolutionBtn(resolution?: string) {
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);

    if (!this._utility.validTemplateForm) {
      this.reportRunWarningDialog();
      return;
    }
    //console.log(resolution);
    this._utility.csvDownloadFlag = false;
    ////console.log(this.form.value);
    //this.reportObj.Id=this.id;
    this._utility.reportData = "";
    this._utility.hasChild = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.isRunFeatures = false;
    this._utility.showSpinner = true;
    this.reportObj.RptPath = "";
    this._utility.isObjectSelection = false;
    this._utility.reportObjUtil.Id = 0;
    this.reportObj.ReportName = this.form.value.reportName;
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
    this._utility.reportObjUtil = this.reportObj;
    this._utility.hasPreview = true;
    this.selectionItems = [];
    if (this._utility.selectedItems) {
      if (this._utility.selectedItems) {
        this._utility.selectedItems.forEach(element => {
          if (typeof element == "string" || typeof element == "number") {
            this.selectionItems.push(element);
          }
          else {
            this.selectionItems.push( element.sid);
          }
        });
      }
      //console.log(this._core.convert(this.drForm.value.startDate));
      if (resolution != undefined && (typeof resolution === "string")) {
        this._utility.resolution = resolution.toLowerCase();
        this.drForm.value.resolution = resolution.toLowerCase();

        if (this.drForm.value.dr === "custom") {
          if (this._utility.isObjectSelectionEnable) {
            this._utility.rptParamValues = {
              eid: this.selectionItems.toString(),
              dr: this.drForm.value.dr,
              sdt: this._core.convert(this.drForm.value.startDate),
              edt: this._core.convert(this.drForm.value.endDate),
              RptPath: this._utility.templateID,
              Section: 1
            };
          } else {
            this._utility.rptParamValues = {
              dr: this.drForm.value.dr,
              sdt: this._core.convert(this.drForm.value.startDate),
              edt: this._core.convert(this.drForm.value.endDate),
              RptPath: this._utility.templateID,
              Section: 1
            };
          }

        } else {
          if (this._utility.isObjectSelectionEnable) {
            this._utility.rptParamValues = {
              eid: this.selectionItems.toString(),
              RptPath: this._utility.templateID,
              dr: this.drForm.value.dr,
              Section: 1
            };
          } else {
            this._utility.rptParamValues = {
              RptPath: this._utility.templateID,
              dr: this.drForm.value.dr,
              Section: 1
            };
          }

        }
      }
      if (this._utility.isEnableResolution) {
        this._utility.rptParamValues.res = this.drForm.value.resolution;
      }
    }
    if (this._utility.isUserIdRequiredForTemplate) {
      this._utility.rptParamValues.uid = this._utility.userName;
    }
    if (this._utility.isTenantNameRequiredForTemplate) {
      this._utility.rptParamValues.tn = this.tenantService.currentTenantValue.tenantId;
    }
    if (this._utility.isBatchIdRequiredForTemplate) {
      this._utility.rptParamValues.bt = 0;
      if (
        this.datePickerHelper._duration !== this.drForm.value.dr || this.datePickerHelper.arsStartDate.getTime() !== this.drForm.value.startDate.getTime()
        || this.datePickerHelper.arsEndDate.getTime() !== this.drForm.value.endDate.getTime() || this.datePickerHelper.resolution !== this.drForm.value.resolution
      ) {
        this.updateGDPValues();
      }
      this.promptParameters.forEach(element => {
        if (element.validValues !== undefined && element.multiValue) {
          this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]].toString();
        } else {
          this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]];
        }
      });
      this._utility.rptTempParamValues = this._utility.rptParamValues;
      this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
      this.reportObj.TenantId = this._utility.tenantID;
      this.reportObj.ReportFormat = this._utility.reportFormat;
      this.reportObj.HasChild = false;

      //this._utility.showSpinner = true;
      this._rptService
        .runReport(
          this.reportObj
        )
        .subscribe(
          data => {
            this._utility.showSpinner = false;
            this._utility.reportData = data;
            this._utility.setPage();
            this._utility.reportClick();
            this._utility.isRunFeatures = true;
          },
          error => {
            this._utility.showSpinner = false;
            ////console.log("Error :", error);
          }
        );
    }
  }
  runReport() {
    this._utility.csvDownloadFlag = false;
    this._utility.reportData = "";
    this._utility.showSpinner = true;
    this.reportObj.Id = this._utility.reportID;
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this._utility.reportObjUtil = this.reportObj;
    this._utility.hasPreview = false;
    if (this._utility.isEnableResolution) {
      this._utility.rptParamValues = {
        RptPath: this._utility.templateID,
        Section: 1,
        sdt: this._core.convert(this.commonDateModel.startDate),
        edt: this._core.convert(this.commonDateModel.endDate),
        res: this.drForm.value.resolution
      };
    } else {
      this._utility.rptParamValues = {
        RptPath: this._utility.templateID,
        Section: 1,
        sdt: this._core.convert(this.commonDateModel.startDate),
        edt: this._core.convert(this.commonDateModel.endDate)
      };
    }
    this._utility.rptTempParamValues = this._utility.rptParamValues;
    this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this.reportObj.TenantId = this._utility.tenantID;
    this.reportObj.ReportFormat = this._utility.reportFormat;
    this.reportObj.HasChild = false;
    this.runSubscription = this._rptService
      .runReport(
        this.reportObj
      ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this._rptService
            .updateReportRunTime(this.reportObj.Id, this._utility.tenantID)
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
              runTime => {
              },
              err => {
                console.log(err);
              }
            );
          this._utility.showSpinner = false;
          this._utility.reportData = this._utility.changeGeneratorImgHeight(
            data
          );
          this._utility.reportClick();
          this._utility.setPage();
          this._utility.isRunFeatures = true;
        },
        error => {
          this._utility.reportData = "";
          this._utility.showSpinner = false;
        }
      );
  }

  updateReport() {
    if (!this._utility.canEdit) {
      this.saveOrUpdateDialog();
      return;
    }
    this._utility.btnLoading = true;
    this._utility.hasChild = false;
    this.reportObj.Id = this._utility.reportID;
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.Id = this._utility.reportID;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
    this.selectionItems = [];
    // if (this.selectedItems) {
    //   this.selectedItems.forEach(element => {
    //     this.selectionItems.push(element.id);
    //   });
    // }
    if (this._utility.isObjectSelectionEnable) {
      if (this._utility.isUpdate == true) {
        if (this._utility.selectedItems) {
          this._utility.selectedItems.forEach(element => {
            if (typeof element == "string") {
              this.selectionItems.push(element);
            }
            else {
              this.selectionItems.push(element.sid);
            }
          });
        }
      }
    }
    if (this.drForm.value.dr === "custom") {
      if (this._utility.isObjectSelectionEnable) {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
          sdt: this._core.convert(this.drForm.value.startDate),
          edt: this._core.convert(this.drForm.value.endDate)
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr,
          sdt: this._core.convert(this.drForm.value.startDate),
          edt: this._core.convert(this.drForm.value.endDate)
        };
      }

    } else {
      if (this._utility.isObjectSelectionEnable) {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr,
        };
      }

    }
    if (this._utility.isEnableResolution) {
      this._utility.rptParamValues.res = this.drForm.value.resolution;
    }
    if (this._utility.isUserIdRequiredForTemplate) {
      this._utility.rptParamValues.uid = this._utility.userName;
    }
    if (this._utility.isTenantNameRequiredForTemplate) {
      this._utility.rptParamValues.tn = this.tenantService.currentTenantValue.tenantId;
    }
    if (this._utility.isBatchIdRequiredForTemplate) {
      this._utility.rptParamValues.bt = 0;
    }
    if (
      this.datePickerHelper._duration !== this.drForm.value.dr || this.datePickerHelper.arsStartDate.getTime() !== this.drForm.value.startDate.getTime()
      || this.datePickerHelper.arsEndDate.getTime() !== this.drForm.value.endDate.getTime() || this.datePickerHelper.resolution !== this.drForm.value.resolution
    ) {
      this.updateGDPValues();
    }
    this.promptParameters.forEach(element => {
      if (element.validValues !== undefined && element.multiValue) {
        this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]].toString();
      } else {
        this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]];
      }
    });
    this._utility.rptTempParamValues = this._utility.rptParamValues;
    this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this.reportObj.TenantId = this._utility.tenantID;
    this._rptService
      .updateReport(
        this.reportObj
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          this._utility.btnLoading = false;
          this._utility.isReportList = true;
          this._utility.isCreateReport = false;
          this._rptService.showSuccess("Updated Successfully");

          if (this._utility.Transpage.includes("Transformers") == true) {
            this._route.navigateByUrl(this._utility.Transpage);
          }
          else {
            this._route.navigateByUrl("/appCrEq/" + this._utility.appID);
          }
        },
        error => {
          this._utility.btnLoading = false;
          this._rptService.showError("Error :" + error.error);
          this._route.navigateByUrl("/appCrEq/" + this._utility.appID);
        }
      );
  }
  checkReportName() {
    this._utility.reportNameExists = false;
    this._utility.hasReportNameValid = false;
    this._utility.isReportNameEmpty = false;

    if (this.form.value.reportName.toString().trim() === "") {
      this._utility.isReportNameEmpty = true;
      return;
    }
    if (this.rptParamObj !== undefined) {
      if (this.rptParamObj.reportName.toLocaleLowerCase() === this.form.value.reportName.toString().trim().toLocaleLowerCase()) {
        this._utility.reportNameExists = false;
        this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
        return;
      }
    }
    if (
      this._utility.validateReportName(this.form.value.reportName.toString())
    ) {
      this._utility.hasReportNameValid = true;
      return;
    }
    this._rptService
      .checkReportName(this.form.value.reportName.trim(), this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {

          if (data[0]["count"] == 0) {
            this._utility.reportNameExists = false;
          } else {
            this._utility.reportNameExists = true;
          }
        },
        error => {
          console.log(error);
          console.log(this.form.get("reportName"));
        }
      );
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
  }
  focusReportName() {
    this._utility.reportNameExists = false;
  }

  validateDuration() {
    if (this.drForm.value.dr === 'custom') {
      if (!(this.drForm.value.startDate && this.drForm.value.endDate)) {
        this._utility.validTemplateForm = false;
        return;
      }
      if (this.drForm.value.startDate.getTime() > this.drForm.value.endDate.getTime()) {
        this._utility.validTemplateForm = false;
        this._utility.datesValidator = true;
        return;
      } else {
        this._utility.datesValidator = false;
      }
      //this.generateFormControls("today");
      this._utility.getDefaultReportResolution(
        this.drForm.value.dr,
        this.drForm.value.startDate,
        this.drForm.value.endDate
      );
      this.drForm.value.resolution = this._utility.resolution;
      this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
    }
  }
  changeDuration() {
    if (this.drForm.value.dr) {
      if (this.drForm.value.dr !== 'custom') {
        this.tenantService.getDurationDates(this.drForm.value.dr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
          this.drForm.patchValue({
            startDate: new Date(resp.startDate),
            endDate: new Date(resp.endDate)
          });
          if (!(this.drForm.value.startDate && this.drForm.value.endDate)) {
            this._utility.validTemplateForm = false;
            return;
          }
          if (this.drForm.value.startDate.getTime() > this.drForm.value.endDate.getTime()) {
            this._utility.validTemplateForm = false;
            this._utility.datesValidator = true;
            return;
          } else {
            this._utility.datesValidator = false;
          }
          this._utility.getDefaultReportResolution(
            this.drForm.value.dr,
            this.drForm.value.startDate,
            this.drForm.value.endDate
          );
          this.drForm.patchValue({
            resolution: this._utility.resolution
          });
          this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
        });
      } else {
        this.drForm.patchValue({
          startDate: new Date(new Date().setHours(0, 0, 0)),
          endDate: new Date(new Date().setHours(23, 59, 59))
        });
        this.validateDuration();
      }
    }
  }
  saveOrUpdateDialog(): void {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: {
        id: 0,
        type: "",
        message: "You are not allowed to update the report",
        action: "Warning",
        title: "Warning"
      }
    });
  }
  changeTemplate() {
    this._utility.reportData = '';
    this._utility.isObjectSelection = false;
    this.selectedItems = [];
    // this._utility.selectedItems = [];
    // this._adhocService.checkedList = [];
    // this.form = new FormGroup({
    //   reportName: new FormControl("", [Validators.required]),
    //   reportDescription: new FormControl()
    // });
    this.templateChanged = false;
    this._utility.templateID = this.templateID;
    this.getParams(this._utility.templateID);
  }
  previewReport() {
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);

    if (!this._utility.validTemplateForm) {
      this.reportRunWarningDialog();
      return;
    }
    this._utility.isObjectSelection = false;
    this._utility.hasPreview = true;
    this._utility.csvDownloadFlag = false;
    this._utility.reportData = "";
    //this.reportObj.Id=this.id;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.isRunFeatures = false;
    this._utility.showSpinner = true;
    this._utility.reportData = "";
    this.reportObj.RptPath = "";
    this.reportObj.Id = 0;
    this._utility.reportObjUtil.Id = 0;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
    this._utility.reportObjUtil = this.reportObj;
    this._utility.hasPreview = true;
    this.selectionItems = [];

    if (this._utility.selectedItems) {
      this._utility.selectedItems.forEach(element => {
        if (typeof element == "string" || typeof element == "number") {
          this.selectionItems.push(element);
        }
        else {
          this.selectionItems.push(element.sid);
        }
      });
    }
    if (this.drForm.value.dr === "custom") {
      if (this._utility.isObjectSelectionEnable) {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
          RptPath: this._utility.templateID,
          Section: 1,
          sdt: this._core.convert(this.drForm.value.startDate),
          edt: this._core.convert(this.drForm.value.endDate)
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr,
          RptPath: this._utility.templateID,
          Section: 1,
          sdt: this._core.convert(this.drForm.value.startDate),
          edt: this._core.convert(this.drForm.value.endDate)
        };
      }

    } else {
      if (this._utility.isObjectSelectionEnable) {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
          RptPath: this._utility.templateID,
          Section: 1
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr,
          RptPath: this._utility.templateID,
          Section: 1
        };
      }
      if (this.utility.entitySelected == 'Transformers') {
        this._utility.rptParamValues = {
          //lid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
          RptPath: this._utility.templateID,
          Section: 1
        };
      }
      else {
        this._utility.rptParamValues = {
          eid: this.selectionItems.toString(),
          dr: this.drForm.value.dr,
          RptPath: this._utility.templateID,
          Section: 1
        };
      }

    }
    if (this._utility.isEnableResolution) {
      this._utility.rptParamValues.res = this.drForm.value.resolution;
    }
    if (this._utility.isUserIdRequiredForTemplate) {
      this._utility.rptParamValues.uid = this._utility.userName;
    }
    if (this._utility.isTenantNameRequiredForTemplate) {
      this._utility.rptParamValues.tn = this.tenantService.currentTenantValue.tenantId;
    }
    if (this._utility.isBatchIdRequiredForTemplate) {
      this._utility.rptParamValues.bt = 0;
    }
    if (
      this.datePickerHelper._duration !== this.drForm.value.dr || this.datePickerHelper.arsStartDate.getTime() !== this.drForm.value.startDate.getTime()
      || this.datePickerHelper.arsEndDate.getTime() !== this.drForm.value.endDate.getTime() || this.datePickerHelper.resolution !== this.drForm.value.resolution
    ) {
      this.updateGDPValues();
    }
    this._utility.currentPage = 1;

    this.promptParameters.forEach(element => {
      if (element.validValues !== undefined && element.multiValue) {
        this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]].toString();
      } else {
        this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]];
      }
    });
    this._utility.rptTempParamValues = this._utility.rptParamValues;
    const obj = this._utility.rptParamValues
    Object.keys(obj).forEach(key => {
      obj[key] = encodeURIComponent(obj[key]).replace(/%2C/g, ",");
      switch (key) {
        case (key = "dr"):
          obj[key] = decodeURIComponent(obj[key]);
          break;
      }
    });
    this.reportObj.ReportParams = JSON.stringify(obj);
    //this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
    //this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this.reportObj.TenantId = this._utility.tenantID;
    this.reportObj.ReportFormat = this._utility.reportFormat;
    this.reportObj.HasChild = false;
    if (this._utility.isObjectGrafana == true) {
      if (this._utility.isReportRun === true && this._utility.isGrafanareset === true || (this._utility.isReportRun === false && this._utility.isGrafanareset === true && this._utility.isGrafanaedit == false && this._utility.createRpt == false)) {
        this._utility.isGrafana = true;
        this.cdr.detectChanges();
      }
    }
    if (this._utility.isGrafana) {
      this._rptService.getGrafanaDashboardUrl(this._utility.reportID, this._utility.tenantID)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          a => {
            this._utility.grafanabase = a;
          }
        );
      const parameterArray = Object.entries(this._utility.rptParamValues)
        .filter(([parameterName]) => parameterName !== 'dr' && parameterName !== 'res')
        .map(([parameterName, parameterValue]) => `var-${parameterName}=${parameterValue}`)
        .join('&');
      const tid = this._utility.tenantID;
      const base = this._utility.grafanabase;
      const kiosk = "kiosk";
      const { startDate, endDate, resolution, duration } = this.tenantService.commonDateModel;
      let grafanaBaseUrl = `${base}&var-tn=${tid}&var-kiosk=${kiosk}&kiosk&theme=light&from=${new Date(startDate).getTime()}&to=${new Date(endDate).getTime()}&var-dr=${duration}&var-res=${resolution}`;
      this._utility.Grafanaurl = this.sanitizer.bypassSecurityTrustResourceUrl(`${grafanaBaseUrl}&${parameterArray}`);
      console.log(this._utility.Grafanaurl);
    }
    //     if (this._utility.isGrafana) {
    //       this._rptService.getGrafanaDashboardUrl(this._utility.reportID, this._utility.tenantID)
    //       .pipe(takeUntil(this.ngUnsubscribe))
    //       .subscribe(
    //   a => {
    //   },
    //   error => {
    //     this._utility.grafanabase = error.error.text
    //   }
    // );
    //       const parameterArray = Object.entries(this._utility.rptParamValues)
    //         .map(([parameterName, parameterValue]) => `var-${parameterName}=${parameterValue}`)
    //         .join('&');
    //       const tid = this._utility.tenantID;
    //       const base = this._utility.grafanabase;
    //       const { startDate, endDate } = this.tenantService.commonDateModel;
    //       const grafanaBaseUrl = `${base}?orgId=1&var-tn=${tid}&kiosk&from=${new Date(startDate).getTime()}&to=${new Date(endDate).getTime()}`;

    //       this._utility.Grafanaurl = this.sanitizer.bypassSecurityTrustResourceUrl(`${grafanaBaseUrl}&${parameterArray}`);
    //     }

    this.previewSubscription = this._rptService
      .runReport(
        this.reportObj
      ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this._utility.showSpinner = false;
          this._utility.reportData = this._utility.changeGeneratorImgHeight(
            data
          );
          this._utility.reportClick();
          this._utility.setPage();
          this._utility.isRunFeatures = true;
        },
        error => {
          this._utility.showSpinner = false;
        }
      );
  }
  getDates() {
    this.tenantService.currentDate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        tenant => {
          //console.log(this._adhocService.paramDevNum);
          this.tenants = tenant;
          if (tenant === undefined) {
            this._adhocService.reportParams.objectType = "";
            return;
          }
          // this._adhocService.tenantID = this.commonModel.tenantId;
          //this._adhocService.userID = this.commonModel.userId;
          //console.log(this._adhocService.tenantID);
          if (
            this.commonDateModel.duration !== this.drForm.value.dr || this.commonDateModel.startDate.getTime() !== this.drForm.value.startDate.getTime()
            || this.commonDateModel.endDate.getTime() !== this.drForm.value.endDate.getTime() || this.commonDateModel.resolution !== this.drForm.value.resolution
          ) {
            this.isDateRangeValid = true;

            if (this._utility.isCreateReport) {
              if (this._utility.isEmpty(this._utility.reportObjUtil)) {
                // click on create report
                if (this.flag) {
                  this.globalDPApply();
                }
              } else if (this._utility.isReportRun) {
                //click on run report
                if (this.flag) {
                  this.globalDPApply();
                }
              } else {
                if (this.flag) {
                  this.globalDPApply();
                }
              }
            }
          }
        },
        err => {
          console.log(err);
        }
      );
    this.flag = true;
  }
  globalDPApply() {
    this._utility.globalDr = this.commonDateModel.duration;
    this._utility.globalSDT = this.commonDateModel.startDate;
    this._utility.globalEDT = this.commonDateModel.endDate;
    var res = this.commonDateModel.resolution;
    if (res === undefined) {
      res = "actual";
    }
    this.dr = this._utility.globalDr;
    this.drForm.setValue({
      dr: this._utility.globalDr,
      startDate: this._utility.globalSDT,
      endDate: this._utility.globalEDT,
      resolution: res
    });
    this._utility.resolution = res;
    this.previewReport();
  }

  ngOnDestroy(): void {
    if (this.runSubscription !== undefined) {
      this.runSubscription.unsubscribe();
    }
    if (this.previewSubscription !== undefined) {
      this.previewSubscription.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  reportRunWarningDialog(): void {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: {
        id: 0,
        type: "",
        message: "Please provide all required report parameters.",
        action: "Warning",
        title: "Warning"
      }
    });
  }
  onCheckboxChange() {
    this.drForm.patchValue({
      dr: this.rptParamval.find(x => x.parameterName == 'dr').parameterValue,
      startDate: (this.rptParamval.find(x => x.parameterName == 'sdt') ? new Date(this.rptParamval.find(x => x.parameterName == 'sdt').parameterValue) : new Date(new Date().setHours(0, 0, 0))),
      endDate: (this.rptParamval.find(x => x.parameterName == 'edt') ? new Date(this.rptParamval.find(x => x.parameterName == 'edt').parameterValue) : new Date(new Date().setHours(23, 59, 59))),
      resolution: (this.rptParamval.find(x => x.parameterName == 'res')) ? this.rptParamval.find(x => x.parameterName == 'res').parameterValue : this.commonDateModel.resolution
    });

    this.dr = this.rptParamval.find(x => x.parameterName == 'dr').parameterValue;
    if (this.dr !== 'custom') {
      this.tenantService.getDurationDates(this.drForm.value.dr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.drForm.patchValue({
          startDate: new Date(resp.startDate),
          endDate: new Date(resp.endDate)
        });
        this.drForm.patchValue({
          resolution: (this.rptParamval.find(x => x.parameterName == 'res')) ? this.rptParamval.find(x => x.parameterName == 'res').parameterValue : this.commonDateModel.resolution
        });
        if (!(this.drForm.value.startDate && this.drForm.value.endDate)) {
          this._utility.validTemplateForm = false;
          return;
        }
        if (this.drForm.value.startDate.getTime() > this.drForm.value.endDate.getTime()) {
          this._utility.validTemplateForm = false;
          this._utility.datesValidator = true;
          return;
        } else {
          this._utility.datesValidator = false;
        }

        this._utility.resolution = (this.rptParamval.find(x => x.parameterName == 'res')) ? this.rptParamval.find(x => x.parameterName == 'res').parameterValue : this.commonDateModel.resolution; //}); });
        this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
      });
    }
  }
  UpdateReportDialog(): void {
    if (!this._utility.canEdit) {
      this.saveOrUpdateDialog();
      return;
    }
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: '', message: 'Modifying the report definition affects the report execution during schedule run. Are you sure, you want to update the report?', action: 'Update', title: 'Confirmation' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.updateReport();
      }
    });
    this._utility.isGrafana = this._utility.isGrafanareset;
    this._utility.isGrafanaedit = false;
  }
  updateGDPValues() {
    this._core.dateError = '';
    this._core.isDateRangeValid = true;
    this.tenantService.currentDateValue.duration = this.drForm.value.dr;
    this.tenantService.currentDateValue.startDate = new Date(this.drForm.value.startDate);
    this.tenantService.currentDateValue.endDate = new Date(this.drForm.value.endDate);
    this.tenantService.currentDateValue.resolution = this.drForm.value.resolution;
    this.datePickerHelper._duration = this.drForm.value.dr;
    this.datePickerHelper.arsStartDate = new Date(this.drForm.value.startDate);
    this.datePickerHelper.arsStartTime = new Date(this.drForm.value.startDate.setHours(this.drForm.value.startDate.getHours(), this.drForm.value.startDate.getMinutes(), this.drForm.value.startDate.getSeconds()));
    this.datePickerHelper.arsEndDate = new Date(this.drForm.value.endDate);
    this.datePickerHelper.arsEndTime = new Date(this.drForm.value.endDate.setHours(this.drForm.value.endDate.getHours(), this.drForm.value.endDate.getMinutes(), this.drForm.value.endDate.getSeconds()));
    setTimeout(() => {
      this.datePickerHelper.resolution = this.drForm.value.resolution;
      this.dateService.changeMessage(this.drForm.value.resolution);
    }, 2000);
    this.tenantService.currentDateValue.src = 'local';
    this.commonDateModel = this.tenantService.currentDateValue;
    this.tenantService.setCommonDate(this.commonDateModel);
  }
}
function elseif(arg0: string) {
  throw new Error('Function not implemented.');
}

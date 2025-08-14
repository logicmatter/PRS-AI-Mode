import { CoreUtilityService } from "./../../../../../src/app/PmCore/shared/core-utility.service";

import { Component, OnInit, Input, Output, OnDestroy, ChangeDetectorRef } from "@angular/core";

import { EventEmitter } from "events";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { Router } from "@angular/router";
import { ReportingService, TenantService } from "src/app/PmCore/services";
import * as $ from "jquery";
import { ReportObj } from "src/app/PmModel/ReportObj";
import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { MatDialog } from "@angular/material/dialog";
import { CommonModel } from "src/app/PmModel/common.model";
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { AdhocReportutilityService } from './../../../../AppAdhoc/src/app/adhoc-reportutility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { DatePickerHelper } from 'src/app/core/commondatepicker/datepicker-helper';
import { DatepickerService } from 'src/app/core/commondatepicker/datepicker.service';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-energy-common-params",
  templateUrl: "./app-energy-common-params.component.html",
  styleUrls: ["./app-energy-common-params.component.scss"]
})
export class AppEnergyCommonParamsComponent implements OnInit, OnDestroy {
  @Input() id;
  templateID = "";
  templateChanged: boolean = true;
  tempFormData: any[];
  parameterslist: any;
  promptParameters = [];
  FormData = [];
  DataForm: FormGroup = new FormGroup({});
  rptParamObj;
  rptParamval;
  reportData: any;
  startDate = this._utility.globalSDT;
  endDate = this._utility.globalEDT;
  public commonDateModel: CommonDateModel;
  maxStartDate = new Date();
  maxEndDate = new Date();
  dr: string = "";
  //showSpinner: boolean = false;
  tempObj = {};
  form = new FormGroup({
    reportName: new FormControl("", Validators.required),
    reportDescription: new FormControl()
  });
  public commonModel: CommonModel;
  drForm = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl(),
    dr: new FormControl("", Validators.required),
    resolution: new FormControl("", Validators.required)
  });
  // form = new FormGroup({
  //   reportName: new FormControl("", [Validators.required]),
  //   reportDescription: new FormControl(),
  //   startDate: new FormControl(),
  //   endDate: new FormControl(),
  //   dr: new FormControl()
  // });
  public reportObj: ReportObj = new ReportObj();

  isObjectSelectionEnable: boolean;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: any;
  previousStartDate: Date;
  previousEndDate: Date;
  previousDuration: any;
  isDateRangeValid: boolean = true;
  flag = false;
  runSubscription: Subscription;
  durations: any;
  searchText: string;
  previewSubscription: Subscription;
  constructor(
    public _utility: AppUtilService,
    public _core: CoreUtilityService,
    private _rptService: ReportingService,
    private _route: Router,
    public dialog: MatDialog,
    private tenantService: TenantService,
    private _adhocService: AdhocReportutilityService,
    public datePickerHelper: DatePickerHelper,
    public dateService: DatepickerService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {
    this.datePickerHelper.getDateTimeDurations().subscribe(data => {
      this.durations = data.durations;
      this.dr = this.durations[2].value;
    });
    this.commonDateModel = this.tenantService.currentDateValue;
    if (this._utility.reportID) {
    } else {
      this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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
            dr: this._utility.globalDr,
            startDate: tempStartDate,
            endDate: tempEndDate,
            resolution: this.commonDateModel.resolution
          });
          this._utility.resolution = this.commonDateModel.resolution;
        }
      });
      this._utility.hasSelectedBacknetObject = true;
    }
  }
  dropdownList = [];
  selectedItems = [];
  selectionItems = [];
  dropdownEUnitList = [];
  selectedEUnitItems = [];
  selectionEUnitItems = [];
  dropdownSettings = {
    singleSelection: false,
    text: "Select Object",
    badgeShowLimit: 1,
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    classes: "myclass custom-class",
    position: "bottom",
    maxHeight: 200
  };
  resolution: string;
  ngOnInit() {
    this._utility.btnLoading = false;
    this.getDates();
    this.maxStartDate.setHours(0, 0, 0, 0);
    this.maxEndDate.setHours(23, 59, 59, 59);
    this.commonDateModel = this.tenantService.currentDateValue;
    this._utility.canEdit = true;
    //this._utility.showSpinner = true;
    this._utility.datesValidator = false;
    if (this._utility.reportID) {
      // this.templateID = this._utility.templateID;
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
              } else if (element.parameterName === "esid") {
                var elementParms = element["parameterValue"];
                this._utility.selectedItems = elementParms.split(",");
                this._adhocService.checkedList = elementParms.split(",");
              } else if (element.parameterName === "dr") {
                this.dr = element["parameterValue"];
                this.drForm.value.dr = element["parameterValue"];
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
          },
          error => {
            console.log(error);
          }
        );
    } else {
      this.getTemplates(this._utility.appID);
    }
    this.dropdownList = this._utility.getSelectObjectsList('energy');


  }
  onItemSelect(item: any) {
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
    } else {
      this._utility.hasSelectedBacknetObject = true;
      this._utility.validatorTemplateForm(
        this.DataForm,
        this.form,
        this.drForm
      );
    }

  }
  OnItemDeSelect(item: any) {
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
    } else {
      this._utility.hasSelectedBacknetObject = true;
      this._utility.validatorTemplateForm(
        this.DataForm,
        this.form,
        this.drForm
      );
    }

  }
  onSelectAll(items: any) {
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
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
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
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
    this._utility.selectedItems = [];
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
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
    this._utility.selectedItems = [];
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
    } else {
      this._utility.hasSelectedBacknetObject = true;
      this._utility.validatorTemplateForm(
        this.DataForm,
        this.form,
        this.drForm
      );
    }
  }
  onClose(items: any) {
    if (this._utility.selectedItems.length < 1) {
      this._utility.validTemplateForm = false;
      this._utility.hasSelectedBacknetObject = true;
    } else {
      this._utility.hasSelectedBacknetObject = true;
      this._utility.validatorTemplateForm(
        this.DataForm,
        this.form,
        this.drForm
      );
    }
  }
  onEUnitItemSelect(item: any) {
    this.selectionEUnitItems = [];
    this.selectedEUnitItems.forEach(element => {
      this.selectionEUnitItems.push(element.id);
    });
  }
  OnEUnitItemDeSelect(item: any) {
  }

  getTemplates(appID: string) {
    this._utility.getAppTemplates(this._utility.tenantID, appID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {

        this._utility.templateObjects = data;
        let tempTemplateobjects: any;
        if (this._utility.reportID) {
          this.templateID = this._utility.templateID;
        } else {
          this._utility.templateID = data[0]["id"];
          this.templateID = this._utility.templateID;
        }
        this.getParams(this._utility.templateID);
      },
      error => {
        console.log(error);
      }
    );
  }
  getEnergyLogs() {
    this._rptService.getPointSID("Energy", this._utility.tenantID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        let trends: any;
        // let trendsList: any;
        trends = data;
        trends.forEach(element => {
          this.dropdownList.push({
            id: element["sid"],
            itemName: element["logDescription"] // + "(" + element["site"] + ")"
          });
        });
      },
      error => {
        //console.log(error);
      }
    );
  }

  getEnergyLogUnits() {
    this._rptService.getEnergyLogUnits(this._utility.tenantID, "-1").pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {

        let units: any;
        // let unitsList: any;
        units = data;
        units.forEach(element => {
          this.dropdownEUnitList.push({
            id: element["id"],
            itemName: element["engineeringUnit"] // + "(" + element["site"] + ")"
          });
        });
      },
      error => {
        //console.log(error);
      }
    );
  }

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
          this._utility.rType,
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
    this._utility.isGrafana = this._utility.isGrafanareset;
  }
  onSaveReport() {
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
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
          esid: this.selectionItems.toString(),
          // elu: this.selectionEUnitItems.toString(),
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
          esid: this.selectionItems.toString(),
          // elu: this.selectionEUnitItems.toString(),
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
      .saveReport(
        this.reportObj
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          this._utility.isReportList = true;
          this._utility.isCreateReport = false;
          this._utility.btnLoading = false;
          this._rptService.showSuccess("Saved Successfully");
          if (this._utility.Transpage.includes("Transformers") == true) {
            this._route.navigateByUrl(this._utility.Transpage);
          }
          else {
            this._route.navigateByUrl("appEnergy/" + this._utility.appID);
          }
        },
        error => {
          this._rptService.showError("Error :" + error.error);
          this._utility.btnLoading = false;
          this._route.navigateByUrl("appEnergy/" + this._utility.appID);
        }
      );
  }
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
  generateFormControls(formData: any) {
    let tempGroup: FormGroup = new FormGroup({});
    formData.forEach(i => {
      if (i.parameterTypeName !== "String") {
        tempGroup.addControl(i.name, new FormControl("", Validators.compose([Validators.required])));
      } else if (i.validValues !== undefined && i.multiValue) {
        i.defaultValues = [];
        tempGroup.addControl(i.name, new FormControl(i.defaultValues, Validators.compose([Validators.required])));
      } else {
        tempGroup.addControl(i.name, new FormControl("", Validators.compose([Validators.required, this.noWhitespaceValidator])));
      }
    });
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
          this.parameterslist.forEach(element => {
            if (element["name"] === "res") {
              this._utility.isEnableResolution = true;
            }
            if (element["name"] == 'esid') {
              this._utility.isObjectSelectionEnable = true;
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
              ////console.log(this.promptParameters["validValues"]);
            } else if (element["name"] === "tip") {
              tempParam.push(element["validValues"]);

              tempParam.forEach(e => {
                e.forEach(element => {
                  this.tempObj[element["label"]] = element["value"];
                });
              });
            }
          });
          this.DataForm = this.generateFormControls(this.FormData);
          // this.promptParameters.forEach(promptParam => {
          //   if (promptParam['defaultValues']) {
          //     this.DataForm.get(promptParam['name']).setValue(promptParam['defaultValues'][0]);
          //   }
          // });
          this.promptParameters.forEach(promptParam => {
            if (promptParam['defaultValues'] && promptParam['defaultValues'][0] !== null) {

              this.DataForm.get(promptParam['name']).setValue(promptParam['defaultValues'][0]);
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
          //this.changeDuration();
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
    // this._utility.showSpinner = false;
    // this._utility.toggle = true;
    // this._utility.isClickedToggle = true;
    // this._utility.mainWidthToggle = true;
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
  }
  PreviewData() { }
  previewReport(resolution?: string) {
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);
    if (!this._utility.validTemplateForm) {
      this.reportRunWarningDialog();
      return;
    }
    this._utility.csvDownloadFlag = false;
    ////console.log(this.form.value);
    //this.reportObj.Id=this.id;
    this._utility.isObjectSelection = false;
    this._utility.reportData = "";
    this._utility.hasChild = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.isRunFeatures = false;
    this._utility.showSpinner = true;
    this.reportObj.RptPath = "";
    this._utility.reportObjUtil.Id = 0;
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
    this._utility.reportObjUtil = this.reportObj;
    this.selectionItems = [];
    this._utility.hasPreview = true;
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
    //console.log(this._utility.reportObjUtil);
    if (resolution != undefined && (typeof resolution === "string")) {
      this._utility.resolution = resolution.toLowerCase();
      this.drForm.value.resolution = resolution.toLowerCase();
      if (this.drForm.value.dr === "custom") {
        if (this._utility.isObjectSelectionEnable) {
          this._utility.rptParamValues = {
            esid: this.selectionItems.toString(),
            // elu: this.selectionEUnitItems.toString(),
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
            esid: this.selectionItems.toString(),
            // elu: this.selectionEUnitItems.toString(),
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
      }
    } else {
      if (this.dr === "custom") {
        if (this._utility.isObjectSelectionEnable) {
          this._utility.rptParamValues = {
            esid: this.selectionItems.toString(),
            // elu: this.selectionEUnitItems.toString(),
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
            esid: this.selectionItems.toString(),
            // elu: this.selectionEUnitItems.toString(),
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
      }
    }
    if (this._utility.isEnableResolution) {
      this._utility.rptParamValues.res = this.drForm.value.resolution;
    }
    if (
      this.datePickerHelper._duration !== this.drForm.value.dr || this.datePickerHelper.arsStartDate.getTime() !== this.drForm.value.startDate.getTime()
      || this.datePickerHelper.arsEndDate.getTime() !== this.drForm.value.endDate.getTime() || this.datePickerHelper.resolution !== this.drForm.value.resolution
    ) {
      this.updateGDPValues();
    }
    this._utility.currentPage = 1;

    // this._utility.rptParamValues = {
    //   tsid: this.selectionItems.toString(),
    //   dr: "custom",
    //   RptPath: this._utility.templateURL,
    //   Section: this._utility.currentPage,
    //   sdt: this.form.value.startDate,
    //   edt: this.form.value.endDate
    // };
    this.promptParameters.forEach(element => {
      if (element.validValues !== undefined && element.multiValue) {
        this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]].toString();
      } else {
        this._utility.rptParamValues[element["name"]] = this.DataForm.value[element["name"]];
      }
    });
    //this._utility.showSpinner = true;
    this._utility.rptTempParamValues = this._utility.rptParamValues;
    this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
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
    }
    this.previewSubscription = this._rptService
      .runReport(
        this.reportObj
      ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this._utility.showSpinner = false;
          this._utility.reportData = data;
          this._utility.reportClick();
          this._utility.setPage();
          this._utility.isRunFeatures = true;
        },
        error => {
          this._utility.showSpinner = false;
          ////console.log("Error :", error);
        }
      );
  }

  runReport() {
    this._utility.csvDownloadFlag = false;
    this._utility.reportData = "";
    this._utility.showSpinner = true;
    this._utility.hasChild = false;
    ////console.log(this.form.value);
    this.reportObj.Id = this._utility.reportID;
    this.reportObj.ReportName = this.form.value.reportName.trim();
    // this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
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

    // this.promptParameters.forEach(element => {
    //   ////console.log(element, '------prompt parameters---', this.promptParameters);
    //   this._utility.rptParamValues[element["name"]] = this.DataForm.value[
    //     element["name"]
    //   ];
    //   ////console.log(this._utility.rptParamValues);
    // });
    //console.log(JSON.stringify(this._utility.rptParamValues));
    //console.log("---------report obj---", this.reportObj);
    this._utility.rptTempParamValues = this._utility.rptParamValues;
    this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
    this.reportObj.TenantId = this._utility.tenantID;
    this.reportObj.ReportFormat = this._utility.reportFormat;
    this.reportObj.HasChild = false;
    this.runSubscription = this._rptService
      .runReport(
        this.reportObj,
      ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {
          this._rptService
            .updateReportRunTime(this.reportObj.Id, this._utility.tenantID)
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
              runTime => {
                //console.log(runTime, "--------------runtime----");
              },
              err => {
                console.log(err);
              }
            );
          this._utility.showSpinner = false;
          this._utility.reportData = data;
          this._utility.reportClick();
          this._utility.setPage();
          this._utility.isRunFeatures = true;
        },
        error => {
          this._utility.reportData = "";
          this._utility.showSpinner = false;
          //console.log("Error :", error);
        }
      );
  }

  updateReport() {
    if (!this._utility.canEdit) {
      this.saveOrUpdateDialog();
      return;
    }
    this._utility.btnLoading = true;
    this.reportObj.Id = this._utility.reportID;
    this.reportObj.ReportName = this.form.value.reportName.trim();
    this.reportObj.ReportDescription = this.form.value.reportDescription;
    this.reportObj.AppId = this._utility.appID;
    this.reportObj.TemplateId = this._utility.templateID;
    this.reportObj.CreatedUserId = this._utility.userID;
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
          esid: this.selectionItems.toString(),
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
          esid: this.selectionItems.toString(),
          dr: this.drForm.value.dr
        };
      } else {
        this._utility.rptParamValues = {
          dr: this.drForm.value.dr
        };
      }
    }
    if (this._utility.isEnableResolution) {
      this._utility.rptParamValues.res = this.drForm.value.resolution;
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
            this._route.navigateByUrl("appEnergy/" + this._utility.appID);
          }
        },
        error => {
          this._utility.btnLoading = false;
          this._rptService.showError("Error :" + error.error);
          this._route.navigateByUrl("appEnergy/" + this._utility.appID);
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
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        data => {

          if (data[0]["count"] == 0) {
            this._utility.reportNameExists = false;
          } else {
            this._utility.reportNameExists = true;
            //console.log(this.form.get("reportName"));
          }
        },
        error => {
          //console.log(error);
          //console.log(this.form.get("reportName"));
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
    this._utility.isObjectSelection = false;
    this._utility.reportData = '';
    // this._utility.selectedItems = [];
    // this._adhocService.checkedList = [];
    // this.form = new FormGroup({
    //   reportName: new FormControl("", Validators.required),
    //   reportDescription: new FormControl()
    // });
    this.templateChanged = false;
    this._utility.templateID = this.templateID;
    this.getParams(this._utility.templateID);
  }

  onClickResolutionBtn(resolution?: string) {
    this._utility.validatorTemplateForm(this.DataForm, this.form, this.drForm);

    if (!this._utility.validTemplateForm) {
      this.reportRunWarningDialog();
      return;
    }
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
            this.selectionItems.push(element.sid);
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
              esid: this.selectionItems.toString(),
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
              esid: this.selectionItems.toString(),
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
  getDates() {
    this.tenantService.currentDate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        tenant => {
          this.tenants = tenant;
          if (tenant === undefined) {
            return;
          }
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
          //else {
          //  if (this._utility.reportID) {
          //    this.previewReport();
          //  }
          //}
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
    this.previewReport();
  }
  ngOnDestroy(): void {
    if (this.runSubscription != undefined) {
      this.runSubscription.unsubscribe();
    }
    if (this.previewSubscription != undefined) {
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
    this.tenantService.currentDateValue.src = 'local';
    this.datePickerHelper._duration = this.drForm.value.dr;
    this.datePickerHelper.arsStartDate = new Date(this.drForm.value.startDate);
    this.datePickerHelper.arsStartTime = new Date(this.drForm.value.startDate.setHours(this.drForm.value.startDate.getHours(), this.drForm.value.startDate.getMinutes(), this.drForm.value.startDate.getSeconds()));
    this.datePickerHelper.arsEndDate = new Date(this.drForm.value.endDate);
    this.datePickerHelper.arsEndTime = new Date(this.drForm.value.endDate.setHours(this.drForm.value.endDate.getHours(), this.drForm.value.endDate.getMinutes(), this.drForm.value.endDate.getSeconds()));
    setTimeout(() => {
      this.datePickerHelper.resolution = this.drForm.value.resolution;
      this.dateService.changeMessage(this.drForm.value.resolution);
    }, 2000);
    this.commonDateModel = this.tenantService.currentDateValue;
    this.tenantService.setCommonDate(this.commonDateModel);
  }
}

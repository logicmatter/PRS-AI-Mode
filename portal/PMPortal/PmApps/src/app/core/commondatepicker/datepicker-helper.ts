import { Inject, Injectable } from "@angular/core";
import { Observable, range, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { TenantService } from 'src/app/PmCore/services';
import { Duration } from "./duration.enum";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Router } from "@angular/router";

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/TenantManager/`;


@Injectable({
  providedIn: "root"
})
export class DatePickerHelper {
  options = {
    headers: this.jwt(),
    params: null
  }
  public arsStartDate = new Date();
  public arsEndDate = new Date();
  public arsStartTime = new Date();
  public arsEndTime = new Date();
  public startAt = "month";
  public pickUp = "both";
  public myFilter;
  public myFilter1;
  public dayOf = null;
  currentResolution: any;
  maxDate: Date;
  minDate: Date;
  _duration: string = 'today';
  durations = Duration;
  disableTime: boolean = true;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  resolution: string = 'actual';
  constructor(
    private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private tenantService: TenantService,
    public coreService: CoreUtilityService,
    private route: Router) {
  }

  changeDate(duration) {
    this.disableTime = true;
    this.coreService.isDateRangeValid = true;
    //this.arsStartDate.setHours(0, 0, 0, 0);
    //  this.arsEndDate.setHours(23, 59, 59, 59);
    //  this.arsStartTime.setHours(0, 0, 0, 0);
    //  this.arsEndTime.setHours(23, 59, 59, 59);
    if (this.tenantService.currentDateValue.src != undefined && this.tenantService.currentDateValue.src != 'gdp' && duration == 'custom') {
      this.coreService.dateError = '';
      this.arsStartDate = new Date(this.tenantService.currentDateValue.startDate.setHours(this.tenantService.currentDateValue.startDate.getHours(), this.tenantService.currentDateValue.startDate.getMinutes(), this.tenantService.currentDateValue.startDate.getSeconds()));
      this.arsEndDate = new Date(this.tenantService.currentDateValue.endDate.setHours(this.tenantService.currentDateValue.endDate.getHours(), this.tenantService.currentDateValue.endDate.getMinutes(), this.tenantService.currentDateValue.endDate.getSeconds()));
      this.arsStartTime = this.arsStartDate;
      this.arsEndTime = this.arsEndDate;
      this.arsStartTime.setHours(this.tenantService.currentDateValue.startDate.getHours(), this.tenantService.currentDateValue.startDate.getMinutes(), this.tenantService.currentDateValue.startDate.getSeconds());
      this.arsEndTime.setHours(this.tenantService.currentDateValue.endDate.getHours(), this.tenantService.currentDateValue.endDate.getMinutes(), this.tenantService.currentDateValue.endDate.getSeconds());
      if (this.arsEndDate.getTime() < this.arsStartDate.getTime()) {
        this.coreService.dateError = "Start Date should be less than End Date";
      }
      this.disableTime = false;
    }
    else if (duration == "today" || duration == "TODAY") {
      this.pickUp = "both";
      this.startAt = "month";
      this.myFilter = false;
      this.myFilter1 = false;
      this.getstartEndDates(duration);
    } else if (duration == "yesterday" || duration == "DAY") {
      this.getstartEndDates(duration);
    } else if (duration == "_24HRS") {
      this.getstartEndDates(duration);
    } else if (duration == "currentweek" || duration == "WTD") {
      this.getstartEndDates(duration);
    } else if (duration == "lastweek" || duration == "WEEK") {
      this.getstartEndDates(duration);
    } else if (duration == "currentmonth" || duration == "MTD") {
      this.getstartEndDates(duration);
    } else if (duration == "lastmonth" || duration == "MONTH") {
      this.getstartEndDates(duration);
    } else if (duration == "currentquarter" || duration == "QTD" || duration == "_1Q") {
      this.getstartEndDates(duration);
    } else if (duration == "lastquarter" || duration == "YTD") {
      this.getstartEndDates(duration);
    } else if (duration == "currentyear" || duration == "_1Y") {
      this.getstartEndDates(duration);
    } else if (duration == "lastyear" || duration == "_2Y") {
      this.getstartEndDates(duration);
    }
    else if (duration == "lastyearq1") {
      this.getstartEndDates(duration);
    }
    else if (duration == "lastyearq2") {
      this.getstartEndDates(duration);
    }
    else if (duration == "lastyearq3") {
      this.getstartEndDates(duration);
    }
    else if (duration == "lastyearq4") {
      this.getstartEndDates(duration);
    }
    else if (duration == "_2Q") {
      this.getstartEndDates(duration);
    }
    else if (duration == "_3Q") {
      this.getstartEndDates(duration);
    }
    else if (duration == "_4Q") {
      this.getstartEndDates(duration);
    }
    else if (duration == "Last 7D" || duration == "Last 7") {
      this.getstartEndDates(duration);
    }
    else if (duration == "Last 30D" || duration == "Last 30") {
      this.getstartEndDates(duration);
    }
    else if (duration == "Last 90D" || duration == "Last 90") {
      this.getstartEndDates(duration);
    }

    else if (duration == "custom" || duration == "CUSTOM") {
      this.disableTime = false;
      this.arsStartDate = new Date();
      this.arsEndDate = new Date();
      this.arsStartTime = new Date();
      this.arsEndTime = new Date();
      this.arsStartDate.setHours(0, 0, 0, 0);
      this.arsEndDate.setHours(23, 59, 59, 59);
      this.arsStartTime.setHours(0, 0, 0, 0);
      this.arsEndTime.setHours(23, 59, 59, 59);
      this.arsStartDate;
      this.arsEndDate;
      this.arsStartTime;
      this.arsEndTime;
      this.getDefaultReportResolution(duration, this.arsStartDate, this.arsEndDate);
    }
    this.minDate = this.arsStartDate;
    this.maxDate = this.arsEndDate;
  }

  /**
   * 
   * @param duration 
   */
  getstartEndDates(duration) {
    this.tenantService.getDurationDates(duration).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.arsStartDate = new Date(resp.startDate);
      this.arsStartDate;
      this.arsEndDate = new Date(resp.endDate);
      this.arsEndDate;
      this.arsStartTime = this.arsStartDate;
      this.arsEndTime = this.arsEndDate;
      this.getDefaultReportResolution(duration, this.arsStartDate, this.arsEndDate);
      return this.arsStartDate, this.arsEndDate;
      
    });
  }

  /**
   * 
   * @param duration 
   * @param startDate 
   * @param endDate 
   */
  getDefaultReportResolution(duration: string, startDate: Date, endDate: Date) {
    this.disableTime = true;
    switch (duration.toLowerCase()) {
      case "today":
      case "TODAY": {
        this.resolution = "actual";
        break;
      }
      case "yesterday":
      case "day": {
        this.resolution = "hourly";
        break;
      }
      case "currentweek":
      case "wtd": {
        this.resolution = "daily";
        break;
      }
      case "lastweek":
      case "week": {
        this.resolution = "daily";
        break;

      }

      case "currentmonth":
      case "mtd": {
        this.resolution = "daily";
        break;
      }
      case "lastmonth":
      case "month": {
        this.resolution = "daily";
        break;
      }

      case "currentquarter":
      case "qtd":
      case "_1q":
      case "_2q":
      case "_3q":
      case "_4q":
      case "lastyear1q":
      case "lastyear2q":
      case "lastyear3q":
      case "lastyear4q": {
        this.resolution = "weekly";
        break;
      }
      case "_1q":
      case "_2q":
      case "_3q":
      case "_4q": {
        this.resolution = "weekly";
        break;
      }
      case "lastyearq1":
      case "lastyearq2":
      case "lastyearq3":
      case "lastyearq4": {
        this.resolution = "weekly";
        break;
      }
      case "lastquarter":
      case "ytd": {
        this.resolution = "weekly";
        break;
      }

      case "currentyear":
      case "_1y": {
        this.resolution = "monthly";
        break;
      }
      case "lastyear":
      case "_2y": {
        this.resolution = "monthly";
        break;
      }
      case "last 7":
        this.resolution = "daily";
        break;
      case "last 30":
        this.resolution = "daily";
        break;
      case "last 90":
        this.resolution = "weekly";
        break;


      case "custom": {
        let nod = this.getDateDifference(startDate, endDate);
        this.getCustomResolution(nod);
        this.resolution = this.resolution;
        this.disableTime = false;
        break;
      }
      default: {
        //statements;
        // this.resolution = "custom";
        this.resolution = this.resolution;
        break;
      }
    }
  }

  /**
   * 
   * @param startDate 
   * @param endDate 
   * @returns 
   */
  getDateDifference(startDate: Date, endDate: Date): number {
    // var d1 = new Date(this._utility.reportParams.startDate);
    // var d2 = new Date(this._utility.reportParams.endDate);
    var timeDiff = endDate.getTime() - startDate.getTime();
    var DaysDiff = timeDiff / (1000 * 3600 * 24);
    if (DaysDiff < 1) {
      return DaysDiff;
    } else {
      return Math.round(DaysDiff);
    }
  }
  getCustomResolution(numberOfDay: number) {
    if (numberOfDay < 1) {
      this.resolution = "actual";
    } else if (numberOfDay == 1) {
      this.resolution = "hourly";
    } else if (numberOfDay > 1 && numberOfDay < 90) {
      this.resolution = "daily";
    }
    // else if(numberOfDay >30 && numberOfDay <90){
    //   this.resolution = "daily";
    // }
    else if (numberOfDay >= 90 && numberOfDay < 365) {
      this.resolution = "weekly";
    } else {
      this.resolution = "monthly";
    }
  }

  // Fetch the durations.json file data
  getDateTimeDurations(): Observable<any> {  
      return this.http.get(   API_URL + 'getDurations');
  }

  private jwt() {
    // create authorization header with jwt token
    const currentUserToken = localStorage.getItem('bearerToken');
    if (currentUserToken) {
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + currentUserToken });
      return headers;
    }
  }
}

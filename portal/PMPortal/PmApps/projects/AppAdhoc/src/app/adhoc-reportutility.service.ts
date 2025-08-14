import { Injectable } from "@angular/core";
import { AdhocReporting } from "src/app/PmModel/adhoc-reporting";
import { Router, RoutesRecognized } from "@angular/router";
import { filter, pairwise } from "rxjs/operators";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class AdhocReportutilityService {
  public reportParams: AdhocReporting = new AdhocReporting();
  resolution: string;
  adhocChart: any;
  adhocDurationChg: boolean = false;
  adhocDurationDesc: string;
  adhocDataDesc: string;
  adhocShowSpinner: boolean;
  adhocglobalStartDate: string;
  adhocglobalEndDate: string;
  adhocglobalDuration: string;
  adhocPreviousRoute: string;

  public adhocConfig: any = {
    type: "line",
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      fill: false,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      // events: [],
      hover: {
        animationDuration: 0,
        mode: "point",
        intersect: true
      },
      legend: {
        position: "bottom",
        onClick: (e) => e.stopPropagation()
      },
      legendCallback: function (chart) {
        // Return the HTML string here.
        var text = [];
        text.push('<ul class="' + chart.id + '-legend">');
        for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
          text.push('<li><span id="myChart-' + i + '-item" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '"   onclick="updateDataset(event, ' + '\'' + i + '\'' + ')">');
          if (chart.data.labels[i]) {
            text.push(chart.data.labels[i]);
          }
          text.push('</span></li>');
        }
        text.push('</ul>');
        return text.join("");
      },
      scales: {
        x:
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: ""
          }
        },
        y:
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Count"
          }
        }
      },
      elements: {
        point: {
          pointStyle: "rectRounded"
        }
      }
    }
  };
  tenantID: string;
  userID: string;
  color: any = [
    "#007bff",
    "#6610f2",
    "#e83e8c",
    "#dc3545",
    "#fd7e14",
    "#ffc107",
    "#28a745",
    "#20c997",
    "#17a2b8",
    "#6c757d",
    "#343a40",
    "#f8f9fa",
    "#007bff",
    "#6610f2",
    "#e83e8c",
    "#dc3545",
    "#fd7e14",
    "#ffc107",
    "#28a745",
    "#20c997",
    "#17a2b8",

    "#6c757d",
    "#343a40",
    "#f8f9fa",
    "#007bff",
    "#6610f2",
    "#e83e8c",
    "#dc3545",
    "#fd7e14",
    "#ffc107",
    "#28a745",
    "#20c997",
    "#17a2b8",

    "#6c757d",
    "#343a40",
    "#f8f9fa"
  ];

  startDate: Date;
  endDate: Date;
  entitySelected: string;
  config: { currentPage: number; itemsPerPage: number };
  paramDevNum: string;
  paramSid: string;
  saveFilter: any;
  trndsaveFilter: any;
  alrmsaveFilter: any;
  energysaveFilter: any;
  alrmcheckedList: any = [];
  alrmcheckNames: any = [];
  energycheckNames: any = [];
  trndcheckedList: any = [];
  trndcheckNames: any = [];
  checkedList: any = [];
  checkNames: any = [];
  energycheckedList: any = [];
  trnd;
  keyWord: any;
  previousTenant: string;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  classType: string;
  roomsList: any = [];
  constructor(private router: Router) {
    router.events
      .pipe(
        filter(event => event instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((e: any) => {
        this.adhocPreviousRoute = e[0].urlAfterRedirects;
      });
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
  }

  convert(str) {
    var date = new Date(str),
      month = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2),
      hours = ("0" + date.getHours()).slice(-2),
      minutes = ("0" + date.getMinutes()).slice(-2),
      seconds = ("0" + date.getSeconds()).slice(-2);

    var mySQLDate = [date.getFullYear(), month, day].join("-");
    var mySQLTime = [hours, minutes, seconds].join(":");
    return [mySQLDate, mySQLTime].join(" ");
  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  getYearlyXAxis() { }
  getMonthlyXAxis() { }
  getQuarterlylyXAxis() { }
  getWeeklyXAxis() { }
  getDailyXAxis() { }
  getHourlyXAxis() { }
  getActualXAxis() { }
}

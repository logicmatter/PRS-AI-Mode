import { Component, OnInit, Input } from "@angular/core";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

@Component({
  selector: "app-alarm-show-report",
  templateUrl: "./app-alarm-show-report.component.html",
  styleUrls: ["./app-alarm-show-report.component.scss"]
})
export class AppAlarmShowReportComponent implements OnInit {
  @Input("rptData") rptData;
  sanitizeHtml: string;
  constructor(public _utility: AppUtilService) {
    this.sanitizeHtml = `<svg></svg>`;
  }

  ngOnInit() {}
}

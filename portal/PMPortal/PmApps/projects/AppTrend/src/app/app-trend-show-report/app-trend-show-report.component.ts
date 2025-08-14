import { Component, OnInit, Input } from "@angular/core";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

@Component({
  selector: "app-trend-show-report",
  templateUrl: "./app-trend-show-report.component.html",
  styleUrls: ["./app-trend-show-report.component.scss"]
})
export class AppTrendShowReportComponent implements OnInit {
  @Input("rptData") rptData;
  sanitizeHtml: string;
  constructor(public _utility: AppUtilService) {
    this.sanitizeHtml = `<svg></svg>`;
  }

  ngOnInit() {}
}

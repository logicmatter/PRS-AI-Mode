import { Component, OnInit, Input } from "@angular/core";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

@Component({
  selector: "app-energy-show-report",
  templateUrl: "./app-energy-show-report.component.html",
  styleUrls: ["./app-energy-show-report.component.scss"]
})
export class AppEnergyShowReportComponent implements OnInit {
  @Input("rptData") rptData;
  sanitizeHtml: string;
  constructor(public _utility: AppUtilService) {
    this.sanitizeHtml = `<svg></svg>`;
  }

  ngOnInit() {}
}

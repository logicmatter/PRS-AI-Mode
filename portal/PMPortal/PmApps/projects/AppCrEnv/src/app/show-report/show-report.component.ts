import { Component, OnInit, Input } from "@angular/core";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";

@Component({
  selector: "app-show-report",
  templateUrl: "./show-report.component.html",
  styleUrls: ["./show-report.component.scss"]
})
export class ShowReportComponent implements OnInit {
  @Input("rptData") rptData;
  constructor(public _utility: AppUtilService) {}

  ngOnInit() {}
}

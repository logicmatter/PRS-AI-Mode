import { Component, Input, OnInit } from '@angular/core';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';

@Component({
  selector: 'show-report',
  templateUrl: './app-show-report.component.html',
  styleUrls: ['./app-show-report.component.scss']
})
export class AppShowReportComponent implements OnInit {
  @Input("rptData") rptData;
  sanitizeHtml: string;
  constructor(public _utility: AppUtilService) {
    this.sanitizeHtml = `<svg></svg>`;
  }

  ngOnInit() {}

}

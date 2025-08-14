import { Component, OnInit } from '@angular/core';
import { ReportHelper } from 'src/app/PmCore/shared/report-helper';
import * as $ from 'jquery';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(
    public reportHelper: ReportHelper
  ) { }

  ngOnInit() {
    //this.reportHelper.reportClick();
  }

}

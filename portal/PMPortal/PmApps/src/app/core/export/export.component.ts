import { Component, OnInit } from '@angular/core';
import { ReportHelper } from 'src/app/PmCore/shared/report-helper';
@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  constructor(
    public reportHelper: ReportHelper
  ) { }

  ngOnInit() {
  }

}

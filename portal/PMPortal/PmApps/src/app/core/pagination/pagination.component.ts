import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Input } from '@angular/core';
import { ReportHelper } from 'src/app/PmCore/shared/report-helper';
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, AfterViewInit {
  pageNo:any;
  @Input() set pageNum(pageNum1: string) {
    this.pageNo= pageNum1;
    this.reportHelper.setPage();
  }
  constructor(
    public reportHelper: ReportHelper,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.reportHelper = this.reportHelper;
  }
  ngAfterViewInit(): void {
    this.cdref.detectChanges();
    this.reportHelper = this.reportHelper;
  }

}

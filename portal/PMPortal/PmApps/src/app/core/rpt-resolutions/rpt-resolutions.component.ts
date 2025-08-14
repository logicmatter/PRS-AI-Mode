import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';

@Component({
  selector: 'app-rpt-resolutions',
  templateUrl: './rpt-resolutions.component.html',
  styleUrls: ['./rpt-resolutions.component.scss']
})
export class RptResolutionsComponent implements OnInit {
  @Input() buttonLabel: string;
  @Output() resClick = new EventEmitter<string>();

  constructor(
    public _utility: AppUtilService,
    public coreService: CoreUtilityService) { }

  ngOnInit() {
  }

  onClick() {
    this.resClick.emit(this.buttonLabel);
  }

}

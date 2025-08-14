import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"]
})
export class FilterComponent implements OnInit {
  @Input("placeHolderText") placeHolderText: string;
  constructor(public _core: CoreUtilityService) {}

  ngOnInit() {}
}

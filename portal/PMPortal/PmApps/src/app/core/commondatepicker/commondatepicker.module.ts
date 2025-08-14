import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimepickerComponent } from './timepicker/timepicker.component';
import { DurationComponent } from './duration/duration.component';
import { ResolutionComponent } from './resolution/resolution.component';
import { OrderModule } from 'ngx-order-pipe';
// owl Date Time Picker
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime-ex";

// Forms
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StartDateTimeComponent } from './start-date-time/start-date-time.component';
import { EndDateTimeComponent } from './end-date-time/end-date-time.component';

// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
@NgModule({
  declarations: [
    TimepickerComponent,
    DurationComponent,
    ResolutionComponent,
    StartDateTimeComponent,
    EndDateTimeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatButtonModule,
    OrderModule
  ],
  exports: [
    TimepickerComponent,
    DurationComponent,
    ResolutionComponent,
    StartDateTimeComponent,
    EndDateTimeComponent
  ]
})
export class CommondatepickerModule { }

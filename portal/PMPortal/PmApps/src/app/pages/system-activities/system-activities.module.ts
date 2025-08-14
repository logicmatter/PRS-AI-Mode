import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { SystemActivitiesComponent } from './system-activities.component';
import { sanitizeHtmlPipe } from './sanitize-html.pipe';
import { SpinnerModule } from '../../core/spinner/spinner.module';
import { RouterModule } from '@angular/router';

// Material Models
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { ReportComponent } from '../../core/report/report.component';
import { PaginationComponent } from '../../core/pagination/pagination.component';
import { ExportComponent } from '../../core/export/export.component';
@NgModule({
  declarations: [SystemActivitiesComponent, sanitizeHtmlPipe, ReportComponent, PaginationComponent, ExportComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    RouterModule
  ],
  exports: [
    sanitizeHtmlPipe,
    SpinnerModule,
    PaginationComponent,
    ReportComponent
  ]
})
export class SystemActivitiesModule { }

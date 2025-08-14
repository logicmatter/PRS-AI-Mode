
import { ModuleWithProviders, NgModule } from '@angular/core';


import { TransformersComponent } from './transformers.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FlowRoutingModule } from '../flow-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CoreModule } from 'src/app/core/core.module';
import { SearchModule } from 'src/app/pages/search/search.module';
import { MatPaginatorModule } from '@angular/material/paginator';





const providers = [AppUtilService, HttpClient];

@NgModule({
  declarations: [TransformersComponent],
  imports: [
    CommonModule,
    MatTableModule,
    FlowRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    AngularMultiSelectModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    SearchModule,
    CoreModule,
    MatPaginatorModule
  ],

  providers: providers,
  bootstrap: [TransformersComponent]
})
export class TransformersModule { }




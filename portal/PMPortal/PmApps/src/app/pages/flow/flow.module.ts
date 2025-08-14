import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataSourceDetailComponent } from './data-source-detail/data-source-detail.component';
import { SubscriptionEditComponent } from './subscription-edit/subscription-edit.component';
import { FlowDashboardComponent } from './flow-dashboard/flow-dashboard.component';
import { FlowRoutingModule } from './flow-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { SpinnerModule } from '../../core/spinner/spinner.module';
import { MaterialModule } from 'src/app/PmCore/shared/material-module';
import { DataFlowListComponent } from './data-flow-list/data-flow-list.component';
import { DataFlowDetailComponent } from './data-flow-detail/data-flow-detail.component';
import { DataLoadHistoryComponent } from './data-load-history/data-load-history.component';
import { DataErrorsListComponent } from './data-errors-list/data-errors-list.component';

import { TransformersModule } from './transformers/transformers.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { GatewayComponent } from './gateway/gateway.component';
import { GatewayDetailComponent } from './gateway-detail/gateway-detail.component';


@NgModule({
  declarations: [
    DataSourceDetailComponent,
    SubscriptionEditComponent,
    FlowDashboardComponent,
    DataFlowListComponent,
    DataFlowDetailComponent,
    DataLoadHistoryComponent,
    DataErrorsListComponent,
    GatewayComponent,
    GatewayDetailComponent,
    
    
  ],
  imports: [
    CommonModule,
    FlowRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    SpinnerModule,
    MaterialModule,
    TransformersModule,
    MatTableModule,
    MatSortModule
  ],
})
export class FlowModule { }

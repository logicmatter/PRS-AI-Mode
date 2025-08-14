import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateConfigurationComponent } from './template-configuration/template-configuration.component';
import { TemplateDeploymentComponent } from './template-deployment/template-deployment.component';
import { TemplateManagerDashboardComponent } from './template-manager-dashboard/template-manager-dashboard.component';
import { TemplateManagerRoutingModule } from './template-manager-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TemplateListComponent } from './template-list/template-list.component';
import { CoreModule } from '../../core/core.module';
import { SpinnerModule } from '../../core/spinner/spinner.module';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { } from '@angular/material/progress-bar';
import { SiteConfigComponent } from './site-config/site-config.component';
import { FriendlyNameComponent } from './friendly-name/friendly-name.component';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
    declarations: [
        TemplateConfigurationComponent,
        TemplateDeploymentComponent,
        TemplateListComponent,
        TemplateManagerDashboardComponent,
        SiteConfigComponent,
        FriendlyNameComponent
    ],
    imports: [
        CommonModule,
        TemplateManagerRoutingModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
        SpinnerModule,
        MatIconModule,
        MatTabsModule,
        MatButtonModule,
        MatTooltipModule,
        MatExpansionModule,
        MatProgressBarModule
    ]
})
export class TemplateManagerModule { }

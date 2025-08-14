import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateManagerDashboardComponent } from './template-manager-dashboard/template-manager-dashboard.component';
import { TemplateConfigurationComponent } from './template-configuration/template-configuration.component';
import { TemplateDeploymentComponent } from './template-deployment/template-deployment.component';
import { TemplateListComponent } from './template-list/template-list.component';
import { SiteConfigComponent } from './site-config/site-config.component';
import { FriendlyNameComponent } from './friendly-name/friendly-name.component';

const routes: Routes = [
    { path: '', redirectTo: 'template-config', pathMatch: 'full' },
    {
        path: '',
        component: TemplateManagerDashboardComponent,
        children: [
            { path: 'template-config', component: TemplateConfigurationComponent },
            { path: 'template-list', component: TemplateListComponent },
            { path: 'template-deploy', component: TemplateDeploymentComponent },
            { path: 'site-config', component: SiteConfigComponent },
            { path: 'tenant-friendly', component:FriendlyNameComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TemplateManagerRoutingModule { }

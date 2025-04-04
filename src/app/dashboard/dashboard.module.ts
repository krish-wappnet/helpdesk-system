import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component:AgentDashboardComponent},
  { path: 'admin', component:AdminDashboardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    MatCardModule,
    DragDropModule,
    FormsModule
  ],
  declarations: [AgentDashboardComponent, AdminDashboardComponent]
})
export class DashboardModule {}
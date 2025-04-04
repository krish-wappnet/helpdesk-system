import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    MatCardModule,
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule {}
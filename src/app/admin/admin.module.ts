import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes),CommonModule,MatTableModule,
    CommonModule,
    MatCardModule,
    DragDropModule,
    FormsModule
  ],
  declarations: [AdminDashboardComponent]
})
export class AdminModule {}
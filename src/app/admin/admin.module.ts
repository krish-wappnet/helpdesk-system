import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

const routes: Routes = [
  { path: '', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes),CommonModule,MatTableModule],
  declarations: [AdminComponent]
})
export class AdminModule {}
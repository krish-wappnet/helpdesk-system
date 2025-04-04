import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: '', component: TicketCreateComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [TicketCreateComponent],
  
})
export class TicketsModule {}
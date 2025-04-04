import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserTicketsComponent } from './user-tickets/user-tickets.component';

const routes: Routes = [
  { path: '', component: TicketCreateComponent },
  { path: 'my-tickets', component: UserTicketsComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [TicketCreateComponent, UserTicketsComponent],
  
})
export class TicketsModule {}
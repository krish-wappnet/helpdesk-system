import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as TicketActions from '../actions/ticket.action';

@Injectable()
export class TicketEffects {
  // Define actions$ using inject
  private readonly actions$ = inject(Actions);

  loadTickets$ = createEffect(() => this.actions$.pipe(
    ofType(TicketActions.loadTickets),
    map(() => TicketActions.loadTicketsSuccess({ tickets: [] })),
    catchError(error => of(TicketActions.loadTicketsFailure({ error })))
  ));

  createTicket$ = createEffect(() => this.actions$.pipe(
    ofType(TicketActions.createTicket),
    map(({ ticket }) => TicketActions.createTicketSuccess({ ticket })),
    catchError(error => of(TicketActions.createTicketFailure({ error })))
  ));
}
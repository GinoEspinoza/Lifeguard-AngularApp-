import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { TICKETS } from '../api.constants';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  ticketUrl:string = TICKETS;
  response:any;

  constructor(
    private http: HttpClient
  ) { }

  getTickets(options: any = {}) {
    return this.http.get(this.ticketUrl, {params: options }).map(response => {
      this.response = response
      return this.response
    });
  }

  showTicket(id) {
    return this.http.get(this.ticketUrl +"/"+ id).map(response => {
      this.response = response
      return this.response
    });
  }

  update(ticket, ticketForm){
    let formData: FormData = new FormData();
    if (ticketForm.hasOwnProperty('status')) {
      formData.append('status', ticketForm.status);
    }
    if(ticketForm.hasOwnProperty('priority')) {
      formData.append('priority', ticketForm.priority);
    }
    formData.append('_method', "PUT");
    return this.http.post(this.ticketUrl +"/"+ ticket.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

}

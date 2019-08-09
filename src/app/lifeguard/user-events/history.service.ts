import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  GET_HISTORY,
  ADD_HISTORY,
} from '../api.constants';


@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  getHistoryUrl = API_DOMAIN + GET_HISTORY;
  addHistoryUrl = API_DOMAIN + ADD_HISTORY;
  response:any;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };


  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient
  ) { }

  getHistory(params){
    return this.http.get(this.getHistoryUrl, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  addHistory(userId, controller, action) {
	  return this.http.post(this.addHistoryUrl, { user_id: userId, controller, action}).map(response => {
		  this.response = response;
		  return this.response;
	  })
  }
}

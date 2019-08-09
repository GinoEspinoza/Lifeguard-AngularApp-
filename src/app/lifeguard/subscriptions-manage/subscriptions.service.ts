import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';

import {
  API_DOMAIN,
  GET_SUBSCRIPTIONS,
  DELETE_SUBSCRIPTIONS,
  SHOW_SUBSCRIPTIONS,
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  deleteSubscriptionUrl = API_DOMAIN + DELETE_SUBSCRIPTIONS;
  getSubscriptionsUrl = API_DOMAIN + GET_SUBSCRIPTIONS;
  showSubscriptionsUrl = API_DOMAIN + SHOW_SUBSCRIPTIONS;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }


  getUsers(params = {}) {
    return this.http.get(this.getSubscriptionsUrl, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }


  getSubscriptionsList(params = {}) {
    let url = this.showSubscriptionsUrl;
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response;
    });
  }

  showUser(id) {
    return this.http.get(this.showSubscriptionsUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(userId){
    return this.http.delete(this.deleteSubscriptionUrl+"/"+userId).map(response => {
      this.response = response
      return this.response
    });
  }
}

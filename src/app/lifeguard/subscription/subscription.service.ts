import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';


import {
  API_DOMAIN,
  ADD_PAYPAL_PLAN,
  ADD_SUBSCRIPTION,
  ADD_SCHEDULE,
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  addPlanUrl = API_DOMAIN + ADD_PAYPAL_PLAN;
  addSubscriptionUrl = API_DOMAIN + ADD_SUBSCRIPTION;
  addScheduleUrl = API_DOMAIN + ADD_SCHEDULE;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }

  addPaypalPlan(subscription) {
    let formData: FormData = new FormData();
    formData.append('name', subscription.name);
    formData.append('type', subscription.type);
    formData.append('price', subscription.price);
    return this.http.post(this.addPlanUrl, formData)
  }
  addSubscription(subscription){
    let formData: FormData = new FormData();
    formData.append('office', subscription.office);
    formData.append('lock', subscription.lock);
    formData.append('camera', subscription.camera);
    formData.append('sub_user', subscription.sub_user);
    formData.append('type', subscription.type);
    formData.append('package_id', subscription.package_id);
    formData.append('plan_id', subscription.plan_id);
    formData.append('subscription_id', subscription.subscription_id);
    formData.append('mode', subscription.mode);
    formData.append('user_id', subscription.user_id);
    return this.http.post(this.addSubscriptionUrl, formData);
  }
  addSchedule(schedule){
    let formData: FormData = new FormData();
    formData.append('card_name', schedule.card_name);
    formData.append('card_number', schedule.card_number);
    formData.append('card_type', schedule.card_type);
    formData.append('expire_month', schedule.expire_month);
    formData.append('expire_year', schedule.expire_year);
    formData.append('cvv', schedule.cvv);
    formData.append('type', schedule.type);
    formData.append('user_id', schedule.user_id);
    formData.append('amount', schedule.amount);
    formData.append('mode', schedule.mode);
    formData.append('office', schedule.office);
    formData.append('lock', schedule.lock);
    formData.append('camera', schedule.camera);
    formData.append('sub_user', schedule.sub_user);

    return this.http.post(this.addScheduleUrl, formData);
  }
}

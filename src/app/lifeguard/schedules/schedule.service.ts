import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';


import {
  API_DOMAIN,
  CREATE_SCHEDULE,
  GET_SCHEDULES,
  DELETE_SCHEDULE,
  SHOW_SCHEDULE,
  SCHEDULE_USER_DEVICE_URL,
  SCHEDULE_LOCK_URL,
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  createScheduleUrl = API_DOMAIN + CREATE_SCHEDULE;
  deleteScheduleUrl = API_DOMAIN + DELETE_SCHEDULE ;
  getSchedulesUrl = API_DOMAIN + GET_SCHEDULES;
  showScheduleUrl = API_DOMAIN + SHOW_SCHEDULE;
  scheduleUserDeviceUrl = API_DOMAIN + SCHEDULE_USER_DEVICE_URL;
  scheduleLockUrl = API_DOMAIN + SCHEDULE_LOCK_URL;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }

  create(group_form) {
    let formData: FormData = new FormData();
    formData.append('name', group_form.name);
    formData.append('status', group_form.status);
    formData.append('company_id', group_form.companyId);
    formData.append('type', group_form.typeId);
    if(group_form.typeId == 0){
      formData.append('weekday', group_form.weekdays);
      formData.append('start_time', group_form.start_time);
      formData.append('end_time', group_form.end_time);
    }else if(group_form.typeId == 1){
      formData.append('start_day', group_form.start_day);
      formData.append('end_day', group_form.end_day);
      formData.append('repeat', group_form.repeat);
    }
    return this.http.post(this.createScheduleUrl, formData)
  }

  getSchedules(params = {}) {
    let url = this.getSchedulesUrl;
    console.log(this.localAuthService.currentCompany());
    if (this.localAuthService.currentCompany()) {
        url = this.getSchedulesUrl + '?company_id=' + this.localAuthService.currentCompany()['id'];
    }
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  update(group , group_form) {
    let formData: FormData = new FormData();
    formData.append('name', group_form.name);
    formData.append('status', group_form.status);
    formData.append('company_id', group_form.companyId);
    formData.append('type', group_form.typeId);
    if(group_form.typeId == 0){
      formData.append('weekday', group_form.weekdays);
      formData.append('start_time', group_form.start_time);
      formData.append('end_time', group_form.end_time);
    }else if(group_form.typeId == 1){
      formData.append('start_day', group_form.start_day);
      formData.append('end_day', group_form.end_day);
      formData.append('repeat', group_form.repeat);
    }
    formData.append('_method',"PUT");
    return this.http.post(this.createScheduleUrl + "/" + group.id, formData)
  }


  showSchedule(id) {
    return this.http.get(this.showScheduleUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(groupId){
    return this.http.delete(this.deleteScheduleUrl+"/"+groupId).map(response => {
      this.response = response
      return this.response
    });
  }
    
  setScheduleUserDevice(data) {
    let formData: FormData = new FormData();
    formData.append('schedules_id', data.scheduleId);
    formData.append('user_id', data.userId);
    formData.append('locks', data.locks);
    let url = this.scheduleUserDeviceUrl;
    if (data.ID > 0) {
      url += '/' + data.ID;
      formData.append('_method',"PUT");
    }
    return this.http.post(url, formData)
		.map(response => {
			this.response = response
			return this.response
		});
  }
  deleteScheduleUserDevice(data){
    return this.http.delete(this.scheduleUserDeviceUrl+"/"+data.id).map(response => {
      this.response = response
      return this.response
    });
  }
  getScheduleRelations(sid) {
	  return this.http.get(this.scheduleUserDeviceUrl+'?schedules_id='+sid).map(resp => {
		  this.response = resp;
		  return this.response;
	  });
  }

  //For the locks
  setScheduleLock(data) {
    let formData: FormData = new FormData();
    formData.append('schedules_id', data.scheduleId);
    formData.append('type', data.type);
    formData.append('locks', data.locks);
    let url = this.scheduleLockUrl;
    if (data.ID > 0) {
      url += '/' + data.ID;
      formData.append('_method',"PUT");
    }
    return this.http.post(url, formData)
		.map(response => {
			this.response = response
			return this.response
		});
  }
  deleteScheduleLock(data){
    return this.http.delete(this.scheduleLockUrl+"/"+data.id).map(response => {
      this.response = response
      return this.response
    });
  }
  getScheduleLockRelations(sid) {
	  return this.http.get(this.scheduleLockUrl+'?schedules_id='+sid).map(resp => {
		  this.response = resp;
		  return this.response;
	  });
  }
  
}

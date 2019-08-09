import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService, AlertService } from '../../services';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  OFFICE_URL,
  GET_COMPANIES,
  LOCK_URL,
  CAMERA_CHANGE_NAME,
  HUB_LOCKS_URL,
  SCHEDULE_USER_URL,
  DEFAULT_LOCK_URL
} from '../../api.constants';


@Injectable({
  providedIn: 'root'
})
export class LockService {

  lockUrl = API_DOMAIN + LOCK_URL;
  hubLocksUrl = API_DOMAIN + HUB_LOCKS_URL
  companyUrl = API_DOMAIN + GET_COMPANIES;
  changeNameUrl = API_DOMAIN + CAMERA_CHANGE_NAME
  scheduleUserUrl = API_DOMAIN + SCHEDULE_USER_URL
  defaultLockUrl = API_DOMAIN + DEFAULT_LOCK_URL
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private authService : LocalAuthService,
    private http: HttpClient
  ) { }

  create(lockData) {
    let formData: FormData = new FormData();

    formData.append('ip', lockData.ip);
    formData.append('company_id', lockData.companyId);
    formData.append('office_id', lockData.officeId);
    if (lockData.zoneId) {
      formData.append('zone_id', lockData.zoneId);
    }
    formData.append('company_device_id', lockData.companyDeviceId);
    formData.append('device_name', lockData.deviceName);
    if(lockData.type)
      formData.append('type', lockData.type);
    formData.append('status', lockData.status);
    formData.append('subscription_status', lockData.subscription_status || '');
    formData.append('subscription_start', lockData.subscription_start || '')
    formData.append('subscription_end', lockData.subscription_end || '')
    return this.http.post(this.lockUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getLocks(params = {}) {
    let url = this.lockUrl;
    if (this.authService.currentCompany()) {
      url = this.lockUrl + '?company_id=' + this.authService.currentCompany()['id'];
    }
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  getLock(id:any) {
    return this.http.get(this.lockUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  update( lock:any , lockData:any ){
    let formData: FormData = new FormData();
    formData.append('ip', lockData.ip);
    formData.append('company_id', lockData.companyId);
    formData.append('office_id', lockData.officeId);
    if (lockData.zoneId) {
      formData.append('zone_id', lockData.zoneId);
    }
    formData.append('company_device_id', lockData.companyDeviceId);
    formData.append('device_name', lockData.deviceName);
    if(lockData.type)
      formData.append('type', lockData.type);
    formData.append('status', lockData.status);
    formData.append('subscription_status', lockData.subscription_status || '');
    formData.append('subscription_start', lockData.subscription_start || '')
    formData.append('subscription_end', lockData.subscription_end || '')
    formData.append('_method',"PUT");
    return this.http.post(this.lockUrl+"/"+lock.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(lockId, isForceDelete=false){
    let params = {}
    if (isForceDelete) {
      params = {params: {force: isForceDelete} }
    }
    return this.http.delete(this.lockUrl+"/"+lockId, params).map(response => {
      this.response = response
      return this.response
    });
  }

  updateState(lock) {
    let formData: FormData = new FormData();
    formData.append('ip', lock.ip);
    formData.append('company_id', lock.company.id);
    formData.append('office_id', lock.office.id);
    formData.append('zone_id', lock.zone.id);
    formData.append('company_device_id', lock.company_device.id);
    formData.append('device_name', lock.device_name);
    formData.append('status', lock.status ? '1' : '0');
    formData.append('_method',"PUT");
    return this.http.post(this.lockUrl+"/"+lock.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  updateName(camera, cameraData) {
    let formData:FormData = new FormData();
    formData.append('id', cameraData.id)
    formData.append('office_id', cameraData.officeId)
    formData.append('camera_name', cameraData.cameraName)
    return this.http.post(this.changeNameUrl, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  getHubLocks(mac) {
    return this.http.get(this.hubLocksUrl + mac).map(response => {
      this.response = response
      return this.response
    });
  }

  getScheduleUsers(id:any) {
    return this.http.get(this.scheduleUserUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }
  setRockDefault(id:any) {
    return this.http.get(this.defaultLockUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }
}

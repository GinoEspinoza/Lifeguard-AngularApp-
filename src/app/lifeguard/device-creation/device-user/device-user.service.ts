import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService } from '../../services';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  DEVICE_USER_URL,
  GENERATE_DEVICE_USER_ID_URL,
  SHARE_CREDENTIAL_URL,
} from '../../api.constants';

@Injectable({
  providedIn: 'root'
})
export class DeviceUserService {
  DEVICE_USER_URL
  deviceUserUrl = API_DOMAIN + DEVICE_USER_URL;
  deviceUserIdUrl = API_DOMAIN + GENERATE_DEVICE_USER_ID_URL;
  shareCredentialUrl = API_DOMAIN + SHARE_CREDENTIAL_URL;
  response:any;

  constructor(
    private router: Router,
    private authService : LocalAuthService,
    private http: HttpClient
  ) { }

  create(deviceUserData) {
    let formData: FormData = new FormData();
    formData.append('company_id', deviceUserData.companyId);
    formData.append('locks', deviceUserData.lockId);
    formData.append('groups', deviceUserData.groupId);
    formData.append('device_user_id', deviceUserData.deviceUserId);
    formData.append('ref_device_user_id', deviceUserData.refDeviceUserId);
    formData.append('device_user_fname', deviceUserData.deviceUserFName);
    formData.append('device_user_lname', deviceUserData.deviceUserLName);
    formData.append('status', deviceUserData.status);
    formData.append('pin', deviceUserData.pin);
    return this.http.post(this.deviceUserUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getCompaniesHavingLocks() {
    let url = API_DOMAIN + '/api/v1/companiesHavingLocks';
    return this.http.get(url).map(response => {
      this.response = response
      return this.response
    });
  }

  getOfficesHavingLocks(company) {
    let url = API_DOMAIN + '/api/v1/companyOfficesHavingLocks/' + company['id'];
    return this.http.get(url).map(response => {
      this.response = response
      return this.response
    });
  }

  getZonesHavingLocks(office) {
    let url = API_DOMAIN + '/api/v1/officeZonesHavingLocks/' + office['id'];
    return this.http.get(url).map(response => {
      this.response = response
      return this.response
    });
  }

  getZoneDevicesHavingLocks(zones) {
    let url = API_DOMAIN + '/api/v1/zonesDevicesHavingLocks';
    let formData: FormData = new FormData();
    zones.map( (zone) => {
      formData.append('zone_ids[]', zone.id);
    })
    return this.http.post(url, formData).map(response => {
      this.response = response
      return this.response
    });
  }

  getDeviceUsers(params = {}) {
    let url = this.deviceUserUrl;
    if (this.authService.currentCompany()) {
      url = this.deviceUserUrl + '?company_id=' + this.authService.currentCompany()['id'];
    }
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  getDeviceUser(id:any) {
    return this.http.get(this.deviceUserUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  searchDeviceUser(employeeName:string) {
    return this.http.get(this.deviceUserUrl+"?search="+employeeName+"&per_page=-1").map(response => {
      this.response = response['data']
      this.response.forEach(item => { item.device_user_name = item.device_user_fname + ' ' + item.device_user_lname })
      return this.response
      // return []
    });
  }

  update(deviceUser:any , deviceUserData:any ){
    let formData: FormData = new FormData();
    formData.append('company_id', deviceUserData.companyId);
    formData.append('locks', deviceUserData.lockId);
    formData.append('groups', deviceUserData.groupId);
    formData.append('device_user_id', deviceUserData.deviceUserId);
    formData.append('ref_device_user_id', deviceUserData.refDeviceUserId);
    formData.append('device_user_fname', deviceUserData.deviceUserFName);
    formData.append('device_user_lname', deviceUserData.deviceUserLName);
    formData.append('status', deviceUserData.status);
    formData.append('pin', deviceUserData.pin);
    formData.append('_method',"PUT");
    return this.http.post(this.deviceUserUrl+"/"+deviceUser.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }
  updateShareCredentials(data:any){
    let formData: FormData = new FormData();
    formData.append('id', data.id)
    formData.append('locks_enroll', data.locks_enroll)
    formData.append('smart_card_number', data.smart_card_number)
    formData.append('_method',"PUT");
    return this.http.post(this.shareCredentialUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }
  delete(user, lock=null){
    let param = "";
    if (lock) {
      param = '?lock_id=' + lock.id;
    }
    return this.http.delete(this.deviceUserUrl+"/"+user.id + param).map(response => {
      this.response = response
      return this.response
    });
  }

  deleteCredential(user, lock=null){
    let param = "";
    if (lock) {
      param = '?lock_enroll_id=' + lock.id;
    }
    return this.http.delete(this.deviceUserUrl+"/"+user.id + param).map(response => {
      this.response = response
      return this.response
    });
  }

  generateID() {
    return this.http.get(this.deviceUserIdUrl).map(response => {
      this.response = response
      return this.response
    });
  }

}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';

import {
  API_DOMAIN,
  CREATE_SUB_USER,
  GET_SUB_USERS,
  COMPANY_USER_URL,
  DELETE_SUB_USER,
  SHOW_SUB_USER,
  PERMISSIONS,
} from '../api.constants';


@Injectable({
  providedIn: 'root'
})
export class SubUserService {

  createUserUrl = API_DOMAIN + CREATE_SUB_USER;
  deleteUserUrl = API_DOMAIN + DELETE_SUB_USER;
  getUsersUrl = API_DOMAIN + GET_SUB_USERS;
  getCompanyUsersUrl = API_DOMAIN + COMPANY_USER_URL;
  showUserUrl = API_DOMAIN + SHOW_SUB_USER;
  getPermissionsUrl = API_DOMAIN + PERMISSIONS;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }

  create(user) {
    let formData: FormData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('password_confirmation', user.passwordConfirmation);
    formData.append('mobile_no', user.mobileNo);
    formData.append('address', user.address);
    formData.append('status', user.status);
    formData.append('role', 'Sub User');
    formData.append('company_id', user.company[0].id);
    user.permissions.forEach( (permission) => {
      formData.append('permissions[]', permission.name);
    });
    user.offices.forEach( (office) => {
      formData.append('offices[]', office.id);
    });
    user.zones.forEach( (zone) => {
      formData.append('zones[]', zone.id);
    });
    return this.http.post(this.createUserUrl, formData)
  }

  getUsers(params = {}) {
    return this.http.get(this.getUsersUrl, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  update(user, userForm) {
    let formData: FormData = new FormData();
    formData.append('name', userForm.name);
    formData.append('email', userForm.email);
    if (userForm.password) {
      formData.append('password', userForm.password);
      formData.append('password_confirmation', userForm.passwordConfirmation);
    }
    formData.append('mobile_no', userForm.mobileNo);
    formData.append('address', userForm.address);
    formData.append('role', 'Sub User');
    formData.append('company_id', userForm.company[0].id);
    userForm.permissions.forEach( (permission) => {
      formData.append('permissions[]', permission.name);
    });
    formData.append('status', userForm.status);
    user.offices.forEach( (office) => {
      formData.append('offices[]', office.id);
    });
    user.zones.forEach( (zone) => {
      formData.append('zones[]', zone.id);
    });
    formData.append('_method',"PUT");
    return this.http.post(this.createUserUrl + "/" + user.id, formData)
  }

  getUserList(params = {}) {
    let url = this.getUsersUrl;
    if (this.localAuthService.currentCompany() && !params['company_id']) {
      params['company_id'] = this.localAuthService.currentCompany()['id'];
    }
    params['role_id'] = 4;
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response;
    });
  }

  showUser(id) {
    return this.http.get(this.showUserUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(userId){
    return this.http.delete(this.deleteUserUrl+"/"+userId).map(response => {
      this.response = response
      return this.response
    });
  }

  getPermissions(roleId) {
    let url = this.getPermissionsUrl.replace(':id', roleId)
    return this.http.get(url).map(response => {
      this.response = response;
      return this.response;
    });
  }
  getZones(offices) {
    let url = API_DOMAIN + '/api/v1/getOfficeMultiZones';
    let formData: FormData = new FormData();
    offices.map( (office) => {
      formData.append('office_ids[]', office.id);
    })
    return this.http.post(url, formData).map(response => {
      this.response = response
      return this.response
    });
  }
  deviceAssign(params) {
    let url = API_DOMAIN + '/api/v1/subUserDeviceAction';
    let formData: FormData = new FormData();
    formData.append('user_id', params.user_id);
    formData.append('device_id', params.device_id);
    formData.append('type', params.type);
    formData.append('action', params.action);
    
    return this.http.post(url, formData).map(response => {
      this.response = response
      return this.response
    });
  }
}

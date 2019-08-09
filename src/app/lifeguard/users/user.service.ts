import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';

import {
  API_DOMAIN,
  CREATE_USER,
  GET_USERS,
  COMPANY_USER_URL,
  DELETE_USER,
  SHOW_USER,
  PERMISSIONS,
  USER_PROFILE_URL,
  CHANGE_PASSWORD,
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  createUserUrl = API_DOMAIN + CREATE_USER;
  deleteUserUrl = API_DOMAIN + DELETE_USER;
  getUsersUrl = API_DOMAIN + GET_USERS;
  getCompanyUsersUrl = API_DOMAIN + COMPANY_USER_URL;
  showUserUrl = API_DOMAIN + SHOW_USER;
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
    formData.append('role', user.role[0].name);
    if (user.role[0].name == 'Company User') {
      formData.append('company_id', user.company[0].id);
      formData.append('sub_users',user.sub_users);
      user.permissions.forEach( (permission) => {
        formData.append('permissions[]', permission.name);
      });
    } else if(user.role[0].name == 'System Admin') {
      user.permissions.forEach( (permission) => {
        formData.append('permissions[]', permission.name);
      });
      formData.append('company_id', '1');
    } else {
      formData.append('company_id', '1');
      formData.append('permissions[]', 'Root');
    }
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
    formData.append('role', userForm.role[0].name);
    if (userForm.role[0].name == 'Company User') {
      formData.append('company_id', userForm.company[0].id);
      formData.append('sub_users',userForm.sub_users);
      userForm.permissions.forEach( (permission) => {
        formData.append('permissions[]', permission.name);
      });
    } else if(userForm.role[0].name == 'System Admin') {
      userForm.permissions.forEach( (permission) => {
        formData.append('permissions[]', permission.name);
      });
      formData.append('company_id', '1');
    } else {
      formData.append('company_id', '1');
      formData.append('permissions[]', 'Root');
    }
    formData.append('status', userForm.status);
    formData.append('_method',"PUT");
    return this.http.post(this.createUserUrl + "/" + user.id, formData)
  }

  getUserList(params = {}) {
    let url = this.getUsersUrl;
    if (this.localAuthService.currentCompany()) {
      url = this.getCompanyUsersUrl.replace(':id', this.localAuthService.currentCompany()['id']);
    }
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

  updateProfile(userForm) {
    let formData: FormData = new FormData();
    formData.append('name', userForm.name);
    formData.append('email', userForm.email);
    formData.append('mobile_no', userForm.mobileNo);
    formData.append('address', userForm.address);
    formData.append('_method',"PUT");
    return this.http.post(USER_PROFILE_URL, formData);
  }

  updatePassword(userForm) {
    let formData: FormData = new FormData();
    formData.append('current_password', userForm.currentPassword);
    formData.append('new_password', userForm.password);
    formData.append('new_password_confirmation', userForm.confirmPassword);
    formData.append('_method',"PUT");
    return this.http.post(CHANGE_PASSWORD, formData);
  }
}

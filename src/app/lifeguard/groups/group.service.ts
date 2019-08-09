import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';


import {
  API_DOMAIN,
  CREATE_GROUP,
  GET_GROUPS,
  DELETE_GROUP,
  SHOW_GROUP,
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class GroupService {

  createGroupUrl = API_DOMAIN + CREATE_GROUP;
  deleteGroupUrl = API_DOMAIN + DELETE_GROUP ;
  getGroupsUrl = API_DOMAIN + GET_GROUPS;
  showGroupUrl = API_DOMAIN + SHOW_GROUP;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }

  create(group) {
    let formData: FormData = new FormData();
    formData.append('name', group.name);
    formData.append('status', group.status);
    formData.append('company_id', group.companyId);
    if(group.users){
      group.users.forEach( (user) => {
        formData.append('users[]', user.id);
      });
    }
    return this.http.post(this.createGroupUrl, formData)
  }

  getGroups(params = {}) {
    let url = this.getGroupsUrl;
    console.log(this.localAuthService.currentCompany());
    if (this.localAuthService.currentCompany()) {
        url = this.getGroupsUrl + '?company_id=' + this.localAuthService.currentCompany()['id'];
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
    if(group_form.users){
      group_form.users.forEach( (user) => {
        formData.append('users[]', user.id);
      });
    }
    formData.append('_method',"PUT");
    return this.http.post(this.createGroupUrl + "/" + group.id, formData)
  }


  showGroup(id) {
    return this.http.get(this.showGroupUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(groupId){
    return this.http.delete(this.deleteGroupUrl+"/"+groupId).map(response => {
      this.response = response
      return this.response
    });
  }
}

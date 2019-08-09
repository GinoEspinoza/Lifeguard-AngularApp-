import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  CREATE_COMPANY,
  DELETE_COMPANY,
  GET_COMPANIES,
  SHOW_COMPANY,
  UPDATE_COMPANY
} from '../../api.constants';


@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  createCompanyUrl = API_DOMAIN + CREATE_COMPANY;
  deleteCompanyUrl = API_DOMAIN + DELETE_COMPANY;
  getCompanyUrl    = API_DOMAIN + GET_COMPANIES;
  showCompanyUrl   = API_DOMAIN + SHOW_COMPANY;
  updateCompanyUrl = API_DOMAIN + UPDATE_COMPANY;
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

  create(companyForm) {
    let formData: FormData = new FormData();

    formData.append('name', companyForm.name);
    formData.append('channel_name', companyForm.channelName.toLowerCase());
    formData.append('phone', companyForm.phone);
    formData.append('email', companyForm.email);
    formData.append('billing_address', companyForm.billing_address || '');
    formData.append('add_default', companyForm.addDefaults);
    return this.http.post(this.createCompanyUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getCompanies(params = {}) {
    return this.http.get(this.getCompanyUrl, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  showCompany(id) {
    return this.http.get(this.showCompanyUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  update(company, companyForm){

    let formData: FormData = new FormData();
    formData.append('name',companyForm.name);
    formData.append('channel_name',companyForm.channelName.toLowerCase());
    formData.append('phone', companyForm.phone);
    formData.append('email', companyForm.email);
    formData.append('billing_address', companyForm.billing_address || '');
    formData.append('_method',"PUT");
    return this.http.post(this.updateCompanyUrl+"/"+company.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(company){
    return this.http.delete(this.deleteCompanyUrl+"/"+company).map(response => {
      this.response = response
      return this.response
    });
  }

  getCompanyDevices(company){
    return this.http.get(this.getCompanyUrl+"/"+company.id+"/devices").map(response => {
      this.response = response
      return this.response
    });
  }

  getLockedCompanyDevices(company){
    return this.http.get(this.getCompanyUrl+"/"+company.id+"/devices/unlocked").map(response => {
      this.response = response
      return this.response
    });
  }

  getLockedCompanyHubs(company){
    return this.http.get(this.getCompanyUrl+"/"+company.id+"/devices/unlocked/Hub").map(response => {
      this.response = response
      return this.response
    });
  }

  getLockedCompanyCameras(company){
    return this.http.get(this.getCompanyUrl+"/"+company.id+"/devices/unlocked/Camera").map(response => {
      this.response = response
      return this.response
    });
  }


}

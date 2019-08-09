import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../../services';

import {
  API_DOMAIN,
  OFFICE_URL,
  GET_COMPANIES,
  COMPANY_OFFICES_URL,
} from '../../api.constants';


@Injectable({
  providedIn: 'root'
})
export class OfficeService {

  officeUrl = API_DOMAIN + OFFICE_URL;
  companyUrl = API_DOMAIN + GET_COMPANIES;
  getCompanyOfficesUrl = API_DOMAIN + COMPANY_OFFICES_URL;

  response:any;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }

  create(officeData) {
    let formData: FormData = new FormData();
    formData.append('name', officeData.name);
    formData.append('address', officeData.address);
    formData.append('company_id', officeData.companyId);

    return this.http.post(this.officeUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getOffices(params = {}) {
    let url = this.officeUrl;
    if (this.localAuthService.currentCompany()) {
      url = url + '?company_id=' + this.localAuthService.currentCompany()['id'];
    }
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  getOffice(id:any) {
    return this.http.get(this.officeUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }


  update( office:any , officeData:any ){
    let formData: FormData = new FormData();
    formData.append('name', officeData.name);
    formData.append('address', officeData.address);
    formData.append('company_id', officeData.companyId);
    formData.append('_method',"PUT");
    return this.http.post(this.officeUrl+"/"+office.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(officeId){
    return this.http.delete(this.officeUrl+"/"+officeId).map(response => {
      this.response = response
      return this.response
    });
  }
  getCompanyOffices(company){
    return this.http.get(this.companyUrl+"/"+company.id+"/offices").map(response => {
      this.response = response
      return this.response
    });
  }
  getSubUserCompanyOffices(company,sub_user_id){
    return this.http.get(this.companyUrl+"/"+company.id+"/"+sub_user_id+"/sub_user_offices").map(response => {
      this.response = response
      return this.response
    });
  }
  getZones(office){
    return this.http.get(this.officeUrl+"/"+office.id+"/zones").map(response => {
      this.response = response
      return this.response
    });
  }
  getSubUserZones(office,sub_user_id){
    return this.http.get(this.officeUrl+"/"+office.id+"/"+sub_user_id+"/sub_user_zones").map(response => {
      this.response = response
      return this.response
    });
  }
}

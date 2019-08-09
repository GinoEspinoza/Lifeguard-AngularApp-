import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, LocalAuthService } from '../../services';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  GET_COMPANIES,
  ASSIGN_DEVICE_URL,
  LIST_DEVICES_MAC
} from '../../api.constants';


@Injectable({
  providedIn: 'root'
})
export class AssignDeviceService {

  assignDeviceUrl = API_DOMAIN + ASSIGN_DEVICE_URL;
  companyUrl = API_DOMAIN + GET_COMPANIES;
  macUrl = API_DOMAIN + LIST_DEVICES_MAC;

  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }


  create(assignDeviceData) {

    let formData: FormData = new FormData();
    formData.append('company_id',assignDeviceData.companyId);
    formData.append('device_id',assignDeviceData.deviceId);
    formData.append('device_name', assignDeviceData.deviceName);
    return this.http.post(this.assignDeviceUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getAssignDevice(id:any) {

    return this.http.get(this.assignDeviceUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  update( assignDevice:any , assignDeviceData:any ){
    let formData: FormData = new FormData();
    formData.append('company_id',assignDeviceData.companyId);
    formData.append('device_id',assignDeviceData.deviceId);
    formData.append('device_name', assignDeviceData.deviceName);
    formData.append('_method',"PUT");
    return this.http.post(this.assignDeviceUrl+"/"+assignDevice.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }


  delete(officeId){
    return this.http.delete(this.assignDeviceUrl+"/"+officeId).map(response => {
      this.response = response
      return this.response
    });
  }

  getAssignDevices(params = {}) {
    let url = this.assignDeviceUrl;
    if (this.localAuthService.currentCompany()) {
      url = url + '?company_id=' + this.localAuthService.currentCompany()['id'];
    }
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  getMacs(params = {}) {
    return this.http.get(this.macUrl, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }
}

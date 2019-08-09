import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  DEVICE_URL
} from '../../api.constants';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  deviceUrl = API_DOMAIN + DEVICE_URL;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient
  ) { }

  create(deviceData) {
    let formData: FormData = new FormData();
    formData.append('vendor_id', deviceData.vendorId);
    formData.append('type', deviceData.deviceType);
    formData.append('model_name', deviceData.modelName);
    formData.append('series', deviceData.series);
    formData.append('mac', deviceData.mac);
    formData.append('vendor_serial_no', deviceData.vendorSerialNumber);
    formData.append('part_no', deviceData.partNumber);
    formData.append('series', deviceData.series);
    formData.append('status', deviceData.status);
    // formData.append('device_name', deviceData.deviceName);
    // if(deviceData.companyId !== null && deviceData.companyId !== undefined ){
    //   formData.append('company_id',deviceData.companyId);
    // }
    return this.http.post(this.deviceUrl, formData).map(response => {
      this.response = response
      return this.response
    });
  }

  getDevices(params = {}) {
    return this.http.get(this.deviceUrl, {params: params}).map(response => {
      this.response = response
      return this.response
    });
  }

  getDevice(id:any) {
    return this.http.get(this.deviceUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  update( device:any , deviceData:any ){
    let formData: FormData = new FormData();
    formData.append('vendor_id', deviceData.vendorId);
    formData.append('type', deviceData.deviceType);
    formData.append('model_name', deviceData.modelName);
    formData.append('series', deviceData.series);
    formData.append('mac', deviceData.mac);
    formData.append('vendor_serial_no', deviceData.vendorSerialNumber);
    formData.append('part_no', deviceData.partNumber);
    formData.append('status', deviceData.status);
    // formData.append('device_name', deviceData.deviceName);
    // if(deviceData.companyId !== null && deviceData.companyId !== undefined ){
    //   formData.append('company_id',deviceData.companyId);
    // }
    formData.append('_method',"PUT");
    return this.http.post(this.deviceUrl+"/"+device.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(deviceId){
    return this.http.delete(this.deviceUrl+"/"+deviceId).map(response => {
      this.response = response
      return this.response
    });
  }

}

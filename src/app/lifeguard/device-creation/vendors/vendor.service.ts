import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_DOMAIN,
  VENDOR_URL
} from '../../api.constants';


@Injectable({
  providedIn: 'root'
})
export class VendorService {

  vendorUrl = API_DOMAIN + VENDOR_URL;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient
  ) { }

  create(vendorData) {
    let formData: FormData = new FormData();
    formData.append('name', vendorData.name);
    formData.append('status', vendorData.status);
    return this.http.post(this.vendorUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getVendors(options: any = {}) {
    console.log(options)
    return this.http.get(this.vendorUrl, {params: options }).map(response => {
      this.response = response
      return this.response
    });
  }

  showVendor(id) {
    return this.http.get(this.vendorUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  update(vendor, vendorData){
    let formData: FormData = new FormData();
    formData.append('name', vendorData.name);
    formData.append('status', vendorData.status);
    formData.append('_method',"PUT");
    return this.http.post(this.vendorUrl +"/"+ vendor.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(vendor){
    return this.http.delete(this.vendorUrl+"/"+vendor).map(response => {
      this.response = response
      return this.response
    });
  }

}

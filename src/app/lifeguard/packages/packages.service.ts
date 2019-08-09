import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services';


import {
  API_DOMAIN,
  CREATE_PACKAGES,
  GET_PACKAGES,
  DELETE_PACKAGES,
  SHOW_PACKAGES,
  GET_LICENSE_PRICE,
  UPDATE_LICENSE_PRICE,
  GET_SUBSCRIPTION_PACKAGES
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class PackagesService {

  createPackageUrl = API_DOMAIN + CREATE_PACKAGES;
  deletePackageUrl = API_DOMAIN + DELETE_PACKAGES ;
  getPackagesUrl = API_DOMAIN + GET_PACKAGES;
  showPackageUrl = API_DOMAIN + SHOW_PACKAGES;
  getLicenseUrl = API_DOMAIN + GET_LICENSE_PRICE;
  getSubscriptionPackageUrl = API_DOMAIN + GET_SUBSCRIPTION_PACKAGES;
  updateLicenseUrl = API_DOMAIN + UPDATE_LICENSE_PRICE;
  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) { }

  create(package_,type) {
    let formData: FormData = new FormData();
    formData.append('type', type);
    formData.append('name', package_.name);
    formData.append('offices', package_.offices);
    formData.append('locks', package_.locks);
    formData.append('cameras', package_.cameras);
    formData.append('sub_users', package_.sub_users);
    formData.append('price', package_.price);
    formData.append('status', package_.status);
    return this.http.post(this.createPackageUrl, formData)
  }

  getPackages(params = {}) {
    let url = this.getPackagesUrl;
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  update(package_ , package_form , type) {
    let formData: FormData = new FormData();
    formData.append('type', type);
    formData.append('name', package_form.name);
    formData.append('offices', package_form.offices);
    formData.append('locks', package_form.locks);
    formData.append('cameras', package_form.cameras);
    formData.append('price', package_form.price);
    formData.append('sub_users', package_form.sub_users);
    formData.append('status', package_form.status);
    formData.append('_method',"PUT");
    return this.http.post(this.createPackageUrl + "/" + package_.id, formData)
  }


  showPackage(id) {
    return this.http.get(this.showPackageUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(packageId){
    return this.http.delete(this.deletePackageUrl+"/"+packageId).map(response => {
      this.response = response
      return this.response
    });
  }
  getLicensePrices(type) {
    return this.http.get(this.getLicenseUrl+"/"+type).map(response => {
      this.response = response
      return this.response
    });
  }
  getPackageForSubscription(type) {
    return this.http.get(this.getSubscriptionPackageUrl+"/"+type).map(response => {
      this.response = response
      return this.response
    });
  }
  updateLicensePrices(license_form,type) {
    let formData: FormData = new FormData();
    formData.append('type', type);
    formData.append('office', license_form.office);
    formData.append('lock', license_form.lock);
    formData.append('camera', license_form.camera);
    formData.append('sub_user', license_form.sub_user);
    return this.http.post(this.updateLicenseUrl, formData)
  }
}

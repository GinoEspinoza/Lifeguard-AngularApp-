import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../../services';
import {
  API_DOMAIN,
  OFFICE_URL,
  GET_COMPANIES,
  ZONE_URL,
  ZONE_LOCKS
} from '../../api.constants';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  zoneUrl = API_DOMAIN + ZONE_URL;
  zoneDevicesHavingLocksUrl = API_DOMAIN + ZONE_LOCKS;

  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
    private localAuthService: LocalAuthService,
  ) {}

  getZones(params) {
    let url = this.zoneUrl;
    if (this.localAuthService.currentCompany()) {
      url = this.zoneUrl + '?company_id=' + this.localAuthService.currentCompany()['id'];
    }
    return this.http.get(url, { params: params }).map(response => {
      this.response = response
      return this.response
    });
  }

  create(zoneData, company, office) {
    let formData: FormData = new FormData();
    formData.append('company_id', company.id);
    formData.append('office_id', office.id);
    formData.append('name', zoneData.name);

    return this.http.post(this.zoneUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  showZone(id){
    return this.http.get(this.zoneUrl+"/"+id).map(response => {
      this.response = response
      return this.response
    });
  }

  update(zone, zoneData){

    let formData: FormData = new FormData();
    formData.append('company_id',zoneData.companyId)
    formData.append('office_id', zoneData.officeId)
    formData.append('name', zoneData.name);
    formData.append('_method',"PUT");
    return this.http.post(this.zoneUrl+"/"+zone.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(zone){
    return this.http.delete(this.zoneUrl+"/"+zone).map(response => {
      this.response = response
      return this.response
    });
  }
  getCompanyDevices(zone){
    return this.http.get(this.zoneDevicesHavingLocksUrl+zone.id).map(response => {
      this.response = response
      return this.response
    });
  }
}

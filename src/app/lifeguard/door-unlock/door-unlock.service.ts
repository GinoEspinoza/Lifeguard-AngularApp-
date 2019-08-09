import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { 
  API_DOMAIN,
  COMPANIES_HAVING_LOCKS,
  COMPANY_OFFICES_HAVING_LOCKS,
  OFFICE_ZONES_HAVING_LOCKS,
  ZONE_DEVICES_HAVING_LOCKS
} from './../api.constants';


@Injectable({
  providedIn: 'root'
})
export class DoorUnlockService {

  companiesHavingLockesUrl = API_DOMAIN + COMPANIES_HAVING_LOCKS;
  companyOfficesHavingLocksUrl = API_DOMAIN + COMPANY_OFFICES_HAVING_LOCKS;
  officeZonesHavingLocksUrl = API_DOMAIN + OFFICE_ZONES_HAVING_LOCKS;
  zoneDevicesHavingLocksUrl = API_DOMAIN + ZONE_DEVICES_HAVING_LOCKS;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  getCompaniesHavingLockes(){
    return this.http.get(this.companiesHavingLockesUrl).map(response => {
      return response
    });
  }

  getCompanyOfficesHavingLocks(company:any){
    return this.http.get(this.companyOfficesHavingLocksUrl + company.id).map(response => {
      return response
    });
  }

  getOfficeZonesHavingLocks(office:any){
    return this.http.get(this.officeZonesHavingLocksUrl + office.id).map(response => {
      return response
    });
  }

  getZoneDevicesHavingLocks(zone:any){
    return this.http.get(this.zoneDevicesHavingLocksUrl + zone.id).map(response => {
      return response
    });
  }

}




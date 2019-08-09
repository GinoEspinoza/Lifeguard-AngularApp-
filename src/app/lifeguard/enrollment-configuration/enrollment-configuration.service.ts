import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_DOMAIN,
  USER_URL,
  ENROLL_DEVICE_USER_URL,
} from '../api.constants';

@Injectable({
  providedIn: 'root'
})

export class EnrollmentConfigurationService {
  UserUrl = API_DOMAIN + USER_URL;
  enrollDeviceUserUrl = API_DOMAIN + ENROLL_DEVICE_USER_URL;

  response:any;

  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient,
  ) { }

  create(enrollmentData) {
    let formData: FormData = new FormData();
    formData.append('company_id', enrollmentData.companyId)
    formData.append('device_user_id', enrollmentData.deviceUserId)
    formData.append('locks_enroll', enrollmentData.locksEnroll)
    formData.append('enroll_mode', enrollmentData.enrollMode)
    if (enrollmentData.smartcardNumber != null || enrollmentData.smartcardNumber != undefined) {
      formData.append('smart_card_number', enrollmentData.smartcardNumber)
    }
    if (enrollmentData.enrollFingerCount != null || enrollmentData.enrollFingerCount != undefined) {
      formData.append('enroll_finger_count', enrollmentData.enrollFingerCount)
    }
    formData.append('_method',"PUT");
    return this.http.post(this.enrollDeviceUserUrl, formData)
    .map(response => {
     this.response = response
     return this.response
    });
  }

  getDeviceUsers() {
    return this.http.get(this.UserUrl).map(response => {
      this.response = response
      return this.response
    });
  }

  update(enrollmentDataId:any , enrollmentData:any ){
    let formData: FormData = new FormData();
    if (enrollmentData.enrollFingerCount != null || enrollmentData.enrollFingerCount != undefined) {
      formData.append('enroll_finger_count', enrollmentData.enrollFingerCount)
    }
    formData.append('user_name', enrollmentData.userName);
    formData.append('_method',"PUT");
    return this.http.post(this.UserUrl+"/"+enrollmentDataId.id, formData ).map(response => {
      this.response = response
      return this.response
    });
  }

  delete(enrolledId){
    return this.http.delete(this.UserUrl+"/"+enrolledId).map(response => {
      this.response = response
      return this.response
    });
  }

}

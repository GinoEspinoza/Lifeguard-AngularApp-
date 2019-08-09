import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './../alert.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import * as _ from "lodash";

import {
  API_DOMAIN,
  USER_LOGOUT,
  USER_LOGIN,
  USER_REGISTER,
  REGISTER_COMPANY,
} from './../../api.constants';


@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private announceLoggedIn = new Subject<any>();

  loggedIn$ = this.announceLoggedIn.asObservable();

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  loginResourceURL =  API_DOMAIN + USER_LOGIN;
  logoutResourceURL = API_DOMAIN + USER_LOGOUT;
  registerUrl = API_DOMAIN + USER_REGISTER;
  companyUrl = API_DOMAIN + REGISTER_COMPANY;
  response:any;
  constructor(
    private router: Router,
    private alertService : AlertService,
    private http: HttpClient
  ) { }


  login(username: string, password: string, offset : string) {

    let formData: FormData = new FormData();
    formData.append('password',password);
    formData.append('email',username);
    formData.append('offset',offset);
    return this.http.post(this.loginResourceURL, formData)
    .map(res => {
        if(res['success']){
          this.setCurrentUser(res['data']);
          this.setToken(res['data']);
          this.announceLoggedIn.next(res['data']);
          if (res['data']['roles'][0].name == 'Company User' || res['data']['roles'][0].name == 'Sub User') {
            this.setCurrentCompany(res['data']['company'])
          }
        }else{
          this.setUserId(res['user_id']);
        }
        return res
    });
  }

  logout(){
    return this.http.post(this.logoutResourceURL, this.httpOptions )
    .map(res => {
      this.clearToken();
      this.announceLoggedIn.next(null);
      setTimeout( ()=> {
        this.alertService.alert('Logged out Successfully.')
      }, 300)
      return res
    });
  }

  currentUser(){
    let currentUser:any = localStorage.getItem('currentUser')
    if(currentUser !== undefined && currentUser !== null){
      currentUser = JSON.parse(currentUser);
    }
    return currentUser;
  }

  setCurrentUser(user){
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  isAdmin() {
    let roles = this.currentUser().roles.map( (role:any) => role.name);
    return _.intersection(roles, ['Super Admin', 'System Admin']).length > 0;
  }

  setCurrentCompany(company:any) {
    localStorage.setItem('currentCompany', JSON.stringify(company))
  }

  currentCompany(){
    let currentCompany:any = localStorage.getItem('currentCompany')
    if(currentCompany !== undefined && currentCompany !== null){
      currentCompany = JSON.parse(currentCompany);
    }
    return currentCompany;
  }

  setToken(user){
    localStorage.setItem('token', JSON.stringify(user.token));
  }
  setUserId(user_id){
    localStorage.setItem('user_id', JSON.stringify(user_id));
  }
  getToken(){
    try{
      return JSON.parse(localStorage.getItem('token'));
    } catch {
      this.clearToken();
    }
  }

  clearToken(){
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.clear();
  }
  register(registerForm){
    let formData: FormData = new FormData();

    formData.append('name', registerForm.name);
    formData.append('mobile_no', registerForm.mobileNo);
    formData.append('email', registerForm.email);
    formData.append('address', registerForm.address);
    formData.append('new_company', registerForm.new_company);
    formData.append('password', registerForm.password);
    formData.append('password_confirmation', registerForm.password);
    formData.append('status', '0');
    if(registerForm.new_company == 1){
      formData.append('channel_name', registerForm.channelName.toLowerCase());
      formData.append('company_id', "0");
      formData.append('company_name', registerForm.company_name);
      formData.append('company_phone', registerForm.company_phone);
      formData.append('company_email', registerForm.company_email);
      formData.append('billing_address', registerForm.billing_address || '');
    }else if(registerForm.new_company == 0){
      formData.append('company_id', registerForm.company[0].id);
    }
    
    return this.http.post(this.registerUrl, formData)
    .map(response => {
      this.response = response
      this.setUserId(response['user_id']);
      return this.response
    });
  }
  registerCompanies(){
    return this.http.get(this.companyUrl).map(response => {
      this.response = response
      return this.response
    });
  }
}

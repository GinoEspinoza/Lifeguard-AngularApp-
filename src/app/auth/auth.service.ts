import { Injectable } from '@angular/core';
import { FORGOT_PASSWORD, VERIFY_PASSWORD_TOKEN, RESET_PASSWORD_TOKEN } from '../lifeguard/api.constants';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  forgotPassword(form) {
    let formData: FormData = new FormData();
    formData.append('email', form.email);
    return this.http.post(FORGOT_PASSWORD, formData)
    .map(res => {
      return res
    });
  }

  verifyToken(token: string) {
    let formData: FormData = new FormData();
    formData.append('token', token);
    return this.http.post(VERIFY_PASSWORD_TOKEN, formData)
    .map(res => {
      return res
    });
  }

  resetPassword(form) {
    let formData: FormData = new FormData();
    formData.append('email', form.email);
    formData.append('token', form.token);
    formData.append('password', form.password);
    formData.append('password_confirmation', form.passwordConfirmation);
    return this.http.post(RESET_PASSWORD_TOKEN, formData)
    .map(res => {
      return res
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service'
import { AlertService } from '../../lifeguard/services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('',  Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
    });
  }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.authService.forgotPassword(formData)
    .subscribe(
      response => {
        this.alertService.success(response['message'])
      },
      data => {
        this.alertService.error(data['error']['message'])
      }
    )
  }

}

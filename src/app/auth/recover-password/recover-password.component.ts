import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service'
import { AlertService } from '../../lifeguard/services';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isTokenValid: boolean = false;
  email: string;
  token:string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.resetPasswordForm = new FormGroup({
      email: new FormControl(this.email),
      password: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[^\s]{8,}$/)])),
      passwordConfirmation: new FormControl(''),
    });
    this.authService.verifyToken(this.token).subscribe(
      response => {
        this.isTokenValid = true;
        this.email = response['email'];
        this.resetPasswordForm.patchValue({
          email: response['email']
        })
      },
      data => {
        this.isTokenValid = false;
        this.alertService.error(data['error']['message']);
      }
    )
  }

  get f() { return this.resetPasswordForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    formData.token = this.token;
    this.authService.resetPassword(formData)
    .subscribe(
      response => {
        setTimeout( ()=> {
          this.alertService.success(response['message'])
        }, 300)
        this.router.navigate(['lifeguard/login', {reset_password: 'success'}]);
      },
      data => {
        this.alertService.error(data['error']['message'])
      }
    )
  }

}

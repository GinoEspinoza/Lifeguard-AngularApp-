import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { UserService } from '../user.service';
import { AlertService, LocalAuthService } from '../../services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-password-update',
  templateUrl: './password-update.component.html'
})
export class PasswordUpdateComponent implements OnInit {
  userForm: FormGroup;
  submitted:boolean = false;

  constructor(
    private userService: UserService,
    private alertService:AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: LocalAuthService,
  ) { }

  ngOnInit() {
    this.userForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      password: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[^\s]{8,}$/)])),
      confirmPassword: new FormControl(''),
    });
  }

  get f() { return this.userForm.controls; }

  onSubmit(formData){
    this.submitted = true;
    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }
    this.userService.updatePassword(formData)
    .subscribe(
      response => {
        this.alertService.success(response['message']);
        this.authService.setToken({token: response['data']['token']});
        this.router.navigate(['/lifeguard/home']);
      },
      error => {
        this.alertService.error(error['error']['message']);
    });
  }
}

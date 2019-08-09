import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { UserService } from '../user.service';
import { AlertService, LocalAuthService } from '../../services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userForm: FormGroup;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  mobileNoPattern = /^\+[1-9]{1}[0-9]{7,11}$/;
  user:any;

  constructor(
    private userService: UserService,
    private alertService:AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: LocalAuthService,
  ) { }

  ngOnInit() {
    let userId = this.authService.currentUser()['id'];
    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('',  Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      mobileNo: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.mobileNoPattern)])),
      address: new FormControl('')
    });
    this.userService.showUser(userId).subscribe(
      response=> {
        this.user = response['data'];
        this.setUserForm(this.user);
      },
      error=> {}
    );
  }

  setUserForm(user) {
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      mobileNo: user.mobile_no,
      address: user.address
    });
  }

  get f() { return this.userForm.controls; }

  onSubmit(formData){
    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }
    this.userService.updateProfile(formData)
    .subscribe(
      response => {
        this.alertService.success(response['message']);
        formData.mobile_no = formData.mobileNo;
        this.user = {...this.user, ...formData};
        this.authService.setCurrentUser(this.user);
        // this.router.navigate(['/lifeguard/profile/edit']);
      },
      error => {
        this.alertService.error(error['error']['message']);
    });
  }
}

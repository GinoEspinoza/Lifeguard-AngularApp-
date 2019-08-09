import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../services';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable()
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private localAuthService: LocalAuthService,
    private alertService: AlertService,
    private cdRef:ChangeDetectorRef,
    private injector: Injector
  ) {}

  ngOnInit() {
    if(localStorage.getItem('currentUser')){
      this.router.navigate(['/lifeguard/home']);
    }
    this.loginForm = new FormGroup({
      password: new FormControl('', Validators.required),
      username: new FormControl('',  Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log("return url",this.returnUrl);
  }

  ngAfterViewInit() {
    if (this.route.snapshot.params['reset_password'] == 'success') {
      this.alertService.success('Your password has been reset successfully. Please login to continue.')
    }
    if (this.route.snapshot.queryParams['session'] == 'expired') {
      console.log('session exp')
      this.alertService.error('Your session has expired. Login to continue.')
    }
    this.cdRef.detectChanges();
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    var offset = new Date().getTimezoneOffset();
    offset = 0 - offset/60;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }

    this.localAuthService.login(this.f.username.value, this.f.password.value , offset.toString())
    .subscribe(
      data => {
        const routerService = this.injector.get(Router);
        const ngZone = this.injector.get(NgZone);
        if(data['success']){
          setTimeout( ()=> {
            this.alertService.success('Signed In Successfully.')
          }, 300)
          ngZone.run(() => {
            routerService.navigate(['/'], { skipLocationChange: true });
          });
        }else{
          if(data['status'] == 1){
            setTimeout( ()=> {
              this.alertService.success('You should subscribe to log in.')
            }, 300)
            ngZone.run(() => {
              routerService.navigate(['/lifeguard/subscription'], { skipLocationChange: true });
            });
          }else{
            this.alertService.error(data['message']);
          }
        }
      },
      error => {
        this.loginForm.patchValue({password: ''});
        this.alertService.error(error.error.message);
      }
    );

  }
}

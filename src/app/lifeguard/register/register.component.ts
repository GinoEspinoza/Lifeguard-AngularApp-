import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../services';
import { FormControl } from '@angular/forms';
import { COMPANY_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { CompanyService } from '../device-creation/companies';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  returnUrl: string;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  mobileNoPattern = /^\+[1-9]{1}[0-9]{7,11}$/;
  companyDropdownSettings = {};
  companyDropdownList = [];
  selectedCompany:any;
  phoneRef: any;
  companyPhoneRef: any;
  phoneValid = true;
  companyPhoneValid = true;
  fullPhoneNumber = '';
  companyPhoneNumber = '';
  newCompany = true;
  existingCompany=false;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private localAuthService: LocalAuthService,
    private alertService: AlertService,
    private cdRef:ChangeDetectorRef,
    private spinnerService: Ng4LoadingSpinnerService
    
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.getCompanies();
  }

  ngOnInit() {
    if(localStorage.getItem('currentUser')){
      this.router.navigate(['/lifeguard/home']);
    }
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('',  Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      mobileNo: new FormControl('', Validators.required),
      address: new FormControl('',Validators.required),
      company: new FormControl('',Validators.required),
    });
    let passwordField = {
      password: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[^\s]{8,}$/)])),
      passwordConfirmation: new FormControl('', Validators.required),
    }
    // get return url from route parameters or default to '/'
    this.registerForm.addControl('password', passwordField['password'])
    this.registerForm.addControl('passwordConfirmation', passwordField['passwordConfirmation'])
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/lifeguard/subscription';
    this.onNewCompanyOption();
  }
  getCompanies(){
    this.localAuthService.registerCompanies().subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }
  onSucessGetCompanies(response:any){
    this.companyDropdownList = response.data
  }

  OnErrorGetCompanies(error){}
  onPhoneInvalid(state) {
    this.phoneValid = state;
  }
  onCompanyPhoneInvalid(state) {
    this.companyPhoneValid = state;
  }

  numberChange(number) {
    number.srcElement.blur();
    number.srcElement.focus();
  }
  companyNumberChange(number) {
    number.srcElement.blur();
    number.srcElement.focus();
  }

  telInputObject(obj) {
    this.phoneRef = obj;
  }
  companyTelInputObject(obj) {
    this.companyPhoneRef = obj;
  }

  getNumber(number) {
    this.fullPhoneNumber = number;
  }
  getCompanyNumber(number) {
    this.companyPhoneNumber = number;
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }
    this.spinnerService.show();
    let formData = this.registerForm.value;
    formData.mobileNo = this.fullPhoneNumber;
    formData.company_phone = this.companyPhoneNumber;
    if(this.newCompany)formData["new_company"] = 1;
    if(this.existingCompany)formData["new_company"] = 0;
    console.log(formData);
    this.localAuthService.register(formData)
    .subscribe(
      data => {
        this.alertService.success("Sign up successfully.Please subscribe to log in.");
        this.router.navigate([this.returnUrl]);
        this.spinnerService.hide();
      },
      error => {
        this.registerForm.patchValue({password: ''});
        this.alertService.error(error.error.message);
        this.spinnerService.hide();
      }
    );
  }
  onItemSelect(item:any){
  }

  OnItemDeSelect(item:any){
  }
  onNewCompanyOption(){
    this.newCompany = true;
    this.existingCompany = false;
    this.registerForm.removeControl("company");
    this.registerForm.addControl("company_name",new FormControl("",Validators.required));
    this.registerForm.addControl("channelName",new FormControl("",Validators.required));
    this.registerForm.addControl("company_phone",new FormControl("",Validators.required));
    this.registerForm.addControl("company_email",new FormControl("",Validators.required));
    this.registerForm.addControl("billing_address",new FormControl("",Validators.required));
  }
  onExistingCompanyOption(){
    this.newCompany = false;
    this.existingCompany = true;
    this.registerForm.addControl("company",new FormControl("",Validators.required));
    this.registerForm.removeControl("company_name");
    this.registerForm.removeControl("channelName");
    this.registerForm.removeControl("company_phone");
    this.registerForm.removeControl("company_email");
    this.registerForm.removeControl("billing_address");
  }
}

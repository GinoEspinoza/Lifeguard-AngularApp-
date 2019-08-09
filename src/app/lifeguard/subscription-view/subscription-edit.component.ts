import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../services';
import { PackagesService } from './../packages';
import { SubscriptionService } from '../subscription/subscription.service';
import { FormControl } from '@angular/forms';
import { CompanyService } from '../device-creation/companies';
import { PACKAGE_DROPDOWN_SETINGS , COMPANY_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { forte_api_login_id } from './../constants/payment.constants';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {
  IPayPalConfig,
  ICreateOrderRequest 
} from 'ngx-paypal';
declare const paypal: any;
declare const forte: any;
@Component({
  selector: 'app-subscription-edit',
  templateUrl: 'subscription-edit.component.html',
  styleUrls: ['./subscription-edit.component.css']
})
export class SubscriptionEditComponent implements OnInit {
  subscribeForm: FormGroup;
  creditForm: FormGroup;
  returnUrl: string;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  mobileNoPattern = /^\+[1-9]{1}[0-9]{7,11}$/;
  user_id : any;
  typeModel = 1;
  selectedType = 1;
  typeList : any;
  licensePrices : any;
  packages:any;
  packagesDropdownSettings = {};
  forte_api_id : any;
  packageDropdownList = [];
  selectedPackage:any;
  activePackage = null;
  totalPrice = 0;
  is_paypal = false;
  is_credit = false;
  can_checkout = false;
  plan_id:any;
  paypalSubscriptionObject:any;
  routerService:any;
  ngZone:any;
  credit_error = "";
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private localAuthService: LocalAuthService,
    private packagesService: PackagesService,
    private subscriptionService: SubscriptionService,
    private alertService: AlertService,
    private cdRef:ChangeDetectorRef,
    private spinnerService: Ng4LoadingSpinnerService,
    private injector: Injector
  ) {
    this.packagesDropdownSettings = PACKAGE_DROPDOWN_SETINGS;
    this.forte_api_id = forte_api_login_id;
  }
  public payPalConfig?: IPayPalConfig;
  ngOnInit() {
    this.routerService = this.injector.get(Router);
    this.ngZone = this.injector.get(NgZone);

    this.typeList = [
			{id:1 , name : 'Monthly'},
			{id:2 , name : 'Yearly'},
    ]
  
    this.subscribeForm = new FormGroup({
      package: new FormControl(''),
      office: new FormControl(0, Validators.required),
      lock: new FormControl(0),
      camera: new FormControl(0),
      sub_user: new FormControl(0),
    });
    this.creditForm = new FormGroup({
      card_name: new FormControl('',Validators.required),
      card_number: new FormControl('',Validators.required),
      expire_month: new FormControl('', Validators.required),
      expire_year: new FormControl('', Validators.required),
      cvv: new FormControl('', Validators.required),
    });
    this.user_id = this.localAuthService.currentUser()['id'];
    // get return url from route parameters or default to '/'

    this.getLicensePrices(this.typeModel);
    this.getPackages(this.typeModel);
    this.subscribeForm.valueChanges.subscribe(
      result=>this.can_checkout = false
    );
    this.creditForm.valueChanges.subscribe(
      result=>this.credit_error = ""
    );
    this.paypalSubscriptionObject = {
      'plan_id': this.plan_id,
      "auto_renewal": true,
      "application_context": {
        "user_action": "SUBSCRIBE_NOW",
        "payment_method": {
          "payer_selected": "PAYPAL",
          "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
        },
      }
    }
    this.initPaypalConfig(this.paypalSubscriptionObject);
  }
  private initPaypalConfig(paypalSubscriptionObject): void {
    const self = this;
    paypal.Buttons({
      createSubscription: function (data, actions){
        var d = new Date();
        var n = d.toISOString();
        console.log(n);
        return actions.subscription.create(paypalSubscriptionObject);
      },
      onApprove: function(data, actions) {
        console.log("subscription_data",data);
        console.log("subscription_action",actions);
        self.onSuccessSubscription(data.subscriptionID , "paypal");
      },
      onCancel:function(data,ations){
        console.log(data);
      }
    }).render('#paypal-button-container');
    
  }
  OnError(error){
    this.alertService.error(error["message"])
  }
  onSuccessSubscription(subscription_id , mode){
    this.spinnerService.show();
    var formData = this.subscribeForm.value;
    formData["type"] = this.selectedType;
    formData["package_id"] = this.activePackage ? this.activePackage.id : 0;
    formData["plan_id"] = this.plan_id;
    formData["subscription_id"] = subscription_id;
    formData["mode"] = mode;
    formData["user_id"] = this.user_id;

    this.subscriptionService.addSubscription(formData).subscribe(
      response => {
        this.spinnerService.hide();
        this.alertService.success("You have changed subscription successfully.");
        this.ngZone.run(() => {
          this.routerService.navigate(['/lifeguard/subscription-view'], { skipLocationChange: true });
        });
      },
      error => { 
        this.OnError(error); 
        this.spinnerService.hide();
      }
    );
  }
  numberChange(number) {
    number.srcElement.blur();
    number.srcElement.focus();
  }
  companyNumberChange(number) {
    number.srcElement.blur();
    number.srcElement.focus();
  }

  // convenience getter for easy access to form fields
  get f() { return this.subscribeForm.controls; }

  onSubmit() {
    // stop here if form is invalid

  }
  onItemSelect(item:any){
    console.log(item);
    this.subscribeForm.patchValue({
      office:item.offices,
      lock:item.locks,
      camera:item.cameras,
      sub_user:item.sub_users,
    })
    this.totalPrice = item.price;
    this.activePackage = item;
  }

  OnItemDeSelect(item:any){
    this.activePackage = null;
    this.refreshForm();
  }
  onItemSelectType(type) {
    this.selectedType = type.id
    this.typeModel = type.id
    this.getLicensePrices(this.typeModel);
    this.getPackages(this.typeModel);
    this.refreshForm();
  }
  refreshForm(){
    this.activePackage = null;
    this.subscribeForm.patchValue({
      office:0,
      lock:0,
      camera:0,
      sub_user:0,
    })
    this.totalPrice = 0;
  }
  getLicensePrices(type){
    this.packagesService.getLicensePrices(type).subscribe(
      response => {
        this.licensePrices = response['data'];
        console.log("Prices are" , this.licensePrices);
      },
      error => { this.OnError(error); }
    );
  }
  getPackages(type){
    this.selectedPackage = []
    this.packagesService.getPackageForSubscription(type).subscribe(
      response => {
        this.packageDropdownList = response['data'];
        console.log("Packages are" , this.packageDropdownList);
      },
      error => { this.OnError(error); }
    );
  }
  updateTotalPrice(){
    var formData = this.subscribeForm.value;
    this.totalPrice = formData.office * this.licensePrices.office + formData.lock * this.licensePrices.lock + formData.camera * this.licensePrices.camera + formData.sub_user * this.licensePrices.sub_user;
  }
  showHidePane(type){
    if(type == 'paypal'){
      this.is_paypal = !this.is_paypal;
      if(this.is_paypal)this.is_credit=false;
    }
    if(type == 'credit'){
      this.is_credit = !this.is_credit;
      if(this.is_credit)this.is_paypal=false;
    }
    if(this.is_paypal && !this.isInvalidSubscribe()){
    }
  }
  isInvalidSubscribe(){
    if(this.totalPrice == 0)return true;
    return false;
  }
  proceedPayment(){
    this.spinnerService.show();
    var subscription = {
      type:this.selectedType == 1 ? "MONTH" : "YEAR",
      name:this.user_id+"-Plan",
      price:this.totalPrice
    }
    this.subscriptionService.addPaypalPlan(subscription).subscribe(
      response => {
        this.onSuccessAddPlan(response["plan"]['id']);
        this.spinnerService.hide();
      },
      error => { 
        this.OnError(error); 
        this.spinnerService.hide();
      }
    );
  }
  onSuccessAddPlan(plan_id){
    this.plan_id = plan_id;
    this.can_checkout = true;
    this.paypalSubscriptionObject.plan_id = plan_id;
  }
  isInvalidCredit(){
    if(this.creditForm.invalid)
      return true;
    return false;
  }
  creditSubscribe(){
    this.credit_error = "";
    this.spinnerService.show();
    var formData = this.creditForm.value;
    var data = {
      api_login_id: this.forte_api_id,
      card_number: formData.card_number,
      expire_year: formData.expire_year, 
      expire_month: formData.expire_month,
      cvv: formData.cvv,
    }           
    const self = this;
    forte.createToken(data)
      .success(function(response){
        self.onTokenCreated(self , response);
      })
      .error(function(response){
        self.onTokenFailed(self , response);
      });
  }
  onTokenCreated(self , response){
    console.log(response);
    self.credit_error = "";
    var sub_data = self.subscribeForm.value;
    var formData = self.creditForm.value;
    formData["type"] = self.selectedType == 1 ? 'monthly' : 'yearly';
    formData["user_id"] = self.user_id;
    formData["amount"] = self.totalPrice;
    formData["card_type"] = response['card_type'];
    formData["type"] = this.selectedType;
    formData["package_id"] = this.activePackage ? this.activePackage.id : 0;
    formData["mode"] = 'credit';
    formData["office"] = sub_data.office;
    formData["lock"] = sub_data.lock;
    formData["camera"] = sub_data.camera;
    formData["sub_user"] = sub_data.sub_user;

    self.subscriptionService.addSchedule(formData).subscribe(
      response => {
        self.spinnerService.hide();
        self.alertService.success("You have changed subscription successfully.");
        self.ngZone.run(() => {
          self.routerService.navigate(['/lifeguard/subscription-view'], { skipLocationChange: true });
        });
      },
      error => { 
        self.OnError(error); 
        self.spinnerService.hide();
      }
    );
  }
  onTokenFailed(self , response){
    console.log(response);
    self.credit_error = response.response_description;
    self.spinnerService.hide();
  }
}

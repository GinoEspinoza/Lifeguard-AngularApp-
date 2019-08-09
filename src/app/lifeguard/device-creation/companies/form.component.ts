import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from './../../services';
import { CompanyService } from './company.service';

@Component({
  selector: 'app-company-form',
  templateUrl: './form.component.html',
  styleUrls: []
})
export class CompanyFormComponent implements OnInit {

  companyForm: FormGroup;
  returnUrl: string;
  companyId:any;
  channelPattern = /[a-zA-Z]+$/gm;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  phoneRef: any;
  phoneValid = true;
  fullPhoneNumber = '';

  @Input() company:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.companyForm = this.formBuilder.group({
      name: ['', Validators.required],
      channelName: ['', Validators.compose([Validators.required, Validators.pattern(this.channelPattern)])],
      phone: ['', [Validators.required]],
      email: ['', Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])],
      billing_address: [''],
      addDefaults: [false]
    });
    if (id !== null && id !== undefined){
      this.companyId = id;
      this.getCompany(id)
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.companyForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.companyForm.invalid) {
      return;
    }
    if (this.company == undefined){
      let formData = this.companyForm.value;
      formData.phone = this.fullPhoneNumber;
      this.companyService.create(formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response.message);
        this.router.navigate(['lifeguard/companies/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    } else {
      let formData = this.companyForm.value;
      formData.phone = this.fullPhoneNumber;
      this.companyService.update( this.company, formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.router.navigate(['lifeguard/companies/'+ id ]);
        this.alertService.success(response.message);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    }
  }

  getCompany(id){
    this.companyService.showCompany(id).subscribe(response => {
      this.onSuccessGetCompany(response); },
      error => { this.OnErrorGetCompany(error); }
    );
  }

  onSuccessGetCompany(response){
    this.company = response.data
    this.populatedFormValues(this.company)
  }

  OnErrorGetCompany(error){
    console.log(error);
  }

  onPhoneInvalid(state) {
    this.phoneValid = state;
  }

  numberChange(number) {
    number.srcElement.blur();
    number.srcElement.focus();
  }

  telInputObject(obj) {
    this.phoneRef = obj;
  }

  getNumber(number) {
    this.fullPhoneNumber = number;
  }

  populatedFormValues(company) {
    this.companyForm.patchValue({
      name: company.name,
      channelName: company.channel_name,
      phone: company.phone,
      email: company.email,
      billing_address: company.billing_address,
    })
    if (company.phone) {
      this.phoneRef.intlTelInput('setNumber', company.phone);
      this.fullPhoneNumber = company.phone;
    }
  }

}

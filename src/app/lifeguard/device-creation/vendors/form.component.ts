import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from './../../services';
import { VendorService } from './vendor.service';


@Component({
  selector: 'app-vendor-form',
  templateUrl: './form.component.html',
  styleUrls: []
})
export class VendorFormComponent implements OnInit {

  vendorForm: FormGroup;
  returnUrl: string;
  vendorId:any;
  zoneId:any;

  @Input() vendor:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.vendorForm = this.formBuilder.group({
      name: ['', Validators.required],
      status: [true]
    });
    if (id !== null && id !== undefined){
      this.vendorId = id;
      this.getVendor(id)
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.vendorForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.vendorForm.invalid) {
      return;
    }
    let formData = this.vendorForm.value;
    formData.status = formData.status ? '1' : '0';
    if (this.vendor == undefined){
      this.vendorService.create(formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/vendors/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    } else {
      this.vendorService.update(this.vendor, formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/vendors/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    }
  }

  getVendor(id){
    this.vendorService.showVendor(id).subscribe(response => {
      this.onSuccessGetVendor(response); },
      error => { this.OnErrorGetVendor(error); }
    );
  }

  onSuccessGetVendor(response){
    this.vendor = response.data
    this.populatedFormValues(this.vendor)
  }

  OnErrorGetVendor(error){
    this.alertService.error(error['error']['message']);
  }

  populatedFormValues(vendor){
    this.vendorForm.patchValue({
      name: vendor.name,
      status: vendor.status == '1',
    })
  }

}

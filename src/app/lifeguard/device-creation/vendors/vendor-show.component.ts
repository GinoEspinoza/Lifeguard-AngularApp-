import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorService } from './vendor.service';
import { AlertService } from '../../services';

@Component({
  selector: 'app-vendor-show',
  templateUrl: './vendor-show.component.html',
  styleUrls: []
})

export class VendorShowComponent implements OnInit {
  vendor:any;
  vendorData: any;

  constructor(
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getVendor(id);
  }

  getVendor(id){
    this.vendorService.showVendor(id).subscribe(response => {
      this.onSuccessGetVendor(response); },
    error => { this.OnErrorGetVendor(error); }
    );
  }

  getStatus() {
    if (this.vendor.status == 0) {
      return 'In Active'
    } else if (this.vendor.status == 1) {
      return 'Active'
    } else if (this.vendor.status == 2) {
      return 'Archived'
    }
  }

  onSuccessGetVendor(response){
    this.vendor = response.data;
  }

  OnErrorGetVendor(error){
    this.alertService.error(error['error']['message']);
  }

  deleteVendor(vendor){
      this.vendorService.delete(vendor.id).subscribe(response => {
        this.onSuccessDeleteVendor(response); },
      error => { this.OnErrorGetVendor(error); }
    );
  }

  onSuccessDeleteVendor(response){
    this.alertService.success(response['message'])
    this.router.navigate(['/lifeguard/vendors']);
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorService } from './vendor.service';
import { AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css']
})
export class VendorListComponent implements OnInit {

  searchForm: FormGroup;
  vendorList:any;
  vendor:any;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownStatusList = [];
  statusDropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
  ) {
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getVendors({ page: 1 });
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      status: [[]]
    });
  }

  onSucessGetVendors(response){
    this.vendorList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  OnErrorGetVendors(error){
    this.alertService.error(error['error']['message']);
  }

  getVendor(id){
    this.vendorService.showVendor(id).subscribe(response => {
      this.vendor = response.data
    },
    error => { this.OnErrorGetVendors(error); }
    );
  }

  getStatus(vendor) {
    if (vendor.status == 0) {
      return 'In Active'
    } else if (vendor.status == 1) {
      return 'Active'
    } else if (vendor.status == 2) {
      return 'Archived'
    }
  }

  onSuccessGetVendor(response){
    this.vendor = response.data
  }

  deleteVendor(vendor){
    this.vendorService.delete(vendor.id).subscribe(response => {
      this.onSuccessDeleteVendor(response); },
    error => { this.OnErrorGetVendors(error); }
    );
  }

  onSuccessDeleteVendor(response){
    this.alertService.success(response['message'])
    this.getVendors({ page: this.currentPage });
  }

  getVendors(params){
    this.vendorService.getVendors(params).subscribe(
      response => {
        this.onSucessGetVendors(response);
      },
      error => { this.OnErrorGetVendors(error); }
    );
  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getVendors({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    this.getVendors(formData)
  }

}

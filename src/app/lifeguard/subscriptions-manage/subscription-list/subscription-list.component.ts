import { Component, OnInit,  } from '@angular/core';
import { SubscriptionsService } from '../subscriptions.service';
import { AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS, ROLES, ROLE_SETTINGS } from '../../constants/drop-down.constants';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-subscription-list',
  templateUrl: './subscription-list.component.html'
})
export class SubscriptionListComponent implements OnInit {

  searchForm: FormGroup;
  users;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  dropdownRoleList = [];
  roleDropdownSettings = {};

  constructor(
    private subscriptionsService: SubscriptionsService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private spinnerService: Ng4LoadingSpinnerService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
    this.dropdownRoleList = ROLES;
    this.roleDropdownSettings = ROLE_SETTINGS;
  }

  ngOnInit() {
    this.getSubscriptions({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]],
      role: [[]]
    });
  }

  getSubscriptions(params) {
    this.subscriptionsService.getSubscriptionsList(params).subscribe(
      response => {
        this.users = response['data'];
        this.totalItems = response['total'];
        this.currentPage = response['current_page'];
        this.pageSize = response['per_page'];
      },
      error => { this.onErrorGetUserList(error); }
    );
  }

  getStatus(user) {
    if(!user.subscription)return 'In Active';
    if (user.status == 0 || user.subscription.status == 0) {
      return 'In Active'
    } else if (user.status == 1 && user.subscription.status == 1) {
      return 'Active'
    }
    return "In Active";
  }
  getType(user) {
    if(!user.subscription)return '';
    return user.subscription.type == 1 ? 'Monthly' : "Annually";
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeleteUser(error); }
    );
  }

  onErrorGetUserList(error){
  }

  cancelSubscription(user){
    this.spinnerService.show();
    this.subscriptionsService.delete(user.id).subscribe(
      response => {
        this.spinnerService.hide();
        this.onSuccessDeleteUser(response); 
      },
      error => { 
        this.spinnerService.hide();
        this.OnErrorDeleteUser(error); 
      }
    );
  }

  onSuccessDeleteUser(response){
    this.alertService.success(response['message'])
    this.getSubscriptions({ page: this.currentPage });
  }

  OnErrorDeleteUser(error) {
    this.alertService.error(error['error']['message'])
  }


  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

  }

  onRoleSelect(item:any){

  }
  
  pageChanged(page) {
    this.getSubscriptions({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(formData['companyId'] && formData['companyId'][0]) {
      formData['company_id'] = formData['companyId'][0]['id']
    } else {
      delete formData['company_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    if(formData['role'] && formData['role'][0]) {
      formData['role_id'] = formData['role'][0]['id']
    } else {
      delete formData['role_id'];
    }
    this.getSubscriptions(formData)
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OfficeService } from './office.service';
import { LocalAuthService, AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS } from '../../constants/drop-down.constants';

@Component({
  selector: 'app-office-list',
  templateUrl: './office-list.component.html',
  styleUrls: ['./office-list.component.css']
})
export class OfficeListComponent implements OnInit {

  searchForm: FormGroup;
  officeList:any;
  showCompany :boolean = false;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officeService: OfficeService,
    private alertService: AlertService,
    private authService: LocalAuthService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService
  ) {
    this.showCompany = authService.currentCompany() ? false : true;
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getOffices({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]]
    });
  }

  getOffices(params){
    this.officeService.getOffices(params).subscribe(response => {
      this.onSucessGetOffices(response); },
    error => { this.OnErrorGetOffices(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeleteOffice(error); }
    );
  }

  deleteOffice(office){
    this.officeService.delete(office.id).subscribe(response => {
      this.onSuccessDeleteOffice(response); },
    error => { this.OnErrorDeleteOffice(error); }
    );
  }

  onSuccessDeleteOffice(response){
    this.getOffices({ page: this.currentPage });
  }

  OnErrorDeleteOffice(error){
    this.alertService.error(error['error']['message']);
  }

  onSucessGetOffices(response){
    this.officeList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  OnErrorGetOffices(error){
    this.alertService.error(error['error']['message']);
  }

  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getOffices({ page: page, ...this.searchForm.value })
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
    this.getOffices(formData)
  }

}

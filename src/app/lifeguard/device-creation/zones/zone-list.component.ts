import { Component, OnInit } from '@angular/core';
import { ZoneService } from './zone.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalAuthService, AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { OfficeService } from '../offices/office.service';
import { OFFICE_DROPDOWN_SETINGS, COMPANY_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';

@Component({
  selector: 'app-zone-list',
  templateUrl: './zone-list.component.html',
  styleUrls: ['./zone-list.component.css']
})
export class ZoneListComponent implements OnInit {
  searchForm: FormGroup;
  zoneList: any;
  showCompany :boolean = false;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  officeDropdownSettings = {};
  dropdownOfficeList = [];
  selectedOfficeItems = [];
  dropdownStatusList = [];
  statusDropdownSettings = {};

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private authService: LocalAuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private officeService: OfficeService,
  ) {
    this.showCompany = authService.currentCompany() ? false : true;
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings  = OFFICE_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getZones({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      officeId: [[]],
      status: [[]]
    });
  }

  onSucessGetZones(response){
    this.zoneList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetZones(error){
    this.alertService.error(error.error.message);
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.onErrorGetZones(error); }
    );
  }

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(
      response => { this.dropdownOfficeList = response.data; },
      error => { this.onErrorGetZones(error); }
    );
  }

  getZones(params){
    this.zoneService.getZones(params).subscribe(response => {
      this.onSucessGetZones(response); },
    error => { this.onErrorGetZones(error); }
    );
  }

  deleteZone(zone){
    this.zoneService.delete(zone.id).subscribe(response => {
      this.onSuccessDeleteZone(response); },
    error => { this.onErrorGetZones(error); }
    );
  }

  onSuccessDeleteZone(response){
    this.getZones({ page: this.currentPage });
  }

  onCompanySelect(company:any){
    this.getCompanyOffices(company);
  }

  onOfficeSelect(item:any){

  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getZones({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(formData['companyId'] && formData['companyId'][0]) {
      formData['company_id'] = formData['companyId'][0]['id']
    } else {
      delete formData['company_id'];
    }
    if(formData['officeId'] && formData['officeId'][0]) {
      formData['office_id'] = formData['officeId'][0]['id']
    } else {
      delete formData['office_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    this.getZones(formData)
  }

}

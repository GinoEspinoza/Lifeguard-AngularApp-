import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../../services';
import { OFFICE_DROPDOWN_SETINGS, COMPANY_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { OfficeService } from '../offices/office.service';
import { CompanyService } from '../companies/company.service';
import { ZoneService } from './zone.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-zones-create',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class ZonesFormComponent implements OnInit {

  zoneForm: FormGroup;
  returnUrl: string;
  officeDropdownList = [];
  officeSelectedItems = [];
  officeDropdownSettings = {};
  companyDropdownSettings = {};

  dropdownList = [];
  selectedItems = [];
  selectedCompany;
  companyList:any;
  officeList:any;
  officeSelected:any;
  zoneId:any;

  @Input() zone:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private officeService: OfficeService,
    private alertService: AlertService,
    private authService: LocalAuthService,
    private companyService: CompanyService,
    private zoneService: ZoneService
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings  = OFFICE_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    this.zoneForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.loadPermittedData()
  }

  loadPermittedData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null && id !== undefined){
      this.zoneId = id;
      this.getZone(id);
    } else if (this.authService.currentCompany()) {
      this.selectedCompany = this.authService.currentCompany();
      this.selectedItems.push(this.selectedCompany);
      this.getCompanyOffices(this.selectedCompany);
    }
    if (this.authService.isAdmin()) {
      this.getCompanies();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.zoneForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
      return;
    }

    formData.companyId = this.selectedCompany.id;
    formData.officeId = this.officeSelected.id;
    if (this.zone == undefined){
      this.zoneService.create(formData, this.selectedCompany, this.officeSelected).subscribe(
      response => {
        let id = response.data.id;
        this.alertService.success(response.message);
        this.router.navigate(['lifeguard/zones/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    } else {
      this.zoneService.update( this.zone, formData).subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response.message);
        this.router.navigate(['lifeguard/zones/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    }
  }

  getZone(id) {
    this.zoneService.showZone(id).subscribe(
      response => { this.onSuccessGetZone(response); },
      error => { this.OnErrorGetCompany(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(
      response => { this.onSucessGetCompanies(response); },
      error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetCompanies(response){
    this.dropdownList = response.data
  }

  OnErrorGetCompanies(error){
    this.alertService.error(error.error.message);
  }

  onSucessGetOffices(response){
    this.officeDropdownList = response.data;
  }

  onErrorGetOffices(error){
    this.alertService.error(error.error.message);
  }

  onItemSelectCompany(company){
    this.officeSelectedItems = [];
    this.selectedCompany = company;
    this.getCompanyOffices(company);
  }

  onItemSelectOffice(office){
    this.officeSelected = office;
  }

  OnItemDeSelect(item:any){
    this.officeDropdownList = [];
    this.officeSelectedItems =[];
    this.selectedCompany = item;
  }

  onSuccessGetZone(response){
    this.zone = response.data
    this.selectedCompany = this.zone.company;
    this.officeSelected = this.zone.office;
    this.getCompanyOffices(this.zone.company)
    this.getCompanies();
    this. populatedFormValues(this.zone)
  }

  OnErrorGetCompany(error){
    this.alertService.error(error.error.message);
  }

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(
      response => { this.onSucessGetOffices(response); },
      error => { this.onErrorGetOffices(error); }
    );
  }

  populatedFormValues(zone){
    this.selectedItems.push(zone.company);
    this.officeSelectedItems.push(zone.office);
    this.zoneForm.patchValue({
      name: zone.name,
    })
  }

  isFormInvalid(){
    if(this.zoneForm.invalid || this.selectedItems.length == 0 || this.officeSelectedItems.length == 0){
      return true;
    } else {
      return false;
    }
  }

}

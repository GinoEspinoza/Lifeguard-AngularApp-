import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../../services';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { OfficeService } from './office.service';
import { CompanyService } from '../companies/company.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-office-create',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class OfficeFormComponent implements OnInit {

  officeForm: FormGroup;
  returnUrl: string;
  dropdownList = [];
  selectedItems = [];
  selectedCompany;
  companyList:any;
  companyDropdownSettings = {};
  office:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private officeService: OfficeService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private authService: LocalAuthService
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.officeForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required]
    });
    if (id !== null && id !== undefined){
      this.getOffice(id)
    } else {
      this.loadPermittedData()
    }
    if (this.authService.isAdmin()) {
      this.getCompanies();
    }
  }

  loadPermittedData() {
    if (this.authService.currentCompany()) {
      this.selectedCompany = this.authService.currentCompany();
      this.selectedItems.push(this.selectedCompany)
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.officeForm.controls; }

  onSubmit(formData) {

    // stop here if form is invalid
    if (this.officeForm.invalid || this.selectedItems.length === 0) {
        return;
    }

    formData.companyId = this.selectedCompany.id;
    if (this.office == undefined){
      this.officeService.create(formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['lifeguard/offices/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    } else {
      this.officeService.update( this.office, formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['lifeguard/offices/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    }
  }

  getOffice(id: any): any {
    this.officeService.getOffice(id).subscribe(response => {
      this.onSucessGetOffice(response); },
    error => { this.OnErrorGetOffice(error); }
    );
  }

  onItemSelect(item:any){
    this.selectedCompany = item;
  }
  OnItemDeSelect(item:any){
    this.selectedCompany = item;
  }

  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetOffice(response){
    this.office = response.data;
    this.populatedFormValues(this.office)
  }

  OnErrorGetOffice(error){
    this.alertService.error(error.error.message);
  }


  onSucessGetCompanies(response){
    this.dropdownList = response.data
  }

  OnErrorGetCompanies(error){
    this.alertService.error(error.error.message);
  }

  populatedFormValues(office){
    this.selectedItems.push(office.company);
    this.selectedCompany = office.company;
    this.officeForm.patchValue({
      name: office.name,
      address: office.address,
    })
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService ,AlertService } from './../services';
import { PackagesService } from './packages.service';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS , GROUP_USER_DROPDOWN_SETTINGS } from './../constants/drop-down.constants';
import { CompanyService } from '../device-creation/companies/company.service';
import { UserService } from '../users/user.service';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
@Component({
  selector: 'app-packages-form',
  templateUrl: './form.component.html',
  styleUrls: ['./packages.component.css']
})
export class PackagesFormComponent implements OnInit {

  packageForm: FormGroup;
  returnUrl: string;
  packageId:any;
  dropdownList = [];
  selectedItems = [];
  typeModel = 1;
  selectedType = 1;
  typeList : any;
  

  @Input() package:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackagesService,
    private companyService: CompanyService,
    private alertService: AlertService,
    private authService: LocalAuthService,
  ) {
  }

  ngOnInit() {
    this.typeList = [
			{id:1 , name : 'Monthly'},
			{id:2 , name : 'Yearly'},
		]
    const id = this.route.snapshot.paramMap.get('id');

    this.packageForm = this.formBuilder.group({
      name: ['', Validators.required],
      offices: [0],
      locks: [0],
      cameras: [0],
      sub_users: [0],
      price: [0,Validators.required],
      status: [true],
    });
    if (id !== null && id !== undefined){
      this.packageId = id;
      this.getPackage(id)
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.packageForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.isInvalidForm()) {
      return;
    }
    let formData = this.packageForm.value;
    formData.status = formData.status ? '1' : '0';
    if (this.package == undefined){
      this.packageService.create(formData,this.typeModel)
      .subscribe(
      response => {
        let id = response['data']['id']
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/subscription/packages/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    } else {
      this.packageService.update(this.package , formData , this.typeModel)
      .subscribe(
      response => {
        let id = response['data']['id']
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/subscription/packages/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    }
  }
  isInvalidForm(){
    if(this.packageForm.invalid)return true;
    if(this.packageForm.value.offices == 0 && this.packageForm.value.locks == 0 && this.packageForm.value.cameras == 0 && this.packageForm.value.sub_users == 0)return true;
    return false;
  }

  onSucessGetUsers(response:any){
    // this.selectedUsers = [];
    // this.usersDropdownList = response.data;

  }
  OnErrorGetUsers(error){}
  getPackage(id){
    this.packageService.showPackage(id).subscribe(response => {
      this.onSuccessGetPackage(response); },
      error => { this.OnErrorGetGroup(error); }
    );
  }


  onSuccessGetPackage(response){
    console.log(response.data);
    this.package = response.data
    // this.selectedUsers = response.data.user_list;

    this.populatedFormValues(this.package)
  }

  OnErrorGetGroup(error){
    this.alertService.error(error['error']['message']);
  }

  populatedFormValues(package_){
    this.typeModel = package_.type;
    this.packageForm.patchValue({
      name: package_.name,
      offices: package_.offices,
      locks: package_.locks,
      cameras: package_.cameras,
      price: package_.price,
      sub_users: package_.sub_users,
      status: package_.status == '1',
    })
  }
  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }
  OnErrorGetCompanies(error){
    this.alertService.error(error.error.message);
  }
  onSucessGetCompanies(response){
    this.dropdownList = response.data
  }
  onItemSelectType(type) {
    this.selectedType = type
    this.typeModel = type.id
  }
}

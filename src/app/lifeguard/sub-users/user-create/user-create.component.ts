import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { LocalAuthService,AlertService } from '../../services';
import { ADD_USER, COMPANY_NAME } from '../../constants/company.constant';
import { Router, ActivatedRoute } from '@angular/router';
import { MULTI_ZONE_DROPDOWN_SETINGS,MULTI_OFFICE_DROPDOWN_SETINGS,COMPANY_DROPDOWN_SETINGS, PERMISSION_DROPDOWN_SETTINGS, } from './../../constants/drop-down.constants';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service'
import { SubUserService } from '../sub-user.service';
import { CompanyService } from '../../device-creation/companies';
import { OfficeService } from '../../device-creation/offices/office.service';

@Component({
  selector: 'app-subuser-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class SubUserCreateComponent implements OnInit {

  submitted:boolean = false;
  userForm: FormGroup;
  modalRef: BsModalRef;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  mobileNoPattern = /^\+[1-9]{1}[0-9]{7,11}$/;
  officeDropdownList = [];
  officeSelectedItems = [];
  officeDropdownSettings = {};

  zoneDropdownList = [];
  zoneSelectedItems = [];
  zoneDropdownSettings = {};

  companyDropdownList = [];
  selectedCompany:any;
  companyDropdownSettings = {};
  permissionsDropdownList = [];
  selectedRole = [];
  selectedPermissions = [];
  permissionDropdownSettings = {};
  companySelectionRequired = false;
  userId;
  user;
  permissionRequired = false;
  phoneRef: any;
  phoneValid = true;
  fullPhoneNumber = '';
  currrentCompany :any;
  constructor(
    private modalService: BsModalService,
    private userService: SubUserService,
    private companyService:CompanyService,
    private alertService:AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: LocalAuthService,
    private officeService: OfficeService,
  ){
    this.getCompanies();
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.permissionDropdownSettings = PERMISSION_DROPDOWN_SETTINGS;
    this.officeDropdownSettings  = MULTI_OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings  = MULTI_ZONE_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    if (this.authService.currentCompany()) {
      this.currrentCompany = this.authService.currentCompany();
      this.selectedCompany = [this.currrentCompany];
      this.getCompanyOffices(this.currrentCompany);
    }
    const id = this.route.snapshot.paramMap.get('id');
    let passwordField = {}
    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('',  Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      mobileNo: new FormControl('', Validators.required),
      address: new FormControl(''),
      company: new FormControl('', Validators.required),
      offices: new FormControl('', Validators.required),
      zones: new FormControl('', Validators.required),
      permissions: new FormControl(''),
      status: new FormControl(false, Validators.required),
    });
    if (id !== null && id !== undefined){
      this.userId = id;
      this.getUser(id)
      passwordField = {
        password: new FormControl(''),
        passwordConfirmation: new FormControl(''),
      }
    } else {
      passwordField = {
        password: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[^\s]{8,}$/)])),
        passwordConfirmation: new FormControl('', Validators.required),
      }
    }
    this.userForm.addControl('password', passwordField['password'])
    this.userForm.addControl('passwordConfirmation', passwordField['passwordConfirmation'])

    this.companySelectionRequired = true;
    this.permissionRequired = true;
    this.getPermissions(4);
    this.selectedPermissions = [];
  }

  get f() { return this.userForm.controls; }

  onSubmit(formData){
    // stop here if form is invalid
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
    console.log("formData",formData);
    this.sendData(formData);
  }

  sendData(formData){
    formData.status = formData.status ? 1 : 0
    formData.mobileNo = this.fullPhoneNumber;
    if (this.user == undefined){
      this.userService.create(formData)
      .subscribe(
      response => {
        let id = response['id']
        this.router.navigate(['/lifeguard/sub_users/' + id ]);
        this.alertService.success(response['message']);
      }, error => {
        this.alertService.error(error['error']['message']);
      });
    } else {
      this.userService.update( this.user, formData)
      .subscribe(
        response => {
          let id = this.user.id;
          this.alertService.success(response['message']);
          this.router.navigate(['/lifeguard/sub_users/' + id ]);
        },
        error => {
          this.alertService.error(error['error']['message']);
      });
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(
      response => { this.onSucessGetOffices(response); },
      error => { this.onErrorGetOffices(error); }
    );
  }
  onSucessGetOffices(response){
    this.officeDropdownList = response.data;
  }

  onErrorGetOffices(error){
    this.alertService.error(error.error.message);
  }
  getUser(id){
    this.userService.showUser(id).subscribe(response => {
      this.onSuccessGetUser(response); },
      error => { this.OnErrorGetUser(error); }
    );
  }

  onSuccessGetUser(response){
    this.user = response.data;
    this.selectedCompany = [this.user.company];
    this.selectedPermissions = this.user.permissions;
    this.officeSelectedItems = this.user.offices;
    this.zoneSelectedItems = this.user.zones;
    this.getOfficeZones(this.officeSelectedItems);
    this.populateFormValues(this.user);
  }

  OnErrorGetUser(error){}

  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetCompanies(response:any){
    this.companyDropdownList = response.data
  }

  OnErrorGetCompanies(error){}

  getPermissions(roleId){
    this.userService.getPermissions(roleId).subscribe(response => {
      this.onSucessGetPermissions(response); },
    error => { this.OnErrorGetPermissions(error); }
    );
  }

  onSucessGetPermissions(response:any){
    this.permissionsDropdownList = response.data;
  }

  OnErrorGetPermissions(error){}

  onItemSelect(item:any){
    this.currrentCompany = item;
    this.officeDropdownList = [];
    this.officeSelectedItems = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.getCompanyOffices(this.currrentCompany);
  }

  OnItemDeSelect(item:any){
    this.officeDropdownList = [];
  }
  onItemSelectOffice(item:any){
    this.zoneDropdownList = [];
    this.getOfficeZones(this.officeSelectedItems);
  }
  getOfficeZones(offices){
    this.userService.getZones(offices).subscribe(
      response => { this.onSucessGetZones(response); },
      error => { this.alertService.error(error['error']['message']) }
    );
  }
  onSucessGetZones(response){
    this.zoneDropdownList = response.data
  }

  OnItemDeSelectOffice(item:any){
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.getOfficeZones(this.officeSelectedItems);
  }
  onPermissionSelect(item:any){
    const alreadySelected = this.selectedPermissions.filter(permission => permission.id == item.id)
    if(alreadySelected.length == 0){
      this.selectedPermissions.push(item);
    }
  }
  onItemSelectZone(item:any){

  }
  onItemDeSelectZone(item:any){
    
  }
  OnPermissionDeSelect(item:any){
    this.selectedPermissions.filter(permission => permission.id !== item.id);
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

  populateFormValues(user){
    this.getPermissions(user.roles[0]['id']);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      mobileNo: user.mobile_no,
      password: user.password,
      passwordConfirmation: user.password_confirmation,
      address: user.address || '',
      company: [user.company],
      status: user.status == '1',
    })
    if (user.mobile_no) {
      this.phoneRef.intlTelInput('setNumber', user.mobile_no);
      this.fullPhoneNumber = user.mobile_no;
    }
  }

  isFormInvalid(){
    if(this.userForm.invalid) {
      return true;
    } else {
      return false;
    }
  }
}

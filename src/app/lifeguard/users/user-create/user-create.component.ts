import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AlertService } from '../../services';
import { ADD_USER, COMPANY_NAME } from '../../constants/company.constant';
import { Router, ActivatedRoute } from '@angular/router';
import { COMPANY_DROPDOWN_SETINGS, PERMISSION_DROPDOWN_SETTINGS, ROLES, ROLE_SETTINGS } from './../../constants/drop-down.constants';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service'
import { UserService } from '../user.service';
import { CompanyService } from '../../device-creation/companies';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {

  submitted:boolean = false;
  userForm: FormGroup;
  modalRef: BsModalRef;
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  mobileNoPattern = /^\+[1-9]{1}[0-9]{7,11}$/;
  companyDropdownList = [];
  selectedCompany:any;
  companyDropdownSettings = {};
  permissionsDropdownList = [];
  selectedRole = [];
  selectedPermissions = [];
  permissionDropdownSettings = {};
  rolesList;
  roleSettings = {};
  companySelectionRequired = false;
  userId;
  user;
  permissionRequired = false;
  phoneRef: any;
  phoneValid = true;
  fullPhoneNumber = '';
  sub_user_required=false;

  constructor(
    private modalService: BsModalService,
    private userService: UserService,
    private companyService:CompanyService,
    private alertService:AlertService,
    private route: ActivatedRoute,
    private router: Router,
  ){
    this.getCompanies();
    this.rolesList = ROLES;
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.permissionDropdownSettings = PERMISSION_DROPDOWN_SETTINGS;
    this.roleSettings = ROLE_SETTINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    let passwordField = {}
    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('',  Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      mobileNo: new FormControl('', Validators.required),
      address: new FormControl(''),
      company: new FormControl(''),
      role: new FormControl('', Validators.required),
      permissions: new FormControl(''),
      status: new FormControl(false, Validators.required),
      sub_users: new FormControl(0, Validators.required),
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
  }

  get f() { return this.userForm.controls; }

  onSubmit(formData){
    // stop here if form is invalid
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
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
        this.router.navigate(['/lifeguard/users/' + id ]);
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
          this.router.navigate(['/lifeguard/users/' + id ]);
        },
        error => {
          this.alertService.error(error['error']['message']);
      });
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
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
    this.selectedRole = this.user.roles;
    this.selectedPermissions = this.user.permissions;
    this.companySelectionRequired = this.selectedRole[0].name == "Company User"
    this.sub_user_required = this.selectedRole[0].name == "Company User"
    this.permissionRequired = this.selectedRole[0].name !== "Super Admin";

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
  }

  OnItemDeSelect(item:any){
  }

  onPermissionSelect(item:any){
    const alreadySelected = this.selectedPermissions.filter(permission => permission.id == item.id)
    if(alreadySelected.length == 0){
      this.selectedPermissions.push(item);
    }
  }

  OnPermissionDeSelect(item:any){
    this.selectedPermissions.filter(permission => permission.id !== item.id);
  }

  onRoleSelect(item: any){
    this.companySelectionRequired = false;
    if(item.id == 2 || item.id == 3){
      if (item.id == 3) {
        this.companySelectionRequired = true;
        this.sub_user_required = true;
      }
      this.permissionRequired = true;
      this.getPermissions(item.id);
      this.selectedPermissions = [];
    }
    else{
      this.permissionRequired = false;
    }
  }

  OnRoleDeSelect(item: any) {}

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
      company: user.company.id,
      status: user.status == '1',
      sub_users:user.sub_users,
    })
    if (user.mobile_no) {
      this.phoneRef.intlTelInput('setNumber', user.mobile_no);
      this.fullPhoneNumber = user.mobile_no;
    }
  }

  isFormInvalid(){
    if(this.userForm.invalid || this.selectedRole.length == 0) {
      return true;
    } else {
      return false;
    }
  }
}

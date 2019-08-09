import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService ,AlertService } from './../services';
import { GroupService } from './group.service';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS , GROUP_USER_DROPDOWN_SETTINGS } from './../constants/drop-down.constants';
import { CompanyService } from '../device-creation/companies/company.service';
import { UserService } from '../users/user.service';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
@Component({
  selector: 'app-group-form',
  templateUrl: './form.component.html',
  styleUrls: []
})
export class GroupFormComponent implements OnInit {

  groupForm: FormGroup;
  returnUrl: string;
  groupId:any;
  zoneId:any;
  selectedCompany;
  dropdownList = [];
  selectedItems = [];
  companyList:any;
  companyDropdownSettings = {};
  usersDropdownList = [];
  usersDropdownSettings = {};
  userRequired = false;
  selectedUsers = [];

  @Input() group:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private companyService: CompanyService,
    private userService: UserService,
    private alertService: AlertService,
    private authService: LocalAuthService,
    private deviceUserService: DeviceUserService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.usersDropdownSettings = GROUP_USER_DROPDOWN_SETTINGS;
  }

  ngOnInit() {
    console.log("group new");
    const id = this.route.snapshot.paramMap.get('id');

    this.groupForm = this.formBuilder.group({
      name: ['', Validators.required],
      status: [true],
      users:[],
    });
    if (id !== null && id !== undefined){
      this.groupId = id;
      this.getGroup(id)
    }
    // if (this.authService.isAdmin()) {
      this.getCompanies();
    // }
  }

  // convenience getter for easy access to form fields
  get f() { return this.groupForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.groupForm.invalid) {
      return;
    }
    let formData = this.groupForm.value;
    formData.companyId = this.selectedCompany.id;
    formData.status = formData.status ? '1' : '0';
    if (this.group == undefined){
      this.groupService.create(formData)
      .subscribe(
      response => {
        let id = response['data']['id']
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/groups/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    } else {
      this.groupService.update(this.group , formData)
      .subscribe(
      response => {
        let id = response['data']['id']
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/groups/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    }
  }

  getUsers(companyId){
    this.deviceUserService.getDeviceUsers({company_id : companyId , per_page:-1}).subscribe(response => {
      this.onSucessGetUsers(response); },
    error => { this.OnErrorGetUsers(error); }
    );
  }

  onSucessGetUsers(response:any){
    // this.selectedUsers = [];
    // this.usersDropdownList = response.data;
    this.usersDropdownList = [];
    response.data.forEach(user => {
      user['name'] = user.device_user_fname+" "+user.device_user_lname
      this.usersDropdownList.push(user);
    });
    if(this.usersDropdownList.length){
      this.userRequired = true;
    }else{
      this.userRequired = false;
    }
  }
  OnErrorGetUsers(error){}
  getGroup(id){
    this.groupService.showGroup(id).subscribe(response => {
      this.onSuccessGetGroup(response); },
      error => { this.OnErrorGetGroup(error); }
    );
  }
  onUserSelect(item:any){
    const alreadySelected = this.selectedUsers.filter(user => user.id == item.id)
    if(alreadySelected.length == 0){
      this.selectedUsers.push(item);
    }
    console.log(this.selectedUsers);
  }

  OnUserDeSelect(item:any){
    this.selectedUsers.filter(user => user.id !== item.id);
  }

  onSuccessGetGroup(response){
    console.log(response.data);
    this.group = response.data
    // this.selectedUsers = response.data.user_list;
    this.selectedUsers = [];
    response.data.user_list.forEach(user => {
      user['name'] = user.device_user_fname+" "+user.device_user_lname
      this.selectedUsers.push(user);
    });
    this.selectedItems.push( response.data.company )
    this.selectedCompany = response.data.company
    this.getUsers(response.data.company.id)
    this.populatedFormValues(this.group)
  }

  OnErrorGetGroup(error){
    this.alertService.error(error['error']['message']);
  }

  populatedFormValues(group){
    this.groupForm.patchValue({
      name: group.name,
      status: group.status == '1',
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
  onItemSelect(item:any){
    this.selectedCompany = item;
    this.getUsers(item.id);
  }
  OnItemDeSelect(item:any){
    this.selectedCompany = item;
    this.usersDropdownList = [];
  }
}

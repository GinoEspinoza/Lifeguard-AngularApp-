import { Component, OnInit } from '@angular/core';
import { LocalAuthService, AlertService } from '../../services';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from '../../device-creation/locks/lock.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { OfficeService } from '../../device-creation/offices/office.service';
import { SubUserService } from '../sub-user.service';
import { COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS } from '../../constants/drop-down.constants';
import { isArray } from 'util';
@Component({
  selector: 'app-sub-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css']
})
export class SubUserManageComponent implements OnInit {

  searchForm: FormGroup;
  locksList:any;
  lock:any;
  totalItems;
  currentPage;
  pageSize = 10;
  totalItems_camera;
  currentPage_camera;
  pageSize_camera = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  officeDropdownSettings = {};
  dropdownOfficeList = [];
  selectedOfficeItems = [];
  zoneDropdownSettings = {};
  dropdownZoneList = [];
  selectedZoneItems = [];
  sub_user_id : any;
  camerasList:any;
  camera:any;
  user:any;

  TYPE_LOCK = 1;
  TYPE_CAMERA = 2;
  ACTION_ASSIGN = 1;
  ACTION_REMOVE = 2;

  constructor(
    private lockService: LockService,
    private authService: LocalAuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: SubUserService,
    
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings  = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.sub_user_id = this.route.snapshot.paramMap.get('id');
    this.getUser(this.sub_user_id);
    this.getLocks({ page: 1 , sub_user_id:this.sub_user_id });
    this.getCameras({ page: 1, sub_user_id:this.sub_user_id });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      officeId: [[]],
      zoneId: [[]],
      status: [[]]
    });
  }
  getUser(id){
    this.userService.showUser(id).subscribe(response => {
      this.onSuccessGetUser(response);
    },
    error => { this.OnErrorGetUser(error); }
    );
  }
  onSuccessGetUser(response){
    this.user = response.data;
  }

  OnErrorGetUser(error){
    this.router.navigate(['/lifeguard/sub_users' ]);
  }
  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.onErrorGetLock(error); }
    );
  }

  getLocks(params){
    this.lockService.getLocks(params).subscribe(response => {
      this.onSucessGetLocks(response); },
      error => { this.onErrorGetLocks(error); }
    );
  }
  getCameras(params){
    this.lockService.getLocks({device_type: 'Camera', ...params}).subscribe(response => {
      this.onSucessGetCameras(response); },
      error => { this.onErrorGetLocks(error); }
    );
  }
  onSucessGetCameras(response){
    this.camerasList = response['data'];
    this.totalItems_camera = response['total'];
    this.currentPage_camera = response['current_page'];
    this.pageSize_camera = response['per_page'];
  }

  getStatus(lock) {
    if (lock.status == 0) {
      return 'In Active'
    } else if (lock.status == 1) {
      return 'Active'
    } else if (lock.status == 2) {
      return 'Archived'
    }
  }

  getCompanyOffices(company){
    this.officeService.getSubUserCompanyOffices(company,this.sub_user_id).subscribe(
      response => { this.dropdownOfficeList = response.data; },
      error => { this.onErrorGetLocks(error); }
    );
  }

  getOfficeZones(office){
    this.officeService.getSubUserZones(office,this.sub_user_id).subscribe(response => {
      this.dropdownZoneList = response.data; },
    error => { this.onErrorGetLock(error); }
    );
  }


  onSucessGetLocks(response){
    this.locksList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetLocks(error){
    this.alertService.error(error['error']['message']);
  }

  onErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  onCompanySelect(company:any){
    this.getCompanyOffices(company);
  }

  onOfficeSelect(office:any){
    this.getOfficeZones(office);
  }

  onZoneSelect(item:any){

  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getLocks({ page: page,sub_user_id:this.sub_user_id, ...this.searchForm.value })
  }
  cameraPageChanged(page) {
    this.getCameras({ page: page,sub_user_id:this.sub_user_id, ...this.searchForm.value })
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
    if(formData['zoneId'] && formData['zoneId'][0]) {
      formData['zone_id'] = formData['zoneId'][0]['id']
    } else {
      delete formData['zone_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    delete formData['companyId'];
    delete formData['officeId'];
    delete formData['zoneId'];
    this.getLocks({ page: 1,sub_user_id:this.sub_user_id, ...formData });
    this.getCameras({ page: 1,sub_user_id:this.sub_user_id, ...formData })
  }
  getTypeString(type) {
    if(type == 1)return "Normal";
    if(type == 2)return "<label class='badge badge-success'>Enrollment</label>";
  }
  isLockAssigned(lock){
    var filtered = this.user.locks.filter((item)=>{
      return item.id == lock.id;
    });
    return filtered.length >= 1;
  }
  isCameraAssigned(camera){
    var filtered = this.user.cameras.filter((item)=>{
      return item.id == camera.id;
    });
    return filtered.length >= 1;
  }
  deviceAssignAction(lock,type,action){
    this.userService.deviceAssign({device_id:lock.id , user_id : this.sub_user_id , type : type , action : action}).subscribe(response => {
      this.alertService.success(response['message']);
      this.getUser(this.sub_user_id);
    },
    error => { this.OnErrorGetUser(error); }
    );
  }
}

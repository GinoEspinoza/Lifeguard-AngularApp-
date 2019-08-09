import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AssignDeviceService } from './assign-device.service';
import { AlertService } from '../../services';

@Component({
  selector: 'app-assign-device-show',
  templateUrl: './assign-device-show.component.html',
  styleUrls: ['./assign-device-show.component.css']
})
export class AssignDeviceShowComponent implements OnInit {

  assignDevice:any
  deviceData: any;

  constructor(
    private route: ActivatedRoute,
    private assignDeviceService: AssignDeviceService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getAssignedDevice(id);
  }

  getAssignedDevice(id){
    this.assignDeviceService.getAssignDevice(id).subscribe(response => {
      this.onSuccessGetLock(response); },
    error => { this.OnErrorGetAssignDevice(error); }
    );
  }

  onSuccessGetLock(response){
    this.assignDevice = response.data;
  }

  OnErrorGetAssignDevice(error){
    this.alertService.error(error['error']['message']);
  }

  deleteLock(assignDevice){
    this.assignDeviceService.delete(assignDevice.id).subscribe(response => {
      this.onSuccessDeleteAssignDevice(response); },
    error => { this.OnErrorGetAssignDevice(error); }
    );

  }
  onSuccessDeleteAssignDevice(response){
    this.alertService.success(response['message']);
    this.router.navigate(['company_devices']);
  }
}

















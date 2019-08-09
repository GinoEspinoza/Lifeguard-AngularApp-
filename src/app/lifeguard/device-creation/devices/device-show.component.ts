import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceService } from './device.service';
import { AlertService } from '../../services';

@Component({
  selector: 'app-device-show',
  templateUrl: './device-show.component.html',
  styleUrls: ['./device-show.component.css']
})
export class DeviceShowComponent implements OnInit {

  device:any;
  deviceData: any;

  constructor(
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getDevice(id);
  }

  getDevice(id){
    this.deviceService.getDevice(id).subscribe(response => {
      this.onSuccessGetDevice(response); },
    error => { this.OnErrorGetDevice(error); }
    );
  }

  getAssignedCompany(device) {
    if (device['company_device']) {
      return device['company_device']['company']['name']
    } else {
      return 'Not Assigned'
    }
  }

  getStatus() {
    if (this.device.status == 0) {
      return 'In Active'
    } else if (this.device.status == 1) {
      return 'Active'
    } else if (this.device.status == 2) {
      return 'Archived'
    }
  }

  onSuccessGetDevice(response){
    this.device = response.data;
  }

  OnErrorGetDevice(error){
    this.alertService.error(error['error']['message']);
  }

  deleteDevice(device){
    this.deviceService.delete(device.id).subscribe(response => {
      this.onSuccessDeleteDevice(response); },
    error => { this.OnErrorGetDevice(error); }
    );

  }

  onSuccessDeleteDevice(response){
    this.alertService.success(response['message']);
    this.router.navigate(['devices']);
  }

}

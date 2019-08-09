import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../../services';
import { VENDOR_DROPDOWN_SETINGS, DEVICE_TYPE_SETTINGS } from './../../constants/drop-down.constants';
import { DeviceService } from './device.service';
import { VendorService } from '../vendors/vendor.service';

@Component({
  selector: 'app-devices',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class DeviceFormComponent implements OnInit {

  deviceForm: FormGroup;
  returnUrl: string;
  dropdownVendorList = [];
  dropdownList = [];
  selectedVendorItems = [];
  selectedItems= []
  device:any = {};
  vendorDropdownSettings = {};
  deviceTypeDropdownSettings = {};
  dropdownDeviceType:any;
  selectedVendor:any;
  selectedDeviceTypes:any;
  selectedDeviceType:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private alertService: AlertService,
    private vendorService:VendorService,
  ) {
    this.getVendors();
    this.vendorDropdownSettings = VENDOR_DROPDOWN_SETINGS;
    this.deviceTypeDropdownSettings = DEVICE_TYPE_SETTINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.deviceForm = this.formBuilder.group({
      vendorId: [[], Validators.required],
      deviceType: ['', Validators.required],
      modelName: ['', Validators.required],
      series: ['', Validators.required],
      mac: [''],
      uuid: [''],
      vendorSerialNumber: ['', Validators.required],
      // deviceName: ['', Validators.required],
      partNumber: ['', Validators.required],
      status: ['1']
    });

    this.dropdownDeviceType = [{
      id: 'lock', name: 'Lock',
    },{
      id: 'camera', name: 'Camera',
    },{
      id: 'hub', name: 'Hub'
    }]
    if (id !== null && id !== undefined){
      this.getDevice(id);
    }
    this.formControlValueChanged();
  }

  formControlValueChanged() {
    const macControl = this.deviceForm.get('mac');
    const uuidControl = this.deviceForm.get('uuid');
    this.deviceForm.get('deviceType').valueChanges.subscribe(
      (type: string) => {
        if (type && type[0]['id'] === 'camera') {
          macControl.setErrors(null);
          uuidControl.setValidators([Validators.required]);
        } else {
          uuidControl.setErrors(null);
          uuidControl.clearValidators();
          macControl.setValidators([Validators.required]);
        }
      })
    macControl.valueChanges.subscribe(
      (value: string) => {
        if (macControl.errors == null || macControl.errors == {}) { }
      })
  }

  // convenience getter for easy access to form fields
  get f() { return this.deviceForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isInvalid()) {
      return;
    }
    formData.vendorId = this.selectedVendor.id;
    formData.deviceType = formData.deviceType[0].name;
    if (formData.deviceType == 'Camera') {
      formData.mac = formData.uuid
    }
    if (this.device == undefined || this.device.id == undefined){
      this.deviceService.create(formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/devices/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    } else {
      this.deviceService.update( this.device, formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/devices/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    }
  }

  getVendors(){
    this.vendorService.getVendors({status: 1}).subscribe(response => {
      this.onSucessGetVendors(response); },
    error => { this.onErrorGetVendors(error); }
    );
  }

  OnItemDeSelect(item:any){
  }

  onSucessGetVendors(response){
    this.dropdownVendorList = response.data
  }

  onErrorGetVendors(error){
    this.alertService.error(error['error']['message']);
  }

  onVendorSelect(item:any){
    this.selectedVendor = item;
  }

  onSucessGetDevice(response){
    this.device = response.data
    this.populatedFormValues(this.device)
  }

  onErrorGetDevices(error){
    this.alertService.error(error['error']['message']);
  }

  onDeviceTypeSelect(device){
    this.selectedDeviceType = device.id;
  }

  onDeviceTypeDeSelect(device){
    this.selectedDeviceType = null;
  }

  getDevice(id: any): any {
    this.deviceService.getDevice(id).subscribe(
      response => {
        this.onSucessGetDevice(response);
        if(this.dropdownVendorList.filter((vendor) => vendor.id == response.data.vendor.id ).length == 0) {
          this.dropdownVendorList.push(response.data.vendor);
        }
      },
      error => { this.onErrorGetDevices(error); }
    );
  }

  populatedFormValues(device){
    this.selectedVendorItems.push(device.vendor);
    this.selectedVendor = device.vendor;
    if (device.type) {
      this.selectedDeviceType = device.type.toLowerCase()
      if (device.type == 'Mac' || device.type == 'Lock') {
        this.deviceForm.patchValue({
          mac: device.mac
        })
      } else {
        this.deviceForm.patchValue({
          uuid: device.mac
        })
      }
    }
    this.deviceForm.patchValue({
      modelName: device.model_name,
      vendorId: [this.selectedVendor],
      deviceType: [{id: device.type.toLowerCase(), name: device.type}],
      series: device.series,
      vendorSerialNumber: device.vendor_serial_no,
      status: '' + device.status,
      partNumber: device.part_no
    })
  }

  isInvalid(){
    if(this.deviceForm.invalid){
      return true;
    } else{
      let state = false;
      if (this.selectedDeviceType == 'Camera' && this.deviceForm.value.uuid.length == 0) { state = true }
      return state;
    }
  }

}

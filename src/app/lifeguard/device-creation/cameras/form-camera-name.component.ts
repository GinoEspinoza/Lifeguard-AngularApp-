import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../../services';
import { LockService } from '../locks/lock.service';
import * as moment from 'moment';
import 'moment-precise-range-plugin';

@Component({
  selector: 'app-form',
  templateUrl: './form-camera-name.component.html',
  // styleUrls: ['./form.component.css']
})
export class UpdateCameraNameFormComponent implements OnInit {

  cameraForm: FormGroup;
  returnUrl: string;

  camera:any = {company: {}, office: {}, zone: {}};
  cameraId:any;
  companySelected:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private alertService: AlertService,
    private authService: LocalAuthService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.cameraForm = this.formBuilder.group({
      cameraName: ['', Validators.required],
    });
    this.cameraId = id;
    this.getCamera(id);
  }

  ngOnDestroy() {
  }

  // convenience getter for easy access to form fields
  get f() { return this.cameraForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.cameraForm.invalid) {
      return;
    }

    this.sendData(formData);
  }

  sendData(formData){
    formData.officeId = this.camera.office.id;
    formData.id = this.camera.id;

    this.lockService.updateName( this.camera, formData).subscribe(
      response => {
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/cameras/'+ this.camera.id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  getCamera(id: any): any {
    this.lockService.getLock(id).subscribe(response => {
      this.onSucessGetCamera(response); },
    error => { this.onErrorGetCamera(error); }
    );
  }

  onSucessGetCamera(response){
    this.camera = response.data;
    this.populatedFormValues(this.camera)
  }

  onErrorGetCamera(error){
    this.alertService.error(error.error.message);
  }

  populatedFormValues(camera){
    this.cameraForm.patchValue({
      cameraName: camera.device_name,
    })
  }

  expiresIn() {
    if (this.camera.subscription_status == '0') {
      return 'Expired'
    }
    let endDate = moment(this.dateToLocal(this.camera.subscription_end).format('YYYY-MM-DD'))
    let expiry = endDate.diff(moment().format('YYYY-MM-DD'), 'days')
    if ( expiry < 0) {
      return 'Expired'
    } else if (expiry == 0){
      return 'Today'
    } else {
      return moment(moment().format('YYYY-MM-DD')).preciseDiff(endDate);
    }
  }

  dateToLocal(date){
    return moment.utc(date).local();
  }
}

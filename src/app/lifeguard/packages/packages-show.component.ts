import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PackagesService } from './packages.service';
import { AlertService } from '../services';
import { group } from '@angular/animations';

@Component({
  selector: 'app-packages-show',
  templateUrl: './packages-show.component.html',
  styleUrls: [],
  
})

export class PackagesShowComponent implements OnInit {
  package:any;
  vendorData: any;
  userShow = false;

  constructor(
    private route: ActivatedRoute,
    private groupService: PackagesService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getPackage(id);
  }

  getPackage(id){
    this.groupService.showPackage(id).subscribe(response => {
      this.onSuccessGetPackage(response); },
    error => { this.OnErrorGetPackage(error); }
    );
  }

  getStatus() {
    if (this.package.status == 0) {
      return 'In Active'
    } else if (this.package.status == 1) {
      return 'Active'
    } else if (this.package.status == 2) {
      return 'Archived'
    }
  }

  onSuccessGetPackage(response){
    this.package = response.data;
  }

  OnErrorGetPackage(error){
    this.alertService.error(error['error']['message']);
  }

  deletePackage(package_){
      this.groupService.delete(package_.id).subscribe(response => {
        this.onSuccessDeletePackage(response); },
      error => { this.OnErrorGetPackage(error); }
    );
  }

  onSuccessDeletePackage(response){
    this.alertService.success(response['message'])
    this.router.navigate(['/lifeguard/subscription/details']);
  }
  onShowUser(){
    this.userShow = true;
  }
}

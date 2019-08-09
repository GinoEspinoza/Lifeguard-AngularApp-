import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from './group.service';
import { AlertService } from '../services';
import { group } from '@angular/animations';

@Component({
  selector: 'app-group-show',
  templateUrl: './group-show.component.html',
  styleUrls: []
})

export class GroupShowComponent implements OnInit {
  group:any;
  vendorData: any;
  userShow = false;
  group_user_list:any;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getGroup(id);
  }

  getGroup(id){
    this.groupService.showGroup(id).subscribe(response => {
      this.onSuccessGetGroup(response); },
    error => { this.OnErrorGetGroup(error); }
    );
  }

  getStatus() {
    if (this.group.status == 0) {
      return 'In Active'
    } else if (this.group.status == 1) {
      return 'Active'
    } else if (this.group.status == 2) {
      return 'Archived'
    }
  }

  onSuccessGetGroup(response){
    this.group = response.data;
    console.log("group",this.group);
    this.group_user_list = [];
    this.group.user_list.forEach(user => {
        let locknames = [];
				user.locks.forEach(l => {
					locknames.push(l.device_name);
        });
        user['lock_names'] = locknames.join(",")
        this.group_user_list.push(user);
      });
  }

  OnErrorGetGroup(error){
    this.alertService.error(error['error']['message']);
  }

  deleteGroup(group){
      this.groupService.delete(group.id).subscribe(response => {
        this.onSuccessDeleteGroup(response); },
      error => { this.OnErrorGetGroup(error); }
    );
  }

  onSuccessDeleteGroup(response){
    this.alertService.success(response['message'])
    this.router.navigate(['/lifeguard/groups']);
  }
  onShowUser(){
    this.userShow = true;
  }
}

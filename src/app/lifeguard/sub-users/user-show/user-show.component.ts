import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubUserService } from '../sub-user.service';
import { AlertService } from '../../services';

@Component({
  selector: 'app-subuser-show',
  templateUrl: './user-show.component.html'
})
export class SubUserShowComponent implements OnInit {
  user;
  constructor(
    private userService: SubUserService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getUser(id);
  }

  getUser(id){
    this.userService.showUser(id).subscribe(response => {
      this.onSuccessGetUser(response);
    },
    error => { this.OnErrorGetUser(error); }
    );
  }

  getStatus() {
    if (this.user.status == 0) {
      return 'In Active'
    } else if (this.user.status == 1) {
      return 'Active'
    } else if (this.user.status == 2) {
      return 'Archived'
    }
  }

  deleteUser(user){
    this.userService.delete(user.id).subscribe(
      response => { this.onSuccessDeleteUser(response); },
      error => { this.OnErrorDeleteUser(error); }
    );
  }

  onSuccessGetUser(response){
    this.user = response.data;
  }

  OnErrorGetUser(error){
    this.router.navigate(['/lifeguard/sub_users' ]);
  }

  onSuccessDeleteUser(response){
    this.alertService.success(response['message'])
    this.router.navigate(['/lifeguard/sub_users' ]);
  }

  OnErrorDeleteUser(error) {
    this.alertService.error(error['error']['message'])
  }

}

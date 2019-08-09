import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionsService } from '../subscriptions.service';
import { AlertService } from '../../services';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-subscription-show',
  templateUrl: './subscription-show.component.html'
})
export class SubscriptionShowComponent implements OnInit {
  user;
  constructor(
    private userService: SubscriptionsService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private spinnerService: Ng4LoadingSpinnerService,
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

  getStatus(user) {
    if(!user.subscription)return 'In Active';
    if (user.status == 0 || user.subscription.status == 0) {
      return 'In Active'
    } else if (user.status == 1 && user.subscription.status == 1) {
      return 'Active'
    }
    return "In Active";
  }
  getType(user) {
    if(!user.subscription)return '';
    return user.subscription.type == 1 ? 'Monthly' : "Annually";
  }

  deleteSubscription(user){
    this.spinnerService.show();
    this.userService.delete(user.id).subscribe(
      response => { 
        this.spinnerService.hide();
        this.onSuccessDeleteUser(response);
      },
      error => { 
        this.spinnerService.hide();
        this.OnErrorDeleteUser(error); 
      }
    );
  }

  onSuccessGetUser(response){
    this.user = response.data;
  }

  OnErrorGetUser(error){
    this.router.navigate(['/lifeguard/users' ]);
  }

  onSuccessDeleteUser(response){
    this.alertService.success(response['message'])
    this.router.navigate(['/lifeguard/subscriptions-manage' ]);
  }

  OnErrorDeleteUser(error) {
    this.alertService.error(error['error']['message'])
  }

}

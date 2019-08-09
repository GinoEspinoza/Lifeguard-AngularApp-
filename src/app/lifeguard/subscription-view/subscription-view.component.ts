import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionsService } from '../subscriptions-manage/subscriptions.service';
import { AlertService , LocalAuthService } from '../services';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-subscription-view',
  templateUrl: './subscription-view.component.html'
})
export class SubscriptionViewComponent implements OnInit {
  user;
  constructor(
    private userService: SubscriptionsService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private spinnerService: Ng4LoadingSpinnerService,
    private authService: LocalAuthService,
  ) { }

  ngOnInit() {
    const id = this.authService.currentUser()['id'];
    this.getUser(id);
  }

  getUser(id){
    this.userService.showUser(id).subscribe(response => {
      this.onSuccessGetSubscription(response);
    },
    error => { this.OnErrorGetSubscription(error); }
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
        this.onSuccessDeleteSubscription(response);
      },
      error => { 
        this.spinnerService.hide();
        this.OnErrorDeleteSubscription(error); 
      }
    );
  }

  onSuccessGetSubscription(response){
    this.user = response.data;
  }

  OnErrorGetSubscription(error){
    this.router.navigate(['/lifeguard/users' ]);
  }

  onSuccessDeleteSubscription(response){
    this.alertService.success(response['message'])
    this.authService.logout()
    .subscribe(
      data => {
        this.router.navigate(['']);
      },
      error => {
        console.log(error)
      });
  }

  OnErrorDeleteSubscription(error) {
    this.alertService.error(error['error']['message'])
  }

}

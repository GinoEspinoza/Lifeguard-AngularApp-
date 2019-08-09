import { Component, OnInit, Input } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.css']
})

export class AlertComponent {
    @Input() id: string;
    @Input() message : string;
    @Input() type : string;
    @Input() showAlert : boolean;

    alert = null;
    subscription:Subscription;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
      this.subscription = this.alertService.messenger$.subscribe((alert) => {
        if (alert && !alert.message) {
          this.alert = null;
          return;
        }
        this.alert = alert;
        this.scrollToAlert();
      });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }

    close() {
      this.alert = null
    }

  scrollToAlert() {
    let alertContainer = document.querySelectorAll('app-navbar');
    const element = alertContainer[0] as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

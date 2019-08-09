// http://jasonwatmore.com/post/2017/06/25/angular-2-4-alert-toaster-notifications
import { Injectable } from '@angular/core';
import { Router, Event, NavigationStart } from '@angular/router';
import { Subscription, Subject, Observable } from 'rxjs';

@Injectable()
export class AlertService {
  private subject = new Subject<any>();
  private keepAfterRouteChange = false;

  messenger$ = this.subject.asObservable();

  constructor(private router:Router) {
    router.events.subscribe( (event:Event) => {
      if(event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          this.keepAfterRouteChange = false;
        } else {
          this.clearAlert();
        }
      }
    });
  }

  success(message: string, keepAfterRouteChange = true) {
    this.sendAlert({ type: 'success', message: message }, keepAfterRouteChange);
  }

  error(message: string, keepAfterRouteChange = true) {
    this.sendAlert({ type: 'danger', message: message }, keepAfterRouteChange);
  }

  info(message: string, keepAfterRouteChange = true) {
    this.sendAlert({ type: 'info', message: message }, keepAfterRouteChange);
  }

  alert(message: string, keepAfterRouteChange = true) {
    this.sendAlert({ type: 'info', message: message }, keepAfterRouteChange);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  sendAlert(alert:any, keepAfterRouteChange = false) {
    this.keepAfterRouteChange = keepAfterRouteChange;
    // setTimeout( ()=>{
      this.subject.next(alert);
    // }, 500 )
  }

  clearAlert(){
    this.sendAlert(null);
  }
}
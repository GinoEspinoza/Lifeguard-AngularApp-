import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { LocalAuthService } from './local-auth.service';
import { AlertService } from '../alert.service';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/do';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(
    private router: Router,
    private alertService : AlertService,
    public auth: LocalAuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.auth.getToken()){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getToken()}`
        }
      });
    }
    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.auth.clearToken();
          this.router.navigate(['/lifeguard/login'], { queryParams: { session: 'expired' }});
          // redirect to the login route
          // or show a modal
        } else if (err.status === 404) {
          this.alertService.error('Record not found')
        }
      }
    });
  }
}
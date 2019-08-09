// TODO: try this https://stackoverflow.com/questions/42719445/pass-parameter-into-route-guard
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from 'selenium-webdriver/http';
import { LocalAuthService } from './local-auth.service';
import { AlertService } from '../alert.service';
import { Subscription } from 'rxjs';
import * as _ from "lodash";

@Injectable()
export class AccessGuard implements CanActivate {
  alertMessage = "success";
  currentRoles;
  currentPermissions;
  subscription: Subscription;

  constructor(
    private router: Router,
    private auth: LocalAuthService,
    private alertService: AlertService,
  ) {
    this.currentRoles = auth.currentUser().roles
                            .map( (role:any) => role.name);
    this.currentPermissions = auth.currentUser().permissions
                             .map( (permission:any) => permission.name);
    this.subscribeToChange();
  }

  private subscribeToChange() {
    this.auth.loggedIn$.subscribe(
      user => {
        if (!user) {
          this.currentRoles = null;
          this.currentPermissions = null;
        } else {
          this.currentRoles = user.roles
                              .map( (role:any) => role.name);
          this.currentPermissions = user.permissions
                              .map( (permission:any) => permission.name);
        }
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let roles = route.data["roles"];
    let permissions = route.data["permissions"];

    if (this.hasPermission(roles, permissions)) {
      return true;
    }
    console.log('denied' + permissions)
    // not logged in so redirect to login page
    this.alertMessage = "Permission Denied";
    this.alertService.error(this.alertMessage);
    this.router.navigate(['/lifeguard/home']);
    return false;
  }

  hasPermission(roles, permissions, operator = '') {
    if (operator == 'exact') {
      if (roles != undefined) {
        if (_.intersection(this.currentRoles, roles).length > 0){
          return true;
        } else { return false }
      }
      if (permissions != undefined) {
        if (_.intersection(this.currentPermissions, permissions).length > 0){
          return true;
        } else { return false }
      }
    }
    if (_.intersection(this.currentPermissions, ['Root']).length > 0) {
      return true;
    }
    if (roles != undefined) {
      if (_.intersection(this.currentRoles, roles).length > 0){
        return true;
      }
    }
    if (permissions != undefined) {
      if (_.intersection(this.currentPermissions, permissions).length > 0){
        return true;
      }
    }
    return false;
    // return this.auth.currentUser().permissions.includes(permissions)
  }
}

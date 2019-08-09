// https://juristr.com/blog/2018/02/angular-permission-directive/
import { Directive, OnInit, ElementRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { LocalAuthService, AccessGuard } from '../services'

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit {
  private roles;
  private permissions;
  private operator;

  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: LocalAuthService,
    private accessService: AccessGuard,
  ) {
  }

  ngOnInit() {
  }

  @Input() set hasPermission(val) {
    this.roles = val['roles'];
    this.permissions = val['permissions'];
    this.operator = val['operator'];
    this.updateView();
  }

  private updateView() {
    if (this.checkPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission() {
    let hasPermission = false;

    if (this.accessService.hasPermission(this.roles, this.permissions, this.operator)) {
      hasPermission = true;
    }

    return hasPermission;
  }
}

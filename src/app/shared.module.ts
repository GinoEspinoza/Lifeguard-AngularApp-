import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './lifeguard/share/alert-message/alert-message.component';
import {
  AlertService,
  AuthGuard} from './lifeguard/services';
import { CompareDirective } from './lifeguard/directives/compare.directive';

@NgModule({
  imports: [ CommonModule ],
  declarations: [AlertComponent, CompareDirective],
  providers: [AlertService, AuthGuard],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlertComponent,
    CompareDirective,
  ]
})
export class SharedModule { }
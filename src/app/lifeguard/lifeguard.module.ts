import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { environment } from '../../environments/environment'
// import { NbSidebarModule, NbLayoutModule, NbSidebarService } from '@nebular/theme';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

import { MqttModule, IMqttServiceOptions, MqttService } from 'ngx-mqtt';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/multiselect.component';
import { NgbModule , NgbDropdownModule, NgbPaginationModule, NgbPaginationConfig , NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import {
  AccordionModule,
  PopoverModule,
  ModalModule,
  BsDropdownModule,
  TypeaheadModule,
  BsDatepickerModule,
} from 'ngx-bootstrap';

import { UiSwitchModule } from 'ngx-toggle-switch';
import {Ng2TelInputModule} from 'ng2-tel-input';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { NgxPayPalModule } from 'ngx-paypal';
import {
  HomeComponent,
  MqttCommunicationComponent,
  LoginComponent,
  RegisterComponent,
  SubscriptionComponent,
  UserCreateComponent,
  OfficeFormComponent,
  ZonesFormComponent,
  CompanyFormComponent,
  CompanyListComponent,
  LayoutComponent,
  LayoutLoginComponent,
  UserService,
  CompanyShowComponent,
  OfficeListComponent,
  OfficeShowComponent,
  ZoneShowComponent,
  ZoneListComponent,
  VendorFormComponent,
  VendorListComponent,
  VendorShowComponent,
  DeviceFormComponent,
  DeviceListComponent,
  DeviceShowComponent,
  LockListComponent,
  LockShowComponent,
  LockFormComponent,
  LockReaderConfigComponent,
  UserListComponent,
  DeviceUserListComponent,
  DeviceUserShowComponent,
  DeviceUserFormComponent,
  DeviceUserEnrollComponent,
  AssignDeviceFormComponent,
  AssignDeviceListComponent,
  AssignDeviceShowComponent,
  ContactUsComponent,
  TicketsComponent,
  TicketService,
  HubComponent,
  HubFormComponent,
  HubShowComponent,
  HeartBeatShowComponent,
  HeartBeatService,
  CameraListComponent,
  CameraShowComponent,
  CameraFormComponent,
  UpdateCameraNameFormComponent,
  PackagesComponent,
  PackagesFormComponent,
  PackagesShowComponent,
  SubscriptionListComponent,
  SubscriptionShowComponent
} from '.';
import { ContactUsService } from './contact-us/contact-us.service';

import { LayoutRoutingModule } from './common-routing.module';
import { SubscriptionViewComponent } from './subscription-view/subscription-view.component';
import { SubscriptionEditComponent } from './subscription-view/subscription-edit.component';

import {
  NavBarComponent,
  SideBarComponent
} from './share';

import {
  LocalAuthService,
  LocalMqttService,
  AuthGuard,
  AccessGuard} from './services';
import { EnrollmentConfigurationFormComponent, EnrollmentConfigurationComponent } from './enrollment-configuration';
import { BasicDeviceConfigurationComponent } from './basic-device-configuration/basic-device-configuration.component';
import { AccessSettingsConfigurationComponent } from './access-settings-configuration/access-settings-configuration.component';
import { BasicDeviceConfigurationFormComponent } from './basic-device-configuration';
import { DoorUnlockComponent } from './door-unlock/door-unlock.component';
import { CompanyService, OfficeService, ZoneService, DeviceService,LockService,DeviceUserService,AssignDeviceService } from './device-creation';
import { DoorUnlockService } from './door-unlock/door-unlock.service';
import {
  UserShowComponent,
  ProfileComponent,
  PasswordUpdateComponent } from './users';
import { SubUserShowComponent, SubUserListComponent , SubUserCreateComponent , SubUserService,SubUserManageComponent } from './sub-users';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { SharedModule } from '../shared.module';
import { ChartsModule } from 'ng2-charts';
import { NgxIpModule } from 'ngx-ip';
import { HeartBeatComponent } from './heart-beat/heart-beat.component';
import { KeysPipe } from '../keys.pipe';
import { GroupComponent , GroupService , GroupShowComponent , GroupFormComponent } from './groups';
import { ScheduleComponent , ScheduleService , ScheduleShowComponent , ScheduleFormComponent, ScheduleAllocComponent,ScheduleAllocLockComponent } from './schedules';
import { EventsComponent } from './events/events.component';
import { EventShowComponent } from './events/event-show.component';
import { EventWatchComponent } from './events/event-watch.component';
import { UserEventsComponent } from './user-events/user-events.component';
import { SubscriptionsService } from './subscriptions-manage';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqttHost, //'lifeguard.php-dev.in',
  port: environment.mqttPort, //8888,
  path: '/',
  protocol: 'wss',
  rejectUnauthorized: false,
  username : 'mqttuser',
  password : 'Wqebak6auH9A'
};

@NgModule({
  declarations: [
    HasPermissionDirective,
    LayoutLoginComponent,
    LayoutComponent,
    NavBarComponent,
    LoginComponent,
    RegisterComponent,
    SubscriptionComponent,
    HomeComponent,
    MqttCommunicationComponent,
    LoginComponent,
    UserCreateComponent,
    CompanyFormComponent,
    CompanyListComponent,
    CompanyShowComponent,
    SideBarComponent,
    EnrollmentConfigurationFormComponent,
    BasicDeviceConfigurationComponent,
    AccessSettingsConfigurationComponent,
    EnrollmentConfigurationComponent,
    EnrollmentConfigurationFormComponent,
    BasicDeviceConfigurationFormComponent,
    DoorUnlockComponent,
    OfficeFormComponent,
    OfficeListComponent,
    OfficeShowComponent,
    ZoneShowComponent,
    ZoneListComponent,
    ZonesFormComponent,
    VendorFormComponent,
    VendorListComponent,
    VendorShowComponent,
    DeviceFormComponent,
    DeviceListComponent,
    DeviceShowComponent,
    LockListComponent,
    LockShowComponent,
    LockFormComponent,
    LockReaderConfigComponent,
    DeviceUserFormComponent,
    DeviceUserListComponent,
    DeviceUserShowComponent,
    DeviceUserEnrollComponent,
    AssignDeviceFormComponent,
    AssignDeviceListComponent,
    AssignDeviceShowComponent,
    UserListComponent,
    UserShowComponent,
    ProfileComponent,
    ContactUsComponent,
    TicketsComponent,
    PasswordUpdateComponent,
    HubComponent,
    HubFormComponent,
    HubShowComponent,
    HeartBeatComponent,
    HeartBeatShowComponent,
    KeysPipe,
    CameraListComponent,
    CameraShowComponent,
    CameraFormComponent,
    UpdateCameraNameFormComponent,
    GroupComponent,
    GroupShowComponent,
    GroupFormComponent,
    ScheduleComponent,
    ScheduleShowComponent,
    ScheduleFormComponent,
    ScheduleAllocComponent,
    ScheduleAllocLockComponent,
    EventsComponent,
    EventShowComponent,
    EventWatchComponent,
    UserEventsComponent,
    SubUserListComponent,
    SubUserShowComponent,
    SubUserCreateComponent,
    SubUserManageComponent,
    PackagesComponent,
    PackagesFormComponent,
    PackagesShowComponent,
    SubscriptionListComponent,
    SubscriptionShowComponent,
    SubscriptionViewComponent,
    SubscriptionEditComponent
  ],
  imports: [
	  ChartsModule,
    // NbLayoutModule,
    // NbSidebarModule,
    FormsModule,
    ReactiveFormsModule,
    MqttModule,
    CommonModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    AngularMultiSelectModule,
    LayoutRoutingModule,
    BsDropdownModule.forRoot(),
    NgbDropdownModule.forRoot(),
    NgbPaginationModule,
    NgbTimepickerModule.forRoot(),
    NgbModule,
    ModalModule.forRoot(),
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      customClass: 'modal-content',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn'
    }),
    AccordionModule.forRoot(),
    TypeaheadModule.forRoot(),
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
    UiSwitchModule,
    SharedModule,
    NgxIpModule,
    BsDatepickerModule.forRoot(),
    Ng2TelInputModule,
    Ng4LoadingSpinnerModule.forRoot(),
    NgxPayPalModule
  ],
  providers: [
    LocalAuthService,
    MqttService,
    LocalMqttService,
    UserService,
    SubUserService,
    AuthGuard,
    AccessGuard,
    // NbSidebarService,
    LockService,
    CompanyService,
    OfficeService,
    ZoneService,
    DeviceService,
    DeviceUserService,
    AssignDeviceService,
    DoorUnlockService,
    ContactUsService,
    TicketService,
    NgbPaginationConfig,
    // NgbTimepickerConfig,
    HeartBeatService,
    GroupService,
    ScheduleService,
    SubscriptionsService
  ],
  

})
export class LifeguardModule { }

import { NgModule, ModuleWithProviders, Component }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  LoginComponent,
  RegisterComponent,
  SubscriptionComponent,
  HomeComponent,
  MqttCommunicationComponent,
  UserCreateComponent,
  CompanyFormComponent,
  CompanyListComponent,
  CompanyShowComponent,
  OfficeListComponent,
  OfficeShowComponent,
  OfficeFormComponent,
  ZoneListComponent,
  ZoneShowComponent,
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
  ContactUsComponent,
  TicketsComponent,
  HubComponent,
  HubFormComponent,
  HubShowComponent,
  HeartBeatComponent,
  HeartBeatShowComponent,
  CameraListComponent,
  CameraShowComponent,
  CameraFormComponent,
  UpdateCameraNameFormComponent,
  PackagesComponent,
  PackagesFormComponent,
  PackagesShowComponent,
  SubscriptionListComponent,
  SubscriptionShowComponent
 }
from '.';

import { AuthGuard, AccessGuard } from './services';

import { LayoutComponent } from './layout.component';
import { EnrollmentConfigurationComponent } from './enrollment-configuration';
import { BasicDeviceConfigurationComponent } from './basic-device-configuration';
import { DoorUnlockComponent } from './door-unlock/door-unlock.component';
import { LayoutLoginComponent } from './layoutlogin.component';
import { UserListComponent } from './users';
import { GroupComponent,GroupShowComponent,GroupFormComponent } from './groups';
import { ScheduleComponent,ScheduleShowComponent,ScheduleFormComponent, ScheduleAllocComponent , ScheduleAllocLockComponent } from './schedules';
import { UserShowComponent, ProfileComponent, PasswordUpdateComponent } from './users';
import { SubUserShowComponent, SubUserListComponent , SubUserCreateComponent , SubUserManageComponent } from './sub-users';
import { EventsComponent } from './events/events.component';
import { EventShowComponent } from './events/event-show.component';
import { EventWatchComponent } from './events/event-watch.component';
import { UserEventsComponent } from './user-events/user-events.component';
import { SubscriptionViewComponent } from './subscription-view/subscription-view.component';
import { SubscriptionEditComponent } from './subscription-view/subscription-edit.component';

const routes: Routes = [
      {
        path: '',
        component: LayoutLoginComponent,
        children: [
          { path: 'login', component: LoginComponent },
          { path: 'register', component: RegisterComponent },
          { path: 'subscription', component: SubscriptionComponent },
          { path: '', component: LoginComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: '',
        component: LayoutComponent,
        children: [
        { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
        { path: 'heart_beat', component: HeartBeatComponent, canActivate: [AuthGuard, AccessGuard] },
        { path: 'heart_beat/:channel', component: HeartBeatShowComponent, canActivate: [AuthGuard, AccessGuard] },
        { path: 'mttq', component: MqttCommunicationComponent, canActivate: [AuthGuard, AccessGuard] },
        { path: 'companies', component: CompanyListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Companies']} },
        { path: 'companies/new', component: CompanyFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Companies']} },
        { path: 'companies/:id', component: CompanyShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Companies']} },
        { path: 'companies/:id/edit', component: CompanyFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Companies']} },
        { path: 'offices', component: OfficeListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Offices']} },
        { path: 'offices/new', component: OfficeFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Offices']} },
        { path: 'offices/:id', component: OfficeShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Offices']} },
        { path: 'offices/:id/edit', component: OfficeFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Offices']} },
        { path: 'zones', component: ZoneListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Zones']} },
        { path: 'zones/new', component: ZonesFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Zones']} },
        { path: 'zones/:id', component: ZoneShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Zones']} },
        { path: 'zones/:id/edit', component: ZonesFormComponent, canActivate: [AuthGuard], data: {permissions: ['Update Zones']} },
        { path: 'vendors', component: VendorListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Vendors']} },
        { path: 'vendors/new', component: VendorFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Vendors']} },
        { path: 'vendors/:id', component: VendorShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Vendors']} },
        { path: 'vendors/:id/edit', component: VendorFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Vendors']} },
        { path: 'devices', component: DeviceListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Inventories']} },
        { path: 'devices/new', component: DeviceFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Inventories']} },
        { path: 'devices/:id', component: DeviceShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Inventories']} },
        { path: 'devices/:id/edit', component: DeviceFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Inventories']} },
        { path: 'locks', component: LockListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Locks']} },
        { path: 'locks/new', component: LockFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Locks']} },
        { path: 'locks/:id', component: LockShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Locks']} },
        { path: 'locks/:id/edit', component: LockFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Locks']} },
        { path: 'locks/:id/set_configs', component: LockReaderConfigComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Locks']} },
        { path: 'cameras', component: CameraListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Camera']} },
        { path: 'cameras/new', component: CameraFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Cameras']} },
        { path: 'cameras/:id', component: CameraShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Camera']} },
        { path: 'cameras/:id/edit', component: CameraFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Cameras']} },
        { path: 'cameras/:id/update-name', component: UpdateCameraNameFormComponent, canActivate: [AuthGuard, AccessGuard], data: { permissions: ['Manage Camera']} },
        { path: 'hubs', component: HubComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Hubs']} },
        { path: 'hubs/new', component: HubFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Hubs']} },
        { path: 'hubs/:id', component: HubShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Hubs']} },
        { path: 'hubs/:id/edit', component: HubFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Hubs']} },
        { path: 'device-users' , component: DeviceUserListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Device Users']} },
        { path: 'device-users/new' , component: DeviceUserFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Device Users']} },
        { path: 'device-users/:id' , component: DeviceUserShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Device Users']} },
        { path: 'device-users/:id/edit' , component: DeviceUserFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Device Users']} },
        { path: 'device-users/:id/enroll' , component: DeviceUserEnrollComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Enroll Device Users']} },
        { path: 'company_devices' , component: AssignDeviceListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Assigned Devices']} },
        { path: 'company_devices/new' , component: AssignDeviceFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Assigned Devices']} },
        { path: 'company_devices/:id' , component: AssignDeviceShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Assigned Devices']} },
        { path: 'company_devices/:id/edit' , component: AssignDeviceFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Assigned Devices']} },
        { path: 'enrollment-configurations/new', component: EnrollmentConfigurationComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Enroll Device Users']} },
        { path: 'basic-device-configuration/new', component: BasicDeviceConfigurationComponent, canActivate: [AuthGuard, AccessGuard] },
        { path: 'door/unlock', component: DoorUnlockComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Doors']} },
        { path: 'users', component: UserListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Cloud Users']} },
        { path: 'users/new', component: UserCreateComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['New Cloud Users']} },
        { path: 'users/:id', component: UserShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Cloud Users']} },
        { path: 'users/:id/edit', component: UserCreateComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Cloud Users']} },
        { path: 'profile/edit', component: ProfileComponent, canActivate: [AuthGuard] },
        { path: 'password-update', component: PasswordUpdateComponent, canActivate: [AuthGuard] },
        { path: 'contact-us', component: ContactUsComponent, canActivate: [AuthGuard] },
        { path: 'tickets', component: TicketsComponent, canActivate: [AuthGuard, AccessGuard], data: { roles: ['Super Admin']} },
        { path: 'groups', component: GroupComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Groups']} },
        { path: 'groups/:id', component: GroupShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Groups']} },
        { path: 'groups/add/new', component: GroupFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Groups']} },
        { path: 'groups/:id/edit', component: GroupFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Groups']} },

        { path: 'schedules', component: ScheduleComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Schedules']} },
        { path: 'schedules/:id', component: ScheduleShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Schedules']} },
        { path: 'schedules/add/new', component: ScheduleFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Add Schedules']} },
        { path: 'schedules/:id/edit', component: ScheduleFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Update Schedules']} },
        
        { path: 'schedules/:id/assign_user', component: ScheduleAllocComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Schedules', 'Add Schedules', 'Update Schedules', 'Delete Schedules']} },
        
        { path: 'schedules/:id/assign_lock', component: ScheduleAllocLockComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Schedules', 'Add Schedules', 'Update Schedules', 'Delete Schedules']} },
        
        { path: 'events', component: EventsComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Device Events']} },
        { path: 'events/:id', component: EventShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Device Events']} },
        { path: 'events/:id/watch', component: EventWatchComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Device Events']} },
        { path: 'user-events', component: UserEventsComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View User Events']} },
        { path: 'sub_users', component: SubUserListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Sub Users']} },
        { path: 'sub_users/new', component: SubUserCreateComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Sub Users']} },
        { path: 'sub_users/:id', component: SubUserShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Sub Users']} },
        { path: 'sub_users/:id/edit', component: SubUserCreateComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Sub Users']} },
        { path: 'sub_users/:id/manage', component: SubUserManageComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Sub Users']} },

        { path: 'subscription/details', component: PackagesComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Pricing']} },
        { path: 'subscription/packages/new', component: PackagesFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Pricing']} },
        { path: 'subscription/packages/:id', component: PackagesShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Pricing']} },
        { path: 'subscription/packages/:id/edit', component: PackagesFormComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['Manage Pricing']} },
        { path: 'subscriptions-manage', component: SubscriptionListComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Subscriptions']} },
        { path: 'subscriptions-manage/:id', component: SubscriptionShowComponent, canActivate: [AuthGuard, AccessGuard], data: {permissions: ['View Subscriptions']} },
        { path: 'subscription-view', component: SubscriptionViewComponent, canActivate: [AuthGuard, AccessGuard], data: { roles: ['Company User']} },
        { path: 'subscription-edit', component: SubscriptionEditComponent, canActivate: [AuthGuard, AccessGuard], data: { roles: ['Company User']} },
      ]
    }
  ];



// export const routing: ModuleWithProviders = RouterModule.forChild(routes);


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
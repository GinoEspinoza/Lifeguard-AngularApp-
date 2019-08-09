import { NgModule, ModuleWithProviders }             from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: "",
    loadChildren: 'src/app/lifeguard/lifeguard.module#LifeguardModule'
  },
  {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule'
  },
  {
    path: 'lifeguard',
    loadChildren: 'src/app/lifeguard/lifeguard.module#LifeguardModule'
  },
  { path: '**', component: PageNotFoundComponent }
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes, config) ]

})

export class AppRoutingModule {}
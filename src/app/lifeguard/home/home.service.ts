import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService } from '../services/auth/local-auth.service';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import {
  API_DOMAIN,
  DASHBOARD_STATS
} from '../api.constants';

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  dashboardStatsUrl = API_DOMAIN + DASHBOARD_STATS;
  response:any;

  constructor(
    private router: Router,
    private authService : LocalAuthService,
    private http: HttpClient,
  ) { }

  getStats() {
    return this.http.get(this.dashboardStatsUrl).map(response => {
      this.response = response
      return this.response
    });
  }
}

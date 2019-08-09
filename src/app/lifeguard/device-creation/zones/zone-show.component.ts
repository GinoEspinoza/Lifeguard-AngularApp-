import { Component, OnInit } from '@angular/core';
import { ZoneService } from './zone.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalAuthService, AlertService } from '../../services';

@Component({
  selector: 'app-zone-show',
  templateUrl: './zone-show.component.html',
  styleUrls: ['./zone-show.component.css']
})

export class ZoneShowComponent implements OnInit {
  zone:any;
  zoneData: any;
  showCompany :boolean = false;

  constructor(
    private route: ActivatedRoute,
    private zoneService: ZoneService,
    private router: Router,
    private authService: LocalAuthService,
    private alertService: AlertService,
  ) {
    this.showCompany = authService.currentCompany() ? false : true;
  }


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getZone(id);
  }

  getZone(id){
    this.zoneService.showZone(id).subscribe(response => {
      this.onSuccessGetZone(response); },
    error => { this.OnErrorGetZone(error); }
    );
  }

  onSuccessGetZone(response){
    this.zone = response.data;
  }

  OnErrorGetZone(error){
    this.alertService.error(error['error']['message']);
  }

  deleteZone(zone){
    this.zoneService.delete(zone.id).subscribe(response => {
      this.onSuccessDeleteZone(response); },
    error => { this.OnErrorGetZone(error); }
    );
  }

  onSuccessDeleteZone(response){
    this.router.navigate(['zones']);
  }

}

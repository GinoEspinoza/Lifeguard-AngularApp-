import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService } from '../services/auth/local-auth.service';
import { HomeService } from './home.service';

declare  let videojs :  any ;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  isSuperUser:boolean = false;
  isCompanyUser:boolean = false;
  stats: any = {}
  barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels:string[] = ['2016', '2017', '2018'];
  barChartType:string = 'bar';
  barChartLegend:boolean = true;

  barChartData:any[] = [
    {data: [65, 59, 80], label: 'Devices Inventory'},
    {data: [28, 48, 40], label: 'Devices Installed'}
  ];

  lineChartData:Array<any> = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Users Added'},
    {data: [18, 48, 77, 9, 100, 27, 40], label: 'Users Enrolled'}
  ];
  lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  lineChartOptions:any = {
    responsive: true
  };
  lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  lineChartLegend:boolean = true;
  lineChartType:string = 'line';
  videoDomain = 'https://stream.lgsecurities.com:8011/live/:streamKey.m3u8';
  vidObjs = []

  @ViewChildren('streamItems') streamItems: QueryList<any>

  constructor(
    private router: Router,
    private authService: LocalAuthService,
    private homeService: HomeService,
  ) { }

  ngOnInit() {
    this.isSuperUser = this.authService.isAdmin();
    this.isCompanyUser = !this.authService.isAdmin();
    this.setStats();
  }

  setStats() {
    this.homeService.getStats().subscribe(
      response => {
        this.stats = response['data'];
        if (this.isCompanyUser) {
          this.stats.camera_streams = this.stats.camera_streams.filter((e)=> { return e})
        }
        console.log(response)
      },
      data => { console.log(data) }
    )
  }

  ngAfterViewInit(){
    const options = {
      controls: true ,
      autoplay: false ,
      preload: 'none' ,
      techOrder: ['html5']
    };
    this.streamItems.changes.subscribe(queryList => {
      this.stats.camera_streams.map((videoUrl, i) => {
        this.vidObjs.push(new videojs(document.getElementById("stream-"+i), options, function(){
          videojs.log('Your player is ready!');
        }))
      });
    })
  }

  getStreamUrl(key) {
    return this.videoDomain.replace(':streamKey', key);
  }

}

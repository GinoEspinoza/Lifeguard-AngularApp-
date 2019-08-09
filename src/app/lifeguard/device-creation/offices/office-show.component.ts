import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OfficeService } from './office.service';
import { LocalAuthService, AlertService } from '../../services';

@Component({
  selector: 'app-office-show',
  templateUrl: './office-show.component.html',
  styleUrls: ['./office-list.component.css']
})
export class OfficeShowComponent implements OnInit {

  office:any;
  companyData: any;
  showCompany :boolean = false;

  constructor(
    private route: ActivatedRoute,
    private officeService: OfficeService,
    private router: Router,
    private authService: LocalAuthService,
    private alertService: AlertService,
  ) {
    this.showCompany = authService.currentCompany() ? false : true;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getOffice(id);
  }

  getOffice(id){
    this.officeService.getOffice(id).subscribe(response => {
      this.onSuccessGetOffice(response); },
    error => { this.OnErrorGetOffice(error); }
    );
  }

  onSuccessGetOffice(response){
    this.office = response.data;
  }

  OnErrorGetOffice(error){
    this.alertService.error(error.error.message)
  }

  deleteOffice(Office){
    this.officeService.delete(Office.id).subscribe(response => {
      this.onSuccessDeleteOffice(response); },
    error => { this.OnErrorGetOffice(error); }
    );
  }

  onSuccessDeleteOffice(response){
    this.router.navigate(['/lifeguard/office/list']);
  }


}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from './company.service';
import { AlertService } from '../../services';

@Component({
  selector: 'app-company-show',
  templateUrl: './company-show.component.html',
  styleUrls: []
})

export class CompanyShowComponent implements OnInit {
  company:any;
  companyData: any;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getCompany(id);
  }

  getCompany(id){
    this.companyService.showCompany(id).subscribe(response => {
      this.onSuccessGetCompany(response); },
    error => { this.OnErrorGetCompany(error); }
    );
  }

  onSuccessGetCompany(response){
    this.company = response.data;
  }

  OnErrorGetCompany(error){
    this.alertService.error(error['error']['message']);
  }

  deleteCompany(company){
    this.companyService.delete(company.id).subscribe(response => {
      this.onSuccessDeleteCompany(response); },
    error => { this.OnErrorGetCompany(error); }
    );
  }

  onSuccessDeleteCompany(response){
    this.alertService.success(response['message']);
    this.router.navigate(['companies']);
  }
}

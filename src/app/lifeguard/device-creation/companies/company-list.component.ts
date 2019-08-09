import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from './company.service';
import { AlertService, LocalAuthService } from '../../services';
import { HistoryService } from '../../user-events/history.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit {

  searchForm: FormGroup;
  companyList:any;
  company:any;
  totalItems;
  currentPage;
  pageSize = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private alertService: AlertService,
	  private formBuilder: FormBuilder,
	  private historyService: HistoryService,
    private authService: LocalAuthService,
  ) { }

  ngOnInit() {
    this.getCompanies({ page: 1 });
    this.searchForm = this.formBuilder.group({
      search: ['']
	});
    let userId = this.authService.currentUser()['id'];
	  this.historyService.addHistory(userId, 'Company', 'List').subscribe(response => {
        console.log(response);
      },
      error => {
        console.log(error);
      }
	  );
  }

  onSucessGetCompanies(response){
    this.companyList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  getCompany(id){
    this.companyService.showCompany(id).subscribe(response => {
      this.company = response.data
    },
    error => { this.onErrorGetCompany(error); }
    );
  }

  onSuccessGetCompany(response){
    this.company = response['data'];
  }

  onErrorGetCompany(error){
    this.alertService.error(error.error.message);
  }

  deleteCompany(company){
    this.companyService.delete(company.id).subscribe(response => {
      this.onSuccessDeleteCompany(response); },
    error => { this.onErrorGetCompany(error); }
    );
  }

  onSuccessDeleteCompany(response){
    this.alertService.success(response['message'])
    this.getCompanies({ page: this.currentPage });
  }

  getCompanies(params){
    this.companyService.getCompanies(params).subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.onErrorGetCompany(error); }
    );
  }

  pageChanged(page) {
    this.getCompanies({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    this.getCompanies(formData)
  }

}

import { Component, OnInit } from '@angular/core';
import { COMPANY_NAME } from '../../constants/company.constant';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS } from '../../constants/drop-down.constants';
import { LocalAuthService } from './../../services';
import { NavigationEnd, Router } from '@angular/router';
import { CompanyService } from '../../device-creation/companies/company.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavBarComponent implements OnInit {

  companyName = COMPANY_NAME;
  companyList = [];
  companyDropdownSettings;
  selectedCompany;
  pushRightClass: string = 'push-right';
  type = 'success';
  alertMessage = "success";
  showAlert :boolean = false;

  constructor(
    private localAuthService: LocalAuthService,
    public  router: Router,
    private companyService: CompanyService
  ) {
    this.router.events.subscribe(val => {
    if (
        val instanceof NavigationEnd &&
        window.innerWidth <= 992 &&
        this.isToggled()
    ) {
        this.toggleSidebar();
      }
    });
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
   }

  ngOnInit() {
    this.getCompanies();
    if (this.localAuthService.currentCompany()) {
      this.selectedCompany = [this.localAuthService.currentCompany()];
    }
  }

  logout(){
    this.localAuthService.logout()
    .subscribe(
      data => {
        this.router.navigate(['']);
      },
      error => {
        console.log(error)
      });
}

  isLoggedIn(){
    if(this.localAuthService.getToken()){
      return true
    }else{
      return false
    }
  }

  currentUser(){
    return this.localAuthService.currentUser()
  }

  userName(){
    if(this.currentUser() !== undefined && this.currentUser() !== null ){ return this.currentUser().name }
  }


  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }

  onLoggedout() {
     localStorage.removeItem('isLoggedin');
  }

  changeLang(language: string) {
    // this.translate.use(language);
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => { this.companyList = response['data']; },
      error => { this.OnErrorGetCompanies(error); }
    );
  }

  OnErrorGetCompanies(error){
    this.type = 'danger';
    this.alertMessage = error.error.message;
    this.showAlert = true;
  }

  onCompanySelect(item:any) {
    this.localAuthService.setCurrentCompany(item);
    this.router.navigate(['/lifeguard/home']);
  }
  OnCompanyDeSelect(item:any){
    this.localAuthService.setCurrentCompany(null);
    this.router.navigate(['/lifeguard/home']);
  }

}

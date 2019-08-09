import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService, AlertService } from '../services';
import { TicketService } from './ticket.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../device-creation/companies/company.service';
import { UserService } from '../users/user.service';
import { COMPANY_DROPDOWN_SETINGS, USER_DROPDOWN_SETINGS } from '../constants/drop-down.constants';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  ticketList = [];
  modalRef: BsModalRef;
  searchForm: FormGroup;
  ticket:any;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  companyDropdownSettings = {};
  dropdownUserList = [];
  userDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  dropdownPriorityList = [];
  priorityDropdownSettings = {};

  constructor(
    private router: Router,
    private authService: LocalAuthService,
    private alertService: AlertService,
    private ticketService: TicketService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private userService: UserService
  ) { 
      this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
      this.userDropdownSettings = USER_DROPDOWN_SETINGS;
      this.statusDropdownSettings = {
        singleSelection: true,
        labelKey:'name',
        text:"Select Status",
        classes:"myclass custom-class",
        noDataLabel: 'No Status Found.'
      };
      this.priorityDropdownSettings = {
        singleSelection: true,
        labelKey:'name',
        text:"Select Priority",
        classes:"myclass custom-class",
        noDataLabel: 'No Priority Found.'
      };
    }

  ngOnInit() {
    this.getTickets({ page: 1 });
    this.getCompanies();
    this.getUsers();
    this.dropdownStatusList = [
      { id: 1, name: 'Read' },
      { id: 0, name: 'Unread' },
      { id: 2, name: 'Archive' }
    ];
    this.dropdownPriorityList = [
      { id: 0, name: 'Low' },
      { id: 1, name: 'Medium' },
      { id: 2, name: 'High' }
    ];
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      userId: [[]],
      status: [[]],
      priority: [[]]
    });
  }

  onSucessGetTickets(response){
    this.ticketList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  OnErrorGetTickets(error){
    this.alertService.error(error['error']['message']);
  }

  getTickets(params){
    this.ticketService.getTickets(params).subscribe(
      response => {
        this.onSucessGetTickets(response);
      },
      error => { this.OnErrorGetTickets(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorGetTickets(error); }
    );
  }

  getUsers(){
    this.userService.getUsers({ per_page: -1 }).subscribe(
      response => {
        this.dropdownUserList = response['data'];
      },
      error => { this.OnErrorGetTickets(error); }
    );
  }

  onCompanySelect(item:any){

  }

  onUserSelect(item:any){

  }

  onStatusSelect(item:any){

  }

  onPrioritySelect(item:any){

  }

  pageChanged(page) {
    this.getTickets({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(formData['companyId'] && formData['companyId'][0]) {
      formData['company_id'] = formData['companyId'][0]['id']
    } else {
      delete formData['company_id'];
    }
    if(formData['userId'] && formData['userId'][0]) {
      formData['user_id'] = formData['userId'][0]['id']
    } else {
      delete formData['user_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    if(formData['priority'] && formData['priority'][0]) {
      formData['priority'] = formData['priority'][0]['id']
    } else {
      delete formData['priority'];
    }
    this.getTickets(formData)
  }
  
  getStatus(ticket) {
    if (ticket.status == 0) {
      return 'Unread'
    } else if (ticket.status == 1) {
      return 'Read'
    } else if (ticket.status == 2) {
      return 'Archived'
    }
  }

  getBadgeStatus(ticket) {
    if (ticket.status == 0) {
      return 'info'
    } else if (ticket.status == 1) {
      return 'secondary'
    } else if (ticket.status == 2) {
      return 'danger'
    }
  }

  getPriority(ticket) {
    if (ticket.priority == 0) {
      return 'Low'
    } else if (ticket.priority == 1) {
      return 'Medium'
    } else if (ticket.priority == 2) {
      return 'High'
    }
  }

  getBadgePriority(ticket) {
    if (ticket.priority == 0) {
      return 'info'
    } else if (ticket.priority == 1) {
      return 'warning'
    } else if (ticket.priority == 2) {
      return 'danger'
    }
  }

  markStatus(status:string, ticket:any) {
    this.ticketService.update(ticket, {status: status}).subscribe(
      response=> {
        this.alertService.success(response['message']);
        ticket.status = status;
        ticket.ref.hide()
      },
      error=> {
        this.alertService.error(error['error']['message']);
        ticket.ref.hide()
      }
    )
  }

  setPriority(priority:string, ticket:any) {
    this.ticketService.update(ticket, {priority: priority}).subscribe(
      response=> {
        this.alertService.success(response['message']);
        ticket.priority = priority;
        ticket.ref.hide()
      },
      error=> {
        this.alertService.error(error['error']['message']);
        ticket.ref.hide()
      }
    )
  }

  showMessage(ticket:any, template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: true });
    this.modalRef['ticket'] = ticket;
  }

}

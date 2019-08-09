import { Component, OnInit } from '@angular/core';
import { HistoryService } from './history.service';
import { CompanyService } from '../device-creation/companies/company.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS } from '../constants/drop-down.constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-user-events',
  templateUrl: './user-events.component.html',
  styleUrls: ['./user-events.component.css']
})
export class UserEventsComponent implements OnInit {
	
	searchForm: FormGroup;
	histories = [];
	pdf_histories = [];
	companyList = [];
	selectedCompany;
	companyDropdownSettings;
	actionList = [];
	actionDropdownSettings;
	
	totalItems;
	currentPage;
	pageSize = 10;
	
	constructor(
		private historyService: HistoryService,
		private companyService: CompanyService,
		private formBuilder: FormBuilder,
	) { 
		this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
	}

	ngOnInit() {
		this.getHistory({ page: 1 });
		this.searchForm = this.formBuilder.group({
			search_user: [''],
			search_action_date: [''],
			search_company: [''],
			search_action: [''],
		});
		this.getCompanies();
		this.actionList = [
			{'id': 'index', 'name': 'List'}, 
			{'id': 'show', 'name': 'View'}, 
			{'id': 'store', 'name': 'Create'}, 
			{'id': 'update', 'name': 'Update'}, 
			{'id': 'destroy', 'name': 'Delete'},
			{'id': 'login', 'name': 'Login'},
		];
		this.actionDropdownSettings = {
			singleSelection: true,
			labelKey:'name',
			text:"Select Action",
			selectAllText:'Select All',
			unSelectAllText:'UnSelect All',
			enableSearchFilter: true,
			classes:"myclass custom-class",
			// badgeShowLimit:3,,
			noDataLabel: 'No Action Found.'
		};
	}
	
	getHistory(params) {
		console.log(params);
		let postBody = {};
		if (params['page']) {
			postBody['page'] = params['page'];
		}
		if (params['search_action_date']) {
			const dt = params['search_action_date'];
			const y = dt.getFullYear(), m = dt.getMonth()+1, d = dt.getDate();
			postBody['action_date'] = y + '-' + (m<10 ? '0'+m : m) + '-' + (d<10 ? '0'+d : d);
		}
		if (params['search_company']) {
			if (params['search_company'].length > 0) {
				postBody['company_id'] = params['search_company'][0].id;	
			}
		}
		if (params['search_user']) {
			postBody['search_user'] = params['search_user'];
		}
		if (params['search_action']) {
			if (params['search_action'].length > 0)
			postBody['search_action'] = params['search_action'][0].id;
		}
		if (params['pdf'] && params['pdf']==1) {
			postBody['pdf'] = 1;
		}
		
		this.historyService.getHistory(postBody).subscribe(
			response => {
				console.log('coming from history api', response);
				if (postBody['pdf']==1) {
					this.pdf_histories = response['data'];
					this.savePDF();
				} else {
					this.histories = response['data'];
					this.totalItems = response['total'];
					this.currentPage = response['current_page'];
					this.pageSize = response['per_page'];	
				}
			},
			error => { this.onError(error); }
		);
	}
	
	getCompanies(){
		this.companyService.getCompanies({ per_page: -1 }).subscribe(
			response => { this.companyList = response['data']; },
			error => { this.onError(error); }
		);
	}
	  
	onError(error){
		console.log(error);
	}
	
	getDisplayActionName(h) {
		const cname = h.controller.indexOf('Controller')>-1 ? h.controller.substring(0, h.controller.length-10): h.controller;
		if (h.action == 'index') {
			return 'List (' + cname +')';
		} else if (h.action == 'show' || h.action == 'viewDashboardStats') {
			return 'View (' + cname +')';
		} else if (h.action == 'update') {
			return 'Update (' + cname +')';
		} else if (h.action == 'store') {
			return 'Create (' + cname +')';
		} else if (h.action == 'destroy') {
			return 'Delete (' + cname +')';
		} else {
			return h.action.charAt(0).toUpperCase() + h.action.slice(1) + ' (' + cname +')';
		}
	}

	pageChanged(page) {
		this.getHistory({ page: page, ...this.searchForm.value })
	}
	
	onSearch(formData) {
		this.getHistory(formData)
	}
	
	onExport() {
		this.getHistory({ 'pdf': 1, ...this.searchForm.value })
	}
	
	savePDF() {
		var doc = new jsPDF();
		let tableBody = [];
		this.pdf_histories.forEach(h => {
			let row = [];
			row.push(h.user.name);
			row.push(h.user.company.name);
			row.push(h.user.email);
			row.push(this.getDisplayActionName(h));
			row.push(h.event_time);
			tableBody.push(row);
		});
		doc.autoTable({
			head: [['UserName', 'Company', 'Email', 'Action', 'Time']],
			body: tableBody
		});
		doc.save('table.pdf');
	}
}
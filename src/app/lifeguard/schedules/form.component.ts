import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { AlertService, LocalMqttService } from './../services';
import { ScheduleService } from './schedule.service';
import { COMPANY_DROPDOWN_SETINGS,SCHEDULE_TYPE_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { CompanyService } from '../device-creation/companies/company.service';
import { FULL_WEEK_DAYS } from '../constants/schedule.constant';
import { IMqttMessage } from 'ngx-mqtt';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-schedule-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class ScheduleFormComponent implements OnInit {

	scheduleForm: FormGroup;
	scheduleId:any;
	companyDropdownList = [];
	companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
	typeDropdownSettings = SCHEDULE_TYPE_DROPDOWN_SETINGS;
	typeDropdownlist = [
		{
			id:0,
			name:'Week',
		},
		{
			id:1,
			name:'Day',
		}
	];
	WEEKDAYS = FULL_WEEK_DAYS;
	subscription:any;
	interval;
	clientId = '_' + Math.floor(Math.random()*1E16);
	mqttData:any;
	stop_interval = false;
	message:any;
	subscribe_success:any;
	subscribe_error:any;
	weekRequired = false;
	dayRequired = false;

  @Input() schedule:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private scheduleService: ScheduleService,
    private companyService: CompanyService,
	private alertService: AlertService,
	private localMqttService: LocalMqttService,
	private spinnerService: Ng4LoadingSpinnerService
  ) {
  }

  	ngOnInit() {
		const id = this.route.snapshot.paramMap.get('id');
		this.scheduleForm = this.formBuilder.group({
			company: [[], Validators.required],
			name: ['', Validators.required],
			weekdays: new FormArray([], minSelectedCheckboxes(1)),
			start_time: ['', Validators.required],
			end_time: ['', Validators.required],
			status: [true],
			repeat: [''],
			start_day:['', Validators.required],
			end_day:['', Validators.required],
			type:[[], Validators.required],
		});
		if (id !== null && id !== undefined){
			this.scheduleId = id;
			this.getSchedule(id)
		} else {
			this.addWeekdaysControl("0,0,0,0,0,0,0");
		}
		this.getCompanies();
		this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
	}
	ngOnDestroy() {
			this.subscription.unsubscribe();
	}
	get formData() { return <FormArray>this.scheduleForm.controls.weekdays; }
  // convenience getter for easy access to form fields
	get f() { return this.scheduleForm.controls; }

	onSubmit() {
		// stop here if form is invalid
		if (this.invalidForm()) {
			return;
		}
		const leadingZero = d => d < 10 ? '0'+d : d;
		
		let formData = this.scheduleForm.value;
		console.log('form values', formData);
		formData.companyId = formData.company[0].id;
		formData.typeId = formData.type[0].id;
		formData.weekdays = typeof formData.weekdays === 'string' ? formData.weekdays : formData.weekdays.map(w => w ? 1 : 0).join(',');
		// formData.ikl = formData.weekdays.map(w => w ? 1 : 0).join(',');
		formData.status = formData.status ? '1' : '0';
		formData.repeat = formData.repeat ? '1' : '0';
		formData.start_time = typeof formData.start_time === 'string' ? formData.start_time : leadingZero(formData.start_time.hour) + ':' + leadingZero(formData.start_time.minute) + ':00';
		formData.end_time = typeof formData.end_time === 'string' ? formData.end_time : leadingZero(formData.end_time.hour) + ':' + leadingZero(formData.end_time.minute) + ':00';
		if (formData['start_day']) {
			const dt = formData['start_day'];
			if(typeof dt == "string"){
				formData.start_day = dt;
			}else{
				const y = dt.getFullYear(), m = dt.getMonth()+1, d = dt.getDate();
				formData.start_day = y + '-' + (m<10 ? '0'+m : m) + '-' + (d<10 ? '0'+d : d);
			}
		}
		if (formData['end_day']) {
			const dt = formData['end_day'];
			if(typeof dt == "string"){
				formData.end_day = dt;
			}else{
				const y = dt.getFullYear(), m = dt.getMonth()+1, d = dt.getDate();
				formData.end_day = y + '-' + (m<10 ? '0'+m : m) + '-' + (d<10 ? '0'+d : d);
			}
		}
		this.subscribe_success = response => {
			let id = response['data']['id']
			this.alertService.success(response['message']);
			this.router.navigate(['/lifeguard/schedules/'+ id ]);
		};
		this.subscribe_error = error => {
			this.alertService.error(error['error']['message']);
		}
    if (this.schedule == undefined){
      	this.scheduleService.create(formData)
      	.subscribe(
					response => this.subscribe_success(response),
					error => this.subscribe_error(error)
				);
    } else {
		if(this.schedule.type != formData.typeId){
			this.alertService.error('You cannot change the type of schedule as there are related locks.');
			return;
		}
		this.updateSchedule(formData)
	}
  }
  	updateSchedule(formData){
		this.stop_interval = false;
		let message = this.getMqttInput("updateschedule",formData);
		console.log(message);
		let companyName = this.schedule.company.channel_name.toLowerCase();
		this.subscription.unsubscribe();
		this.subscription = this.subscribeMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    	this.interval = setInterval(()=> {
			intervalCounter = intervalCounter + 1;
			this.alertService.clearAlert();
			if (this.mqttData && !this.stop_interval) {
				if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 ) {
						clearInterval(this.interval);
						this.scheduleService.update(this.schedule , formData)
						.subscribe(
							response => this.subscribe_success(response),
							error => this.subscribe_error(error)
						);
			}
			} else if (intervalCounter == 10) {
				clearInterval(this.interval);
				this.spinnerService.hide();
				this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
			}
		}, 1000);
	}
  	getSchedule(id){
		this.scheduleService.showSchedule(id).subscribe(response => {
			console.log('schedule', response.data);
			this.schedule = response.data;
			this.populatedFormValues(this.schedule);
		},
      	error => {
			this.alertService.error(error['error']['message']);
		}
    );
  }
  
  populatedFormValues(schedule){
	if(schedule.type == 0){
		const arr_start_time = schedule.start_time.split(':');
		const arr_end_time = schedule.end_time.split(':');
		
		this.scheduleForm.patchValue({
			name: schedule.name,
			status: schedule.status == '1',
			company: [schedule.company],
			start_time: {
				hour: parseInt(arr_start_time[0]),
				minute: parseInt(arr_start_time[1]),
				second: parseInt(arr_start_time[2])
			},
			end_time: {
				hour: parseInt(arr_end_time[0]),
				minute: parseInt(arr_end_time[1]),
				second: parseInt(arr_end_time[2])
			},
			type:[this.typeDropdownlist[schedule.type]]
		})
		this.addWeekdaysControl(schedule.weekday);
	}else if(schedule.type == 1){
		this.scheduleForm.patchValue({
			name: schedule.name,
			status: schedule.status == '1',
			company: [schedule.company],
			start_day: new Date(schedule.start_day),
			end_day: new Date(schedule.end_day),
			repeat:schedule.repeat == 1,
			type:[this.typeDropdownlist[schedule.type]]
		})
	}
	this.onTypeSelect(this.typeDropdownlist[schedule.type]);
  }
  
  private addWeekdaysControl(str_weekdays) {
	const arr_weekdays = str_weekdays.split(',');
	
	this.WEEKDAYS.map((o, i) => {
		const control = new FormControl(arr_weekdays[i]==1);
		(this.scheduleForm.controls.weekdays as FormArray).push(control);
	});
  }

  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(response => {
			this.companyDropdownList = response.data;
			console.log(this.companyDropdownList);
		}, error => { 
			this.alertService.error(error.message); 
		}
    );
	}
	getMqttInput(cmd:any,formData){
		let userInput : string;
		let company = this.schedule.company.channel_name;
		let schedule_id = this.schedule.id;
		let weekdays = formData.weekdays;
		userInput = this.clientId + '|' + company + '|' + schedule_id + '|' + weekdays + '|1|'+cmd+'|' + formData.start_time + '|' + formData.end_time;

		if(this.schedule.type == 0){
			let weekdays = formData.weekdays;
			userInput = this.clientId + '|' + company + '|' + schedule_id + '|' + weekdays + '|' + 1 + '|'+cmd+'|' + formData.start_time + '|' + formData.end_time + "|" + formData.typeId;
		}else if(this.schedule.type == 1){
			userInput = this.clientId + '|' + company + '|' + schedule_id + '|' + this.schedule.repeat + '|' + 1 + '|'+cmd+'|' + formData.start_day + '|' + formData.end_day + '|' + formData.typeId;
		}
		return userInput.toLowerCase();
	}
	subscribeMQTTChannel(company: string){
		return this.localMqttService.observe1(`device/${company}`)
			.subscribe((message: IMqttMessage) => {
			this.message = message.payload.toString();
					this.mqttData = JSON.parse(this.message);
					console.log("mqtt",this.mqttData);
			if (this.clientId != this.mqttData['client-id']){
				return
			}
			if (this.mqttData["response-code"]) {
				this.mqttData = false;
				this.alertService.error("Sorry, we were unable to connect to the hub.");
			}
		})
	}
	onTypeSelect($event){
		if($event.id == 0){
			this.weekRequired = true;
			this.dayRequired = false;
		}else if($event.id == 1){
			this.weekRequired = false;
			this.dayRequired = true;
		}
	}
	onTypeDeSelect($event){
		this.weekRequired = false;
		this.dayRequired = false;
	}
	invalidForm(){
		let formData = this.scheduleForm.value;
		// console.log(formData);
		if(formData.company.length && formData.name && formData.type.length){
			if(formData.type[0].id == 0 && formData.start_time && formData.end_time){
				return false;
			}else if(formData.type[0].id == 1 && formData.start_day && formData.end_day){
				return false;
			}
		}else{
			return true;
		}
		return true;
	}
}

function minSelectedCheckboxes(min = 1) {
	const validator: ValidatorFn = (formArray: FormArray) => {
	  const totalSelected = formArray.controls
		// get a list of checkbox values (boolean)
		.map(control => control.value)
		// total up the number of checked checkboxes
		.reduce((prev, next) => next ? prev + next : prev, 0);
  
	  // if the total is not greater than the minimum, return the error message
	  return totalSelected >= min ? null : { required: true };
	};
  
	return validator;
}
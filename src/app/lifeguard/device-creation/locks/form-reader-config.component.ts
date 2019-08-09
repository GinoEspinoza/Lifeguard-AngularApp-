import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from './../../services';
import { Reader_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { LockService } from './lock.service';
import { CompanyService } from '../companies/company.service';
import { OfficeService } from '../offices/office.service';
import { IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-form',
  templateUrl: './form-reader-config.component.html',
  styleUrls: ['./form.component.css']
})
export class LockReaderConfigComponent implements OnInit {

  readerConfigForm: FormGroup;
  returnUrl: string;
  lock:any;
  lockId:any;
  companySelected:any;
  subscription:any;
  interval;
  message:any;
  mqttData:any;
  readerDropdownSettings:any;
  clientId = '_' + Math.floor(Math.random()*1E16);
  reader1List:any;
  reader2List:any;
  reader3List:any;
  doorAccessModeList:any;
  doorEntryExitModeList:any;
  readerAccessModeList:any;
  readerEntryExitModeList:any;
  selectedReader1:any;
  selectedReader2:any;
  selectedReader3:any;
  selectedDoorMode:any;
  selectedDoorEntryExitMode:any;
  selectedReaderAccessMode:any;
  selectedReaderEntryExitMode:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private localMqttService: LocalMqttService,
    private authService: LocalAuthService,
  ) {
    this.readerDropdownSettings = Reader_DROPDOWN_SETINGS;
    this.reader1List = [
      { id: '0', name: 'None' },
      { id: '1', name: 'EM Prox Reader' },
      { id: '2', name: 'HID Prox Reader' },
      { id: '3', name: 'MiFare Reader' },
      { id: '4', name: 'HID iCLASS-U Reader' },
      { id: '5', name: 'HID iCLASS-W Reader' },
    ]
    this.reader2List = [
      { id: '0', name: 'None' },
      { id: '1', name: 'Finger Reader' },
      { id: '2', name: 'Palm Vein Reader' },
    ]
    this.reader3List = [
      { id: '0', name: 'None' },
      { id: '1', name: 'EM Prox Reader' },
      { id: '2', name: 'HID Prox Reader' },
      { id: '3', name: 'MiFare U Reader' },
      { id: '4', name: 'HID iCLASS-U Reader' },
      { id: '5', name: 'Finger Reader' },
      { id: '6', name: 'HID iCLASS-W Reader' },
      { id: '7', name: 'UHF Reader' },
      { id: '8', name: 'Combo Exit Reader' },
      { id: '9', name: 'MiFare-W Reader' },
    ]
    this.doorAccessModeList = [
      { id: '0', name: 'Card' },
      { id: '1', name: 'Finger' },
      { id: '2', name: 'Card + PIN' },
      { id: '3', name: 'PIN + Finger' },
      { id: '4', name: 'Card + Finger' },
      { id: '5', name: 'Card + PIN + Finger' },
      { id: '6', name: 'Any' },
      { id: '7', name: 'Palm' },
      { id: '8', name: 'Palm + PIN' },
      { id: '9', name: 'Card + Palm' },
      { id: '10', name: 'Card + PIN + Palm' },
      { id: '11', name: 'Palm + Group (Optional)' },
      { id: '12', name: 'Finger then Card' },
      { id: '13', name: 'Palm then Card' },
    ]
    this. doorEntryExitModeList = [
      { id: '0', name: 'Entry' },
      { id: '1', name: 'Exit' }
    ]
    this.readerAccessModeList = [
      { id: '0', name: 'Card' },
      { id: '1', name: 'Finger' },
      { id: '4', name: 'Card + Finger' },
      { id: '6', name: 'Any' },
      { id: '12', name: 'Finger then Card' },
    ]
    this.readerEntryExitModeList = [
      { id: '0', name: 'Entry' },
      { id: '1', name: 'Exit' }
    ]
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.readerConfigForm = this.formBuilder.group({
      reader1: [[]],
      reader2: [[]],
      reader3: [[]],
      doorAccessMode: [[]],
      doorEntryExitMode: [[]],
      readerAccessMode: [[]],
      readerEntryExitMode: [[]],
    });
    this.lockId = id;
    this.getLock(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.interval);
  }

  // convenience getter for easy access to form fields
  get f() { return this.readerConfigForm.controls; }

  onSubmit(formData) {
    let message = this.getMqttInput(formData)
    console.log(message)
    let companyName = this.lock.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannelSET(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.mqttData) {
        clearInterval(this.interval);
      } else if (intervalCounter == 10) {
        clearInterval(this.interval);
        this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
      }
    }, 1000);
  }

  getMqttInput(lockForm:any){
    let userInput : string;
    let company = this.lock.company.channel_name;
    let office = this.lock.office.name;
    let zone = this.lock.zone.name;
    let device = this.lock.device_name;
    let timestamp = Date.now();
    let data = [
      lockForm.reader1[0].id, lockForm.reader2[0].id,
      lockForm.reader3[0].id, lockForm.doorAccessMode[0].id,
      lockForm.doorEntryExitMode[0].id, lockForm.readerAccessMode[0].id,
      lockForm.readerEntryExitMode[0].id
    ].join('|')

    userInput = this.clientId + '|' + company + '|' + office + '|' + zone + '|' + device + '|setreaderconfig|' + this.lock.ip + '|' + data + '|' + timestamp;

    return userInput.toLowerCase();
  }

  subscribeMQTTChannelGET(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      console.log('subscribeMQTTChannelGET', this.message);
      this.mqttData = JSON.parse(this.message);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"] != 0) {
        this.mqttData = false;
        clearInterval(this.interval);
        this.alertService.error("Sorry, we were unable to add this lock at the moment. Please contact support.");
      }
      console.log('subscribeMQTTChannelGET 1', this.mqttData)
      this.populatedFormValues(this.mqttData);
    })
  }

  subscribeMQTTChannelSET(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      console.log(this.mqttData)
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"] != 0) {
        this.mqttData = false;
        clearInterval(this.interval);
        this.alertService.error("Sorry, we were unable to update the configuration at the moment. Please contact support.");
        return;
      }
      this.router.navigate(['/lifeguard/locks/' ]);
      this.alertService.success('Lock Configuration updated successfully.');
    })
  }

  getLock(id: any): any {
    this.lockService.getLock(id).subscribe(response => {
      this.onSucessGetLock(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetLock(response){
    this.lock = response.data;
    this.getMqttReaderConfig(this.lock)
    // this.populatedFormValues(this.lock)
  }

  getMqttReaderConfig(lock) {
    let message;
    let userInput : string;
    let company = lock.company.channel_name;
    let office = lock.office.name;
    let zone = lock.zone.name;
    let device = lock.device_name;
    let timestamp = Date.now();
    userInput = this.clientId + '|' + company + '|' + office + '|' + zone + '|' + device + '|getreaderconfig|' + lock.ip + '|' + timestamp;

    message = userInput.toLowerCase();

    console.log(message)
    let companyName = company.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannelGET(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.mqttData) {
        clearInterval(this.interval);
      } else if (intervalCounter == 10) {
        clearInterval(this.interval);
        this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
      }
    }, 1000);
  }

  onItemSelectReader1(config){
  }

  onItemSelectReader2(config){
  }

  onItemSelectReader3(config){
  }

  onItemSelectDoorAccessMode(config){
  }

  onItemSelectDoorEntryExitMode(config){
  }

  onItemSelectReaderAccessMode(config){
  }

  onItemSelectReaderEntryExitMode(config){
  }

  OnItemDeSelect(item:any){

  }

  onErrorGetLock(error){
    this.alertService.error(error.error.message);
  }

  populatedFormValues(lock){
    this.selectedReader1 = [this.reader1List[lock['reader1']]]
    this.selectedReader2 = [this.reader2List[lock['reader2']]]

    this.selectedReader3 = [this.reader3List[lock['reader3']]]

    this.selectedDoorMode = [this.doorAccessModeList[lock['door-access-mode']]]

    this.selectedDoorEntryExitMode = [this.doorEntryExitModeList[lock['door-entry-exit-mode']]];
    this.selectedReaderAccessMode = this.readerAccessModeList.filter(item => {
      if (item['id'] == lock['reader-access-mode']) {
        return true;
      }
    });

    this.selectedReaderEntryExitMode = [this.readerEntryExitModeList[lock['reader-entry-exit-mode']]];
  }

}

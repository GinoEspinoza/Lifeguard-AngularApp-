import { Component, OnInit, Input } from '@angular/core';


import{
APP,
GENERATE_INVAILD_USER_EVENTS,
GENERATE_EXIT_SWITCH_EVENTS,
MAX_FINGERS,
MAX_PALMS,
MIFARE_CUSTOM_KEY_ENABLE,
HID_ICLASS_CUSTOM_KEY_ENABLE,
CARD_CUSTOM_KEY_AUTO_UPDATE,
MANUAL_DOOR_MODE_SELECTION,
FINGER_FORMAT,
FORMAT
} from './basic-device.constants';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-basic-device-configuration-form',
  templateUrl: './basic-device-configuration-form.component.html',
  styleUrls: ['./basic-device-configuration.component.css']
})
export class BasicDeviceConfigurationFormComponent implements OnInit {
  
  basicDEviceConfigurationForm: FormGroup;
  app;
  generateInvaildUserEvents;
  generateExitSwitchEvents;
  maxFingers;
  maxPalms;
  mifareCustomKeyEnable;
  hidIClassCustomKeyEnable;
  cardCustomKeyAutoUpdate;
  manualDoorModeSelection;
  fingerFormat;
  format;

  unamePattern = "[a-zA-Z0-9]+";
  numericalPattern = "[0-9]+";

  @Input() basicDEviceConfiguration;

  constructor() {
      this.app = APP;
      this.generateInvaildUserEvents = GENERATE_INVAILD_USER_EVENTS;
      this.generateExitSwitchEvents = GENERATE_EXIT_SWITCH_EVENTS;
      this.maxFingers = MAX_FINGERS;
      this.maxPalms = MAX_PALMS;
      this.mifareCustomKeyEnable = MIFARE_CUSTOM_KEY_ENABLE;
      this.hidIClassCustomKeyEnable = HID_ICLASS_CUSTOM_KEY_ENABLE;
      this.cardCustomKeyAutoUpdate = CARD_CUSTOM_KEY_AUTO_UPDATE;
      this.manualDoorModeSelection = MANUAL_DOOR_MODE_SELECTION;
      this.fingerFormat = FINGER_FORMAT;
      this.format = FORMAT;
   }

  ngOnInit() {
    this.formInitialized();
    if(this.basicDEviceConfiguration !== undefined){
      this.populatedFormValues();
    }
  }

  formInitialized(){
    this.basicDEviceConfigurationForm = new FormGroup({
      app: new FormControl(this.app[0].id, Validators.required),
      name: new FormControl('', Validators.compose([Validators.maxLength(30), Validators.pattern(this.unamePattern)])),
      ascCode: new FormControl('',  Validators.compose([Validators.max(65535),Validators.min(1), Validators.pattern(this.unamePattern)])),
      generateInvaildUserEvents: new FormControl(this.generateInvaildUserEvents[0].id, Validators.required),
      generateExitSwitchEvents: new FormControl(this.generateExitSwitchEvents[0].id, Validators.required),
      maxFingers: new FormControl(this.maxFingers[0].id, Validators.required),
      maxPalms: new FormControl(this.maxPalms[0].id, Validators.required),
      mifareCustomKeyEnable: new FormControl(this.mifareCustomKeyEnable[0].id, Validators.required),//mifare-custom-key
      mifareCustomKey: new FormControl('', Validators.required),//mifare-custom-key
      hidIClassCustomKeyEnable: new FormControl(this.hidIClassCustomKeyEnable[0].id, Validators.required),
      hidIClassCustomKey: new FormControl('', Validators.required),
      cardCustomKeyAutoUpdate: new FormControl(this.cardCustomKeyAutoUpdate[0].id, Validators.required),
      manualDoorModeSelection: new FormControl(this.manualDoorModeSelection[0].id, Validators.required),
      fingerFormat: new FormControl(this.fingerFormat[0].id, Validators.required),
      format: new FormControl(this.format[0].id, Validators.required),
    });
  }

  // ValidateUrl(control: AbstractControl) {
  //   if (!control.value.startsWith('https') || !control.value.includes('.io')) {
  //     return { validUrl: true };
  //   }
  //   return null;
  // }

  populatedFormValues(){
    this.basicDEviceConfigurationForm.patchValue({
      app: this.basicDEviceConfiguration.app,
      generateInvaildUserEvents: this.basicDEviceConfiguration.generateInvaildUserEvents,
      generateExitSwitchEvents: this.basicDEviceConfiguration.generateExitSwitchEvents,
      maxFingers: this.basicDEviceConfiguration.maxFingers,
      maxPalms: this.basicDEviceConfiguration.maxPalms,
      mifareCustomKeyEnable: this.basicDEviceConfiguration.mifareCustomKeyEnable,
      hidIClassCustomKeyEnable: this.basicDEviceConfiguration.enrollMode,
      cardCustomKeyAutoUpdate: this.basicDEviceConfiguration.cardCustomKeyAutoUpdate,
      manualDoorModeSelection: this.basicDEviceConfiguration.manualDoorModeSelection,
      fingerFormat: this.basicDEviceConfiguration.fingerFormat,
      format: this.basicDEviceConfiguration.format,
    })
  }

  onSubmit(formData){
    console.log(formData)
  }
}

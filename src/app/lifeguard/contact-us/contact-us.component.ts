import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from '../services';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { TICKETS } from '../api.constants';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

  contactForm: FormGroup;
  contactUsUrl = TICKETS;
  submitted:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private authService: LocalAuthService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  get f() { return this.contactForm.controls; }

  onSubmit(contactFormData) {
    if (this.contactForm.invalid) {
      this.submitted = true;
      return;
    }
    let formData = new FormData();
    formData.append('subject', contactFormData.subject);
    formData.append('message', contactFormData.message);
    this.http.post(this.contactUsUrl, formData).subscribe(
      response => {
        this.router.navigate(['/lifeguard/home']);
        this.alertService.success(response['message']);
      },
      error => { this.alertService.success(error['error']['message']); }
    );
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ApiService } from './api.service'
import { LoginApiService } from './login-api.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = 'workspaces';
  serverUrl: String;
  failed = false;
  failMsg = "";
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loginApiService: LoginApiService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    // prepopulate server field if found in localstorage
    if (localStorage.getItem('apiUrl')){
      this.serverUrl = localStorage.getItem('apiUrl');
    }

    this.loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    server: [this.serverUrl, Validators.required]
  });

  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }

    // set the URL for the redlure server API
    this.apiService.setUrl(this.f.server.value.replace(/\/$/, ""));

    this.loading = true;
    this.loginApiService.login(this.f.username.value, this.f.password.value)
        .pipe(first())
        .subscribe(
            data => {
              this.loading = false;
              if(data['success']){
                this.router.navigate([this.returnUrl]);
                this.failed = false;
              } else if (data['success'] == false){
                this.failed = true;
                this.failMsg = "Invalid username or password"
              } else {
                this.failed = true;
                this.failMsg = "Server is unreachable"
              }
            },
            error => {
                //console.log(error)
                this.loading = false;
            });
  }

}

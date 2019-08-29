import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ListsApiService } from '../lists-api.service'
import { first } from 'rxjs/operators'
import { List } from '../list.model'
import { AlertService } from '../../alert/alert.service'
import { Target } from '../targets/target.model';
import { parse } from 'papaparse';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html'
})

export class NewListComponent implements OnInit {
  myForm: FormGroup;
  loading = false;
  submitted = false;
  newList: List;
  tls: false;
  ssl: false;
  workspaceId: String;
  targets: Target[] = [];
  newTarget: Target;
  csvContent: String;
  file: File;

  first_name: String;
  last_name: String;
  email: String;

  headers = ["#", "First Name", "Last Name", "Email", "Actions"]

  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private listsApiService: ListsApiService,
    private alertService: AlertService,
  ) { }


  ngOnInit() {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required],
      first_name: [''],
      last_name: [''],
      email: ['', Validators.email]
    });
  
    this.workspaceId = this.router.url.split('/')[2];
  }

  onFileSelect(file) {
    this.file = file.target.files[0];
    let reader = new FileReader();
    reader.onload = () => {
      var csv:string = reader.result as string;
      parse(csv, {complete: (result) => this.csvToTable(result.data)});
    }
    reader.readAsText(this.file);
  }


  csvToTable(csv) {
    var emailCol: number;
    var fnameCol: number;
    var lnameCol: number;
    var exit = false;

    let headers = csv[0];

    // check which header is in which column; exit for unrecognized header
    headers.forEach((txt, index) => {
      txt = txt.toLowerCase();

      if(txt == 'email') {
        emailCol = index;

      } else if(txt == 'first') {
        fnameCol = index;

      } else if(txt == 'last') {
        lnameCol = index;

      } else {
        this.alertService.newAlert('danger', 'Unrecognized column: ' + txt);
        exit = true;
      }
    });

    if(emailCol == null) {
      this.alertService.newAlert('danger', 'CSV does not include email column');
      exit= true; 
    }

    if(exit){
      return;
    }
    
    csv.forEach((row, index) => {
      var email: string = '';
      var fname: string = '';
      var lname: string = '';

      if(index != 0){
        row.forEach((txt, index) => {
         if(index == emailCol) { email = txt; }
         if(index == fnameCol) { fname = txt; }
         if(index == lnameCol) { lname = txt; }
        });

        this.newTarget = {
          id: null,
          first_name: fname,
          last_name: lname,
          email: email
        }
        
        if(this.newTarget.email != '') {this.targets.push(this.newTarget);}
      }
    });
  }


  deleteTarget(target){
    const index: number = this.targets.indexOf(target);
    this.targets.splice(index, 1);
  }

  insertTarget() {
    if (!this.f.email.errors && this.f.email.value != "") {
      this.newTarget = {
        id: null,
        first_name: this.f.first_name.value,
        last_name: this.f.last_name.value,
        email: this.f.email.value
      }

      this.targets.push(this.newTarget);
      this.f.first_name.setValue("");
      this.f.last_name.setValue("");
      this.f.email.setValue("");
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  get f() { return this.myForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.myForm.invalid || this.targets.length == 0) {
        return;
    }

    this.loading = true;
    this.listsApiService.postList(this.workspaceId, this.f.name.value, this.targets)
      .pipe(first())
        .subscribe(
            data => {
                this.loading = false;
                if (data['success'] == false){ 
                  this.sendAlert(this.f.name.value)
                } else {
                  this.newList = data;
                  this.emitter.emit(this.newList);
                  this.closeModal()
                }
            },
            error => {
                this.loading = false;
                console.log(error)
            });
    }

    sendAlert(name) {
      this.alertService.newAlert("warning", "A list with the name" + name + " already exists in the database")
    }
}
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { DomainsApiService } from '../domains-api.service'
import { first } from 'rxjs/operators'
import { Domain } from '../domain.model'

@Component({
  selector: 'app-edit-certs',
  templateUrl: './edit-certs.component.html'
})
export class EditCertsComponent implements OnInit {
  myForm: FormGroup;
  loading = false;
  submitted = false;
  editDomain: any;
  cert: String;
  key: String;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private domainsApiService: DomainsApiService,
  ) { }

  ngOnInit() {
    if (this.editDomain.cert_path != "null") {
      this.cert = this.editDomain.cert_path
    }

    if (this.editDomain.key_path != "null") {
      this.key = this.editDomain.key_path
    }

    this.myForm = this.formBuilder.group({
      certPath: [this.cert,Validators.required],
      keyPath: [this.key, Validators.required]
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  get f() { return this.myForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.myForm.invalid) {
        return;
    }
    
    this.loading = true;
    this.domainsApiService.postDomain(this.editDomain.domain, this.f.certPath.value, this.f.keyPath.value)
      .pipe(first())
        .subscribe(
            data => {
                this.editDomain = data;
                this.emitter.emit(this.editDomain);
                this.loading = false;
                this.closeModal()
            },
            error => {
                this.loading = false;
                console.log(error)
            });
    }
}
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Page } from '../page.model'
import { PagesApiService } from '../pages-api.service'
import { AlertService } from '../../alert/alert.service'
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CloneSiteComponent } from './clone-site/clone-site.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators'

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html'
})
export class PageComponent implements OnInit {
  editPage: any;

  workspaceId: String;
  pageId: String;

  myForm: FormGroup;
  loading = false;
  submitted = false;

  title1: String;
  title2: String;
  saveBtnText: String;

  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  /*
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    maxHeight: '50',
    //height: '90%',
    minHeight: '200',
    minWidth: '100vh',
    width: '95%',
    placeholder: 'Create web page here...',
    translate: 'no',
  }
  */
  config = {
    'iframe': true,
    "disablePlugins": "table, resizer, inlinePopup, cleanHtml",
    "height": window.innerHeight * .75,
    "width": '100%',
    allowResizeX: true,
    allowResizeY: false
  }

  constructor(
    private route: ActivatedRoute,
    private pagesApiService: PagesApiService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.route.params.subscribe(params => this.workspaceId = params['workspaceId'])
    this.route.params.subscribe(params => this.pageId = params['pageId'])
    if (this.pageId != 'new') {
      this.editPage = router.getCurrentNavigation().extras.state
      if (this.editPage == null) {
        this.router.navigate([`/workspaces/${this.workspaceId}/pages`])
      }
      this.title1 = "EDI"
      this.title2 = "T PAGE"
      this.saveBtnText = "Save"
    } else {
      this.editPage = {
        "name": "",
        "url": "",
        "html": ""
      }
      this.title1 = "NE"
      this.title2 = "W PAGE"
      this.saveBtnText = "Create"
    }
   }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      name: [this.editPage.name, Validators.required],
      url: [this.editPage.url, Validators.required],
      htmlContent: [this.editPage.html]
    });
  }

  return() {
    this.router.navigate([`/workspaces/${this.workspaceId}/pages`])
  }

  cloneSite() {
    const modalRef = this.modalService.open(CloneSiteComponent);
    modalRef.componentInstance.emitter.subscribe( 
      data => {
        this.f.htmlContent.setValue(data);
      }        
    );
  }

  get f() { return this.myForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.myForm.invalid) {
        return;
    }
    
    this.loading = true

    if (this.pageId == "new") {
      this.postPage()
    } else {
      this.putPage()
    }
  }

  postPage() {
    this.pagesApiService.postPage(
      this.workspaceId, this.f.name.value, this.f.htmlContent.value, this.f.url.value
    ).pipe(first())
    .subscribe(
        data => {
          this.loading = false
          if (data['success'] == false) {
            this.alertService.newAlert("warning", "A page named " + this.f.name.value + " already exists in the database")
          } else {
            this.router.navigate([`/workspaces/${this.workspaceId}/pages`])
          }
        },
        error => {
            console.log(error)
        });
  }

  putPage() {
    this.pagesApiService.putPage(
      this.workspaceId, this.pageId, this.f.name.value, this.f.htmlContent.value, this.f.url.value
    ).pipe(first())
    .subscribe(
        data => {
          this.loading = false
          if (data['success'] == false) {
            this.alertService.newAlert("warning", "A page named " + this.f.name.value + " already exists in the database")
          } else {
            this.router.navigate([`/workspaces/${this.workspaceId}/pages`])
          }
        },
        error => {
            console.log(error)
        });
  }

}
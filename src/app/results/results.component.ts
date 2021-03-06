import { Component, OnInit, ViewChildren, OnDestroy, QueryList } from '@angular/core';
import { ResultsApiService } from './results-api.service';
import { AlertService } from '../alert/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';
import { GraphsComponent } from './graphs/graphs.component';
import { DataService } from './data.service';
import { MessageService } from '../empty-object/message.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AnonymousComponent } from './anonymous/anonymous.component';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  providers: [MessageService]
})
export class ResultsComponent implements OnInit, OnDestroy {
  allResults: any[]; //all results returned by server
  results: any[] = []; //holds current filtered results
  submitEvents: any[] = []; //holds submitted form data
  filtered = false;
  selectAll = true;
  selectedForm;

  loading = false;
  errored: number = 0;
  scheduled: number = 0;
  sent: number = 0;
  unopened: number = 0;
  opened: number = 0;
  clicked: number = 0;
  downloaded: number = 0;
  submitted: number = 0;

  intervalVar: any;

  workspaceId: String;
  campaigns: any[];
  campaignHeaders = ["ID", "Name", "Status", "Server", "Domain", "Start Date", "End Date"];
  credHeaders = ["Campaign ID", "Email"];
  checked = []; //track which campaigns are selected

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  dtTrigger: Subject<any>[] = [];
  dtOptions: DataTables.Settings = {}


  constructor(
    private resultsApiService: ResultsApiService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private dataService: DataService,
    private messageService: MessageService,
  ) {
    this.route.params.subscribe(params => this.workspaceId = params['workspaceId']);
  }


  ngOnInit() {
    this.dtTrigger["formTable"] = new Subject<any>();
    this.dtTrigger["campaignTable"] = new Subject<any>();

    // info and length components were not rendering as left-justified on the table
    // hard coded to render there
    this.dtOptions = {
      dom: "<'row'<'col-sm-6 text-left'l><'col-sm-6'f>>" +
        "<'row'<'col-sm-12't>>" +
        "<'row'<'col-sm-6 text-left'i><'col-sm-6'p>>"
    }

    this.getResults(false);

    this.intervalVar = setInterval(() => {
      this.getResults(true);
    }, 20000);

  }

  ngOnDestroy() {
    clearInterval(this.intervalVar) // cancel the interval task
    this.intervalVar = 0 // ensure the interval handle is cleared
    this.dtTrigger['campaignTable'].unsubscribe();
    this.dtTrigger['formTable'].unsubscribe();
  }

  rerender(table): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      let tableId = dtElement['el'].nativeElement.id
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        if (tableId == table) {
          dtInstance.destroy();
        }
      });
    });
    this.dtTrigger[table].next();
  }


  onResultSelect(event) {
    this.selectedForm = event;
  }

  getResults(rerender: Boolean) {
    this.loading = true;
    this.resultsApiService.getResults(this.workspaceId).subscribe(data => {
      this.allResults = data[1];
      this.campaigns = data[0];
      this.setState();
      this.checkNulls();
      //this.results = this.allResults;
      //this.submitEvents = this.getForms();
      this.calcStats();
      this.loading = false;
      if (rerender) {
        this.rerender('campaignTable');
        this.rerender('formTable');
      } else {
        this.dtTrigger['campaignTable'].next();
        this.dtTrigger['formTable'].next();
      }
    });
  }

  calcStats() {
    this.errored = this.results.reduce((acc, cur) => cur.status === 'Error' ? ++acc : acc, 0);
    this.scheduled = this.results.reduce((acc, cur) => cur.status === 'Scheduled' ? ++acc : acc, 0);
    this.sent = this.results.length - this.scheduled;
    this.opened = this.results.reduce((acc, cur) => cur.status === 'Opened' ? ++acc : acc, 0);
    this.clicked = this.results.reduce((acc, cur) => cur.status === 'Clicked' ? ++acc : acc, 0);
    this.downloaded = this.results.reduce((acc, cur) => cur.status === 'Downloaded' ? ++acc : acc, 0);
    this.submitted = this.results.reduce((acc, cur) => cur.status === 'Submitted' ? ++acc : acc, 0);
    this.unopened = this.results.length - this.opened - this.clicked - this.downloaded - this.submitted - this.scheduled;
  }

  toggleSelectAll(event) {
    this.campaigns.forEach(
      campaign => {
        campaign.state = event.target.checked; //set each campaign to the checked status
        if (event.target.checked && this.checked.indexOf(campaign.id) <= -1) {
          this.checked.push(campaign.id); //add campaign to checked tracker
        }
      });
    if (event.target.checked) {
      this.results = this.allResults;
      this.submitEvents = this.getForms();
    } else {
      this.results = []; //empty all arrays
      this.submitEvents = [];
      this.checked = [];
    }
    this.calcStats();
    this.rerender('formTable')
  }

  toggleSelect(event, campaignId) {
    let results = this.allResults.filter(result => result.campaign_id === campaignId);
    if (event.target.checked) {
      this.results = this.results.concat(results);
      this.submitEvents = this.getForms();
    } else {
      this.results = this.results.filter(result => results.indexOf(result) < 0);
      this.submitEvents = this.getForms();
    }

    // if in checked tracker, remove. else add campaign
    const index = this.checked.indexOf(campaignId, 0);
    if (index > -1) {
      this.checked.splice(index, 1);
    } else {
      this.checked.push(campaignId);
    }

    this.calcStats();
    this.rerender('formTable')
  }

  checkNulls() {
    this.campaigns.forEach(campaign => {
      if (!campaign.server) {
        campaign.server = {}
        campaign.server.alias = "[Deleted]"
      }

      if (!campaign.domain) {
        campaign.domain = {}
        campaign.domain.domain = "[Deleted]"
      }
    });
  }

  // initalize campaign state after getting results from server
  setState() {
    this.results = []; //reset results array
    // if nothing is checked, check all campaigns
    if (this.checked.length == 0) {
      this.campaigns.forEach(campaign => {
        campaign.state = true;
        this.checked.push(campaign.id) //add campaign to checked tracker
        let results = this.allResults.filter(result => result.campaign_id === campaign.id);
        this.results = this.results.concat(results);
      });
      // else reset each campaign to its previous state
    } else {
      this.campaigns.forEach(campaign => {
        let results = this.allResults.filter(result => result.campaign_id === campaign.id);
        if (this.checked.indexOf(campaign.id) > -1) {
          campaign.state = true;
          this.results = this.results.concat(results);
        } else {
          campaign.state = false;
        }
      });
    }
    this.submitEvents = this.getForms();
  }


  // return an email address given a result ID
  getEmail(id) {
    return this.results.filter(result => result.id === id)[0].person.email;
  }


  // return the campaign ID given a result ID
  getCId(id) {
    return this.results.filter(result => result.id === id)[0].campaign_id;
  }


  // get all events with formdata and make an array of those events
  getForms() {
    // map filter was not working here for some reason -> resorted to writing own filter with foreach
    var submissions = [];

    this.results.forEach(result => {
      result.events.forEach(event => {
        if (event.action == "Submitted") {
          submissions.push(event);
        }
      })
    })

    return submissions;
  }

  // open the FormComponent to show submitted FormData
  openFormModal(event) {
    this.onResultSelect(event);
    const modalRef = this.modalService.open(FormComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.submitEvent = this.selectedForm;
  }

  // open the GraphComponent for visuals of results
  openVisuals() {
    // sent current results to the data service
    this.dataService.updateData([this.unopened, this.opened, this.clicked, this.downloaded, this.submitted])
    //open modal
    const modalRef = this.modalService.open(GraphsComponent, { size: 'lg', backdrop: 'static' });
  }

  // open the TableComponent showing a table of results and their property values
  openTable(status) {
    // filter the result set based on the clicked status
    var filteredResults: any[] = [];
    // if status is 'Sent' we really want all results
    if (status == 'Sent') {
      filteredResults = this.results.filter(function (result) {
        return result.status != 'Scheduled';
      });
    } else {
      // if status is 'Unopened' we really want results whose status is still 'Sent'
      if (status == 'Unopened') {
        status = 'Sent'
      }
      // filter the array of results
      filteredResults = this.results.filter(function (result) {
        return result.status == status;
      });
    }

    // open the modal and pass the filtered result set
    const modalRef = this.modalService.open(TableComponent, { windowClass: 'hugeModal', backdrop: 'static' });
    modalRef.componentInstance.results = filteredResults;
    modalRef.componentInstance.campaigns = this.campaigns;
  }

  openAnon() {
    const modalRef = this.modalService.open(AnonymousComponent, { size: 'lg', backdrop: 'static' });
  }

}

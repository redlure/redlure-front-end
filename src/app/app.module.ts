import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { LoginComponent } from './login/login.component';
import { LoginApiService } from './login/login-api.service'
import { HttpErrorHandler }     from './http-error-handler.service';
import { MessageService }       from './message.service';

import { AppRoutingModule } from './app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { WorkspaceNavbarComponent } from './workspace-navbar/workspace-navbar.component';
import { NewWorkspaceComponent } from './workspaces/new-workspace/new-workspace.component'
import { WorkspacesApiService } from './workspaces/workspaces-api.service';
import { WorkspaceComponent } from './workspaces/workspace/workspace.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { DomainsServersComponent } from './domains-servers/domains-servers.component';
import { NewServerComponent } from './domains-servers/new-server/new-server.component';
import { NewDomainComponent } from './domains-servers/new-domain/new-domain.component';
import { DomainsApiService } from './domains-servers/domains-api.service'
import { ServersApiService } from './domains-servers/servers-api.service';
import { PagesComponent } from './pages/pages.component';
import { DelWorkspaceComponent } from './workspaces/del-workspace/del-workspace.component';
import { DelServerComponent } from './domains-servers/del-server/del-server.component';
import { DelDomainComponent } from './domains-servers/del-domain/del-domain.component';
import { NewProfileComponent } from './profiles/new-profile/new-profile.component';
import { DelProfileComponent } from './profiles/del-profile/del-profile.component';
import { EditProfileComponent } from './profiles/edit-profile/edit-profile.component'
import { ProfilesApiService } from './profiles/profiles-api.service'


@NgModule({
  declarations: [
    AppComponent,
    WorkspacesComponent,
    LoginComponent,
    NavbarComponent,
    WorkspaceNavbarComponent,
    NewWorkspaceComponent,
    WorkspaceComponent,
    ProfilesComponent,
    DomainsServersComponent,
    NewServerComponent,
    NewDomainComponent,
    PagesComponent,
    DelWorkspaceComponent,
    DelServerComponent,
    DelDomainComponent,
    NewProfileComponent,
    DelProfileComponent,
    EditProfileComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    HttpClientModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    MDBBootstrapModule,
  ],
  providers: [
    HttpErrorHandler,
    MessageService,
    LoginApiService,
    WorkspacesApiService,
    WorkspaceComponent,
    ServersApiService,
    DomainsApiService,
    ProfilesApiService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    NewWorkspaceComponent,
    NewDomainComponent,
    NewServerComponent,
    DelWorkspaceComponent,
    DelServerComponent,
    DelDomainComponent,
    DelProfileComponent,
    NewProfileComponent,
    EditProfileComponent
  ]
})
export class AppModule { }

import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators'
import { ApiService } from '../login/api.service'
import { Page } from './page.model';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';


@Injectable()
export class PagesApiService {
  private handleError: HandleError;

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
      this.handleError = httpErrorHandler.createHandleError('PagesApiService');
  }

  // GET list of all workspaces from the server
  getPages(id: String): Observable<Page[]> {
    const url = `${this.apiService.getUrl()}/workspaces/${id}/pages`;
    return this.http.get<Page[]>(url, {withCredentials: true})
      .pipe(
        catchError(this.handleError('getPages', []))
      );  
  }

  // POST a new page to the server
  postPage(workspaceId: String, name: String, html: String, urlPath: String): Observable<Page> {
      const url = `${this.apiService.getUrl()}/workspaces/${workspaceId}/pages`;
      let formData: FormData = new FormData()
      formData.append('Name', String(name))
      formData.append('HTML', String(html))
      formData.append('URL', String(urlPath))

      return this.http.post<any>(url, formData, {withCredentials: true})
        .pipe(
          catchError(this.handleError('postPage', name))
        );  
  }

    // DELETE a page from the server
    deletePage(workspaceId: String, pageId: String): Observable<Page> {
      const url = `${this.apiService.getUrl()}/workspaces/${workspaceId}/pages/${pageId}`;
      return this.http.delete<any>(url, {withCredentials: true})
        .pipe(
          catchError(this.handleError('deletePage'))
        );  
    }

    // PUT: edit a page on the server
    putPage(workspaceId: String, pageId: String, name: String, html: String, urlPath: String): Observable<Page> {
        const url = `${this.apiService.getUrl()}/workspaces/${workspaceId}/pages/${pageId}`;
        let formData: FormData = new FormData()
        formData.append('Name', String(name))
        formData.append('HTML', String(html))
        formData.append('URL', String(urlPath))

        return this.http.put<any>(url, formData, {withCredentials: true})
          .pipe(
            catchError(this.handleError('putPage', name))
          );  
    }

    // POST: get the source HTML of the posted link
    cloneSite(link: String){
        const url = `${this.apiService.getUrl()}/clone`;
        let formData: FormData = new FormData()
        formData.append('Link', String(link))

        return this.http.post<any>(url, formData, {withCredentials: true})
          .pipe(
            catchError(this.handleError('cloneSite'))
          );  
    }

}

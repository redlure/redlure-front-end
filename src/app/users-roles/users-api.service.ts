import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators'
import {API_URL} from '../env';
//import { User } from './user.model';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { RequestOptions, Headers } from '@angular/http';


@Injectable()
export class UsersApiService {
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
      this.handleError = httpErrorHandler.createHandleError('UsersApiService');
  }

  // GET list of all users from the user
  getUsers(): Observable<Object[]> {
    const url = `${API_URL}/users`;
    return this.http.get<Object[]>(url, {withCredentials: true})
      .pipe(
        catchError(this.handleError('getUsers', []))
      );  
  }

  // POST a new user (worker) to the user
  postUser(username: String, password: String, role: String): Observable<Object> {
    const url = `${API_URL}/users`;
    let formData: FormData = new FormData()
    formData.append('Username', String(username))
    formData.append('Password', String(password))
    formData.append('Role', String(role))
    return this.http.post<any>(url, formData, {withCredentials: true})
      .pipe(
        catchError(this.handleError('postUser'))
      );  
  }

    // DELETE a user (worker) from the user
    deleteUser(id: Number): Observable<Object> {
      const url = `${API_URL}/users/${id}`;
      return this.http.delete<any>(url, {withCredentials: true})
        .pipe(
          catchError(this.handleError('deleteUser'))
        );  
    }


}
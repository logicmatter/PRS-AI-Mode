import { Injectable, Inject } from '@angular/core';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

//const API_URL = 'api/FileSystemManager/';
const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/FileSystemManager/`;


@Injectable({
  providedIn: 'root'
})
export class FileSystemService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getPointMatterVersion(): Observable<any> {
    return this.http.get(API_URL + 'GetPointMatterVersion');
  }
}

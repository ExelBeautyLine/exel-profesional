import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private http: HttpClient) {}

  getMenu(): Observable<any[]> {
    return this.http.get<any[]>('/.netlify/functions/menu');
  }

}
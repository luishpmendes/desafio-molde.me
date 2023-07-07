import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Locations } from './locations';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://recrutamento.molde.me';
  
  constructor(private http: HttpClient) { }

  login(login: { email: string, password: string }): Observable<any> {
    console.log('email:' + login.email);
    console.log('password:' + login.password);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post(`${this.apiUrl}/login`, login, httpOptions);
  }

  getLocations(auth_token: string): Observable<Locations> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': auth_token})
    };
    return this.http.get<Locations>(`${this.apiUrl}/location`, httpOptions).pipe(
      tap(response => console.log(response))
    );
  }

  addLocation(x: number, y: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/location`, { x, y });
  }

  updateLocation(id: number, x: number, y: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/location/${id}`, { x, y });
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/location/${id}`);
  }
}

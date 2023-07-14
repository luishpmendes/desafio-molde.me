import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Locations } from './locations';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://recrutamento.molde.me';
  
  constructor(private http: HttpClient) { }

  private getHttpOptions(auth_token?: string): { headers: HttpHeaders } {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if (auth_token) {
      headers = headers.set('Authorization', auth_token);
    }
    return { headers };
  }

  login(login: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, login, this.getHttpOptions());
  }

  getLocations(auth_token: string): Observable<Locations> {
    return this.http.get<Locations>(`${this.apiUrl}/location`, this.getHttpOptions(auth_token));
  }

  addLocation(auth_token: string, x: number, y: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/location`, { x, y }, this.getHttpOptions(auth_token));
  }

  updateLocation(auth_token: string, id: number, x: number, y: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/location/${id}`, { x, y }, this.getHttpOptions(auth_token));
  }

  deleteLocation(auth_token: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/location/${id}`, this.getHttpOptions(auth_token));
  }
}

// Import the required modules from Angular's core, http client, and rxjs library.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import the Locations iterface from the same directory
import { Locations } from './locations';

// This decorator marks the class as one that participates in the dependency injection system.
@Injectable({
  // 'root' specifies that the service should be provided in the root injector.
  providedIn: 'root'
})
export class ApiService {
  // API base URL
  private apiUrl = 'https://recrutamento.molde.me';

  // Inject HttpClient into our service
  constructor(private http: HttpClient) { }

  // This method prepares HTTP headers.
  // If an auth_token is provided, it includes this in the Authorization header.
  private getHttpOptions(auth_token?: string): { headers: HttpHeaders } {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if (auth_token) {
      headers = headers.set('Authorization', auth_token);
    }
    return { headers };
  }

  // This method sends a POST request to the login endpoint with the given email and password.
  login(login: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, login, this.getHttpOptions());
  }

  // This method sends a GET request to the location endpoint to retrieve all locations.
  getLocations(auth_token: string): Observable<Locations> {
    return this.http.get<Locations>(`${this.apiUrl}/location`, this.getHttpOptions(auth_token));
  }

  // This method sends a POST request to the location endpoint to add a new location.
  addLocation(auth_token: string, x: number, y: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/location`, { x, y }, this.getHttpOptions(auth_token));
  }

  // This method sends a PUT request to the location endpoint to update a specific location by id.
  updateLocation(auth_token: string, id: number, x: number, y: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/location/${id}`, { x, y }, this.getHttpOptions(auth_token));
  }

  // This method sends a DELETE request to the location endpoint to remove a specific location by id.
  deleteLocation(auth_token: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/location/${id}`, this.getHttpOptions(auth_token));
  }
}

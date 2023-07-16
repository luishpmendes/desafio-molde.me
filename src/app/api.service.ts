// Import the required modules from Angular's core, http client, and rxjs library.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, range, Observable } from 'rxjs';
import { concatMap, mergeMap, toArray, map, tap } from 'rxjs/operators';
// Import the Locations iterface from the same directory
import { Locations } from './locations';
import { Location } from './location';

// This decorator marks the class as one that participates in the dependency injection system.
@Injectable({
  // 'root' specifies that the service should be provided in the root injector.
  providedIn: 'root'
})
export class ApiService {
  // API base URL
  private apiUrl = 'https://recrutamento.molde.me';
  // Total number of pages of data
  private totalPages = 0;
  // First page of data
  private firstPageData: Location[] = [];

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
  getLocations(auth_token: string): Observable<Location[]> {
    let httpOptions = this.getHttpOptions(auth_token);
    httpOptions.headers.set('sort', 'id');
    httpOptions.headers.set('order', 'asc');
    httpOptions.headers.set('page', '1');
  
    return this.http.get<Locations>(`${this.apiUrl}/location`, httpOptions).pipe(
      // store the first page of data and the total number of pages
      tap(locations => {
        this.totalPages = locations.pages;
        this.firstPageData = locations.data;
      }),
      // use the total number of pages to create a list of the remaining page numbers (if any)
      concatMap(locations => locations.pages > 1 ? range(2, locations.pages - 1) : of(null)),
      // map each page number to a GET request
      mergeMap(pageNumber => {
        if (pageNumber) {
          httpOptions.headers.set('page', pageNumber.toString());
          return this.http.get<Locations>(`${this.apiUrl}/location`, httpOptions);
        } else {
          // if there's only one page, return the first page data as a single-element Observable
          return of({data: this.firstPageData} as Locations);
        }
      }),
      // merge all the returned Location arrays into one array
      mergeMap(locations => locations.data),
      // accumulate all the emitted values into a single array
      toArray()
    );
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

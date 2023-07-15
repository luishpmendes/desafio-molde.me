// Import necessary modules and services
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Location } from '../location';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

// Set up validation rules for the location form
const LOCATION_FORM_VALIDATORS = [Validators.required, Validators.min(0), Validators.max(1000)];

// Angular component decorator
@Component({
  // Defines the name of the component as used in templates
  selector: 'app-locations',
  // Path to the HTML template associated with this component
  templateUrl: './locations.component.html',
  // Path to the CSS file(s) associated with this component
  styleUrls: ['./locations.component.css']
})
// Implementing OnInit interface for lifecycle hook
export class LocationListComponent implements OnInit {
  // Create a FormGroup instance for adding locations
  addLocationForm: FormGroup = {} as FormGroup;

  // Constructor that injects SharedService, ApiService and Angular Router into the component
  constructor(private sharedService: SharedService, private apiService: ApiService, private readonly router: Router) {
    // Initialize the form with validation rules
    this.addLocationForm = new FormGroup({
      x: new FormControl('', LOCATION_FORM_VALIDATORS),
      y: new FormControl('', LOCATION_FORM_VALIDATORS)
    });
  }

  // ngOnInit lifecycle hook method, called when the component is ready
  ngOnInit(): void {
    // Get a list of all locations on initialization
    this.getLocations();
  }

  // Method to get locations from the API
  getLocations(): void {
    // Make the request with the current user's authentication token
    this.apiService.getLocations(this.sharedService.auth_token)
      .subscribe({
        // If successful, store the locations in sharedService
        next: locations => this.sharedService.locations = locations,
        // If an error occurs, log it to the console
        error: error => console.error('There was an error!', error)
      });
  }

  // Method to add a location
  add(): void {
    // Check if the form is valid
    if (this.addLocationForm.valid) {
      // If so, send the location data to the API
      this.apiService.addLocation(this.sharedService.auth_token, this.addLocationForm.value.x, this.addLocationForm.value.y)
        .subscribe({
          // If successful, add the new location to the list in sharedService
          next: location => this.addLocation(location),
          // If an error occurs, log it to the console
          error: error => console.error('There was an error!', error)
        });
    }
  }

  // Method to add the location to the shared service and reset the form
  addLocation(location: any): void {
    // Push the location to the shared service's locations data array
    this.sharedService.locations.data.push(location);
    // Reset the form to its initial state
    this.addLocationForm.reset();
  }

  // Method to delete a location
  delete(id: number): void {
    // Call the deleteLocation method in apiService with the current user's token and the id of the location to delete
    this.apiService.deleteLocation(this.sharedService.auth_token, id).subscribe({
      // If successful, remove the deleted location from the list in sharedService
      next: result => this.filterLocations(id),
      // If an error occurs, log it to the console
      error: error => console.error('There was an error!', error)
    });
  }

  // Method to filter the deleted location out of the locations list
  filterLocations(id: number): void {
    // Reassign the locations data array to a new array that doesn't include the deleted location
    this.sharedService.locations.data = this.sharedService.locations.data.filter(l => l.id !== id)
  }

  // Method to navigate to the '/tsp' route
  tsp(): void {
    this.router.navigate(['/tsp']);
  }

  // Getter method for the locations from sharedService
  get locations() {
    return this.sharedService.locations;
  }

  // Method to provide a unique identifier for each location (used by *ngFor for performance optimizations)
  trackById(index: number, location: Location): number {
    return location.id;
  }
}

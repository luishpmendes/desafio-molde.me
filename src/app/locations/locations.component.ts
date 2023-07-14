import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Location } from '../location';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

const LOCATION_FORM_VALIDATORS = [Validators.required, Validators.min(0), Validators.max(1000)];

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationListComponent implements OnInit {
  addLocationForm: FormGroup = {} as FormGroup;

  constructor(private sharedService: SharedService, private apiService: ApiService, private readonly router: Router) {
    this.addLocationForm = new FormGroup({
      x: new FormControl('', LOCATION_FORM_VALIDATORS),
      y: new FormControl('', LOCATION_FORM_VALIDATORS)
    });
  }

  ngOnInit(): void {
    this.getLocations();
  }

  getLocations(): void {
    this.apiService.getLocations(this.sharedService.auth_token)
      .subscribe({
        next: locations => this.sharedService.locations = locations,
        error: error => console.error('There was an error!', error)
      });
  }

  add(): void {
    if (this.addLocationForm.valid) {
      this.apiService.addLocation(this.sharedService.auth_token, this.addLocationForm.value.x, this.addLocationForm.value.y)
        .subscribe({
          next: location => this.addLocation(location),
          error: error => console.error('There was an error!', error)
        });
    }
  }

  addLocation(location: any): void {
    this.sharedService.locations.data.push(location);
    this.addLocationForm.reset();
  }

  delete(id: number): void {
    this.apiService.deleteLocation(this.sharedService.auth_token, id).subscribe({
      next: result => this.filterLocations(id),
      error: error => console.error('There was an error!', error)
    });
  }

  filterLocations(id: number): void {
    this.sharedService.locations.data = this.sharedService.locations.data.filter(l => l.id !== id)
  }

  tsp(): void {
    this.router.navigate(['/tsp']);
  }

  get locations() {
    return this.sharedService.locations;
  }

  trackById(index: number, location: Location): number {
    return location.id;
  }
}

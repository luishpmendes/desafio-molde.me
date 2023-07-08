import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Locations } from '../locations';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent implements OnInit {
  login = {
    email: '',
    password: ''
  };
  user: any;
  auth_token: string;
  locations: Locations = {} as Locations;

  constructor(private sharedService: SharedService, private apiService: ApiService) {
    this.login = this.sharedService.login;
    this.user = this.sharedService.user;
    this.auth_token = this.sharedService.auth_token;
  }

  ngOnInit(): void {
    this.getLocations();
  }

  getLocations(): void {
    console.log("LocationListComponent getLocations")
    console.log("this.auth_token: " + this.auth_token)
    this.apiService.getLocations(this.auth_token)
      .subscribe(locations => this.locations = locations);
  }

  add(x: string, y: string): void {
    console.log("LocationListComponent add")
    console.log("this.auth_token: " + this.auth_token)
    this.apiService.addLocation(this.auth_token, Number(x), Number(x))
      .subscribe(location => {
        this.locations.data.push(location);
      });
  }

  delete(id: number): void {
    console.log("LocationListComponent delete")
    console.log("this.auth_token: " + this.auth_token)
    this.locations.data = this.locations.data.filter(l => l.id !== id);
    this.apiService.deleteLocation(this.auth_token, id).subscribe();
  }
}

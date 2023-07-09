import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Locations } from '../locations';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css']
})
export class TSPComponent implements OnInit {
  auth_token: string;
  locations: Locations = {} as Locations;

  constructor(private sharedService: SharedService, private apiService: ApiService) {
    this.auth_token = this.sharedService.auth_token;
  }

  ngOnInit(): void {
    this.getLocations();
  }

  getLocations(): void {
    console.log("TspComponent getLocations")
    console.log("this.auth_token: " + this.auth_token)
    this.apiService.getLocations(this.auth_token)
      .subscribe(locations => this.locations = locations);
  }
}

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
  auth_token = '';
  locations: Locations = {} as Locations;


  constructor(private sharedService: SharedService, private apiService: ApiService) {
    this.login = this.sharedService.login;
    this.user = this.sharedService.user;
    this.auth_token = this.sharedService.auth_token;
  }

  ngOnInit(): void {
    this.apiService.getLocations(this.auth_token).subscribe(locations => {
      console.log('getLocations');
      console.log('Locations:' + locations);
      console.log('Data:' + locations.data);
      console.log('Limit:' + locations.limit);
      this.locations = locations;
      console.log('Locations:' + this.locations);
      console.log('Data:' + this.locations.data);
      console.log('Limit:' + this.locations.limit);
    //   console.log('Locations:' + locations.data);
    //   this.locations = locations;
    });
  }
}

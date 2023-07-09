import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Locations } from '../locations';

import * as d3 from 'd3';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css']
})
export class TSPComponent implements OnInit, AfterViewInit {
  @ViewChild('chart')
  private chartContainer!: ElementRef;

  auth_token: string;
  locations: Locations = {} as Locations;

  constructor(private sharedService: SharedService, private apiService: ApiService) {
    this.auth_token = this.sharedService.auth_token;
    this.locations = this.sharedService.locations;
  }

  ngOnInit(): void {
    // this.getLocations();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  getLocations(): void {
    console.log("TspComponent getLocations")
    console.log("this.auth_token: " + this.auth_token)
    this.apiService.getLocations(this.auth_token)
      .subscribe(locations => this.locations = locations);
  }

  createChart(): void {
    const element = this.chartContainer.nativeElement;
    const data = this.locations.data.map(location => ({ id: location.id, x: location.x, y: location.y }));

    const svg = d3.select(element).append('svg')
      .attr('width', '1000')
      .attr('height', '1000');

    const x = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, 1000]);

    const y = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, 1000]);

    const line = d3.line<any>()
      .x(d => x(d.x))
      .y(d => y(d.y));

    // svg.append('path')
    //   .datum(data)
    //   .attr('fill', 'none')
    //   .attr('stroke', 'steelblue')
    //   .attr('stroke-width', 1.5)
    //   .attr('d', line);

    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 5);
    
    // Add labels
    svg.selectAll('.text')
      .data(data)
      .enter().append('text')
      .attr('x', d => x(d.x))
      .attr('y', d => y(d.y))
      .text(d => d.id)
      .attr('font-size', '15px')
      .attr('dx', '10px')
      .attr('dy', '-10px');
  }
}

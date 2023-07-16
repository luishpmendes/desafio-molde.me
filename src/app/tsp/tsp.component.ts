// Import necessary modules and services
import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import { Locations } from '../locations';
import { TspService } from '../tsp.service';
import { ScaleLinear, Selection, BaseType } from 'd3';
import * as d3 from 'd3';

// Angular component decorator
@Component({
  // Defines the name of the component as used in templates
  selector: 'app-tsp',
  // Path to the HTML template associated with this component
  templateUrl: './tsp.component.html',
  // Path to the CSS file(s) associated with this component
  styleUrls: ['./tsp.component.css']
})
// Implementing AfterViewInit interface for lifecycle hook
export class TSPComponent implements AfterViewInit {
  // Accessing child elements from the DOM
  @ViewChild('chart')
  private chartContainer!: ElementRef;

  // Declaring component properties
  routeLength: number = 0;
  elapsedTime: number = 0;
  gen: number = 0;
  svg!: Selection<SVGSVGElement, unknown, null, any>;
  x!: ScaleLinear<number, number>;
  y!: ScaleLinear<number, number>;
  errorMessage: string = '';

  constructor(private sharedService: SharedService, private tspService: TspService) {}

  // ngAfterViewInit lifecycle hook method, called after Angular has fully initialized a component's view
  ngAfterViewInit(): void {
    this.createChart();
  }

  // Method to create the SVG and Scales
  createScalesAndSvg(): void {
    // Get native DOM element of the chart container
    const element = this.chartContainer.nativeElement;
    // Create x and y scales with domain and range
    this.x = d3.scaleLinear().domain([0, 1000]).range([0, 500]);
    this.y = d3.scaleLinear().domain([0, 1000]).range([500, 0]);
    // Create an SVG element and set its width and height
    this.svg = d3.select(element).append('svg').attr('width', '500').attr('height', '500');
  }

  // Method to create the chart
  createChart(): void {
    this.createScalesAndSvg();
    // Preparing the data for the chart
    // const data = this.locations.data.map(location => ({ id: location.id, x: location.x, y: location.y }));
    this.plotData(this.sharedService.locations);
  }

  // Method to solve TSP problem with various parameters
  tsp(timeLimit: string, maxGen : string, p : string, pe : string, pm : string, rho : string, k : string, m : string, genExchange : string, maxLocalSearchImprov : string, warmStart : boolean) : void {
    // Check for valid input, either time limit or max generations must be greater than 0
    if (Number(timeLimit) == 0 && Number(maxGen) == 0) {
      this.errorMessage = "Either time limit or max generations must be greater than 0";
      return;
    }

    this.routeLength = 0;
    // Get solution from tspService
    let [routeLength, solution, elapsedTime, gen] = this.tspService.solve(this.sharedService.locations, Number(timeLimit), Number(maxGen), Number(p), Number(pe), Number(pm), Number(rho), Number(k), Number(m), Number(genExchange), Number(maxLocalSearchImprov), warmStart);
    this.routeLength = routeLength;
    // Ensure the solution is a loop, ending where it started
    solution.push(solution[0]);
    this.elapsedTime = elapsedTime;
    this.gen = gen;

    // Prepare the data for the chart
    const data = solution.map(location => ({ id: location.id, x: location.x, y: location.y }));

    // Remove the existing SVG before creating a new one
    d3.select('svg').remove();
    this.createScalesAndSvg();
    // Plot the solution on the chart
    this.plotData(data, true);
  }

  // Method to plot the data on the chart
  plotData(data: {id: number, x: number, y: number}[], plotEdges: boolean = false) {
    // If plotEdges is true
    if (plotEdges) {
      // Define line generator function
      const line = d3.line<{id: number, x: number, y: number}>()
      .x(d => this.x(d.x))
      .y(d => this.y(d.y));

      // Plot the edges of the path
      this.svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);
    }

    // Plot each data point as a circle
    this.svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => this.x(d.x))
      .attr('cy', d => this.y(d.y))
      .attr('r', 5);

    // Add labels to the data points
    this.svg.selectAll('.text')
      .data(data)
      .enter().append('text')
      .attr('x', d => this.x(d.x))
      .attr('y', d => this.y(d.y))
      .text(d => d.id)
      .attr('font-size', '15px')
      .attr('dx', '10px')
      .attr('dy', '-10px');
  }

  get locations() {
    return this.sharedService.locations;
  }
}

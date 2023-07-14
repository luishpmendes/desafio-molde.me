import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import { Locations } from '../locations';
import { TspService } from '../tsp.service';
import { ScaleLinear, Selection, BaseType } from 'd3';
import * as d3 from 'd3';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css']
})
export class TSPComponent implements OnInit, AfterViewInit {
  @ViewChild('chart')
  private chartContainer!: ElementRef;

  locations: Locations = {} as Locations;
  routeLength: number = 0;
  elapsedTime: number = 0;
  gen: number = 0;
  svg!: Selection<SVGSVGElement, unknown, null, any>;
  x!: ScaleLinear<number, number>;
  y!: ScaleLinear<number, number>;
  errorMessage: string = '';

  constructor(private sharedService: SharedService, private tspService: TspService) {}

  ngOnInit(): void {
    this.locations = this.sharedService.locations;
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  createScalesAndSvg(): void {
    const element = this.chartContainer.nativeElement;
    this.x = d3.scaleLinear().domain([0, 1000]).range([0, 500]);
    this.y = d3.scaleLinear().domain([0, 1000]).range([500, 0]);
    this.svg = d3.select(element).append('svg').attr('width', '500').attr('height', '500');
  }

  createChart(): void {
    this.createScalesAndSvg();
    const data = this.locations.data.map(location => ({ id: location.id, x: location.x, y: location.y }));
    this.plotData(data);
  }

  tsp(timeLimit: string, maxGen : string, p : string, pe : string, pm : string, rho : string, maxLocalSearchImprov : string, warmStart : boolean) : void {
    if (Number(timeLimit) == 0 && Number(maxGen) == 0) {
      this.errorMessage = "Either time limit or max generations must be greater than 0";
      return;
    }

    this.routeLength = 0;
    let [routeLength, solution, elapsedTime, gen] = this.tspService.solve(this.locations.data, Number(timeLimit), Number(maxGen), Number(p), Number(pe), Number(pm), Number(rho), Number(maxLocalSearchImprov), warmStart);
    this.routeLength = routeLength;
    solution.push(solution[0]);
    this.elapsedTime = elapsedTime;
    this.gen = gen;

    const data = solution.map(location => ({ id: location.id, x: location.x, y: location.y }));

    d3.select('svg').remove();
    this.createScalesAndSvg();
    this.plotData(data, true);
  }

  plotData(data: {id: number, x: number, y: number}[], plotEdges: boolean = false) {
    const line = d3.line<{id: number, x: number, y: number}>()
      .x(d => this.x(d.x))
      .y(d => this.y(d.y));

    if (plotEdges) {
      this.svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);
    }

    this.svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => this.x(d.x))
      .attr('cy', d => this.y(d.y))
      .attr('r', 5);

    // Add labels
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
}

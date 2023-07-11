import { Location } from '../location';

export class Decoder {
  private locations: Location[];
  private dist: number[][];
  private permutation: [number, number][];
  private cycle: number[];

  public constructor(locations: Location[]) {
    this.locations = locations;

    this.dist = Array(locations.length).fill(Array(locations.length).fill(0));

    for(let i = 0; i < locations.length; i++) {
      for(let j = 0; j < locations.length; j++) {
        this.dist[i][j] = Math.sqrt((locations[i].x - locations[j].x)*(locations[i].x - locations[j].x) + (locations[i].y - locations[j].y)*(locations[i].y - locations[j].y));
      }
    }

    this.permutation = Array(locations.length - 1).fill([0, 0]);
    this.cycle = Array(locations.length).fill(0);
  }

  public decode(chromosome: Array<number>): number {
    let cost = 0.0;

    for (let i = 0; i + 1 < chromosome.length; i++) {
      this.permutation[i] = [chromosome[i], i + 1];
    }

    this.permutation.sort((a, b) => a[0] - b[0]);

    this.cycle[0] = 0;

    for (let i = 0; i + 1 < chromosome.length; i++) {
      this.cycle[i + 1] = this.permutation[i][1];
    }

    // TODO: apply the 2-opt local search here

    for (let i = 0; i + 1 < chromosome.length; i++) {
      cost += this.dist[this.cycle[i]][this.cycle[i + 1]];
    }

    cost += this.dist[this.cycle[chromosome.length - 1]][this.cycle[0]];

    return cost;
  }

  public getSolution(chromosome: Array<number>): Location[] {
    let solution = this.locations.slice();

    for (let i = 0; i + 1 < chromosome.length; i++) {
      this.permutation[i] = [chromosome[i], i + 1];
    }

    this.permutation.sort((a, b) => a[0] - b[0]);

    solution[0] = this.locations[0];

    for (let i = 0; i + 1 < chromosome.length; i++) {
      solution[i + 1] = this.locations[this.permutation[i][1]];
    }

    return solution;
  }
}

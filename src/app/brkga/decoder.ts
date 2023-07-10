import { Location } from '../location';

export class Decoder {
  private locations: Location[];
  private dist: number[][];
  private permutation: [number, number][];

  public constructor(locations: Location[]) {
    this.locations = locations;

    this.dist = Array(locations.length).fill(Array(locations.length).fill(0));

    for(let i = 0; i < locations.length; i++) {
      for(let j = 0; j < locations.length; j++) {
        this.dist[i][j] = Math.sqrt((locations[i].x - locations[j].x)*(locations[i].x - locations[j].x) + (locations[i].y - locations[j].y)*(locations[i].y - locations[j].y));
      }
    }
  }

  public decode(chromosome: Array<number>): number {
    /* TODO: Implement this method */
    return 0;
  }
}
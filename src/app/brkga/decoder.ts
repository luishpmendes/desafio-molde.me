import { Location } from '../location';

export class Decoder {
  private locations: Location[];
  private maxLocalSearchImprov: number;
  private startTime: number;
  private timeLimit: number;
  private dist: number[][];
  private permutation: [number, number][];
  private cycle: number[];
  private indexes: number[];

  public constructor(locations: Location[], dist: number[][], maxLocalSearchImprov: number, startTime: number, timeLimit: number) {
    this.locations = locations;
    this.maxLocalSearchImprov = maxLocalSearchImprov;
    this.startTime = startTime;
    this.timeLimit = timeLimit;

    this.dist = dist

    this.permutation = Array(locations.length - 1);
    this.cycle = Array(locations.length);
    this.indexes = Array(locations.length);

    for(let i = 0; i < locations.length; i++) {
      this.indexes[i] = i;
    }
  }

  static shuffle(array: Array<any>): Array<any> {
    for(let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }

    return array
  }

  static twoOpt(cycle: number[], dist: number[][], maxLocalSearchImprov: number, startTime: number, timeLimit: number, indexes: number[]): void {
    let numImprov = 0;
    let foundImprov = true;
    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    while (foundImprov && numImprov < maxLocalSearchImprov && elapsedTime < timeLimit) {
      foundImprov = false;
      Decoder.shuffle(indexes);

      for (let i = 0; i + 1 < indexes.length && !foundImprov; i++) {
        let iIndex = indexes[i];
        let iNextIndex = (indexes[i] + 1) % indexes.length;

        for (let j = i + 1; j < indexes.length && !foundImprov; j++) {
          let jIndex = indexes[j];
          let jNextIndex = (indexes[j] + 1) % indexes.length;
          
          let deltaLength = dist[cycle[iIndex]][cycle[jIndex]]
                          + dist[cycle[iNextIndex]][cycle[jNextIndex]]
                          - dist[cycle[iIndex]][cycle[iNextIndex]]
                          - dist[cycle[jIndex]][cycle[jNextIndex]];

          if (deltaLength < -Number.EPSILON) {
            foundImprov = true;
            numImprov++;

            if (iNextIndex < jIndex) {
              while (iNextIndex < jIndex) {
                [cycle[iNextIndex], cycle[jIndex]] = [cycle[jIndex], cycle[iNextIndex]];
                iNextIndex++;
                jIndex--;
              }
            } else {
              while (jNextIndex < iIndex) {
                [cycle[jNextIndex], cycle[iIndex]] = [cycle[iIndex], cycle[jNextIndex]];
                jNextIndex++;
                iIndex--;
              }
            }
          }
        }
      }

      elapsedTime = (new Date().getTime() - startTime) / 1000;
    }
  }

  static twoOptWithoutIndexes(cycle: number[], dist: number[][], maxLocalSearchImprov: number, startTime: number, timeLimit: number): void {
    let indexes = Array(cycle.length);

    for(let i = 0; i < cycle.length; i++) {
      indexes[i] = i;
    }

    Decoder.twoOpt(cycle, dist, maxLocalSearchImprov, startTime, timeLimit, indexes);
  }

  private twoOpt(): void {
    Decoder.twoOpt(this.cycle, this.dist, this.maxLocalSearchImprov, this.startTime, this.timeLimit, this.indexes);
  }

  public decode(chromosome: Array<number>): number {
    let cost = 0.0;

    for (let i = 0; i < chromosome.length; i++) {
      this.permutation[i] = [chromosome[i], i + 1];
    }

    this.permutation.sort((a, b) => a[0] - b[0]);

    this.cycle[0] = 0;

    for (let i = 0; i < chromosome.length; i++) {
      this.cycle[i + 1] = this.permutation[i][1];
    }

    this.twoOpt();
    Decoder.encode(this.cycle, chromosome, this.permutation);

    for (let i = 0; i + 1 < this.cycle.length; i++) {
      cost += this.dist[this.cycle[i]][this.cycle[i + 1]];
    }

    cost += this.dist[this.cycle[this.cycle.length - 1]][this.cycle[0]];

    return cost;
  }

  static encode(cycle : number[], chromosome: Array<number>, permutation: [number, number][]) {
    while (cycle[0] != 0) {
      let temp = cycle.shift();

      if (temp != undefined) {
        cycle.push(temp);
      } else {
        break;
      }
    }

    chromosome.sort((a, b) => a - b);

    for (let i = 0; i < chromosome.length; i++) {
      permutation[i] = [cycle[i + 1], chromosome[i]];
    }

    permutation.sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < chromosome.length; i++) {
      chromosome[i] = permutation[i][1];
    }
  }

  static encodeWithoutPermutation(cycle : number[], chromosome: Array<number>) {
    let permutation = Array(cycle.length - 1);

    Decoder.encode(cycle, chromosome, permutation);
  }

  static encodeNewChromosome(cycle : number[]) : Array<number> {
    let chromosome = Array(cycle.length - 1);

    for (let i = 0; i < chromosome.length; i++) {
      chromosome[i] = Math.random();
    }

    Decoder.encodeWithoutPermutation(cycle, chromosome);

    return chromosome;
  }

  public getSolution(chromosome: Array<number>): Location[] {
    let solution = this.locations.slice();

    for (let i = 0; i < chromosome.length; i++) {
      this.permutation[i] = [chromosome[i], i + 1];
    }

    this.permutation.sort((a, b) => a[0] - b[0]);

    solution[0] = this.locations[0];

    for (let i = 0; i < chromosome.length; i++) {
      solution[i + 1] = this.locations[this.permutation[i][1]];
    }

    return solution;
  }
}

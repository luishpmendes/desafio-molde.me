// Import Location template
import { Location } from '../location';

// Decoder class to solve Traveling Salesman Problem (TSP).
export class Decoder {
  // An array of locations.
  private locations: Location[];
  // The maximum number of local search improvements allowed.
  private maxLocalSearchImprov: number;
  // The start time of the algorithm.
  private startTime: number;
  // The time limit for the algorithm to run.
  private timeLimit: number;
  // A 2D array representing the distances between each pair of locations.
  private dist: number[][];
  // A 2D array for storing the genetic chromosome permutation.
  private permutation: [number, number][];
  // An array for storing the sequence of visited locations (cycle).
  private cycle: number[];
  // An array for storing indexes, used in shuffling the cycle in two-opt heuristic.
  private indexes: number[];

  // Constructor of the Decoder class.
  public constructor(locations: Location[], dist: number[][], maxLocalSearchImprov: number, startTime: number, timeLimit: number) {
    // Initialization of class variables.
    this.locations = locations;
    this.maxLocalSearchImprov = maxLocalSearchImprov;
    this.startTime = startTime;
    this.timeLimit = timeLimit;
    this.dist = dist

    this.permutation = Array(locations.length - 1);
    this.cycle = Array(locations.length);
    this.indexes = Array(locations.length);

    // Filling the indexes array.
    for(let i = 0; i < locations.length; i++) {
      this.indexes[i] = i;
    }
  }

  // Static method for shuffling a given array using Fisher-Yates shuffle.
  static shuffle(array: Array<any>): Array<any> {
    for(let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap array[i] and array[j].
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array
  }

  // Static method to apply the 2-opt local search heuristic to the cycle. 
  static twoOpt(cycle: number[], dist: number[][], maxLocalSearchImprov: number, startTime: number, timeLimit: number, indexes: number[]): void {
    let numImprov = 0;
    let foundImprov = true;
    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    // Continue searching for improvements until no further improvement is found, or maximum number of improvements is reached, or time limit is exceeded.
    while (foundImprov && numImprov < maxLocalSearchImprov && elapsedTime < timeLimit) {
      foundImprov = false;
      // Shuffle the indexes.
      Decoder.shuffle(indexes);

      // Loop through the shuffled indexes and attempt to make an improvement.
      for (let i = 0; i + 1 < indexes.length && !foundImprov; i++) {
        let iIndex = indexes[i];
        let iNextIndex = (indexes[i] + 1) % indexes.length;

        for (let j = i + 1; j < indexes.length && !foundImprov; j++) {
          let jIndex = indexes[j];
          let jNextIndex = (indexes[j] + 1) % indexes.length;

          // Calculate the change in length that would result from swapping i and j.
          let deltaLength = dist[cycle[iIndex]][cycle[jIndex]]
                          + dist[cycle[iNextIndex]][cycle[jNextIndex]]
                          - dist[cycle[iIndex]][cycle[iNextIndex]]
                          - dist[cycle[jIndex]][cycle[jNextIndex]];

          // If the swap results in an improvement, make the swap.
          if (deltaLength < -Number.EPSILON) {
            foundImprov = true;
            numImprov++;

            // Swap i and j in the cycle.
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

      // Update the elapsed time.
      elapsedTime = (new Date().getTime() - startTime) / 1000;
    }
  }

  // Static method that generates indexes array and calls the twoOpt method.
  static twoOptWithoutIndexes(cycle: number[], dist: number[][], maxLocalSearchImprov: number, startTime: number, timeLimit: number): void {
    let indexes = Array(cycle.length);

    for(let i = 0; i < cycle.length; i++) {
      indexes[i] = i;
    }

    Decoder.twoOpt(cycle, dist, maxLocalSearchImprov, startTime, timeLimit, indexes);
  }

  // Private method that calls the static twoOpt method with class properties.
  private twoOpt(): void {
    Decoder.twoOpt(this.cycle, this.dist, this.maxLocalSearchImprov, this.startTime, this.timeLimit, this.indexes);
  }

  // Public method that decodes a chromosome, performs 2-opt optimization, and calculates the cost.
  public decode(chromosome: Array<number>): number {
    let cost = 0.0;

    // Fill the permutation array with the chromosome.
    for (let i = 0; i < chromosome.length; i++) {
      this.permutation[i] = [chromosome[i], i + 1];
    }

    // Sort the permutation array.
    this.permutation.sort((a, b) => a[0] - b[0]);

    // Set the start of the cycle.
    this.cycle[0] = 0;

    // Create the cycle based on the permutation.
    for (let i = 0; i < chromosome.length; i++) {
      this.cycle[i + 1] = this.permutation[i][1];
    }

    // Perform 2-opt optimization on the cycle.
    this.twoOpt();
    // Encode the optimized cycle back into the chromosome.
    Decoder.encode(this.cycle, chromosome, this.permutation);

    // Calculate the cost of the cycle.
    for (let i = 0; i + 1 < this.cycle.length; i++) {
      cost += this.dist[this.cycle[i]][this.cycle[i + 1]];
    }

    // Add the cost to return to the start of the cycle.
    cost += this.dist[this.cycle[this.cycle.length - 1]][this.cycle[0]];

    return cost;
  }

  // Static method to encode a cycle back into a chromosome.
  static encode(cycle : number[], chromosome: Array<number>, permutation: [number, number][]) {
    // Shift the cycle until the start city is at the beginning.
    while (cycle[0] != 0) {
      let temp = cycle.shift();
      if (temp != undefined) {
        cycle.push(temp);
      } else {
        break;
      }
    }

    // Sort the chromosome.
    chromosome.sort((a, b) => a - b);

    // Build the permutation based on the cycle.
    for (let i = 0; i < chromosome.length; i++) {
      permutation[i] = [cycle[i + 1], chromosome[i]];
    }

    // Sort the permutation.
    permutation.sort((a, b) => a[0] - b[0]);

    // Build the chromosome based on the permutation.
    for (let i = 0; i < chromosome.length; i++) {
      chromosome[i] = permutation[i][1];
    }
  }

  // Static method to encode a cycle into a chromosome, creating a new permutation array.
  static encodeWithoutPermutation(cycle : number[], chromosome: Array<number>) {
    let permutation = Array(cycle.length - 1);
    Decoder.encode(cycle, chromosome, permutation);
  }

  // Static method to create a new random chromosome and encode a cycle into it.
  static encodeNewChromosome(cycle : number[]) : Array<number> {
    let chromosome = Array(cycle.length - 1);

    for (let i = 0; i < chromosome.length; i++) {
      chromosome[i] = Math.random();
    }

    Decoder.encodeWithoutPermutation(cycle, chromosome);

    return chromosome;
  }

  // Method to get the solution path (locations sequence) from a chromosome.
  public getSolution(chromosome: Array<number>): Location[] {
    let solution = this.locations.slice();

    for (let i = 0; i < chromosome.length; i++) {
      this.permutation[i] = [chromosome[i], i + 1];
    }

    this.permutation.sort((a, b) => a[0] - b[0]);

    // Build the solution based on the permutation.
    solution[0] = this.locations[0];
    for (let i = 0; i < chromosome.length; i++) {
      solution[i + 1] = this.locations[this.permutation[i][1]];
    }

    return solution;
  }
}

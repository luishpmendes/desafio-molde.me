// Import required classes and packages
import { Injectable } from '@angular/core';
// A class to represent a geographic location
import { Location } from './location';
// A class used for encoding and decoding solutions
import { Decoder} from './brkga/decoder';
// An implementation of Biased Random Key Genetic Algorithm
import { BRKGA } from './brkga/brkga';
// A data structure used to handle disjoint-set operations
import { UnionFind } from './unionfind/unionfind';

// Make this class injectable across the application
@Injectable({
  providedIn: 'root'
})
export class TspService {
  // Initialize the service
  constructor() { }

  // Static method to check if the termination criteria for the algorithm is met
  // Termination can be due to reaching the maximum time limit or the maximum number of generations
  static areTerminationCriteriaMet(startTime : number, timeLimit : number, gen : number, maxGen : number) : boolean {
    // Calculate elapsed time in seconds
    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    // Check if time limit is exceeded
    if (timeLimit > 0 && elapsedTime >= timeLimit) {
      return true;
    }

    // Check if max generations limit is reached
    if (maxGen > 0 && gen >= maxGen) {
      return true;
    }

    // If none of the above conditions are met, continue execution
    return false;
  }

  // Private static method to run Kruskal's algorithm
  // This algorithm is used to find the minimum spanning tree (MST) for a connected, undirected graph
  private static kruskal(n : number, edges : [number, [number, number]][]) : number[][] {
    // Initialize adjacency lists for MST
    let adjMST : number[][] = Array(n);

    for (let i = 0; i < n; i++) {
      adjMST[i] = Array();
    }

    // Initialize UnionFind data structure to keep track of disjoint sets
    let uf = new UnionFind(n);

    // Sort edges by weight in ascending order
    edges.sort((a, b) => a[0] - b[0]);

    // Process each edge in order
    for (let edge of edges) {
      // If the nodes of the edge are not in the same set, union them and add the edge to MST
      if (!uf.isSameSet(edge[1][0], edge[1][1])) {
        uf.unionSet(edge[1][0], edge[1][1]);
        adjMST[edge[1][0]].push(edge[1][1]);
        adjMST[edge[1][1]].push(edge[1][0]);
      }
    }

    // Return the MST as adjacency matrix
    return adjMST;
  }

  // Private static method to implement a 2-approximation greedy algorithm for TSP
  // The method starts by choosing a pair of closest vertices and then continuously adds the closest unvisited node to the current cycle.
  private static greedy2Approx(n : number, dist : number[][]) : number[] {
    // The cycle to be returned
    let cycle : number[] = Array();
    // The set of unadded vertices
    let unaddedVertices = new Set<number>();
    // Variable to store the minimum weight
    let minWeight : number;
    // The index of where to add new vertices
    let index : number = 0;
    // The vertex to be added
    let w : number = 0;

    // Add all vertices to the unaddedVertices set
    for (let v = 0; v < n; v++) {
      unaddedVertices.add(v);
    }

    // Initially consider the edge between vertex 0 and 1 as the minimum weight edge
    cycle = [0, 1];
    minWeight = dist[0][1];

    // Find the pair of closest vertices
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (minWeight > dist[u][v]) {
          minWeight = dist[u][v];
          cycle = [u, v];
        }
      }
    }

    // Remove the vertices from the unaddedVertices set
    unaddedVertices.delete(cycle[0]);
    unaddedVertices.delete(cycle[1]);

    // While there are still vertices to be added to the cycle
    while (unaddedVertices.size > 0) {
      // By default, consider adding the next vertex at the beginning of the cycle
      for (let v of unaddedVertices) {
        minWeight = dist[cycle[0]][v];
        index = 0;
        w = v;
        break;
      }

      // Find the closest vertex to any vertex in the cycle and record where it should be inserted
      for (let i = 0; i < cycle.length; i++) {
        for (let v of unaddedVertices) {
          if (minWeight > dist[cycle[i]][v]) {
            minWeight = dist[cycle[i]][v];
            index = i;
            w = v;
          }
        }
      }

      // Insert the closest vertex at the appropriate place in the cycle
      cycle.splice(index + 1, 0, w);
      // Remove the added vertex from unaddedVertices set
      unaddedVertices.delete(w);
    }

    // Rotate cycle until vertex 0 is at the beginning
    while (cycle[0] != 0) {
      let temp = cycle.shift();

      if (temp != undefined) {
        cycle.push(temp);
      } else {
        break;
      }
    }

    // Return the resulting cycle
    return cycle;
  }

  // Private static method to implement a 2-approximation algorithm for TSP using MST
  // The method first constructs a MST, then creates a cycle by visiting each node exactly once
  private static mst2Approx(n : number, edges : [number, [number, number]][]) : number[] {
    // The current Eulerian circuit
    let circuit : number[] = Array();
    // The adjacency list representation of the MST, 
    let adjMST : number[][] = TspService.kruskal(n, edges);
    // The current path being explored
    let curr_path : number[] = Array();
    // The current vertex
    let u : number = 0;

    // Begin exploration at vertex 0
    curr_path.push(u);

    // Continue exploring until all vertices have been visited
    while (curr_path.length > 0) {
      // If the current vertex has neighbors not in the circuit
      if (adjMST[u].length > 0) {
        curr_path.push(u);
        // Get the last neighbor in the list
        let v = adjMST[u][adjMST[u].length - 1];
        // Remove the neighbor from the adjacency list
        adjMST[u].pop();
        // Move to the neighbor
        u = v;
      } else { // Otherwise
        // Add it to the circuit
        circuit.push(u);
        // Backtrack to the previous vertex in the path
        u = curr_path[curr_path.length - 1];
        curr_path.pop();
      }
    }

    // Rotate the circuit until vertex 0 is at the beginning
    while (circuit[0] != 0) {
      let temp = circuit.shift();

      if (temp != undefined) {
        circuit.push(temp);
      } else {
        break;
      }
    }

    // Cycle to be returned
    let cycle : number[] = Array();
    // Array to keep track of visited vertices
    let visited : boolean[] = Array(n);

    // Set all vertices as not visited
    for (let v = 0; v < n; v++) {
      visited[v] = false;
    }

    // Add the first vertex to the cycle and mark it as visited
    cycle.push(circuit[0]);
    visited[circuit[0]] = true;

    // Traverse the circuit, adding each unvisited vertex to the cycle and marking it as visited
    for (let i = 1; i < circuit.length; i++) {
      if (!visited[circuit[i]]) {
        cycle.push(circuit[i]);
        visited[circuit[i]] = true;
      }
    }

    // Return the final cycle
    return cycle;
  }

  // Public method to solve the TSP problem given a list of locations and algorithm parameters
  // It constructs the distance matrix, runs the BRKGA algorithm, and returns the best solution found along with its fitness
  solve(locations: Location[], timeLimit: number, maxGen: number, p: number, pe: number, pm: number, rho: number, k: number, maxLocalSearchImprov: number, warmStart: boolean): [number, Location[], number, number] {
    // Record the start time of the algorithm
    let startTime = new Date().getTime();

    // Initialize the distance matrix
    let dist = Array(locations.length);
    for(let i = 0; i < dist.length; i++) {
      dist[i] = Array(locations.length);
    }

    // Calculate pairwise Euclidean distances between locations
    for(let i = 0; i < locations.length; i++) {
      for(let j = 0; j < locations.length; j++) {
        dist[i][j] = Math.sqrt((locations[i].x - locations[j].x)*(locations[i].x - locations[j].x) + (locations[i].y - locations[j].y)*(locations[i].y - locations[j].y));
      }
    }

    // Create the decoder for interpreting BRKGA's chromosome representation
    let decoder = new Decoder(locations, dist, maxLocalSearchImprov, startTime, timeLimit);
    // Initialize the BRKGA algorithm
    let algorithm = new BRKGA(locations.length - 1, p, pe, pm, rho, decoder, k);
    // Track the number of generations
    let gen = 0;

    // If the warmStart flag is set, generate initial chromosomes from greedy and MST heuristic solutions
    if (warmStart) {
      // Generate initial chromosome from a greedy solution
      let greedyCycle = TspService.greedy2Approx(locations.length, dist);
      let greedyChromosome = Decoder.encodeNewChromosome(greedyCycle);

      // Generate a list of edges
      let edges : [number, [number, number]][] = Array();
      for(let i = 0; i < locations.length; i++) {
        for(let j = i + 1; j < locations.length; j++) {
          edges.push([dist[i][j], [i, j]]);
        }
      }

      // Generate initial chromosome from a MST solution
      let mstCycle = TspService.mst2Approx(locations.length, edges);
      let mstChromosome = Decoder.encodeNewChromosome(mstCycle);

      // Inject these chromosomes into the initial populations
      for (let i = 0; i < k; i++) {
        algorithm.injectChromosomes([greedyChromosome, mstChromosome], i);
      }
    }

    // Run the algorithm until termination criteria are met (time limit or generation count)
    while (!TspService.areTerminationCriteriaMet(startTime, timeLimit, gen, maxGen)) {
      // Evolve the population to the next generation
      algorithm.evolve();
      gen++;
    }

    let bestFitness = algorithm.getBestFitness();
    let bestChromosome = algorithm.getBestChromosome();
    let bestSolution = decoder.getSolution(bestChromosome);

    // Calculate elapsed time of the algorithm
    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    // Return the best solution found, its fitness, the elapsed time, and the number of generations
    return [bestFitness, bestSolution, elapsedTime, gen];
  }
}

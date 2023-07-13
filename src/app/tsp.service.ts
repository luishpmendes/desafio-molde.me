import { Injectable } from '@angular/core';
import { Location } from './location';
import { Decoder} from './brkga/decoder';
import { BRKGA } from './brkga/brkga';
import { UnionFind } from './unionfind/unionfind';

@Injectable({
  providedIn: 'root'
})
export class TspService {

  constructor() { }

  static areTerminationCriteriaMet(startTime : number, timeLimit : number, gen : number, maxGen : number) : boolean {
    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    if (timeLimit > 0 && elapsedTime >= timeLimit) {
      return true;
    }

    if (maxGen > 0 && gen >= maxGen) {
      return true;
    }
    
    return false;
  }

  private static kruskal(n : number, edges : [number, [number, number]][]) : number[][] {
    let adjMST : number[][] = Array(n);
    
    for (let i = 0; i < n; i++) {
      adjMST[i] = Array();
    }

    let i = 0;
    let uf = new UnionFind(n);

    edges.sort((a, b) => a[0] - b[0]);

    for (let edge of edges) {
      if (!uf.isSameSet(edge[1][0], edge[1][1])) {
        uf.unionSet(edge[1][0], edge[1][1]);
        adjMST[edge[1][0]].push(edge[1][1]);
        adjMST[edge[1][1]].push(edge[1][0]);
      }
    }

    return adjMST;
  }

  private static greedy2Approx(n : number, dist : number[][]) : number[] {
    let cycle : number[] = Array();
    let unaddedVertices = new Set<number>();
    let minWeight : number;
    let index : number = 0;
    let w : number = 0;

    for (let v = 0; v < n; v++) {
      unaddedVertices.add(v);
    }

    cycle = [0, 1];
    minWeight = dist[0][1];

    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (minWeight > dist[u][v]) {
          minWeight = dist[u][v];
          cycle = [u, v];
        }
      }
    }

    unaddedVertices.delete(cycle[0]);
    unaddedVertices.delete(cycle[1]);

    while (unaddedVertices.size > 0) {
      for (let v of unaddedVertices) {
        minWeight = dist[cycle[0]][v];
        index = 0;
        w = v;
        break;
      }

      for (let i = 0; i < cycle.length; i++) {
        for (let v of unaddedVertices) {
          if (minWeight > dist[cycle[i]][v]) {
            minWeight = dist[cycle[i]][v];
            index = i;
            w = v;
          }
        }
      }

      // insert w between cycle[index] and cycle[index + 1]
      cycle.splice(index + 1, 0, w);
      unaddedVertices.delete(w);
    }

    while (cycle[0] != 0) {
      let temp = cycle.shift();

      if (temp != undefined) {
        cycle.push(temp);
      } else {
        break;
      }
    }

    return cycle;
  }

  private static mst2Approx(n : number, edges : [number, [number, number]][]) : number[] {
    let circuit : number[] = Array();
    let adjMST : number[][] = TspService.kruskal(n, edges);
    let curr_path : number[] = Array();
    let u : number = 0;

    curr_path.push(u);

    while (curr_path.length > 0) {
      if (adjMST[u].length > 0) {
        curr_path.push(u);
        let v = adjMST[u][adjMST[u].length - 1];
        adjMST[u].pop();
        u = v;
      } else {
        circuit.push(u);
        u = curr_path[curr_path.length - 1];
        curr_path.pop();
      }
    }

    while (circuit[0] != 0) {
      let temp = circuit.shift();

      if (temp != undefined) {
        circuit.push(temp);
      } else {
        break;
      }
    }

    let cycle : number[] = Array();
    let visited : boolean[] = Array(n);

    for (let v = 0; v < n; v++) {
      visited[v] = false;
    }

    cycle.push(circuit[0]);
    visited[circuit[0]] = true;

    for (let i = 1; i < circuit.length; i++) {
      if (!visited[circuit[i]]) {
        cycle.push(circuit[i]);
        visited[circuit[i]] = true;
      }
    }

    return cycle;
  }

  solve(locations: Location[], timeLimit: number, maxGen: number, p: number, pe: number, pm: number, rho: number, maxLocalSearchImprov: number, warmStart: boolean): [number, Location[], number, number] {
    let startTime = new Date().getTime();
    let dist = Array(locations.length);

    for(let i = 0; i < dist.length; i++) {
      dist[i] = Array(locations.length);
    }

    for(let i = 0; i < locations.length; i++) {
      for(let j = 0; j < locations.length; j++) {
        dist[i][j] = Math.sqrt((locations[i].x - locations[j].x)*(locations[i].x - locations[j].x) + (locations[i].y - locations[j].y)*(locations[i].y - locations[j].y));
      }
    }

    let decoder = new Decoder(locations, dist, maxLocalSearchImprov, startTime, timeLimit);
    let algorithm = new BRKGA(locations.length - 1, p, pe, pm, rho, decoder);
    let gen = 0;

    if (warmStart) {
      let greedyCycle = TspService.greedy2Approx(locations.length, dist);
      let greedyChromosome = Decoder.encodeNewChromosome(greedyCycle);
      let edges : [number, [number, number]][] = Array();

      for(let i = 0; i < locations.length; i++) {
        for(let j = i + 1; j < locations.length; j++) {
          edges.push([dist[i][j], [i, j]]);
        }
      }

      let mstCycle = TspService.mst2Approx(locations.length, edges);
      let mstChromosome = Decoder.encodeNewChromosome(mstCycle);

      algorithm.injectChromosomes([greedyChromosome, mstChromosome], 0);
    }

    while (!TspService.areTerminationCriteriaMet(startTime, timeLimit, gen, maxGen)) {
      algorithm.evolve();
      gen++;
    }

    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    return [algorithm.getBestFitness(), decoder.getSolution(algorithm.getBestChromosome()), elapsedTime, gen];
  }
}

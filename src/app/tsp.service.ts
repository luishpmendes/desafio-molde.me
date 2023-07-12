import { Injectable } from '@angular/core';
import { Location } from './location';
import { Decoder} from './brkga/decoder';
import { BRKGA } from './brkga/brkga';

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

  solve(locations : Location[], timeLimit : number, maxGen : number, p : number, pe : number, pm : number, rho : number, maxLocalSearchImprov : number) : [number, Location[], number, number] {
    let startTime = new Date().getTime();
    let decoder = new Decoder(locations, maxLocalSearchImprov, startTime, timeLimit);
    let algorithm = new BRKGA(locations.length - 1, p, pe, pm, rho, decoder);
    let gen = 0;

    while (!TspService.areTerminationCriteriaMet(startTime, timeLimit, gen, maxGen)) {
      algorithm.evolve();
      gen++;
    }

    let elapsedTime = (new Date().getTime() - startTime) / 1000;

    return [algorithm.getBestFitness(), decoder.getSolution(algorithm.getBestChromosome()), elapsedTime, gen];
  }
}

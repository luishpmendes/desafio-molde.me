import { Injectable } from '@angular/core';
import { Location } from './location';
import { Decoder} from './brkga/decoder';
import { BRKGA } from './brkga/brkga';

@Injectable({
  providedIn: 'root'
})
export class TspService {

  constructor() { }

  static getElapsedTime(startTime : number) : number {
    return (new Date().getTime() - startTime) / 1000;
  }

  static areTerminationCriteriaMet(startTime : number, timeLimit : number, gen : number, maxGen : number) : boolean {
    return (timeLimit > 0 && TspService.getElapsedTime(startTime) >= timeLimit) || (maxGen > 0 && gen >= maxGen);
  }

  solve(locations : Location[], timeLimit : number, maxGen : number, p : number, pe : number, pm : number, rho : number) : [number, Location[]] {
    let startTime = new Date().getTime();
    let decoder = new Decoder(locations);
    let algorithm = new BRKGA(locations.length - 1, p, pe, pm, rho, decoder);
    let gen = 0;

    while (!TspService.areTerminationCriteriaMet(startTime, timeLimit, gen, maxGen)) {
      algorithm.evolve();
      gen++;
    }

    return [algorithm.getBestFitness(), decoder.getSolution(algorithm.getBestChromosome())];
  }
}

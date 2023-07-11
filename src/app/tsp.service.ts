import { Injectable } from '@angular/core';
import { Location } from './location';
import { Decoder} from './brkga/decoder';
import { BRKGA } from './brkga/brkga';

@Injectable({
  providedIn: 'root'
})
export class TspService {

  constructor() { }

  solve(locations : Location[], gen : number, p : number, pe : number, pm : number, rho : number) : [number, Location[]] {
    let decoder = new Decoder(locations);
    let algorithm = new BRKGA(locations.length - 1, p, pe, pm, rho, decoder);

    for (let i = 0; i < gen; i++) {
      algorithm.evolve();
    }

    return [algorithm.getBestFitness(), decoder.getSolution(algorithm.getBestChromosome())];
  }
}

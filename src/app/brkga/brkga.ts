import { Population } from './population';

export class BRKGA {
  // Hyperparameters:
  
  // number of genes in the chromosome
  n: number;
  // number of elements in the population
  p: number;
  // number of elite items in the population
  pe: number;
  // number of mutants introduced at each generation into the population
  pm: number;
  // probability that an offspring inherits the allele of its elite parent
  rhoe: number;

  // Templates:

  // reference to the random number generator
  // refRNG: any;
  // reference to the problem-dependent Decoder
  refDecoder: any;

  // Parallel populations parameters:

  // number of independent parallel populations
  K: number;
  
  // Data:

  // previous populations
  previous: Population[];
  // current populations
  current: Population[];

  constructor(n: number, p: number, pe: number, pm: number, rhoe: number, refDecoder: any, /*refRNG: any,*/ K = 1, /*MAX_THREADS = 1*/) {
    // Initialization code here
    this.n = n;
    this.p = p;
    this.pe = Math.floor(pe * p);
    this.pm = Math.floor(pm * p);
    this.rhoe = rhoe;
    this.refDecoder = refDecoder;
    // this.refRNG = refRNG;
    this.K = K;
    // this.MAX_THREADS = MAX_THREADS;
    this.previous = [];
    this.current = [];
    this.previous = new Array<Population>(K);
    this.current = new Array<Population>(K);

    // Error check
    if (this.n == 0) {
      throw new RangeError("Chromosome size equals zero.");
    }

    if (this.p == 0) {
      throw new RangeError("Population size equals zero.");
    }

    if (this.pe == 0) {
      throw new RangeError("Elite-set size equals zero.");
    }

    if (this.pe > this.p) {
      throw new RangeError("Elite-set size greater than population size (pe > p).");
    }

    if (this.pm > this.p) {
      throw new RangeError("Mutant-set size greater than population size (pm > p).");
    }

    if (this.pe + this.pm > this.p) {
      throw new RangeError("elite + mutant sets greater than population size (pe + pm > p).");
    }

    if (this.K == 0) {
      throw new RangeError("Number of parallel populations cannot be zero.");
    }

    // Initialize and decode each chromosome of the current population, then copy to previous
    for(let i = 0; i < K; i++) {
      this.current[i] = new Population(n, p);
      this.initialize(i);
      // this.previous[i] = new Population(this.current[i]);
      this.previous[i] = new Population(n, p);
    }
  }

  // Other methods here
  reset(): void { 
    for(let i = 0; i < this.K; ++i) {
      this.initialize(i);
    }
  }

	/**
	 * Evolve the current populations following the guidelines of BRKGAs
	 * @param generations number of generations (must be even and nonzero)
	 */
  evolve(generations: number = 1): void {
    // Evolve population
    if(generations === 0) {
      throw new RangeError("Cannot evolve for 0 generations.");
    }

    for(let i = 0; i < generations; i++) {
      for(let j = 0; j < this.K; j++) {
        this.evolution(this.current[j], this.previous[j]);	// First evolve the population (curr, next)

        // TypeScript (JavaScript) doesn't have a built-in swap, 
        // so we need to manually swap the elements
        let temp = this.current[j];
        this.current[j] = this.previous[j];
        this.previous[j] = temp;
      }
    }
  }

	/**
	 * Exchange elite-solutions between the populations
	 * @param M number of elite chromosomes to select from each population
	 */
  exchangeElite(M: number): void {
    if(M === 0 || M >= this.p) {
      throw new RangeError("M cannot be zero or >= p.");
    }

    for(let i = 0; i < this.K; i++) {
      // Population i will receive some elite members from each Population j below:
      let dest = this.p - 1;	// Last chromosome of i (will be updated below)

      for(let j = 0; j < this.K; j++) {
        if(j === i) {
          continue;
        }

        // Copy the M best of Population j into Population i:
        for(let m = 0; m < M; m++) {
          // Copy the m-th best of Population j into the 'dest'-th position of Population i:
          const bestOfJ = this.current[j].getChromosome(m);

          // JavaScript doesn't have a built-in copy, 
          // so we need to manually copy the elements
          const destChromosome = this.current[i].getChromosome(dest);

          for(let n = 0; n < bestOfJ.length; n++) {
            destChromosome[n] = bestOfJ[n];
          }

          this.current[i].fitness[dest].first = this.current[j].fitness[m].first;

          dest--;
        }
      }
    }

    for(let j = 0; j < this.K; ++j) {
      this.current[j].sortFitness();
    }
  }

	/**
	 * Returns the current population
	 */
  getPopulation(k: number): Population {
    if(k >= this.K) {
      throw new RangeError("Invalid population identifier.");
    }
    return this.current[k];
  }

	/**
	 * Returns the chromosome with best fitness so far among all populations
	 */
  getBestChromosome(): Array<number> {
    let bestK = 0;

    for(let i = 1; i < this.K; i++) {
      if(this.current[i].getBestFitness() < this.current[bestK].getBestFitness()) {
        bestK = i;
      }
    }
    
    return this.current[bestK].getChromosome(0);	// The top one :-)
  }

	/**
	 * Returns the best fitness found so far among all populations
	 */
  getBestFitness() : number {
    let best = this.current[0].fitness[0].first;

    for(let i = 1; i < this.K; i++) {
      if(this.current[i].fitness[0].first < best) {
        best = this.current[i].fitness[0].first;
      }
    }

    return best;
  }

  // Return copies to the internal parameters:

  getN(): number {
    return this.n;
  }

  getP(): number {
    return this.p;
  }

  getPe(): number {
    return this.pe;
  }

  getPm(): number {
    return this.pm;
  }

  getPo() : number {
    return this.p - this.pe - this.pm;
  }

  getRhoe(): number {
    return this.rhoe;
  }

  getK(): number {
    return this.K;
  }

  initialize(i: number): void {
    for(let j = 0; j < this.p; j++) {
      for(let k = 0; k < this.n; k++) { 
        // this.current[i].setAllele(j, k, this.refRNG.rand());
        this.current[i].setAllele(j, k, Math.random());
      }
    }

    // Decode:
    for(let j = 0; j < this.p; j++) {
      this.current[i].setFitness(j, this.refDecoder.decode(this.current[i].population[j]));
    }

    // Sort:
    this.current[i].sortFitness();
  }

  evolution(curr: Population, next: Population): void {
    // We now will set every chromosome of 'current', iterating with 'i':
    let i = 0; // Iterate chromosome by chromosome
    let j = 0; // Iterate chromosome by chromosome

    // 2. The 'pe' best chromosomes are maintained, so we just copy these into 'current':
    while(i < this.pe) {
      for(j = 0 ; j < this.n; ++j) {
        next.setAllele(i, j, curr.getAllele(curr.fitness[i].second, j));
      }

      next.fitness[i].first = curr.fitness[i].first;
      next.fitness[i].second = i;
      i++;
    }

    // 3. We'll mate 'p - pe - pm' pairs; initially, i = pe, so we need to iterate until i < p - pm:
    while(i < this.p - this.pm) {
      // Select an elite parent:
      const eliteParent = Math.floor(Math.random() * (this.pe - 1));
      // Select a non-elite parent:
      const noneliteParent = this.pe + Math.floor(Math.random() * (this.p - this.pe - 1));

      // Mate:
      for(j = 0; j < this.n; j++) {
        const sourceParent = (Math.random() < this.rhoe) ? eliteParent : noneliteParent;
        next.setAllele(i, j, curr.getAllele(curr.fitness[sourceParent].second, j));
      }

      i++;
    }

    // We'll introduce 'pm' mutants:
    while(i < this.p) {
      for(j = 0; j < this.n; ++j) {
        next.setAllele(i, j, Math.random());
      }

      i++;
    }

    // Time to compute fitness:
    for (i = this.pe; i < this.p; i++) {
      next.setFitness(i, this.refDecoder.decode(next.population[i]));
    }

    // Now we must sort 'current' by fitness, since things might have changed:
    next.sortFitness();
  }

  injectChromosomes(chromosomes: Array<Array<number>>, populationIndex: number) {
    if (populationIndex < 0 || populationIndex >= this.K) {
      throw new Error("Invalid population index");
    }

    for (let chromosome of chromosomes) {
      if (chromosome.length != this.n) {
        throw new Error("Wrong chromosome size");
      }
    }

    for (let i = 0; i < chromosomes.length; i++) {
      this.current[populationIndex].population[this.p - 1 - i] = chromosomes[i];
      this.current[populationIndex].setFitness(this.p - 1 - i, this.refDecoder.decode(this.current[populationIndex].population[this.p - 1 - i]));
    }

    this.current[populationIndex].sortFitness();
  }
}

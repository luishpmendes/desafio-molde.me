import { Population } from './population';

/**
 * BRKGA.ts
 *
 * Biased Random-key Genetic Algorithms (BRKGA) implementation in TypeScript
 * Each object of this class maintains one population evolving over time
 *
 * Key features:
 * - Multiple populations evolving in parallel, with optional exchange of elite solutions
 * - Independent number of elite and mutant solutions
 * - Template for problem-specific solution decoder
 */
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

  // Template for the problem-dependent Decoder
  refDecoder: any;

  // Number of independent parallel populations
  K: number;
  
  // Previous and current populations
  previous: Population[];
  current: Population[];

  // The constructor method for the BRKGA class.
  // Initializes all of the necessary properties of the instance and validates the input parameters.
  constructor(n: number, p: number, pe: number, pm: number, rhoe: number, refDecoder: any, K: number = 1) {
    // Assigns the number of genes in the chromosome.
    this.n = n;

    // Assigns the number of elements in the population.
    this.p = p;

    // Assigns the number of elite items in the population.
    this.pe = Math.floor(pe * p);

    // Assigns the number of mutants introduced at each generation into the population.
    this.pm = Math.floor(pm * p);

    // Assigns the probability that an offspring inherits the allele of its elite parent.
    this.rhoe = rhoe;

    // Assigns the problem-dependent decoder.
    this.refDecoder = refDecoder;

    // Assigns the number of independent parallel populations.
    this.K = K;

    // Creates arrays for the previous and current populations.
    this.previous = new Array<Population>(K);
    this.current = new Array<Population>(K);

    // Checks for valid input parameters and throws errors for invalid ones.

    if (this.n <= 0) {
      throw new RangeError("Non-positive chromosome size.");
    }

    if (this.p <= 0) {
      throw new RangeError("Non-positive population size.");
    }

    if (this.pe <= 0) {
      throw new RangeError("Non-positive elite-set size.");
    }

    if (this.pe > this.p) {
      throw new RangeError("Elite-set size greater than population size (pe > p).");
    }

    if (this.pm < 0) {
      throw new RangeError("Negative mutant-set size.");
    }

    if (this.pm > this.p) {
      throw new RangeError("Mutant-set size greater than population size (pm > p).");
    }

    if (this.pe + this.pm > this.p) {
      throw new RangeError("elite + mutant sets greater than population size (pe + pm > p).");
    }

    if (this.K <= 0) {
      throw new RangeError("Number of parallel populations cannot be non-positive.");
    }

    // Initialize and decode each chromosome of the current population, then copy to previous
    for(let i = 0; i < K; i++) {
      this.current[i] = new Population(n, p);
      this.initialize(i);
      this.previous[i] = new Population(n, p);
    }
  }

  // Method to reset the current population
  reset(): void {
    // Loop over the number of parallel populations
    for(let i = 0; i < this.K; ++i) {
      // Call the initialize method for each population.
      // This effectively resets each population to its initial state.
      this.initialize(i);
    }
  }

	/**
	 * Evolve the current populations following the guidelines of BRKGAs
	 * @param generations number of generations (must be even and nonzero)
	 */
  evolve(generations: number = 1): void {
    // Check if the generations count is positive.
    if(generations <= 0) {
      throw new RangeError("Cannot evolve for 0 generations or less.");
    }

    // Loop over each generation.
    for(let i = 0; i < generations; i++) {
      // For each parallel population, perform the evolution.
      for(let j = 0; j < this.K; j++) {
        // Perform the evolution operation, transitioning from previous to current population.
        this.evolution(this.current[j], this.previous[j]);

        // Swap current and previous population after each evolution step.
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
    // Ensure M is a valid number of elite chromosomes to be swapped
    if(M <= 0 || M >= this.p) {
      throw new RangeError("M cannot be non-positive or >= p.");
    }

    // For each parallel population
    for(let i = 0; i < this.K; i++) {
      // Set the destination index at the end of population i
    // This index will be updated in the loop below
      let dest = this.p - 1;

      // For each parallel population
      for(let j = 0; j < this.K; j++) {
        // Do not exchange elements within the same population
        if(j === i) {
          continue;
        }

        // Copy the M best (elite) members of population j into population i
        for(let m = 0; m < M; m++) {
          // Copy the m-th best of Population j into the 'dest'-th position of Population i:
          const bestOfJ = this.current[j].getChromosome(m);

          // Retrieve the destination chromosome in population i
          const destChromosome = this.current[i].getChromosome(dest);

          // Copy each gene from the m-th best chromosome of population j to destination chromosome
          for(let n = 0; n < bestOfJ.length; n++) {
            destChromosome[n] = bestOfJ[n];
          }

          // Copy the fitness of the m-th best chromosome of population j to destination chromosome in population i
          this.current[i].fitness[dest].first = this.current[j].fitness[m].first;

          // Update destination index to prepare for the next chromosome copy
          dest--;
        }
      }
    }

    // After all elite chromosomes are swapped, sort each population based on fitness
    for(let j = 0; j < this.K; ++j) {
      this.current[j].sortFitness();
    }
  }

	/**
	 * Returns the current population
	 */
  getPopulation(k: number): Population {
    if(k < 0 || k >= this.K) {
      throw new RangeError("Invalid population identifier.");
    }
    return this.current[k];
  }

	/**
	 * Returns the chromosome with best fitness so far among all populations
	 */
  getBestChromosome(): Array<number> {
    // Initialize the index of the population (bestK) that has the best chromosome
    let bestK = 0;

    // Loop through all populations
    for(let i = 1; i < this.K; i++) {
      // If the best fitness in the current population is less than the best fitness found so far,
      if(this.current[i].getBestFitness() < this.current[bestK].getBestFitness()) {
        // Update the index (bestK) to this population
        bestK = i;
      }
    }

    // Return the chromosome with the best fitness across all populations
    // This is typically the first chromosome (index 0) as the populations are likely sorted by fitness
    return this.current[bestK].getChromosome(0);
  }

	/**
	 * Returns the best fitness found so far among all populations
	 */
  getBestFitness() : number {
    // Initialize the best fitness value to the fitness of the first chromosome in the first population
    let best = this.current[0].fitness[0].first;

    // Loop through all populations
    for(let i = 1; i < this.K; i++) {
      // If the fitness of the first chromosome in the current population 
      // is less than the current best fitness,
      if(this.current[i].fitness[0].first < best) {
        // update the best fitness
        best = this.current[i].fitness[0].first;
      }
    }

    // Return the best fitness found among all populations
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

  // Method to initialize the current population with random values
  initialize(i: number): void {
    // Iterate over each chromosome in the i-th population
    for(let j = 0; j < this.p; j++) {
      // For each gene in the current chromosome
      for(let k = 0; k < this.n; k++) { 
        // Assign a random value
        this.current[i].setAllele(j, k, Math.random());
      }
    }

    // After initializing the population, now we decode it:
    // Iterate over each chromosome in the i-th population
    for(let j = 0; j < this.p; j++) {
      // The decoded value of the chromosome is set as its fitness value
      this.current[i].setFitness(j, this.refDecoder.decode(this.current[i].population[j]));
    }

    // Finally, sort the population based on the fitness values
    // This ensures that the chromosome with the highest fitness value is first
    this.current[i].sortFitness();
  }

  /**
   * Evolve a population following the guidelines of Biased Random-Key Genetic Algorithms (BRKGAs)
   * @param curr the current population
   * @param next the next generation population
   */
  evolution(curr: Population, next: Population): void {
    // 1. 'i' is the variable that iterates over each chromosome in the population
    let i = 0;
    // 'j' is used to iterate over each gene in a chromosome
    let j = 0;

    // 2. Preserve the 'pe' (elite-set size) best chromosomes
    // They are copied directly into the next generation population
    while(i < this.pe) {
      for(j = 0 ; j < this.n; ++j) {
        next.setAllele(i, j, curr.getAllele(curr.fitness[i].second, j));
      }
      // Copy fitness as well
      next.fitness[i].first = curr.fitness[i].first;
      next.fitness[i].second = i;
      i++;
    }

    // 3. Create 'p - pe - pm' offspring from pairing between an elite and non-elite parent
    // 'p' is the population size, 'pm' is the mutant-set size
    while(i < this.p - this.pm) {
      // Select an elite parent randomly
      const eliteParent = Math.floor(Math.random() * (this.pe - 1));
      // Select a non-elite parent randomly
      const noneliteParent = this.pe + Math.floor(Math.random() * (this.p - this.pe - 1));

      // Mating process
      for(j = 0; j < this.n; j++) {
        const sourceParent = (Math.random() < this.rhoe) ? eliteParent : noneliteParent;
        next.setAllele(i, j, curr.getAllele(curr.fitness[sourceParent].second, j));
      }

      i++;
    }

    // 4. Introduce 'pm' mutants in the population
    // A mutant is a chromosome that is filled with random values
    while(i < this.p) {
      for(j = 0; j < this.n; ++j) {
        next.setAllele(i, j, Math.random());
      }

      i++;
    }

    // 5. Compute the fitness of the new chromosomes
    // Fitness of elite chromosomes copied from previous population is already set, so we start from 'pe'
    for (i = this.pe; i < this.p; i++) {
      next.setFitness(i, this.refDecoder.decode(next.population[i]));
    }

    // 6. Sort the population by fitness
    // After new generation has been created, it needs to be sorted based on fitness
    next.sortFitness();
  }

  /**
   * Inject provided chromosomes into a specified population.
   * Replaces the last chromosomes of the population with the provided ones, recalculates their fitness and sorts the population.
   * @param chromosomes An array of chromosomes to inject. Each chromosome is an array of numbers.
   * @param populationIndex The index of the population where chromosomes will be injected.
   * @throws {Error} If the population index is not within the valid range.
   * @throws {Error} If the size of a provided chromosome does not match the expected size.
   */
  injectChromosomes(chromosomes: Array<Array<number>>, populationIndex: number) {
    // Check that the population index is within the valid range
    if (populationIndex < 0 || populationIndex >= this.K) {
      throw new Error("Invalid population index");
    }

    // Check that each chromosome in the provided list has the correct size
    for (let chromosome of chromosomes) {
      if (chromosome.length != this.n) {
        throw new Error("Wrong chromosome size");
      }
    }

    // Replace the last chromosomes of the specified population with the provided ones
    for (let i = 0; i < chromosomes.length; i++) {
      // Insert the new chromosome in the population
      this.current[populationIndex].population[this.p - 1 - i] = chromosomes[i];
      // Calculate the fitness of the new chromosome
      this.current[populationIndex].setFitness(this.p - 1 - i, this.refDecoder.decode(this.current[populationIndex].population[this.p - 1 - i]));
    }

    // After injecting new chromosomes and recalculating their fitness, the population is sorted based on fitness
    this.current[populationIndex].sortFitness();
  }
}

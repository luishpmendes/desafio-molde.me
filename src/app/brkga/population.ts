/**
 * Population.ts
 *
 * Encapsulates a population of chromosomes represented by a matrix of doubles. We don't decode
 * nor deal with random numbers here; instead, we provide private support methods to set the
 * fitness of a specific chromosome as well as access methods to each allele. 
 *
 * All public methods in this API *require* the fitness array to be sorted, and thus a call to
 * sortFitness() beforehand.
 *
 */
export class Population {
  // The population array represents each individual in the population.
  // Each individual is a chromosome represented as an array of numbers.
  public population: Array<Array<number>>;
  // The fitness array represents the fitness of each chromosome.
  // The first element of the pair is the fitness and the second element is the chromosome index.
  public fitness: Array<{first: number, second: number}>;

  // Constructor initializes population and fitness arrays based on the size of the population (p) and size of the chromosome (n).
  constructor(n: number, p: number) {
    // Throw error if population size (p) or chromosome size (n) is zero.
    if(p === 0) {
      throw new RangeError("Population size p cannot be zero.");
    }

    if(n === 0) {
      throw new RangeError("Chromosome size n cannot be zero.");
    }

    // Initialize population and fitness arrays with size p.
    this.population = Array(p);
    this.fitness = Array(p);

    // Initialize each chromosome in population with size n and set initial fitness to 0.
    for(let i = 0; i < p; i++) {
      this.population[i] = Array(n);
      this.fitness[i] = {first: 0, second: 0};

      // Initialize each allele in chromosome to 0.
      for(let j = 0; j < n; j++) {
        this.population[i][j] = 0;
      }
    }
  }

  // Returns the size of a chromosome.
  getN(): number {
    return this.population[0].length;
  }

  // Returns the size of the population.
  getP(): number {
    return this.population.length;
  }

  // Returns the best fitness value in the population.
  getBestFitness(): number {
    return this.getFitness(0);
  }

  // Returns the fitness value of the i-th chromosome.
  getFitness(i: number): number {
    // Throw error if chromosome index is out of range.
    if(i < 0 || i >= this.getP()) {
      throw new RangeError("Invalid individual identifier.");
    }

    // Return the first element of the i-th pair in fitness array.
    return this.fitness[i].first;
  }

  // Returns the i-th best chromosome.
  getChromosome(i: number): Array<number> {
    // Throw error if chromosome index is out of range.
    if(i < 0 || i >= this.getP()) {
      throw new RangeError("Invalid individual identifier.");
    }

    // Return the chromosome at the index specified by the second element of the i-th pair in the fitness array.
    return this.population[this.fitness[i].second];
  }

  // Sets the fitness value of the i-th chromosome.
  public setFitness(i: number, f: number): void {
    // Assign the new fitness value to the first element of the i-th pair in fitness array.
    this.fitness[i].first = f;
    // Assign the chromosome index to the second element of the i-th pair in fitness array.
    this.fitness[i].second = i;
  }

  // Sorts the fitness array in ascending order of fitness values.
  public sortFitness(): void {
    this.fitness.sort((a, b) => a.first - b.first);
  }

  // Returns the value of the specific allele in a specific chromosome.
  getAllele(chromosome: number, allele: number): number {
    return this.population[chromosome][allele];
  }

  // Sets the value of the specific allele in a specific chromosome.
  setAllele(chromosome: number, allele: number, value: number): void {
    this.population[chromosome][allele] = value;
  }

  // Returns the array representation of a specific chromosome.
  getChromosomeArray(chromosome: number): Array<number> {
    return this.population[chromosome];
  }
}

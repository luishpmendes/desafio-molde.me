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
  public population: Array<Array<number>>; // Population as vectors of prob.
  public fitness: Array<{first: number, second: number}>; // Fitness (double) of each chromosome

  constructor(n: number, p: number) {
    if(p === 0) {
      throw new RangeError("Population size p cannot be zero.");
    }

    if(n === 0) {
      throw new RangeError("Chromosome size n cannot be zero.");
    }

    // this.population = Array(p).fill(Array(n).fill(0));
    // this.fitness = Array(p).fill({first: 0, second: 0});
    this.population = Array(p);
    this.fitness = Array(p);

    for(let i = 0; i < p; i++) {
      this.population[i] = Array(n);
      this.fitness[i] = {first: 0, second: 0};

      for(let j = 0; j < n; j++) {
        this.population[i][j] = 0;
      }
    }
  }

  getN(): number {
    return this.population[0].length;
  }

  getP(): number {
    return this.population.length;
  }

  getBestFitness(): number {
    return this.getFitness(0);
  }

  getFitness(i: number): number {
    if(i >= this.getP()) {
      throw new RangeError("Invalid individual identifier.");
    }

    return this.fitness[i].first;
  }

  getChromosome(i: number): Array<number> {
    if(i >= this.getP()) {
      throw new RangeError("Invalid individual identifier.");
    }

    return this.population[this.fitness[i].second];
  }

  public setFitness(i: number, f: number): void {
    this.fitness[i].first = f;
    this.fitness[i].second = i;
  }

  public sortFitness(): void {
    this.fitness.sort((a, b) => a.first - b.first);
  }

  getAllele(chromosome: number, allele: number): number {
    return this.population[chromosome][allele];
  }

  setAllele(chromosome: number, allele: number, value: number): void {
    this.population[chromosome][allele] = value;
  }

  getChromosomeArray(chromosome: number): Array<number> {
    return this.population[chromosome];
  }
}

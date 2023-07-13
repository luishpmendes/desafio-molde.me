export class UnionFind {
  private p: number[];
  private rank: number[];

  public constructor(N: number = 0) {
      this.rank = Array(N).fill(0);
      this.p = Array(N).fill(0).map((_, index) => index);
  }

  public findSet(i: number): number {
      if (this.p[i] === i) {
          return i;
      } else {
          this.p[i] = this.findSet(this.p[i]);
          return this.p[i];
      }
  }

  public isSameSet(i: number, j: number): boolean {
      return this.findSet(i) === this.findSet(j);
  }

  public unionSet(i: number, j: number): void {
      if (!this.isSameSet(i, j)) {
          let x = this.findSet(i),
              y = this.findSet(j);

          if (this.rank[x] > this.rank[y]) {
              this.p[y] = x;
          } else {
              this.p[x] = y;
              if (this.rank[x] === this.rank[y]) {
                  this.rank[y]++;
              }
          }
      }
  }
}

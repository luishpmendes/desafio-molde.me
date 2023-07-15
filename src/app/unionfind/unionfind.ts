// Define a UnionFind class
export class UnionFind {
  // Two private arrays for parent pointers and ranks of each element
  private p: number[];
  private rank: number[];

  // Class constructor with default parameter as 0
  // Initializes rank array with zeros and parent pointer array with corresponding indices
  public constructor(N: number = 0) {
      this.rank = Array(N).fill(0);
      this.p = Array(N).fill(0).map((_, index) => index);
  }

  // Method to find the set of an element (i)
  // The process involves traversing up the tree until a node is its own parent
  // This approach uses path compression which flattens the structure of the tree whenever find is used on it
  public findSet(i: number): number {
      if (this.p[i] === i) {
          return i;
      } else {
          this.p[i] = this.findSet(this.p[i]);
          return this.p[i];
      }
  }

  // Method to check if two elements (i and j) belong to the same set
  // This is done by comparing the roots (obtained from findSet) of both elements
  public isSameSet(i: number, j: number): boolean {
      return this.findSet(i) === this.findSet(j);
  }

  // Method to union two sets (i and j)
  // If i and j are not in the same set, we combine them
  // The element with the higher rank becomes the parent of the other
  // If the ranks are equal, choose one as the parent and increment its rank
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

export interface Indexable {
  qtIndex: (node: NodeGeometry) => number[];
}

export interface NodeGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

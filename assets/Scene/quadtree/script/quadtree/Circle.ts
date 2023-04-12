import { Indexable, NodeGeometry } from './types';

export interface CircleGeometry {
    x: number;
    y: number;
    r: number;
}

interface CircleProps<T> extends CircleGeometry {
    data?: T;
}

export default class Circle<T = void> implements CircleGeometry, Indexable {
    x: number;
    y: number;
    r: number;
    data?: T;
    constructor(props: CircleProps<T>) {
        this.x = props.x;
        this.y = props.y;
        this.r = props.r;
        this.data = props.data;
    }

    qtIndex(node: NodeGeometry): number[] {
        const indexes: number[] = [];
        const w2 = node.width / 2;
        const h2 = node.height / 2;
        const x2 = node.x + w2;
        const y2 = node.y + h2;
        const nodes = [
            [x2, y2],
            [node.x, y2],
            [node.x, node.y],
            [x2, node.y],
        ];
        for (let i = 0; i < 4; ++i) {
            if (
                Circle.intersectRect(
                    this.x,
                    this.y,
                    this.r,
                    nodes[i][0],
                    nodes[i][1],
                    nodes[i][0] + w2,
                    nodes[i][1] + h2
                )
            ) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    static intersectRect(
        x: number,
        y: number,
        r: number,
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ): boolean {
        const dx = x - Math.max(minX, Math.min(maxX, x));
        const dy = y - Math.max(minY, Math.min(maxY, y));
        return dx * dx + dy * dy < r * r;
    }
}

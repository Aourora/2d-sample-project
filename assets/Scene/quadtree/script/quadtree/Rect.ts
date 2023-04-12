import { Indexable, NodeGeometry } from './types';

interface ReactProps<T> extends NodeGeometry {
    data?: T;
}

export default class Rect<T = void> implements NodeGeometry, Indexable {
    x: number;
    y: number;
    width: number;
    height: number;
    data?: T;

    constructor(props: ReactProps<T>) {
        this.x = props.x;
        this.y = props.y;
        this.width = props.width;
        this.height = props.height;
        this.data = props.data;
    }

    qtIndex(node: NodeGeometry): number[] {
        const cx = node.x + node.width / 2;
        const cy = node.y + node.height / 2;

        const indexes: number[] = [];
        const ly = this.y < cy;
        const lx = this.x < cx;
        const gx = this.x + this.width > cx;
        const gy = this.y + this.height > cy;
        if (gx && gy) indexes.push(0);
        if (lx && gy) indexes.push(1);
        if (lx && ly) indexes.push(2);
        if (gx && ly) indexes.push(3);
        return indexes;
    }
}

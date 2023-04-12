import Circle from './Circle';
import Rect from './Rect';
import { Indexable, NodeGeometry } from './types';

export interface QuadTreeProps {
    width: number;
    height: number;
    x?: number;
    y?: number;
    maxObjects?: number;
    maxLevels?: number;
}

export default class QuadTree<ObjectsType extends Rect | Circle | Indexable> {
    bounds: NodeGeometry;
    maxObjects: number;
    maxLevels: number;
    level: number;
    objects: ObjectsType[];
    nodes: Array<QuadTree<ObjectsType>>;
    constructor(props: QuadTreeProps, level = 0) {
        this.bounds = {
            x: props.x ?? 0,
            y: props.y ?? 0,
            width: props.width,
            height: props.height,
        };
        this.maxObjects = props.maxObjects ?? 10;
        this.maxLevels = props.maxLevels ?? 4;
        this.level = level;
        this.objects = [];
        this.nodes = [];
    }

    getIndex(obj: Rect | Circle | Indexable): number[] {
        return obj.qtIndex(this.bounds);
    }

    private split(): void {
        const level = this.level + 1;
        const width = this.bounds.width / 2;
        const height = this.bounds.height / 2;
        const { x, y } = this.bounds;
        const points = [
            { x: x + width, y: y + height },
            { x, y: y + height },
            { x, y },
            { x: x + width, y },
        ];
        for (let i = 0; i < 4; ++i) {
            this.nodes[i] = new QuadTree<ObjectsType>(
                {
                    x: points[i].x,
                    y: points[i].y,
                    width,
                    height,
                    maxObjects: this.maxObjects,
                    maxLevels: this.maxLevels,
                },
                level
            );
        }
    }

    insert(obj: ObjectsType): void {
        if (this.nodes.length) {
            const indexes = this.getIndex(obj);
            for (let i = 0; i < indexes.length; ++i) {
                this.nodes[indexes[i]].insert(obj);
            }
            return;
        }
        this.objects.push(obj);

        if (
            this.objects.length > this.maxObjects &&
            this.level < this.maxLevels
        ) {
            this.split();
            for (let i = 0, { length } = this.objects; i < length; ++i) {
                const indexes = this.getIndex(this.objects[i]);
                for (let k = 0; k < indexes.length; ++k) {
                    this.nodes[indexes[k]].insert(this.objects[i]);
                }
            }
            this.objects = [];
        }
    }

    retrieve(obj: Rect | Circle | Indexable): ObjectsType[] {
        let returnObjects = this.objects;

        if (this.nodes.length) {
            const indexes = this.getIndex(obj);
            for (let i = 0; i < indexes.length; ++i) {
                returnObjects = returnObjects.concat(
                    this.nodes[indexes[i]].retrieve(obj)
                );
            }
        }
        returnObjects = returnObjects.filter(
            (o, i) => returnObjects.indexOf(o) >= i && o !== obj
        );
        return returnObjects;
    }

    clear(): void {
        this.objects = [];
        for (let i = 0; i < this.nodes.length; ++i) {
            this.nodes[i].clear();
        }
        this.nodes = [];
    }
}

import QuadTree from './quadtree/QuadTree';
import Rect from './quadtree/Rect';

const { ccclass, property } = cc._decorator;

interface CustomData {
    node: cc.Node;
    vx: number;
    vy: number;
}

@ccclass
export default class QuadTreeManager extends cc.Component {
    @property(cc.Prefab)
    protected prefab: cc.Prefab = null!;

    @property(cc.Label)
    protected label: cc.Label = null!;

    protected objects: Array<Rect<CustomData>> = [];
    protected myTree!: QuadTree<Rect<CustomData>>;
    protected isTree: boolean = true;
    protected graphics: cc.Graphics = null!;

    protected onLoad(): void {
        this.graphics = this.addComponent(cc.Graphics);
        this.graphics.strokeColor = cc.Color.RED;
        this.graphics.lineWidth = 3;
        for (let i = 0; i < 1500; ++i) {
            this.createNode();
        }
        this.myTree = new QuadTree({
            x: -this.node.width / 2,
            y: -this.node.height / 2,
            width: this.node.width,
            height: this.node.height,
        });
        this.label.string = this.isTree ? '关闭四叉树' : '开启四叉树';
        this.label.node.parent.parent.zIndex = 10;
    }

    protected createNode(): void {
        const random = (min: number, max: number): number =>
            min + Math.floor((max - min) * Math.random());
        const { width: w, height: h } = this.node;
        const node = cc.instantiate(this.prefab);
        node.width = random(10, 20);
        node.height = random(10, 20);
        const { width, height } = node;
        node.x = random((width - w) / 2, (w - width) / 2);
        node.y = random((height - h) / 2, (h - height) / 2);
        this.objects.push(
            new Rect<CustomData>({
                x: node.x,
                y: node.y,
                width,
                height,
                data: {
                    node,
                    vx: Math.random() * 2 - 1,
                    vy: Math.random() * 2 - 1,
                },
            })
        );
        node.parent = this.node;
    }

    protected updatePos(): void {
        const w = this.node.width / 2;
        const h = this.node.height / 2;
        this.objects.forEach((obj) => {
            const { data, x, y, width, height } = obj;
            obj.x = data!.node.x = x + data!.vx;
            obj.y = data!.node.y = y + data!.vy;
            if (obj.x - width / 2 < -w || obj.x + width / 2 > w) {
                data!.vx = -data!.vx;
            }
            if (obj.y - height / 2 < -h || obj.y + height / 2 > h) {
                data!.vy = -data!.vy;
            }
        });
    }

    protected renderGrid(tree: QuadTree<Rect<CustomData>>): void {
        const { bounds, nodes } = tree;
        if (!nodes.length) return;
        const { x, y, width, height } = bounds;
        this.graphics.moveTo(x, y + height / 2);
        this.graphics.lineTo(x + width, y + height / 2);
        this.graphics.moveTo(x + width / 2, y);
        this.graphics.lineTo(x + width / 2, y + height);
        this.graphics.stroke();
        for (const t of nodes) {
            this.renderGrid(t);
        }
    }

    protected update(dt: number): void {
        this.updatePos();
        this.graphics.clear();
        if (this.isTree) {
            this.myTree.clear();
            this.objects.forEach((obj) => this.myTree.insert(obj));
            this.renderGrid(this.myTree);
        }
        const { length } = this.objects;
        for (let i = 0; i < length; ++i) {
            const obj = this.objects[i];
            if (this.isTree) {
                const objs = this.myTree.retrieve(obj);
                const r = objs.some((o) =>
                    cc.Intersection.rectRect(
                        cc.rect(obj.x, obj.y, obj.width, obj.height),
                        cc.rect(o.x, o.y, o.width, o.height)
                    )
                );
                obj.data!.node.color = r ? cc.Color.GREEN : cc.Color.WHITE;
            } else {
                let k = 0;
                for (; k < length; ++k) {
                    if (k === i) continue;
                    const o = this.objects[k];
                    if (
                        cc.Intersection.rectRect(
                            cc.rect(obj.x, obj.y, obj.width, obj.height),
                            cc.rect(o.x, o.y, o.width, o.height)
                        )
                    ) {
                        obj.data!.node.color = cc.Color.GREEN;
                        break;
                    }
                }
                if (k === length) {
                    obj.data!.node.color = cc.Color.WHITE;
                }
            }
        }
    }

    public triggerTree(): void {
        this.isTree = !this.isTree;
        this.label.string = this.isTree ? '关闭四叉树' : '开启四叉树';
    }
}

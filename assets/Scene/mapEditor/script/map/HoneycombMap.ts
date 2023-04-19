import BaseMap from './BaseMap';
import { MapParams, Point } from './MapType';

export default class HoneycombMap extends BaseMap {
    protected div4w: number;
    constructor(params: MapParams) {
        super(params);
        this.div4w = this.halfRoadWidth / 2;
    }
    private testPointInHoneycomb(
        row: number,
        col: number,
        x: number,
        y: number
    ): boolean {
        const a: number = this.roadWidth / 2;

        const px = this.roadWidth * (0.5 + 0.75 * col);
        const py = this.roadHeight * (row + 0.5 * (1 + (col % 2)));

        const absX: number = Math.abs(px - x);
        const absY: number = Math.abs(py - y);

        //return a-absX >= absY/(1.732);

        return a - absX >= absY / 1.732;
    }

    getPixelByDerect(dx: number, dy: number): cc.Vec2 {
        return cc.v2(
            this.roadWidth * (dx * 0.75 + 0.5),
            this.roadHeight * (dy + 0.5 * (1 + (dx % 2)))
        );
    }
    getDerectByPixel(px: number, py: number): Point {
        //六边形的外切矩形竖方向均等分成4分，所有的六边形外切矩形连在一起形成一个个4分之一矩形宽的区域，nwDiv4Index就是该区域的索引
        const div4wIndex = Math.floor(px / this.div4w);
        //取得临时六边形横轴的索引,根据不同的情况可能会变
        let x = Math.floor(div4wIndex / 3);
        let y!: number;
        if ((div4wIndex - 1) % 6 == 0 || (div4wIndex - 2) % 6 == 0) {
            y = Math.floor(py / this.roadHeight);
        } else if ((div4wIndex - 4) % 6 == 0 || (div4wIndex - 5) % 6 == 0) {
            y =
                py < this.halfRoadHeight
                    ? -1
                    : Math.floor(py / this.roadHeight - 0.5);
        } else {
            if (x % 2 === 0) {
                y = Math.floor(py / this.roadHeight);
                if (this.testPointInHoneycomb(y - 1, x - 1, px, py)) {
                    --y;
                    --x;
                } else if (this.testPointInHoneycomb(y, x - 1, px, py)) {
                    --x;
                }
            } else {
                y =
                    py < this.halfRoadHeight
                        ? -1
                        : Math.floor(py / this.roadHeight - 0.5);
                if (this.testPointInHoneycomb(y + 1, x - 1, px, py)) {
                    ++y;
                    --x;
                } else if (this.testPointInHoneycomb(y, x - 1, px, py)) {
                    --x;
                }
            }
        }
        return { x, y };
    }

    drawGeometry(graphics: cc.Graphics, px: number, py: number): void {
        const { halfRoadWidth, halfRoadHeight, div4w } = this;
        graphics.moveTo(px - halfRoadWidth, py);
        graphics.lineTo(px - div4w, py + halfRoadHeight);
        graphics.lineTo(px + div4w, py + halfRoadHeight);
        graphics.lineTo(px + halfRoadWidth, py);
        graphics.lineTo(px + div4w, py - halfRoadHeight);
        graphics.lineTo(px - div4w, py - halfRoadHeight);
        graphics.lineTo(px - halfRoadWidth, py);
    }
}

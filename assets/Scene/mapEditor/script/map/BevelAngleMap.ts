import BaseMap from './BaseMap';
import { Point } from './MapType';

export default class BevelAngleMap extends BaseMap {
    getPixelByDerect(dx: number, dy: number): cc.Vec2 {
        return cc.v2(
            this.roadWidth * (dx + 0.5 * (1 + (dy % 2))),
            this.halfRoadHeight * (dy + 1)
        );
    }
    getDerectByPixel(px: number, py: number): Point {
        //(cx,cy)世界斜角坐标
        const cx =
            Math.ceil(px / this.roadWidth - 0.5 + py / this.roadHeight) - 1;
        const cy =
            this.col -
            1 -
            Math.ceil(px / this.roadWidth - 0.5 - py / this.roadHeight);
        //(px,py)像素坐标
        const cpx = Math.floor(
            (cx + 1 - (cy - (this.col - 1))) * this.halfRoadWidth
        );
        const cpy = Math.floor(
            (cx + 1 + (cy - (this.col - 1))) * this.halfRoadHeight
        );
        return {
            x:
                Math.floor(cpx / this.roadWidth) -
                (cpx % this.roadWidth === 0 ? 1 : 0),
            y: Math.floor(cpy / this.halfRoadHeight) - 1,
        };
    }

    drawGeometry(graphics: cc.Graphics, px: number, py: number): void {
        const { halfRoadWidth, halfRoadHeight } = this;
        graphics.moveTo(px - halfRoadWidth, py);
        graphics.lineTo(px, py + halfRoadHeight);
        graphics.lineTo(px + halfRoadWidth, py);
        graphics.lineTo(px, py - halfRoadHeight);
        graphics.lineTo(px - halfRoadWidth, py);
    }
}

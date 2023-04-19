import BaseMap from './BaseMap';
import { Point } from './MapType';

export default class RectMap extends BaseMap {
    getPixelByDerect(dx: number, dy: number): cc.Vec2 {
        return cc.v2(this.roadWidth * (dx + 0.5), this.roadHeight * (dy + 0.5));
    }
    getDerectByPixel(px: number, py: number): Point {
        return {
            x: Math.floor(px / this.roadWidth),
            y: Math.floor(py / this.roadHeight),
        };
    }
    drawGeometry(graphics: cc.Graphics, px: number, py: number): void {
        const { halfRoadWidth, halfRoadHeight, roadWidth, roadHeight } = this;
        graphics.rect(
            px - halfRoadWidth,
            py - halfRoadHeight,
            roadWidth,
            roadHeight
        );
    }
}

import { OperationType } from '../MapEditorUtils';
import { Point, MapMethod, MapType, MapParams } from './MapType';

export default abstract class BaseMap implements MapMethod {
    /**
     * 地图名称
     */
    protected name: string = '';
    /**
     * 地图背景名称
     */
    protected bgName: string = '';
    /**
     * 地图类型
     */
    protected mapType: MapType = MapType.angle90;
    /**
     * 地图一共分成几行
     */
    protected row: number = 0;
    /**
     * 地图一共分成几列
     */
    protected col: number = 0;
    /**
     * 地图宽
     */
    protected mapWidth: number = 0;
    /**
     * 地图高
     */
    protected mapHeight: number = 0;
    /**
     * 路点宽
     */
    protected roadWidth: number = 0;
    /**
     * 路点高
     */
    protected roadHeight: number = 0;
    /**
     * 路点半宽
     */
    protected halfRoadWidth: number = 0;
    /**
     * 路点半高
     */
    protected halfRoadHeight: number = 0;
    /**
     * 路点信息
     */
    protected roadDataArr: number[][] = [];

    constructor(params: MapParams) {
        Object.assign(this, params);
        this.row = this.roadDataArr.length;
        this.col = this.roadDataArr[0].length;
        this.halfRoadWidth = this.roadWidth / 2;
        this.halfRoadHeight = this.roadHeight / 2;
    }

    getMapName(): string {
        return this.name;
    }

    getMapJsonData(): string {
        return JSON.stringify({
            name: this.name,
            bgName: this.bgName,
            mapType: this.mapType,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            roadWidth: this.roadWidth,
            roadHeight: this.roadHeight,
            roadDataArr: this.roadDataArr,
        });
    }

    setRoadDataByPixel(px: number, py: number, data: number): void {
        const { x, y } = this.getDerectByPixel(px, py);
        if (x < 0 || y < 0) return;
        this.roadDataArr[y][x] = data;
    }

    renderMap(graphics: cc.Graphics): void {
        const { row, col, roadDataArr } = this;
        graphics.clear();
        cc.Color.fromHEX(graphics.strokeColor, '#e74c3c');
        graphics.strokeColor.a = 188;
        graphics.lineWidth = 2;
        // 渲染格子
        for (let i = 0; i < row; ++i) {
            for (let j = 0; j < col; ++j) {
                const { x, y } = this.getPixelByDerect(j, i);
                this.drawGeometry(graphics, x, y);
                if (roadDataArr[i][j] !== OperationType.erase) {
                    cc.Color.fromHEX(
                        graphics.fillColor,
                        roadDataArr[i][j] === OperationType.normal
                            ? '#2ecc71'
                            : '#c7ecee'
                    );
                    graphics.fillColor.a = 100;
                    graphics.fill();
                }
                graphics.stroke();
            }
        }
    }
    abstract drawGeometry(graphics: cc.Graphics, px: number, py: number): void;
    abstract getPixelByDerect(dx: number, dy: number): cc.Vec2;
    abstract getDerectByPixel(px: number, py: number): Point;
}

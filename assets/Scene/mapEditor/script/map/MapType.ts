export enum MapType {
    angle45 = 0,
    angle90 = 1,
    honeycomb = 2,
}

export interface Point {
    x: number;
    y: number;
}

/**
 * 地图初始化参数
 */
export interface MapParams {
    name: string;
    bgName: string;
    mapType: MapType;
    mapWidth: number;
    mapHeight: number;
    roadWidth: number;
    roadHeight: number;
    roadDataArr: number[][];
}
/**
 * 地图接口
 */
export interface MapMethod {
    /**
     * 根据平面坐标获取像素坐标
     */
    getPixelByDerect(dx: number, dy: number): cc.Vec2;
    /**
     * 根据像素坐标获取平面坐标
     */
    getDerectByPixel(px: number, py: number): Point;
    /**
     * 获取地图名称
     */
    getMapName(): string;
    /**
     * 获取地图数据
     */
    getMapJsonData(): string;
    /**
     * 渲染地图
     * @param graphics
     */
    renderMap(graphics: cc.Graphics): void;
    /**
     * 设置路点数据
     */
    setRoadDataByPixel(px: number, py: number, data: number): void;
}

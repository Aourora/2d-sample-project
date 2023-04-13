import { MapMethod, MapParams, MapType, OperationType } from './MapEditorUtils';

export default class MapEditorData implements MapMethod {
    constructor(params: MapParams) {
        this._name = params.name;
        this._bgName = params.bgName;
        this._mapType = params.mapType;
        this._mapWidth = params.mapWidth;
        this._mapHeight = params.mapHeight;
        this._nodeWidth = params.nodeWidth;
        this._nodeHeight = params.nodeHeight;
        this._row = Math.ceil(params.mapHeight / params.nodeHeight);
        this._col = Math.ceil(params.mapWidth / params.nodeWidth);
        this._roadDataArr = params.roadDataArr ?? this.getRoadData();
    }

    private _name: string;
    private _bgName: string;
    private _mapType: MapType;
    private _mapWidth: number;
    private _mapHeight: number;
    private _nodeWidth: number;
    private _nodeHeight: number;
    private _roadDataArr: number[][];
    private _row: number;
    private _col: number;

    private getRoadData(): number[][] {
        const { _mapType } = this;
        let roadDataArr;
        if (_mapType === MapType.angle90) {
            roadDataArr = Array.from({ length: this._row }, () =>
                new Array(this._col).fill(0)
            );
        }
        return roadDataArr;
    }

    setMapType(type: MapType): void {
        this._mapType = type;
        this._roadDataArr = this.getRoadData();
    }

    setNodeTypeByPosition({ x, y }: cc.Vec2, type: OperationType): void {
        const row = Math.floor(y / this._nodeHeight);
        const col = Math.floor(x / this._nodeWidth);
        this._roadDataArr[row][col] = type;
    }

    render(graphics: cc.Graphics): void {
        graphics.clear();
        cc.Color.fromHEX(graphics.strokeColor, '#e74c3c');
        graphics.strokeColor.a = 188;
        graphics.lineWidth = 2;
        const {
            _mapType,
            _mapWidth,
            _mapHeight,
            _nodeWidth,
            _nodeHeight,
            _row,
            _col,
            _roadDataArr,
        } = this;
        if (_mapType === MapType.angle90) {
            // 渲染格子线条
            let offset = 0;
            for (let i = 0; i <= _row; ++i) {
                graphics.moveTo(0, offset);
                graphics.lineTo(_mapWidth, offset);
                offset += _nodeHeight;
            }
            offset = 0;
            for (let i = 0; i <= _col; ++i) {
                graphics.moveTo(offset, 0);
                graphics.lineTo(offset, _mapHeight);
                offset += _nodeWidth;
            }
            graphics.stroke();
            // 渲染格子
            for (let i = 0; i < _row; ++i) {
                for (let j = 0; j < _col; ++j) {
                    if (_roadDataArr[i][j] !== OperationType.erase) {
                        graphics.rect(
                            j * _nodeWidth + 1,
                            i * _nodeHeight + 1,
                            _nodeWidth - 2,
                            _nodeHeight - 2
                        );
                        cc.Color.fromHEX(
                            graphics.fillColor,
                            _roadDataArr[i][j] === OperationType.normal
                                ? '#2ecc71'
                                : '#c7ecee'
                        );
                        graphics.fillColor.a = 188;
                        graphics.fill();
                    }
                }
            }
        }
    }

    getData(): MapParams {
        return {
            name: this._name,
            bgName: this._bgName,
            mapType: this._mapType,
            mapWidth: this._mapWidth,
            mapHeight: this._mapHeight,
            nodeWidth: this._nodeWidth,
            nodeHeight: this._nodeHeight,
            roadDataArr: this._roadDataArr,
        };
    }
}

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
        this.calculateHexGrid();
        this._roadDataArr = params.roadDataArr ?? this.calculateRoadData();
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

    private calculateHexGrid(): void {
        const { _mapType, _mapWidth, _mapHeight, _nodeWidth, _nodeHeight } =
            this;
        if (_mapType === MapType.honeycomb) {
            this._row = Math.ceil(_mapHeight / _nodeHeight);
            this._col = Math.floor(_mapWidth / (_nodeWidth * 0.75));
        } else if (_mapType === MapType.angle90) {
            this._row = Math.ceil(_mapHeight / _nodeHeight);
            this._col = Math.ceil(_mapWidth / _nodeWidth);
        } else {
            this._row = Math.ceil(_mapHeight / (_nodeHeight / 2));
            this._col = Math.ceil(_mapWidth / _nodeWidth);
        }
    }

    private calculateRoadData(): number[][] {
        return Array.from({ length: this._row }, () =>
            new Array(this._col).fill(0)
        );
    }

    private testPointInHoneycomb(
        row: number,
        col: number,
        x: number,
        y: number
    ): boolean {
        const a: number = this._nodeWidth / 2;

        const px = this._nodeWidth * (0.5 + 0.75 * col);
        const py = this._nodeHeight * (row + 0.5 * (1 + (col % 2)));

        const absX: number = Math.abs(px - x);
        const absY: number = Math.abs(py - y);

        //return a-absX >= absY/(1.732);

        return a - absX >= absY / 1.732;
    }

    private drawHoneycomb(
        graphics: cc.Graphics,
        x: number,
        y: number,
        hw: number,
        hh: number,
        div4w: number
    ): void {
        graphics.moveTo(x, y);
        graphics.lineTo(x + div4w, y + hh);
        graphics.lineTo(x + div4w + hw, y + hh);
        graphics.lineTo(x + hw * 2, y);
        graphics.lineTo(x + div4w + hw, y - hh);
        graphics.lineTo(x + div4w, y - hh);
        graphics.lineTo(x, y);
    }

    private drawDiamond(
        graphics: cc.Graphics,
        x: number,
        y: number,
        hw: number,
        hh: number
    ): void {
        graphics.moveTo(x, y);
        graphics.lineTo(x + hw, y + hh);
        graphics.lineTo(x + hw * 2, y);
        graphics.lineTo(x + hw, y - hh);
        graphics.lineTo(x, y);
    }

    setMapType(type: MapType): void {
        this._mapType = type;
        this._roadDataArr = this.calculateRoadData();
    }

    setNodeTypeByPosition({ x, y }: cc.Vec2, type: OperationType): void {
        const { _nodeHeight, _nodeWidth } = this;
        const div4w = _nodeWidth / 4;
        let row!: number, col!: number;
        if (this._mapType === MapType.angle90) {
            row = Math.floor(y / _nodeHeight);
            col = Math.floor(x / _nodeWidth);
        } else if (this._mapType === MapType.honeycomb) {
            //六边形的外切矩形竖方向均等分成4分，所有的六边形外切矩形连在一起形成一个个4分之一矩形宽的区域，nwDiv4Index就是该区域的索引
            const div4wIndex = Math.floor(x / div4w);
            //取得临时六边形横轴的索引,根据不同的情况可能会变
            col = Math.floor(div4wIndex / 3);
            if ((div4wIndex - 1) % 6 == 0 || (div4wIndex - 2) % 6 == 0) {
                row = Math.floor(y / _nodeHeight);
            } else if ((div4wIndex - 4) % 6 == 0 || (div4wIndex - 5) % 6 == 0) {
                row =
                    y < _nodeHeight / 2
                        ? -1
                        : Math.floor(y / _nodeHeight - 0.5);
            } else {
                if (col % 2 === 0) {
                    row = Math.floor(y / _nodeHeight);
                    if (this.testPointInHoneycomb(row - 1, col - 1, x, y)) {
                        --row;
                        --col;
                    } else if (this.testPointInHoneycomb(row, col - 1, x, y)) {
                        --col;
                    }
                } else {
                    row =
                        y < _nodeHeight / 2
                            ? -1
                            : Math.floor(y / _nodeHeight - 0.5);
                    if (this.testPointInHoneycomb(row + 1, col - 1, x, y)) {
                        ++row;
                        --col;
                    } else if (this.testPointInHoneycomb(row, col - 1, x, y)) {
                        --col;
                    }
                }
            }
        } else {
            //(cx,cy)世界斜角坐标
            const cx = Math.ceil(x / _nodeWidth - 0.5 + y / _nodeHeight) - 1;
            const cy =
                this._col -
                1 -
                Math.ceil(x / _nodeWidth - 0.5 - y / _nodeHeight);
            //(px,py)像素坐标
            const px = Math.floor(
                (cx + 1 - (cy - (this._col - 1))) * (_nodeWidth / 2)
            );
            const py = Math.floor(
                (cx + 1 + (cy - (this._col - 1))) * (_nodeHeight / 2)
            );
            row = Math.floor(py / (_nodeHeight / 2)) - 1;
            col =
                Math.floor(px / this._nodeWidth) -
                (px % _nodeWidth === 0 ? 1 : 0);
        }
        if (row === -1 || col === -1) return;
        this._roadDataArr[row][col] = type;
    }

    render(graphics: cc.Graphics): void {
        graphics.clear();
        cc.Color.fromHEX(graphics.strokeColor, '#e74c3c');
        graphics.strokeColor.a = 188;
        graphics.lineWidth = 2;
        const { _mapType, _nodeWidth, _nodeHeight, _row, _col, _roadDataArr } =
            this;
        const hw = _nodeWidth / 2;
        const hh = _nodeHeight / 2;
        if (_mapType === MapType.angle90) {
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
                        graphics.fillColor.a = 100;
                        graphics.fill();
                    }
                }
            }
            //渲染格子线条
            for (let i = 0; i < _row; ++i) {
                for (let j = 0; j < _col; ++j) {
                    const x = _nodeWidth * j;
                    const y = _nodeHeight * i;
                    //(x,y)矩形左下角
                    graphics.moveTo(x, y);
                    graphics.lineTo(x, y + _nodeHeight);
                    graphics.lineTo(x + _nodeWidth, y + _nodeHeight);
                    graphics.lineTo(x + _nodeWidth, y);
                    graphics.lineTo(x, y);
                }
            }
            graphics.stroke();
        } else if (_mapType === MapType.honeycomb) {
            const div4w = _nodeWidth / 4;

            // 渲染格子
            for (let i = 0; i < _row; ++i) {
                for (let j = 0; j < _col; ++j) {
                    if (_roadDataArr[i][j] !== OperationType.erase) {
                        const x = _nodeWidth * 0.75 * j;
                        const y = _nodeHeight * (i + 0.5 * (1 + (j % 2)));
                        //(x,y)正六边形左端点
                        this.drawHoneycomb(graphics, x, y, hw, hh, div4w);
                        cc.Color.fromHEX(
                            graphics.fillColor,
                            _roadDataArr[i][j] === OperationType.normal
                                ? '#2ecc71'
                                : '#c7ecee'
                        );
                        graphics.fillColor.a = 100;
                        graphics.fill();
                    }
                }
            }

            //渲染格子线条
            for (let i = 0; i < _row; ++i) {
                for (let j = 0; j < _col; ++j) {
                    const x = _nodeWidth * +0.75 * j;
                    const y = _nodeHeight * (i + 0.5 * (1 + (j % 2)));
                    this.drawHoneycomb(graphics, x, y, hw, hh, div4w);
                }
            }
            graphics.stroke();
        } else {
            // 渲染格子
            for (let i = 0; i < _row; ++i) {
                for (let j = 0; j < _col; ++j) {
                    if (_roadDataArr[i][j] !== OperationType.erase) {
                        const x = _nodeWidth * (j + 0.5 * (i % 2));
                        const y = hh * (i + 1);
                        //(x,y)菱形左端点
                        this.drawDiamond(graphics, x, y, hw, hh);
                        cc.Color.fromHEX(
                            graphics.fillColor,
                            _roadDataArr[i][j] === OperationType.normal
                                ? '#2ecc71'
                                : '#c7ecee'
                        );
                        graphics.fillColor.a = 100;
                        graphics.fill();
                    }
                }
            }
            //渲染格子线条
            for (let i = 0; i < _row; i += 2) {
                for (let j = 0; j < _col; ++j) {
                    const x = _nodeWidth * (j + 0.5 * (i % 2));
                    const y = hh * (i + 1);
                    //(x,y)菱形左端点
                    this.drawDiamond(graphics, x, y, hw, hh);
                }
            }
            graphics.stroke();
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

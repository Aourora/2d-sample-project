import {
    OperationType,
    saveForWebBrowser,
    createCompEventHandler,
    calculateHexGrid,
} from './MapEditorUtils';
import BaseMap from './map/BaseMap';
import BevelAngleMap from './map/BevelAngleMap';
import HoneycombMap from './map/HoneycombMap';
import { MapParams, MapType } from './map/MapType';
import RectMap from './map/RectMap';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapEditor extends cc.Component {
    @property(cc.Node)
    private mapNode: cc.Node = null!;

    @property(cc.Graphics)
    private graphics: cc.Graphics = null!;

    @property({
        displayName: '保存按钮',
        tooltip: '保存按钮',
        type: cc.Button,
    })
    protected saveButton: cc.Button = null!;

    @property({
        displayName: '操作状态ToggleContainer',
        tooltip: '操作状态ToggleContainer',
        type: cc.ToggleContainer,
    })
    protected operationTypeToggleContainer: cc.ToggleContainer = null!;

    private _button: number = -1;
    private _minScale!: number;
    private _operationType: OperationType = OperationType.normal;
    private _map: BaseMap;

    protected onLoad(): void {
        this.init();
        this.bindEvent();
    }

    protected init(): void {
        this.calculationMapScale();
        this.calculationMapPos();
        const mapType = MapType.angle90;
        const mapWidth = this.mapNode.width;
        const mapHeight = this.mapNode.height;
        const p = calculateHexGrid(mapType, mapWidth, mapHeight, 40, 40);
        this._map = this.createMap({
            name: 'test',
            bgName: 'test',
            mapType,
            mapWidth,
            mapHeight,
            roadWidth: 40,
            roadHeight: 40,
            roadDataArr: Array.from({ length: p.y }, () =>
                new Array(p.x).fill(0)
            ),
        });
        this._map.renderMap(this.graphics);
    }

    protected bindEvent(): void {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.saveButton.node.on('click', this.saveMapData, this);
        this.operationTypeToggleContainer.checkEvents.push(
            createCompEventHandler(this.node, this, this.toggleOperationType)
        );
    }

    protected onMouseDown(event: cc.Event.EventMouse): void {
        this._button = event.getButton();
        if (this._button === cc.Event.EventMouse.BUTTON_LEFT) {
            this.handleMouseLeftMove(event);
        }
    }

    protected onMouseMove(event: cc.Event.EventMouse): void {
        const v = this._button === -1 ? event.getButton() : this._button;
        switch (v) {
            case cc.Event.EventMouse.BUTTON_LEFT:
                this.handleMouseLeftMove(event);
                break;
            case cc.Event.EventMouse.BUTTON_RIGHT:
                this.handleMouseRightMove(event);
                break;
        }
    }

    protected onMouseUp(event: cc.Event.EventMouse): void {
        this._button = -1;
    }

    protected onMouseWheel(event: cc.Event.EventMouse): void {
        const preScale = this.mapNode.scale;
        const dirPos = this.mapNode.convertToNodeSpaceAR(event.getLocation());
        const nextScale = Math.max(
            this._minScale,
            Math.min(5, preScale + event.getScrollY() / 1000)
        );
        const op = dirPos.mul(preScale - nextScale);
        this.mapNode.x += op.x;
        this.mapNode.y += op.y;
        this.mapNode.scale = nextScale;
        this.calculationMapPos();
    }

    protected handleMouseLeftMove(event: cc.Event.EventMouse): void {
        const { x, y } = this.mapNode.convertToNodeSpaceAR(event.getLocation());
        this._map.setRoadDataByPixel(x, y, this._operationType);
        this._map.renderMap(this.graphics);
    }

    protected handleMouseRightMove(event: cc.Event.EventMouse): void {
        this.mapNode.x += event.getDeltaX();
        this.mapNode.y += event.getDeltaY();
        this.calculationMapPos();
    }

    protected calculationMapPos(): void {
        const { width, height } = this.mapNode;
        const { scale, anchorX, anchorY } = this.mapNode;
        this.mapNode.x = Math.max(
            -(scale * width * (1 - anchorX) - cc.winSize.width / 2),
            Math.min(
                scale * width * anchorX - cc.winSize.width / 2,
                this.mapNode.x
            )
        );
        this.mapNode.y = Math.max(
            -(scale * height * (1 - anchorY) - cc.winSize.height / 2),
            Math.min(
                scale * height * anchorY - cc.winSize.height / 2,
                this.mapNode.y
            )
        );
    }

    protected calculationMapScale(): void {
        const { width, height } = this.mapNode;
        this._minScale = Math.max(
            cc.winSize.width / width,
            cc.winSize.height / height
        );
        this.mapNode.scale = Math.max(this._minScale, this.mapNode.scale);
    }

    protected createMap(params: MapParams): BaseMap {
        return params.mapType === MapType.angle90
            ? new RectMap(params)
            : params.mapType === MapType.honeycomb
            ? new HoneycombMap(params)
            : new BevelAngleMap(params);
    }

    public toggleOperationType(toggle: cc.Toggle): void {
        this._operationType =
            this.operationTypeToggleContainer.toggleItems.indexOf(toggle);
    }

    public saveMapData(): void {
        const data = this._map.getMapJsonData();
        saveForWebBrowser(data, `${this._map.getMapName()}.json`);
    }

    public openMap(spriteFrame: cc.SpriteFrame, params: MapParams): void {
        spriteFrame.addRef();
        const sprite = this.mapNode.getComponent(cc.Sprite);
        sprite.spriteFrame?.decRef();
        sprite.spriteFrame = spriteFrame;
        this._map = this.createMap(params);
        this.calculationMapScale();
        this.calculationMapPos();
        this._map.renderMap(this.graphics);
    }
}

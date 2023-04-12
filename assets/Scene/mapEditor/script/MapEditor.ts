import {
  OperationType,
  MapType,
  MapData,
  saveForWebBrowser,
  uploadForWebBrowser
} from './MapEditorUtils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapEditor extends cc.Component {
  @property(cc.Node)
  private readonly mapNode: cc.Node = null!;

  @property(cc.Graphics)
  private readonly graphics: cc.Graphics = null!;

  private _button: number = -1;
  private _minScale!: number;
  private _operationType: OperationType = OperationType.normal;
  private _mapType: MapType = MapType.angle90;
  private _mapData: MapData;

  protected onLoad (): void {
    this.init();
    this.bindEvent();
  }

  protected init (): void {
    this.calculationMapScale();
    this.calculationMapPos();
    this._mapData = new MapData({
      name: 'test',
      bgName: 'test',
      mapType: this._mapType,
      mapWidth: this.mapNode.width,
      mapHeight: this.mapNode.height,
      nodeWidth: 40,
      nodeHeight: 40
    });
    this._mapData.render(this.graphics);
  }

  protected bindEvent (): void {
    this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
    this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
  }

  protected onMouseDown (event: cc.Event.EventMouse): void {
    this._button = event.getButton();
    if (this._button === cc.Event.EventMouse.BUTTON_LEFT) {
      this.handleMouseLeftMove(event);
    }
  }

  protected onMouseMove (event: cc.Event.EventMouse): void {
    const v = this._button === -1 ? event.getButton() : this._button;
    switch (v) {
      case cc.Event.EventMouse.BUTTON_LEFT:this.handleMouseLeftMove(event);
        break;
      case cc.Event.EventMouse.BUTTON_RIGHT:this.handleMouseRightMove(event);
        break;
    }
  }

  protected onMouseUp (event: cc.Event.EventMouse): void {
    this._button = -1;
  }

  protected onMouseWheel (event: cc.Event.EventMouse): void {
    const preScale = this.mapNode.scale;
    const dirPos = this.mapNode.convertToNodeSpaceAR(event.getLocation());
    const nextScale = Math.max(this._minScale, Math.min(5, preScale + event.getScrollY() / 1000));
    const op = dirPos.mul(preScale - nextScale);
    this.mapNode.x += op.x;
    this.mapNode.y += op.y;
    this.mapNode.scale = nextScale;
    this.calculationMapPos();
  }

  protected handleMouseLeftMove (event: cc.Event.EventMouse): void {
    this._mapData.setNodeTypeByPosition(this.mapNode.convertToNodeSpaceAR(event.getLocation()), this._operationType);
    this._mapData.render(this.graphics);
  }

  protected handleMouseRightMove (event: cc.Event.EventMouse): void {
    this.mapNode.x += event.getDeltaX();
    this.mapNode.y += event.getDeltaY();
    this.calculationMapPos();
  }

  protected calculationMapPos (): void {
    const { width, height } = this.mapNode;
    const { scale, anchorX, anchorY } = this.mapNode;
    this.mapNode.x = Math.max(-(scale * width * (1 - anchorX) - cc.winSize.width / 2), Math.min(scale * width * anchorX - cc.winSize.width / 2, this.mapNode.x));
    this.mapNode.y = Math.max(-(scale * height * (1 - anchorY) - cc.winSize.height / 2), Math.min(scale * height * anchorY - cc.winSize.height / 2, this.mapNode.y));
  }

  protected calculationMapScale (): void {
    const { width, height } = this.mapNode;
    this._minScale = Math.max(cc.winSize.width / width, cc.winSize.height / height);
    this.mapNode.scale = Math.max(this._minScale, this.mapNode.scale);
  }

  public ACT_toggleDrawType (toggle: cc.Toggle): void {
    const _toggleContainer = (toggle as any)._toggleContainer as cc.ToggleContainer;
    this._operationType = _toggleContainer.toggleItems.indexOf(toggle);
  }

  public ACT_toggleMapType (toggle: cc.Toggle): void {
    const _toggleContainer = (toggle as any)._toggleContainer as cc.ToggleContainer;
    this._mapType = _toggleContainer.toggleItems.indexOf(toggle);
  }

  public ACT_save (): void {
    saveForWebBrowser(this._mapData.getData(), 'test.json');
  }

  public ACT_upload (): void {
    uploadForWebBrowser((file: string) => { console.log(JSON.parse(file)); }, '.json');
  }
}

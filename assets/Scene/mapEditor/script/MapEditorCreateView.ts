import MapEditor from './MapEditor';
import { calculateHexGrid, createCompEventHandler } from './MapEditorUtils';
import { BlobToCCSpriteFrame, uploadForWebBrowser } from './MapEditorUtils';
import { MapType } from './map/MapType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapEditorOpenView extends cc.Component {
    @property(MapEditor)
    protected editor: MapEditor = null!;

    @property({
        displayName: '图片Label',
        tooltip: '图片Label',
        type: cc.Label,
    })
    protected imageLabel: cc.Label = null!;

    @property({
        displayName: '地图名称输入框',
        tooltip: '地图名称输入框',
        type: cc.EditBox,
    })
    protected mapNameEditBox: cc.EditBox = null!;

    @property({
        displayName: '选择图片按钮',
        tooltip: '选择图片按钮',
        type: cc.Button,
    })
    protected selectImgButton: cc.Button = null!;

    @property({
        displayName: '地图类型ToggleContainer',
        tooltip: '地图类型ToggleContainer',
        type: cc.ToggleContainer,
    })
    protected mapTypeToggleContainer: cc.ToggleContainer = null!;

    @property({
        displayName: '格子宽度输入框',
        tooltip: '格子宽度输入框',
        type: cc.EditBox,
    })
    protected widthEditBox: cc.EditBox = null!;

    @property({
        displayName: '格子高度输入框',
        tooltip: '格子高度输入框',
        type: cc.EditBox,
    })
    protected heightEditBox: cc.EditBox = null!;

    @property({
        displayName: '取消按钮',
        tooltip: '取消按钮',
        type: cc.Button,
    })
    protected cancelButton: cc.Button = null!;

    @property({
        displayName: '主页新建按钮',
        tooltip: '主页新建按钮',
        type: cc.Button,
    })
    protected homeCreateButton: cc.Button = null!;

    @property({
        displayName: '当前页面新建按钮',
        tooltip: '当前页面新建按钮',
        type: cc.Button,
    })
    protected viewCreateButton: cc.Button = null!;

    protected img: Blob;

    protected onLoad(): void {
        this.node.active = false;
        this.homeCreateButton.node.on('click', this.show, this);
        this.selectImgButton.node.on('click', this.selectImg, this);
        this.cancelButton.node.on('click', this.hide, this);
        this.viewCreateButton.node.on('click', this.create, this);
        this.mapTypeToggleContainer.checkEvents.push(
            createCompEventHandler(this.node, this, this.onCheckChanged)
        );
        this.widthEditBox.textChanged.push(
            createCompEventHandler(this.node, this, this.onTextChanged)
        );
    }

    protected onCheckChanged(string: String): void {
        this.setEditBox();
    }

    protected onTextChanged(string: String): void {
        this.setEditBox(Number(string), Number(this.heightEditBox.string));
    }

    protected setEditBox(width: number = 40, height: number = 40): void {
        const { toggleItems } = this.mapTypeToggleContainer;
        const index = toggleItems.findIndex((item) => item.isChecked);
        this.heightEditBox.enabled = index !== MapType.honeycomb;
        this.widthEditBox.string = width.toString();

        this.heightEditBox.string =
            index !== MapType.honeycomb
                ? height!.toString()
                : ((width * Math.sqrt(3)) / 2).toFixed(3);
    }

    public async selectImg(): Promise<void> {
        const files = await uploadForWebBrowser(
            'image/jpeg,image/jpg,image/png'
        );
        if (files) {
            this.imageLabel.string = files[0].name;
            this.img = files[0];
        }
    }

    public show(): void {
        this.node.active = true;
        this.imageLabel.string = '';
        this.img = null!;
        this.mapTypeToggleContainer.toggleItems[MapType.angle90].check();
        this.setEditBox();
    }

    public hide(): void {
        this.node.active = false;
    }

    public async create(): Promise<void> {
        if (
            !this.img ||
            !this.widthEditBox.string ||
            !this.heightEditBox.string
        )
            return;
        const spriteFrame = await BlobToCCSpriteFrame(this.img);
        const mapType = this.mapTypeToggleContainer.toggleItems.findIndex(
            (item) => item.isChecked
        );
        const mapWidth = spriteFrame.getOriginalSize().width;
        const mapHeight = spriteFrame.getOriginalSize().height;
        const roadWidth = +this.widthEditBox.string;
        const roadHeight = +this.heightEditBox.string;
        const p = calculateHexGrid(
            mapType,
            mapWidth,
            mapHeight,
            roadWidth,
            roadHeight
        );
        this.editor.openMap(spriteFrame, {
            name: this.mapNameEditBox.string,
            bgName: this.imageLabel.string,
            mapType,
            mapWidth,
            mapHeight,
            roadWidth,
            roadHeight,
            roadDataArr: Array.from({ length: p.y }, () =>
                new Array(p.x).fill(0)
            ),
        });
        this.node.active = false;
    }
}

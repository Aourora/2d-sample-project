import MapEditor from './MapEditor';
import MapEditorData from './MapEditorData';
import {
    BlobToCCSpriteFrame,
    BlobToString,
    uploadForWebBrowser,
} from './MapEditorUtils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapEditorCreateView extends cc.Component {
    @property(MapEditor)
    protected editor: MapEditor = null!;

    @property({
        displayName: '图片Label',
        tooltip: '图片Label',
        type: cc.Label,
    })
    protected imageLabel: cc.Label = null!;

    @property({
        displayName: '数据Label',
        tooltip: '数据Label',
        type: cc.Label,
    })
    protected dataLabel: cc.Label = null!;

    @property({
        displayName: '选择图片按钮',
        tooltip: '选择图片按钮',
        type: cc.Button,
    })
    protected selectImgButton: cc.Button = null!;

    @property({
        displayName: '选择地图数据按钮',
        tooltip: '选择地图数据按钮',
        type: cc.Button,
    })
    protected selectMapDataButton: cc.Button = null!;

    @property({
        displayName: '取消按钮',
        tooltip: '取消按钮',
        type: cc.Button,
    })
    protected cancelButton: cc.Button = null!;

    @property({
        displayName: '主页打开按钮',
        tooltip: '主页打开按钮',
        type: cc.Button,
    })
    protected homeOpenButton: cc.Button = null!;

    @property({
        displayName: '当前页面打开按钮',
        tooltip: '当前页面打开按钮',
        type: cc.Button,
    })
    protected viewOpenButton: cc.Button = null!;

    protected img: Blob;
    protected data: Blob;

    protected onLoad(): void {
        this.node.active = false;
        this.homeOpenButton.node.on('click', this.show, this);
        this.selectImgButton.node.on('click', this.selectImg, this);
        this.selectMapDataButton.node.on('click', this.selectMapData, this);
        this.cancelButton.node.on('click', this.hide, this);
        this.viewOpenButton.node.on('click', this.open, this);
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

    public async selectMapData(): Promise<void> {
        const files = await uploadForWebBrowser('.json');
        if (files) {
            this.dataLabel.string = files[0].name;
            this.data = files[0];
        }
    }

    public show(): void {
        this.imageLabel.string = '';
        this.dataLabel.string = '';
        this.img = null!;
        this.data = null!;
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }

    public async open(): Promise<void> {
        if (!this.img || !this.data) return;
        this.editor.openMap(
            await BlobToCCSpriteFrame(this.img),
            JSON.parse(await BlobToString(this.data))
        );
        this.node.active = false;
    }
}

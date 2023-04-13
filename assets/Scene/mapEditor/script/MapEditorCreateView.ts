import MapEditor from './MapEditor';
import {
    BlobToCCSpriteFrame,
    MapType,
    uploadForWebBrowser,
} from './MapEditorUtils';

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
        this.widthEditBox.string = '40';
        this.heightEditBox.string = '40';
        this.mapTypeToggleContainer.toggleItems[MapType.angle90].check();
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
        this.editor.openMap(spriteFrame, {
            name: this.mapNameEditBox.string,
            bgName: this.imageLabel.string,
            mapType: this.mapTypeToggleContainer.toggleItems.findIndex(
                (item) => item.isChecked
            ),
            mapWidth: spriteFrame.getOriginalSize().width,
            mapHeight: spriteFrame.getOriginalSize().height,
            nodeWidth: +this.widthEditBox.string,
            nodeHeight: +this.heightEditBox.string,
        });
        this.node.active = false;
    }
}

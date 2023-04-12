const { ccclass } = cc._decorator;

@ccclass
export default class HomeBtn extends cc.Component {
    static instance: HomeBtn = null!;
    protected onLoad(): void {
        if (HomeBtn.instance) {
            this.destroy();
        } else {
            cc.game.addPersistRootNode(this.node);
            HomeBtn.instance = this;
            this.toggleActive(false);
        }
    }

    public toggleActive(flag: boolean): void {
        this.node.active = flag;
    }

    public backToHome(): void {
        this.toggleActive(false);
        cc.director.loadScene('Home');
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingProgress extends cc.Component {
    @property(cc.ProgressBar)
    private readonly loadingProgress: cc.ProgressBar = null!;

    @property(cc.Node)
    private readonly loadingNode: cc.Node = null!;

    private beginLoad: boolean = false;
    private loadingTime: number = 0;
    private maxLoadingTime: number;
    private callback: () => void;

    protected onLoad(): void {
        this.loadingNode.active = false;
    }

    public get isLoading(): boolean {
        return this.beginLoad;
    }

    public begin(time?: number, callback?: () => void): void {
        this.maxLoadingTime = time!;
        this.callback = callback!;
        this.beginLoad = true;
        this.loadingNode.active = true;
        this.loadingProgress.progress = 0;
        this.loadingTime = 0;
    }

    public setProgress(progress: number): void {
        progress = Math.max(0, Math.min(progress, 1));
        this.loadingProgress.progress = progress;
    }

    public end(): void {
        this.setProgress(1);
        this.maxLoadingTime = null!;
        this.beginLoad = false;
    }

    protected update(dt: number): void {
        if (!this.maxLoadingTime) return;
        this.loadingTime += dt;
        const progress = this.loadingTime / this.maxLoadingTime;
        this.setProgress(this.loadingTime / this.maxLoadingTime);
        if (progress >= 1) {
            this?.callback();
            this.end();
        }
    }
}

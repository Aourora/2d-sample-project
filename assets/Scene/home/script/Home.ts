import HomeBtn from './HomeBtn';
import LoadingProgress from './LoadingProgress';
import { LOADING_MAX_TIME, SceneList } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Home extends cc.Component {
  @property(cc.Node)
  private readonly scrollContent: cc.Node = null!;

  @property(cc.Prefab)
  private readonly scrollItemPrefab: cc.Prefab = null!;

  @property(LoadingProgress)
  private readonly loadingProgress: LoadingProgress = null!;

  protected onLoad (): void {
    this.initScrollItem();
  }

  private initScrollItem (): void {
    for (const key in SceneList) {
      const node = cc.instantiate(this.scrollItemPrefab);
      node.getComponentInChildren(cc.Label).string = SceneList[key];
      node.on(cc.Node.EventType.TOUCH_END, () => this.loadScene(key));
      this.scrollContent.addChild(node);
    }
  }

  private loadScene (key: string): void {
    if (this.loadingProgress.isLoading) return;
    //  this.loadingProgress.begin();
    cc.director.preloadScene(key, (completedCount: number, totalCount: number) => {
    //  this.loadingProgress.setProgress(completedCount / totalCount);
    }, (err) => {
      if (err) {
        throw err;
      }
      //    this.loadingProgress.end();
      //    cc.director.loadScene(key);
    });
    // 假进度条
    this.loadingProgress.begin(LOADING_MAX_TIME, () => {
      cc.director.loadScene(key);
      HomeBtn.instance.toggleActive(true);
    });
  }
}

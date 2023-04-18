export enum OperationType {
    erase = 0,
    normal = 1,
    transparency = 2,
}

export enum MapType {
    angle45 = 0,
    angle90 = 1,
    honeycomb = 2,
}

export interface MapParams {
    /**
     * 地图名称
     */
    name: string;
    /**
     * 地图背景名称
     */
    bgName: string;
    /**
     * 地图类型
     */
    mapType: MapType;
    /**
     * 地图宽
     */
    mapWidth: number;
    /**
     * 地图高
     */
    mapHeight: number;
    /**
     * 路点宽
     */
    nodeWidth: number;
    /**
     * 路点高
     */
    nodeHeight: number;
    /**
     * 路点信息
     */
    roadDataArr?: number[][];
}

export interface MapMethod {
    setNodeTypeByPosition: (position: cc.Vec2, type: OperationType) => void;
    render: (graphics: cc.Graphics) => void;
    getData: () => MapParams;
}

export function saveForWebBrowser(data: any, fileName: string): void {
    const str = JSON.stringify(data);
    if (cc.sys.isBrowser) {
        const textFileAsBlob = new Blob([str]);
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.innerHTML = 'Download File';
        const URL = window.URL ?? window.webkitURL;
        const objectUrl = URL.createObjectURL(textFileAsBlob);
        downloadLink.href = objectUrl;
        downloadLink.onclick = () => {
            document.body.removeChild(downloadLink);
        };
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        URL.revokeObjectURL(objectUrl);
    } else if (cc.sys.isNative) {
        jsb.fileUtils.writeStringToFile(
            jsb.fileUtils.getWritablePath(),
            fileName
        );
    }
}

export async function uploadForWebBrowser(
    accept: string
): Promise<FileList | null> {
    return new Promise((resolve, reject) => {
        if (cc.sys.isBrowser) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = accept;
            fileInput.style.height = '0px';
            fileInput.style.display = 'block';
            fileInput.onchange = (event: Event) => {
                const target = event.target as HTMLInputElement;
                resolve(target.files);
                document.body.removeChild(fileInput);
            };
            document.body.appendChild(fileInput);
            fileInput.click();
        } else {
            reject('Not web browser');
        }
    });
}

export async function BlobToString(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.readAsText(blob, 'UTF-8');
        fileReader.onload = (e: ProgressEvent<FileReader>) =>
            resolve(e.target?.result as string);
    });
}

export async function BlobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(blob);
        fileReader.onload = (e: ProgressEvent<FileReader>) =>
            resolve(e.target?.result as string);
    });
}

export async function BlobToCCSpriteFrame(blob: Blob): Promise<cc.SpriteFrame> {
    const dataUrl = await BlobToDataUrl(blob);
    const image = new Image();
    image.src = dataUrl;
    const texture = new cc.Texture2D();
    texture.initWithElement(image);
    texture.addRef();
    const spriteFrame = new cc.SpriteFrame(texture);

    return spriteFrame.textureLoaded()
        ? Promise.resolve(spriteFrame)
        : new Promise((resolve) => {
              spriteFrame.once('load', () => resolve(spriteFrame));
          });
}

export function createCompEventHandler<T extends Function>(
    node: cc.Node,
    component: cc.Component,
    handler: T,
    customEventData?: string
): cc.Component.EventHandler {
    const eventHandler = new cc.Component.EventHandler();
    eventHandler.target = node;
    eventHandler.component = cc.js.getClassName(component);
    eventHandler.handler = getFuncName(handler, component);
    eventHandler.customEventData = customEventData ?? '';
    return eventHandler;
}

export function getFuncName<T extends Function>(
    func: T,
    target: cc.Component
): string {
    let prototype = Object.getPrototypeOf(target);
    while (prototype) {
        const keys = Object.keys(prototype);
        for (let i = 0, { length } = keys; i < length; ++i) {
            if (target[keys[i]] === func) return keys[i];
        }
        prototype = Object.getPrototypeOf(prototype);
    }
    return '';
}

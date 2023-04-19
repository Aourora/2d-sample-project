import { MapType, Point } from './map/MapType';

export enum OperationType {
    erase = 0,
    normal = 1,
    transparency = 2,
}

/**
 * 保存文件到本地
 * @param data 文件内容
 * @param fileName 文件名
 */
export function saveForWebBrowser(data: string, fileName: string): void {
    if (cc.sys.isBrowser) {
        const textFileAsBlob = new Blob([data]);
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

/**
 * 打开文件选择器
 * @param accept 文件类型
 * @returns
 */
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

/**
 * 创建EventHandler
 * @param node
 * @param component
 * @param handler
 * @param customEventData
 * @returns
 */
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

/**
 * 获取对象函数名称
 * @param func 需要获取的函数
 * @param target 函数所在对象
 * @returns
 */
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

/**
 * 计算地图行列数量
 * @param mapType
 * @param mapWidth
 * @param mapHeight
 * @param roadWidth
 * @param roadHeight
 * @returns
 */
export function calculateHexGrid(
    mapType: MapType,
    mapWidth: number,
    mapHeight: number,
    roadWidth: number,
    roadHeight: number
): Point {
    const p = { x: 0, y: 0 };
    if (mapType === MapType.honeycomb) {
        p.y = Math.ceil(mapHeight / roadHeight);
        p.x = Math.ceil(mapWidth / (roadWidth * 0.75));
    } else if (mapType === MapType.angle90) {
        p.y = Math.ceil(mapHeight / roadHeight);
        p.x = Math.ceil(mapWidth / roadWidth);
    } else {
        p.y = Math.ceil(mapHeight / (roadHeight / 2));
        p.x = Math.ceil(mapWidth / roadWidth);
    }
    return p;
}

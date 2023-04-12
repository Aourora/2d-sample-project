export enum OperationType {
  erase = 0,
  normal = 1,
  transparency = 2,
};

export enum MapType {
  angle45 = 0,
  angle90 = 1,
  honeycomb = 2
};

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
}

export interface MapMethod {
  setNodeTypeByPosition: (position: cc.Vec2, type: OperationType) => void;
  render: (graphics: cc.Graphics) => void;
  getData: () => string;
}

export class MapData implements MapMethod {
  constructor (params: MapParams) {
    Object.assign(this, params);
    this.calculateRoadData();
  }

  private name: string;
  private bgName: string;
  private mapType: MapType;
  private mapWidth: number;
  private mapHeight: number;
  private nodeWidth: number;
  private nodeHeight: number;
  private roadDataArr: number[][];
  private row: number;
  private col: number;

  private calculateRoadData (): void {
    const { mapType, mapWidth, mapHeight, nodeWidth, nodeHeight } = this;
    if (mapType === MapType.angle90) {
      this.row = Math.ceil(mapHeight / nodeHeight);
      this.col = Math.ceil(mapWidth / nodeWidth);
      this.roadDataArr = Array.from({ length: this.row }, () => new Array(this.col).fill(0));
    }
  }

  setMapType (type: MapType): void {
    this.mapType = type;
    this.calculateRoadData();
  }

  setNodeTypeByPosition ({ x, y }: cc.Vec2, type: OperationType): void {
    const row = Math.floor(y / this.nodeHeight);
    const col = Math.floor(x / this.nodeWidth);
    this.roadDataArr[row][col] = type;
  }

  render (graphics: cc.Graphics): void {
    graphics.clear();
    cc.Color.fromHEX(graphics.strokeColor, '#e74c3c');
    graphics.strokeColor.a = 188;
    graphics.lineWidth = 2;
    const { mapType, mapWidth, mapHeight, nodeWidth, nodeHeight, row, col, roadDataArr } = this;
    if (mapType === MapType.angle90) {
      // 渲染格子线条
      let offset = 0;
      for (let i = 0; i <= row; ++i) {
        graphics.moveTo(0, offset);
        graphics.lineTo(mapWidth, offset);
        offset += nodeHeight;
      }
      offset = 0;
      for (let i = 0; i <= col; ++i) {
        graphics.moveTo(offset, 0);
        graphics.lineTo(offset, mapHeight);
        offset += nodeWidth;
      }
      graphics.stroke();
      // 渲染格子
      for (let i = 0; i < row; ++i) {
        for (let j = 0; j < col; ++j) {
          if (roadDataArr[i][j] !== OperationType.erase) {
            graphics.rect(j * nodeWidth + 1, i * nodeHeight + 1, nodeWidth - 2, nodeHeight - 2);
            cc.Color.fromHEX(graphics.fillColor, roadDataArr[i][j] === OperationType.normal ? '#2ecc71' : '#c7ecee');
            graphics.fillColor.a = 188;
            graphics.fill();
          }
        }
      }
    }
  }

  getData (): string {
    const { name, bgName, mapType, mapWidth, mapHeight, nodeWidth, nodeHeight, roadDataArr } = this;
    return JSON.stringify({
      name,
      bgName,
      mapType,
      mapWidth,
      mapHeight,
      nodeWidth,
      nodeHeight,
      roadDataArr
    });
  }
}

export function saveForWebBrowser (data: string, fileName: string): void {
  if (cc.sys.isBrowser) {
    const textFileAsBlob = new Blob([data]);
    const downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    downloadLink.innerHTML = 'Download File';
    if (window.URL) {
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    } else {
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    downloadLink.onclick = () => {
      document.body.removeChild(downloadLink);
    };
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }
}

export async function uploadForWebBrowser (onload: (result: string) => void, accept: string): Promise<FileList | undefined> {
  if (cc.sys.isBrowser) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.innerHTML = 'file';
    fileInput.accept = accept;
    fileInput.style.height = '0px';
    fileInput.style.display = 'block';
    fileInput.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const fileReader = new FileReader();
        fileReader.readAsText(target.files[0], 'UTF-8');
        console.log(target.files[0]);
        fileReader.onload = (e: ProgressEvent<FileReader>) => onload(e.target?.result as string);
      }
      document.body.removeChild(fileInput);
    };
    document.body.appendChild(fileInput);
    fileInput.click();
  }
}

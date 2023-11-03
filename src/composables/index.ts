export type MRecord<T> = {
  [K in keyof T]?: T[K] | null;
};

export interface PhotoInterface {
  isActiveSet?: boolean;
  src: string | null;
  deg: number;
  top: number;
  left: number;
  width: number;
  height: number;
  mode?: number;
  flag?: number;
  gridX?: number;
  gridY?: number;
  ratio?: number | null;
}

export interface FrameInterface {
  // photoLimit: number;
  size?: string | null;
  image: {
    src: string | null;
    deg: number;
    top: number;
    left: number;
    width?: number;
    height?: number;
    fit?: boolean;
  };
  width?: number | string;
  height?: number | string;
  photos: PhotoInterface[];
}

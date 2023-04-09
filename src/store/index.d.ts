export interface IPosition {
    width: number | string;
    height: number | string;
    left: number;
    top: number;
    remote: number;
    background: string;
    ratio?: number;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    content?: string;
    lineHeight?: number
    url?: string
    base64?: string
}
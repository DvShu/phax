declare class Phax {
    opts: any;
    constructor(method: string, args: any[]);
    _args(args: any[]): void;
    text(): Promise<any>;
    json(): Promise<any>;
    blob(): Promise<any>;
    arrayBuffer(): Promise<any>;
    formData(): Promise<any>;
    _request(way?: string): Promise<any>;
}
export declare function get(...args: any[]): Phax;
export declare function post(...args: any[]): Phax;
export {};

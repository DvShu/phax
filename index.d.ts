interface PhaxInit {
    url?: string;
    credentials?: string;
    method?: string;
    accept?: string;
    body?: any;
    json?: object;
    headers?: any;
}
/**
 * 使用 Interface 定义函数
 */
interface PhaxFunc {
    (url: string): Promise<any>;
    (options: PhaxInit): Promise<any>;
    (url: string, accept: string): Promise<any>;
    (url: string, accept: string, options: PhaxInit): Promise<any>;
    (url: string, options: PhaxInit): Promise<any>;
    (url: string, options: PhaxInit): Promise<any>;
    get: PhaxFunc;
    post: PhaxFunc;
}
declare let phax: PhaxFunc | any;
export default phax;

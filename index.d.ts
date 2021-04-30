export interface PhaxRequestConfig {
    /**
     * 请求的地址
     */
    url: string;
    /**
     * 配置是否带上 cookie，默认：same-origin: 表示cookie只能同域发送，不能跨域发送
     */
    credentials?: RequestCredentials;
    /**
     * 请求的方法，默认：GET
     */
    method?: string;
    /**
     * 解析的返回类型，可以有 json | text，如果不传，则根据 response.headers Content-Type 进行判断
     */
    accept?: string;
    /**
     * 请求的实体内容，fetch-body
     */
    body?: any;
    /**
     * 当上传 json 格式的参数时，配置这个字段，会自动将请求的 Content-Type 配置为 json
     */
    json?: any;
    /**
     * 请求头部，fetch-headers
     */
    headers?: any;
    /**
     * 拼接到 url 地址上的请求参数
     */
    query?: any;
    /**
     * 转换为 form-urlencoded 请求的参数
     */
    params?: any;
}
interface InterceptorIntf {
    /**
     * 注册请求过滤器，用于在每一次请求前，对参数进行自定义的处理
     * @param cb 过滤函数，用于对参数的处理
     */
    request: (cb: (params: PhaxRequestConfig) => PhaxRequestConfig) => void;
    /**
     * 注册返回过滤器，用于对返回的结果做处理
     * @param cb  过滤函数，用于对返回结果的处理
     * @param err 错误处理，对请求失败后的错误做处理
     */
    response: (cb: (params: any) => any, err?: (err: PhaxError) => void) => void;
}
/**
 * 执行 fetch 请求
 */
interface PhaxInstance {
    /**
     * 配置拦截器
     */
    interceptors: InterceptorIntf;
    /**
     * 执行 GET 请求
     */
    get: PhaxInstance;
    post: PhaxInstance;
    /**
     * 使用 fetch 请求传递的 url
     * @param url 请求地址
     */
    (options: string | PhaxRequestConfig): Promise<any>;
    /**
     * 使用 fetch 请求传递的 url
     * @param url {string}    请求地址
     * @param options {string | Object} 如果为 string 则表示解析的返回类型，可以有 json | text，如果不传，则根据 response.headers Content-Type 进行判断
     */
    (url: string, options: string | PhaxRequestConfig): Promise<any>;
    /**
     * 使用 fetch 请求
     * @param url 请求地址
     * @param accept {string} 解析的返回类型，可以有 json | text，如果不传，则根据 response.headers Content-Type 进行判断
     * @param options {PhaxRequestConfig} 请求配置
     */
    (url: string, accept: string, options: PhaxRequestConfig): Promise<any>;
    /**
     * 注册拦截器(过滤器)
     */
    [index: string]: any;
}
export interface PhaxError extends Error {
    /**
     * 后台返回的错误信息的实体内容
     */
    body: any;
    /**
     * 错误状态码
     */
    status: number;
}
declare let phax: PhaxInstance;
export default phax;

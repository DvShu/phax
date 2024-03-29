# phax

phax is a lightweight HTTP client based on the browser Fetch API;

## Language

1. English
2. [简体中文](https://github.com/DvShu/phax/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3 '简体中文')

## Installing

```javascript
npm install phax --save
// or
yarn add phax
```

## Usage

Temporarily only supports `GET/POST/PUT/PATCH/HEAD/DELETE` method. The default value:

```javascript
{
  credentials: 'same-origin',
  method: 'GET'
}
```

```javascript
import phax from 'phax'; // ES6 module

window.phax.get;
window.phax.post;
// or
phax.get;
phax.post;

// add interceptor
// add request interceptor
phax.interceptors.request(function (params) {
  params.json.b = 2;
  return params;
});
// add response interceptor， first function response interceptor，second function error interceptor
phax.interceptors.response(
  function (params) {
    return params;
  },
  (err: PhaxError) => {}
);

phax
  .get()
  .then(function (res) {
    // Response.ok == true
    console.log(res);
  })
  .catch(function (err) {
    if (err.name === 'StatusError') {
      // HTTP statuses error
      console.log(err.statusCode + ' & ' + err.message);
    } else {
      // Network error
      console.log(err);
    }
  });
```

The default return value type matches by `res.headers.Content-Type`，egg:

```javascript
if (res.headers.Content - Type === 'application/json') {
  return res.json();
}
```

Return type matching：

1. `text/*` => _text_
2. `application/json` => _json_
3. `multipart/form-data` => _formData_

Different from native API. phax's `catch error` contains `Network error`、`HTTP statuses error`.<br>
For function parameters refer to [fetch-polyfill](https://github.com/github/fetch 'fetch-polyfill') or [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API 'fetch')

## Example

### GET

Performing a `GET` request.

```javascript
import phax from 'phax';

phax({
  url: '/user?id=1',
  method: 'GET',
});

phax
  .get('/user?id=1')
  .then(function (res) {
    console.log(res); // json
  })
  .catch(function (err) {
    console.log(err);
  });

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getUser() {
  try {
    const response = await phax.get('/user?id=12345').json();
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

> NOTE: `async/await` is part of ECMAScript 2017 and is not supported in Internet Explorer and older browsers, so use with caution.

### POST

#### Send `json` data.

```javascript
phax.post('/post_user', { json: { name: 'LIVI' } });
```

#### Using application/x-www-form-urlencoded format

To send data in the `application/x-www-form-urlencoded`, you can use one of the following options.

1.  Use the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams 'URLSearchParams') API as follows:

    ```javascript
    var params = new URLSearchParams();
    params.append('param1', 'value1');
    params.append('param2', 'value2');

    phax.post('/foo', { body: params });
    ```

    > Note that `URLSearchParams` is not supported by all browsers (see [caniuse.com](https://caniuse.com/#feat=urlsearchparams 'can i use URLSearchParams')), but there is a [polyfill](https://github.com/WebReflection/url-search-params 'URLSearchParams polyfill') available (make sure to polyfill the global environment).

2.  You can encode data using the [qs](https://github.com/ljharb/qs 'qs') library:
    ```javascript
    phax.post('/foo', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: qs.stringify({ bar: 123 }),
    });
    ```
3.  If you won't use `qs`, you can handle the parameters manually:

    ```javascript
    var params = 'bar=123&name=LIVI&age=18';

    phax.post('/foo', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    ```

    > NOTE: Follow-up may consider simple support for this approach.

## API

1. `phax(url[, accept [, fetchOpts]])`
2. `phax(fetchOpts)`
3. `phax.get()`
4. `phax.post()`
5. `phax.interceptors.request()`
6. `phax.interceptors.response(() => {}, () => {})`

……

supported methods：_get_、_post_、_put_、_delete_、_patch_，all methods params same as `phax()`
param desc：

- url: _String_
- accept: _String_ _[Optional]_ The return type；The priority over default automatic matching
- json: _Object_ _[Optional]_ POST JSON body
- fetchOpts: _Object_ The native `fetch` supported data，simultaneously compatible with the above three parameters

`interceptors` add request interceptor：

- `interceptors.request: (cb: (params: PhaxRequestConfig) => PhaxRequestConfig) => void;` regist request interceptor，for each request start to operate request params.
- `interceptors.response: (cb: (params: any) => any, err?: (err: PhaxError) => void) => void;`：add response interceptor; The first function is response interceptor; The second function is error interceptor.

## Promises

phax depends on a native ES6 Promise implementation to be [supported](https://caniuse.com/promises 'promises-supported'). If your environment doesn't support ES6 Promises, you can [polyfill](https://github.com/stefanpenner/es6-promise 'es6-promise').<br/>
Recommended to use the [jsdelivr](https://www.jsdelivr.com 'jsdelivr') CDN.

```javascript
<script src='https://cdn.jsdelivr.net/npm/es6-promise@4.2.5/dist/es6-promise.auto.min.js'></script>
```

## fetch

phax depends on a native fetch API implementation to be [supported](https://caniuse.com/fetch 'fetch-supported'). If your environment doesn't support fetch, you can [polyfill](https://github.com/github/fetch 'fetch-polyfill').<br/>
Recommended to use the [jsdelivr](https://www.jsdelivr.com 'jsdelivr') CDN.

```javascript
<script src='https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/dist/fetch.umd.min.js'></script>
```

## TypeScript

phax includes [TypeScript](https://www.typescriptlang.org/ 'TypeScript') definitions.

```javascript
import phax from 'phax';

phax({ url: '/test?id=1', accept: 'json' }); // get

phax.get('/test?id=1', 'json'); // get

phax.post('/post', 'json'); // post

phax({
  url: '/foo',
  method: 'post',
}); // post
```

## License

[MIT](https://github.com/DvShu/phax/blob/master/LICENSE 'MIT')

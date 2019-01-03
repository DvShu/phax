# phax
phax is a lightweight HTTP client based on the browser Fetch API;
## Language
1. English
2. [简体中文](https://github.com/DvShu/phax/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3 "简体中文")
## Installing
### Using npm:
```javascript
npm install phax --save
// or
yarn add phax
```
### Using cdn:
```javascript
<script src="https://cdn.jsdelivr.net/npm/phax@0.0.2/dist/index.min.js"></script>
```
### Download:
As an alternative to using npm, you can obtain `dist/index.js` from the [Releases](https://github.com/DvShu/phax/releases "Releases") section. The UMD distribution is compatible with AMD and CommonJS module loaders, as well as loading directly into a page via `<script>` tag.
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

window.phax.get
window.phax.post
// or
phax.get
phax.post

phax.get()
  .json() // Method of processing the returned result
  .then(function(res) { // Response.ok == true
    console.log(res);
  })
  .catch(function(err) {
    if (err.name === 'StatusError') { // HTTP statuses error
      console.log(err.statusCode + ' & ' + err.message);
    } else { // Network error
      console.log(err);
    }
  })
```
Method of processing the returned result contains `json(), text(), arrayBuffer()、blob()、formData()`.[fetch-body](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Body 'fetch-body').<br>
Different from native API. phax's `catch error` contains `Network error`、`HTTP statuses error`.<br>
For function parameters refer to [fetch-polyfill](https://github.com/github/fetch "fetch-polyfill") or [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API "fetch")
## Example
### GET
Performing a `GET` request.
```javascript
import phax from 'phax';

phax({
  url: '/user?id=1',
  method: 'GET'
})

phax.get('/user?id=1')
  .json()
  .then(function(res) {
    console.log(res); // json
  })
  .catch(function(err) {
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
phax.post('/post_user', { json: { name: 'LIVI' } }).json()
```
#### Using application/x-www-form-urlencoded format
 To send data in the `application/x-www-form-urlencoded`, you can use one of the following options.
 1. Use the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams "URLSearchParams") API as follows:
     ```javascript
     var params = new URLSearchParams();
     params.append('param1', 'value1');
     params.append('param2', 'value2');

     phax.post('/foo', { body: params })
     ```
     > Note that `URLSearchParams` is not supported by all browsers (see [caniuse.com](https://caniuse.com/#feat=urlsearchparams "can i use URLSearchParams")), but there is a [polyfill](https://github.com/WebReflection/url-search-params "URLSearchParams polyfill") available (make sure to polyfill the global environment).
 2. You can encode data using the [qs](https://github.com/ljharb/qs "qs") library:
    ```javascript
    phax.post('/foo', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: qs.stringify({ bar: 123 })
    })
    ```
 3. If you won't use `qs`, you can handle the parameters manually:
    ```javascript
    var params = 'bar=123&name=LIVI&age=18'

    phax.post('/foo', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params
    })
    ```
    > NOTE: Follow-up may consider simple support for this approach.
## Promises
phax depends on a native ES6 Promise implementation to be [supported](https://caniuse.com/promises "promises-supported"). If your environment doesn't support ES6 Promises, you can [polyfill](https://github.com/stefanpenner/es6-promise "es6-promise").<br/>
Recommended to use the [jsdelivr](https://www.jsdelivr.com "jsdelivr") CDN.
```javascript
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4.2.5/dist/es6-promise.auto.min.js"></script>
```
## fetch
phax depends on a native fetch API implementation to be [supported](https://caniuse.com/fetch "fetch-supported"). If your environment doesn't support fetch, you can [polyfill](https://github.com/github/fetch "fetch-polyfill").<br/>
Recommended to use the [jsdelivr](https://www.jsdelivr.com "jsdelivr") CDN.
```javascript
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/dist/fetch.umd.min.js"></script>
```
## TypeScript
axios includes [TypeScript](https://www.typescriptlang.org/ "TypeScript") definitions.
```javascript
import phax from 'phax';

phax({url:'/test?id=1'}).json() // get

phax.get('/test?id=1').json(); // get

phax.post('/post').json(); // post

phax({
  url: '/foo',
  method: 'post'
}).json() // post
```
## License
[MIT](https://github.com/DvShu/phax/blob/master/LICENSE "MIT")

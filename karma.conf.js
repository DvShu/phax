// Karma configuration
// Generated on Tue Jul 17 2018 15:47:45 GMT+0800 (中国标准时间)
const url = require('url');
const bodyParser = require('body-parser');
const contentType = require('content-type')

// create application/json parser
let jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let textPraser = bodyParser.text();

function karmaBodyParser (config) {
  return function(req, res, next) {
    if (req.method === 'GET') {
      req.query = url.parse(req.url, true).query;
      console.log(req.query);
      next();
    } else {
      jsonParser(req, res, function(err) {
        if (err) return next(err);
        urlencodedParser(req, res, function(err) {
          if (err) return next(err);
          textPraser(req, res, next);
        });
      });
    }
  };
}

function route (config) {
  return function (req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.writeHead(200);
    let resBody = {
      url: req.url,
      method: req.method
    };
    if (req.method === 'GET') {
      resBody.body = req.query;
    } else {
      resBody.body = req.body;
      resBody.sendType = contentType.parse(req).type;
    }
    return res.end(JSON.stringify(resBody));
  };
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: [
      'lib/*.ts',
      'test/*.spec.ts'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': 'karma-typescript'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'karma-typescript'],

    middleware: ['karmaBodyParser', 'route'],

    // 配置使用的插件列表
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-typescript',
      {'middleware:karmaBodyParser': ['factory', karmaBodyParser]},
      {'middleware:route': ['factory', route]}
    ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1
  });
};

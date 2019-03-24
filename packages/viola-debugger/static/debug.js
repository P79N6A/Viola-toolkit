/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(1),
    query = _require.query;

var websocket = viola.requireAPI('webSocket');

websocket.sendTask = function sendTask(type, data) {
  this.send(JSON.stringify({
    type: type,
    data: data
  }));
};

var old = viola.tasker.receive;

viola.tasker.receive = function (tasks) {
  if (!Array.isArray(tasks)) {
    // transform to Array from String
    tasks = JSON.parse(tasks);
  }

  var t = tasks[0]; // if (t.module == 'webSocket') {

  old.call(viola.tasker, tasks); // }
  // websocket.send(JSON.stringify(t));

  websocket.sendTask('callJS', t);
};

var isCreateBody = 0;
var wsUrl = query.ws + query.channel; // throw new Error(wsUrl)

websocket.WebSocket("ws://".concat(wsUrl), '');
websocket.onopen(function (e) {
  websocket.sendTask('login', {
    pageId: query.pageId,
    entryId: query.entryId,
    ViolaEnv: ViolaEnv,
    viola: {
      instanceId: viola.getId(),
      pageData: viola.pageData
    }
  });
});
websocket.onmessage(function (e) {
  var _JSON$parse = JSON.parse(e.data),
      type = _JSON$parse.type,
      data = _JSON$parse.data;

  if (data[0].method == 'createBody') {
    viola.tasker.sendTask([{
      module: 'dom',
      method: 'addElement',
      args: [viola.document.body.ref, data[0].args, 0]
    }]); // viola.requireAPI('bridge').invoke({
    //   ns: 'ui',
    //   method: 'showDialog',
    //   params: {
    //     title: 'alert',
    //     text: viola.document.body.ref,
    //     needOkBtn: true,
    //     needCancelBtn: false,
    //   }
    // })
    // viola.tasker.sendTask([{
    //   "module":"dom",
    //   "method":"addElement",
    //   "args": [
    //     viola.document.body.ref,
    //     {"ref":"1","type":"div","style":{"height":"200dp","backgroundColor":"black"}},
    //     0
    //   ]
    // }])
  } else {
    viola.tasker.sendTask(data);
  }
});
websocket.onerror(function (e) {
  throw new Error(e);
});
websocket.onclose(function (e) {});
viola.document.body.setStyle({
  backgroundColor: 'green'
});
viola.document.render();

/***/ }),
/* 1 */
/***/ (function(module, exports) {

function query() {
  var queryString = viola.pageData.url.split('?')[1];

  if (queryString) {
    return queryString.split('&').reduce(function (query, params) {
      if (params) {
        var p = params.split('=');
        query[p[0]] = p[1];
      }

      return query;
    }, Object.create(null));
  } else {
    return Object.create(null);
  }
}

module.exports = {
  query: query()
};

/***/ })
/******/ ]);
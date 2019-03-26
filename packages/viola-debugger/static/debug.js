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
    query = _require.query,
    confirm = _require.confirm,
    alert = _require.alert;

var MSG_TYPE = __webpack_require__(3);

var _require2 = __webpack_require__(2),
    genFncId = _require2.genFncId,
    isDebugJSFncId = _require2.isDebugJSFncId,
    actFncById = _require2.actFncById;

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
  } // throw new Error(JSON.stringify(tasks))


  var t = tasks[0];

  if (Array.isArray(t.args) && t.args.length) {
    var fncId = t.args[t.args.length - 1];

    if (isDebugJSFncId(fncId)) {
      actFncById(fncId, t.data);
    } else {
      websocket.sendTask(MSG_TYPE.CALL_JS, {
        task: [t]
      });
    }
  }
};

var isCreateBody = 0,
    realBodyRef = -1,
    fakeBodyRef = viola.document.body.ref;
var wsUrl = query.ws + query.peerId; // throw new Error(wsUrl)

websocket.WebSocket("ws://".concat(wsUrl), '');
websocket.onopen(genFncId(function (e) {
  websocket.sendTask('login', {
    ViolaEnv: ViolaEnv,
    viola: {
      instanceId: viola.getId(),
      pageData: viola.pageData
    }
  });
})); // error

websocket.onerror(genFncId(function (e) {
  throw new Error(e);
})); // close

websocket.onclose(genFncId(function (e) {
  onWSClose();
}));
websocket.onmessage(genFncId(function (e) {
  var _JSON$parse = JSON.parse(e.data),
      type = _JSON$parse.type,
      data = _JSON$parse.data;

  switch (type) {
    case MSG_TYPE.CLOSE:
      onWSClose();
      break;

    case MSG_TYPE.ERROR:
      pageError(data);
      break;

    case MSG_TYPE.CALL_NATIVE:
      callNatie(data);
  }
}));

function onWSClose() {
  confirm('DEBUG PAGE HAS BEEN STOPPED', function () {
    viola.requireAPI('bridge').invoke({
      ns: 'ui',
      method: 'popBack'
    });
  }, function () {
    alert('cancel');
  });
}

function pageError(e) {
  alert(e);
}

function callNatie(data) {
  if (data[0].method == 'createBody') {
    if (!isCreateBody) {
      isCreateBody = 1;
    } else {
      viola.tasker.sendTask([{
        module: 'dom',
        method: 'removeElement',
        args: [realBodyRef]
      }]);
    }

    realBodyRef = data[0].args.ref; // viola.tasker.sendTask([{
    //   module: 'dom',
    //   method: 'addElement',
    //   args: [
    //     fakeBodyRef,
    //     data[0].args,
    //     0
    //   ]
    // }])

    data[0] = {
      module: 'dom',
      method: 'addElement',
      args: [fakeBodyRef, data[0].args, 0]
    };
  }

  viola.tasker.sendTask(data);
}

viola.document.body.setStyle({
  backgroundColor: 'transparent'
});
viola.document.render();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(2),
    genFncId = _require.genFncId;

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

function alert(text) {
  var b = viola.requireAPI('bridge');
  b.invoke({
    ns: 'ui',
    method: 'showDialog',
    params: {
      title: '提示',
      text: text,
      needOkBtn: true,
      okBtnText: '确定'
    }
  });
}

function confirm(text, succ, cancel) {
  var b = viola.requireAPI('bridge');
  var params = {
    title: '提示',
    text: text,
    needOkBtn: true,
    okBtnText: '确定',
    needCancelBtn: false,
    cancelBtnText: '取消'
  };

  if (cancel) {
    params['needCancelBtn'] = true;
  }

  b.invoke({
    ns: 'ui',
    method: 'showDialog',
    params: params
  }, genFncId(function (result) {
    if (cancel) {
      if (result.data.button == 1) {
        succ();
      } else {
        cancel();
      }
    } else {
      succ();
    }
  }));
}

module.exports = {
  query: query(),
  confirm: confirm,
  alert: alert
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

var PREFIX = '__VIOLA_DEBUG_JSFNC__';
var PREFIX_REG = /^__VIOLA_DEBUG_JSFNC__/;
var cb = {};
viola.on('destroy', function () {
  cb = null;
});
var _id = 1;

function genFncId(fnc) {
  var id = PREFIX + _id++;
  cb[id] = fnc;
  return id;
}

function isDebugJSFncId(fncName) {
  return PREFIX_REG.test(fncName);
}

function actFncById(fncName, data) {
  cb && cb[fncName] && cb[fncName](data);
}

module.exports = {
  genFncId: genFncId,
  isDebugJSFncId: isDebugJSFncId,
  actFncById: actFncById
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {
  ERROR: 'error',
  LOGIN: 'login',
  LOGIN_SUCC: 'loginSucc',
  CALL_JS: 'callJS',
  CALL_NATIVE: 'callNative',
  RELOAD: 'reload',
  CLOSE: 'close'
};

/***/ })
/******/ ]);
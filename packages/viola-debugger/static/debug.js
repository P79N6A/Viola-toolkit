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
    alert = _require.alert,
    tip = _require.tip;

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
    isReloading = 0,
    realBodyRef = -1,
    fakeBodyRef = viola.document.body.ref;
var pendingTask = [];
var wsUrl = query.ws + query.peerId; // throw new Error(wsUrl)

websocket.WebSocket("ws://".concat(wsUrl), '');
websocket.onopen(genFncId(function (e) {
  websocket.isOpen = 1;
  websocket.sendTask('login', {
    ViolaEnv: ViolaEnv,
    viola: {
      instanceId: viola.getId(),
      pageData: viola.pageData
    }
  });
  var task = null;

  while (task = pendingTask.shift()) {
    websocket.sendTask(task.type, task.data);
  }
})); // error

websocket.onerror(genFncId(function (e) {
  if (typeof e === 'string') {
    throw new Error('WEBSOCKECT ERROR: ' + e);
  } else {
    throw new Error(JSON.stringify(e));
  }
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

    case MSG_TYPE.RELOAD:
      pageReload();
      break;

    case MSG_TYPE.CALL_NATIVE:
      callNative(data);
  }
}));

function onWSClose() {
  websocket.isOpen = 0;
  if (isReloading) return;
  confirm('链接已停止', function () {
    viola.requireAPI('bridge').invoke({
      ns: 'ui',
      method: 'popBack'
    });
  });
}

function pageError(e) {
  alert(e);
}

function pageReload(e) {
  if (isCreateBody) {
    isReloading = 1;
    tip('try to reload');
    var reload = viola.requireAPI('navigation').reloadPage;
    reload && reload();
  } else {
    tip('has not createBody');
  }
}

function callNative(data) {
  if (isReloading) return; // let hasRM = 0

  var tasks = Array.isArray(data) ? data : [data];
  var task;

  while (task = tasks.shift()) {
    task.method === MSG_TYPE.METHOD.CREATE_BODY && (isCreateBody = 1);
    viola.tasker.sendTask([task]);
  }
} // Update Instance


viola.on('update', function update(args) {
  if (isReloading) {
    return;
  } else {
    if (websocket.isOpen) {
      websocket.sendTask(MSG_TYPE.UPDATE_INSTANCE, {
        args: args
      });
    } else {
      pendingTask.push({
        type: MSG_TYPE.UPDATE_INSTANCE,
        data: {
          args: args
        }
      });
    }
  }
}); // Destroy Instance

viola.on('destroy', function destroy(args) {
  if (isReloading) return;
  websocket.sendTask(MSG_TYPE.DESTROY_INSTANCE, {
    args: args
  });

  if (websocket.isOpen) {
    websocket.close();
  }
});

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

function tip(text) {
  viola.requireAPI('bridge').invoke({
    ns: 'ui',
    method: 'showTips',
    params: {
      text: text,
      iconMode: 1
    }
  });
}

module.exports = {
  query: query(),
  confirm: confirm,
  alert: alert,
  tip: tip
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
  UPDATE_INSTANCE: 'updateInstance',
  DESTROY_INSTANCE: 'destroyInstance',
  RELOAD: 'reload',
  CLOSE: 'close',
  MODULE: {},
  METHOD: {
    CREATE_BODY: 'createBody',
    ADD_ELEMENT: 'addElement',
    UPDATE_ELEMENT: 'updateElement',
    REMOVE_ELEMENT: 'removeElement',
    FIRE_EVENT: 'fireEvent',
    CALLBACK: 'callback'
  }
};

/***/ })
/******/ ]);
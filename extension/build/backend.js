/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var Agent = __webpack_require__(1);
	var Bridge = __webpack_require__(3);
	var setupHighlighter = __webpack_require__(31);
	var setupRNStyle = __webpack_require__(36);
	var setupRelay = __webpack_require__(37);

	var inject = __webpack_require__(38);

	// TODO: check to see if we're in RN before doing this?
	setInterval(function () {
	  // this is needed to force refresh on react native
	}, 100);

	window.addEventListener('message', welcome);
	function welcome(evt) {
	  if (evt.data.source !== 'react-devtools-content-script') {
	    return;
	  }

	  window.removeEventListener('message', welcome);
	  setup(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
	}

	function setup(hook) {
	  var listeners = [];

	  var wall = {
	    listen: function listen(fn) {
	      var listener = function listener(evt) {
	        if (evt.data.source !== 'react-devtools-content-script' || !evt.data.payload) {
	          return;
	        }
	        fn(evt.data.payload);
	      };
	      listeners.push(listener);
	      window.addEventListener('message', listener);
	    },
	    send: function send(data) {
	      window.postMessage({
	        source: 'react-devtools-bridge',
	        payload: data
	      }, '*');
	    }
	  };

	  var isReactNative = !!hook.resolveRNStyle;

	  var bridge = new Bridge(wall);
	  var agent = new Agent(window, {
	    rnStyle: isReactNative
	  });
	  agent.addBridge(bridge);

	  agent.once('connected', function () {
	    inject(hook, agent);
	  });

	  if (isReactNative) {
	    setupRNStyle(bridge, agent, hook.resolveRNStyle);
	  }

	  setupRelay(bridge, agent, hook);

	  agent.on('shutdown', function () {
	    hook.emit('shutdown');
	    listeners.forEach(function (fn) {
	      window.removeEventListener('message', fn);
	    });
	    listeners = [];
	  });

	  if (!isReactNative) {
	    setupHighlighter(agent);
	  }
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _types = __webpack_require__(2);

	var _Bridge = __webpack_require__(3);

	var _Bridge2 = _interopRequireDefault(_Bridge);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _require = __webpack_require__(28);

	var EventEmitter = _require.EventEmitter;

	var assign = __webpack_require__(29);
	var guid = __webpack_require__(30);

	/**
	 * The agent lives on the page in the same context as React, observes events
	 * from the `backend`, and communicates (via a `Bridge`) with the frontend.
	 *
	 * It is responsible for generating string IDs (ElementID) for each react
	 * element, maintaining a mapping of those IDs to elements, handling messages
	 * from the frontend, and translating between react elements and native
	 * handles.
	 *
	 *
	 *   React
	 *     |
	 *     v
	 *  backend
	 *     |
	 *     v
	 *  -----------
	 * | **Agent** |
	 *  -----------
	 *     ^
	 *     |
	 *     v
	 *  (Bridge)
	 *     ^
	 *     |
	 * serialization
	 *     |
	 *     v
	 *  (Bridge)
	 *     ^
	 *     |
	 *     v
	 *  ----------------
	 * | Frontend Store |
	 *  ----------------
	 *
	 *
	 * Events from the `backend`:
	 * - root (got a root)
	 * - mount (a component mounted)
	 * - update (a component updated)
	 * - unmount (a component mounted)
	 *
	 * Events from the `frontend` Store:
	 * - see `addBridge` for subscriptions
	 *
	 * Events that Agent fires:
	 * - selected
	 * - hideHighlight
	 * - startInspecting
	 * - stopInspecting
	 * - shutdown
	 * - highlight /highlightMany
	 * - setSelection
	 * - root
	 * - mount
	 * - update
	 * - unmount
	 */

	var Agent = (function (_EventEmitter) {
	  _inherits(Agent, _EventEmitter);

	  function Agent(global, capabilities) {
	    _classCallCheck(this, Agent);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Agent).call(this));

	    _this.global = global;
	    _this.reactElements = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap)();
	    _this.ids = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap)();
	    _this.renderers = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap)();
	    _this.elementData = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap)();
	    _this.roots = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeSet)();
	    _this.reactInternals = {};
	    _this.on('selected', function (id) {
	      var data = _this.elementData.get(id);
	      if (data && data.publicInstance) {
	        _this.global.$r = data.publicInstance;
	      }
	    });
	    _this._prevSelected = null;
	    var isReactDOM = window.document && typeof window.document.createElement === 'function';
	    _this.capabilities = assign({
	      scroll: isReactDOM && typeof window.document.body.scrollIntoView === 'function',
	      dom: isReactDOM,
	      editTextContent: false
	    }, capabilities);
	    return _this;
	  }

	  // returns an "unsubscribe" function

	  // the window or global -> used to "make a value available in the console"

	  _createClass(Agent, [{
	    key: 'sub',
	    value: function sub(ev, fn) {
	      var _this2 = this;

	      this.on(ev, fn);
	      return function () {
	        _this2.removeListener(ev, fn);
	      };
	    }
	  }, {
	    key: 'setReactInternals',
	    value: function setReactInternals(renderer, reactInternals) {
	      this.reactInternals[renderer] = reactInternals;
	    }
	  }, {
	    key: 'addBridge',
	    value: function addBridge(bridge) {
	      var _this3 = this;

	      /** Events received from the frontend **/
	      // the initial handshake
	      bridge.on('requestCapabilities', function () {
	        bridge.send('capabilities', _this3.capabilities);
	        _this3.emit('connected');
	      });
	      bridge.on('setState', this._setState.bind(this));
	      bridge.on('setProps', this._setProps.bind(this));
	      bridge.on('setContext', this._setContext.bind(this));
	      bridge.on('makeGlobal', this._makeGlobal.bind(this));
	      bridge.on('highlight', function (id) {
	        return _this3.highlight(id);
	      });
	      bridge.on('highlightMany', function (id) {
	        return _this3.highlightMany(id);
	      });
	      bridge.on('hideHighlight', function () {
	        return _this3.emit('hideHighlight');
	      });
	      bridge.on('startInspecting', function () {
	        return _this3.emit('startInspecting');
	      });
	      bridge.on('stopInspecting', function () {
	        return _this3.emit('stopInspecting');
	      });
	      bridge.on('selected', function (id) {
	        return _this3.emit('selected', id);
	      });
	      bridge.on('shutdown', function () {
	        return _this3.emit('shutdown');
	      });
	      bridge.on('changeTextContent', function (_ref) {
	        var id = _ref.id;
	        var text = _ref.text;

	        var node = _this3.getNodeForID(id);
	        if (!node) {
	          return;
	        }
	        node.textContent = text;
	      });
	      // used to "inspect node in Elements pane"
	      bridge.on('putSelectedNode', function (id) {
	        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$node = _this3.getNodeForID(id);
	      });
	      // used to "view source in Sources pane"
	      bridge.on('putSelectedInstance', function (id) {
	        var node = _this3.elementData.get(id);
	        if (node.publicInstance) {
	          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$inst = node.publicInstance;
	        } else {
	          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$inst = null;
	        }
	      });
	      // used to select the inspected node ($0)
	      bridge.on('checkSelection', function () {
	        var newSelected = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0;
	        if (newSelected !== _this3._prevSelected) {
	          _this3._prevSelected = newSelected;
	          var sentSelected = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$node;
	          if (newSelected !== sentSelected) {
	            _this3.selectFromDOMNode(newSelected, true);
	          }
	        }
	      });
	      bridge.on('scrollToNode', function (id) {
	        return _this3.scrollToNode(id);
	      });

	      /** Events sent to the frontend **/
	      this.on('root', function (id) {
	        return bridge.send('root', id);
	      });
	      this.on('mount', function (data) {
	        return bridge.send('mount', data);
	      });
	      this.on('update', function (data) {
	        return bridge.send('update', data);
	      });
	      this.on('unmount', function (id) {
	        bridge.send('unmount', id);
	        // once an element has been unmounted, the bridge doesn't need to be
	        // able to inspect it anymore.
	        bridge.forget(id);
	      });
	      this.on('setSelection', function (data) {
	        return bridge.send('select', data);
	      });
	    }
	  }, {
	    key: 'scrollToNode',
	    value: function scrollToNode(id) {
	      var node = this.getNodeForID(id);
	      if (!node) {
	        console.warn('unable to get the node for scrolling');
	        return;
	      }
	      if (node.scrollIntoViewIfNeeded) {
	        node.scrollIntoViewIfNeeded();
	      } else {
	        node.scrollIntoView();
	      }
	      this.highlight(id);
	    }
	  }, {
	    key: 'highlight',
	    value: function highlight(id) {
	      var data = this.elementData.get(id);
	      var node = this.getNodeForID(id);
	      if (node) {
	        this.emit('highlight', { node: node, name: data.name, props: data.props });
	      }
	    }
	  }, {
	    key: 'highlightMany',
	    value: function highlightMany(ids) {
	      var _this4 = this;

	      var nodes = [];
	      ids.forEach(function (id) {
	        var node = _this4.getNodeForID(id);
	        if (node) {
	          nodes.push(node);
	        }
	      });
	      if (nodes.length) {
	        this.emit('highlightMany', nodes);
	      }
	    }
	  }, {
	    key: 'getNodeForID',
	    value: function getNodeForID(id) {
	      var component = this.reactElements.get(id);
	      if (!component) {
	        return null;
	      }
	      var renderer = this.renderers.get(id);
	      if (this.reactInternals[renderer].getNativeFromReactElement) {
	        return this.reactInternals[renderer].getNativeFromReactElement(component);
	      }
	    }
	  }, {
	    key: 'selectFromDOMNode',
	    value: function selectFromDOMNode(node, quiet) {
	      var id = this.getIDForNode(node);
	      if (!id) {
	        return;
	      }
	      this.emit('setSelection', { id: id, quiet: quiet });
	    }
	  }, {
	    key: 'selectFromReactInstance',
	    value: function selectFromReactInstance(instance, quiet) {
	      var id = this.getId(instance);
	      if (!id) {
	        console.log('no instance id', instance);
	        return;
	      }
	      this.emit('setSelection', { id: id, quiet: quiet });
	    }
	  }, {
	    key: 'getIDForNode',
	    value: function getIDForNode(node) {
	      if (!this.reactInternals) {
	        return null;
	      }
	      var component;
	      for (var renderer in this.reactInternals) {
	        // If a renderer doesn't know about a reactId, it will throw an error.
	        try {
	          // $FlowFixMe possibly null - it's not null
	          component = this.reactInternals[renderer].getReactElementFromNative(node);
	        } catch (e) {}
	        if (component) {
	          return this.getId(component);
	        }
	      }
	    }
	  }, {
	    key: '_setProps',
	    value: function _setProps(_ref2) {
	      var id = _ref2.id;
	      var path = _ref2.path;
	      var value = _ref2.value;

	      var data = this.elementData.get(id);
	      if (data.updater && data.updater.setInProps) {
	        data.updater.setInProps(path, value);
	      } else {
	        console.warn("trying to set props on a component that doesn't support it");
	      }
	    }
	  }, {
	    key: '_setState',
	    value: function _setState(_ref3) {
	      var id = _ref3.id;
	      var path = _ref3.path;
	      var value = _ref3.value;

	      var data = this.elementData.get(id);
	      if (data.updater && data.updater.setInState) {
	        data.updater.setInState(path, value);
	      } else {
	        console.warn("trying to set state on a component that doesn't support it");
	      }
	    }
	  }, {
	    key: '_setContext',
	    value: function _setContext(_ref4) {
	      var id = _ref4.id;
	      var path = _ref4.path;
	      var value = _ref4.value;

	      var data = this.elementData.get(id);
	      if (data.updater && data.updater.setInContext) {
	        data.updater.setInContext(path, value);
	      } else {
	        console.warn("trying to set state on a component that doesn't support it");
	      }
	    }
	  }, {
	    key: '_makeGlobal',
	    value: function _makeGlobal(_ref5) {
	      var id = _ref5.id;
	      var path = _ref5.path;

	      var data = this.elementData.get(id);
	      var value;
	      if (path === 'instance') {
	        value = data.publicInstance;
	      } else {
	        value = getIn(data, path);
	      }
	      this.global.$tmp = value;
	      console.log('$tmp =', value);
	    }
	  }, {
	    key: 'getId',
	    value: function getId(element) {
	      if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) !== 'object') {
	        return element;
	      }
	      if (!this.ids.has(element)) {
	        this.ids.set(element, guid());
	        this.reactElements.set(this.ids.get(element), element);
	      }
	      return this.ids.get(element);
	    }
	  }, {
	    key: 'addRoot',
	    value: function addRoot(renderer, element) {
	      var id = this.getId(element);
	      this.roots.add(id);
	      this.emit('root', id);
	    }
	  }, {
	    key: 'onMounted',
	    value: function onMounted(renderer, component, data) {
	      var _this5 = this;

	      var id = this.getId(component);
	      this.renderers.set(id, renderer);
	      this.elementData.set(id, data);

	      var send = assign({}, data);
	      if (send.children && send.children.map) {
	        send.children = send.children.map(function (c) {
	          return _this5.getId(c);
	        });
	      }
	      send.id = id;
	      send.canUpdate = send.updater && !!send.updater.forceUpdate;
	      delete send.type;
	      delete send.updater;
	      this.emit('mount', send);
	    }
	  }, {
	    key: 'onUpdated',
	    value: function onUpdated(component, data) {
	      var _this6 = this;

	      var id = this.getId(component);
	      this.elementData.set(id, data);

	      var send = assign({}, data);
	      if (send.children && send.children.map) {
	        send.children = send.children.map(function (c) {
	          return _this6.getId(c);
	        });
	      }
	      send.id = id;
	      send.canUpdate = send.updater && !!send.updater.forceUpdate;
	      delete send.type;
	      delete send.updater;
	      this.emit('update', send);
	    }
	  }, {
	    key: 'onUnmounted',
	    value: function onUnmounted(component) {
	      var id = this.getId(component);
	      this.elementData.delete(id);
	      this.roots.delete(id);
	      this.renderers.delete(id);
	      this.emit('unmount', id);
	      this.ids.delete(component);
	    }
	  }]);

	  return Agent;
	})(EventEmitter);

	function getIn(base, path) {
	  return path.reduce(function (obj, attr) {
	    return obj ? obj[attr] : null;
	  }, base);
	}

	module.exports = Agent;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var consts = __webpack_require__(4);
	var hydrate = __webpack_require__(23);
	var dehydrate = __webpack_require__(24);
	var performanceNow = __webpack_require__(25);

	/**
	 * The bridge is responsible for serializing requests between the Agent and
	 * the Frontend Store. It needs to be connected to a Wall object that can send
	 * JSONable data to the bridge on the other side.
	 *
	 * complex data
	 *     |
	 *     v
	 *  [Bridge]
	 *     |
	 * jsonable data
	 *     |
	 *     v
	 *   [wall]
	 *     |
	 *     v
	 * ~ some barrier ~
	 *     |
	 *     v
	 *   [wall]
	 *     |
	 *     v
	 *  [Bridge]
	 *     |
	 *     v
	 * "hydrated" data
	 *
	 * When an item is passed in that can't be serialized (anything other than a
	 * plain array, object, or literal value), the object is "cleaned", and
	 * rehydrated on the other side with `Symbol` attributes indicating that the
	 * object needs to be inspected for more detail.
	 *
	 * Example:
	 *
	 * bridge.send('evname', {id: 'someid', foo: MyCoolObjectInstance})
	 * ->
	 * shows up, hydrated as
	 * {
	 *   id: 'someid',
	 *   foo: {
	 *     [consts.name]: 'MyCoolObjectInstance',
	 *     [consts.type]: 'object',
	 *     [consts.meta]: {},
	 *     [consts.inspected]: false,
	 *   }
	 * }
	 *
	 * The `consts` variables are Symbols, and as such are non-ennumerable.
	 * The front-end therefore needs to check for `consts.inspected` on received
	 * objects, and can thereby display object proxies and inspect them.
	 *
	 * Complex objects that are passed are expected to have a top-level `id`
	 * attribute, which is used for later lookup + inspection. Once it has been
	 * determined that an object is no longer needed, call `.forget(id)` to clean
	 * up.
	 */

	var Bridge = (function () {
	  function Bridge(wall) {
	    _classCallCheck(this, Bridge);

	    this._cbs = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap)();
	    this._inspectables = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap)();
	    this._cid = 0;
	    this._listeners = {};
	    this._buffer = [];
	    this._waiting = null;
	    this._lastTime = 5;
	    this._callers = {};
	    this._paused = false;
	    this._wall = wall;

	    wall.listen(this._handleMessage.bind(this));
	  }

	  _createClass(Bridge, [{
	    key: 'inspect',
	    value: function inspect(id, path, cb) {
	      var _cid = this._cid++;
	      this._cbs.set(_cid, function (data, cleaned, proto, protoclean) {
	        if (cleaned.length) {
	          hydrate(data, cleaned);
	        }
	        if (proto && protoclean.length) {
	          hydrate(proto, protoclean);
	        }
	        if (proto) {
	          data[consts.proto] = proto;
	        }
	        cb(data);
	      });

	      this._wall.send({
	        type: 'inspect',
	        callback: _cid,
	        path: path,
	        id: id
	      });
	    }
	  }, {
	    key: 'call',
	    value: function call(name, args, cb) {
	      var _cid = this._cid++;
	      this._cbs.set(_cid, cb);

	      this._wall.send({
	        type: 'call',
	        callback: _cid,
	        args: args,
	        name: name
	      });
	    }
	  }, {
	    key: 'onCall',
	    value: function onCall(name, handler) {
	      if (this._callers[name]) {
	        throw new Error('only one call handler per call name allowed');
	      }
	      this._callers[name] = handler;
	    }
	  }, {
	    key: 'pause',
	    value: function pause() {
	      this._wall.send({
	        type: 'pause'
	      });
	    }
	  }, {
	    key: 'resume',
	    value: function resume() {
	      this._wall.send({
	        type: 'resume'
	      });
	    }
	  }, {
	    key: 'setInspectable',
	    value: function setInspectable(id, data) {
	      var prev = this._inspectables.get(id);
	      if (!prev) {
	        this._inspectables.set(id, data);
	        return;
	      }
	      this._inspectables.set(id, _extends({}, prev, data));
	    }
	  }, {
	    key: 'sendOne',
	    value: function sendOne(evt, data) {
	      var cleaned = [];
	      var san = dehydrate(data, cleaned);
	      if (cleaned.length) {
	        this.setInspectable(data.id, data);
	      }
	      this._wall.send({ type: 'event', evt: evt, data: san, cleaned: cleaned });
	    }
	  }, {
	    key: 'send',
	    value: function send(evt, data) {
	      var _this = this;

	      if (!this._waiting && !this._paused) {
	        this._buffer = [];
	        var nextTime = this._lastTime * 3;
	        if (nextTime > 500) {
	          // flush is taking an unexpected amount of time
	          nextTime = 500;
	        }
	        this._waiting = setTimeout(function () {
	          _this.flush();
	          _this._waiting = null;
	        }, nextTime);
	      }
	      this._buffer.push({ evt: evt, data: data });
	    }
	  }, {
	    key: 'flush',
	    value: function flush() {
	      var _this2 = this;

	      var start = performanceNow();
	      var events = this._buffer.map(function (_ref) {
	        var evt = _ref.evt;
	        var data = _ref.data;

	        var cleaned = [];
	        var san = dehydrate(data, cleaned);
	        if (cleaned.length) {
	          _this2.setInspectable(data.id, data);
	        }
	        return { type: 'event', evt: evt, data: san, cleaned: cleaned };
	      });
	      this._wall.send({ type: 'many-events', events: events });
	      this._buffer = [];
	      this._waiting = null;
	      this._lastTime = performanceNow() - start;
	    }
	  }, {
	    key: 'forget',
	    value: function forget(id) {
	      this._inspectables.delete(id);
	    }
	  }, {
	    key: 'on',
	    value: function on(evt, fn) {
	      if (!this._listeners[evt]) {
	        this._listeners[evt] = [fn];
	      } else {
	        this._listeners[evt].push(fn);
	      }
	    }
	  }, {
	    key: 'off',
	    value: function off(evt, fn) {
	      if (!this._listeners[evt]) {
	        return;
	      }
	      var ix = this._listeners[evt].indexOf(fn);
	      if (ix !== -1) {
	        this._listeners[evt].splice(ix, 1);
	      }
	    }
	  }, {
	    key: 'once',
	    value: function once(evt, fn) {
	      var self = this;
	      var listener = function listener() {
	        fn.apply(this, arguments);
	        self.off(evt, listener);
	      };
	      this.on(evt, listener);
	    }
	  }, {
	    key: '_handleMessage',
	    value: function _handleMessage(payload) {
	      var _this3 = this;

	      if (payload.type === 'resume') {
	        this._paused = false;
	        this._waiting = null;
	        this.flush();
	        return;
	      }

	      if (payload.type === 'pause') {
	        this._paused = true;
	        clearTimeout(this._waiting);
	        this._waiting = null;
	        return;
	      }

	      if (payload.type === 'callback') {
	        this._cbs.get(payload.id).apply(undefined, _toConsumableArray(payload.args));
	        this._cbs.delete(payload.id);
	        return;
	      }

	      if (payload.type === 'call') {
	        this._handleCall(payload.name, payload.args, payload.callback);
	        return;
	      }

	      if (payload.type === 'inspect') {
	        this._inspectResponse(payload.id, payload.path, payload.callback);
	        return;
	      }

	      if (payload.type === 'event') {
	        // console.log('[bridge<-]', payload.evt);
	        if (payload.cleaned) {
	          hydrate(payload.data, payload.cleaned);
	        }
	        var fns = this._listeners[payload.evt];
	        var data = payload.data;
	        if (fns) {
	          fns.forEach(function (fn) {
	            return fn(data);
	          });
	        }
	      }

	      if (payload.type === 'many-events') {
	        payload.events.forEach(function (event) {
	          // console.log('[bridge<-]', payload.evt);
	          if (event.cleaned) {
	            hydrate(event.data, event.cleaned);
	          }
	          var handlers = _this3._listeners[event.evt];
	          if (handlers) {
	            handlers.forEach(function (fn) {
	              return fn(event.data);
	            });
	          }
	        });
	      }
	    }
	  }, {
	    key: '_handleCall',
	    value: function _handleCall(name, args, callback) {
	      if (!this._callers[name]) {
	        return console.warn('unknown call');
	      }
	      args = !Array.isArray(args) ? [args] : args;
	      var result;
	      try {
	        result = this._callers[name].apply(null, args);
	      } catch (e) {
	        console.error('Failed to call', e);
	        return undefined;
	      }
	      this._wall.send({
	        type: 'callback',
	        id: callback,
	        args: [result]
	      });
	    }
	  }, {
	    key: '_inspectResponse',
	    value: function _inspectResponse(id, path, callback) {
	      var val = getIn(this._inspectables.get(id), path);
	      var result = {};
	      var cleaned = [];
	      var proto = null;
	      var protoclean = [];
	      if (val) {
	        var protod = false;
	        var isFn = typeof val === 'function';
	        Object.getOwnPropertyNames(val).forEach(function (name) {
	          if (name === '__proto__') {
	            protod = true;
	          }
	          if (isFn && (name === 'arguments' || name === 'callee' || name === 'caller')) {
	            return;
	          }
	          result[name] = dehydrate(val[name], cleaned, [name]);
	        });

	        /* eslint-disable no-proto */
	        if (!protod && val.__proto__ && val.constructor.name !== 'Object') {
	          var newProto = {};
	          var pIsFn = typeof val.__proto__ === 'function';
	          Object.getOwnPropertyNames(val.__proto__).forEach(function (name) {
	            if (pIsFn && (name === 'arguments' || name === 'callee' || name === 'caller')) {
	              return;
	            }
	            newProto[name] = dehydrate(val.__proto__[name], protoclean, [name]);
	          });
	          proto = newProto;
	        }
	        /* eslint-enable no-proto */
	      }

	      this._wall.send({
	        type: 'callback',
	        id: callback,
	        args: [result, cleaned, proto, protoclean]
	      });
	    }
	  }]);

	  return Bridge;
	})();

	function getIn(base, path) {
	  return path.reduce(function (obj, attr) {
	    return obj ? obj[attr] : null;
	  }, base);
	}

	module.exports = Bridge;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var Symbol = __webpack_require__(5);

	module.exports = {
	  name: Symbol('name'),
	  type: Symbol('type'),
	  inspected: Symbol('inspected'),
	  meta: Symbol('meta'),
	  proto: Symbol('proto')
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(6)() ? Symbol : __webpack_require__(7);


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }
		if (typeof Symbol.iterator === 'symbol') return true;

		// Return 'true' for polyfills
		if (typeof Symbol.isConcatSpreadable !== 'object') return false;
		if (typeof Symbol.iterator !== 'object') return false;
		if (typeof Symbol.toPrimitive !== 'object') return false;
		if (typeof Symbol.toStringTag !== 'object') return false;
		if (typeof Symbol.unscopables !== 'object') return false;

		return true;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d              = __webpack_require__(8)
	  , validateSymbol = __webpack_require__(21)

	  , create = (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate), defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , Symbol, HiddenSymbol, globalSymbols = create(null);

	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				defineProperty(this, name, d(value));
			}));
			return name;
		};
	}());

	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return Symbol(description);
	};
	module.exports = Symbol = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(Symbol, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = Symbol(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),
		hasInstance: d('', Symbol('hasInstance')),
		isConcatSpreadable: d('', Symbol('isConcatSpreadable')),
		iterator: d('', Symbol('iterator')),
		match: d('', Symbol('match')),
		replace: d('', Symbol('replace')),
		search: d('', Symbol('search')),
		species: d('', Symbol('species')),
		split: d('', Symbol('split')),
		toPrimitive: d('', Symbol('toPrimitive')),
		toStringTag: d('', Symbol('toStringTag')),
		unscopables: d('', Symbol('unscopables'))
	});
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(Symbol),
		toString: d('', function () { return this.__name__; })
	});

	defineProperties(Symbol.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(Symbol.prototype, Symbol.toPrimitive, d('',
		function () { return validateSymbol(this); }));
	defineProperty(Symbol.prototype, Symbol.toStringTag, d('c', 'Symbol'));

	defineProperty(HiddenSymbol.prototype, Symbol.toPrimitive,
		d('c', Symbol.prototype[Symbol.toPrimitive]));
	defineProperty(HiddenSymbol.prototype, Symbol.toStringTag,
		d('c', Symbol.prototype[Symbol.toStringTag]));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(9)
	  , normalizeOpts = __webpack_require__(16)
	  , isCallable    = __webpack_require__(17)
	  , contains      = __webpack_require__(18)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(10)()
		? Object.assign
		: __webpack_require__(11);


/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(12)
	  , value = __webpack_require__(15)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(13)()
		? Object.keys
		: __webpack_require__(14);


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var forEach = Array.prototype.forEach, create = (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate);

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(19)()
		? String.prototype.contains
		: __webpack_require__(20);


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(22);

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};


/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (x) {
		return (x && ((typeof x === 'symbol') || (x['@@toStringTag'] === 'Symbol'))) || false;
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var consts = __webpack_require__(4);

	function hydrate(data, cleaned) {
	  cleaned.forEach(function (path) {
	    var last = path.pop();
	    var obj = path.reduce(function (obj_, attr) {
	      return obj_ ? obj_[attr] : null;
	    }, data);
	    if (!obj || !obj[last]) {
	      return;
	    }
	    var replace = {};
	    replace[consts.name] = obj[last].name;
	    replace[consts.type] = obj[last].type;
	    replace[consts.meta] = obj[last].meta;
	    replace[consts.inspected] = false;
	    obj[last] = replace;
	  });
	}

	module.exports = hydrate;

/***/ },
/* 24 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	/**
	 * Strip out complex data (instances, functions, and data nested > 2 levels
	 * deep). The paths of the stripped out objects are appended to the `cleaned`
	 * list. On the other side of the barrier, the cleaned list is used to
	 * "re-hydrate" the cleaned representation into an object with symbols as
	 * attributes, so that a sanitized object can be distinguished from a normal
	 * object.
	 *
	 * Input: {"some": {"attr": fn()}, "other": AnInstance}
	 * Output: {
	 *   "some": {
	 *     "attr": {"name": the fn.name, type: "function"}
	 *   },
	 *   "other": {
	 *     "name": "AnInstance",
	 *     "type": "object",
	 *   },
	 * }
	 * and cleaned = [["some", "attr"], ["other"]]
	 */

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function dehydrate(data, cleaned, path, level) {
	  level = level || 0;
	  path = path || [];
	  if (typeof data === 'function') {
	    cleaned.push(path);
	    return {
	      name: data.name,
	      type: 'function'
	    };
	  }
	  if (!data || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
	    if (typeof data === 'string' && data.length > 500) {
	      return data.slice(0, 500) + '...';
	    }
	    // We have to do this assignment b/c Flow doesn't think "symbol" is
	    // something typeof would return. Error 'unexpected predicate "symbol"'
	    var type = typeof data === 'undefined' ? 'undefined' : _typeof(data);
	    if (type === 'symbol') {
	      cleaned.push(path);
	      return {
	        type: 'symbol',
	        name: data.toString()
	      };
	    }
	    return data;
	  }
	  if (data._reactFragment) {
	    // React Fragments error if you try to inspect them.
	    return 'A react fragment';
	  }
	  if (level > 2) {
	    cleaned.push(path);
	    return {
	      type: Array.isArray(data) ? 'array' : 'object',
	      name: !data.constructor || data.constructor.name === 'Object' ? '' : data.constructor.name,
	      meta: Array.isArray(data) ? {
	        length: data.length
	      } : null
	    };
	  }
	  if (Array.isArray(data)) {
	    // $FlowFixMe path is not undefined.
	    return data.map(function (item, i) {
	      return dehydrate(item, cleaned, path.concat([i]), level + 1);
	    });
	  }
	  // TODO when this is in the iframe window, we can just use Object
	  if (data.constructor && typeof data.constructor === 'function' && data.constructor.name !== 'Object') {
	    cleaned.push(path);
	    return {
	      name: data.constructor.name,
	      type: 'object'
	    };
	  }
	  var res = {};
	  for (var name in data) {
	    res[name] = dehydrate(data[name], cleaned, path.concat([name]), level + 1);
	  }
	  return res;
	}

	module.exports = dehydrate;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule performanceNow
	 * @typechecks
	 */

	'use strict';

	var performance = __webpack_require__(26);

	var performanceNow;

	/**
	 * Detect if we can use `window.performance.now()` and gracefully fallback to
	 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
	 * because of Facebook's testing infrastructure.
	 */
	if (performance.now) {
	  performanceNow = function () {
	    return performance.now();
	  };
	} else {
	  performanceNow = function () {
	    return Date.now();
	  };
	}

	module.exports = performanceNow;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule performance
	 * @typechecks
	 */

	'use strict';

	var ExecutionEnvironment = __webpack_require__(27);

	var performance;

	if (ExecutionEnvironment.canUseDOM) {
	  performance = window.performance || window.msPerformance || window.webkitPerformance;
	}

	module.exports = performance || {};

/***/ },
/* 27 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ExecutionEnvironment
	 */

	'use strict';

	var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

	/**
	 * Simple, lightweight module assisting with the detection and context of
	 * Worker. Helps avoid circular dependencies and allows code to reason about
	 * whether or not they are in a Worker, even if they never include the main
	 * `ReactWorker` dependency.
	 */
	var ExecutionEnvironment = {

	  canUseDOM: canUseDOM,

	  canUseWorkers: typeof Worker !== 'undefined',

	  canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

	  canUseViewport: canUseDOM && !!window.screen,

	  isInWorker: !canUseDOM // For now, this is true - might change in the future.

	};

	module.exports = ExecutionEnvironment;

/***/ },
/* 28 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function ownEnumerableKeys(obj) {
		var keys = Object.getOwnPropertyNames(obj);

		if (Object.getOwnPropertySymbols) {
			keys = keys.concat(Object.getOwnPropertySymbols(obj));
		}

		return keys.filter(function (key) {
			return propIsEnumerable.call(obj, key);
		});
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = ownEnumerableKeys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 30 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	function guid() {
	  return 'g' + Math.random().toString(16).substr(2);
	}

	module.exports = guid;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _Agent = __webpack_require__(1);

	var _Agent2 = _interopRequireDefault(_Agent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Highlighter = __webpack_require__(32);

	module.exports = function setup(agent) {
	  var hl = new Highlighter(window, function (node) {
	    agent.selectFromDOMNode(node);
	  });
	  agent.on('highlight', function (data) {
	    return hl.highlight(data.node, data.name);
	  });
	  agent.on('highlightMany', function (nodes) {
	    return hl.highlightMany(nodes);
	  });
	  agent.on('hideHighlight', function () {
	    return hl.hideHighlight();
	  });
	  agent.on('startInspecting', function () {
	    return hl.startInspecting();
	  });
	  agent.on('stopInspecting', function () {
	    return hl.stopInspecting();
	  });
	  agent.on('shutdown', function () {
	    hl.remove();
	  });
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _types = __webpack_require__(33);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Overlay = __webpack_require__(34);
	var MultiOverlay = __webpack_require__(35);

	/**
	 * Manages the highlighting of items on an html page, as well as
	 * hover-to-inspect.
	 */

	var Highlighter = (function () {
	  function Highlighter(win, onSelect) {
	    _classCallCheck(this, Highlighter);

	    this._win = win;
	    this._onSelect = onSelect;
	    this._overlay = null;
	    this._multiOverlay = null;
	    this._subs = [];
	  }

	  _createClass(Highlighter, [{
	    key: 'startInspecting',
	    value: function startInspecting() {
	      this._inspecting = true;
	      this._subs = [captureSubscription(this._win, 'mouseover', this.onHover.bind(this)), captureSubscription(this._win, 'mousedown', this.onMouseDown.bind(this)), captureSubscription(this._win, 'click', this.onClick.bind(this))];
	    }
	  }, {
	    key: 'stopInspecting',
	    value: function stopInspecting() {
	      this._subs.forEach(function (unsub) {
	        return unsub();
	      });
	      this.hideHighlight();
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      this.stopInspecting();
	      if (this._button && this._button.parentNode) {
	        this._button.parentNode.removeChild(this._button);
	      }
	    }
	  }, {
	    key: 'highlight',
	    value: function highlight(node, name) {
	      this.removeMultiOverlay();
	      if (!this._overlay) {
	        this._overlay = new Overlay(this._win);
	      }
	      // $FlowFixMe this._overlay is clearly not null at this point
	      this._overlay.inspect(node, name);
	    }
	  }, {
	    key: 'highlightMany',
	    value: function highlightMany(nodes) {
	      this.removeOverlay();
	      if (!this._multiOverlay) {
	        this._multiOverlay = new MultiOverlay(this._win);
	      }
	      // $FlowFixMe this._multiOverlay is clearly not null at this point
	      this._multiOverlay.highlightMany(nodes);
	    }
	  }, {
	    key: 'hideHighlight',
	    value: function hideHighlight() {
	      this._inspecting = false;
	      this.removeOverlay();
	      this.removeMultiOverlay();
	    }
	  }, {
	    key: 'removeOverlay',
	    value: function removeOverlay() {
	      if (!this._overlay) {
	        return;
	      }
	      this._overlay.remove();
	      this._overlay = null;
	    }
	  }, {
	    key: 'removeMultiOverlay',
	    value: function removeMultiOverlay() {
	      if (!this._multiOverlay) {
	        return;
	      }
	      this._multiOverlay.remove();
	      this._multiOverlay = null;
	    }
	  }, {
	    key: 'onMouseDown',
	    value: function onMouseDown(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this._onSelect(evt.target);
	      return;
	    }
	  }, {
	    key: 'onClick',
	    value: function onClick(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      this._subs.forEach(function (unsub) {
	        return unsub();
	      });
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this.hideHighlight();
	    }
	  }, {
	    key: 'onHover',
	    value: function onHover(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this.highlight(evt.target);
	    }
	  }, {
	    key: 'injectButton',
	    value: function injectButton() {
	      this._button = makeMagnifier();
	      this._button.onclick = this.startInspecting.bind(this);
	      this._win.document.body.appendChild(this._button);
	    }
	  }]);

	  return Highlighter;
	})();

	function captureSubscription(obj, evt, cb) {
	  obj.addEventListener(evt, cb, true);
	  return function () {
	    return obj.removeEventListener(evt, cb, true);
	  };
	}

	function makeMagnifier() {
	  var button = window.document.createElement('button');
	  button.innerHTML = '&#128269;';
	  button.style.backgroundColor = 'transparent';
	  button.style.border = 'none';
	  button.style.outline = 'none';
	  button.style.cursor = 'pointer';
	  button.style.position = 'fixed';
	  button.style.bottom = '10px';
	  button.style.right = '10px';
	  button.style.fontSize = '30px';
	  button.style.zIndex = 10000000;
	  return button;
	}

	module.exports = Highlighter;

/***/ },
/* 33 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _types = __webpack_require__(33);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var assign = __webpack_require__(29);

	var Overlay = (function () {
	  function Overlay(window) {
	    _classCallCheck(this, Overlay);

	    var doc = window.document;
	    this.win = window;
	    this.container = doc.createElement('div');
	    this.node = doc.createElement('div');
	    this.border = doc.createElement('div');
	    this.padding = doc.createElement('div');
	    this.content = doc.createElement('div');

	    this.border.style.borderColor = overlayStyles.border;
	    this.padding.style.borderColor = overlayStyles.padding;
	    this.content.style.backgroundColor = overlayStyles.background;

	    assign(this.node.style, {
	      borderColor: overlayStyles.margin,
	      pointerEvents: 'none',
	      position: 'fixed'
	    });

	    this.tip = doc.createElement('div');
	    assign(this.tip.style, {
	      border: '1px solid #aaa',
	      backgroundColor: 'rgb(255, 255, 178)',
	      fontFamily: 'sans-serif',
	      color: 'orange',
	      padding: '3px 5px',
	      position: 'fixed',
	      fontSize: '10px'
	    });

	    this.nameSpan = doc.createElement('span');
	    this.tip.appendChild(this.nameSpan);
	    assign(this.nameSpan.style, {
	      color: 'rgb(136, 18, 128)',
	      marginRight: '5px'
	    });
	    this.dimSpan = doc.createElement('span');
	    this.tip.appendChild(this.dimSpan);
	    assign(this.dimSpan.style, {
	      color: '#888'
	    });

	    this.container.style.zIndex = 10000000;
	    this.node.style.zIndex = 10000000;
	    this.tip.style.zIndex = 10000000;
	    this.container.appendChild(this.node);
	    this.container.appendChild(this.tip);
	    this.node.appendChild(this.border);
	    this.border.appendChild(this.padding);
	    this.padding.appendChild(this.content);
	    doc.body.appendChild(this.container);
	  }

	  _createClass(Overlay, [{
	    key: 'remove',
	    value: function remove() {
	      if (this.container.parentNode) {
	        this.container.parentNode.removeChild(this.container);
	      }
	    }
	  }, {
	    key: 'inspect',
	    value: function inspect(node, name) {
	      var box = node.getBoundingClientRect();
	      var dims = getElementDimensions(node);

	      boxWrap(dims, 'margin', this.node);
	      boxWrap(dims, 'border', this.border);
	      boxWrap(dims, 'padding', this.padding);

	      assign(this.content.style, {
	        height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + 'px',
	        width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + 'px'
	      });

	      assign(this.node.style, {
	        top: box.top - dims.marginTop + 'px',
	        left: box.left - dims.marginLeft + 'px'
	      });

	      this.nameSpan.textContent = name || node.nodeName.toLowerCase();
	      this.dimSpan.textContent = box.width + 'px × ' + box.height + 'px';

	      var tipPos = findTipPos({
	        top: box.top - dims.marginTop,
	        left: box.left - dims.marginLeft,
	        height: box.height + dims.marginTop + dims.marginBottom,
	        width: box.width + dims.marginLeft + dims.marginRight
	      }, this.win);
	      assign(this.tip.style, tipPos);
	    }
	  }]);

	  return Overlay;
	})();

	function findTipPos(dims, win) {
	  var tipHeight = 20;
	  var margin = 5;
	  var top;
	  if (dims.top + dims.height + tipHeight <= win.innerHeight) {
	    if (dims.top + dims.height < 0) {
	      top = margin;
	    } else {
	      top = dims.top + dims.height + margin;
	    }
	  } else if (dims.top - tipHeight <= win.innerHeight) {
	    if (dims.top - tipHeight - margin < margin) {
	      top = margin;
	    } else {
	      top = dims.top - tipHeight - margin;
	    }
	  } else {
	    top = win.innerHeight - tipHeight - margin;
	  }

	  top += 'px';

	  if (dims.left < 0) {
	    return { top: top, left: margin };
	  }
	  if (dims.left + 200 > win.innerWidth) {
	    return { top: top, right: margin };
	  }
	  return { top: top, left: dims.left + margin + 'px' };
	}

	function getElementDimensions(element) {
	  var calculatedStyle = window.getComputedStyle(element);

	  return {
	    borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
	    borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
	    borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
	    borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
	    marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
	    marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
	    marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
	    marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
	    paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
	    paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
	    paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
	    paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
	  };
	}

	function boxWrap(dims, what, node) {
	  assign(node.style, {
	    borderTopWidth: dims[what + 'Top'] + 'px',
	    borderLeftWidth: dims[what + 'Left'] + 'px',
	    borderRightWidth: dims[what + 'Right'] + 'px',
	    borderBottomWidth: dims[what + 'Bottom'] + 'px',
	    borderStyle: 'solid'
	  });
	}

	var overlayStyles = {
	  background: 'rgba(120, 170, 210, 0.7)',
	  padding: 'rgba(77, 200, 0, 0.3)',
	  margin: 'rgba(255, 155, 0, 0.3)',
	  border: 'rgba(255, 200, 50, 0.3)'
	};

	module.exports = Overlay;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _types = __webpack_require__(33);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var assign = __webpack_require__(29);

	var MultiOverlay = (function () {
	  function MultiOverlay(window) {
	    _classCallCheck(this, MultiOverlay);

	    this.win = window;
	    var doc = window.document;
	    this.container = doc.createElement('div');
	    doc.body.appendChild(this.container);
	  }

	  _createClass(MultiOverlay, [{
	    key: 'highlightMany',
	    value: function highlightMany(nodes) {
	      var _this = this;

	      this.container.innerHTML = '';
	      nodes.forEach(function (node) {
	        var div = _this.win.document.createElement('div');
	        var box = node.getBoundingClientRect();
	        assign(div.style, {
	          top: box.top + 'px',
	          left: box.left + 'px',
	          width: box.width + 'px',
	          height: box.height + 'px',
	          border: '2px dotted rgba(200, 100, 100, .8)',
	          boxSizing: 'border-box',
	          backgroundColor: 'rgba(200, 100, 100, .2)',
	          position: 'fixed',
	          zIndex: 10000000,
	          pointerEvents: 'none'
	        });
	        _this.container.appendChild(div);
	      });
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      if (this.container.parentNode) {
	        this.container.parentNode.removeChild(this.container);
	      }
	    }
	  }]);

	  return MultiOverlay;
	})();

	module.exports = MultiOverlay;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _Bridge = __webpack_require__(3);

	var _Bridge2 = _interopRequireDefault(_Bridge);

	var _Agent = __webpack_require__(1);

	var _Agent2 = _interopRequireDefault(_Agent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	module.exports = function setupRNStyle(bridge, agent, resolveRNStyle) {
	  bridge.onCall('rn-style:get', function (id) {
	    var node = agent.elementData.get(id);
	    if (!node || !node.props) {
	      return null;
	    }
	    return resolveRNStyle(node.props.style);
	  });

	  bridge.on('rn-style:rename', function (_ref) {
	    var id = _ref.id;
	    var oldName = _ref.oldName;
	    var newName = _ref.newName;
	    var val = _ref.val;

	    renameStyle(agent, id, oldName, newName, val);
	  });

	  bridge.on('rn-style:set', function (_ref2) {
	    var id = _ref2.id;
	    var attr = _ref2.attr;
	    var val = _ref2.val;

	    setStyle(agent, id, attr, val);
	  });
	};

	function shallowClone(obj) {
	  var nobj = {};
	  for (var n in obj) {
	    nobj[n] = obj[n];
	  }
	  return nobj;
	}

	function renameStyle(agent, id, oldName, newName, val) {
	  var data = agent.elementData.get(id);
	  // $FlowFixMe "computed property keys not supported"
	  var newStyle = _defineProperty({}, newName, val);
	  if (!data.updater || !data.updater.setInProps) {
	    var el = agent.reactElements.get(id);
	    if (el.setNativeProps) {
	      el.setNativeProps(newStyle);
	    } else {
	      console.error('Unable to set style for this element... (no forceUpdate or setNativeProps)');
	    }
	    return;
	  }
	  var style = data.props && data.props.style;
	  var customStyle;
	  if (Array.isArray(style)) {
	    if (_typeof(style[style.length - 1]) === 'object' && !Array.isArray(style[style.length - 1])) {
	      customStyle = shallowClone(style[style.length - 1]);
	      delete customStyle[oldName];
	      customStyle[newName] = val;
	      // $FlowFixMe we know that updater is not null here
	      data.updater.setInProps(['style', style.length - 1], customStyle);
	    } else {
	      style = style.concat([newStyle]);
	      // $FlowFixMe we know that updater is not null here
	      data.updater.setInProps(['style'], style);
	    }
	  } else {
	    if ((typeof style === 'undefined' ? 'undefined' : _typeof(style)) === 'object') {
	      customStyle = shallowClone(style);
	      delete customStyle[oldName];
	      customStyle[newName] = val;
	      // $FlowFixMe we know that updater is not null here
	      data.updater.setInProps(['style'], customStyle);
	    } else {
	      style = [style, newStyle];
	      data.updater.setInProps(['style'], style);
	    }
	  }
	  agent.emit('hideHighlight');
	}

	function setStyle(agent, id, attr, val) {
	  var data = agent.elementData.get(id);
	  // $FlowFixMe "computed property keys not supported"
	  var newStyle = _defineProperty({}, attr, val);
	  if (!data.updater || !data.updater.setInProps) {
	    var el = agent.reactElements.get(id);
	    if (el.setNativeProps) {
	      el.setNativeProps(newStyle);
	    } else {
	      console.error('Unable to set style for this element... (no forceUpdate or setNativeProps)');
	    }
	    return;
	  }
	  var style = data.props && data.props.style;
	  if (Array.isArray(style)) {
	    if (_typeof(style[style.length - 1]) === 'object' && !Array.isArray(style[style.length - 1])) {
	      // $FlowFixMe we know that updater is not null here
	      data.updater.setInProps(['style', style.length - 1, attr], val);
	    } else {
	      style = style.concat([newStyle]);
	      // $FlowFixMe we know that updater is not null here
	      data.updater.setInProps(['style'], style);
	    }
	  } else {
	    style = [style, newStyle];
	    data.updater.setInProps(['style'], style);
	  }
	  agent.emit('hideHighlight');
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _Bridge = __webpack_require__(3);

	var _Bridge2 = _interopRequireDefault(_Bridge);

	var _Agent = __webpack_require__(1);

	var _Agent2 = _interopRequireDefault(_Agent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function decorate(obj, attr, fn) {
	  var old = obj[attr];
	  obj[attr] = function () {
	    var res = old.apply(this, arguments);
	    fn.apply(this, arguments);
	    return res;
	  };
	  return function () {
	    obj[attr] = old;
	  };
	}

	var subscriptionEnabled = false;

	module.exports = function (bridge, agent, hook) {
	  var shouldEnable = !!hook._relayInternals;

	  bridge.onCall('relay:check', function () {
	    return shouldEnable;
	  });
	  if (!shouldEnable) {
	    return;
	  }
	  var _hook$_relayInternals = hook._relayInternals;
	  var DefaultStoreData = _hook$_relayInternals.DefaultStoreData;
	  var setRequestListener = _hook$_relayInternals.setRequestListener;

	  function sendStoreData() {
	    if (subscriptionEnabled) {
	      bridge.send('relay:store', {
	        id: 'relay:store',
	        nodes: DefaultStoreData.getNodeData()
	      });
	    }
	  }

	  bridge.onCall('relay:store:enable', function () {
	    subscriptionEnabled = true;
	    sendStoreData();
	  });

	  bridge.onCall('relay:store:disable', function () {
	    subscriptionEnabled = false;
	  });

	  sendStoreData();
	  decorate(DefaultStoreData, 'handleUpdatePayload', sendStoreData);
	  decorate(DefaultStoreData, 'handleQueryPayload', sendStoreData);

	  var removeListener = setRequestListener(function (event, data) {
	    bridge.send(event, data);
	  });
	  hook.on('shutdown', removeListener);
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _types = __webpack_require__(2);

	var _Agent = __webpack_require__(1);

	var _Agent2 = _interopRequireDefault(_Agent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var setupBackend = __webpack_require__(39);

	module.exports = function (hook, agent) {
	  var subs = [hook.sub('renderer-attached', function (_ref) {
	    var id = _ref.id;
	    var renderer = _ref.renderer;
	    var helpers = _ref.helpers;

	    agent.setReactInternals(id, helpers);
	    helpers.walkTree(agent.onMounted.bind(agent, id), agent.addRoot.bind(agent, id));
	  }), hook.sub('root', function (_ref2) {
	    var renderer = _ref2.renderer;
	    var element = _ref2.element;
	    return agent.addRoot(renderer, element);
	  }), hook.sub('mount', function (_ref3) {
	    var renderer = _ref3.renderer;
	    var element = _ref3.element;
	    var data = _ref3.data;
	    return agent.onMounted(renderer, element, data);
	  }), hook.sub('update', function (_ref4) {
	    var renderer = _ref4.renderer;
	    var element = _ref4.element;
	    var data = _ref4.data;
	    return agent.onUpdated(element, data);
	  }), hook.sub('unmount', function (_ref5) {
	    var renderer = _ref5.renderer;
	    var element = _ref5.element;
	    return agent.onUnmounted(element);
	  })];

	  var success = setupBackend(hook);
	  if (!success) {
	    return;
	  }

	  hook.emit('react-devtools', agent);
	  hook.reactDevtoolsAgent = agent;
	  agent.on('shutdown', function () {
	    subs.forEach(function (fn) {
	      return fn();
	    });
	    hook.reactDevtoolsAgent = null;
	  });
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 *
	 * This is the chrome devtools
	 *
	 * 1. Devtools sets the __REACT_DEVTOOLS_GLOBAL_HOOK__ global.
	 * 2. React (if present) calls .inject() with the internal renderer
	 * 3. Devtools sees the renderer, and then adds this backend, along with the Agent
	 *    and whatever else is needed.
	 * 4. The agend then calls `.emit('react-devtools', agent)`
	 *
	 * Now things are hooked up.
	 *
	 * When devtools closes, it calls `cleanup()` to remove the listeners
	 * and any overhead caused by the backend.
	 */
	'use strict';

	var _types = __webpack_require__(2);

	var attachRenderer = __webpack_require__(40);

	module.exports = function setupBackend(hook) {
	  var oldReact = window.React && window.React.__internals;
	  if (oldReact && Object.keys(hook._renderers).length === 0) {
	    hook.inject(oldReact);
	  }

	  for (var rid in hook._renderers) {
	    hook.helpers[rid] = attachRenderer(hook, rid, hook._renderers[rid]);
	    hook.emit('renderer-attached', { id: rid, renderer: hook._renderers[rid], helpers: hook.helpers[rid] });
	  }

	  hook.on('renderer', function (_ref) {
	    var id = _ref.id;
	    var renderer = _ref.renderer;

	    hook.helpers[id] = attachRenderer(hook, id, renderer);
	    hook.emit('renderer-attached', { id: id, renderer: renderer, helpers: hook.helpers[id] });
	  });

	  var shutdown = function shutdown() {
	    for (var id in hook.helpers) {
	      hook.helpers[id].cleanup();
	    }
	    hook.off('shutdown', shutdown);
	  };
	  hook.on('shutdown', shutdown);

	  return true;
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _types = __webpack_require__(2);

	var getData = __webpack_require__(41);
	var getData012 = __webpack_require__(43);

	/**
	 * This takes care of patching the renderer to emit events on the global
	 * `Hook`. The returned object has a `.cleanup` method to un-patch everything.
	 */
	function attachRenderer(hook, rid, renderer) {
	  var rootNodeIDMap = new (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap)();
	  var extras = {};
	  // Before 0.13 there was no Reconciler, so we patch Component.Mixin
	  var isPre013 = !renderer.Reconciler;

	  // React Native
	  if (renderer.Mount.findNodeHandle && renderer.Mount.nativeTagToRootNodeID) {
	    extras.getNativeFromReactElement = function (component) {
	      return renderer.Mount.findNodeHandle(component);
	    };

	    extras.getReactElementFromNative = function (nativeTag) {
	      var id = renderer.Mount.nativeTagToRootNodeID(nativeTag);
	      return rootNodeIDMap.get(id);
	    };
	    // React DOM 15+
	  } else if (renderer.ComponentTree) {
	      extras.getNativeFromReactElement = function (component) {
	        return renderer.ComponentTree.getNodeFromInstance(component);
	      };

	      extras.getReactElementFromNative = function (node) {
	        return renderer.ComponentTree.getClosestInstanceFromNode(node);
	      };
	      // React DOM
	    } else if (renderer.Mount.getID && renderer.Mount.getNode) {
	        extras.getNativeFromReactElement = function (component) {
	          try {
	            return renderer.Mount.getNode(component._rootNodeID);
	          } catch (e) {}
	        };

	        extras.getReactElementFromNative = function (node) {
	          var id = renderer.Mount.getID(node);
	          while (node && node.parentNode && !id) {
	            node = node.parentNode;
	            id = renderer.Mount.getID(node);
	          }
	          return rootNodeIDMap.get(id);
	        };
	      } else {
	        console.warn('Unknown react version (does not have getID), probably an unshimmed React Native');
	      }

	  var oldMethods;
	  var oldRenderComponent;
	  var oldRenderRoot;

	  // React DOM
	  if (renderer.Mount._renderNewRootComponent) {
	    oldRenderRoot = decorateResult(renderer.Mount, '_renderNewRootComponent', function (element) {
	      hook.emit('root', { renderer: rid, element: element });
	    });
	    // React Native
	  } else if (renderer.Mount.renderComponent) {
	      oldRenderComponent = decorateResult(renderer.Mount, 'renderComponent', function (element) {
	        hook.emit('root', { renderer: rid, element: element._reactInternalInstance });
	      });
	    }

	  if (renderer.Component) {
	    console.error('You are using a version of React with limited support in this version of the devtools.\nPlease upgrade to use at least 0.13, or you can downgrade to use the old version of the devtools:\ninstructions here https://github.com/facebook/react-devtools/tree/devtools-next#how-do-i-use-this-for-react--013');
	    // 0.11 - 0.12
	    // $FlowFixMe renderer.Component is not "possibly undefined"
	    oldMethods = decorateMany(renderer.Component.Mixin, {
	      mountComponent: function mountComponent() {
	        var _this = this;

	        rootNodeIDMap.set(this._rootNodeID, this);
	        // FIXME DOMComponent calls Component.Mixin, and sets up the
	        // `children` *after* that call, meaning we don't have access to the
	        // children at this point. Maybe we should find something else to shim
	        // (do we have access to DOMComponent here?) so that we don't have to
	        // setTimeout.
	        setTimeout(function () {
	          hook.emit('mount', { element: _this, data: getData012(_this, {}), renderer: rid });
	        }, 0);
	      },
	      updateComponent: function updateComponent() {
	        var _this2 = this;

	        setTimeout(function () {
	          hook.emit('update', { element: _this2, data: getData012(_this2, {}), renderer: rid });
	        }, 0);
	      },
	      unmountComponent: function unmountComponent() {
	        hook.emit('unmount', { element: this, renderer: rid });
	        rootNodeIDMap.delete(this._rootNodeID, this);
	      }
	    });
	  } else if (renderer.Reconciler) {
	    oldMethods = decorateMany(renderer.Reconciler, {
	      mountComponent: function mountComponent(element, rootID, transaction, context) {
	        var data = getData(element, context);
	        rootNodeIDMap.set(element._rootNodeID, element);
	        hook.emit('mount', { element: element, data: data, renderer: rid });
	      },
	      performUpdateIfNecessary: function performUpdateIfNecessary(element, nextChild, transaction, context) {
	        hook.emit('update', { element: element, data: getData(element, context), renderer: rid });
	      },
	      receiveComponent: function receiveComponent(element, nextChild, transaction, context) {
	        hook.emit('update', { element: element, data: getData(element, context), renderer: rid });
	      },
	      unmountComponent: function unmountComponent(element) {
	        hook.emit('unmount', { element: element, renderer: rid });
	        rootNodeIDMap.delete(element._rootNodeID, element);
	      }
	    });
	  }

	  extras.walkTree = function (visit, visitRoot) {
	    var onMount = function onMount(component, data) {
	      rootNodeIDMap.set(component._rootNodeID, component);
	      visit(component, data);
	    };
	    walkRoots(renderer.Mount._instancesByReactRootID || renderer.Mount._instancesByContainerID, onMount, visitRoot, isPre013);
	  };

	  extras.cleanup = function () {
	    if (oldMethods) {
	      if (renderer.Component) {
	        restoreMany(renderer.Component.Mixin, oldMethods);
	      } else {
	        restoreMany(renderer.Reconciler, oldMethods);
	      }
	    }
	    if (oldRenderRoot) {
	      renderer.Mount._renderNewRootComponent = oldRenderRoot;
	    }
	    if (oldRenderComponent) {
	      renderer.Mount.renderComponent = oldRenderComponent;
	    }
	    oldMethods = null;
	    oldRenderRoot = null;
	    oldRenderComponent = null;
	  };

	  return extras;
	}

	function walkRoots(roots, onMount, onRoot, isPre013) {
	  for (var name in roots) {
	    walkNode(roots[name], onMount, isPre013);
	    onRoot(roots[name]);
	  }
	}

	function walkNode(element, onMount, isPre013) {
	  var data = isPre013 ? getData012(element) : getData(element);
	  if (data.children && Array.isArray(data.children)) {
	    data.children.forEach(function (child) {
	      return walkNode(child, onMount, isPre013);
	    });
	  }
	  onMount(element, data);
	}

	function decorateResult(obj, attr, fn) {
	  var old = obj[attr];
	  obj[attr] = function (instance) {
	    var res = old.apply(this, arguments);
	    fn(res);
	    return res;
	  };
	  return old;
	}

	function decorate(obj, attr, fn) {
	  var old = obj[attr];
	  obj[attr] = function (instance) {
	    var res = old.apply(this, arguments);
	    fn.apply(this, arguments);
	    return res;
	  };
	  return old;
	}

	function decorateMany(source, fns) {
	  var olds = {};
	  for (var name in fns) {
	    olds[name] = decorate(source, name, fns[name]);
	  }
	  return olds;
	}

	function restoreMany(source, olds) {
	  for (var name in olds) {
	    source[name] = olds[name];
	  }
	}

	module.exports = attachRenderer;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _types = __webpack_require__(2);

	var copyWithSet = __webpack_require__(42);

	/**
	 * Convert a react internal instance to a sanitized data object.
	 */
	function getData(element) {
	  var children = null;
	  var props = null;
	  var state = null;
	  var context = null;
	  var updater = null;
	  var name = null;
	  var type = null;
	  var text = null;
	  var publicInstance = null;
	  var nodeType = 'Native';
	  if (element._currentElement === null || element._currentElement === false) {
	    nodeType = 'Empty';
	  } else if (element._renderedComponent) {
	    nodeType = 'NativeWrapper';
	    children = [element._renderedComponent];
	    props = element._instance.props;
	    state = element._instance.state;
	    context = element._instance.context;
	    if (context && Object.keys(context).length === 0) {
	      context = null;
	    }
	  } else if (element._renderedChildren) {
	    children = childrenList(element._renderedChildren);
	  } else if (element._currentElement.props) {
	    // This is a native node without rendered children -- meaning the children
	    // prop is just a string.
	    children = element._currentElement.props.children;
	  }

	  if (!props && element._currentElement && element._currentElement.props) {
	    props = element._currentElement.props;
	  }

	  if (element._currentElement) {
	    type = element._currentElement.type;
	    if (typeof type === 'string') {
	      name = type;
	    } else if (element.getName) {
	      nodeType = 'Composite';
	      name = element.getName();
	      // 0.14 top-level wrapper
	      // TODO(jared): The backend should just act as if these don't exist.
	      if (element._renderedComponent && element._currentElement.props === element._renderedComponent._currentElement) {
	        nodeType = 'Wrapper';
	      }
	      if (name === null) {
	        name = 'No display name';
	      }
	    } else if (element._stringText) {
	      nodeType = 'Text';
	      text = element._stringText;
	    } else {
	      name = type.displayName || type.name || 'Unknown';
	    }
	  }

	  if (element._instance) {
	    var inst = element._instance;
	    updater = {
	      setState: inst.setState && inst.setState.bind(inst),
	      forceUpdate: inst.forceUpdate && inst.forceUpdate.bind(inst),
	      setInProps: inst.forceUpdate && setInProps.bind(null, inst),
	      setInState: inst.forceUpdate && setInState.bind(null, inst),
	      setInContext: inst.forceUpdate && setInContext.bind(null, inst)
	    };
	    publicInstance = inst;

	    // TODO: React ART currently falls in this bucket, but this doesn't
	    // actually make sense and we should clean this up after stabilizing our
	    // API for backends
	    if (inst._renderedChildren) {
	      children = childrenList(inst._renderedChildren);
	    }
	  }

	  return {
	    nodeType: nodeType,
	    type: type,
	    name: name,
	    props: props,
	    state: state,
	    context: context,
	    children: children,
	    text: text,
	    updater: updater,
	    publicInstance: publicInstance
	  };
	}

	function setInProps(inst, path, value) {
	  inst.props = copyWithSet(inst.props, path, value);
	  inst.forceUpdate();
	}

	function setInState(inst, path, value) {
	  setIn(inst.state, path, value);
	  inst.forceUpdate();
	}

	function setInContext(inst, path, value) {
	  setIn(inst.context, path, value);
	  inst.forceUpdate();
	}

	function setIn(obj, path, value) {
	  var last = path.pop();
	  var parent = path.reduce(function (obj_, attr) {
	    return obj_ ? obj_[attr] : null;
	  }, obj);
	  if (parent) {
	    parent[last] = value;
	  }
	}

	function childrenList(children) {
	  var res = [];
	  for (var name in children) {
	    res.push(children[name]);
	  }
	  return res;
	}

	module.exports = getData;

/***/ },
/* 42 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function copyWithSetImpl(obj, path, idx, value) {
	  if (idx >= path.length) {
	    return value;
	  }
	  var key = path[idx];
	  var updated = Array.isArray(obj) ? obj.slice() : _extends({}, obj);
	  // $FlowFixMe number or string is fine here
	  updated[key] = copyWithSetImpl(obj[key], path, idx + 1, value);
	  return updated;
	}

	function copyWithSet(obj, path, value) {
	  return copyWithSetImpl(obj, path, 0, value);
	}

	module.exports = copyWithSet;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _types = __webpack_require__(2);

	var copyWithSet = __webpack_require__(42);

	function getData012(element) {
	  var children = null;
	  var props = element.props;
	  var state = element.state;
	  var context = element.context;
	  var updater = null;
	  var name = null;
	  var type = null;
	  var text = null;
	  var publicInstance = null;
	  var nodeType = 'Native';
	  if (element._renderedComponent) {
	    nodeType = 'Wrapper';
	    children = [element._renderedComponent];
	    if (context && Object.keys(context).length === 0) {
	      context = null;
	    }
	  } else if (element._renderedChildren) {
	    name = element.constructor.displayName;
	    children = childrenList(element._renderedChildren);
	  } else if (typeof props.children === 'string') {
	    // string children
	    name = element.constructor.displayName;
	    children = props.children;
	    nodeType = 'Native';
	  }

	  if (!props && element._currentElement && element._currentElement.props) {
	    props = element._currentElement.props;
	  }

	  if (element._currentElement) {
	    type = element._currentElement.type;
	    if (typeof type === 'string') {
	      name = type;
	    } else {
	      nodeType = 'Composite';
	      name = type.displayName;
	      if (!name) {
	        name = 'No display name';
	      }
	    }
	  }

	  if (!name) {
	    name = element.constructor.displayName || 'No display name';
	    nodeType = 'Composite';
	  }

	  if (typeof props === 'string') {
	    nodeType = 'Text';
	    text = props;
	    props = null;
	    name = null;
	  }

	  if (element.forceUpdate) {
	    updater = {
	      setState: element.setState.bind(element),
	      forceUpdate: element.forceUpdate.bind(element),
	      setInProps: element.forceUpdate && setInProps.bind(null, element),
	      setInState: element.forceUpdate && setInState.bind(null, element),
	      setInContext: element.forceUpdate && setInContext.bind(null, element)
	    };
	    publicInstance = element;
	  }

	  return {
	    nodeType: nodeType,
	    type: type,
	    name: name,
	    props: props,
	    state: state,
	    context: context,
	    children: children,
	    text: text,
	    updater: updater,
	    publicInstance: publicInstance
	  };
	}

	function setInProps(inst, path, value) {
	  inst.props = copyWithSet(inst.props, path, value);
	  inst.forceUpdate();
	}

	function setInState(inst, path, value) {
	  setIn(inst.state, path, value);
	  inst.forceUpdate();
	}

	function setInContext(inst, path, value) {
	  setIn(inst.context, path, value);
	  inst.forceUpdate();
	}

	function setIn(obj, path, value) {
	  var last = path.pop();
	  var parent = path.reduce(function (obj_, attr) {
	    return obj_ ? obj_[attr] : null;
	  }, obj);
	  if (parent) {
	    parent[last] = value;
	  }
	}

	function childrenList(children) {
	  var res = [];
	  for (var name in children) {
	    res.push(children[name]);
	  }
	  return res;
	}

	module.exports = getData012;

/***/ }
/******/ ]);
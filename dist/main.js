module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseEntity = function BaseEntity() {
  var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var priority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

  _classCallCheck(this, BaseEntity);

  this.active = active;
  this.priority = priority;
  this.needsDestroy = false;
};

/* harmony default export */ exports["a"] = BaseEntity;
;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseSystem = function () {
  function BaseSystem() {
    var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var priority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
    var updateFunction = arguments[2];

    _classCallCheck(this, BaseSystem);

    this.active = active;
    this.priority = priority;
    this.updateFunction = updateFunction;
    this.entities = [];
  }

  //Overide


  _createClass(BaseSystem, [{
    key: "onEntityAdded",
    value: function onEntityAdded(manager) {}
  }, {
    key: "onEntityRemoved",
    value: function onEntityRemoved(manager) {}
  }, {
    key: "onSystemAddedTo",
    value: function onSystemAddedTo(manager) {
      this.em = manager;
    }
  }, {
    key: "onSystemRemovedFrom",
    value: function onSystemRemovedFrom(manager) {}

    //Overide

  }, {
    key: "update",
    value: function update() {
      if (this.updateFunction) {
        this.updateFunction.apply(this, arguments);
      }
    }
  }]);

  return BaseSystem;
}();

/* harmony default export */ exports["a"] = BaseSystem;
;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EntityManager = function () {
  function EntityManager() {
    _classCallCheck(this, EntityManager);

    this.entities = [];
    this.systems = [];
    this.listeners = {};
    this.nextEntityId = 0;
    this.nextSystemId = 0;
  }

  /* Entities */


  _createClass(EntityManager, [{
    key: "addEntity",
    value: function addEntity(entity) {
      var _this = this;

      if (entity.hasOwnProperty("_id")) {
        console.warn("EntityManager.addEntity(): Attempted to add an Entity with an existing _id ");
        return false;
      } else {
        entity._id = this.nextEntityId++;
        this.entities.push(entity);

        //Notify Systems EntityAdded
        this.systems.forEach(function (system) {
          system.onEntityAdded(_this);
        });
        return true;
      }
    }
  }, {
    key: "removeEntity",
    value: function removeEntity(entity) {
      var _this2 = this;

      var index = this.entities.indexOf(entity);
      if (index > -1) {
        this.entities.splice(index, 1);

        this.systems.forEach(function (system) {
          system.onEntityRemoved(_this2);
        });
        return true;
      } else {
        console.warn("EntityManager.removeEntity(): Attempted to remove an Entity not in this.entities");
        return false;
      }
    }
  }, {
    key: "getEnityById",
    value: function getEnityById(id) {
      this.entities.forEach(function (entity) {
        if (entity._id === id) {
          return entity;
        }
      });
      console.warn("EntityManager.getEnityById(): Attempted to get an Entity not in this.entities");
    }
  }, {
    key: "getEntitiesByProps",
    value: function getEntitiesByProps(props) {
      var entities = [];
      this.entities.forEach(function (entity) {
        var hasAllProps = true;
        props.forEach(function (prop) {
          if ((typeof prop === "undefined" ? "undefined" : _typeof(prop)) === 'object') {
            if (!entity.hasOwnProperty(prop.name) || entity[prop.name] !== prop.value) {
              hasAllProps = false;
            }
          } else if (typeof prop === 'string') {
            if (!entity.hasOwnProperty(prop)) {
              hasAllProps = false;
            }
          }
        });

        if (hasAllProps) {
          entities.push(entity);
        }
      });
      return entities;
    }
  }, {
    key: "getEntitiesByClassName",
    value: function getEntitiesByClassName(className) {
      var entities = [];
      this.entities.forEach(function (entity) {
        if (entity.constructor.name === className) {
          entities.push(entity);
        }
      });
      return entities;
    }

    /* Systems */

  }, {
    key: "addSystem",
    value: function addSystem(system) {
      if (system.hasOwnProperty("_id")) {
        console.warn("EntityManager.addSystem(): Attempted to add a System with an existing _id ");
        return false;
      } else {
        system._id = this.nextSystemId++;
        this.systems.push(system);
        system.onSystemAddedTo(this);
        this._sortSystems();
        return true;
      }
    }
  }, {
    key: "removeSystem",
    value: function removeSystem(system) {
      var index = this.systems.indexOf(system);
      if (index > -1) {
        this.systems.splice(index, 1);
        system.onSystemRemovedFrom(this);
        this._sortSystems();
        return true;
      } else {
        console.warn("EntityManager.removeSystem(): Attempted to remove a System not in this.systems");
        return false;
      }
    }
  }, {
    key: "_sortSystems",
    value: function _sortSystems() {
      this.systems.sort(function (a, b) {
        return a.priority - b.priority;
      });
    }

    /* Events */

  }, {
    key: "listenFor",
    value: function listenFor(eventName, listener, binder) {
      var group = this.listeners[eventName];
      if (!group) {
        group = [];
        this.listeners[eventName] = group;
      }

      var l = {};
      l.eventName = eventName;
      l.listener = listener;
      l.binder = binder;

      group.push(l);
    }
  }, {
    key: "notify",
    value: function notify(eventName) {
      var _arguments = arguments;

      var group = this.listeners[eventName];
      if (group) {
        group.forEach(function (l) {
          if ('binder' in l) {
            l.listener.apply(l.binder, _arguments);
          } else {
            l.listener.apply(l.listener, _arguments);
          }
        });
      }
    }
  }, {
    key: "removeListener",
    value: function removeListener(eventName, listener) {
      var group = this.listeners[eventName];

      if (group) {
        for (var ix in group) {
          var l = group[ix];
          if (l.listener === listener) {
            group.splice(ix, 1);
            break;
          }
        }
      }
    }

    //Update

  }, {
    key: "update",
    value: function update(delta) {
      var _this3 = this;

      //Update all active systems
      this.systems.forEach(function (system) {
        if (system.active) {
          system.update(delta, _this3);
        }
      });
    }
  }]);

  return EntityManager;
}();

/* harmony default export */ exports["a"] = EntityManager;
;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__EntityManager_js__ = __webpack_require__(2);
/* harmony reexport (binding) */ __webpack_require__.d(exports, "EntityManager", function() { return __WEBPACK_IMPORTED_MODULE_0__EntityManager_js__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(exports, "default", function() { return __WEBPACK_IMPORTED_MODULE_0__EntityManager_js__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BaseEntity_js__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(exports, "BaseEntity", function() { return __WEBPACK_IMPORTED_MODULE_1__BaseEntity_js__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseSystem_js__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(exports, "BaseSystem", function() { return __WEBPACK_IMPORTED_MODULE_2__BaseSystem_js__["a"]; });
/* harmony export (binding) */ __webpack_require__.d(exports, "em", function() { return em; });

var em = new __WEBPACK_IMPORTED_MODULE_0__EntityManager_js__["a" /* default */]();




/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map
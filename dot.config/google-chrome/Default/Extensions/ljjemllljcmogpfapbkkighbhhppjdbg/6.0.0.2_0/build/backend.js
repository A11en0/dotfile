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
/******/ 	return __webpack_require__(__webpack_require__.s = 262);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(19), exports);
__exportStar(__webpack_require__(16), exports);
__exportStar(__webpack_require__(55), exports);
__exportStar(__webpack_require__(6), exports);
__exportStar(__webpack_require__(7), exports);
__exportStar(__webpack_require__(15), exports);
__exportStar(__webpack_require__(20), exports);
__exportStar(__webpack_require__(4), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 102:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DevtoolsPluginApiInstance = exports.DevtoolsApi = void 0;
const shared_utils_1 = __webpack_require__(1);
const devtools_api_1 = __webpack_require__(103);
const hooks_1 = __webpack_require__(104);
let backendOn;
let pluginOn;
class DevtoolsApi {
    constructor(bridge, ctx) {
        this.bridge = bridge;
        this.ctx = ctx;
        if (!backendOn) {
            backendOn = new hooks_1.DevtoolsHookable(ctx);
        }
        if (!pluginOn) {
            pluginOn = new hooks_1.DevtoolsHookable(ctx);
        }
    }
    get on() {
        return backendOn;
    }
    async callHook(eventType, payload, ctx = this.ctx) {
        payload = await backendOn.callHandlers(eventType, payload, ctx);
        payload = await pluginOn.callHandlers(eventType, payload, ctx);
        return payload;
    }
    async transformCall(callName, ...args) {
        const payload = await this.callHook(devtools_api_1.Hooks.TRANSFORM_CALL, {
            callName,
            inArgs: args,
            outArgs: args.slice()
        });
        return payload.outArgs;
    }
    async getAppRecordName(app, id) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_APP_RECORD_NAME, {
            app,
            name: null
        });
        if (payload.name) {
            return payload.name;
        }
        else {
            return `App ${id + 1}`;
        }
    }
    async getAppRootInstance(app) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_APP_ROOT_INSTANCE, {
            app,
            root: null
        });
        return payload.root;
    }
    async registerApplication(app) {
        await this.callHook(devtools_api_1.Hooks.REGISTER_APPLICATION, {
            app
        });
    }
    async walkComponentTree(instance, maxDepth = -1, filter = null) {
        const payload = await this.callHook(devtools_api_1.Hooks.WALK_COMPONENT_TREE, {
            componentInstance: instance,
            componentTreeData: null,
            maxDepth,
            filter
        });
        return payload.componentTreeData;
    }
    async walkComponentParents(instance) {
        const payload = await this.callHook(devtools_api_1.Hooks.WALK_COMPONENT_PARENTS, {
            componentInstance: instance,
            parentInstances: []
        });
        return payload.parentInstances;
    }
    async inspectComponent(instance) {
        const payload = await this.callHook(devtools_api_1.Hooks.INSPECT_COMPONENT, {
            componentInstance: instance,
            instanceData: null
        });
        return payload.instanceData;
    }
    async getComponentBounds(instance) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_COMPONENT_BOUNDS, {
            componentInstance: instance,
            bounds: null
        });
        return payload.bounds;
    }
    async getComponentName(instance) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_COMPONENT_NAME, {
            componentInstance: instance,
            name: null
        });
        return payload.name;
    }
    async getElementComponent(element) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_ELEMENT_COMPONENT, {
            element,
            componentInstance: null
        });
        return payload.componentInstance;
    }
    async getInspectorTree(inspectorId, app, filter) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_INSPECTOR_TREE, {
            inspectorId,
            app,
            filter,
            rootNodes: []
        });
        return payload.rootNodes;
    }
    async getInspectorState(inspectorId, app, nodeId) {
        const payload = await this.callHook(devtools_api_1.Hooks.GET_INSPECTOR_STATE, {
            inspectorId,
            app,
            nodeId,
            state: null
        });
        return payload.state;
    }
}
exports.DevtoolsApi = DevtoolsApi;
class DevtoolsPluginApiInstance {
    constructor(plugin, ctx) {
        this.bridge = ctx.bridge;
        this.ctx = ctx;
        this.plugin = plugin;
        if (!pluginOn) {
            pluginOn = new hooks_1.DevtoolsHookable(ctx);
        }
    }
    get on() {
        return pluginOn;
    }
    // Plugin API
    async notifyComponentUpdate(instance = null) {
        if (instance) {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED, ...await this.ctx.api.transformCall(shared_utils_1.HookEvents.COMPONENT_UPDATED, instance));
        }
        else {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED);
        }
    }
    addTimelineLayer(options) {
        this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, options, this.plugin.descriptor.app);
    }
    addTimelineEvent(options) {
        this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, options, this.plugin.descriptor.app);
    }
    addInspector(options) {
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, options, this.plugin.descriptor.app);
    }
    sendInspectorTree(inspectorId) {
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, inspectorId, this.plugin.descriptor.app);
    }
    sendInspectorState(inspectorId) {
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, inspectorId, this.plugin.descriptor.app);
    }
}
exports.DevtoolsPluginApiInstance = DevtoolsPluginApiInstance;
//# sourceMappingURL=api.js.map

/***/ }),

/***/ 103:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDevtoolsPlugin = void 0;
const env_1 = __webpack_require__(263);
const const_1 = __webpack_require__(264);
__exportStar(__webpack_require__(265), exports);
function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    if (env_1.hook) {
        env_1.hook.emit(const_1.ApiHookEvents.SETUP_DEVTOOLS_PLUGIN, pluginDescriptor, setupFn);
    }
    else {
        const list = env_1.target.__VUE_DEVTOOLS_PLUGINS__ = env_1.target.__VUE_DEVTOOLS_PLUGINS__ || [];
        list.push({
            pluginDescriptor,
            setupFn
        });
    }
}
exports.setupDevtoolsPlugin = setupDevtoolsPlugin;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 104:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DevtoolsHookable = void 0;
const devtools_api_1 = __webpack_require__(103);
class DevtoolsHookable {
    constructor(ctx) {
        this.handlers = {};
        this.ctx = ctx;
    }
    hook(eventType, handler) {
        const handlers = (this.handlers[eventType] = this.handlers[eventType] || []);
        handlers.push({
            handler,
            plugin: this.ctx.currentPlugin
        });
    }
    async callHandlers(eventType, payload, ctx) {
        if (this.handlers[eventType]) {
            const handlers = this.handlers[eventType];
            for (let i = 0; i < handlers.length; i++) {
                const { handler } = handlers[i];
                await handler(payload, ctx);
            }
        }
        return payload;
    }
    transformCall(handler) {
        this.hook(devtools_api_1.Hooks.TRANSFORM_CALL, handler);
    }
    getAppRecordName(handler) {
        this.hook(devtools_api_1.Hooks.GET_APP_RECORD_NAME, handler);
    }
    getAppRootInstance(handler) {
        this.hook(devtools_api_1.Hooks.GET_APP_ROOT_INSTANCE, handler);
    }
    registerApplication(handler) {
        this.hook(devtools_api_1.Hooks.REGISTER_APPLICATION, handler);
    }
    walkComponentTree(handler) {
        this.hook(devtools_api_1.Hooks.WALK_COMPONENT_TREE, handler);
    }
    walkComponentParents(handler) {
        this.hook(devtools_api_1.Hooks.WALK_COMPONENT_PARENTS, handler);
    }
    inspectComponent(handler) {
        this.hook(devtools_api_1.Hooks.INSPECT_COMPONENT, handler);
    }
    getComponentBounds(handler) {
        this.hook(devtools_api_1.Hooks.GET_COMPONENT_BOUNDS, handler);
    }
    getComponentName(handler) {
        this.hook(devtools_api_1.Hooks.GET_COMPONENT_NAME, handler);
    }
    getElementComponent(handler) {
        this.hook(devtools_api_1.Hooks.GET_ELEMENT_COMPONENT, handler);
    }
    getInspectorTree(handler) {
        this.hook(devtools_api_1.Hooks.GET_INSPECTOR_TREE, handler);
    }
    getInspectorState(handler) {
        this.hook(devtools_api_1.Hooks.GET_INSPECTOR_STATE, handler);
    }
}
exports.DevtoolsHookable = DevtoolsHookable;
//# sourceMappingURL=hooks.js.map

/***/ }),

/***/ 105:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.hook = void 0;
const shared_utils_1 = __webpack_require__(1);
// hook should have been injected before this executes.
exports.hook = shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
//# sourceMappingURL=global-hook.js.map

/***/ }),

/***/ 106:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.unHighlight = exports.highlight = void 0;
const shared_utils_1 = __webpack_require__(1);
const queue_1 = __webpack_require__(277);
let overlay;
let overlayContent;
function createOverlay() {
    if (overlay || !shared_utils_1.isBrowser)
        return;
    overlay = document.createElement('div');
    overlay.style.backgroundColor = 'rgba(65, 184, 131, 0.35)';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '99999999999999';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.borderRadius = '3px';
    overlayContent = document.createElement('div');
    overlayContent.style.backgroundColor = 'rgba(65, 184, 131, 0.9)';
    overlayContent.style.fontFamily = 'monospace';
    overlayContent.style.fontSize = '11px';
    overlayContent.style.padding = '2px 3px';
    overlayContent.style.borderRadius = '3px';
    overlayContent.style.color = 'white';
    overlay.appendChild(overlayContent);
}
// Use a job queue to preserve highlight/unhighlight calls order
// This prevents "sticky" highlights that are not removed because highlight is async
const jobQueue = new queue_1.JobQueue();
async function highlight(instance, ctx) {
    await jobQueue.queue(async () => {
        if (!instance)
            return;
        const bounds = await ctx.api.getComponentBounds(instance);
        if (bounds) {
            const name = (await ctx.api.getComponentName(instance)) || 'Anonymous';
            createOverlay();
            const pre = document.createElement('span');
            pre.style.opacity = '0.6';
            pre.innerText = '<';
            const text = document.createTextNode(name);
            const post = document.createElement('span');
            post.style.opacity = '0.6';
            post.innerText = '>';
            showOverlay(bounds, [pre, text, post]);
        }
    });
}
exports.highlight = highlight;
async function unHighlight() {
    await jobQueue.queue(async () => {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    });
}
exports.unHighlight = unHighlight;
function showOverlay({ width = 0, height = 0, top = 0, left = 0 }, children = []) {
    if (!shared_utils_1.isBrowser || !children.length)
        return;
    overlay.style.width = ~~width + 'px';
    overlay.style.height = ~~height + 'px';
    overlay.style.top = ~~top + 'px';
    overlay.style.left = ~~left + 'px';
    overlayContent.innerHTML = '';
    children.forEach(child => overlayContent.appendChild(child));
    document.body.appendChild(overlay);
}
//# sourceMappingURL=highlighter.js.map

/***/ }),

/***/ 118:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBackend = void 0;
const app_backend_api_1 = __webpack_require__(24);
const shared_utils_1 = __webpack_require__(1);
const global_hook_1 = __webpack_require__(105);
const subscriptions_1 = __webpack_require__(276);
const highlighter_1 = __webpack_require__(106);
const timeline_1 = __webpack_require__(278);
const component_pick_1 = __importDefault(__webpack_require__(287));
const component_1 = __webpack_require__(288);
const plugin_1 = __webpack_require__(289);
const app_1 = __webpack_require__(25);
const inspector_1 = __webpack_require__(290);
let ctx;
async function initBackend(bridge) {
    ctx = app_backend_api_1.createBackendContext({
        bridge,
        hook: global_hook_1.hook
    });
    await shared_utils_1.initSharedData({
        bridge,
        persist: false
    });
    if (global_hook_1.hook.Vue) {
        connect();
        app_1.registerApp({
            app: global_hook_1.hook.Vue,
            types: {},
            version: global_hook_1.hook.Vue.version
        }, ctx);
    }
    else {
        global_hook_1.hook.once(shared_utils_1.HookEvents.INIT, connect);
    }
    global_hook_1.hook.on(shared_utils_1.HookEvents.APP_ADD, app => {
        // Will init connect
        global_hook_1.hook.emit(shared_utils_1.HookEvents.INIT);
        app_1.registerApp(app, ctx);
    });
}
exports.initBackend = initBackend;
function connect() {
    ctx.currentTab = shared_utils_1.BuiltinTabs.COMPONENTS;
    // Subscriptions
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SUBSCRIBE, ({ type, payload }) => {
        subscriptions_1.subscribe(type, payload);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_UNSUBSCRIBE, ({ type, payload }) => {
        subscriptions_1.unsubscribe(type, payload);
    });
    // Tabs
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TAB_SWITCH, async (tab) => {
        ctx.currentTab = tab;
        await flushAll();
    });
    // Apps
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_LIST, () => {
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_LIST, {
            apps: ctx.appRecords.map(app_1.mapAppRecord)
        });
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_SELECT, async (id) => {
        if (id == null)
            return;
        const record = ctx.appRecords.find(r => r.id === id);
        if (!record) {
            console.error(`App with id ${id} not found`);
        }
        else {
            await app_1.selectApp(record, ctx);
        }
    });
    // Components
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_TREE, ({ instanceId, filter }) => {
        if (instanceId === '_root') {
            instanceId = `${ctx.currentAppRecord.id}:root`;
        }
        component_1.sendComponentTreeData(instanceId, filter, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
        if (instanceId === '_root') {
            instanceId = `${ctx.currentAppRecord.id}:root`;
        }
        component_1.sendSelectedComponentData(instanceId, ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UPDATED, (app, uid) => {
        const id = app ? component_1.getComponentId(app, uid, ctx) : ctx.currentInspectedComponentId;
        if (id && subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
            component_1.sendSelectedComponentData(id, ctx);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_ADDED, (app, uid, parentUid) => {
        const parentId = component_1.getComponentId(app, parentUid, ctx);
        if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
            // @TODO take into account current filter
            component_1.sendComponentTreeData(parentId, null, ctx);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
        const parentId = component_1.getComponentId(app, parentUid, ctx);
        if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
            // @TODO take into account current filter
            component_1.sendComponentTreeData(parentId, null, ctx);
        }
        const id = component_1.getComponentId(app, uid, ctx);
        if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
            component_1.sendEmptyComponentData(id, ctx);
        }
        ctx.currentAppRecord.instanceMap.delete(id);
    });
    // Highlighter
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, instanceId => {
        highlighter_1.highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, () => {
        highlighter_1.unHighlight();
    });
    // Component picker
    const componentPicker = new component_pick_1.default(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK, () => {
        componentPicker.startSelecting();
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK_CANCELED, () => {
        componentPicker.stopSelecting();
    });
    // Timeline
    timeline_1.setupTimeline(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, () => {
        timeline_1.sendTimelineLayers(ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, (options, app) => {
        ctx.timelineLayers.push({
            ...options,
            app
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, (options, app) => {
        const appId = app && app_1.getAppRecordId(app);
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
            appId: options.all || !app || appId == null ? 'all' : appId,
            layerId: options.layerId,
            event: {
                time: options.event.time,
                data: shared_utils_1.stringify(options.event.data)
            }
        });
    });
    // Custom inspectors
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, () => {
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
            inspectors: ctx.customInspectors.map(i => ({
                id: i.id,
                appId: app_1.getAppRecordId(i.app),
                label: i.label,
                icon: i.icon,
                treeFilterPlaceholder: i.treeFilterPlaceholder,
                stateFilterPlaceholder: i.stateFilterPlaceholder
            }))
        });
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, ({ inspectorId, appId, treeFilter }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            inspector.treeFilter = treeFilter;
            inspector_1.sendInspectorTree(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, ({ inspectorId, appId, nodeId }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            inspector.selectedNodeId = nodeId;
            inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, (options, app) => {
        ctx.customInspectors.push({
            ...options,
            app,
            treeFilter: '',
            selectedNodeId: null
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, (inspectorId, app) => {
        const inspector = inspector_1.getInspector(inspectorId, app, ctx);
        if (inspector) {
            inspector_1.sendInspectorTree(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, (inspectorId, app) => {
        const inspector = inspector_1.getInspector(inspectorId, app, ctx);
        if (inspector) {
            inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    // Plugins
    plugin_1.addQueuedPlugins(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, () => {
        plugin_1.sendPluginList(ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.SETUP_DEVTOOLS_PLUGIN, (pluginDescriptor, setupFn) => {
        plugin_1.addPlugin(pluginDescriptor, setupFn, ctx);
    });
    // @TODO
    console.log('%cconnect done', 'color: green');
}
async function flushAll() {
    // @TODO notify frontend
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.clearStorage = exports.removeStorage = exports.setStorage = exports.getStorage = exports.initStorage = void 0;
const env_1 = __webpack_require__(6);
// If we can, we use the browser extension API to store data
// it's async though, so we synchronize changes from an intermediate
// storageData object
const useStorage = typeof env_1.target.chrome !== 'undefined' && typeof env_1.target.chrome.storage !== 'undefined';
let storageData = null;
function initStorage() {
    return new Promise((resolve) => {
        if (useStorage) {
            env_1.target.chrome.storage.local.get(null, result => {
                storageData = result;
                resolve();
            });
        }
        else {
            storageData = {};
            resolve();
        }
    });
}
exports.initStorage = initStorage;
function getStorage(key, defaultValue = null) {
    checkStorage();
    if (useStorage) {
        return getDefaultValue(storageData[key], defaultValue);
    }
    else {
        try {
            return getDefaultValue(JSON.parse(localStorage.getItem(key)), defaultValue);
        }
        catch (e) { }
    }
}
exports.getStorage = getStorage;
function setStorage(key, val) {
    checkStorage();
    if (useStorage) {
        storageData[key] = val;
        env_1.target.chrome.storage.local.set({ [key]: val });
    }
    else {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        }
        catch (e) { }
    }
}
exports.setStorage = setStorage;
function removeStorage(key) {
    checkStorage();
    if (useStorage) {
        delete storageData[key];
        env_1.target.chrome.storage.local.remove([key]);
    }
    else {
        try {
            localStorage.removeItem(key);
        }
        catch (e) { }
    }
}
exports.removeStorage = removeStorage;
function clearStorage() {
    checkStorage();
    if (useStorage) {
        storageData = {};
        env_1.target.chrome.storage.local.clear();
    }
    else {
        try {
            localStorage.clear();
        }
        catch (e) { }
    }
}
exports.clearStorage = clearStorage;
function checkStorage() {
    if (!storageData) {
        throw new Error('Storage wasn\'t initialized with \'init()\'');
    }
}
function getDefaultValue(value, defaultValue) {
    if (value == null) {
        return defaultValue;
    }
    return value;
}
//# sourceMappingURL=storage.js.map

/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
const events_1 = __webpack_require__(54);
const BATCH_DURATION = 100;
class Bridge extends events_1.EventEmitter {
    constructor(wall) {
        super();
        this.setMaxListeners(Infinity);
        this.wall = wall;
        wall.listen(messages => {
            if (Array.isArray(messages)) {
                messages.forEach(message => this._emit(message));
            }
            else {
                this._emit(messages);
            }
        });
        this._batchingQueue = [];
        this._sendingQueue = [];
        this._receivingQueue = [];
        this._sending = false;
        this._time = null;
    }
    send(event, payload) {
        if (Array.isArray(payload)) {
            const lastIndex = payload.length - 1;
            payload.forEach((chunk, index) => {
                this._send({
                    event,
                    _chunk: chunk,
                    last: index === lastIndex
                });
            });
            this._flush();
        }
        else if (this._time === null) {
            this._send([{ event, payload }]);
            this._time = Date.now();
        }
        else {
            this._batchingQueue.push({
                event,
                payload
            });
            const now = Date.now();
            if (now - this._time > BATCH_DURATION) {
                this._flush();
            }
            else {
                this._timer = setTimeout(() => this._flush(), BATCH_DURATION);
            }
        }
    }
    /**
     * Log a message to the devtools background page.
     */
    log(message) {
        this.send('log', message);
    }
    _flush() {
        if (this._batchingQueue.length)
            this._send(this._batchingQueue);
        clearTimeout(this._timer);
        this._batchingQueue = [];
        this._time = null;
    }
    // @TODO types
    _emit(message) {
        if (typeof message === 'string') {
            this.emit(message);
        }
        else if (message._chunk) {
            this._receivingQueue.push(message._chunk);
            if (message.last) {
                this.emit(message.event, this._receivingQueue);
                this._receivingQueue = [];
            }
        }
        else if (message.event) {
            this.emit(message.event, message.payload);
        }
    }
    // @TODO types
    _send(messages) {
        this._sendingQueue.push(messages);
        this._nextSend();
    }
    _nextSend() {
        if (!this._sendingQueue.length || this._sending)
            return;
        this._sending = true;
        const messages = this._sendingQueue.shift();
        try {
            this.wall.send(messages);
        }
        catch (err) {
            if (err.message === 'Message length exceeded maximum allowed length.') {
                this._sendingQueue.splice(0, 0, messages.map(message => [message]));
            }
        }
        this._sending = false;
        requestAnimationFrame(() => this._nextSend());
    }
}
exports.Bridge = Bridge;
//# sourceMappingURL=bridge.js.map

/***/ }),

/***/ 19:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatchedGetters = exports.getCustomStoreDetails = exports.getCustomRouterDetails = exports.getCustomInstanceDetails = exports.getInstanceMap = exports.backendInjections = void 0;
exports.backendInjections = {
    instanceMap: null,
    getCustomInstanceDetails: null
};
function getInstanceMap() {
    return exports.backendInjections.instanceMap;
}
exports.getInstanceMap = getInstanceMap;
function getCustomInstanceDetails(instance) {
    return exports.backendInjections.getCustomInstanceDetails(instance);
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
function getCustomRouterDetails(router) {
    return {
        _custom: {
            type: 'router',
            display: 'VueRouter',
            value: {
                options: router.options,
                currentRoute: router.currentRoute
            },
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomRouterDetails = getCustomRouterDetails;
function getCustomStoreDetails(store) {
    return {
        _custom: {
            type: 'store',
            display: 'Store',
            value: {
                state: store.state,
                getters: getCatchedGetters(store)
            },
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomStoreDetails = getCustomStoreDetails;
function getCatchedGetters(store) {
    const getters = {};
    const origGetters = store.getters || {};
    const keys = Object.keys(origGetters);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        Object.defineProperty(getters, key, {
            enumerable: true,
            get: () => {
                try {
                    return origGetters[key];
                }
                catch (e) {
                    return e;
                }
            }
        });
    }
    return getters;
}
exports.getCatchedGetters = getCatchedGetters;
//# sourceMappingURL=backend.js.map

/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyStrictCircularAutoChunks = exports.parseCircularAutoChunks = exports.stringifyCircularAutoChunks = void 0;
const MAX_SERIALIZED_SIZE = 512 * 1024; // 1MB
function encode(data, replacer, list, seen) {
    let stored, key, value, i, l;
    const seenIndex = seen.get(data);
    if (seenIndex != null) {
        return seenIndex;
    }
    const index = list.length;
    const proto = Object.prototype.toString.call(data);
    if (proto === '[object Object]') {
        stored = {};
        seen.set(data, index);
        list.push(stored);
        const keys = Object.keys(data);
        for (i = 0, l = keys.length; i < l; i++) {
            key = keys[i];
            value = data[key];
            if (replacer)
                value = replacer.call(data, key, value);
            stored[key] = encode(value, replacer, list, seen);
        }
    }
    else if (proto === '[object Array]') {
        stored = [];
        seen.set(data, index);
        list.push(stored);
        for (i = 0, l = data.length; i < l; i++) {
            value = data[i];
            if (replacer)
                value = replacer.call(data, i, value);
            stored[i] = encode(value, replacer, list, seen);
        }
    }
    else {
        list.push(data);
    }
    return index;
}
function decode(list, reviver) {
    let i = list.length;
    let j, k, data, key, value, proto;
    while (i--) {
        data = list[i];
        proto = Object.prototype.toString.call(data);
        if (proto === '[object Object]') {
            const keys = Object.keys(data);
            for (j = 0, k = keys.length; j < k; j++) {
                key = keys[j];
                value = list[data[key]];
                if (reviver)
                    value = reviver.call(data, key, value);
                data[key] = value;
            }
        }
        else if (proto === '[object Array]') {
            for (j = 0, k = data.length; j < k; j++) {
                value = list[data[j]];
                if (reviver)
                    value = reviver.call(data, j, value);
                data[j] = value;
            }
        }
    }
}
function stringifyCircularAutoChunks(data, replacer = null, space = null) {
    let result;
    try {
        result = arguments.length === 1
            ? JSON.stringify(data)
            // @ts-ignore
            : JSON.stringify(data, replacer, space);
    }
    catch (e) {
        result = stringifyStrictCircularAutoChunks(data, replacer, space);
    }
    if (result.length > MAX_SERIALIZED_SIZE) {
        const chunkCount = Math.ceil(result.length / MAX_SERIALIZED_SIZE);
        const chunks = [];
        for (let i = 0; i < chunkCount; i++) {
            chunks.push(result.slice(i * MAX_SERIALIZED_SIZE, (i + 1) * MAX_SERIALIZED_SIZE));
        }
        return chunks;
    }
    return result;
}
exports.stringifyCircularAutoChunks = stringifyCircularAutoChunks;
function parseCircularAutoChunks(data, reviver = null) {
    if (Array.isArray(data)) {
        data = data.join('');
    }
    const hasCircular = /^\s/.test(data);
    if (!hasCircular) {
        return arguments.length === 1
            ? JSON.parse(data)
            // @ts-ignore
            : JSON.parse(data, reviver);
    }
    else {
        const list = JSON.parse(data);
        decode(list, reviver);
        return list[0];
    }
}
exports.parseCircularAutoChunks = parseCircularAutoChunks;
function stringifyStrictCircularAutoChunks(data, replacer = null, space = null) {
    const list = [];
    encode(data, replacer, list, new Map());
    return space
        ? ' ' + JSON.stringify(list, null, space)
        : ' ' + JSON.stringify(list);
}
exports.stringifyStrictCircularAutoChunks = stringifyStrictCircularAutoChunks;
//# sourceMappingURL=transfer.js.map

/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(102), exports);
__exportStar(__webpack_require__(271), exports);
__exportStar(__webpack_require__(272), exports);
__exportStar(__webpack_require__(273), exports);
__exportStar(__webpack_require__(274), exports);
__exportStar(__webpack_require__(104), exports);
__exportStar(__webpack_require__(275), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppRecord = exports.getAppRecordId = exports.mapAppRecord = exports.selectApp = exports.registerApp = void 0;
const shared_utils_1 = __webpack_require__(1);
const app_backend_vue1_1 = __webpack_require__(279);
const app_backend_vue2_1 = __webpack_require__(280);
const app_backend_vue3_1 = __webpack_require__(281);
const availableBackends = [
    app_backend_vue1_1.backend,
    app_backend_vue2_1.backend,
    app_backend_vue3_1.backend
];
const enabledBackends = new Set();
let recordId = 0;
async function registerApp(options, ctx) {
    let record;
    const baseFrameworkVersion = parseInt(options.version.substr(0, options.version.indexOf('.')));
    for (let i = 0; i < availableBackends.length; i++) {
        const backend = availableBackends[i];
        if (backend.frameworkVersion === baseFrameworkVersion) {
            // Enabled backend
            if (!enabledBackends.has(backend)) {
                console.log('Enabling backend for Vue', backend.frameworkVersion);
                backend.setup(ctx.api);
                enabledBackends.add(backend);
            }
            // Create app record
            const id = getAppRecordId(options.app);
            const name = await ctx.api.getAppRecordName(options.app, id);
            record = {
                id,
                name,
                options,
                backend,
                lastInspectedComponentId: null,
                instanceMap: new Map(),
                rootInstance: await ctx.api.getAppRootInstance(options.app)
            };
            options.app.__VUE_DEVTOOLS_APP_RECORD__ = record;
            const rootId = `${record.id}:root`;
            record.instanceMap.set(rootId, record.rootInstance);
            record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId;
            await ctx.api.registerApplication(record);
            ctx.appRecords.push(record);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_ADD, {
                appRecord: mapAppRecord(record)
            });
            // Auto select first app
            if (ctx.currentAppRecord == null) {
                await selectApp(record, ctx);
            }
            break;
        }
    }
}
exports.registerApp = registerApp;
async function selectApp(record, ctx) {
    ctx.currentAppRecord = record;
    ctx.currentInspectedComponentId = record.lastInspectedComponentId;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_SELECTED, {
        id: record.id,
        lastInspectedComponentId: record.lastInspectedComponentId
    });
}
exports.selectApp = selectApp;
function mapAppRecord(record) {
    return {
        id: record.id,
        name: record.name,
        version: record.options.version
    };
}
exports.mapAppRecord = mapAppRecord;
function getAppRecordId(app) {
    if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
        return app.__VUE_DEVTOOLS_APP_RECORD_ID__;
    }
    const id = recordId++;
    app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id;
    return id;
}
exports.getAppRecordId = getAppRecordId;
function getAppRecord(app, ctx) {
    return ctx.appRecords.find(ar => ar.options.app === app);
}
exports.getAppRecord = getAppRecord;
//# sourceMappingURL=app.js.map

/***/ }),

/***/ 26:
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ 262:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _back__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(118);
/* harmony import */ var _back__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_back__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__);
// this is injected to the app page when the panel is activated.




window.addEventListener('message', handshake)

function sendListening () {
  window.postMessage({
    source: 'vue-devtools-backend-injection',
    payload: 'listening'
  }, '*')
}
sendListening()

function handshake (e) {
  if (e.data.source === 'vue-devtools-proxy' && e.data.payload === 'init') {
    window.removeEventListener('message', handshake)

    var listeners = []
    var bridge = new _utils_bridge__WEBPACK_IMPORTED_MODULE_1__["Bridge"]({
      listen (fn) {
        var listener = evt => {
          if (evt.data.source === 'vue-devtools-proxy' && evt.data.payload) {
            fn(evt.data.payload)
          }
        }
        window.addEventListener('message', listener)
        listeners.push(listener)
      },
      send (data) {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.log('[chrome] backend -> devtools', data)
        // }
        window.postMessage({
          source: 'vue-devtools-backend',
          payload: data
        }, '*')
      }
    })

    bridge.on('shutdown', () => {
      listeners.forEach(l => {
        window.removeEventListener('message', l)
      })
      listeners = []
    })

    Object(_back__WEBPACK_IMPORTED_MODULE_0__["initBackend"])(bridge)
  } else {
    sendListening()
  }
}


/***/ }),

/***/ 263:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.hook = exports.target = exports.isBrowser = void 0;
exports.isBrowser = typeof navigator !== 'undefined';
exports.target = exports.isBrowser
    ? window
    : typeof global !== 'undefined'
        ? global
        : {};
exports.hook = exports.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
//# sourceMappingURL=env.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5)))

/***/ }),

/***/ 264:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHookEvents = void 0;
var ApiHookEvents;
(function (ApiHookEvents) {
    ApiHookEvents["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
})(ApiHookEvents = exports.ApiHookEvents || (exports.ApiHookEvents = {}));
//# sourceMappingURL=const.js.map

/***/ }),

/***/ 265:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(266), exports);
__exportStar(__webpack_require__(267), exports);
__exportStar(__webpack_require__(268), exports);
__exportStar(__webpack_require__(269), exports);
__exportStar(__webpack_require__(270), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 266:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=api.js.map

/***/ }),

/***/ 267:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=app.js.map

/***/ }),

/***/ 268:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=component.js.map

/***/ }),

/***/ 269:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 27:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(26)))

/***/ }),

/***/ 270:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Hooks = void 0;
var Hooks;
(function (Hooks) {
    Hooks["TRANSFORM_CALL"] = "transformCall";
    Hooks["GET_APP_RECORD_NAME"] = "getAppRecordName";
    Hooks["GET_APP_ROOT_INSTANCE"] = "getAppRootInstance";
    Hooks["REGISTER_APPLICATION"] = "registerApplication";
    Hooks["WALK_COMPONENT_TREE"] = "walkComponentTree";
    Hooks["WALK_COMPONENT_PARENTS"] = "walkComponentParents";
    Hooks["INSPECT_COMPONENT"] = "inspectComponent";
    Hooks["GET_COMPONENT_BOUNDS"] = "getComponentBounds";
    Hooks["GET_COMPONENT_NAME"] = "getComponentName";
    Hooks["GET_ELEMENT_COMPONENT"] = "getElementComponent";
    Hooks["GET_INSPECTOR_TREE"] = "getInspectorTree";
    Hooks["GET_INSPECTOR_STATE"] = "getInspectorState";
})(Hooks = exports.Hooks || (exports.Hooks = {}));
//# sourceMappingURL=hooks.js.map

/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=app-record.js.map

/***/ }),

/***/ 272:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltinBackendFeature = void 0;
var BuiltinBackendFeature;
(function (BuiltinBackendFeature) {
    BuiltinBackendFeature["COMPONENTS"] = "components";
    BuiltinBackendFeature["EVENTS"] = "events";
    BuiltinBackendFeature["VUEX"] = "vuex";
})(BuiltinBackendFeature = exports.BuiltinBackendFeature || (exports.BuiltinBackendFeature = {}));
//# sourceMappingURL=backend.js.map

/***/ }),

/***/ 273:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackendContext = void 0;
const api_1 = __webpack_require__(102);
function createBackendContext(options) {
    const ctx = {
        bridge: options.bridge,
        hook: options.hook,
        api: null,
        appRecords: [],
        currentTab: null,
        currentAppRecord: null,
        currentInspectedComponentId: null,
        plugins: [],
        currentPlugin: null,
        timelineLayers: [],
        customInspectors: []
    };
    ctx.api = new api_1.DevtoolsApi(options.bridge, ctx);
    return ctx;
}
exports.createBackendContext = createBackendContext;
//# sourceMappingURL=backend-context.js.map

/***/ }),

/***/ 274:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=global-hook.js.map

/***/ }),

/***/ 275:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=plugin.js.map

/***/ }),

/***/ 276:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubscribed = exports.unsubscribe = exports.subscribe = void 0;
const activeSubs = new Map();
function getSubs(type) {
    let subs = activeSubs.get(type);
    if (!subs) {
        subs = [];
        activeSubs.set(type, subs);
    }
    return subs;
}
function subscribe(type, payload) {
    const rawPayload = JSON.stringify(payload);
    getSubs(type).push({
        payload,
        rawPayload
    });
}
exports.subscribe = subscribe;
function unsubscribe(type, payload) {
    const rawPayload = JSON.stringify(payload);
    const subs = getSubs(type);
    const index = subs.findIndex(sub => sub.rawPayload === rawPayload);
    if (index !== -1) {
        subs.splice(index, 1);
    }
}
exports.unsubscribe = unsubscribe;
function isSubscribed(type, predicate = () => true) {
    return getSubs(type).some(predicate);
}
exports.isSubscribed = isSubscribed;
//# sourceMappingURL=subscriptions.js.map

/***/ }),

/***/ 277:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueue = void 0;
class JobQueue {
    constructor() {
        this.jobs = [];
    }
    queue(job) {
        return new Promise(resolve => {
            const onDone = () => {
                this.currentJob = null;
                const nextJob = this.jobs.shift();
                if (nextJob) {
                    nextJob();
                }
                resolve();
            };
            const run = () => {
                this.currentJob = job;
                return job().then(onDone);
            };
            if (this.currentJob) {
                this.jobs.push(() => run());
            }
            else {
                run();
            }
        });
    }
}
exports.JobQueue = JobQueue;
//# sourceMappingURL=queue.js.map

/***/ }),

/***/ 278:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTimelineLayers = exports.setupTimeline = void 0;
const shared_utils_1 = __webpack_require__(1);
const global_hook_1 = __webpack_require__(105);
const app_1 = __webpack_require__(25);
function setupTimeline(ctx) {
    setupBuiltinLayers(ctx);
}
exports.setupTimeline = setupTimeline;
function setupBuiltinLayers(ctx) {
    ;
    ['mousedown', 'mouseup', 'click', 'dblclick'].forEach(eventType => {
        // @ts-ignore
        window.addEventListener(eventType, (event) => {
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
                appId: 'all',
                layerId: 'mouse',
                event: {
                    time: Date.now(),
                    data: shared_utils_1.stringify({
                        type: eventType,
                        x: event.clientX,
                        y: event.clientY
                    })
                }
            });
        }, {
            capture: true,
            passive: true
        });
    });
    ['keyup', 'keydown', 'keypress'].forEach(eventType => {
        // @ts-ignore
        window.addEventListener(eventType, (event) => {
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
                appId: 'all',
                layerId: 'keyboard',
                event: {
                    time: Date.now(),
                    data: shared_utils_1.stringify({
                        type: eventType,
                        code: event.keyCode,
                        key: event.key,
                        ctrlKey: event.ctrlKey,
                        shiftKey: event.shiftKey,
                        altKey: event.altKey,
                        metaKey: event.metaKey
                    })
                }
            });
        }, {
            capture: true,
            passive: true
        });
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
        const appRecord = app_1.getAppRecord(app, ctx);
        const id = `${appRecord.id}:${instance.uid}`;
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
            appId: appRecord.id,
            layerId: 'component-event',
            event: {
                time: Date.now(),
                data: shared_utils_1.stringify({
                    component: {
                        _custom: {
                            type: 'component-definition',
                            display: (await ctx.api.getComponentName(instance)) || '<i>Unknown Component</i>'
                        }
                    },
                    event,
                    params
                }),
                meta: {
                    componentId: id
                }
            }
        });
    });
}
function sendTimelineLayers(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, {
        layers: ctx.timelineLayers.map(layer => {
            var _a;
            return ({
                id: layer.id,
                label: layer.label,
                color: layer.color,
                appId: (_a = app_1.getAppRecord(layer.app, ctx)) === null || _a === void 0 ? void 0 : _a.id
            });
        })
    });
}
exports.sendTimelineLayers = sendTimelineLayers;
//# sourceMappingURL=timeline.js.map

/***/ }),

/***/ 279:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.backend = void 0;
const app_backend_api_1 = __webpack_require__(24);
exports.backend = {
    frameworkVersion: 1,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS
    ],
    setup(api) {
        // @TODO
    }
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 280:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.backend = void 0;
const app_backend_api_1 = __webpack_require__(24);
exports.backend = {
    frameworkVersion: 2,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app.name) {
                payload.name = payload.app.name;
            }
        });
        // @TODO
    }
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 281:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.backend = void 0;
const app_backend_api_1 = __webpack_require__(24);
const tree_1 = __webpack_require__(282);
const data_1 = __webpack_require__(285);
const util_1 = __webpack_require__(36);
const el_1 = __webpack_require__(286);
const shared_utils_1 = __webpack_require__(1);
exports.backend = {
    frameworkVersion: 3,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app._component) {
                payload.name = payload.app._component.name;
            }
        });
        api.on.getAppRootInstance(payload => {
            var _a, _b, _c, _d;
            if ((_b = (_a = payload.app._container) === null || _a === void 0 ? void 0 : _a._vnode) === null || _b === void 0 ? void 0 : _b.component) {
                payload.root = (_d = (_c = payload.app._container) === null || _c === void 0 ? void 0 : _c._vnode) === null || _d === void 0 ? void 0 : _d.component;
            }
        });
        api.on.walkComponentTree((payload, ctx) => {
            const walker = new tree_1.ComponentWalker(payload.maxDepth, payload.filter, ctx);
            payload.componentTreeData = walker.getComponentTree(payload.componentInstance);
        });
        api.on.walkComponentParents((payload, ctx) => {
            const walker = new tree_1.ComponentWalker(0, null, ctx);
            payload.parentInstances = walker.getComponentParents(payload.componentInstance);
        });
        api.on.inspectComponent(async (payload, ctx) => {
            payload.instanceData = await data_1.getInstanceDetails(payload.componentInstance, ctx);
        });
        api.on.getComponentName(async (payload) => {
            payload.name = await util_1.getInstanceName(payload.componentInstance);
        });
        api.on.getComponentBounds(async (payload) => {
            payload.bounds = await util_1.getInstanceOrVnodeRect(payload.componentInstance);
        });
        api.on.getElementComponent(payload => {
            payload.componentInstance = el_1.getComponentInstanceFromElement(payload.element);
        });
        api.on.transformCall(payload => {
            if (payload.callName === shared_utils_1.HookEvents.COMPONENT_UPDATED) {
                const component = payload.inArgs[0];
                payload.outArgs = [
                    component.appContext.app,
                    component.uid,
                    component.parent ? component.parent.uid : undefined
                ];
            }
        });
        // @TODO
    }
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 282:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentWalker = void 0;
const util_1 = __webpack_require__(36);
const filter_1 = __webpack_require__(284);
class ComponentWalker {
    constructor(maxDepth, filter, ctx) {
        this.ctx = ctx;
        this.maxDepth = maxDepth;
        this.componentFilter = new filter_1.ComponentFilter(filter);
    }
    getComponentTree(instance) {
        this.captureIds = new Map();
        return this.findQualifiedChildren(instance, 0);
    }
    getComponentParents(instance) {
        this.captureIds = new Map();
        const parents = [];
        this.captureId(instance);
        let parent = instance;
        while ((parent = parent.parent)) {
            this.captureId(parent);
            parents.push(parent);
        }
        return parents;
    }
    /**
     * Find qualified children from a single instance.
     * If the instance itself is qualified, just return itself.
     * This is ok because [].concat works in both cases.
     *
     * @param {Vue|Vnode} instance
     * @return {Vue|Array}
     */
    findQualifiedChildren(instance, depth) {
        if (this.componentFilter.isQualified(instance)) {
            return this.capture(instance, null, depth);
        }
        else if (instance.subTree) {
            // TODO functional components
            return this.findQualifiedChildrenFromList(this.getInternalInstanceChildren(instance.subTree), depth);
        }
        else {
            return [];
        }
    }
    /**
     * Iterate through an array of instances and flatten it into
     * an array of qualified instances. This is a depth-first
     * traversal - e.g. if an instance is not matched, we will
     * recursively go deeper until a qualified child is found.
     *
     * @param {Array} instances
     * @return {Array}
     */
    findQualifiedChildrenFromList(instances, depth) {
        instances = instances
            .filter(child => !util_1.isBeingDestroyed(child));
        return !this.componentFilter.filter
            ? instances.map((child, index, list) => this.capture(child, list, depth))
            : Array.prototype.concat.apply([], instances.map(i => this.findQualifiedChildren(i, depth)));
    }
    /**
     * Get children from a component instance.
     */
    getInternalInstanceChildren(subTree) {
        if (Array.isArray(subTree.children)) {
            const list = [];
            subTree.children.forEach(childSubTree => {
                if (childSubTree.component) {
                    list.push(childSubTree.component);
                }
                else {
                    list.push(...this.getInternalInstanceChildren(childSubTree));
                }
            });
            return list;
        }
        else if (subTree.component) {
            return [subTree.component];
        }
        return [];
    }
    captureId(instance) {
        // instance.uid is not reliable in devtools as there
        // may be 2 roots with same uid which causes unexpected
        // behaviour
        const id = instance.__VUE_DEVTOOLS_UID__ != null ? instance.__VUE_DEVTOOLS_UID__ : util_1.getUniqueComponentId(instance, this.ctx);
        instance.__VUE_DEVTOOLS_UID__ = id;
        // Dedupe
        if (this.captureIds.has(id)) {
            return;
        }
        else {
            this.captureIds.set(id, undefined);
        }
        this.mark(instance);
        return id;
    }
    /**
     * Capture the meta information of an instance. (recursive)
     *
     * @param {Vue} instance
     * @return {Object}
     */
    capture(instance, list, depth) {
        const id = this.captureId(instance);
        const name = util_1.getInstanceName(instance);
        const children = this.getInternalInstanceChildren(instance.subTree)
            .filter(child => !util_1.isBeingDestroyed(child));
        const ret = {
            uid: instance.uid,
            id,
            name,
            renderKey: util_1.getRenderKey(instance.vnode ? instance.vnode.key : null),
            inactive: !!instance.isDeactivated,
            hasChildren: !!children.length,
            children: [],
            isFragment: util_1.isFragment(instance)
        };
        // capture children
        if (depth < this.maxDepth) {
            ret.children = children
                .map((child, index, list) => this.capture(child, list, depth + 1))
                .filter(Boolean);
        }
        // record screen position to ensure correct ordering
        if ((!list || list.length > 1) && !instance._inactive) {
            const rect = util_1.getInstanceOrVnodeRect(instance);
            ret.positionTop = rect ? rect.positionTop : Infinity;
        }
        return ret;
    }
    /**
     * Mark an instance as captured and store it in the instance map.
     *
     * @param {Vue} instance
     */
    mark(instance) {
        const instanceMap = this.ctx.currentAppRecord.instanceMap;
        if (!instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
            instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance);
        }
    }
}
exports.ComponentWalker = ComponentWalker;
//# sourceMappingURL=tree.js.map

/***/ }),

/***/ 283:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.basename = exports.flatten = void 0;
const path_1 = __importDefault(__webpack_require__(27));
function flatten(items) {
    return items.reduce((acc, item) => {
        if (item instanceof Array)
            acc.push(...flatten(item));
        else if (item)
            acc.push(item);
        return acc;
    }, []);
}
exports.flatten = flatten;
// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename(filename, ext) {
    return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}
exports.basename = basename;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 284:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentFilter = void 0;
const shared_utils_1 = __webpack_require__(1);
const util_1 = __webpack_require__(36);
class ComponentFilter {
    constructor(filter) {
        this.filter = filter || '';
    }
    /**
     * Check if an instance is qualified.
     *
     * @param {Vue|Vnode} instance
     * @return {Boolean}
     */
    isQualified(instance) {
        const name = shared_utils_1.classify(instance.name || util_1.getInstanceName(instance)).toLowerCase();
        return name.indexOf(this.filter) > -1;
    }
}
exports.ComponentFilter = ComponentFilter;
//# sourceMappingURL=filter.js.map

/***/ }),

/***/ 285:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceDetails = void 0;
const util_1 = __webpack_require__(36);
const shared_utils_1 = __webpack_require__(1);
const shared_data_1 = __importDefault(__webpack_require__(7));
/**
 * Get the detailed information of an inspected instance.
 */
async function getInstanceDetails(instance, ctx) {
    var _a;
    console.log(instance);
    return {
        id: instance.id,
        name: util_1.getInstanceName(instance),
        file: (_a = instance.type) === null || _a === void 0 ? void 0 : _a.__file,
        state: await getInstanceState(instance)
    };
}
exports.getInstanceDetails = getInstanceDetails;
async function getInstanceState(instance) {
    return processProps(instance).concat(processState(instance), processSetupState(instance), processComputed(instance));
}
/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processProps(instance) {
    const propsData = [];
    const propDefinitions = instance.type.props;
    for (let key in instance.props) {
        const propDefinition = propDefinitions ? propDefinitions[key] : null;
        key = shared_utils_1.camelize(key);
        propsData.push({
            type: 'props',
            key,
            value: instance.props[key],
            meta: propDefinition ? {
                type: propDefinition.type ? getPropType(propDefinition.type) : 'any',
                required: !!propDefinition.required,
                ...propDefinition.default != null ? {
                    default: propDefinition.default.toString()
                } : {}
            } : {
                type: 'invalid'
            },
            editable: shared_data_1.default.editableProps
        });
    }
    return propsData;
}
const fnTypeRE = /^(?:function|class) (\w+)/;
/**
 * Convert prop type constructor to string.
 */
function getPropType(type) {
    const match = type.toString().match(fnTypeRE);
    return typeof type === 'function'
        ? (match && match[1]) || 'any'
        : 'any';
}
/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processState(instance) {
    const type = instance.type;
    const props = type.props;
    const getters = type.vuex &&
        type.vuex.getters;
    const computedDefs = type.computed;
    const data = {
        ...instance.data,
        ...instance.renderContext
    };
    return Object.keys(data)
        .filter(key => (!(props && key in props) &&
        !(getters && key in getters) &&
        !(computedDefs && key in computedDefs)))
        .map(key => ({
        key,
        value: data[key],
        editable: false
    }));
}
function processSetupState(instance) {
    const raw = instance.devtoolsRawSetupState || {};
    return Object.keys(instance.setupState)
        .map(key => ({
        key,
        type: 'setup',
        value: instance.setupState[key],
        editable: false,
        ...getSetupStateExtra(raw[key])
    }));
}
function getSetupStateExtra(raw) {
    if (!raw)
        return {};
    const isRef = !!raw.__v_isRef;
    const isComputed = isRef && !!raw.effect;
    const isReactive = !!raw.__v_reactive;
    const objectType = isComputed ? 'Computed' : isRef ? 'Ref' : isReactive ? 'Reactive' : null;
    return {
        ...objectType ? { objectType } : {},
        ...raw.effect ? { raw: raw.effect.raw.toString() } : {}
    };
}
/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processComputed(instance) {
    const type = instance.type;
    const computed = [];
    const defs = type.computed || {};
    // use for...in here because if 'computed' is not defined
    // on component, computed properties will be placed in prototype
    // and Object.keys does not include
    // properties from object's prototype
    for (const key in defs) {
        const def = defs[key];
        const type = typeof def === 'function' && def.vuex
            ? 'vuex bindings'
            : 'computed';
        // use try ... catch here because some computed properties may
        // throw error during its evaluation
        let computedProp = null;
        try {
            computedProp = {
                type,
                key,
                value: instance.proxy[key]
            };
        }
        catch (e) {
            computedProp = {
                type,
                key,
                value: '(error during evaluation)'
            };
        }
        computed.push(computedProp);
    }
    return computed;
}
//# sourceMappingURL=data.js.map

/***/ }),

/***/ 286:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentInstanceFromElement = void 0;
function getComponentInstanceFromElement(element) {
    return element.__vueParentComponent;
}
exports.getComponentInstanceFromElement = getComponentInstanceFromElement;
//# sourceMappingURL=el.js.map

/***/ }),

/***/ 287:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const shared_utils_1 = __webpack_require__(1);
const highlighter_1 = __webpack_require__(106);
class ComponentPicker {
    constructor(ctx) {
        this.ctx = ctx;
        this.bindMethods();
    }
    /**
     * Adds event listeners for mouseover and mouseup
     */
    startSelecting() {
        if (!shared_utils_1.isBrowser)
            return;
        window.addEventListener('mouseover', this.elementMouseOver, true);
        window.addEventListener('click', this.elementClicked, true);
        window.addEventListener('mouseout', this.cancelEvent, true);
        window.addEventListener('mouseenter', this.cancelEvent, true);
        window.addEventListener('mouseleave', this.cancelEvent, true);
        window.addEventListener('mousedown', this.cancelEvent, true);
        window.addEventListener('mouseup', this.cancelEvent, true);
    }
    /**
     * Removes event listeners
     */
    stopSelecting() {
        if (!shared_utils_1.isBrowser)
            return;
        window.removeEventListener('mouseover', this.elementMouseOver, true);
        window.removeEventListener('click', this.elementClicked, true);
        window.removeEventListener('mouseout', this.cancelEvent, true);
        window.removeEventListener('mouseenter', this.cancelEvent, true);
        window.removeEventListener('mouseleave', this.cancelEvent, true);
        window.removeEventListener('mousedown', this.cancelEvent, true);
        window.removeEventListener('mouseup', this.cancelEvent, true);
        highlighter_1.unHighlight();
    }
    /**
     * Highlights a component on element mouse over
     */
    async elementMouseOver(e) {
        this.cancelEvent(e);
        const el = e.target;
        if (el) {
            this.selectedInstance = await this.ctx.api.getElementComponent(el);
        }
        highlighter_1.unHighlight();
        if (this.selectedInstance) {
            highlighter_1.highlight(this.selectedInstance, this.ctx);
        }
    }
    /**
     * Selects an instance in the component view
     */
    async elementClicked(e) {
        this.cancelEvent(e);
        if (this.selectedInstance) {
            const parentInstances = await this.ctx.api.walkComponentParents(this.selectedInstance);
            this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK, { id: this.selectedInstance.__VUE_DEVTOOLS_UID__, parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__) });
        }
        else {
            this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK_CANCELED, null);
        }
        this.stopSelecting();
    }
    /**
     * Cancel a mouse event
     */
    cancelEvent(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
    /**
     * Bind class methods to the class scope to avoid rebind for event listeners
     */
    bindMethods() {
        this.startSelecting = this.startSelecting.bind(this);
        this.stopSelecting = this.stopSelecting.bind(this);
        this.elementMouseOver = this.elementMouseOver.bind(this);
        this.elementClicked = this.elementClicked.bind(this);
    }
}
exports.default = ComponentPicker;
//# sourceMappingURL=component-pick.js.map

/***/ }),

/***/ 288:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentId = exports.sendEmptyComponentData = exports.sendSelectedComponentData = exports.sendComponentTreeData = void 0;
const shared_utils_1 = __webpack_require__(1);
const app_1 = __webpack_require__(25);
async function sendComponentTreeData(instanceId, filter = '', ctx) {
    if (!instanceId)
        return;
    if (filter)
        filter = filter.toLowerCase();
    const instance = ctx.currentAppRecord.instanceMap.get(instanceId);
    if (!instance) {
        console.warn(`Instance uid=${instanceId} not found`);
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, {
            instanceId,
            treeData: null,
            notFound: true
        });
    }
    else {
        const maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1;
        const payload = {
            instanceId,
            treeData: shared_utils_1.stringify(await ctx.api.walkComponentTree(instance, maxDepth, filter))
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, payload);
    }
}
exports.sendComponentTreeData = sendComponentTreeData;
async function sendSelectedComponentData(instanceId, ctx) {
    if (!instanceId)
        return;
    const instance = ctx.currentAppRecord.instanceMap.get(instanceId);
    if (!instance) {
        console.warn(`Instance uid=${instanceId} not found`);
        sendEmptyComponentData(instanceId, ctx);
    }
    else {
        ctx.currentInspectedComponentId = instanceId;
        ctx.currentAppRecord.lastInspectedComponentId = instanceId;
        const payload = {
            instanceId,
            data: shared_utils_1.stringify(await ctx.api.inspectComponent(instance))
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload);
    }
}
exports.sendSelectedComponentData = sendSelectedComponentData;
function sendEmptyComponentData(instanceId, ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
        instanceId,
        data: null
    });
}
exports.sendEmptyComponentData = sendEmptyComponentData;
function getComponentId(app, uid, ctx) {
    const appRecord = app_1.getAppRecord(app, ctx);
    if (!appRecord)
        return null;
    return `${appRecord.id}:${uid === 0 ? 'root' : uid}`;
}
exports.getComponentId = getComponentId;
//# sourceMappingURL=component.js.map

/***/ }),

/***/ 289:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePlugin = exports.sendPluginList = exports.addQueuedPlugins = exports.addPlugin = void 0;
const app_backend_api_1 = __webpack_require__(24);
const shared_utils_1 = __webpack_require__(1);
const app_1 = __webpack_require__(25);
function addPlugin(pluginDescriptor, setupFn, ctx) {
    const plugin = {
        descriptor: pluginDescriptor,
        setupFn,
        error: null
    };
    ctx.currentPlugin = plugin;
    try {
        const api = new app_backend_api_1.DevtoolsPluginApiInstance(plugin, ctx);
        setupFn(api);
    }
    catch (e) {
        plugin.error = e;
        console.error(e);
    }
    ctx.currentPlugin = null;
    ctx.plugins.push(plugin);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
        plugin: serializePlugin(plugin)
    });
}
exports.addPlugin = addPlugin;
async function addQueuedPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__)) {
        for (const k in shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__) {
            const plugin = shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__[k];
            addPlugin(plugin.pluginDescriptor, plugin.setupFn, ctx);
        }
        shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ = null;
    }
}
exports.addQueuedPlugins = addQueuedPlugins;
function sendPluginList(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
        plugins: ctx.plugins.map(p => serializePlugin(p))
    });
}
exports.sendPluginList = sendPluginList;
function serializePlugin(plugin) {
    return {
        id: plugin.descriptor.id,
        label: plugin.descriptor.label,
        appId: app_1.getAppRecordId(plugin.descriptor.app)
    };
}
exports.serializePlugin = serializePlugin;
//# sourceMappingURL=plugin.js.map

/***/ }),

/***/ 290:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInspectorState = exports.sendInspectorTree = exports.getInspectorWithAppId = exports.getInspector = void 0;
const shared_utils_1 = __webpack_require__(1);
const app_1 = __webpack_require__(25);
function getInspector(inspectorId, app, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && i.app === app);
}
exports.getInspector = getInspector;
function getInspectorWithAppId(inspectorId, appId, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && app_1.getAppRecordId(i.app) === appId);
}
exports.getInspectorWithAppId = getInspectorWithAppId;
async function sendInspectorTree(inspector, ctx) {
    const rootNodes = await ctx.api.getInspectorTree(inspector.id, inspector.app, inspector.treeFilter);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        rootNodes
    });
}
exports.sendInspectorTree = sendInspectorTree;
async function sendInspectorState(inspector, ctx) {
    const state = inspector.selectedNodeId ? await ctx.api.getInspectorState(inspector.id, inspector.app, inspector.selectedNodeId) : null;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        state: shared_utils_1.stringify(state)
    });
}
exports.sendInspectorState = sendInspectorState;
//# sourceMappingURL=inspector.js.map

/***/ }),

/***/ 36:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceOrVnodeRect = exports.getRenderKey = exports.getUniqueComponentId = exports.getInstanceName = exports.isFragment = exports.getAppRecord = exports.isBeingDestroyed = void 0;
const shared_utils_1 = __webpack_require__(1);
const util_1 = __webpack_require__(283);
function isBeingDestroyed(instance) {
    return instance._isBeingDestroyed || instance.isUnmounted;
}
exports.isBeingDestroyed = isBeingDestroyed;
function getAppRecord(instance) {
    if (instance.root) {
        return instance.appContext.app.__VUE_DEVTOOLS_APP_RECORD__;
    }
}
exports.getAppRecord = getAppRecord;
function isFragment(instance) {
    const appRecord = getAppRecord(instance);
    if (appRecord) {
        return appRecord.options.types.Fragment === instance.subTree.type;
    }
}
exports.isFragment = isFragment;
/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
function getInstanceName(instance) {
    const name = getComponentTypeName(instance.type || {});
    if (name)
        return name;
    return instance.root === instance
        ? 'Root'
        : 'Anonymous Component';
}
exports.getInstanceName = getInstanceName;
function getComponentTypeName(options) {
    const name = options.name || options._componentTag;
    if (name) {
        return name;
    }
    const file = options.__file; // injected by vue-loader
    if (file) {
        return shared_utils_1.classify(util_1.basename(file, '.vue'));
    }
}
/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
function getUniqueComponentId(instance, ctx) {
    const instanceId = instance === ctx.currentAppRecord.rootInstance ? 'root' : instance.uid;
    return `${ctx.currentAppRecord.id}:${instanceId}`;
}
exports.getUniqueComponentId = getUniqueComponentId;
function getRenderKey(value) {
    if (value == null)
        return;
    const type = typeof value;
    if (type === 'number') {
        return value;
    }
    else if (type === 'string') {
        return `'${value}'`;
    }
    else if (Array.isArray(value)) {
        return 'Array';
    }
    else {
        return 'Object';
    }
}
exports.getRenderKey = getRenderKey;
/**
 * Get the client rect for an instance.
 *
 * @param {Vue|Vnode} instance
 * @return {Object}
 */
function getInstanceOrVnodeRect(instance) {
    const el = instance.subTree.el;
    if (!shared_utils_1.isBrowser) {
        // @TODO: Find position from instance or a vnode (for functional components).
        return;
    }
    if (!shared_utils_1.inDoc(el)) {
        return;
    }
    if (isFragment(instance)) {
        return getFragmentRect(instance.subTree);
    }
    else if (el.nodeType === 1) {
        return el.getBoundingClientRect();
    }
}
exports.getInstanceOrVnodeRect = getInstanceOrVnodeRect;
function createRect() {
    const rect = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        get width() { return rect.right - rect.left; },
        get height() { return rect.bottom - rect.top; }
    };
    return rect;
}
function mergeRects(a, b) {
    if (!a.top || b.top < a.top) {
        a.top = b.top;
    }
    if (!a.bottom || b.bottom > a.bottom) {
        a.bottom = b.bottom;
    }
    if (!a.left || b.left < a.left) {
        a.left = b.left;
    }
    if (!a.right || b.right > a.right) {
        a.right = b.right;
    }
}
let range;
/**
 * Get the bounding rect for a text node using a Range.
 *
 * @param {Text} node
 * @return {Rect}
 */
function getTextRect(node) {
    if (!shared_utils_1.isBrowser)
        return;
    if (!range)
        range = document.createRange();
    range.selectNode(node);
    return range.getBoundingClientRect();
}
function getFragmentRect(vnode) {
    const rect = createRect();
    if (!vnode.children)
        return rect;
    for (let i = 0, l = vnode.children.length; i < l; i++) {
        const childVnode = vnode.children[i];
        let childRect;
        if (childVnode.component) {
            childRect = getInstanceOrVnodeRect(childVnode.component);
        }
        else if (childVnode.el) {
            const el = childVnode.el;
            if (el.nodeType === 1 || el.getBoundingClientRect) {
                childRect = el.getBoundingClientRect();
            }
            else if (el.nodeType === 3 && el.data.trim()) {
                childRect = getTextRect(el);
            }
        }
        if (childRect) {
            mergeRects(rect, childRect);
        }
    }
    return rect;
}
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToClipboard = exports.escape = exports.openInEditor = exports.focusInput = exports.scrollIntoView = exports.has = exports.get = exports.set = exports.sortByKey = exports.searchDeepInObject = exports.isPlainObject = exports.parse = exports.getCustomRefDetails = exports.getCustomFunctionDetails = exports.getCustomComponentDefinitionDetails = exports.getComponentName = exports.reviveSet = exports.getCustomSetDetails = exports.reviveMap = exports.getCustomMapDetails = exports.stringify = exports.specialTokenToString = exports.MAX_ARRAY_SIZE = exports.MAX_STRING_SIZE = exports.SPECIAL_TOKENS = exports.NAN = exports.NEGATIVE_INFINITY = exports.INFINITY = exports.UNDEFINED = exports.inDoc = exports.getComponentDisplayName = exports.kebabize = exports.camelize = exports.classify = void 0;
const path_1 = __importDefault(__webpack_require__(27));
const transfer_1 = __webpack_require__(20);
const backend_1 = __webpack_require__(19);
const shared_data_1 = __importDefault(__webpack_require__(7));
const env_1 = __webpack_require__(6);
function cached(fn) {
    const cache = Object.create(null);
    return function cachedFn(str) {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}
const classifyRE = /(?:^|[-_/])(\w)/g;
exports.classify = cached((str) => {
    return str && str.replace(classifyRE, toUpper);
});
const camelizeRE = /-(\w)/g;
exports.camelize = cached((str) => {
    return str.replace(camelizeRE, toUpper);
});
const kebabizeRE = /([a-z0-9])([A-Z])/g;
exports.kebabize = cached((str) => {
    return str && str
        .replace(kebabizeRE, (_, lowerCaseCharacter, upperCaseLetter) => {
        return `${lowerCaseCharacter}-${upperCaseLetter}`;
    })
        .toLowerCase();
});
function toUpper(_, c) {
    return c ? c.toUpperCase() : '';
}
function getComponentDisplayName(originalName, style = 'class') {
    switch (style) {
        case 'class':
            return exports.classify(originalName);
        case 'kebab':
            return exports.kebabize(originalName);
        case 'original':
        default:
            return originalName;
    }
}
exports.getComponentDisplayName = getComponentDisplayName;
function inDoc(node) {
    if (!node)
        return false;
    const doc = node.ownerDocument.documentElement;
    const parent = node.parentNode;
    return doc === node ||
        doc === parent ||
        !!(parent && parent.nodeType === 1 && (doc.contains(parent)));
}
exports.inDoc = inDoc;
/**
 * Stringify/parse data using CircularJSON.
 */
exports.UNDEFINED = '__vue_devtool_undefined__';
exports.INFINITY = '__vue_devtool_infinity__';
exports.NEGATIVE_INFINITY = '__vue_devtool_negative_infinity__';
exports.NAN = '__vue_devtool_nan__';
exports.SPECIAL_TOKENS = {
    true: true,
    false: false,
    undefined: exports.UNDEFINED,
    null: null,
    '-Infinity': exports.NEGATIVE_INFINITY,
    Infinity: exports.INFINITY,
    NaN: exports.NAN
};
exports.MAX_STRING_SIZE = 10000;
exports.MAX_ARRAY_SIZE = 5000;
function specialTokenToString(value) {
    if (value === null) {
        return 'null';
    }
    else if (value === exports.UNDEFINED) {
        return 'undefined';
    }
    else if (value === exports.NAN) {
        return 'NaN';
    }
    else if (value === exports.INFINITY) {
        return 'Infinity';
    }
    else if (value === exports.NEGATIVE_INFINITY) {
        return '-Infinity';
    }
    return false;
}
exports.specialTokenToString = specialTokenToString;
/**
 * Needed to prevent stack overflow
 * while replacing complex objects
 * like components because we create
 * new objects with the CustomValue API
 * (.i.e `{ _custom: { ... } }`)
 */
class EncodeCache {
    constructor() {
        this.map = new Map();
    }
    /**
     * Returns a result unique to each input data
     * @param {*} data Input data
     * @param {*} factory Function used to create the unique result
     */
    cache(data, factory) {
        const cached = this.map.get(data);
        if (cached) {
            return cached;
        }
        else {
            const result = factory(data);
            this.map.set(data, result);
            return result;
        }
    }
    clear() {
        this.map.clear();
    }
}
const encodeCache = new EncodeCache();
function stringify(data) {
    // Create a fresh cache for each serialization
    encodeCache.clear();
    return transfer_1.stringifyCircularAutoChunks(data, replacer);
}
exports.stringify = stringify;
function replacer(key) {
    // @ts-ignore
    const val = this[key];
    const type = typeof val;
    if (Array.isArray(val)) {
        const l = val.length;
        if (l > exports.MAX_ARRAY_SIZE) {
            return {
                _isArray: true,
                length: l,
                items: val.slice(0, exports.MAX_ARRAY_SIZE)
            };
        }
        return val;
    }
    else if (typeof val === 'string') {
        if (val.length > exports.MAX_STRING_SIZE) {
            return val.substr(0, exports.MAX_STRING_SIZE) + `... (${(val.length)} total length)`;
        }
        else {
            return val;
        }
    }
    else if (type === 'undefined') {
        return exports.UNDEFINED;
    }
    else if (val === Infinity) {
        return exports.INFINITY;
    }
    else if (val === -Infinity) {
        return exports.NEGATIVE_INFINITY;
    }
    else if (type === 'function') {
        return getCustomFunctionDetails(val);
    }
    else if (type === 'symbol') {
        return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
    }
    else if (val !== null && type === 'object') {
        const proto = Object.prototype.toString.call(val);
        if (proto === '[object Map]') {
            return encodeCache.cache(val, () => getCustomMapDetails(val));
        }
        else if (proto === '[object Set]') {
            return encodeCache.cache(val, () => getCustomSetDetails(val));
        }
        else if (proto === '[object RegExp]') {
            // special handling of native type
            return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
        }
        else if (proto === '[object Date]') {
            return `[native Date ${Date.prototype.toString.call(val)}]`;
        }
        else if (proto === '[object Error]') {
            return `[native Error ${val.message}]`;
        }
        else if (val.state && val._vm) {
            return encodeCache.cache(val, () => backend_1.getCustomStoreDetails(val));
        }
        else if (val.constructor && val.constructor.name === 'VueRouter') {
            return encodeCache.cache(val, () => backend_1.getCustomRouterDetails(val));
        }
        else if (val._isVue) {
            return encodeCache.cache(val, () => backend_1.getCustomInstanceDetails(val));
        }
        else if (typeof val.render === 'function') {
            return encodeCache.cache(val, () => getCustomComponentDefinitionDetails(val));
        }
        else if (val.constructor && val.constructor.name === 'VNode') {
            return `[native VNode <${val.tag}>]`;
        }
    }
    else if (Number.isNaN(val)) {
        return exports.NAN;
    }
    return sanitize(val);
}
function getCustomMapDetails(val) {
    const list = [];
    val.forEach((value, key) => list.push({
        key,
        value
    }));
    return {
        _custom: {
            type: 'map',
            display: 'Map',
            value: list,
            readOnly: true,
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomMapDetails = getCustomMapDetails;
function reviveMap(val) {
    const result = new Map();
    const list = val._custom.value;
    for (let i = 0; i < list.length; i++) {
        const { key, value } = list[i];
        result.set(key, reviver(null, value));
    }
    return result;
}
exports.reviveMap = reviveMap;
function getCustomSetDetails(val) {
    const list = Array.from(val);
    return {
        _custom: {
            type: 'set',
            display: `Set[${list.length}]`,
            value: list,
            readOnly: true
        }
    };
}
exports.getCustomSetDetails = getCustomSetDetails;
function reviveSet(val) {
    const result = new Set();
    const list = val._custom.value;
    for (let i = 0; i < list.length; i++) {
        const value = list[i];
        result.add(reviver(null, value));
    }
    return result;
}
exports.reviveSet = reviveSet;
// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename(filename, ext) {
    return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}
function getComponentName(options) {
    const name = options.name || options._componentTag;
    if (name) {
        return name;
    }
    const file = options.__file; // injected by vue-loader
    if (file) {
        return exports.classify(basename(file, '.vue'));
    }
}
exports.getComponentName = getComponentName;
function getCustomComponentDefinitionDetails(def) {
    let display = getComponentName(def);
    if (display) {
        if (def.name && def.__file) {
            display += ` <span>(${def.__file})</span>`;
        }
    }
    else {
        display = '<i>Unknown Component</i>';
    }
    return {
        _custom: {
            type: 'component-definition',
            display,
            tooltip: 'Component definition',
            ...def.__file ? {
                file: def.__file
            } : {}
        }
    };
}
exports.getCustomComponentDefinitionDetails = getCustomComponentDefinitionDetails;
function getCustomFunctionDetails(func) {
    let string = '';
    let matches = null;
    try {
        string = Function.prototype.toString.call(func);
        matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
    }
    catch (e) {
        // Func is probably a Proxy, which can break Function.prototype.toString()
    }
    // Trim any excess whitespace from the argument string
    const match = matches && matches[0];
    const args = typeof match === 'string'
        ? `(${match.substr(1, match.length - 2).split(',').map(a => a.trim()).join(', ')})` : '(?)';
    const name = typeof func.name === 'string' ? func.name : '';
    return {
        _custom: {
            type: 'function',
            display: `<span>ƒ</span> ${escape(name)}${args}`
        }
    };
}
exports.getCustomFunctionDetails = getCustomFunctionDetails;
function getCustomRefDetails(instance, key, ref) {
    let value;
    if (Array.isArray(ref)) {
        value = ref.map((r) => getCustomRefDetails(instance, key, r)).map(data => data.value);
    }
    else {
        let name;
        if (ref._isVue) {
            name = getComponentName(ref.$options);
        }
        else {
            name = ref.tagName.toLowerCase();
        }
        value = {
            _custom: {
                display: `&lt;${name}` +
                    (ref.id ? ` <span class="attr-title">id</span>="${ref.id}"` : '') +
                    (ref.className ? ` <span class="attr-title">class</span>="${ref.className}"` : '') + '&gt;',
                uid: instance.__VUE_DEVTOOLS_UID__,
                type: 'reference'
            }
        };
    }
    return {
        type: '$refs',
        key: key,
        value,
        editable: false
    };
}
exports.getCustomRefDetails = getCustomRefDetails;
function parse(data, revive) {
    return revive
        ? transfer_1.parseCircularAutoChunks(data, reviver)
        : transfer_1.parseCircularAutoChunks(data);
}
exports.parse = parse;
const specialTypeRE = /^\[native (\w+) (.*)\]$/;
const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
function reviver(key, val) {
    if (val === exports.UNDEFINED) {
        return undefined;
    }
    else if (val === exports.INFINITY) {
        return Infinity;
    }
    else if (val === exports.NEGATIVE_INFINITY) {
        return -Infinity;
    }
    else if (val === exports.NAN) {
        return NaN;
    }
    else if (val && val._custom) {
        if (val._custom.type === 'component') {
            return backend_1.getInstanceMap().get(val._custom.id);
        }
        else if (val._custom.type === 'map') {
            return reviveMap(val);
        }
        else if (val._custom.type === 'set') {
            return reviveSet(val);
        }
    }
    else if (symbolRE.test(val)) {
        const [, string] = symbolRE.exec(val);
        return Symbol.for(string);
    }
    else if (specialTypeRE.test(val)) {
        const [, type, string] = specialTypeRE.exec(val);
        return new window[type](string);
    }
    else {
        return val;
    }
}
/**
 * Sanitize data to be posted to the other side.
 * Since the message posted is sent with structured clone,
 * we need to filter out any types that might cause an error.
 *
 * @param {*} data
 * @return {*}
 */
function sanitize(data) {
    if (!isPrimitive(data) &&
        !Array.isArray(data) &&
        !isPlainObject(data)) {
        // handle types that will probably cause issues in
        // the structured clone
        return Object.prototype.toString.call(data);
    }
    else {
        return data;
    }
}
function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
exports.isPlainObject = isPlainObject;
function isPrimitive(data) {
    if (data == null) {
        return true;
    }
    const type = typeof data;
    return (type === 'string' ||
        type === 'number' ||
        type === 'boolean');
}
/**
 * Searches a key or value in the object, with a maximum deepness
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function searchDeepInObject(obj, searchTerm) {
    const seen = new Map();
    const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0);
    seen.clear();
    return result;
}
exports.searchDeepInObject = searchDeepInObject;
const SEARCH_MAX_DEPTH = 10;
/**
 * Executes a search on each field of the provided object
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchObject(obj, searchTerm, seen, depth) {
    if (depth > SEARCH_MAX_DEPTH) {
        return false;
    }
    let match = false;
    const keys = Object.keys(obj);
    let key, value;
    for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        value = obj[key];
        match = internalSearchCheck(searchTerm, key, value, seen, depth + 1);
        if (match) {
            break;
        }
    }
    return match;
}
/**
 * Executes a search on each value of the provided array
 * @param {*} array Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchArray(array, searchTerm, seen, depth) {
    if (depth > SEARCH_MAX_DEPTH) {
        return false;
    }
    let match = false;
    let value;
    for (let i = 0; i < array.length; i++) {
        value = array[i];
        match = internalSearchCheck(searchTerm, null, value, seen, depth + 1);
        if (match) {
            break;
        }
    }
    return match;
}
/**
 * Checks if the provided field matches the search terms
 * @param {string} searchTerm Search string
 * @param {string} key Field key (null if from array)
 * @param {*} value Field value
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchCheck(searchTerm, key, value, seen, depth) {
    let match = false;
    let result;
    if (key === '_custom') {
        key = value.display;
        value = value.value;
    }
    (result = specialTokenToString(value)) && (value = result);
    if (key && compare(key, searchTerm)) {
        match = true;
        seen.set(value, true);
    }
    else if (seen.has(value)) {
        match = seen.get(value);
    }
    else if (Array.isArray(value)) {
        seen.set(value, null);
        match = internalSearchArray(value, searchTerm, seen, depth);
        seen.set(value, match);
    }
    else if (isPlainObject(value)) {
        seen.set(value, null);
        match = internalSearchObject(value, searchTerm, seen, depth);
        seen.set(value, match);
    }
    else if (compare(value, searchTerm)) {
        match = true;
        seen.set(value, true);
    }
    return match;
}
/**
 * Compares two values
 * @param {*} value Mixed type value that will be cast to string
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function compare(value, searchTerm) {
    return ('' + value).toLowerCase().indexOf(searchTerm) !== -1;
}
function sortByKey(state) {
    return state && state.slice().sort((a, b) => {
        if (a.key < b.key)
            return -1;
        if (a.key > b.key)
            return 1;
        return 0;
    });
}
exports.sortByKey = sortByKey;
function set(object, path, value, cb = null) {
    const sections = Array.isArray(path) ? path : path.split('.');
    while (sections.length > 1) {
        object = object[sections.shift()];
    }
    const field = sections[0];
    if (cb) {
        cb(object, field, value);
    }
    else {
        object[field] = value;
    }
}
exports.set = set;
function get(object, path) {
    const sections = Array.isArray(path) ? path : path.split('.');
    for (let i = 0; i < sections.length; i++) {
        object = object[sections[i]];
        if (!object) {
            return undefined;
        }
    }
    return object;
}
exports.get = get;
function has(object, path, parent = false) {
    if (typeof object === 'undefined') {
        return false;
    }
    const sections = Array.isArray(path) ? path : path.split('.');
    const size = !parent ? 1 : 2;
    while (object && sections.length > size) {
        object = object[sections.shift()];
    }
    return object != null && Object.prototype.hasOwnProperty.call(object, sections[0]);
}
exports.has = has;
function scrollIntoView(scrollParent, el, center = true) {
    const parentTop = scrollParent.scrollTop;
    const parentHeight = scrollParent.offsetHeight;
    const elBounds = el.getBoundingClientRect();
    const parentBounds = scrollParent.getBoundingClientRect();
    const top = elBounds.top - parentBounds.top + scrollParent.scrollTop;
    const height = el.offsetHeight;
    if (center) {
        scrollParent.scrollTop = top + (height - parentHeight) / 2;
    }
    else if (top < parentTop) {
        scrollParent.scrollTop = top;
    }
    else if (top + height > parentTop + parentHeight) {
        scrollParent.scrollTop = top - parentHeight + height;
    }
}
exports.scrollIntoView = scrollIntoView;
function focusInput(el) {
    el.focus();
    el.setSelectionRange(0, el.value.length);
}
exports.focusInput = focusInput;
function openInEditor(file) {
    // Console display
    const fileName = file.replace(/\\/g, '\\\\');
    const src = `fetch('${shared_data_1.default.openInEditorHost}__open-in-editor?file=${encodeURI(file)}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://github.com/vuejs/vue-devtools/blob/master/docs/open-in-editor.md')
    }
  })`;
    if (env_1.isChrome) {
        env_1.target.chrome.devtools.inspectedWindow.eval(src);
    }
    else {
        // eslint-disable-next-line no-eval
        eval(src);
    }
}
exports.openInEditor = openInEditor;
const ESC = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;'
};
function escape(s) {
    return s.replace(/[<>"&]/g, escapeChar);
}
exports.escape = escape;
function escapeChar(a) {
    return ESC[a] || a;
}
function copyToClipboard(state) {
    if (typeof document === 'undefined')
        return;
    const dummyTextArea = document.createElement('textarea');
    dummyTextArea.textContent = stringify(state);
    document.body.appendChild(dummyTextArea);
    dummyTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(dummyTextArea);
}
exports.copyToClipboard = copyToClipboard;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 5:
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}


/***/ }),

/***/ 55:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HookEvents = exports.BridgeSubscriptions = exports.BridgeEvents = exports.BuiltinTabs = void 0;
var BuiltinTabs;
(function (BuiltinTabs) {
    BuiltinTabs["COMPONENTS"] = "components";
    BuiltinTabs["TIMELINE"] = "timeline";
    BuiltinTabs["SETTINGS"] = "settings";
})(BuiltinTabs = exports.BuiltinTabs || (exports.BuiltinTabs = {}));
var BridgeEvents;
(function (BridgeEvents) {
    BridgeEvents["TO_BACK_SUBSCRIBE"] = "b:subscribe";
    BridgeEvents["TO_BACK_UNSUBSCRIBE"] = "b:unsubscribe";
    /** Backend is ready */
    BridgeEvents["TO_FRONT_READY"] = "f:ready";
    /** Displays the "detected Vue" console log */
    BridgeEvents["TO_BACK_LOG_DETECTED_VUE"] = "b:log-detected-vue";
    /** Force refresh */
    BridgeEvents["TO_BACK_REFRESH"] = "b:refresh";
    /** Tab was switched */
    BridgeEvents["TO_BACK_TAB_SWITCH"] = "b:tab:switch";
    /** App was registered */
    BridgeEvents["TO_FRONT_APP_ADD"] = "f:app:add";
    /** Get app list */
    BridgeEvents["TO_BACK_APP_LIST"] = "b:app:list";
    BridgeEvents["TO_FRONT_APP_LIST"] = "f:app:list";
    BridgeEvents["TO_FRONT_APP_REMOVE"] = "f:app:remove";
    BridgeEvents["TO_BACK_APP_SELECT"] = "b:app:select";
    BridgeEvents["TO_FRONT_APP_SELECTED"] = "f:app:selected";
    BridgeEvents["TO_BACK_COMPONENT_TREE"] = "b:component:tree";
    BridgeEvents["TO_FRONT_COMPONENT_TREE"] = "f:component:tree";
    BridgeEvents["TO_BACK_COMPONENT_SELECTED_DATA"] = "b:component:selected-data";
    BridgeEvents["TO_FRONT_COMPONENT_SELECTED_DATA"] = "f:component:selected-data";
    BridgeEvents["TO_BACK_COMPONENT_EXPAND"] = "b:component:expand";
    BridgeEvents["TO_FRONT_COMPONENT_EXPAND"] = "f:component:expand";
    BridgeEvents["TO_BACK_COMPONENT_SCROLL_TO"] = "b:component:scroll-to";
    BridgeEvents["TO_BACK_COMPONENT_FILTER"] = "b:component:filter";
    BridgeEvents["TO_BACK_COMPONENT_MOUSE_OVER"] = "b:component:mouse-over";
    BridgeEvents["TO_BACK_COMPONENT_MOUSE_OUT"] = "b:component:mouse-out";
    BridgeEvents["TO_BACK_COMPONENT_CONTEXT_MENU_TARGET"] = "b:component:context-menu-target";
    BridgeEvents["TO_BACK_COMPONENT_SET_DATA"] = "b:component:set-data";
    BridgeEvents["TO_BACK_COMPONENT_PICK"] = "b:component:pick";
    BridgeEvents["TO_FRONT_COMPONENT_PICK"] = "f:component:pick";
    BridgeEvents["TO_BACK_COMPONENT_PICK_CANCELED"] = "b:component:pick-canceled";
    BridgeEvents["TO_FRONT_COMPONENT_PICK_CANCELED"] = "f:component:pick-canceled";
    BridgeEvents["TO_FRONT_TIMELINE_EVENT"] = "f:timeline:event";
    BridgeEvents["TO_BACK_TIMELINE_LAYER_LIST"] = "b:timeline:layer-list";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_LIST"] = "f:timeline:layer-list";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_ADD"] = "f:timeline:layer-add";
    BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_LIST"] = "b:devtools-plugin:list";
    BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_LIST"] = "f:devtools-plugin:list";
    BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_ADD"] = "f:devtools-plugin:add";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_LIST"] = "b:custom-inspector:list";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_LIST"] = "f:custom-inspector:list";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_ADD"] = "f:custom-inspector:add";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_TREE"] = "b:custom-inspector:tree";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_TREE"] = "f:custom-inspector:tree";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_STATE"] = "b:custom-inspector:state";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_STATE"] = "f:custom-inspector:state";
})(BridgeEvents = exports.BridgeEvents || (exports.BridgeEvents = {}));
var BridgeSubscriptions;
(function (BridgeSubscriptions) {
    BridgeSubscriptions["SELECTED_COMPONENT_DATA"] = "component:selected-data";
    BridgeSubscriptions["COMPONENT_TREE"] = "component:tree";
})(BridgeSubscriptions = exports.BridgeSubscriptions || (exports.BridgeSubscriptions = {}));
var HookEvents;
(function (HookEvents) {
    HookEvents["INIT"] = "init";
    HookEvents["APP_INIT"] = "app:init";
    HookEvents["APP_ADD"] = "app:add";
    HookEvents["APP_UNMOUNT"] = "app:unmount";
    HookEvents["COMPONENT_UPDATED"] = "component:updated";
    HookEvents["COMPONENT_ADDED"] = "component:added";
    HookEvents["COMPONENT_REMOVED"] = "component:removed";
    HookEvents["COMPONENT_EMIT"] = "component:emit";
    HookEvents["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
    HookEvents["TIMELINE_LAYER_ADDED"] = "timeline:layer-added";
    HookEvents["TIMELINE_EVENT_ADDED"] = "timeline:event-added";
    HookEvents["CUSTOM_INSPECTOR_ADD"] = "custom-inspector:add";
    HookEvents["CUSTOM_INSPECTOR_SEND_TREE"] = "custom-inspector:send-tree";
    HookEvents["CUSTOM_INSPECTOR_SEND_STATE"] = "custom-inspector:send-state";
    /**
     * @deprecated
     */
    HookEvents["FLUSH"] = "flush";
})(HookEvents = exports.HookEvents || (exports.HookEvents = {}));
//# sourceMappingURL=consts.js.map

/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEnv = exports.keys = exports.isLinux = exports.isMac = exports.isWindows = exports.isFirefox = exports.isChrome = exports.target = exports.isBrowser = void 0;
exports.isBrowser = typeof navigator !== 'undefined';
exports.target = exports.isBrowser
    ? window
    : typeof global !== 'undefined'
        ? global
        : {};
exports.isChrome = typeof exports.target.chrome !== 'undefined' && !!exports.target.chrome.devtools;
exports.isFirefox = exports.isBrowser && navigator.userAgent.indexOf('Firefox') > -1;
exports.isWindows = exports.isBrowser && navigator.platform.indexOf('Win') === 0;
exports.isMac = exports.isBrowser && navigator.platform === 'MacIntel';
exports.isLinux = exports.isBrowser && navigator.platform.indexOf('Linux') === 0;
exports.keys = {
    ctrl: exports.isMac ? '&#8984;' : 'Ctrl',
    shift: 'Shift',
    alt: exports.isMac ? '&#8997;' : 'Alt',
    del: 'Del',
    enter: 'Enter',
    esc: 'Esc'
};
function initEnv(Vue) {
    if (Vue.prototype.hasOwnProperty('$isChrome'))
        return;
    Object.defineProperties(Vue.prototype, {
        $isChrome: { get: () => exports.isChrome },
        $isFirefox: { get: () => exports.isFirefox },
        $isWindows: { get: () => exports.isWindows },
        $isMac: { get: () => exports.isMac },
        $isLinux: { get: () => exports.isLinux },
        $keys: { get: () => exports.keys }
    });
    if (exports.isWindows)
        document.body.classList.add('platform-windows');
    if (exports.isMac)
        document.body.classList.add('platform-mac');
    if (exports.isLinux)
        document.body.classList.add('platform-linux');
}
exports.initEnv = initEnv;
//# sourceMappingURL=env.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5)))

/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.watchSharedData = exports.destroySharedData = exports.onSharedDataInit = exports.initSharedData = void 0;
const storage_1 = __webpack_require__(15);
// Initial state
const internalSharedData = {
    openInEditorHost: '/',
    componentNameStyle: 'class',
    theme: 'auto',
    displayDensity: 'low',
    timeFormat: 'default',
    recordVuex: true,
    cacheVuexSnapshotsEvery: 50,
    cacheVuexSnapshotsLimit: 10,
    snapshotLoading: false,
    recordPerf: false,
    editableProps: false,
    logDetected: true,
    vuexNewBackend: false,
    vuexAutoload: false,
    vuexGroupGettersByModule: true,
    showMenuScrollTip: true
};
const persisted = [
    'componentNameStyle',
    'theme',
    'displayDensity',
    'recordVuex',
    'editableProps',
    'logDetected',
    'vuexNewBackend',
    'vuexAutoload',
    'vuexGroupGettersByModule',
    'timeFormat',
    'showMenuScrollTip'
];
const storageVersion = '6.0.0-alpha.1';
// ---- INTERNALS ---- //
let bridge;
// List of fields to persist to storage (disabled if 'false')
// This should be unique to each shared data client to prevent conflicts
let persist = false;
let data;
let initRetryInterval;
let initRetryCount = 0;
const initCbs = [];
function initSharedData(params) {
    return new Promise((resolve) => {
        // Mandatory params
        bridge = params.bridge;
        persist = !!params.persist;
        if (persist) {
            if (false)
                {}
            // Load persisted fields
            persisted.forEach(key => {
                const value = storage_1.getStorage(`vue-devtools-${storageVersion}:shared-data:${key}`);
                if (value !== null) {
                    internalSharedData[key] = value;
                }
            });
            bridge.on('shared-data:load', () => {
                // Send all fields
                Object.keys(internalSharedData).forEach(key => {
                    sendValue(key, internalSharedData[key]);
                });
                bridge.send('shared-data:load-complete');
            });
            bridge.on('shared-data:init-complete', () => {
                if (false)
                    {}
                clearInterval(initRetryInterval);
                resolve();
            });
            bridge.send('shared-data:master-init-waiting');
            // In case backend init is executed after frontend
            bridge.on('shared-data:slave-init-waiting', () => {
                bridge.send('shared-data:master-init-waiting');
            });
            initRetryCount = 0;
            initRetryInterval = setInterval(() => {
                if (false)
                    {}
                bridge.send('shared-data:master-init-waiting');
                initRetryCount++;
                if (initRetryCount > 30) {
                    clearInterval(initRetryInterval);
                    console.error('[shared data] Master init failed');
                }
            }, 2000);
        }
        else {
            if (false)
                {}
            bridge.on('shared-data:master-init-waiting', () => {
                if (false)
                    {}
                // Load all persisted shared data
                bridge.send('shared-data:load');
                bridge.once('shared-data:load-complete', () => {
                    if (false)
                        {}
                    bridge.send('shared-data:init-complete');
                    resolve();
                });
            });
            bridge.send('shared-data:slave-init-waiting');
        }
        data = {
            ...internalSharedData
        };
        if (params.Vue) {
            data = params.Vue.observable(data);
        }
        // Update value from other shared data clients
        bridge.on('shared-data:set', ({ key, value }) => {
            setValue(key, value);
        });
        initCbs.forEach(cb => cb());
    });
}
exports.initSharedData = initSharedData;
function onSharedDataInit(cb) {
    initCbs.push(cb);
    return () => {
        const index = initCbs.indexOf(cb);
        if (index !== -1)
            initCbs.splice(index, 1);
    };
}
exports.onSharedDataInit = onSharedDataInit;
function destroySharedData() {
    bridge.removeAllListeners('shared-data:set');
    watchers = {};
}
exports.destroySharedData = destroySharedData;
let watchers = {};
function setValue(key, value) {
    // Storage
    if (persist && persisted.includes(key)) {
        storage_1.setStorage(`vue-devtools-${storageVersion}:shared-data:${key}`, value);
    }
    const oldValue = data[key];
    data[key] = value;
    const handlers = watchers[key];
    if (handlers) {
        handlers.forEach(h => h(value, oldValue));
    }
    // Validate Proxy set trap
    return true;
}
function sendValue(key, value) {
    bridge && bridge.send('shared-data:set', {
        key,
        value
    });
}
function watchSharedData(prop, handler) {
    const list = watchers[prop] || (watchers[prop] = []);
    list.push(handler);
    return () => {
        const index = list.indexOf(handler);
        if (index !== -1)
            list.splice(index, 1);
    };
}
exports.watchSharedData = watchSharedData;
const proxy = {};
Object.keys(internalSharedData).forEach(key => {
    Object.defineProperty(proxy, key, {
        configurable: false,
        get: () => data[key],
        set: (value) => {
            sendValue(key, value);
            setValue(key, value);
        }
    });
});
exports.default = proxy;
//# sourceMappingURL=shared-data.js.map

/***/ })

/******/ });
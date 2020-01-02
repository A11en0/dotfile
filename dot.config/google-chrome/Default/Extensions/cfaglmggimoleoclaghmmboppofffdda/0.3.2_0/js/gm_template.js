(function () {
    var container = (function () {
        var obj = {
            module_defines: {},
            module_objects: {}
        };

        obj.define = function (name, requires, callback) {
            name = obj.processName(name);
            obj.module_defines[name] = {
                requires: requires,
                callback: callback
            };
        };

        obj.require = function (name, cache) {
            if (typeof cache == "undefined") {
                cache = true;
            }

            name = obj.processName(name);
            if (cache && obj.module_objects.hasOwnProperty(name)) {
                return obj.module_objects[name];
            }
            else if (obj.module_defines.hasOwnProperty(name)) {
                var requires = obj.module_defines[name].requires;
                var callback = obj.module_defines[name].callback;

                var module = obj.use(requires, callback);
                cache && obj.register(name, module);
                return module;
            }
        };

        obj.use = function (requires, callback) {
            var module = {
                exports: {}
            };
            var params = obj.buildParams(requires, module);
            var result = callback.apply(this, params);
            if (typeof result != "undefined") {
                return result;
            }
            else {
                return module.exports;
            }
        };

        obj.register = function (name, module) {
            name = obj.processName(name);
            obj.module_objects[name] = module;
        };

        obj.buildParams = function (requires, module) {
            var params = [];
            requires.forEach(function (name) {
                params.push(obj.require(name));
            });
            params.push(obj.require);
            params.push(module.exports);
            params.push(module);
            return params;
        };

        obj.processName = function (name) {
            return name.toLowerCase();
        };

        return {
            define: obj.define,
            use: obj.use,
            register: obj.register,
            modules: obj.module_objects
        };
    })();

    container.define("message_web", [], function () {
        var obj = {
            message_listeners: {},
            message_callbacks: {},
            message_format: "nd_message_v1",
            message_name_callback: "message_callback"
        };

        obj.onMessage = function (name, listener) {
            obj.message_listeners[name] = listener;
        };

        obj.postMessage = function (messageName, messageData, callback) {
            var requestId = obj.generateMessageId();
            if (callback) {
                obj.message_callbacks[requestId] = callback;
            }
            obj.postMessageRaw(requestId, messageName, messageData);
        };

        obj.postMessageRaw = function (requestId, messageName, messageData) {
            window.postMessage({
                id: requestId,
                name: messageName,
                data: messageData,
                format: obj.message_format
            }, "*");
        };

        obj.handleMessage = function (event) {
            var message = event.data;
            if (message && message.format == obj.message_format) {
                var requestId = message.id;
                if (message.name == obj.message_name_callback) {
                    obj.handleMessageCallback(message);
                }
                else {
                    obj.handleMessageListener(message);
                }
            }
        };

        obj.handleMessageCallback = function (message) {
            var requestId = message.id;
            if (obj.message_callbacks.hasOwnProperty(requestId)) {
                var callback = obj.message_callbacks[requestId];
                callback && callback(message.data);
                delete obj.message_callbacks[requestId];
            }
        };

        obj.handleMessageListener = function (message) {
            if (obj.message_listeners.hasOwnProperty(message.name)) {
                var listener = obj.message_listeners[message.name];
                var callback = function (response) {
                    obj.postMessageRaw(message.id, obj.message_name_callback, response);
                };
                listener && listener(message.data, callback);
            }
        };

        obj.generateMessageId = function () {
            var d = new Date().getTime();
            var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };

        obj.init = function () {
            window.addEventListener("message", obj.handleMessage, false);
        };

        return obj.init(), {
            format: obj.message_format,
            onMessage: obj.onMessage,
            postMessage: obj.postMessage
        };
    });

    container.define("unsafe_window", [], function () {
        return window;
    });

    container.define("safe_window", ["unsafe_window"], function (unsafeWindow) {

        var obj = {};
        var safeWindow = {};

        obj.invoke = function (name) {
            var method = unsafeWindow[name];
            if (method) {
                safeWindow[name] = function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }
                    return method.apply(unsafeWindow, args);
                };
            }
        };

        obj.assign = function (name) {
            var property = unsafeWindow[name];
            if (property == unsafeWindow) {
                safeWindow[name] = safeWindow;
            }
            else {
                safeWindow[name] = property;
            }
        };

        obj.init = function () {
            var nameList = ["postMessage", "blur", "focus", "close", "parent", "top", "frames", "location", "self", "window", "document", "customElements", "history", "locationbar", "menubar", "personalbar", "scrollbars", "statusbar", "toolbar", "navigator", "origin", "external", "screen", "innerWidth", "innerHeight", "visualViewport", "outerWidth", "outerHeight", "devicePixelRatio", "clientInformation", "styleMedia", "performance", "stop", "open", "alert", "confirm", "prompt", "print", "queueMicrotask", "requestAnimationFrame", "cancelAnimationFrame", "captureEvents", "releaseEvents", "requestIdleCallback", "cancelIdleCallback", "getComputedStyle", "matchMedia", "moveTo", "moveBy", "resizeTo", "resizeBy", "getSelection", "find", "webkitRequestAnimationFrame", "webkitCancelAnimationFrame", "fetch", "btoa", "atob", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "createImageBitmap", "scroll", "scrollTo", "scrollBy", "crypto", "indexedDB", "sessionStorage", "localStorage", "chrome", "speechSynthesis", "webkitRequestFileSystem", "webkitResolveLocalFileSystemURL", "openDatabase"];
            nameList.forEach(function (name) {
                if (unsafeWindow.hasOwnProperty(name)) {
                    var property = unsafeWindow[name];
                    if (property instanceof Function) {
                        obj.invoke(name);
                    }
                    else if (property) {
                        obj.assign(name);
                    }
                }
            });
        };

        return obj.init(), safeWindow;
    });

    container.define("bridge", ["message_web"], function (messageWeb) {
        var obj = {
            gm_info: {},
            gm_values: {}
        };

        obj.setValue = function (name, value) {
            obj.gm_values[name] = value;

            var data = {
                name: name,
                value: value
            };
            messageWeb.postMessage("set_value", data);
        };

        obj.getValue = function (name, defaultValue) {
            if (obj.gm_values.hasOwnProperty(name)) {
                return obj.gm_values[name];
            }
            else {
                return defaultValue;
            }
        };

        obj.listValues = function () {
            return Object.keys(obj.getValueList());
        };

        obj.openTab = function (url, active) {
            var data = {
                url: url,
                active: !active
            };
            messageWeb.postMessage("open_tab", data);
        };

        obj.ajaxRequest = function (details) {
            var data = {
                mode: "gm"
            };
            for (var i in details) {
                if (details[i] instanceof Function) {
                    continue;
                }

                if (details[i] instanceof FormData) {
                    var object = {};
                    details[i].forEach(function (value, name) {
                        object[name] = value;
                    });
                    data[i] = object;
                }
                else {
                    data[i] = details[i];
                }
            }
            messageWeb.postMessage("ajax_request", data, function (response) {
                if (response) {
                    details.onload && details.onload({
                        response: response
                    });
                }
                else {
                    details.onerror && details.onerror({
                        error: ""
                    });
                }
            });
        };

        obj.init = function (callback) {
            messageWeb.postMessage("gm_init", {}, function (response) {
                obj.gm_info = response.gm_info;
                obj.gm_values = response.gm_values;
                callback && callback();
            });
        };

        return obj;
    });

    container.define("core", ["bridge"], function (bridge) {
        var obj = {};

        obj.initBridge = function () {
            return new Promise(function (resolve) {
                bridge.init(function () {
                    resolve();
                });
            });
        };

        obj.ready = function (callback) {
            var promiseList = [
                obj.initBridge()
            ];
            Promise.all(promiseList).then(function () {
                callback && callback();
            });
        };

        return obj;
    });

    container.define("app", ["safe_window", "unsafe_window", "bridge"], function (window, unsafeWindow, bridge) {
        var obj = {};

        obj.run = function () {
            (function (container, bridge, window, unsafeWindow, GM_info, GM_getValue, GM_setValue, GM_listValues, GM_openInTab, GM_xmlhttpRequest) {

                '##third_library##';

                '##user_script##';

            }).apply(window, [, , window, unsafeWindow, bridge.gm_info, bridge.getValue, bridge.setValue, bridge.listValues, bridge.openTab, bridge.ajaxRequest]);
        };

        return obj;
    });

    container.use(["core", "app"], function (core, app) {
        core.ready(function () {
            app.run();
        });
    });
})();
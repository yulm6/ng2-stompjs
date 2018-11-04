(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@stomp/rx-stomp'), require('rxjs'), require('rxjs/operators'), require('@angular/core/testing')) :
    typeof define === 'function' && define.amd ? define('@stomp/ng2-stompjs', ['exports', '@angular/core', '@stomp/rx-stomp', 'rxjs', 'rxjs/operators', '@angular/core/testing'], factory) :
    (factory((global.stomp = global.stomp || {}, global.stomp['ng2-stompjs'] = {}),global.ng.core,global.RxStomp,global.rxjs,global.rxjs.operators,global.ng.core.testing));
}(this, (function (exports,core,rxStomp,rxjs,operators,testing) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /** @enum {number} */
    var StompState = {
        CLOSED: 0,
        TRYING: 1,
        CONNECTED: 2,
        DISCONNECTING: 3,
    };
    StompState[StompState.CLOSED] = "CLOSED";
    StompState[StompState.TRYING] = "TRYING";
    StompState[StompState.CONNECTED] = "CONNECTED";
    StompState[StompState.DISCONNECTING] = "DISCONNECTING";

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * Angular2 STOMP Raw Service using \@stomp/stomp.js
     *
     * You will only need the public properties and
     * methods listed unless you are an advanced user. This service handles subscribing to a
     * message queue using the stomp.js library, and returns
     * values via the ES6 Observable specification for
     * asynchronous value streaming by wiring the STOMP
     * messages into an observable.
     *
     * If you will like to pass the configuration as a dependency,
     * please use StompService class.
     */
    var StompRService = (function (_super) {
        __extends(StompRService, _super);
        function StompRService() {
            var _this = _super.call(this) || this;
            _this.state = new rxjs.BehaviorSubject(StompState.CLOSED);
            _this.connectionState$.subscribe(function (st) {
                _this.state.next(StompRService._mapStompState(st));
            });
            return _this;
        }
        /**
         * @param {?} st
         * @return {?}
         */
        StompRService._mapStompState = /**
         * @param {?} st
         * @return {?}
         */
            function (st) {
                if (st === rxStomp.RxStompState.CONNECTING) {
                    return StompState.TRYING;
                }
                if (st === rxStomp.RxStompState.OPEN) {
                    return StompState.CONNECTED;
                }
                if (st === rxStomp.RxStompState.CLOSING) {
                    return StompState.DISCONNECTING;
                }
                if (st === rxStomp.RxStompState.CLOSED) {
                    return StompState.CLOSED;
                }
            };
        Object.defineProperty(StompRService.prototype, "connectObservable", {
            /**
             * Will trigger when connection is established. Use this to carry out initialization.
             * It will trigger every time a (re)connection occurs. If it is already connected
             * it will trigger immediately. You can safely ignore the value, as it will always be
             * StompState.CONNECTED
             */
            get: /**
             * Will trigger when connection is established. Use this to carry out initialization.
             * It will trigger every time a (re)connection occurs. If it is already connected
             * it will trigger immediately. You can safely ignore the value, as it will always be
             * StompState.CONNECTED
             * @return {?}
             */ function () {
                return this.connected$.pipe(operators.map(function (st) {
                    return StompRService._mapStompState(st);
                }));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StompRService.prototype, "serverHeadersObservable", {
            /**
             * Provides headers from most recent connection to the server as return by the CONNECTED
             * frame.
             * If the STOMP connection has already been established it will trigger immediately.
             * It will additionally trigger in event of reconnection, the value will be set of headers from
             * the recent server response.
             */
            get: /**
             * Provides headers from most recent connection to the server as return by the CONNECTED
             * frame.
             * If the STOMP connection has already been established it will trigger immediately.
             * It will additionally trigger in event of reconnection, the value will be set of headers from
             * the recent server response.
             * @return {?}
             */ function () {
                return this.serverHeaders$;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StompRService.prototype, "defaultMessagesObservable", {
            /**
             * Will emit all messages to the default queue (any message that are not handled by a subscription)
             */
            get: /**
             * Will emit all messages to the default queue (any message that are not handled by a subscription)
             * @return {?}
             */ function () {
                return this.unhandledMessage$;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StompRService.prototype, "receiptsObservable", {
            /**
             * Will emit all receipts
             */
            get: /**
             * Will emit all receipts
             * @return {?}
             */ function () {
                return this.unhandledReceipts$;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StompRService.prototype, "errorSubject", {
            /**
             * Will trigger when an error occurs. This Subject can be used to handle errors from
             * the stomp broker.
             */
            get: /**
             * Will trigger when an error occurs. This Subject can be used to handle errors from
             * the stomp broker.
             * @return {?}
             */ function () {
                return this.stompErrors$;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StompRService.prototype, "config", {
            /** Set configuration */
            set: /**
             * Set configuration
             * @param {?} config
             * @return {?}
             */ function (config) {
                var /** @type {?} */ rxStompConfig = {};
                if (typeof (config.url) === 'string') {
                    rxStompConfig.brokerURL = config.url;
                }
                else {
                    rxStompConfig.webSocketFactory = config.url;
                }
                // Configure client heart-beating
                rxStompConfig.heartbeatIncoming = config.heartbeat_in;
                rxStompConfig.heartbeatOutgoing = config.heartbeat_out;
                // Auto reconnect
                rxStompConfig.reconnectDelay = config.reconnect_delay;
                if (config.debug) {
                    rxStompConfig.debug = function (str) {
                        console.log(new Date(), str);
                    };
                }
                rxStompConfig.connectHeaders = config.headers;
                this.configure(rxStompConfig);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * It will connect to the STOMP broker.
         * @return {?}
         */
        StompRService.prototype.initAndConnect = /**
         * It will connect to the STOMP broker.
         * @return {?}
         */
            function () {
                // disconnect if connected
                this.deactivate();
                // Attempt connection, passing in a callback
                this.activate();
            };
        /**
         * It will disconnect from the STOMP broker.
         * @return {?}
         */
        StompRService.prototype.disconnect = /**
         * It will disconnect from the STOMP broker.
         * @return {?}
         */
            function () {
                this.deactivate();
            };
        /**
         * It will send a message to a named destination. The message must be `string`.
         *
         * The message will get locally queued if the STOMP broker is not connected. It will attempt to
         * publish queued messages as soon as the broker gets connected.
         *
         * @param {?} queueName
         * @param {?=} message
         * @param {?=} headers
         * @return {?}
         */
        StompRService.prototype.publish = /**
         * It will send a message to a named destination. The message must be `string`.
         *
         * The message will get locally queued if the STOMP broker is not connected. It will attempt to
         * publish queued messages as soon as the broker gets connected.
         *
         * @param {?} queueName
         * @param {?=} message
         * @param {?=} headers
         * @return {?}
         */
            function (queueName, message, headers) {
                if (headers === void 0) {
                    headers = {};
                }
                if (typeof queueName === 'string') {
                    _super.prototype.publish.call(this, { destination: /** @type {?} */ (queueName), body: message, headers: headers });
                }
                else {
                    var /** @type {?} */ pubParams = queueName;
                    _super.prototype.publish.call(this, pubParams);
                }
            };
        /**
         * It will subscribe to server message queues
         *
         * This method can be safely called even if the STOMP broker is not connected.
         * If the underlying STOMP connection drops and reconnects, it will resubscribe automatically.
         *
         * If a header field 'ack' is not explicitly passed, 'ack' will be set to 'auto'. If you
         * do not understand what it means, please leave it as is.
         *
         * Note that when working with temporary queues where the subscription request
         * creates the
         * underlying queue, mssages might be missed during reconnect. This issue is not specific
         * to this library but the way STOMP brokers are designed to work.
         *
         * @param {?} queueName
         * @param {?=} headers
         * @return {?}
         */
        StompRService.prototype.subscribe = /**
         * It will subscribe to server message queues
         *
         * This method can be safely called even if the STOMP broker is not connected.
         * If the underlying STOMP connection drops and reconnects, it will resubscribe automatically.
         *
         * If a header field 'ack' is not explicitly passed, 'ack' will be set to 'auto'. If you
         * do not understand what it means, please leave it as is.
         *
         * Note that when working with temporary queues where the subscription request
         * creates the
         * underlying queue, mssages might be missed during reconnect. This issue is not specific
         * to this library but the way STOMP brokers are designed to work.
         *
         * @param {?} queueName
         * @param {?=} headers
         * @return {?}
         */
            function (queueName, headers) {
                if (headers === void 0) {
                    headers = {};
                }
                return this.watch(queueName, headers);
            };
        /**
         * STOMP brokers may carry out operation asynchronously and allow requesting for acknowledgement.
         * To request an acknowledgement, a `receipt` header needs to be sent with the actual request.
         * The value (say receipt-id) for this header needs to be unique for each use. Typically a sequence, a UUID, a
         * random number or a combination may be used.
         *
         * A complaint broker will send a RECEIPT frame when an operation has actually been completed.
         * The operation needs to be matched based in the value of the receipt-id.
         *
         * This method allow watching for a receipt and invoke the callback
         * when corresponding receipt has been received.
         *
         * The actual {\@link https://stomp-js.github.io/stompjs/classes/Frame.html}
         * will be passed as parameter to the callback.
         *
         * Example:
         * ```javascript
         *        // Publishing with acknowledgement
         *        let receiptId = randomText();
         *
         *        rxStomp.waitForReceipt(receiptId, function() {
         *          // Will be called after server acknowledges
         *        });
         *        rxStomp.publish({destination: TEST.destination, headers: {receipt: receiptId}, body: msg});
         * ```
         *
         * Maps to: https://stomp-js.github.io/stompjs/classes/Client.html#watchForReceipt
         * @param {?} receiptId
         * @param {?} callback
         * @return {?}
         */
        StompRService.prototype.waitForReceipt = /**
         * STOMP brokers may carry out operation asynchronously and allow requesting for acknowledgement.
         * To request an acknowledgement, a `receipt` header needs to be sent with the actual request.
         * The value (say receipt-id) for this header needs to be unique for each use. Typically a sequence, a UUID, a
         * random number or a combination may be used.
         *
         * A complaint broker will send a RECEIPT frame when an operation has actually been completed.
         * The operation needs to be matched based in the value of the receipt-id.
         *
         * This method allow watching for a receipt and invoke the callback
         * when corresponding receipt has been received.
         *
         * The actual {\@link https://stomp-js.github.io/stompjs/classes/Frame.html}
         * will be passed as parameter to the callback.
         *
         * Example:
         * ```javascript
         *        // Publishing with acknowledgement
         *        let receiptId = randomText();
         *
         *        rxStomp.waitForReceipt(receiptId, function() {
         *          // Will be called after server acknowledges
         *        });
         *        rxStomp.publish({destination: TEST.destination, headers: {receipt: receiptId}, body: msg});
         * ```
         *
         * Maps to: https://stomp-js.github.io/stompjs/classes/Client.html#watchForReceipt
         * @param {?} receiptId
         * @param {?} callback
         * @return {?}
         */
            function (receiptId, callback) {
                _super.prototype.watchForReceipt.call(this, receiptId, callback);
            };
        Object.defineProperty(StompRService.prototype, "client", {
            get: /**
             * @return {?}
             */ function () {
                return this._stompClient;
            },
            enumerable: true,
            configurable: true
        });
        StompRService.decorators = [
            { type: core.Injectable }
        ];
        /** @nocollapse */
        StompRService.ctorParameters = function () { return []; };
        return StompRService;
    }(rxStomp.RxStomp));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * Represents a configuration object for the
     * STOMPService to connect to.
     */
    var StompConfig = (function () {
        function StompConfig() {
        }
        StompConfig.decorators = [
            { type: core.Injectable }
        ];
        return StompConfig;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * Angular2 STOMP Service using \@stomp/stomp.js
     *
     * \@description This service handles subscribing to a
     * message queue using the stomp.js library, and returns
     * values via the ES6 Observable specification for
     * asynchronous value streaming by wiring the STOMP
     * messages into an observable.
     *
     * If you want to manually configure and initialize the service
     * please use StompRService
     */
    var StompService = (function (_super) {
        __extends(StompService, _super);
        function StompService(config) {
            var _this = _super.call(this) || this;
            _this.config = config;
            _this.initAndConnect();
            return _this;
        }
        StompService.decorators = [
            { type: core.Injectable }
        ];
        /** @nocollapse */
        StompService.ctorParameters = function () {
            return [
                { type: StompConfig, },
            ];
        };
        return StompService;
    }(StompRService));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var RxStompService = (function (_super) {
        __extends(RxStompService, _super);
        function RxStompService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RxStompService.decorators = [
            { type: core.Injectable }
        ];
        return RxStompService;
    }(rxStomp.RxStomp));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var InjectableRxStompRpcConfig = (function (_super) {
        __extends(InjectableRxStompRpcConfig, _super);
        function InjectableRxStompRpcConfig() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InjectableRxStompRpcConfig.decorators = [
            { type: core.Injectable }
        ];
        return InjectableRxStompRpcConfig;
    }(rxStomp.RxStompRPCConfig));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * An implementation of RPC service using messaging.
     *
     * Please see the [guide](../additional-documentation/rpc---remote-procedure-call.html) for details.
     */
    var RxStompRPCService = (function (_super) {
        __extends(RxStompRPCService, _super);
        function RxStompRPCService(rxStomp$$1, stompRPCConfig) {
            return _super.call(this, rxStomp$$1, stompRPCConfig) || this;
        }
        RxStompRPCService.decorators = [
            { type: core.Injectable }
        ];
        /** @nocollapse */
        RxStompRPCService.ctorParameters = function () {
            return [
                { type: RxStompService, },
                { type: InjectableRxStompRpcConfig, decorators: [{ type: core.Optional },] },
            ];
        };
        return RxStompRPCService;
    }(rxStomp.RxStompRPC));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var InjectableRxStompConfig = (function (_super) {
        __extends(InjectableRxStompConfig, _super);
        function InjectableRxStompConfig() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InjectableRxStompConfig.decorators = [
            { type: core.Injectable }
        ];
        return InjectableRxStompConfig;
    }(rxStomp.RxStompConfig));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * @param {?} rxStompConfig
     * @return {?}
     */
    function rxStompServiceFactory(rxStompConfig) {
        var /** @type {?} */ rxStompService = new RxStompService();
        rxStompService.configure(testing.TestBed.get(InjectableRxStompConfig));
        rxStompService.activate();
        return rxStompService;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */

    exports.StompRService = StompRService;
    exports.StompService = StompService;
    exports.StompState = StompState;
    exports.StompConfig = StompConfig;
    exports.RxStompRPCService = RxStompRPCService;
    exports.RxStompService = RxStompService;
    exports.InjectableRxStompConfig = InjectableRxStompConfig;
    exports.InjectableRxStompRpcConfig = InjectableRxStompRpcConfig;
    exports.rxStompServiceFactory = rxStompServiceFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvbXAtbmcyLXN0b21wanMudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm5nOi8vQHN0b21wL25nMi1zdG9tcGpzL3NyYy9zdG9tcC1yLnNlcnZpY2UudHMiLCJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvc3RvbXAuY29uZmlnLnRzIiwibmc6Ly9Ac3RvbXAvbmcyLXN0b21wanMvc3JjL3N0b21wLnNlcnZpY2UudHMiLCJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvcngtc3RvbXAuc2VydmljZS50cyIsIm5nOi8vQHN0b21wL25nMi1zdG9tcGpzL3NyYy9pbmplY3RhYmxlLXJ4LXN0b21wLXJwYy1jb25maWcudHMiLCJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvcngtc3RvbXAtcnBjLnNlcnZpY2UudHMiLCJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvaW5qZWN0YWJsZS1yeC1zdG9tcC1jb25maWcudHMiLCJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvcngtc3RvbXAtc2VydmljZS1mYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXHJcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcblxyXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXHJcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIFRJVExFLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSxcclxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cclxuXHJcblNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMClcclxuICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShyZXN1bHQudmFsdWUpOyB9KS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIHJlc3VsdFtrXSA9IG1vZFtrXTtcclxuICAgIHJlc3VsdC5kZWZhdWx0ID0gbW9kO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuIiwiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSeFN0b21wLCBSeFN0b21wQ29uZmlnLCBSeFN0b21wU3RhdGV9IGZyb20gJ0BzdG9tcC9yeC1zdG9tcCc7XG5cbmltcG9ydCB7cHVibGlzaFBhcmFtcywgQ2xpZW50LCBNZXNzYWdlLCBGcmFtZX0gZnJvbSAnQHN0b21wL3N0b21wanMnO1xuXG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1N0b21wU3RhdGV9IGZyb20gJy4vc3RvbXAtc3RhdGUnO1xuaW1wb3J0IHsgU3RvbXBIZWFkZXJzIH0gZnJvbSAnLi9zdG9tcC1oZWFkZXJzJztcbmltcG9ydCB7U3RvbXBDb25maWd9IGZyb20gJy4vc3RvbXAuY29uZmlnJztcblxuLyoqXG4gKiBBbmd1bGFyMiBTVE9NUCBSYXcgU2VydmljZSB1c2luZyBAc3RvbXAvc3RvbXAuanNcbiAqXG4gKiBZb3Ugd2lsbCBvbmx5IG5lZWQgdGhlIHB1YmxpYyBwcm9wZXJ0aWVzIGFuZFxuICogbWV0aG9kcyBsaXN0ZWQgdW5sZXNzIHlvdSBhcmUgYW4gYWR2YW5jZWQgdXNlci4gVGhpcyBzZXJ2aWNlIGhhbmRsZXMgc3Vic2NyaWJpbmcgdG8gYVxuICogbWVzc2FnZSBxdWV1ZSB1c2luZyB0aGUgc3RvbXAuanMgbGlicmFyeSwgYW5kIHJldHVybnNcbiAqIHZhbHVlcyB2aWEgdGhlIEVTNiBPYnNlcnZhYmxlIHNwZWNpZmljYXRpb24gZm9yXG4gKiBhc3luY2hyb25vdXMgdmFsdWUgc3RyZWFtaW5nIGJ5IHdpcmluZyB0aGUgU1RPTVBcbiAqIG1lc3NhZ2VzIGludG8gYW4gb2JzZXJ2YWJsZS5cbiAqXG4gKiBJZiB5b3Ugd2lsbCBsaWtlIHRvIHBhc3MgdGhlIGNvbmZpZ3VyYXRpb24gYXMgYSBkZXBlbmRlbmN5LFxuICogcGxlYXNlIHVzZSBTdG9tcFNlcnZpY2UgY2xhc3MuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdG9tcFJTZXJ2aWNlIGV4dGVuZHMgUnhTdG9tcCB7XG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgU1RPTVBTZXJ2aWNlXG4gICAqXG4gICAqIEl0IGlzIGEgQmVoYXZpb3JTdWJqZWN0IGFuZCB3aWxsIGVtaXQgY3VycmVudCBzdGF0dXMgaW1tZWRpYXRlbHkuIFRoaXMgd2lsbCB0eXBpY2FsbHkgZ2V0XG4gICAqIHVzZWQgdG8gc2hvdyBjdXJyZW50IHN0YXR1cyB0byB0aGUgZW5kIHVzZXIuXG4gICAqL1xuICBwdWJsaWMgc3RhdGU6IEJlaGF2aW9yU3ViamVjdDxTdG9tcFN0YXRlPjtcblxuICBwcml2YXRlIHN0YXRpYyBfbWFwU3RvbXBTdGF0ZShzdDogUnhTdG9tcFN0YXRlKTogU3RvbXBTdGF0ZSB7XG4gICAgaWYgKHN0ID09PSBSeFN0b21wU3RhdGUuQ09OTkVDVElORykge1xuICAgICAgcmV0dXJuIFN0b21wU3RhdGUuVFJZSU5HO1xuICAgIH1cbiAgICBpZiAoc3QgPT09IFJ4U3RvbXBTdGF0ZS5PUEVOKSB7XG4gICAgICByZXR1cm4gU3RvbXBTdGF0ZS5DT05ORUNURUQ7XG4gICAgfVxuICAgIGlmIChzdCA9PT0gUnhTdG9tcFN0YXRlLkNMT1NJTkcpIHtcbiAgICAgIHJldHVybiBTdG9tcFN0YXRlLkRJU0NPTk5FQ1RJTkc7XG4gICAgfVxuICAgIGlmIChzdCA9PT0gUnhTdG9tcFN0YXRlLkNMT1NFRCkge1xuICAgICAgcmV0dXJuIFN0b21wU3RhdGUuQ0xPU0VEO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaWxsIHRyaWdnZXIgd2hlbiBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkLiBVc2UgdGhpcyB0byBjYXJyeSBvdXQgaW5pdGlhbGl6YXRpb24uXG4gICAqIEl0IHdpbGwgdHJpZ2dlciBldmVyeSB0aW1lIGEgKHJlKWNvbm5lY3Rpb24gb2NjdXJzLiBJZiBpdCBpcyBhbHJlYWR5IGNvbm5lY3RlZFxuICAgKiBpdCB3aWxsIHRyaWdnZXIgaW1tZWRpYXRlbHkuIFlvdSBjYW4gc2FmZWx5IGlnbm9yZSB0aGUgdmFsdWUsIGFzIGl0IHdpbGwgYWx3YXlzIGJlXG4gICAqIFN0b21wU3RhdGUuQ09OTkVDVEVEXG4gICAqL1xuICBnZXQgY29ubmVjdE9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxTdG9tcFN0YXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGVkJC5waXBlKG1hcCgoc3Q6IFJ4U3RvbXBTdGF0ZSk6IFN0b21wU3RhdGUgPT4ge1xuICAgICAgcmV0dXJuIFN0b21wUlNlcnZpY2UuX21hcFN0b21wU3RhdGUoc3QpO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBoZWFkZXJzIGZyb20gbW9zdCByZWNlbnQgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyIGFzIHJldHVybiBieSB0aGUgQ09OTkVDVEVEXG4gICAqIGZyYW1lLlxuICAgKiBJZiB0aGUgU1RPTVAgY29ubmVjdGlvbiBoYXMgYWxyZWFkeSBiZWVuIGVzdGFibGlzaGVkIGl0IHdpbGwgdHJpZ2dlciBpbW1lZGlhdGVseS5cbiAgICogSXQgd2lsbCBhZGRpdGlvbmFsbHkgdHJpZ2dlciBpbiBldmVudCBvZiByZWNvbm5lY3Rpb24sIHRoZSB2YWx1ZSB3aWxsIGJlIHNldCBvZiBoZWFkZXJzIGZyb21cbiAgICogdGhlIHJlY2VudCBzZXJ2ZXIgcmVzcG9uc2UuXG4gICAqL1xuICBnZXQgc2VydmVySGVhZGVyc09ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxTdG9tcEhlYWRlcnM+IHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2ZXJIZWFkZXJzJDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaWxsIGVtaXQgYWxsIG1lc3NhZ2VzIHRvIHRoZSBkZWZhdWx0IHF1ZXVlIChhbnkgbWVzc2FnZSB0aGF0IGFyZSBub3QgaGFuZGxlZCBieSBhIHN1YnNjcmlwdGlvbilcbiAgICovXG4gIGdldCBkZWZhdWx0TWVzc2FnZXNPYnNlcnZhYmxlKCk6IFN1YmplY3Q8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnVuaGFuZGxlZE1lc3NhZ2UkO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgZW1pdCBhbGwgcmVjZWlwdHNcbiAgICovXG4gIGdldCByZWNlaXB0c09ic2VydmFibGUoKTogU3ViamVjdDxGcmFtZT4ge1xuICAgIHJldHVybiB0aGlzLnVuaGFuZGxlZFJlY2VpcHRzJDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaWxsIHRyaWdnZXIgd2hlbiBhbiBlcnJvciBvY2N1cnMuIFRoaXMgU3ViamVjdCBjYW4gYmUgdXNlZCB0byBoYW5kbGUgZXJyb3JzIGZyb21cbiAgICogdGhlIHN0b21wIGJyb2tlci5cbiAgICovXG4gIGdldCBlcnJvclN1YmplY3QoKTogU3ViamVjdDxzdHJpbmcgfCBGcmFtZT4ge1xuICAgIHJldHVybiB0aGlzLnN0b21wRXJyb3JzJDtcbiAgfVxuXG4gIC8qKiBTZXQgY29uZmlndXJhdGlvbiAqL1xuICBzZXQgY29uZmlnKGNvbmZpZzogU3RvbXBDb25maWcpIHtcbiAgICBjb25zdCByeFN0b21wQ29uZmlnOiBSeFN0b21wQ29uZmlnID0geyB9O1xuXG4gICAgaWYgKHR5cGVvZihjb25maWcudXJsKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJ4U3RvbXBDb25maWcuYnJva2VyVVJMID0gY29uZmlnLnVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgcnhTdG9tcENvbmZpZy53ZWJTb2NrZXRGYWN0b3J5ID0gY29uZmlnLnVybDtcbiAgICB9XG5cbiAgICAvLyBDb25maWd1cmUgY2xpZW50IGhlYXJ0LWJlYXRpbmdcbiAgICByeFN0b21wQ29uZmlnLmhlYXJ0YmVhdEluY29taW5nID0gY29uZmlnLmhlYXJ0YmVhdF9pbjtcbiAgICByeFN0b21wQ29uZmlnLmhlYXJ0YmVhdE91dGdvaW5nID0gY29uZmlnLmhlYXJ0YmVhdF9vdXQ7XG5cbiAgICAvLyBBdXRvIHJlY29ubmVjdFxuICAgIHJ4U3RvbXBDb25maWcucmVjb25uZWN0RGVsYXkgPSBjb25maWcucmVjb25uZWN0X2RlbGF5O1xuXG4gICAgaWYgKGNvbmZpZy5kZWJ1Zykge1xuICAgICAgcnhTdG9tcENvbmZpZy5kZWJ1ZyA9IChzdHI6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpLCBzdHIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByeFN0b21wQ29uZmlnLmNvbm5lY3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShyeFN0b21wQ29uZmlnKTtcbiAgfVxuICAvKipcbiAgICogSXQgd2lsbCBjb25uZWN0IHRvIHRoZSBTVE9NUCBicm9rZXIuXG4gICAqL1xuICBwdWJsaWMgaW5pdEFuZENvbm5lY3QoKTogdm9pZCB7XG4gICAgLy8gZGlzY29ubmVjdCBpZiBjb25uZWN0ZWRcbiAgICB0aGlzLmRlYWN0aXZhdGUoKTtcblxuICAgIC8vIEF0dGVtcHQgY29ubmVjdGlvbiwgcGFzc2luZyBpbiBhIGNhbGxiYWNrXG4gICAgdGhpcy5hY3RpdmF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0IHdpbGwgZGlzY29ubmVjdCBmcm9tIHRoZSBTVE9NUCBicm9rZXIuXG4gICAqL1xuICBwdWJsaWMgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdCB3aWxsIHNlbmQgYSBtZXNzYWdlIHRvIGEgbmFtZWQgZGVzdGluYXRpb24uIFRoZSBtZXNzYWdlIG11c3QgYmUgYHN0cmluZ2AuXG4gICAqXG4gICAqIFRoZSBtZXNzYWdlIHdpbGwgZ2V0IGxvY2FsbHkgcXVldWVkIGlmIHRoZSBTVE9NUCBicm9rZXIgaXMgbm90IGNvbm5lY3RlZC4gSXQgd2lsbCBhdHRlbXB0IHRvXG4gICAqIHB1Ymxpc2ggcXVldWVkIG1lc3NhZ2VzIGFzIHNvb24gYXMgdGhlIGJyb2tlciBnZXRzIGNvbm5lY3RlZC5cbiAgICpcbiAgICogQHBhcmFtIHF1ZXVlTmFtZVxuICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgKiBAcGFyYW0gaGVhZGVyc1xuICAgKi9cbiAgcHVibGljIHB1Ymxpc2gocXVldWVOYW1lOiBzdHJpbmd8cHVibGlzaFBhcmFtcywgbWVzc2FnZT86IHN0cmluZywgaGVhZGVyczogU3RvbXBIZWFkZXJzID0ge30pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHF1ZXVlTmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHN1cGVyLnB1Ymxpc2goe2Rlc3RpbmF0aW9uOiBxdWV1ZU5hbWUgYXMgc3RyaW5nLCBib2R5OiBtZXNzYWdlLCBoZWFkZXJzfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHB1YlBhcmFtczogcHVibGlzaFBhcmFtcyA9IHF1ZXVlTmFtZTtcbiAgICAgIHN1cGVyLnB1Ymxpc2gocHViUGFyYW1zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXQgd2lsbCBzdWJzY3JpYmUgdG8gc2VydmVyIG1lc3NhZ2UgcXVldWVzXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBzYWZlbHkgY2FsbGVkIGV2ZW4gaWYgdGhlIFNUT01QIGJyb2tlciBpcyBub3QgY29ubmVjdGVkLlxuICAgKiBJZiB0aGUgdW5kZXJseWluZyBTVE9NUCBjb25uZWN0aW9uIGRyb3BzIGFuZCByZWNvbm5lY3RzLCBpdCB3aWxsIHJlc3Vic2NyaWJlIGF1dG9tYXRpY2FsbHkuXG4gICAqXG4gICAqIElmIGEgaGVhZGVyIGZpZWxkICdhY2snIGlzIG5vdCBleHBsaWNpdGx5IHBhc3NlZCwgJ2Fjaycgd2lsbCBiZSBzZXQgdG8gJ2F1dG8nLiBJZiB5b3VcbiAgICogZG8gbm90IHVuZGVyc3RhbmQgd2hhdCBpdCBtZWFucywgcGxlYXNlIGxlYXZlIGl0IGFzIGlzLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgd2hlbiB3b3JraW5nIHdpdGggdGVtcG9yYXJ5IHF1ZXVlcyB3aGVyZSB0aGUgc3Vic2NyaXB0aW9uIHJlcXVlc3RcbiAgICogY3JlYXRlcyB0aGVcbiAgICogdW5kZXJseWluZyBxdWV1ZSwgbXNzYWdlcyBtaWdodCBiZSBtaXNzZWQgZHVyaW5nIHJlY29ubmVjdC4gVGhpcyBpc3N1ZSBpcyBub3Qgc3BlY2lmaWNcbiAgICogdG8gdGhpcyBsaWJyYXJ5IGJ1dCB0aGUgd2F5IFNUT01QIGJyb2tlcnMgYXJlIGRlc2lnbmVkIHRvIHdvcmsuXG4gICAqXG4gICAqIEBwYXJhbSBxdWV1ZU5hbWVcbiAgICogQHBhcmFtIGhlYWRlcnNcbiAgICovXG4gIHB1YmxpYyBzdWJzY3JpYmUocXVldWVOYW1lOiBzdHJpbmcsIGhlYWRlcnM6IFN0b21wSGVhZGVycyA9IHt9KTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMud2F0Y2gocXVldWVOYW1lLCBoZWFkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTVE9NUCBicm9rZXJzIG1heSBjYXJyeSBvdXQgb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5IGFuZCBhbGxvdyByZXF1ZXN0aW5nIGZvciBhY2tub3dsZWRnZW1lbnQuXG4gICAqIFRvIHJlcXVlc3QgYW4gYWNrbm93bGVkZ2VtZW50LCBhIGByZWNlaXB0YCBoZWFkZXIgbmVlZHMgdG8gYmUgc2VudCB3aXRoIHRoZSBhY3R1YWwgcmVxdWVzdC5cbiAgICogVGhlIHZhbHVlIChzYXkgcmVjZWlwdC1pZCkgZm9yIHRoaXMgaGVhZGVyIG5lZWRzIHRvIGJlIHVuaXF1ZSBmb3IgZWFjaCB1c2UuIFR5cGljYWxseSBhIHNlcXVlbmNlLCBhIFVVSUQsIGFcbiAgICogcmFuZG9tIG51bWJlciBvciBhIGNvbWJpbmF0aW9uIG1heSBiZSB1c2VkLlxuICAgKlxuICAgKiBBIGNvbXBsYWludCBicm9rZXIgd2lsbCBzZW5kIGEgUkVDRUlQVCBmcmFtZSB3aGVuIGFuIG9wZXJhdGlvbiBoYXMgYWN0dWFsbHkgYmVlbiBjb21wbGV0ZWQuXG4gICAqIFRoZSBvcGVyYXRpb24gbmVlZHMgdG8gYmUgbWF0Y2hlZCBiYXNlZCBpbiB0aGUgdmFsdWUgb2YgdGhlIHJlY2VpcHQtaWQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGFsbG93IHdhdGNoaW5nIGZvciBhIHJlY2VpcHQgYW5kIGludm9rZSB0aGUgY2FsbGJhY2tcbiAgICogd2hlbiBjb3JyZXNwb25kaW5nIHJlY2VpcHQgaGFzIGJlZW4gcmVjZWl2ZWQuXG4gICAqXG4gICAqIFRoZSBhY3R1YWwge0BsaW5rIGh0dHBzOi8vc3RvbXAtanMuZ2l0aHViLmlvL3N0b21wanMvY2xhc3Nlcy9GcmFtZS5odG1sfVxuICAgKiB3aWxsIGJlIHBhc3NlZCBhcyBwYXJhbWV0ZXIgdG8gdGhlIGNhbGxiYWNrLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqICAgICAgICAvLyBQdWJsaXNoaW5nIHdpdGggYWNrbm93bGVkZ2VtZW50XG4gICAqICAgICAgICBsZXQgcmVjZWlwdElkID0gcmFuZG9tVGV4dCgpO1xuICAgKlxuICAgKiAgICAgICAgcnhTdG9tcC53YWl0Rm9yUmVjZWlwdChyZWNlaXB0SWQsIGZ1bmN0aW9uKCkge1xuICAgKiAgICAgICAgICAvLyBXaWxsIGJlIGNhbGxlZCBhZnRlciBzZXJ2ZXIgYWNrbm93bGVkZ2VzXG4gICAqICAgICAgICB9KTtcbiAgICogICAgICAgIHJ4U3RvbXAucHVibGlzaCh7ZGVzdGluYXRpb246IFRFU1QuZGVzdGluYXRpb24sIGhlYWRlcnM6IHtyZWNlaXB0OiByZWNlaXB0SWR9LCBib2R5OiBtc2d9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIE1hcHMgdG86IGh0dHBzOi8vc3RvbXAtanMuZ2l0aHViLmlvL3N0b21wanMvY2xhc3Nlcy9DbGllbnQuaHRtbCN3YXRjaEZvclJlY2VpcHRcbiAgICovXG4gIHB1YmxpYyB3YWl0Rm9yUmVjZWlwdChyZWNlaXB0SWQ6IHN0cmluZywgY2FsbGJhY2s6IChmcmFtZTogRnJhbWUpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBzdXBlci53YXRjaEZvclJlY2VpcHQocmVjZWlwdElkLCBjYWxsYmFjayk7XG4gIH1cblxuICBnZXQgY2xpZW50KCk6IENsaWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b21wQ2xpZW50O1xuICB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnN0YXRlID0gbmV3IEJlaGF2aW9yU3ViamVjdDxTdG9tcFN0YXRlPihTdG9tcFN0YXRlLkNMT1NFRCk7XG5cbiAgICB0aGlzLmNvbm5lY3Rpb25TdGF0ZSQuc3Vic2NyaWJlKChzdDogUnhTdG9tcFN0YXRlKSA9PiB7XG4gICAgICB0aGlzLnN0YXRlLm5leHQoU3RvbXBSU2VydmljZS5fbWFwU3RvbXBTdGF0ZShzdCkpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdG9tcEhlYWRlcnMgfSBmcm9tICdAc3RvbXAvc3RvbXBqcyc7XG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb25maWd1cmF0aW9uIG9iamVjdCBmb3IgdGhlXG4gKiBTVE9NUFNlcnZpY2UgdG8gY29ubmVjdCB0by5cbiAqL1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RvbXBDb25maWcge1xuICAvKipcbiAgICogU2VydmVyIFVSTCB0byBjb25uZWN0IHRvLiBQbGVhc2UgcmVmZXIgdG8geW91ciBTVE9NUCBicm9rZXIgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy5cbiAgICpcbiAgICogRXhhbXBsZTogd3M6Ly8xMjcuMC4wLjE6MTU2NzQvd3MgKGZvciBhIFJhYmJpdE1RIGRlZmF1bHQgc2V0dXAgcnVubmluZyBvbiBsb2NhbGhvc3QpXG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHkgdGhpcyBwYXJhbWV0ZXIgY2FuIGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCBzaW1pbGFyIHRvIFdlYlNvY2tldFxuICAgKiAodHlwaWNhbGx5IFNvY2tKUyBpbnN0YW5jZSkuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqXG4gICAqICgpID0+IHtcbiAgICogICByZXR1cm4gbmV3IFNvY2tKUygnaHR0cDovLzEyNy4wLjAuMToxNTY3NC9zdG9tcCcpO1xuICAgKiB9XG4gICAqL1xuICB1cmw6IHN0cmluZyB8ICgoKSA9PiBhbnkpO1xuXG4gIC8qKlxuICAgKiBIZWFkZXJzXG4gICAqIFR5cGljYWwga2V5czogbG9naW46IHN0cmluZywgcGFzc2NvZGU6IHN0cmluZy5cbiAgICogaG9zdDpzdHJpbmcgd2lsbCBuZWVlZCB0byBiZSBwYXNzZWQgZm9yIHZpcnR1YWwgaG9zdHMgaW4gUmFiYml0TVFcbiAgICovXG4gIGhlYWRlcnM6IFN0b21wSGVhZGVycztcblxuICAvKiogSG93IG9mdGVuIHRvIGluY29taW5nIGhlYXJ0YmVhdD9cbiAgICogSW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzLCBzZXQgdG8gMCB0byBkaXNhYmxlXG4gICAqXG4gICAqIFR5cGljYWwgdmFsdWUgMCAtIGRpc2FibGVkXG4gICAqL1xuICBoZWFydGJlYXRfaW46IG51bWJlcjtcblxuICAvKipcbiAgICogSG93IG9mdGVuIHRvIG91dGdvaW5nIGhlYXJ0YmVhdD9cbiAgICogSW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzLCBzZXQgdG8gMCB0byBkaXNhYmxlXG4gICAqXG4gICAqIFR5cGljYWwgdmFsdWUgMjAwMDAgLSBldmVyeSAyMCBzZWNvbmRzXG4gICAqL1xuICBoZWFydGJlYXRfb3V0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFdhaXQgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSBhdHRlbXB0aW5nIGF1dG8gcmVjb25uZWN0XG4gICAqIFNldCB0byAwIHRvIGRpc2FibGVcbiAgICpcbiAgICogVHlwaWNhbCB2YWx1ZSA1MDAwICg1IHNlY29uZHMpXG4gICAqL1xuICByZWNvbm5lY3RfZGVsYXk6IG51bWJlcjtcblxuICAvKiogRW5hYmxlIGNsaWVudCBkZWJ1Z2dpbmc/ICovXG4gIGRlYnVnOiBib29sZWFuO1xufVxuIiwiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdG9tcENvbmZpZyB9IGZyb20gJy4vc3RvbXAuY29uZmlnJztcblxuaW1wb3J0IHsgU3RvbXBSU2VydmljZSB9IGZyb20gJy4vc3RvbXAtci5zZXJ2aWNlJztcblxuLyoqXG4gKiBBbmd1bGFyMiBTVE9NUCBTZXJ2aWNlIHVzaW5nIEBzdG9tcC9zdG9tcC5qc1xuICpcbiAqIEBkZXNjcmlwdGlvbiBUaGlzIHNlcnZpY2UgaGFuZGxlcyBzdWJzY3JpYmluZyB0byBhXG4gKiBtZXNzYWdlIHF1ZXVlIHVzaW5nIHRoZSBzdG9tcC5qcyBsaWJyYXJ5LCBhbmQgcmV0dXJuc1xuICogdmFsdWVzIHZpYSB0aGUgRVM2IE9ic2VydmFibGUgc3BlY2lmaWNhdGlvbiBmb3JcbiAqIGFzeW5jaHJvbm91cyB2YWx1ZSBzdHJlYW1pbmcgYnkgd2lyaW5nIHRoZSBTVE9NUFxuICogbWVzc2FnZXMgaW50byBhbiBvYnNlcnZhYmxlLlxuICpcbiAqIElmIHlvdSB3YW50IHRvIG1hbnVhbGx5IGNvbmZpZ3VyZSBhbmQgaW5pdGlhbGl6ZSB0aGUgc2VydmljZVxuICogcGxlYXNlIHVzZSBTdG9tcFJTZXJ2aWNlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdG9tcFNlcnZpY2UgZXh0ZW5kcyBTdG9tcFJTZXJ2aWNlIHtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3JcbiAgICpcbiAgICogU2VlIFJFQURNRSBhbmQgc2FtcGxlcyBmb3IgY29uZmlndXJhdGlvbiBleGFtcGxlc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNvbmZpZzogU3RvbXBDb25maWcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5pbml0QW5kQ29ubmVjdCgpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSeFN0b21wIH0gZnJvbSAnQHN0b21wL3J4LXN0b21wJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJ4U3RvbXBTZXJ2aWNlIGV4dGVuZHMgUnhTdG9tcCB7IH1cbiIsImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1J4U3RvbXBSUENDb25maWd9IGZyb20gJ0BzdG9tcC9yeC1zdG9tcCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJbmplY3RhYmxlUnhTdG9tcFJwY0NvbmZpZyBleHRlbmRzIFJ4U3RvbXBSUENDb25maWcgeyB9XG4iLCJpbXBvcnQge0luamVjdGFibGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSeFN0b21wUlBDfSBmcm9tICdAc3RvbXAvcngtc3RvbXAnO1xuaW1wb3J0IHtSeFN0b21wU2VydmljZX0gZnJvbSAnLi9yeC1zdG9tcC5zZXJ2aWNlJztcbmltcG9ydCB7SW5qZWN0YWJsZVJ4U3RvbXBScGNDb25maWd9IGZyb20gJy4vaW5qZWN0YWJsZS1yeC1zdG9tcC1ycGMtY29uZmlnJztcblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBSUEMgc2VydmljZSB1c2luZyBtZXNzYWdpbmcuXG4gKlxuICogUGxlYXNlIHNlZSB0aGUgW2d1aWRlXSguLi9hZGRpdGlvbmFsLWRvY3VtZW50YXRpb24vcnBjLS0tcmVtb3RlLXByb2NlZHVyZS1jYWxsLmh0bWwpIGZvciBkZXRhaWxzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnhTdG9tcFJQQ1NlcnZpY2UgZXh0ZW5kcyBSeFN0b21wUlBDIHtcbiAgY29uc3RydWN0b3IocnhTdG9tcDogUnhTdG9tcFNlcnZpY2UsIEBPcHRpb25hbCgpIHN0b21wUlBDQ29uZmlnPzogSW5qZWN0YWJsZVJ4U3RvbXBScGNDb25maWcpIHtcbiAgICBzdXBlcihyeFN0b21wLCBzdG9tcFJQQ0NvbmZpZyk7XG4gIH1cbn1cbiIsImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1J4U3RvbXBDb25maWd9IGZyb20gJ0BzdG9tcC9yeC1zdG9tcCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJbmplY3RhYmxlUnhTdG9tcENvbmZpZyBleHRlbmRzIFJ4U3RvbXBDb25maWcgeyB9XG4iLCJpbXBvcnQge0luamVjdGFibGVSeFN0b21wQ29uZmlnfSBmcm9tICcuL2luamVjdGFibGUtcngtc3RvbXAtY29uZmlnJztcbmltcG9ydCB7UnhTdG9tcFNlcnZpY2V9IGZyb20gJy4vcngtc3RvbXAuc2VydmljZSc7XG5pbXBvcnQge1Rlc3RCZWR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvdGVzdGluZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByeFN0b21wU2VydmljZUZhY3RvcnkocnhTdG9tcENvbmZpZzogSW5qZWN0YWJsZVJ4U3RvbXBDb25maWcpOiBSeFN0b21wU2VydmljZSB7XG4gIGNvbnN0IHJ4U3RvbXBTZXJ2aWNlID0gbmV3IFJ4U3RvbXBTZXJ2aWNlKCk7XG5cbiAgcnhTdG9tcFNlcnZpY2UuY29uZmlndXJlKFRlc3RCZWQuZ2V0KEluamVjdGFibGVSeFN0b21wQ29uZmlnKSk7XG4gIHJ4U3RvbXBTZXJ2aWNlLmFjdGl2YXRlKCk7XG5cbiAgcmV0dXJuIHJ4U3RvbXBTZXJ2aWNlO1xufVxuIl0sIm5hbWVzIjpbInRzbGliXzEuX19leHRlbmRzIiwiQmVoYXZpb3JTdWJqZWN0IiwiUnhTdG9tcFN0YXRlIiwibWFwIiwiSW5qZWN0YWJsZSIsIlJ4U3RvbXAiLCJSeFN0b21wUlBDQ29uZmlnIiwicnhTdG9tcCIsIk9wdGlvbmFsIiwiUnhTdG9tcFJQQyIsIlJ4U3RvbXBDb25maWciLCJUZXN0QmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBQTs7Ozs7Ozs7Ozs7Ozs7SUFjQTtJQUVBLElBQUksYUFBYSxHQUFHLFVBQVMsQ0FBQyxFQUFFLENBQUM7UUFDN0IsYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjO2FBQ2hDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxZQUFZLEtBQUssSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzVFLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQUUsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztvQkFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMvRSxPQUFPLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0FBRUYsdUJBQTBCLENBQUMsRUFBRSxDQUFDO1FBQzFCLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsZ0JBQWdCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDdkMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUNBa0NBLGlDQUFPOzt3QkErTHRDLGlCQUFPO1lBRVAsS0FBSSxDQUFDLEtBQUssR0FBRyxJQUFJQyxvQkFBZSxDQUFh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
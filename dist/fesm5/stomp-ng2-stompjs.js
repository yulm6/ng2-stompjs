import { __extends } from 'tslib';
import { Injectable, Optional } from '@angular/core';
import { RxStomp, RxStompState, RxStompRPCConfig, RxStompRPC, RxStompConfig } from '@stomp/rx-stomp';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';

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
var StompRService = /** @class */ (function (_super) {
    __extends(StompRService, _super);
    function StompRService() {
        var _this = _super.call(this) || this;
        _this.state = new BehaviorSubject(StompState.CLOSED);
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
        if (st === RxStompState.CONNECTING) {
            return StompState.TRYING;
        }
        if (st === RxStompState.OPEN) {
            return StompState.CONNECTED;
        }
        if (st === RxStompState.CLOSING) {
            return StompState.DISCONNECTING;
        }
        if (st === RxStompState.CLOSED) {
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
         */
        function () {
            return this.connected$.pipe(map(function (st) {
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
         */
        function () {
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
         */
        function () {
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
         */
        function () {
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
         */
        function () {
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
         */
        function (config) {
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
        if (headers === void 0) { headers = {}; }
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
        if (headers === void 0) { headers = {}; }
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
         */
        function () {
            return this._stompClient;
        },
        enumerable: true,
        configurable: true
    });
    StompRService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    StompRService.ctorParameters = function () { return []; };
    return StompRService;
}(RxStomp));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Represents a configuration object for the
 * STOMPService to connect to.
 */
var StompConfig = /** @class */ (function () {
    function StompConfig() {
    }
    StompConfig.decorators = [
        { type: Injectable }
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
var StompService = /** @class */ (function (_super) {
    __extends(StompService, _super);
    function StompService(config) {
        var _this = _super.call(this) || this;
        _this.config = config;
        _this.initAndConnect();
        return _this;
    }
    StompService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    StompService.ctorParameters = function () { return [
        { type: StompConfig, },
    ]; };
    return StompService;
}(StompRService));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var RxStompService = /** @class */ (function (_super) {
    __extends(RxStompService, _super);
    function RxStompService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RxStompService.decorators = [
        { type: Injectable }
    ];
    return RxStompService;
}(RxStomp));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var InjectableRxStompRpcConfig = /** @class */ (function (_super) {
    __extends(InjectableRxStompRpcConfig, _super);
    function InjectableRxStompRpcConfig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InjectableRxStompRpcConfig.decorators = [
        { type: Injectable }
    ];
    return InjectableRxStompRpcConfig;
}(RxStompRPCConfig));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * An implementation of RPC service using messaging.
 *
 * Please see the [guide](../additional-documentation/rpc---remote-procedure-call.html) for details.
 */
var RxStompRPCService = /** @class */ (function (_super) {
    __extends(RxStompRPCService, _super);
    function RxStompRPCService(rxStomp, stompRPCConfig) {
        return _super.call(this, rxStomp, stompRPCConfig) || this;
    }
    RxStompRPCService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    RxStompRPCService.ctorParameters = function () { return [
        { type: RxStompService, },
        { type: InjectableRxStompRpcConfig, decorators: [{ type: Optional },] },
    ]; };
    return RxStompRPCService;
}(RxStompRPC));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var InjectableRxStompConfig = /** @class */ (function (_super) {
    __extends(InjectableRxStompConfig, _super);
    function InjectableRxStompConfig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InjectableRxStompConfig.decorators = [
        { type: Injectable }
    ];
    return InjectableRxStompConfig;
}(RxStompConfig));

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
    rxStompService.configure(TestBed.get(InjectableRxStompConfig));
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

export { StompRService, StompService, StompState, StompConfig, RxStompRPCService, RxStompService, InjectableRxStompConfig, InjectableRxStompRpcConfig, rxStompServiceFactory };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvbXAtbmcyLXN0b21wanMuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvc3RvbXAtci5zZXJ2aWNlLnRzIiwibmc6Ly9Ac3RvbXAvbmcyLXN0b21wanMvc3JjL3N0b21wLmNvbmZpZy50cyIsIm5nOi8vQHN0b21wL25nMi1zdG9tcGpzL3NyYy9zdG9tcC5zZXJ2aWNlLnRzIiwibmc6Ly9Ac3RvbXAvbmcyLXN0b21wanMvc3JjL3J4LXN0b21wLnNlcnZpY2UudHMiLCJuZzovL0BzdG9tcC9uZzItc3RvbXBqcy9zcmMvaW5qZWN0YWJsZS1yeC1zdG9tcC1ycGMtY29uZmlnLnRzIiwibmc6Ly9Ac3RvbXAvbmcyLXN0b21wanMvc3JjL3J4LXN0b21wLXJwYy5zZXJ2aWNlLnRzIiwibmc6Ly9Ac3RvbXAvbmcyLXN0b21wanMvc3JjL2luamVjdGFibGUtcngtc3RvbXAtY29uZmlnLnRzIiwibmc6Ly9Ac3RvbXAvbmcyLXN0b21wanMvc3JjL3J4LXN0b21wLXNlcnZpY2UtZmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J4U3RvbXAsIFJ4U3RvbXBDb25maWcsIFJ4U3RvbXBTdGF0ZX0gZnJvbSAnQHN0b21wL3J4LXN0b21wJztcblxuaW1wb3J0IHtwdWJsaXNoUGFyYW1zLCBDbGllbnQsIE1lc3NhZ2UsIEZyYW1lfSBmcm9tICdAc3RvbXAvc3RvbXBqcyc7XG5cbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7U3RvbXBTdGF0ZX0gZnJvbSAnLi9zdG9tcC1zdGF0ZSc7XG5pbXBvcnQgeyBTdG9tcEhlYWRlcnMgfSBmcm9tICcuL3N0b21wLWhlYWRlcnMnO1xuaW1wb3J0IHtTdG9tcENvbmZpZ30gZnJvbSAnLi9zdG9tcC5jb25maWcnO1xuXG4vKipcbiAqIEFuZ3VsYXIyIFNUT01QIFJhdyBTZXJ2aWNlIHVzaW5nIEBzdG9tcC9zdG9tcC5qc1xuICpcbiAqIFlvdSB3aWxsIG9ubHkgbmVlZCB0aGUgcHVibGljIHByb3BlcnRpZXMgYW5kXG4gKiBtZXRob2RzIGxpc3RlZCB1bmxlc3MgeW91IGFyZSBhbiBhZHZhbmNlZCB1c2VyLiBUaGlzIHNlcnZpY2UgaGFuZGxlcyBzdWJzY3JpYmluZyB0byBhXG4gKiBtZXNzYWdlIHF1ZXVlIHVzaW5nIHRoZSBzdG9tcC5qcyBsaWJyYXJ5LCBhbmQgcmV0dXJuc1xuICogdmFsdWVzIHZpYSB0aGUgRVM2IE9ic2VydmFibGUgc3BlY2lmaWNhdGlvbiBmb3JcbiAqIGFzeW5jaHJvbm91cyB2YWx1ZSBzdHJlYW1pbmcgYnkgd2lyaW5nIHRoZSBTVE9NUFxuICogbWVzc2FnZXMgaW50byBhbiBvYnNlcnZhYmxlLlxuICpcbiAqIElmIHlvdSB3aWxsIGxpa2UgdG8gcGFzcyB0aGUgY29uZmlndXJhdGlvbiBhcyBhIGRlcGVuZGVuY3ksXG4gKiBwbGVhc2UgdXNlIFN0b21wU2VydmljZSBjbGFzcy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFN0b21wUlNlcnZpY2UgZXh0ZW5kcyBSeFN0b21wIHtcbiAgLyoqXG4gICAqIFN0YXRlIG9mIHRoZSBTVE9NUFNlcnZpY2VcbiAgICpcbiAgICogSXQgaXMgYSBCZWhhdmlvclN1YmplY3QgYW5kIHdpbGwgZW1pdCBjdXJyZW50IHN0YXR1cyBpbW1lZGlhdGVseS4gVGhpcyB3aWxsIHR5cGljYWxseSBnZXRcbiAgICogdXNlZCB0byBzaG93IGN1cnJlbnQgc3RhdHVzIHRvIHRoZSBlbmQgdXNlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0ZTogQmVoYXZpb3JTdWJqZWN0PFN0b21wU3RhdGU+O1xuXG4gIHByaXZhdGUgc3RhdGljIF9tYXBTdG9tcFN0YXRlKHN0OiBSeFN0b21wU3RhdGUpOiBTdG9tcFN0YXRlIHtcbiAgICBpZiAoc3QgPT09IFJ4U3RvbXBTdGF0ZS5DT05ORUNUSU5HKSB7XG4gICAgICByZXR1cm4gU3RvbXBTdGF0ZS5UUllJTkc7XG4gICAgfVxuICAgIGlmIChzdCA9PT0gUnhTdG9tcFN0YXRlLk9QRU4pIHtcbiAgICAgIHJldHVybiBTdG9tcFN0YXRlLkNPTk5FQ1RFRDtcbiAgICB9XG4gICAgaWYgKHN0ID09PSBSeFN0b21wU3RhdGUuQ0xPU0lORykge1xuICAgICAgcmV0dXJuIFN0b21wU3RhdGUuRElTQ09OTkVDVElORztcbiAgICB9XG4gICAgaWYgKHN0ID09PSBSeFN0b21wU3RhdGUuQ0xPU0VEKSB7XG4gICAgICByZXR1cm4gU3RvbXBTdGF0ZS5DTE9TRUQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgdHJpZ2dlciB3aGVuIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWQuIFVzZSB0aGlzIHRvIGNhcnJ5IG91dCBpbml0aWFsaXphdGlvbi5cbiAgICogSXQgd2lsbCB0cmlnZ2VyIGV2ZXJ5IHRpbWUgYSAocmUpY29ubmVjdGlvbiBvY2N1cnMuIElmIGl0IGlzIGFscmVhZHkgY29ubmVjdGVkXG4gICAqIGl0IHdpbGwgdHJpZ2dlciBpbW1lZGlhdGVseS4gWW91IGNhbiBzYWZlbHkgaWdub3JlIHRoZSB2YWx1ZSwgYXMgaXQgd2lsbCBhbHdheXMgYmVcbiAgICogU3RvbXBTdGF0ZS5DT05ORUNURURcbiAgICovXG4gIGdldCBjb25uZWN0T2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPFN0b21wU3RhdGU+IHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0ZWQkLnBpcGUobWFwKChzdDogUnhTdG9tcFN0YXRlKTogU3RvbXBTdGF0ZSA9PiB7XG4gICAgICByZXR1cm4gU3RvbXBSU2VydmljZS5fbWFwU3RvbXBTdGF0ZShzdCk7XG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGhlYWRlcnMgZnJvbSBtb3N0IHJlY2VudCBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIgYXMgcmV0dXJuIGJ5IHRoZSBDT05ORUNURURcbiAgICogZnJhbWUuXG4gICAqIElmIHRoZSBTVE9NUCBjb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gZXN0YWJsaXNoZWQgaXQgd2lsbCB0cmlnZ2VyIGltbWVkaWF0ZWx5LlxuICAgKiBJdCB3aWxsIGFkZGl0aW9uYWxseSB0cmlnZ2VyIGluIGV2ZW50IG9mIHJlY29ubmVjdGlvbiwgdGhlIHZhbHVlIHdpbGwgYmUgc2V0IG9mIGhlYWRlcnMgZnJvbVxuICAgKiB0aGUgcmVjZW50IHNlcnZlciByZXNwb25zZS5cbiAgICovXG4gIGdldCBzZXJ2ZXJIZWFkZXJzT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPFN0b21wSGVhZGVycz4ge1xuICAgIHJldHVybiB0aGlzLnNlcnZlckhlYWRlcnMkO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgZW1pdCBhbGwgbWVzc2FnZXMgdG8gdGhlIGRlZmF1bHQgcXVldWUgKGFueSBtZXNzYWdlIHRoYXQgYXJlIG5vdCBoYW5kbGVkIGJ5IGEgc3Vic2NyaXB0aW9uKVxuICAgKi9cbiAgZ2V0IGRlZmF1bHRNZXNzYWdlc09ic2VydmFibGUoKTogU3ViamVjdDxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMudW5oYW5kbGVkTWVzc2FnZSQ7XG4gIH1cblxuICAvKipcbiAgICogV2lsbCBlbWl0IGFsbCByZWNlaXB0c1xuICAgKi9cbiAgZ2V0IHJlY2VpcHRzT2JzZXJ2YWJsZSgpOiBTdWJqZWN0PEZyYW1lPiB7XG4gICAgcmV0dXJuIHRoaXMudW5oYW5kbGVkUmVjZWlwdHMkO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgdHJpZ2dlciB3aGVuIGFuIGVycm9yIG9jY3Vycy4gVGhpcyBTdWJqZWN0IGNhbiBiZSB1c2VkIHRvIGhhbmRsZSBlcnJvcnMgZnJvbVxuICAgKiB0aGUgc3RvbXAgYnJva2VyLlxuICAgKi9cbiAgZ2V0IGVycm9yU3ViamVjdCgpOiBTdWJqZWN0PHN0cmluZyB8IEZyYW1lPiB7XG4gICAgcmV0dXJuIHRoaXMuc3RvbXBFcnJvcnMkO1xuICB9XG5cbiAgLyoqIFNldCBjb25maWd1cmF0aW9uICovXG4gIHNldCBjb25maWcoY29uZmlnOiBTdG9tcENvbmZpZykge1xuICAgIGNvbnN0IHJ4U3RvbXBDb25maWc6IFJ4U3RvbXBDb25maWcgPSB7IH07XG5cbiAgICBpZiAodHlwZW9mKGNvbmZpZy51cmwpID09PSAnc3RyaW5nJykge1xuICAgICAgcnhTdG9tcENvbmZpZy5icm9rZXJVUkwgPSBjb25maWcudXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICByeFN0b21wQ29uZmlnLndlYlNvY2tldEZhY3RvcnkgPSBjb25maWcudXJsO1xuICAgIH1cblxuICAgIC8vIENvbmZpZ3VyZSBjbGllbnQgaGVhcnQtYmVhdGluZ1xuICAgIHJ4U3RvbXBDb25maWcuaGVhcnRiZWF0SW5jb21pbmcgPSBjb25maWcuaGVhcnRiZWF0X2luO1xuICAgIHJ4U3RvbXBDb25maWcuaGVhcnRiZWF0T3V0Z29pbmcgPSBjb25maWcuaGVhcnRiZWF0X291dDtcblxuICAgIC8vIEF1dG8gcmVjb25uZWN0XG4gICAgcnhTdG9tcENvbmZpZy5yZWNvbm5lY3REZWxheSA9IGNvbmZpZy5yZWNvbm5lY3RfZGVsYXk7XG5cbiAgICBpZiAoY29uZmlnLmRlYnVnKSB7XG4gICAgICByeFN0b21wQ29uZmlnLmRlYnVnID0gKHN0cjogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKG5ldyBEYXRlKCksIHN0cik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJ4U3RvbXBDb25maWcuY29ubmVjdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIHRoaXMuY29uZmlndXJlKHJ4U3RvbXBDb25maWcpO1xuICB9XG4gIC8qKlxuICAgKiBJdCB3aWxsIGNvbm5lY3QgdG8gdGhlIFNUT01QIGJyb2tlci5cbiAgICovXG4gIHB1YmxpYyBpbml0QW5kQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAvLyBkaXNjb25uZWN0IGlmIGNvbm5lY3RlZFxuICAgIHRoaXMuZGVhY3RpdmF0ZSgpO1xuXG4gICAgLy8gQXR0ZW1wdCBjb25uZWN0aW9uLCBwYXNzaW5nIGluIGEgY2FsbGJhY2tcbiAgICB0aGlzLmFjdGl2YXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogSXQgd2lsbCBkaXNjb25uZWN0IGZyb20gdGhlIFNUT01QIGJyb2tlci5cbiAgICovXG4gIHB1YmxpYyBkaXNjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0IHdpbGwgc2VuZCBhIG1lc3NhZ2UgdG8gYSBuYW1lZCBkZXN0aW5hdGlvbi4gVGhlIG1lc3NhZ2UgbXVzdCBiZSBgc3RyaW5nYC5cbiAgICpcbiAgICogVGhlIG1lc3NhZ2Ugd2lsbCBnZXQgbG9jYWxseSBxdWV1ZWQgaWYgdGhlIFNUT01QIGJyb2tlciBpcyBub3QgY29ubmVjdGVkLiBJdCB3aWxsIGF0dGVtcHQgdG9cbiAgICogcHVibGlzaCBxdWV1ZWQgbWVzc2FnZXMgYXMgc29vbiBhcyB0aGUgYnJva2VyIGdldHMgY29ubmVjdGVkLlxuICAgKlxuICAgKiBAcGFyYW0gcXVldWVOYW1lXG4gICAqIEBwYXJhbSBtZXNzYWdlXG4gICAqIEBwYXJhbSBoZWFkZXJzXG4gICAqL1xuICBwdWJsaWMgcHVibGlzaChxdWV1ZU5hbWU6IHN0cmluZ3xwdWJsaXNoUGFyYW1zLCBtZXNzYWdlPzogc3RyaW5nLCBoZWFkZXJzOiBTdG9tcEhlYWRlcnMgPSB7fSk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgcXVldWVOYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgc3VwZXIucHVibGlzaCh7ZGVzdGluYXRpb246IHF1ZXVlTmFtZSBhcyBzdHJpbmcsIGJvZHk6IG1lc3NhZ2UsIGhlYWRlcnN9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHViUGFyYW1zOiBwdWJsaXNoUGFyYW1zID0gcXVldWVOYW1lO1xuICAgICAgc3VwZXIucHVibGlzaChwdWJQYXJhbXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJdCB3aWxsIHN1YnNjcmliZSB0byBzZXJ2ZXIgbWVzc2FnZSBxdWV1ZXNcbiAgICpcbiAgICogVGhpcyBtZXRob2QgY2FuIGJlIHNhZmVseSBjYWxsZWQgZXZlbiBpZiB0aGUgU1RPTVAgYnJva2VyIGlzIG5vdCBjb25uZWN0ZWQuXG4gICAqIElmIHRoZSB1bmRlcmx5aW5nIFNUT01QIGNvbm5lY3Rpb24gZHJvcHMgYW5kIHJlY29ubmVjdHMsIGl0IHdpbGwgcmVzdWJzY3JpYmUgYXV0b21hdGljYWxseS5cbiAgICpcbiAgICogSWYgYSBoZWFkZXIgZmllbGQgJ2FjaycgaXMgbm90IGV4cGxpY2l0bHkgcGFzc2VkLCAnYWNrJyB3aWxsIGJlIHNldCB0byAnYXV0bycuIElmIHlvdVxuICAgKiBkbyBub3QgdW5kZXJzdGFuZCB3aGF0IGl0IG1lYW5zLCBwbGVhc2UgbGVhdmUgaXQgYXMgaXMuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB3aGVuIHdvcmtpbmcgd2l0aCB0ZW1wb3JhcnkgcXVldWVzIHdoZXJlIHRoZSBzdWJzY3JpcHRpb24gcmVxdWVzdFxuICAgKiBjcmVhdGVzIHRoZVxuICAgKiB1bmRlcmx5aW5nIHF1ZXVlLCBtc3NhZ2VzIG1pZ2h0IGJlIG1pc3NlZCBkdXJpbmcgcmVjb25uZWN0LiBUaGlzIGlzc3VlIGlzIG5vdCBzcGVjaWZpY1xuICAgKiB0byB0aGlzIGxpYnJhcnkgYnV0IHRoZSB3YXkgU1RPTVAgYnJva2VycyBhcmUgZGVzaWduZWQgdG8gd29yay5cbiAgICpcbiAgICogQHBhcmFtIHF1ZXVlTmFtZVxuICAgKiBAcGFyYW0gaGVhZGVyc1xuICAgKi9cbiAgcHVibGljIHN1YnNjcmliZShxdWV1ZU5hbWU6IHN0cmluZywgaGVhZGVyczogU3RvbXBIZWFkZXJzID0ge30pOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy53YXRjaChxdWV1ZU5hbWUsIGhlYWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNUT01QIGJyb2tlcnMgbWF5IGNhcnJ5IG91dCBvcGVyYXRpb24gYXN5bmNocm9ub3VzbHkgYW5kIGFsbG93IHJlcXVlc3RpbmcgZm9yIGFja25vd2xlZGdlbWVudC5cbiAgICogVG8gcmVxdWVzdCBhbiBhY2tub3dsZWRnZW1lbnQsIGEgYHJlY2VpcHRgIGhlYWRlciBuZWVkcyB0byBiZSBzZW50IHdpdGggdGhlIGFjdHVhbCByZXF1ZXN0LlxuICAgKiBUaGUgdmFsdWUgKHNheSByZWNlaXB0LWlkKSBmb3IgdGhpcyBoZWFkZXIgbmVlZHMgdG8gYmUgdW5pcXVlIGZvciBlYWNoIHVzZS4gVHlwaWNhbGx5IGEgc2VxdWVuY2UsIGEgVVVJRCwgYVxuICAgKiByYW5kb20gbnVtYmVyIG9yIGEgY29tYmluYXRpb24gbWF5IGJlIHVzZWQuXG4gICAqXG4gICAqIEEgY29tcGxhaW50IGJyb2tlciB3aWxsIHNlbmQgYSBSRUNFSVBUIGZyYW1lIHdoZW4gYW4gb3BlcmF0aW9uIGhhcyBhY3R1YWxseSBiZWVuIGNvbXBsZXRlZC5cbiAgICogVGhlIG9wZXJhdGlvbiBuZWVkcyB0byBiZSBtYXRjaGVkIGJhc2VkIGluIHRoZSB2YWx1ZSBvZiB0aGUgcmVjZWlwdC1pZC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgYWxsb3cgd2F0Y2hpbmcgZm9yIGEgcmVjZWlwdCBhbmQgaW52b2tlIHRoZSBjYWxsYmFja1xuICAgKiB3aGVuIGNvcnJlc3BvbmRpbmcgcmVjZWlwdCBoYXMgYmVlbiByZWNlaXZlZC5cbiAgICpcbiAgICogVGhlIGFjdHVhbCB7QGxpbmsgaHR0cHM6Ly9zdG9tcC1qcy5naXRodWIuaW8vc3RvbXBqcy9jbGFzc2VzL0ZyYW1lLmh0bWx9XG4gICAqIHdpbGwgYmUgcGFzc2VkIGFzIHBhcmFtZXRlciB0byB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogICAgICAgIC8vIFB1Ymxpc2hpbmcgd2l0aCBhY2tub3dsZWRnZW1lbnRcbiAgICogICAgICAgIGxldCByZWNlaXB0SWQgPSByYW5kb21UZXh0KCk7XG4gICAqXG4gICAqICAgICAgICByeFN0b21wLndhaXRGb3JSZWNlaXB0KHJlY2VpcHRJZCwgZnVuY3Rpb24oKSB7XG4gICAqICAgICAgICAgIC8vIFdpbGwgYmUgY2FsbGVkIGFmdGVyIHNlcnZlciBhY2tub3dsZWRnZXNcbiAgICogICAgICAgIH0pO1xuICAgKiAgICAgICAgcnhTdG9tcC5wdWJsaXNoKHtkZXN0aW5hdGlvbjogVEVTVC5kZXN0aW5hdGlvbiwgaGVhZGVyczoge3JlY2VpcHQ6IHJlY2VpcHRJZH0sIGJvZHk6IG1zZ30pO1xuICAgKiBgYGBcbiAgICpcbiAgICogTWFwcyB0bzogaHR0cHM6Ly9zdG9tcC1qcy5naXRodWIuaW8vc3RvbXBqcy9jbGFzc2VzL0NsaWVudC5odG1sI3dhdGNoRm9yUmVjZWlwdFxuICAgKi9cbiAgcHVibGljIHdhaXRGb3JSZWNlaXB0KHJlY2VpcHRJZDogc3RyaW5nLCBjYWxsYmFjazogKGZyYW1lOiBGcmFtZSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHN1cGVyLndhdGNoRm9yUmVjZWlwdChyZWNlaXB0SWQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldCBjbGllbnQoKTogQ2xpZW50IHtcbiAgICByZXR1cm4gdGhpcy5fc3RvbXBDbGllbnQ7XG4gIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc3RhdGUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFN0b21wU3RhdGU+KFN0b21wU3RhdGUuQ0xPU0VEKTtcblxuICAgIHRoaXMuY29ubmVjdGlvblN0YXRlJC5zdWJzY3JpYmUoKHN0OiBSeFN0b21wU3RhdGUpID0+IHtcbiAgICAgIHRoaXMuc3RhdGUubmV4dChTdG9tcFJTZXJ2aWNlLl9tYXBTdG9tcFN0YXRlKHN0KSk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN0b21wSGVhZGVycyB9IGZyb20gJ0BzdG9tcC9zdG9tcGpzJztcbi8qKlxuICogUmVwcmVzZW50cyBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciB0aGVcbiAqIFNUT01QU2VydmljZSB0byBjb25uZWN0IHRvLlxuICovXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdG9tcENvbmZpZyB7XG4gIC8qKlxuICAgKiBTZXJ2ZXIgVVJMIHRvIGNvbm5lY3QgdG8uIFBsZWFzZSByZWZlciB0byB5b3VyIFNUT01QIGJyb2tlciBkb2N1bWVudGF0aW9uIGZvciBkZXRhaWxzLlxuICAgKlxuICAgKiBFeGFtcGxlOiB3czovLzEyNy4wLjAuMToxNTY3NC93cyAoZm9yIGEgUmFiYml0TVEgZGVmYXVsdCBzZXR1cCBydW5uaW5nIG9uIGxvY2FsaG9zdClcbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSB0aGlzIHBhcmFtZXRlciBjYW4gYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHNpbWlsYXIgdG8gV2ViU29ja2V0XG4gICAqICh0eXBpY2FsbHkgU29ja0pTIGluc3RhbmNlKS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICpcbiAgICogKCkgPT4ge1xuICAgKiAgIHJldHVybiBuZXcgU29ja0pTKCdodHRwOi8vMTI3LjAuMC4xOjE1Njc0L3N0b21wJyk7XG4gICAqIH1cbiAgICovXG4gIHVybDogc3RyaW5nIHwgKCgpID0+IGFueSk7XG5cbiAgLyoqXG4gICAqIEhlYWRlcnNcbiAgICogVHlwaWNhbCBrZXlzOiBsb2dpbjogc3RyaW5nLCBwYXNzY29kZTogc3RyaW5nLlxuICAgKiBob3N0OnN0cmluZyB3aWxsIG5lZWVkIHRvIGJlIHBhc3NlZCBmb3IgdmlydHVhbCBob3N0cyBpbiBSYWJiaXRNUVxuICAgKi9cbiAgaGVhZGVyczogU3RvbXBIZWFkZXJzO1xuXG4gIC8qKiBIb3cgb2Z0ZW4gdG8gaW5jb21pbmcgaGVhcnRiZWF0P1xuICAgKiBJbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMsIHNldCB0byAwIHRvIGRpc2FibGVcbiAgICpcbiAgICogVHlwaWNhbCB2YWx1ZSAwIC0gZGlzYWJsZWRcbiAgICovXG4gIGhlYXJ0YmVhdF9pbjogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBIb3cgb2Z0ZW4gdG8gb3V0Z29pbmcgaGVhcnRiZWF0P1xuICAgKiBJbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMsIHNldCB0byAwIHRvIGRpc2FibGVcbiAgICpcbiAgICogVHlwaWNhbCB2YWx1ZSAyMDAwMCAtIGV2ZXJ5IDIwIHNlY29uZHNcbiAgICovXG4gIGhlYXJ0YmVhdF9vdXQ6IG51bWJlcjtcblxuICAvKipcbiAgICogV2FpdCBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIGF0dGVtcHRpbmcgYXV0byByZWNvbm5lY3RcbiAgICogU2V0IHRvIDAgdG8gZGlzYWJsZVxuICAgKlxuICAgKiBUeXBpY2FsIHZhbHVlIDUwMDAgKDUgc2Vjb25kcylcbiAgICovXG4gIHJlY29ubmVjdF9kZWxheTogbnVtYmVyO1xuXG4gIC8qKiBFbmFibGUgY2xpZW50IGRlYnVnZ2luZz8gKi9cbiAgZGVidWc6IGJvb2xlYW47XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFN0b21wQ29uZmlnIH0gZnJvbSAnLi9zdG9tcC5jb25maWcnO1xuXG5pbXBvcnQgeyBTdG9tcFJTZXJ2aWNlIH0gZnJvbSAnLi9zdG9tcC1yLnNlcnZpY2UnO1xuXG4vKipcbiAqIEFuZ3VsYXIyIFNUT01QIFNlcnZpY2UgdXNpbmcgQHN0b21wL3N0b21wLmpzXG4gKlxuICogQGRlc2NyaXB0aW9uIFRoaXMgc2VydmljZSBoYW5kbGVzIHN1YnNjcmliaW5nIHRvIGFcbiAqIG1lc3NhZ2UgcXVldWUgdXNpbmcgdGhlIHN0b21wLmpzIGxpYnJhcnksIGFuZCByZXR1cm5zXG4gKiB2YWx1ZXMgdmlhIHRoZSBFUzYgT2JzZXJ2YWJsZSBzcGVjaWZpY2F0aW9uIGZvclxuICogYXN5bmNocm9ub3VzIHZhbHVlIHN0cmVhbWluZyBieSB3aXJpbmcgdGhlIFNUT01QXG4gKiBtZXNzYWdlcyBpbnRvIGFuIG9ic2VydmFibGUuXG4gKlxuICogSWYgeW91IHdhbnQgdG8gbWFudWFsbHkgY29uZmlndXJlIGFuZCBpbml0aWFsaXplIHRoZSBzZXJ2aWNlXG4gKiBwbGVhc2UgdXNlIFN0b21wUlNlcnZpY2VcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFN0b21wU2VydmljZSBleHRlbmRzIFN0b21wUlNlcnZpY2Uge1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvclxuICAgKlxuICAgKiBTZWUgUkVBRE1FIGFuZCBzYW1wbGVzIGZvciBjb25maWd1cmF0aW9uIGV4YW1wbGVzXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoY29uZmlnOiBTdG9tcENvbmZpZykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmluaXRBbmRDb25uZWN0KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJ4U3RvbXAgfSBmcm9tICdAc3RvbXAvcngtc3RvbXAnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnhTdG9tcFNlcnZpY2UgZXh0ZW5kcyBSeFN0b21wIHsgfVxuIiwiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UnhTdG9tcFJQQ0NvbmZpZ30gZnJvbSAnQHN0b21wL3J4LXN0b21wJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEluamVjdGFibGVSeFN0b21wUnBjQ29uZmlnIGV4dGVuZHMgUnhTdG9tcFJQQ0NvbmZpZyB7IH1cbiIsImltcG9ydCB7SW5qZWN0YWJsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J4U3RvbXBSUEN9IGZyb20gJ0BzdG9tcC9yeC1zdG9tcCc7XG5pbXBvcnQge1J4U3RvbXBTZXJ2aWNlfSBmcm9tICcuL3J4LXN0b21wLnNlcnZpY2UnO1xuaW1wb3J0IHtJbmplY3RhYmxlUnhTdG9tcFJwY0NvbmZpZ30gZnJvbSAnLi9pbmplY3RhYmxlLXJ4LXN0b21wLXJwYy1jb25maWcnO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIFJQQyBzZXJ2aWNlIHVzaW5nIG1lc3NhZ2luZy5cbiAqXG4gKiBQbGVhc2Ugc2VlIHRoZSBbZ3VpZGVdKC4uL2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbi9ycGMtLS1yZW1vdGUtcHJvY2VkdXJlLWNhbGwuaHRtbCkgZm9yIGRldGFpbHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSeFN0b21wUlBDU2VydmljZSBleHRlbmRzIFJ4U3RvbXBSUEMge1xuICBjb25zdHJ1Y3RvcihyeFN0b21wOiBSeFN0b21wU2VydmljZSwgQE9wdGlvbmFsKCkgc3RvbXBSUENDb25maWc/OiBJbmplY3RhYmxlUnhTdG9tcFJwY0NvbmZpZykge1xuICAgIHN1cGVyKHJ4U3RvbXAsIHN0b21wUlBDQ29uZmlnKTtcbiAgfVxufVxuIiwiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UnhTdG9tcENvbmZpZ30gZnJvbSAnQHN0b21wL3J4LXN0b21wJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEluamVjdGFibGVSeFN0b21wQ29uZmlnIGV4dGVuZHMgUnhTdG9tcENvbmZpZyB7IH1cbiIsImltcG9ydCB7SW5qZWN0YWJsZVJ4U3RvbXBDb25maWd9IGZyb20gJy4vaW5qZWN0YWJsZS1yeC1zdG9tcC1jb25maWcnO1xuaW1wb3J0IHtSeFN0b21wU2VydmljZX0gZnJvbSAnLi9yeC1zdG9tcC5zZXJ2aWNlJztcbmltcG9ydCB7VGVzdEJlZH0gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJ4U3RvbXBTZXJ2aWNlRmFjdG9yeShyeFN0b21wQ29uZmlnOiBJbmplY3RhYmxlUnhTdG9tcENvbmZpZyk6IFJ4U3RvbXBTZXJ2aWNlIHtcbiAgY29uc3QgcnhTdG9tcFNlcnZpY2UgPSBuZXcgUnhTdG9tcFNlcnZpY2UoKTtcblxuICByeFN0b21wU2VydmljZS5jb25maWd1cmUoVGVzdEJlZC5nZXQoSW5qZWN0YWJsZVJ4U3RvbXBDb25maWcpKTtcbiAgcnhTdG9tcFNlcnZpY2UuYWN0aXZhdGUoKTtcblxuICByZXR1cm4gcnhTdG9tcFNlcnZpY2U7XG59XG4iXSwibmFtZXMiOlsidHNsaWJfMS5fX2V4dGVuZHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBMkJtQ0EsaUNBQU87O29CQStMdEMsaUJBQU87UUFFUCxLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBZSxDQUFhLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVoRSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFVBQUMsRUFBZ0I7WUFDL0MsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ25ELENBQUMsQ0FBQzs7Ozs7OztJQTVMVSw0QkFBYzs7OztjQUFDLEVBQWdCO1FBQzVDLElBQUksRUFBRSxLQUFLLFlBQVksQ0FBQyxVQUFVLEVBQUU7WUFDbEMsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxFQUFFLEtBQUssWUFBWSxDQUFDLElBQUksRUFBRTtZQUM1QixPQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUM7U0FDN0I7UUFDRCxJQUFJLEVBQUUsS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO1lBQy9CLE9BQU8sVUFBVSxDQUFDLGFBQWEsQ0FBQztTQUNqQztRQUNELElBQUksRUFBRSxLQUFLLFlBQVksQ0FBQyxNQUFNLEVBQUU7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
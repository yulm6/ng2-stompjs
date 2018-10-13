/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { first, filter, share } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as Stomp from '@stomp/stompjs';
import { StompState } from './stomp-state';
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
export class StompRService {
    /**
     * Constructor
     *
     * See README and samples for configuration examples
     */
    constructor() {
        /**
         * Internal array to hold locally queued messages when STOMP broker is not connected.
         */
        this.queuedMessages = [];
        /**
         * Callback Functions
         *
         * Note the method signature: () => preserves lexical scope
         * if we need to use this.x inside the function
         */
        this.debug = (args) => {
            console.log(new Date(), args);
        };
        /**
         * Callback run on successfully connecting to server
         */
        this.on_connect = (frame) => {
            this.debug('Connected');
            this._serverHeadersBehaviourSubject.next(frame.headers);
            // Indicate our connected state to observers
            this.state.next(StompState.CONNECTED);
        };
        /**
         * Handle errors from stomp.js
         */
        this.on_error = (error) => {
            // Trigger the error subject
            this.errorSubject.next(error);
            if (typeof error === 'object') {
                error = (/** @type {?} */ (error)).body;
            }
            this.debug(`Error: ${error}`);
            // Check for dropped connection and try reconnecting
            if (!this.client.connected) {
                // Reset state indicator
                this.state.next(StompState.CLOSED);
            }
        };
        this.state = new BehaviorSubject(StompState.CLOSED);
        this.connectObservable = this.state.pipe(filter((currentState) => {
            return currentState === StompState.CONNECTED;
        }));
        // Setup sending queuedMessages
        this.connectObservable.subscribe(() => {
            this.sendQueuedMessages();
        });
        this._serverHeadersBehaviourSubject = new BehaviorSubject(null);
        this.serverHeadersObservable = this._serverHeadersBehaviourSubject.pipe(filter((headers) => {
            return headers !== null;
        }));
        this.errorSubject = new Subject();
    }
    /**
     * Set configuration
     * @param {?} value
     * @return {?}
     */
    set config(value) {
        this._config = value;
    }
    /**
     * It will initialize STOMP Client.
     * @return {?}
     */
    initStompClient() {
        // disconnect if connected
        this.disconnect();
        // url takes precedence over socketFn
        if (typeof (this._config.url) === 'string') {
            this.client = Stomp.client(this._config.url);
        }
        else {
            this.client = Stomp.over(this._config.url);
        }
        // Configure client heart-beating
        this.client.heartbeat.incoming = this._config.heartbeat_in;
        this.client.heartbeat.outgoing = this._config.heartbeat_out;
        // Auto reconnect
        this.client.reconnect_delay = this._config.reconnect_delay;
        if (!this._config.debug) {
            this.debug = function () {
            };
        }
        // Set function to debug print messages
        this.client.debug = this.debug;
        // Default messages
        this.setupOnReceive();
        // Receipts
        this.setupReceipts();
    }
    /**
     * It will connect to the STOMP broker.
     * @return {?}
     */
    initAndConnect() {
        this.initStompClient();
        if (!this._config.headers) {
            this._config.headers = {};
        }
        // Attempt connection, passing in a callback
        this.client.connect(this._config.headers, this.on_connect, this.on_error);
        this.debug('Connecting...');
        this.state.next(StompState.TRYING);
    }
    /**
     * It will disconnect from the STOMP broker.
     * @return {?}
     */
    disconnect() {
        // Disconnect if connected. Callback will set CLOSED state
        if (this.client) {
            if (!this.client.connected) {
                // Nothing to do
                this.state.next(StompState.CLOSED);
                return;
            }
            // Notify observers that we are disconnecting!
            this.state.next(StompState.DISCONNECTING);
            this.client.disconnect(() => this.state.next(StompState.CLOSED));
        }
    }
    /**
     * It will return `true` if STOMP broker is connected and `false` otherwise.
     * @return {?}
     */
    connected() {
        return this.state.getValue() === StompState.CONNECTED;
    }
    /**
     * It will send a message to a named destination. The message must be `string`.
     *
     * The message will get locally queued if the STOMP broker is not connected. It will attempt to
     * publish queued messages as soon as the broker gets connected.
     *
     * @param {?} queueName
     * @param {?} message
     * @param {?=} headers
     * @return {?}
     */
    publish(queueName, message, headers = {}) {
        if (this.connected()) {
            this.client.send(queueName, headers, message);
        }
        else {
            this.debug(`Not connected, queueing ${message}`);
            this.queuedMessages.push({ queueName: /** @type {?} */ (queueName), message: /** @type {?} */ (message), headers: headers });
        }
    }
    /**
     * It will send queued messages.
     * @return {?}
     */
    sendQueuedMessages() {
        const /** @type {?} */ queuedMessages = this.queuedMessages;
        this.queuedMessages = [];
        this.debug(`Will try sending queued messages ${queuedMessages}`);
        for (const /** @type {?} */ queuedMessage of queuedMessages) {
            this.debug(`Attempting to send ${queuedMessage}`);
            this.publish(queuedMessage.queueName, queuedMessage.message, queuedMessage.headers);
        }
    }
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
    subscribe(queueName, headers = {}) {
        /* Well the logic is complicated but works beautifully. RxJS is indeed wonderful.
             *
             * We need to activate the underlying subscription immediately if Stomp is connected. If not it should
             * subscribe when it gets next connected. Further it should re establish the subscription whenever Stomp
             * successfully reconnects.
             *
             * Actual implementation is simple, we filter the BehaviourSubject 'state' so that we can trigger whenever Stomp is
             * connected. Since 'state' is a BehaviourSubject, if Stomp is already connected, it will immediately trigger.
             *
             * The observable that we return to caller remains same across all reconnects, so no special handling needed at
             * the message subscriber.
             */
        this.debug(`Request to subscribe ${queueName}`);
        // By default auto acknowledgement of messages
        if (!headers['ack']) {
            headers['ack'] = 'auto';
        }
        const /** @type {?} */ coldObservable = Observable.create((messages) => {
            /*
                     * These variables will be used as part of the closure and work their magic during unsubscribe
                     */
            let /** @type {?} */ stompSubscription;
            let /** @type {?} */ stompConnectedSubscription;
            stompConnectedSubscription = this.connectObservable
                .subscribe(() => {
                this.debug(`Will subscribe to ${queueName}`);
                stompSubscription = this.client.subscribe(queueName, (message) => {
                    messages.next(message);
                }, headers);
            });
            return () => {
                /* cleanup function, will be called when no subscribers are left */
                this.debug(`Stop watching connection state (for ${queueName})`);
                stompConnectedSubscription.unsubscribe();
                if (this.state.getValue() === StompState.CONNECTED) {
                    this.debug(`Will unsubscribe from ${queueName} at Stomp`);
                    stompSubscription.unsubscribe();
                }
                else {
                    this.debug(`Stomp not connected, no need to unsubscribe from ${queueName} at Stomp`);
                }
            };
        });
        /**
             * Important - convert it to hot Observable - otherwise, if the user code subscribes
             * to this observable twice, it will subscribe twice to Stomp broker. (This was happening in the current example).
             * A long but good explanatory article at https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339
             */
        return coldObservable.pipe(share());
    }
    /**
     * It will handle messages received in the default queue. Messages that would not be handled otherwise
     * get delivered to the default queue.
     * @return {?}
     */
    setupOnReceive() {
        this.defaultMessagesObservable = new Subject();
        this.client.onreceive = (message) => {
            this.defaultMessagesObservable.next(message);
        };
    }
    /**
     * It will emit all receipts.
     * @return {?}
     */
    setupReceipts() {
        this.receiptsObservable = new Subject();
        this.client.onreceipt = (frame) => {
            this.receiptsObservable.next(frame);
        };
    }
    /**
     * Wait for receipt, this indicates that server has carried out the related operation
     * @param {?} receiptId
     * @param {?} callback
     * @return {?}
     */
    waitForReceipt(receiptId, callback) {
        this.receiptsObservable.pipe(filter((frame) => {
            return frame.headers['receipt-id'] === receiptId;
        }), first()).subscribe((frame) => {
            callback(frame);
        });
    }
}
StompRService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
StompRService.ctorParameters = () => [];
function StompRService_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    StompRService.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    StompRService.ctorParameters;
    /**
     * State of the STOMPService
     *
     * It is a BehaviorSubject and will emit current status immediately. This will typically get
     * used to show current status to the end user.
     * @type {?}
     */
    StompRService.prototype.state;
    /**
     * Will trigger when connection is established. Use this to carry out initialization.
     * It will trigger every time a (re)connection occurs. If it is already connected
     * it will trigger immediately. You can safely ignore the value, as it will always be
     * StompState.CONNECTED
     * @type {?}
     */
    StompRService.prototype.connectObservable;
    /**
     * Provides headers from most recent connection to the server as return by the CONNECTED
     * frame.
     * If the STOMP connection has already been established it will trigger immediately.
     * It will additionally trigger in event of reconnection, the value will be set of headers from
     * the recent server response.
     * @type {?}
     */
    StompRService.prototype.serverHeadersObservable;
    /** @type {?} */
    StompRService.prototype._serverHeadersBehaviourSubject;
    /**
     * Will emit all messages to the default queue (any message that are not handled by a subscription)
     * @type {?}
     */
    StompRService.prototype.defaultMessagesObservable;
    /**
     * Will emit all receipts
     * @type {?}
     */
    StompRService.prototype.receiptsObservable;
    /**
     * Will trigger when an error occurs. This Subject can be used to handle errors from
     * the stomp broker.
     * @type {?}
     */
    StompRService.prototype.errorSubject;
    /**
     * Internal array to hold locally queued messages when STOMP broker is not connected.
     * @type {?}
     */
    StompRService.prototype.queuedMessages;
    /**
     * Configuration
     * @type {?}
     */
    StompRService.prototype._config;
    /**
     * STOMP Client from \@stomp/stomp.js
     * @type {?}
     */
    StompRService.prototype.client;
    /**
     * Callback Functions
     *
     * Note the method signature: () => preserves lexical scope
     * if we need to use this.x inside the function
     * @type {?}
     */
    StompRService.prototype.debug;
    /**
     * Callback run on successfully connecting to server
     * @type {?}
     */
    StompRService.prototype.on_connect;
    /**
     * Handle errors from stomp.js
     * @type {?}
     */
    StompRService.prototype.on_error;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvbXAtci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN0b21wL25nMi1zdG9tcGpzLyIsInNvdXJjZXMiOlsic3JjL3N0b21wLXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFJLFVBQVUsRUFBZ0IsT0FBTyxFQUFrQixNQUFNLE1BQU0sQ0FBQztBQUk1RixPQUFPLEtBQUssS0FBSyxNQUFNLGdCQUFnQixDQUFDO0FBR3hDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBZ0IzQyxNQUFNOzs7Ozs7Ozs7OzhCQStDd0YsRUFBRTs7Ozs7OztxQkE0UjVFLENBQUMsSUFBUyxFQUFRLEVBQUU7WUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9COzs7OzBCQUdzQixDQUFDLEtBQVksRUFBRSxFQUFFO1lBRXRDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFeEIsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7O1lBR3hELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN2Qzs7Ozt3QkFHb0IsQ0FBQyxLQUE2QixFQUFFLEVBQUU7O1lBR3JELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLEtBQUssR0FBRyxtQkFB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SSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlDLENBQUM7S0FDSDs7Ozs7SUFLUyxhQUFhO1FBQ3JCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBRXhDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBa0IsRUFBRSxFQUFFO1lBQzdDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckMsQ0FBQztLQUNIOzs7Ozs7O0lBS00sY0FBYyxDQUFDLFNBQWlCLEVBQUUsUUFBc0M7UUFDN0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FDMUIsTUFBTSxDQUFDLENBQUMsS0FBa0IsRUFBRSxFQUFFO1lBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQztTQUNsRCxDQUFDLEVBQ0YsS0FBSyxFQUFFLENBQ1IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFrQixFQUFFLEVBQUU7WUFDakMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pCLENBQUMsQ0FBQzs7OztZQW5VTixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmlyc3QsIGZpbHRlciwgc2hhcmUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgLCAgT2JzZXJ2YWJsZSAsICBPYnNlcnZlciAsICBTdWJqZWN0ICwgIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBTdG9tcENvbmZpZyB9IGZyb20gJy4vc3RvbXAuY29uZmlnJztcblxuaW1wb3J0ICogYXMgU3RvbXAgZnJvbSAnQHN0b21wL3N0b21wanMnO1xuaW1wb3J0IHsgRnJhbWUsIFN0b21wU3Vic2NyaXB0aW9uIH0gZnJvbSAnQHN0b21wL3N0b21wanMnO1xuaW1wb3J0IHsgU3RvbXBIZWFkZXJzIH0gZnJvbSAnLi9zdG9tcC1oZWFkZXJzJztcbmltcG9ydCB7IFN0b21wU3RhdGUgfSBmcm9tICcuL3N0b21wLXN0YXRlJztcblxuLyoqXG4gKiBBbmd1bGFyMiBTVE9NUCBSYXcgU2VydmljZSB1c2luZyBAc3RvbXAvc3RvbXAuanNcbiAqXG4gKiBZb3Ugd2lsbCBvbmx5IG5lZWQgdGhlIHB1YmxpYyBwcm9wZXJ0aWVzIGFuZFxuICogbWV0aG9kcyBsaXN0ZWQgdW5sZXNzIHlvdSBhcmUgYW4gYWR2YW5jZWQgdXNlci4gVGhpcyBzZXJ2aWNlIGhhbmRsZXMgc3Vic2NyaWJpbmcgdG8gYVxuICogbWVzc2FnZSBxdWV1ZSB1c2luZyB0aGUgc3RvbXAuanMgbGlicmFyeSwgYW5kIHJldHVybnNcbiAqIHZhbHVlcyB2aWEgdGhlIEVTNiBPYnNlcnZhYmxlIHNwZWNpZmljYXRpb24gZm9yXG4gKiBhc3luY2hyb25vdXMgdmFsdWUgc3RyZWFtaW5nIGJ5IHdpcmluZyB0aGUgU1RPTVBcbiAqIG1lc3NhZ2VzIGludG8gYW4gb2JzZXJ2YWJsZS5cbiAqXG4gKiBJZiB5b3Ugd2lsbCBsaWtlIHRvIHBhc3MgdGhlIGNvbmZpZ3VyYXRpb24gYXMgYSBkZXBlbmRlbmN5LFxuICogcGxlYXNlIHVzZSBTdG9tcFNlcnZpY2UgY2xhc3MuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdG9tcFJTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIFN0YXRlIG9mIHRoZSBTVE9NUFNlcnZpY2VcbiAgICpcbiAgICogSXQgaXMgYSBCZWhhdmlvclN1YmplY3QgYW5kIHdpbGwgZW1pdCBjdXJyZW50IHN0YXR1cyBpbW1lZGlhdGVseS4gVGhpcyB3aWxsIHR5cGljYWxseSBnZXRcbiAgICogdXNlZCB0byBzaG93IGN1cnJlbnQgc3RhdHVzIHRvIHRoZSBlbmQgdXNlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0ZTogQmVoYXZpb3JTdWJqZWN0PFN0b21wU3RhdGU+O1xuXG4gIC8qKlxuICAgKiBXaWxsIHRyaWdnZXIgd2hlbiBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkLiBVc2UgdGhpcyB0byBjYXJyeSBvdXQgaW5pdGlhbGl6YXRpb24uXG4gICAqIEl0IHdpbGwgdHJpZ2dlciBldmVyeSB0aW1lIGEgKHJlKWNvbm5lY3Rpb24gb2NjdXJzLiBJZiBpdCBpcyBhbHJlYWR5IGNvbm5lY3RlZFxuICAgKiBpdCB3aWxsIHRyaWdnZXIgaW1tZWRpYXRlbHkuIFlvdSBjYW4gc2FmZWx5IGlnbm9yZSB0aGUgdmFsdWUsIGFzIGl0IHdpbGwgYWx3YXlzIGJlXG4gICAqIFN0b21wU3RhdGUuQ09OTkVDVEVEXG4gICAqL1xuICBwdWJsaWMgY29ubmVjdE9ic2VydmFibGU6IE9ic2VydmFibGU8U3RvbXBTdGF0ZT47XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGhlYWRlcnMgZnJvbSBtb3N0IHJlY2VudCBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIgYXMgcmV0dXJuIGJ5IHRoZSBDT05ORUNURURcbiAgICogZnJhbWUuXG4gICAqIElmIHRoZSBTVE9NUCBjb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gZXN0YWJsaXNoZWQgaXQgd2lsbCB0cmlnZ2VyIGltbWVkaWF0ZWx5LlxuICAgKiBJdCB3aWxsIGFkZGl0aW9uYWxseSB0cmlnZ2VyIGluIGV2ZW50IG9mIHJlY29ubmVjdGlvbiwgdGhlIHZhbHVlIHdpbGwgYmUgc2V0IG9mIGhlYWRlcnMgZnJvbVxuICAgKiB0aGUgcmVjZW50IHNlcnZlciByZXNwb25zZS5cbiAgICovXG4gIHB1YmxpYyBzZXJ2ZXJIZWFkZXJzT2JzZXJ2YWJsZTogT2JzZXJ2YWJsZTxTdG9tcEhlYWRlcnM+O1xuXG4gIHByaXZhdGUgX3NlcnZlckhlYWRlcnNCZWhhdmlvdXJTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8bnVsbCB8IFN0b21wSGVhZGVycz47XG5cbiAgLyoqXG4gICAqIFdpbGwgZW1pdCBhbGwgbWVzc2FnZXMgdG8gdGhlIGRlZmF1bHQgcXVldWUgKGFueSBtZXNzYWdlIHRoYXQgYXJlIG5vdCBoYW5kbGVkIGJ5IGEgc3Vic2NyaXB0aW9uKVxuICAgKi9cbiAgcHVibGljIGRlZmF1bHRNZXNzYWdlc09ic2VydmFibGU6IFN1YmplY3Q8U3RvbXAuTWVzc2FnZT47XG5cbiAgLyoqXG4gICAqIFdpbGwgZW1pdCBhbGwgcmVjZWlwdHNcbiAgICovXG4gIHB1YmxpYyByZWNlaXB0c09ic2VydmFibGU6IFN1YmplY3Q8U3RvbXAuRnJhbWU+O1xuXG4gIC8qKlxuICAgKiBXaWxsIHRyaWdnZXIgd2hlbiBhbiBlcnJvciBvY2N1cnMuIFRoaXMgU3ViamVjdCBjYW4gYmUgdXNlZCB0byBoYW5kbGUgZXJyb3JzIGZyb21cbiAgICogdGhlIHN0b21wIGJyb2tlci5cbiAgICovXG4gIHB1YmxpYyBlcnJvclN1YmplY3Q6IFN1YmplY3Q8c3RyaW5nIHwgU3RvbXAuTWVzc2FnZT47XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGFycmF5IHRvIGhvbGQgbG9jYWxseSBxdWV1ZWQgbWVzc2FnZXMgd2hlbiBTVE9NUCBicm9rZXIgaXMgbm90IGNvbm5lY3RlZC5cbiAgICovXG4gIHByb3RlY3RlZCBxdWV1ZWRNZXNzYWdlczogeyBxdWV1ZU5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBoZWFkZXJzOiBTdG9tcEhlYWRlcnMgfVtdID0gW107XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyYXRpb25cbiAgICovXG4gIHByaXZhdGUgX2NvbmZpZzogU3RvbXBDb25maWc7XG5cbiAgLyoqXG4gICAqIFNUT01QIENsaWVudCBmcm9tIEBzdG9tcC9zdG9tcC5qc1xuICAgKi9cbiAgcHJvdGVjdGVkIGNsaWVudDogU3RvbXAuQ2xpZW50O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvclxuICAgKlxuICAgKiBTZWUgUkVBRE1FIGFuZCBzYW1wbGVzIGZvciBjb25maWd1cmF0aW9uIGV4YW1wbGVzXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8U3RvbXBTdGF0ZT4oU3RvbXBTdGF0ZS5DTE9TRUQpO1xuXG4gICAgdGhpcy5jb25uZWN0T2JzZXJ2YWJsZSA9IHRoaXMuc3RhdGUucGlwZShcbiAgICAgIGZpbHRlcigoY3VycmVudFN0YXRlOiBTdG9tcFN0YXRlKSA9PiB7XG4gICAgICAgIHJldHVybiBjdXJyZW50U3RhdGUgPT09IFN0b21wU3RhdGUuQ09OTkVDVEVEO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gU2V0dXAgc2VuZGluZyBxdWV1ZWRNZXNzYWdlc1xuICAgIHRoaXMuY29ubmVjdE9ic2VydmFibGUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuc2VuZFF1ZXVlZE1lc3NhZ2VzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zZXJ2ZXJIZWFkZXJzQmVoYXZpb3VyU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8bnVsbCB8IFN0b21wSGVhZGVycz4obnVsbCk7XG5cbiAgICB0aGlzLnNlcnZlckhlYWRlcnNPYnNlcnZhYmxlID0gdGhpcy5fc2VydmVySGVhZGVyc0JlaGF2aW91clN1YmplY3QucGlwZShcbiAgICAgIGZpbHRlcigoaGVhZGVyczogbnVsbCB8IFN0b21wSGVhZGVycykgPT4ge1xuICAgICAgICByZXR1cm4gaGVhZGVycyAhPT0gbnVsbDtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHRoaXMuZXJyb3JTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIC8qKiBTZXQgY29uZmlndXJhdGlvbiAqL1xuICBzZXQgY29uZmlnKHZhbHVlOiBTdG9tcENvbmZpZykge1xuICAgIHRoaXMuX2NvbmZpZyA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIEl0IHdpbGwgaW5pdGlhbGl6ZSBTVE9NUCBDbGllbnQuICovXG4gIHByb3RlY3RlZCBpbml0U3RvbXBDbGllbnQoKTogdm9pZCB7XG4gICAgLy8gZGlzY29ubmVjdCBpZiBjb25uZWN0ZWRcbiAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcblxuICAgIC8vIHVybCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgc29ja2V0Rm5cbiAgICBpZiAodHlwZW9mKHRoaXMuX2NvbmZpZy51cmwpID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5jbGllbnQgPSBTdG9tcC5jbGllbnQodGhpcy5fY29uZmlnLnVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xpZW50ID0gU3RvbXAub3Zlcih0aGlzLl9jb25maWcudXJsKTtcbiAgICB9XG5cbiAgICAvLyBDb25maWd1cmUgY2xpZW50IGhlYXJ0LWJlYXRpbmdcbiAgICB0aGlzLmNsaWVudC5oZWFydGJlYXQuaW5jb21pbmcgPSB0aGlzLl9jb25maWcuaGVhcnRiZWF0X2luO1xuICAgIHRoaXMuY2xpZW50LmhlYXJ0YmVhdC5vdXRnb2luZyA9IHRoaXMuX2NvbmZpZy5oZWFydGJlYXRfb3V0O1xuXG4gICAgLy8gQXV0byByZWNvbm5lY3RcbiAgICB0aGlzLmNsaWVudC5yZWNvbm5lY3RfZGVsYXkgPSB0aGlzLl9jb25maWcucmVjb25uZWN0X2RlbGF5O1xuXG4gICAgaWYgKCF0aGlzLl9jb25maWcuZGVidWcpIHtcbiAgICAgIHRoaXMuZGVidWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB9O1xuICAgIH1cbiAgICAvLyBTZXQgZnVuY3Rpb24gdG8gZGVidWcgcHJpbnQgbWVzc2FnZXNcbiAgICB0aGlzLmNsaWVudC5kZWJ1ZyA9IHRoaXMuZGVidWc7XG5cbiAgICAvLyBEZWZhdWx0IG1lc3NhZ2VzXG4gICAgdGhpcy5zZXR1cE9uUmVjZWl2ZSgpO1xuXG4gICAgLy8gUmVjZWlwdHNcbiAgICB0aGlzLnNldHVwUmVjZWlwdHMoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEl0IHdpbGwgY29ubmVjdCB0byB0aGUgU1RPTVAgYnJva2VyLlxuICAgKi9cbiAgcHVibGljIGluaXRBbmRDb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdFN0b21wQ2xpZW50KCk7XG5cbiAgICBpZiAoIXRoaXMuX2NvbmZpZy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLl9jb25maWcuaGVhZGVycyA9IHt9O1xuICAgIH1cblxuICAgIC8vIEF0dGVtcHQgY29ubmVjdGlvbiwgcGFzc2luZyBpbiBhIGNhbGxiYWNrXG4gICAgdGhpcy5jbGllbnQuY29ubmVjdChcbiAgICAgIHRoaXMuX2NvbmZpZy5oZWFkZXJzLFxuICAgICAgdGhpcy5vbl9jb25uZWN0LFxuICAgICAgdGhpcy5vbl9lcnJvclxuICAgICk7XG5cbiAgICB0aGlzLmRlYnVnKCdDb25uZWN0aW5nLi4uJyk7XG4gICAgdGhpcy5zdGF0ZS5uZXh0KFN0b21wU3RhdGUuVFJZSU5HKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEl0IHdpbGwgZGlzY29ubmVjdCBmcm9tIHRoZSBTVE9NUCBicm9rZXIuXG4gICAqL1xuICBwdWJsaWMgZGlzY29ubmVjdCgpOiB2b2lkIHtcblxuICAgIC8vIERpc2Nvbm5lY3QgaWYgY29ubmVjdGVkLiBDYWxsYmFjayB3aWxsIHNldCBDTE9TRUQgc3RhdGVcbiAgICBpZiAodGhpcy5jbGllbnQpIHtcbiAgICAgIGlmICghdGhpcy5jbGllbnQuY29ubmVjdGVkKSB7XG4gICAgICAgIC8vIE5vdGhpbmcgdG8gZG9cbiAgICAgICAgdGhpcy5zdGF0ZS5uZXh0KFN0b21wU3RhdGUuQ0xPU0VEKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBOb3RpZnkgb2JzZXJ2ZXJzIHRoYXQgd2UgYXJlIGRpc2Nvbm5lY3RpbmchXG4gICAgICB0aGlzLnN0YXRlLm5leHQoU3RvbXBTdGF0ZS5ESVNDT05ORUNUSU5HKTtcblxuICAgICAgdGhpcy5jbGllbnQuZGlzY29ubmVjdChcbiAgICAgICAgKCkgPT4gdGhpcy5zdGF0ZS5uZXh0KFN0b21wU3RhdGUuQ0xPU0VEKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXQgd2lsbCByZXR1cm4gYHRydWVgIGlmIFNUT01QIGJyb2tlciBpcyBjb25uZWN0ZWQgYW5kIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcHVibGljIGNvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5nZXRWYWx1ZSgpID09PSBTdG9tcFN0YXRlLkNPTk5FQ1RFRDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdCB3aWxsIHNlbmQgYSBtZXNzYWdlIHRvIGEgbmFtZWQgZGVzdGluYXRpb24uIFRoZSBtZXNzYWdlIG11c3QgYmUgYHN0cmluZ2AuXG4gICAqXG4gICAqIFRoZSBtZXNzYWdlIHdpbGwgZ2V0IGxvY2FsbHkgcXVldWVkIGlmIHRoZSBTVE9NUCBicm9rZXIgaXMgbm90IGNvbm5lY3RlZC4gSXQgd2lsbCBhdHRlbXB0IHRvXG4gICAqIHB1Ymxpc2ggcXVldWVkIG1lc3NhZ2VzIGFzIHNvb24gYXMgdGhlIGJyb2tlciBnZXRzIGNvbm5lY3RlZC5cbiAgICpcbiAgICogQHBhcmFtIHF1ZXVlTmFtZVxuICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgKiBAcGFyYW0gaGVhZGVyc1xuICAgKi9cbiAgcHVibGljIHB1Ymxpc2gocXVldWVOYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgaGVhZGVyczogU3RvbXBIZWFkZXJzID0ge30pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy5jbGllbnQuc2VuZChxdWV1ZU5hbWUsIGhlYWRlcnMsIG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlYnVnKGBOb3QgY29ubmVjdGVkLCBxdWV1ZWluZyAke21lc3NhZ2V9YCk7XG4gICAgICB0aGlzLnF1ZXVlZE1lc3NhZ2VzLnB1c2goe3F1ZXVlTmFtZTogPHN0cmluZz5xdWV1ZU5hbWUsIG1lc3NhZ2U6IDxzdHJpbmc+bWVzc2FnZSwgaGVhZGVyczogaGVhZGVyc30pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJdCB3aWxsIHNlbmQgcXVldWVkIG1lc3NhZ2VzLiAqL1xuICBwcm90ZWN0ZWQgc2VuZFF1ZXVlZE1lc3NhZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IHF1ZXVlZE1lc3NhZ2VzID0gdGhpcy5xdWV1ZWRNZXNzYWdlcztcbiAgICB0aGlzLnF1ZXVlZE1lc3NhZ2VzID0gW107XG5cbiAgICB0aGlzLmRlYnVnKGBXaWxsIHRyeSBzZW5kaW5nIHF1ZXVlZCBtZXNzYWdlcyAke3F1ZXVlZE1lc3NhZ2VzfWApO1xuXG4gICAgZm9yIChjb25zdCBxdWV1ZWRNZXNzYWdlIG9mIHF1ZXVlZE1lc3NhZ2VzKSB7XG4gICAgICB0aGlzLmRlYnVnKGBBdHRlbXB0aW5nIHRvIHNlbmQgJHtxdWV1ZWRNZXNzYWdlfWApO1xuICAgICAgdGhpcy5wdWJsaXNoKHF1ZXVlZE1lc3NhZ2UucXVldWVOYW1lLCBxdWV1ZWRNZXNzYWdlLm1lc3NhZ2UsIHF1ZXVlZE1lc3NhZ2UuaGVhZGVycyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0IHdpbGwgc3Vic2NyaWJlIHRvIHNlcnZlciBtZXNzYWdlIHF1ZXVlc1xuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgc2FmZWx5IGNhbGxlZCBldmVuIGlmIHRoZSBTVE9NUCBicm9rZXIgaXMgbm90IGNvbm5lY3RlZC5cbiAgICogSWYgdGhlIHVuZGVybHlpbmcgU1RPTVAgY29ubmVjdGlvbiBkcm9wcyBhbmQgcmVjb25uZWN0cywgaXQgd2lsbCByZXN1YnNjcmliZSBhdXRvbWF0aWNhbGx5LlxuICAgKlxuICAgKiBJZiBhIGhlYWRlciBmaWVsZCAnYWNrJyBpcyBub3QgZXhwbGljaXRseSBwYXNzZWQsICdhY2snIHdpbGwgYmUgc2V0IHRvICdhdXRvJy4gSWYgeW91XG4gICAqIGRvIG5vdCB1bmRlcnN0YW5kIHdoYXQgaXQgbWVhbnMsIHBsZWFzZSBsZWF2ZSBpdCBhcyBpcy5cbiAgICpcbiAgICogTm90ZSB0aGF0IHdoZW4gd29ya2luZyB3aXRoIHRlbXBvcmFyeSBxdWV1ZXMgd2hlcmUgdGhlIHN1YnNjcmlwdGlvbiByZXF1ZXN0XG4gICAqIGNyZWF0ZXMgdGhlXG4gICAqIHVuZGVybHlpbmcgcXVldWUsIG1zc2FnZXMgbWlnaHQgYmUgbWlzc2VkIGR1cmluZyByZWNvbm5lY3QuIFRoaXMgaXNzdWUgaXMgbm90IHNwZWNpZmljXG4gICAqIHRvIHRoaXMgbGlicmFyeSBidXQgdGhlIHdheSBTVE9NUCBicm9rZXJzIGFyZSBkZXNpZ25lZCB0byB3b3JrLlxuICAgKlxuICAgKiBAcGFyYW0gcXVldWVOYW1lXG4gICAqIEBwYXJhbSBoZWFkZXJzXG4gICAqL1xuICBwdWJsaWMgc3Vic2NyaWJlKHF1ZXVlTmFtZTogc3RyaW5nLCBoZWFkZXJzOiBTdG9tcEhlYWRlcnMgPSB7fSk6IE9ic2VydmFibGU8U3RvbXAuTWVzc2FnZT4ge1xuXG4gICAgLyogV2VsbCB0aGUgbG9naWMgaXMgY29tcGxpY2F0ZWQgYnV0IHdvcmtzIGJlYXV0aWZ1bGx5LiBSeEpTIGlzIGluZGVlZCB3b25kZXJmdWwuXG4gICAgICpcbiAgICAgKiBXZSBuZWVkIHRvIGFjdGl2YXRlIHRoZSB1bmRlcmx5aW5nIHN1YnNjcmlwdGlvbiBpbW1lZGlhdGVseSBpZiBTdG9tcCBpcyBjb25uZWN0ZWQuIElmIG5vdCBpdCBzaG91bGRcbiAgICAgKiBzdWJzY3JpYmUgd2hlbiBpdCBnZXRzIG5leHQgY29ubmVjdGVkLiBGdXJ0aGVyIGl0IHNob3VsZCByZSBlc3RhYmxpc2ggdGhlIHN1YnNjcmlwdGlvbiB3aGVuZXZlciBTdG9tcFxuICAgICAqIHN1Y2Nlc3NmdWxseSByZWNvbm5lY3RzLlxuICAgICAqXG4gICAgICogQWN0dWFsIGltcGxlbWVudGF0aW9uIGlzIHNpbXBsZSwgd2UgZmlsdGVyIHRoZSBCZWhhdmlvdXJTdWJqZWN0ICdzdGF0ZScgc28gdGhhdCB3ZSBjYW4gdHJpZ2dlciB3aGVuZXZlciBTdG9tcCBpc1xuICAgICAqIGNvbm5lY3RlZC4gU2luY2UgJ3N0YXRlJyBpcyBhIEJlaGF2aW91clN1YmplY3QsIGlmIFN0b21wIGlzIGFscmVhZHkgY29ubmVjdGVkLCBpdCB3aWxsIGltbWVkaWF0ZWx5IHRyaWdnZXIuXG4gICAgICpcbiAgICAgKiBUaGUgb2JzZXJ2YWJsZSB0aGF0IHdlIHJldHVybiB0byBjYWxsZXIgcmVtYWlucyBzYW1lIGFjcm9zcyBhbGwgcmVjb25uZWN0cywgc28gbm8gc3BlY2lhbCBoYW5kbGluZyBuZWVkZWQgYXRcbiAgICAgKiB0aGUgbWVzc2FnZSBzdWJzY3JpYmVyLlxuICAgICAqL1xuICAgIHRoaXMuZGVidWcoYFJlcXVlc3QgdG8gc3Vic2NyaWJlICR7cXVldWVOYW1lfWApO1xuXG4gICAgLy8gQnkgZGVmYXVsdCBhdXRvIGFja25vd2xlZGdlbWVudCBvZiBtZXNzYWdlc1xuICAgIGlmICghaGVhZGVyc1snYWNrJ10pIHtcbiAgICAgIGhlYWRlcnNbJ2FjayddID0gJ2F1dG8nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbGRPYnNlcnZhYmxlID0gT2JzZXJ2YWJsZS5jcmVhdGUoXG4gICAgICAobWVzc2FnZXM6IE9ic2VydmVyPFN0b21wLk1lc3NhZ2U+KSA9PiB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIFRoZXNlIHZhcmlhYmxlcyB3aWxsIGJlIHVzZWQgYXMgcGFydCBvZiB0aGUgY2xvc3VyZSBhbmQgd29yayB0aGVpciBtYWdpYyBkdXJpbmcgdW5zdWJzY3JpYmVcbiAgICAgICAgICovXG4gICAgICAgIGxldCBzdG9tcFN1YnNjcmlwdGlvbjogU3RvbXBTdWJzY3JpcHRpb247XG5cbiAgICAgICAgbGV0IHN0b21wQ29ubmVjdGVkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgICAgICAgc3RvbXBDb25uZWN0ZWRTdWJzY3JpcHRpb24gPSB0aGlzLmNvbm5lY3RPYnNlcnZhYmxlXG4gICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKGBXaWxsIHN1YnNjcmliZSB0byAke3F1ZXVlTmFtZX1gKTtcbiAgICAgICAgICAgIHN0b21wU3Vic2NyaXB0aW9uID0gdGhpcy5jbGllbnQuc3Vic2NyaWJlKHF1ZXVlTmFtZSwgKG1lc3NhZ2U6IFN0b21wLk1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5uZXh0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBoZWFkZXJzKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKCkgPT4geyAvKiBjbGVhbnVwIGZ1bmN0aW9uLCB3aWxsIGJlIGNhbGxlZCB3aGVuIG5vIHN1YnNjcmliZXJzIGFyZSBsZWZ0ICovXG4gICAgICAgICAgdGhpcy5kZWJ1ZyhgU3RvcCB3YXRjaGluZyBjb25uZWN0aW9uIHN0YXRlIChmb3IgJHtxdWV1ZU5hbWV9KWApO1xuICAgICAgICAgIHN0b21wQ29ubmVjdGVkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cbiAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5nZXRWYWx1ZSgpID09PSBTdG9tcFN0YXRlLkNPTk5FQ1RFRCkge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZyhgV2lsbCB1bnN1YnNjcmliZSBmcm9tICR7cXVldWVOYW1lfSBhdCBTdG9tcGApO1xuICAgICAgICAgICAgc3RvbXBTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZyhgU3RvbXAgbm90IGNvbm5lY3RlZCwgbm8gbmVlZCB0byB1bnN1YnNjcmliZSBmcm9tICR7cXVldWVOYW1lfSBhdCBTdG9tcGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSW1wb3J0YW50IC0gY29udmVydCBpdCB0byBob3QgT2JzZXJ2YWJsZSAtIG90aGVyd2lzZSwgaWYgdGhlIHVzZXIgY29kZSBzdWJzY3JpYmVzXG4gICAgICogdG8gdGhpcyBvYnNlcnZhYmxlIHR3aWNlLCBpdCB3aWxsIHN1YnNjcmliZSB0d2ljZSB0byBTdG9tcCBicm9rZXIuIChUaGlzIHdhcyBoYXBwZW5pbmcgaW4gdGhlIGN1cnJlbnQgZXhhbXBsZSkuXG4gICAgICogQSBsb25nIGJ1dCBnb29kIGV4cGxhbmF0b3J5IGFydGljbGUgYXQgaHR0cHM6Ly9tZWRpdW0uY29tL0BiZW5sZXNoL2hvdC12cy1jb2xkLW9ic2VydmFibGVzLWY4MDk0ZWQ1MzMzOVxuICAgICAqL1xuICAgIHJldHVybiBjb2xkT2JzZXJ2YWJsZS5waXBlKHNoYXJlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0IHdpbGwgaGFuZGxlIG1lc3NhZ2VzIHJlY2VpdmVkIGluIHRoZSBkZWZhdWx0IHF1ZXVlLiBNZXNzYWdlcyB0aGF0IHdvdWxkIG5vdCBiZSBoYW5kbGVkIG90aGVyd2lzZVxuICAgKiBnZXQgZGVsaXZlcmVkIHRvIHRoZSBkZWZhdWx0IHF1ZXVlLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNldHVwT25SZWNlaXZlKCk6IHZvaWQge1xuICAgIHRoaXMuZGVmYXVsdE1lc3NhZ2VzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICB0aGlzLmNsaWVudC5vbnJlY2VpdmUgPSAobWVzc2FnZTogU3RvbXAuTWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy5kZWZhdWx0TWVzc2FnZXNPYnNlcnZhYmxlLm5leHQobWVzc2FnZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdCB3aWxsIGVtaXQgYWxsIHJlY2VpcHRzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNldHVwUmVjZWlwdHMoKTogdm9pZCB7XG4gICAgdGhpcy5yZWNlaXB0c09ic2VydmFibGUgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgdGhpcy5jbGllbnQub25yZWNlaXB0ID0gKGZyYW1lOiBTdG9tcC5GcmFtZSkgPT4ge1xuICAgICAgdGhpcy5yZWNlaXB0c09ic2VydmFibGUubmV4dChmcmFtZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciByZWNlaXB0LCB0aGlzIGluZGljYXRlcyB0aGF0IHNlcnZlciBoYXMgY2FycmllZCBvdXQgdGhlIHJlbGF0ZWQgb3BlcmF0aW9uXG4gICAqL1xuICBwdWJsaWMgd2FpdEZvclJlY2VpcHQocmVjZWlwdElkOiBzdHJpbmcsIGNhbGxiYWNrOiAoZnJhbWU6IFN0b21wLkZyYW1lKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5yZWNlaXB0c09ic2VydmFibGUucGlwZShcbiAgICAgIGZpbHRlcigoZnJhbWU6IFN0b21wLkZyYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBmcmFtZS5oZWFkZXJzWydyZWNlaXB0LWlkJ10gPT09IHJlY2VpcHRJZDtcbiAgICAgIH0pLFxuICAgICAgZmlyc3QoKVxuICAgICkuc3Vic2NyaWJlKChmcmFtZTogU3RvbXAuRnJhbWUpID0+IHtcbiAgICAgIGNhbGxiYWNrKGZyYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBGdW5jdGlvbnNcbiAgICpcbiAgICogTm90ZSB0aGUgbWV0aG9kIHNpZ25hdHVyZTogKCkgPT4gcHJlc2VydmVzIGxleGljYWwgc2NvcGVcbiAgICogaWYgd2UgbmVlZCB0byB1c2UgdGhpcy54IGluc2lkZSB0aGUgZnVuY3Rpb25cbiAgICovXG4gIHByb3RlY3RlZCBkZWJ1ZyA9IChhcmdzOiBhbnkpOiB2b2lkID0+IHtcbiAgICBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpLCBhcmdzKTtcbiAgfVxuXG4gIC8qKiBDYWxsYmFjayBydW4gb24gc3VjY2Vzc2Z1bGx5IGNvbm5lY3RpbmcgdG8gc2VydmVyICovXG4gIHByb3RlY3RlZCBvbl9jb25uZWN0ID0gKGZyYW1lOiBGcmFtZSkgPT4ge1xuXG4gICAgdGhpcy5kZWJ1ZygnQ29ubmVjdGVkJyk7XG5cbiAgICB0aGlzLl9zZXJ2ZXJIZWFkZXJzQmVoYXZpb3VyU3ViamVjdC5uZXh0KGZyYW1lLmhlYWRlcnMpO1xuXG4gICAgLy8gSW5kaWNhdGUgb3VyIGNvbm5lY3RlZCBzdGF0ZSB0byBvYnNlcnZlcnNcbiAgICB0aGlzLnN0YXRlLm5leHQoU3RvbXBTdGF0ZS5DT05ORUNURUQpO1xuICB9XG5cbiAgLyoqIEhhbmRsZSBlcnJvcnMgZnJvbSBzdG9tcC5qcyAqL1xuICBwcm90ZWN0ZWQgb25fZXJyb3IgPSAoZXJyb3I6IHN0cmluZyB8IFN0b21wLk1lc3NhZ2UpID0+IHtcblxuICAgIC8vIFRyaWdnZXIgdGhlIGVycm9yIHN1YmplY3RcbiAgICB0aGlzLmVycm9yU3ViamVjdC5uZXh0KGVycm9yKTtcblxuICAgIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnKSB7XG4gICAgICBlcnJvciA9ICg8U3RvbXAuTWVzc2FnZT5lcnJvcikuYm9keTtcbiAgICB9XG5cbiAgICB0aGlzLmRlYnVnKGBFcnJvcjogJHtlcnJvcn1gKTtcblxuICAgIC8vIENoZWNrIGZvciBkcm9wcGVkIGNvbm5lY3Rpb24gYW5kIHRyeSByZWNvbm5lY3RpbmdcbiAgICBpZiAoIXRoaXMuY2xpZW50LmNvbm5lY3RlZCkge1xuICAgICAgLy8gUmVzZXQgc3RhdGUgaW5kaWNhdG9yXG4gICAgICB0aGlzLnN0YXRlLm5leHQoU3RvbXBTdGF0ZS5DTE9TRUQpO1xuICAgIH1cbiAgfVxufVxuIl19
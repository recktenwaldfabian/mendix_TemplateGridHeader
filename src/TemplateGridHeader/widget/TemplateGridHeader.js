/*jslint -W061:false*/
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "mxui/dom",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/html",
    "dijit/layout/LinkPane"
], function (declare, _WidgetBase, dom, domStyle, domAttr, domConstruct, lang, html, LinkPane) {
    "use strict";

    return declare("TemplateGridHeader.widget.TemplateGridHeader", [_WidgetBase], {

        // Set in Modeler
        refreshOnContextChange: false,
        refreshOnContextUpdate: false,
        hideHeaderBeforeMove: true,

        // Internal
        _observer: null,
        _callback: null,
        contextObj: null,
        gridObj: null,
        headerObj: null,
        

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            
            // Setup callback function
            this._callback = lang.hitch(this, function () 
            {
                this._onChange();
            });
            
            if (!this.refreshOnContextChange) {
                this.executeCode();
            }
        },


        executeCode: function () {
            logger.debug(this.id + ".executeCode");

            mx.addOnLoad ( lang.hitch(this, function () {
                //  Find objects
                this.gridObj   = this.domNode.previousSibling;
                this.headerObj = this.gridObj.previousSibling;
                
                // Hide header
                if ( this.hideHeaderBeforeMove ) {
                    // hiding the header before moving it causes layout sizing issues in popups
                    domStyle.set(this.headerObj, "display", "none");
                }
                
                // Look for dom changes in the grid object
                this._observe(this.gridObj, this._callback);                 
            })); 
        },


        moveHeader: function() {
            var targetGrid = this.gridObj.getElementsByClassName("mx-grid-controlbar")[0];
            if ( targetGrid ) {
                targetGrid.appendChild(this.headerObj);
                // Show header
                domStyle.set(this.headerObj, "display", "");
                return;
            }            
            var targetList = this.gridObj.getElementsByClassName("mx-listview-list")[0];
            if ( targetList ) {
                targetList.parentNode.insertBefore( this.headerObj, targetList);
                // Show header
                domStyle.set(this.headerObj, "display", "");
                return;
            }        
            logger.warning(this.id + ".moveHeader . no valid grid/list found");
        },


        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this.contextObj = obj;
            if (this.refreshOnContextChange) {
                this.executeCode();

                if (this.refreshOnContextUpdate) {
                    if (this._objectChangeHandler !== null) {
                        this.unsubscribe(this._objectChangeHandler);
                    }
                    if (obj) {
                        this._objectChangeHandler = this.subscribe({
                            guid: obj.getGuid(),
                            callback: lang.hitch(this, function () {
                                this.executeCode();
                            })
                        });
                    }
                }
            }

            this._executeCallback(callback, "update");
        },

        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        },
        
        
        /**
         * Listens to DOM changes and fires the callback parameter each time
         * 
         * @param    The DOM node to listen to.
         * @param    The function to call whenever the DOM changes.
         */
        _observe: function (obj, callback)
        {
            var MutationObserver       = (window.MutationObserver || window.WebKitMutationObserver);
            var eventListenerSupported = window.addEventListener;
            
            if (MutationObserver) {
                // Define a new observer
                this._observer = new MutationObserver(function(mutations, observer) {
                    if(mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                        callback();
                });
                // Have the observer observe foo for changes in children
                this._observer.observe( obj, { childList:true, subtree:true });
            }
            else if(eventListenerSupported) {
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
                
                this._observer = obj;
            }
        },
        
        
        /**
         * Triggered every time the observer triggers an event.
         * 
         * @param    The DOM node to listen to.
         * @param    The function to call whenever the DOM changes.
         */
        _onChange: function (obj, callback)
        {
            if (this._observer == null) return;
            
            // Move the header
            this.moveHeader();
            
            
            // Stop observer
            var MutationObserver = (window.MutationObserver || window.WebKitMutationObserver);
            
            if (this._observer instanceof MutationObserver) {
                this._observer.disconnect();
            }
            else if (window.addEventListener) {
                this._observer.removeEventListener('DOMNodeInserted', this._callback, false);
                this._observer.removeEventListener('DOMNodeRemoved', this._callback, false);
            }
            
            this._observer = null;
        }
    });
});

require(["TemplateGridHeader/widget/TemplateGridHeader"]);

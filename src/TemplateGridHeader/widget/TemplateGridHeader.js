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

        // Internal
        contextObj: null,

        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            if (!this.refreshOnContextChange) {
                this.executeCode();
            }
        },

        executeCode: function () {
            logger.debug(this.id + ".executeCode");

            mx.addOnLoad ( lang.hitch(this, function () {
                setTimeout( lang.hitch(this, function () {
                    this.moveHeader();
                }),300);                    
            })); 
        },

        moveHeader: function() {
            var grid = this.domNode.previousSibling;
            var header = grid.previousSibling;
            var target = grid.getElementsByClassName("mx-grid-toolbar")[0];
            target.appendChild(header);
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
        }
    });
});

require(["TemplateGridHeader/widget/TemplateGridHeader"]);

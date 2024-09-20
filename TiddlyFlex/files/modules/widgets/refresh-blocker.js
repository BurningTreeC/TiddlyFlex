/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/refresh-blocker.js
type: application/javascript
module-type: widget

RefreshBlocker widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var RefreshBlocker = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

var RefreshBlockerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
RefreshBlockerWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
RefreshBlockerWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,null);
};

/*
Compute the internal state of the widget
*/
RefreshBlockerWidget.prototype.execute = function() {
	this.refreshBlockerTiddler = this.getAttribute("refresh-blocker") || "$:/state/sidebar/posx";
	this.refreshBlockerEnabler = this.getAttribute("enabler") || "$:/state/sidebar/resizing";
	// Make child widgets
	this.makeChildWidgets();
};

RefreshBlockerWidget.prototype.refresh = function(changedTiddlers) {
	if(changedTiddlers[this.refreshBlockerTiddler] && $tw.wiki.tiddlerExists(this.refreshBlockerEnabler)) {
		return false;
	} else {
		return this.refreshChildren(changedTiddlers);
	}
};

exports["refresh-blocker"] = RefreshBlockerWidget;

})();
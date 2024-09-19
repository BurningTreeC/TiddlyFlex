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
	this.execute();
	this.renderChildren(parent,null);
};

/*
Compute the internal state of the widget
*/
RefreshBlockerWidget.prototype.execute = function() {
	// Make child widgets
	this.makeChildWidgets();
};

RefreshBlockerWidget.prototype.refresh = function(changedTiddlers) {
	if(changedTiddlers["$:/state/sidebar/posx"] && $tw.wiki.tiddlerExists("$:/state/sidebar/resizing")) {
		return false;
	} else {
		return this.refreshChildren(changedTiddlers);
	}
};

exports["refresh-blocker"] = RefreshBlockerWidget;

})();
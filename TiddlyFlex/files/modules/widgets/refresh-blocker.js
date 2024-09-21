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
	this.refreshBlockerTiddler = this.getAttribute("refresh-blocker");
	this.refreshBlockerEnabler = this.getAttribute("enabler");
	// Make child widgets
	this.makeChildWidgets();
};

RefreshBlockerWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.refreshBlockerTiddler || changedAttributes.refreshBlockerEnabler) {
		this.refreshSelf();
		return true;
	} else if(this.refreshBlockerTiddler && this.refreshBlockerEnabler && changedTiddlers[this.refreshBlockerTiddler] && $tw.wiki.tiddlerExists(this.refreshBlockerEnabler)) {
		return false;
	} else {
		return this.refreshChildren(changedTiddlers);
	}
};

exports["refresh-blocker"] = RefreshBlockerWidget;

})();
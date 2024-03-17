/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/scrollable.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "scrollable";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["class"]) {
		this.refreshSelf();
		return true;
	}
	// If the bound tiddler has changed, update the eventListener and update scroll position
	if(changedAttributes["bind"]) {
		if(this.currentListener) {
			this.outerDomNode.removeEventListener("scroll", this.currentListener, false);
		}
		this.scrollableBind = this.getAttribute("bind");
		this.currentListener = this.listenerFunction.bind(this);
		this.outerDomNode.addEventListener("scroll", this.currentListener);
	}
	// Refresh children
	var result = this.refreshChildren(changedTiddlers,force);
	// If the bound tiddler has changed, update scroll position
	if(changedAttributes["bind"] || changedTiddlers[this.getAttribute("bind")]) {
		this.updateScrollPositionFromBoundTiddler();
	}
	return result;
};

})();
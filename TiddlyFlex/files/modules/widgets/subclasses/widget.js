/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/widget.js
type: application/javascript
module-type: widget-subclass

Base widget subclass

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "widget"; // Extend the <$checkbox> widget

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refreshChildren = function(changedTiddlers) {
	var children = this.children,
		refreshed = false;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if(child.domNodes && child.domNodes[0] && child.domNodes[0].style && ((child.domNodes[0].style["content-visibility"] === "auto") || (child.domNodes[0].style["content-visibility"] === "hidden"))) {
			return false;
		} else {
			refreshed = child.refresh(changedTiddlers) || refreshed;
		}
	}
	return refreshed;
};

})();
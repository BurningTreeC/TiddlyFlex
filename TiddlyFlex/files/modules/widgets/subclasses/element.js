/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/element.js
type: application/javascript
module-type: widget-subclass

Element widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "element";

// Specify a different name to make the subclass available as a new widget instead of overwriting the baseclass:
// exports.name = "my-enhanced-checkbox";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refreshChildren = function(changedTiddlers) {
	var children = this.children,
		refreshed = false;
	for(var i=0; i<children.length; i++) {
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
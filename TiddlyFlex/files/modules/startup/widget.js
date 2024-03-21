/*\
title: $:/plugins/BTC/TiddlyFlex/modules/startup/widget.js
type: application/javascript
module-type: startup

Overwriting the Base Widget refreshChildren method

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "widget";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;

var Widget = require("$:/core/modules/widgets/widget.js").widget;

Widget.prototype.hasDomNodesWithContain = function(force) {
	var contain = false;
	for(var i=0; i<this.domNodes.length; i++) {
		var domNode = this.domNodes[i];
		if(domNode.style && domNode.style["contain"] && (domNode.style["contain"] === "content")) {
			contain = true;
			break;
		}
	}
	return contain;
};

Widget.prototype.refreshChildren = function(changedTiddlers,force) {
	var children = this.children,
		refreshed = false,
		hasDomNodes = this.hasDomNodesWithContain(force);
	if(!force && hasDomNodes) {
		refreshed = false;
	} else {
		for(var i=0; i<children.length; i++) {
			var child = children[i];
			refreshed = child.refresh(changedTiddlers,force) || refreshed;
		}
	}
	return refreshed;
};

Widget.prototype.refresh = function(changedTiddlers,force) {
	return this.refreshChildren(changedTiddlers,force);
};

})();
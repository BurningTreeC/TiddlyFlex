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

exports.name = "tiddlyflex-widget";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;

var Widget = require("$:/core/modules/widgets/widget.js").widget;

Widget.prototype.refreshChildren = function(changedTiddlers,force) {
	var children = this.children,
		refreshed = false;
	for(var i=0; i<children.length; i++) {
		var child = children[i];
		if(!force && child.domNodes && child.domNodes[0] && child.domNodes[0].style && ((child.domNodes[0].style["content-visibility"] === "auto") || (child.domNodes[0].style["content-visibility"] === "hidden"))) {
			return false;
		} else {
			refreshed = child.refresh(changedTiddlers) || refreshed;
		}
	}
	return refreshed;
};

})();
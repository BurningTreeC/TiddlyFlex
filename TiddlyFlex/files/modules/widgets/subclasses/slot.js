/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/slot.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "slot";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$name"] || changedAttributes["$depth"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers,force);
};

})();
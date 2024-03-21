/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/macrocall.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "macrocall";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if($tw.utils.count(changedAttributes) > 0) {
		// Rerender ourselves
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
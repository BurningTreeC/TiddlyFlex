/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/link.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "link";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if($tw.utils.count(changedAttributes) > 0 || changedTiddlers[this.to]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers,force);
};

})();
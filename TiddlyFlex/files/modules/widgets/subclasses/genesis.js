/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/genesis.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "genesis";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes(),
		filterNames = this.getAttribute("$names",""),
		filterValues = this.getAttribute("$values",""),
		attributeNames = this.wiki.filterTiddlers(filterNames,this),
		attributeValues = this.wiki.filterTiddlers(filterValues,this);
	if($tw.utils.count(changedAttributes) > 0 || !$tw.utils.isArrayEqual(this.attributeNames,attributeNames) || !$tw.utils.isArrayEqual(this.attributeValues,attributeValues)) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
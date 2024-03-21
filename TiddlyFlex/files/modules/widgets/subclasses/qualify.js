/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/qualify.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "qualify";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.name || changedAttributes.title) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
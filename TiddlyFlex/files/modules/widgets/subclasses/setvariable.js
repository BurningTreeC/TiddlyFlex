/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/setvariable.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "setvariable";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.name || changedAttributes.filter || changedAttributes.select || changedAttributes.tiddler || (this.setTiddler && changedTiddlers[this.setTiddler]) || changedAttributes.field || changedAttributes.index || changedAttributes.value || changedAttributes.emptyValue ||
	   (this.setFilter && this.getValue() != this.variables[this.setName].value)) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
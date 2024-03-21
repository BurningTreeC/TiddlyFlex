/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/range.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "range";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if($tw.utils.count(changedAttributes) > 0) {
		this.refreshSelf();
		return true;
	} else {
		var refreshed = false;
		if(changedTiddlers[this.tiddlerTitle]) {
			var value = this.getValue();
			if(this.inputDomNode.value !== value) {
				this.inputDomNode.value = value;
			}
			refreshed = true;
		}
		return this.refreshChildren(changedTiddlers,force) || refreshed;
	}
};

})();
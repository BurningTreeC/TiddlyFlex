/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/importvariables.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "importvariables";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	// Recompute our attributes and the filter list
	var changedAttributes = this.computeAttributes(),
		tiddlerList = this.wiki.filterTiddlers(this.getAttribute("filter"),this);
	// Refresh if the filter has changed, or the list of tiddlers has changed, or any of the tiddlers in the list has changed
	function haveListedTiddlersChanged() {
		var changed = false;
		tiddlerList.forEach(function(title) {
			if(changedTiddlers[title]) {
				changed = true;
			}
		});
		return changed;
	}
	if(changedAttributes.filter || !$tw.utils.isArrayEqual(this.tiddlerList,tiddlerList) || haveListedTiddlersChanged()) {
		// Compute the filter
		this.removeChildDomNodes();
		this.execute(tiddlerList);
		this.renderChildren(this.parentDomNode,this.findNextSiblingDomNode());
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
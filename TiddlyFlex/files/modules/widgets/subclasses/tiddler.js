/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/tiddler.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "tiddler";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes(),
		newTiddlerState = this.computeTiddlerState();
	if(changedAttributes.tiddler || newTiddlerState.hash !== this.tiddlerState.hash) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
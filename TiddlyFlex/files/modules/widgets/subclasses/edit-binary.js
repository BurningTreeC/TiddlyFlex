/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/edit-binary.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "edit-binary";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	return this.refreshChildren(changedTiddlers,force);
};

})();
/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/transclude.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "transclude";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(($tw.utils.count(changedAttributes) > 0) || (this.transcludeVariableIsFunction && this.functionNeedsRefresh()) || (!this.transcludeVariable && changedTiddlers[this.transcludeTitle] && this.parserNeedsRefresh())) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
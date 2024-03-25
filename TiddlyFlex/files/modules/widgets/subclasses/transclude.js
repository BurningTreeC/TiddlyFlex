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

exports.prototype.findParentContainedElement = function() {
	var widget = this;
	while(widget) {
		for(var i=0; i<widget.domNodes.length; i++) {
			var domNode = widget.domNodes[i];
			if(domNode.style && domNode.style["contain"]) {
				return domNode;
			}
		}
		widget = widget.parentWidget;
	}
	return null;
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
exports.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(($tw.utils.count(changedAttributes) > 0) || (this.transcludeVariableIsFunction && this.functionNeedsRefresh()) || (!this.transcludeVariable && changedTiddlers[this.transcludeTitle] && this.parserNeedsRefresh())) {
		var containedElement = this.findParentContainedElement();
		this.refreshSelf();
		if(containedElement) {
			$tw.utils.setStyle(containedElement,[
				{ contain: null }
			]);
		}
		return true;
	} else {
		return this.refreshChildren(changedTiddlers);
	}
};

})();
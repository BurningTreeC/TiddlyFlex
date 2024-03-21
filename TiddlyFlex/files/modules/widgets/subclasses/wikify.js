/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/wikify.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "wikify";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	// Refresh ourselves entirely if any of our attributes have changed
	if(changedAttributes.name || changedAttributes.text || changedAttributes.type || changedAttributes.mode || changedAttributes.output) {
		this.refreshSelf();
		return true;
	} else {
		// Refresh the widget tree
		if(this.wikifyWidgetNode.refresh(changedTiddlers,force)) {
			// Check if there was any change
			var result = this.getResult();
			if(result !== this.wikifyResult) {
				// If so, save the change
				this.wikifyResult = result;
				this.setVariable(this.wikifyName,this.wikifyResult);
				// Refresh each of our child widgets
				$tw.utils.each(this.children,function(childWidget) {
					childWidget.refreshSelf();
				});
				return true;
			}
		}
		// Just refresh the children
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
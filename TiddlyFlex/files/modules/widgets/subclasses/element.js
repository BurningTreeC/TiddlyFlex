/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/element.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "element";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes(),
		hasChangedAttributes = $tw.utils.count(changedAttributes) > 0;
	if(hasChangedAttributes) {
		if(!this.isReplaced) {
			// Update our attributes
			this.assignAttributes(this.domNodes[0],{excludeEventAttributes: true});
		} else {
			// If we were replaced then completely refresh ourselves
			return this.refreshSelf();
		}
	}
	return this.refreshChildren(changedTiddlers,force) || hasChangedAttributes;
};

})();
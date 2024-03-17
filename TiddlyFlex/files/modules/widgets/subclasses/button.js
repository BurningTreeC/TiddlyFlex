/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/button.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "button";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.actions || changedAttributes.to || changedAttributes.message || changedAttributes.param || changedAttributes.set || changedAttributes.setTo || changedAttributes.popup || changedAttributes.hover || changedAttributes.selectedClass || changedAttributes.style || changedAttributes.dragFilter || changedAttributes.dragTiddler || (this.set && changedTiddlers[this.set]) || (this.popup && changedTiddlers[this.popup]) || (this.popupTitle && changedTiddlers[this.popupTitle]) || changedAttributes.popupAbsCoords || changedAttributes.setTitle || changedAttributes.setField || changedAttributes.setIndex || changedAttributes.popupTitle || changedAttributes.disabled || changedAttributes["default"]) {
		this.refreshSelf();
		return true;
	} else {
		if(changedAttributes["class"]) {
			this.updateDomNodeClasses();
		}
		this.assignAttributes(this.domNodes[0],{
			changedAttributes: changedAttributes,
			sourcePrefix: "data-",
			destPrefix: "data-"
		});
	}
	return this.refreshChildren(changedTiddlers,force);
};

})();
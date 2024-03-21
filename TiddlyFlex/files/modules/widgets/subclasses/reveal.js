/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/reveal.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "reveal";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.state || changedAttributes.type || changedAttributes.text || changedAttributes.position || changedAttributes.positionAllowNegative || changedAttributes["default"] || changedAttributes.animate || changedAttributes.stateTitle || changedAttributes.stateField || changedAttributes.stateIndex) {
		this.refreshSelf();
		return true;
	} else {
		var currentlyOpen = this.isOpen;
		this.readState();
		if(this.isOpen !== currentlyOpen) {
			if(this.retain === "yes") {
				this.updateState();
			} else {
				this.refreshSelf();
				return true;
			}
		} else if(this.type === "popup" && this.isOpen && this.updatePopupPosition && (changedTiddlers[this.state] || changedTiddlers[this.stateTitle])) {
			this.positionPopup(this.domNode);
		}
		if(changedAttributes.style) {
			this.domNode.style = this.getAttribute("style","");
		}
		if(changedAttributes["class"]) {
			this.assignDomNodeClasses();
		}
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
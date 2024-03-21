/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/draggable.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "draggable";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.tag || changedAttributes.selector || changedAttributes.dragimagetype || changedAttributes.enable || changedAttributes.startactions || changedAttributes.endactions) {
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
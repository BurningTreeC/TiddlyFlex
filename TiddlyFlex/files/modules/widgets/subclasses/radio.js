/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/radio.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "radio";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if($tw.utils.count(changedAttributes) > 0) {
		this.refreshSelf();
		return true;
	} else if(changedTiddlers[this.radioTitle]) {
		this.inputDomNode.checked = this.getValue() === this.radioValue;
		$tw.utils.toggleClass(this.labelDomNode,"tc-radio-selected",this.inputDomNode.checked);
		return this.refreshChildren(changedTiddlers,force);
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
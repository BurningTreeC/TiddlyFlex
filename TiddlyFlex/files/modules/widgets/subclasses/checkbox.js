/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/checkbox.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "checkbox";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.tiddler || changedAttributes.tag || changedAttributes.invertTag || changedAttributes.field || changedAttributes.index || changedAttributes.listField || changedAttributes.listIndex || changedAttributes.filter || changedAttributes.checked || changedAttributes.unchecked || changedAttributes["default"] || changedAttributes.indeterminate || changedAttributes["class"] || changedAttributes.disabled) {
		this.refreshSelf();
		return true;
	} else {
		var refreshed = false;
		if(changedTiddlers[this.checkboxTitle]) {
			var isChecked = this.getValue();
			this.inputDomNode.checked = !!isChecked;
			this.inputDomNode.indeterminate = (isChecked === undefined);
			refreshed = true;
			if(isChecked) {
				$tw.utils.addClass(this.labelDomNode,"tc-checkbox-checked");
			} else {
				$tw.utils.removeClass(this.labelDomNode,"tc-checkbox-checked");
			}
		}
		this.assignAttributes(this.inputDomNode,{
			changedAttributes: changedAttributes,
			sourcePrefix: "data-",
			destPrefix: "data-"
		});
		return this.refreshChildren(changedTiddlers,force) || refreshed;
	}
};

})();
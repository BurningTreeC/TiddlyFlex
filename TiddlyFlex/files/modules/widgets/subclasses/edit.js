/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/edit.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "edit";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	// Refresh if an attribute has changed, or the type associated with the target tiddler has changed
	if(changedAttributes.tiddler || changedAttributes.field || changedAttributes.index || changedAttributes.tabindex || changedAttributes.cancelPopups || changedAttributes.inputActions || changedAttributes.refreshTitle || changedAttributes.autocomplete || (this.getEditorType() !== this.editorType)) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers,force);
	}
};

})();
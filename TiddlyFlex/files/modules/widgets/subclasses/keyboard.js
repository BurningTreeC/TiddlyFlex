/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/keyboard.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "keyboard";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.refresh = function(changedTiddlers,force) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.message || changedAttributes.param || changedAttributes.key || changedAttributes.tag) {
		this.refreshSelf();
		return true;
	} else if(changedAttributes["class"]) {
		this.assignDomNodeClasses();
	}
	// Update the keyInfoArray if one of its shortcut-config-tiddlers has changed
	if(this.shortcutTiddlers && $tw.utils.hopArray(changedTiddlers,this.shortcutTiddlers)) {
		this.keyInfoArray = $tw.keyboardManager.parseKeyDescriptors(this.key);
	}
	return this.refreshChildren(changedTiddlers,force);
};

})();
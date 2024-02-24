/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/navigator.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "navigator"; // Extend the <$checkbox> widget

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.handleNavigateEvent = function(event) {
	event = $tw.hooks.invokeHook("th-navigating",event);
	if(event.navigateTo || (event.paramObject && event.paramObject.navigateTo)) {
		this.addToStory(event.paramObject && event.paramObject.navigateTo ? event.paramObject.navigateTo : event.navigateTo,event.paramObject && event.paramObject.navigateFromTitle ? event.paramObject.navigateFromTitle : event.navigateFromTitle);
		if(!event.navigateSuppressNavigation && !(event.paramObject ? event.paramObject.navigateSuppressNavigation : false)) {
			this.addToHistory((event.paramObject && event.paramObject.navigateTo) ? event.paramObject.navigateTo : event.navigateTo,(event.paramObject && event.paramObject.navigateFromClientRect) ? event.paramObject.navigateFromClientRect : event.navigateFromClientRect);
		}
	}
	return false;
};

// Place a tiddler in edit mode
exports.prototype.handleEditTiddlerEvent = function(event) {
	var editTiddler = $tw.hooks.invokeHook("th-editing-tiddler",event),
	    win = event.event && event.event.view ? event.event.view : window;
	if(!editTiddler) {
		return false;
	}
	var self = this;
	function isUnmodifiedShadow(title) {
		return self.wiki.isShadowTiddler(title) && !self.wiki.tiddlerExists(title);
	}
	function confirmEditShadow(title) {
		return win.confirm($tw.language.getString(
			"ConfirmEditShadowTiddler",
			{variables:
				{title: title}
			}
		));
	}
	var title = event.param || event.tiddlerTitle;
	if(isUnmodifiedShadow(title) && !confirmEditShadow(title)) {
		return false;
	}
	// Replace the specified tiddler with a draft in edit mode
	var draftTiddler = this.makeDraftTiddler(title);
	// Update the story and history if required
	if(!event.paramObject || event.paramObject.suppressNavigation !== "yes") {
		var draftTitle = draftTiddler.fields.title,
			storyList = this.getStoryList();
		this.removeTitleFromStory(storyList,draftTitle);
		this.replaceFirstTitleInStory(storyList,title,draftTitle);
		if(!(event.paramObject && (event.paramObject.suppressNavigation === "true"))) {
			this.addToHistory(draftTitle,event.navigateFromClientRect);
		}
		this.saveStoryList(storyList);
		return false;
	}
};

})();
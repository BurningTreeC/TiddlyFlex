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
		if(!event.navigateSuppressNavigation && !(event.paramObject ? (event.paramObject.navigateSuppressNavigation === "true") : false)) {
			this.addToHistory((event.paramObject && event.paramObject.navigateTo) ? event.paramObject.navigateTo : event.navigateTo,(event.paramObject && event.paramObject.navigateFromClientRect) ? event.paramObject.navigateFromClientRect : event.navigateFromClientRect);
		}
	}
	return false;
};

// Close a specified tiddler
exports.prototype.handleCloseTiddlerEvent = function(event) {
	event = $tw.hooks.invokeHook("th-closing-tiddler",event);
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle,
		storyList = this.getStoryList();
	// Look for tiddlers with this title to close
	this.removeTitleFromStory(storyList,title);
	this.saveStoryList(storyList);
	return false;
};

// Close other tiddlers
exports.prototype.handleCloseOtherTiddlersEvent = function(event) {
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle;
	this.saveStoryList([title]);
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
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle;
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

// Delete a tiddler
exports.prototype.handleDeleteTiddlerEvent = function(event) {
	// Get the tiddler we're deleting
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle,
		tiddler = this.wiki.getTiddler(title),
		storyList = this.getStoryList(),
		originalTitle = tiddler ? tiddler.fields["draft.of"] : "",
		originalTiddler = originalTitle ? this.wiki.getTiddler(originalTitle) : undefined,
		confirmationTitle,
		win = event.event && event.event.view ? event.event.view : window;
	// Check if the tiddler we're deleting is in draft mode
	if(originalTitle) {
		// If so, we'll prompt for confirmation referencing the original tiddler
		confirmationTitle = originalTitle;
	} else {
		// If not a draft, then prompt for confirmation referencing the specified tiddler
		confirmationTitle = title;
	}
	// Seek confirmation
	if(((originalTitle && this.wiki.getTiddler(originalTitle)) || (tiddler && ((tiddler.fields.text || "") !== ""))) && !win.confirm($tw.language.getString(
				"ConfirmDeleteTiddler",
				{variables:
					{title: confirmationTitle}
				}
			))) {
		return false;
	}
	// Delete the original tiddler
	if(originalTitle) {
		if(originalTiddler) {
			$tw.hooks.invokeHook("th-deleting-tiddler",originalTiddler);
		}
		this.wiki.deleteTiddler(originalTitle);
		this.removeTitleFromStory(storyList,originalTitle);
	}
	// Invoke the hook function and delete this tiddler
	if(tiddler) {
		$tw.hooks.invokeHook("th-deleting-tiddler",tiddler);
		this.wiki.deleteTiddler(title);	
	}
	// Remove the closed tiddler from the story
	this.removeTitleFromStory(storyList,title);
	this.saveStoryList(storyList);
	// Trigger an autosave
	$tw.rootWidget.dispatchEvent({type: "tm-auto-save-wiki"});
	return false;
};

// Take a tiddler out of edit mode without saving the changes
exports.prototype.handleCancelTiddlerEvent = function(event) {
	event = $tw.hooks.invokeHook("th-cancelling-tiddler", event);
	var win = event.event && event.event.view ? event.event.view : window;
	// Flip the specified tiddler from draft back to the original
	var draftTitle = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle,
		draftTiddler = this.wiki.getTiddler(draftTitle),
		originalTitle = draftTiddler && draftTiddler.fields["draft.of"];
	if(draftTiddler && originalTitle) {
		// Ask for confirmation if the tiddler text has changed
		var isConfirmed = true,
			originalTiddler = this.wiki.getTiddler(originalTitle),
			storyList = this.getStoryList();
		if(this.wiki.isDraftModified(draftTitle)) {
			isConfirmed = win.confirm($tw.language.getString(
				"ConfirmCancelTiddler",
				{variables:
					{title: draftTitle}
				}
			));
		}
		// Remove the draft tiddler
		if(isConfirmed) {
			this.wiki.deleteTiddler(draftTitle);
			if(!event.paramObject || event.paramObject.suppressNavigation !== "yes") {
				if(originalTiddler) {
					this.replaceFirstTitleInStory(storyList,draftTitle,originalTitle);
					this.addToHistory(originalTitle,event.navigateFromClientRect);
				} else {
					this.removeTitleFromStory(storyList,draftTitle);
				}
				this.saveStoryList(storyList);
			}
		}
	}
	return false;
};

// Close a specified tiddler
exports.prototype.handleCloseTiddlerEvent = function(event) {
	event = $tw.hooks.invokeHook("th-closing-tiddler",event);
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle,
		storyList = this.getStoryList();
	// Look for tiddlers with this title to close
	this.removeTitleFromStory(storyList,title);
	this.saveStoryList(storyList);
	return false;
};

// Close other tiddlers
exports.prototype.handleCloseOtherTiddlersEvent = function(event) {
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle;
	this.saveStoryList([title]);
	return false;
};

// Take a tiddler out of edit mode, saving the changes
exports.prototype.handleSaveTiddlerEvent = function(event) {
	var title = event.param || event.tiddlerTitle || event.paramObject.tiddlerTitle,
		tiddler = this.wiki.getTiddler(title),
		storyList = this.getStoryList(),
	    	win = event.event && event.event.view ? event.event.view : window;
	// Replace the original tiddler with the draft
	if(tiddler) {
		var draftTitle = (tiddler.fields["draft.title"] || "").trim(),
			draftOf = (tiddler.fields["draft.of"] || "").trim();
		if(draftTitle) {
			var isRename = draftOf !== draftTitle,
				isConfirmed = true;
			if(isRename && this.wiki.tiddlerExists(draftTitle)) {
				isConfirmed = win.confirm($tw.language.getString(
					"ConfirmOverwriteTiddler",
					{variables:
						{title: draftTitle}
					}
				));
			}
			if(isConfirmed) {
				// Create the new tiddler and pass it through the th-saving-tiddler hook
				var newTiddler = new $tw.Tiddler(this.wiki.getCreationFields(),tiddler,{
					title: draftTitle,
					"draft.title": undefined,
					"draft.of": undefined
				},this.wiki.getModificationFields());
				newTiddler = $tw.hooks.invokeHook("th-saving-tiddler",newTiddler,tiddler);
				this.wiki.addTiddler(newTiddler);
				// If enabled, relink references to renamed tiddler
				var shouldRelink = this.getAttribute("relinkOnRename","no").toLowerCase().trim() === "yes";
				if(isRename && shouldRelink && this.wiki.tiddlerExists(draftOf)) {
					this.wiki.relinkTiddler(draftOf,draftTitle);
				}
				// Remove the draft tiddler
				this.wiki.deleteTiddler(title);
				// Remove the original tiddler if we're renaming it
				if(isRename) {
					this.wiki.deleteTiddler(draftOf);
				}
				// #2381 always remove new title & old
				this.removeTitleFromStory(storyList,draftTitle);
				this.removeTitleFromStory(storyList,draftOf);
				if(!event.paramObject || event.paramObject.suppressNavigation !== "yes") {
					// Replace the draft in the story with the original
					this.replaceFirstTitleInStory(storyList,title,draftTitle);
					this.addToHistory(draftTitle,event.navigateFromClientRect);
					if(draftTitle !== this.storyTitle) {
						this.saveStoryList(storyList);
					}
				}
				// Trigger an autosave
				$tw.rootWidget.dispatchEvent({type: "tm-auto-save-wiki"});
			}
		}
	}
	return false;
};

exports.prototype.handleFoldTiddlerEvent = function(event) {
	var paramObject = (event.event.paramObject && event.event.paramObject.foldedState) ? event.event.paramObject : (event.paramObject || {});
	if(paramObject.foldedState) {
		var foldedState = this.wiki.getTiddlerText(paramObject.foldedState,"show") === "show" ? "hide" : "show";
		this.wiki.setText(paramObject.foldedState,"text",null,foldedState);
	}
};

exports.prototype.handleFoldOtherTiddlersEvent = function(event) {
	var self = this,
		paramObject = (event.event.paramObject && event.event.paramObject.foldedStatePrefix) ? event.event.paramObject : (event.paramObject || {}),
		prefix = paramObject.foldedStatePrefix;
	$tw.utils.each(this.getStoryList(),function(title) {
		self.wiki.setText(prefix + title,"text",null,event.param === title ? "show" : "hide");
	});
};

exports.prototype.handleFoldAllTiddlersEvent = function(event) {
	var self = this,
		paramObject = (event.event.paramObject && event.event.paramObject.foldedStatePrefix) ? event.event.paramObject : (event.paramObject || {}),
		prefix = paramObject.foldedStatePrefix || "$:/state/folded/";
	$tw.utils.each(this.getStoryList(),function(title) {
		self.wiki.setText(prefix + title,"text",null,"hide");
	});
};

exports.prototype.handleUnfoldAllTiddlersEvent = function(event) {
	var self = this,
		paramObject = (event.event.paramObject && event.event.paramObject.foldedStatePrefix) ? event.event.paramObject : (event.paramObject || {}),
		prefix = paramObject.foldedStatePrefix;
	$tw.utils.each(this.getStoryList(),function(title) {
		self.wiki.setText(prefix + title,"text",null,"show");
	});
};

})();
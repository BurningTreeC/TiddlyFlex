/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/dynanode.js
type: application/javascript
module-type: widget

DynaNode widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var STATE_OUT_OF_VIEW = "0",
	STATE_NEAR_VIEW = "1",
	STATE_IN_VIEW = "2";

var isWaitingForAnimationFrame = 0, // Bitmask:
	ANIM_FRAME_CAUSED_BY_LOAD = 1, // Animation frame was requested because of page load
	ANIM_FRAME_CAUSED_BY_SCROLL = 2, // Animation frame was requested because of page scroll
	ANIM_FRAME_CAUSED_BY_RESIZE = 4; // Animation frame was requested because of window resize

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var DynaNodeWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
DynaNodeWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
DynaNodeWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	// Remember parent
	this.parentDomNode = parent;
	// Compute attributes and execute state
	this.computeAttributes();
	this.execute();
	// Create element
	var tag = this.parseTreeNode.isBlock ? "div" : "span";
	if(this.elementTag && $tw.config.htmlUnsafeElements.indexOf(this.elementTag) === -1) {
		tag = this.elementTag;
	}
	var domNode = this.document.createElement(tag);
	this.domNode = domNode;
	// Assign classes
	this.assignDomNodeClasses();

	function worker() {
		self.checkVisibility();
		isWaitingForAnimationFrame = 0;
	}

	var onScroll = function(event) {
		if(!isWaitingForAnimationFrame) {
			window.requestAnimationFrame(worker);
		}
		isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_SCROLL;
	};

	domNode.addEventListener("scroll",onScroll,false);

	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);

	this.checkVisibility();
};

DynaNodeWidget.prototype.checkVisibility = function() {
	var self = this;
	var elements = this.domNode.querySelectorAll(".tc-dynanode-track-tiddler-when-visible");
	var parentWidth = this.parentDomNode.offsetWidth,
		parentHeight = this.parentDomNode.offsetHeight;
	var parentBounds = this.parentDomNode.getBoundingClientRect();
	var parentRect = {
		left: parentBounds.left,
		right: parentBounds.left + parentWidth,
		top: parentBounds.top,
		bottom: parentBounds.top + parentHeight
	};
	$tw.utils.each(elements,function(element) {
		// Calculate whether the element is visible
		var elementRect = element.getBoundingClientRect(),
			title = element.getAttribute("data-dynanode-track-tiddler");
		if(title) {
			var currValue = $tw.wiki.getTiddlerText(title),
				newValue = currValue;
			// Within viewport
			if(!(elementRect.left > parentRect.right || 
								elementRect.right < parentRect.left || 
								elementRect.top > parentRect.bottom ||
								elementRect.bottom < parentRect.top)) {
				newValue = STATE_IN_VIEW;
			// Near viewport
			} else if(!(elementRect.left > (parentRect.right + parentWidth) || 
								elementRect.right < (parentRect.left - parentWidth) || 
								elementRect.top > (parentRect.bottom + parentHeight) ||
								elementRect.bottom < (parentRect.top - parentHeight))) {
				newValue = STATE_NEAR_VIEW;
			} else {
				newValue = STATE_OUT_OF_VIEW;
			}
			if(newValue !== currValue) {
				$tw.wiki.addTiddler(new $tw.Tiddler({title: title, text: newValue, column: self.dynanodeColumn}));
			}
		}
	});
};

/*
Compute the internal state of the widget
*/
DynaNodeWidget.prototype.execute = function() {
	var self = this;
	this.elementTag = this.getAttribute("tag");
	this.dynanodeColumn = this.getAttribute("column");
	// Make child widgets
	this.makeChildWidgets();
};

DynaNodeWidget.prototype.assignDomNodeClasses = function() {
	var classes = this.getAttribute("class","").split(" ");
	classes.push("tc-dynanode");
	this.domNode.className = classes.join(" ");
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
DynaNodeWidget.prototype.refresh = function(changedTiddlers) {
	var self = this;
	var changedAttributes = this.computeAttributes(),
		changedAttributesCount = $tw.utils.count(changedAttributes);
	if(changedAttributesCount === 1 && changedAttributes["class"]) {
		this.assignDomNodeClasses();
	} else if(changedAttributes.tag || changedAttributes.column) {
		this.refreshSelf();
		return true;
	}
	if(changedTiddlers["$:/state/tiddlyflex/story-river/filter"] || ((this.wiki.getTiddlerText("$:/state/tiddlyflex/story-river/filter") === "yes") && changedTiddlers["$:/temp/search/input"]) || changedTiddlers["$:/StoryList-" + this.dynanodeColumn]) {
		this.checkVisibility();
		setTimeout(function() {
			self.checkVisibility();
		},this.wiki.getTiddlerText("$:/config/AnimationDuration"));
	}
	return this.refreshChildren(changedTiddlers);
};

exports.dynanode = DynaNodeWidget;

})();

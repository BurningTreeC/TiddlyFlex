/*\
title: $:/plugins/BTC/TiddlyFlex/modules/storyviews/tiddlyflex.js
type: application/javascript
module-type: storyview

Views the story as a linear sequence

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var easing = "cubic-bezier(0.645, 0.045, 0.355, 1)"; // From http://easings.net/#easeInOutCubic
var addTimeout,
	removeTimeout;

var TiddlyFlexStoryView = function(listWidget) {
	this.listWidget = listWidget;
};

TiddlyFlexStoryView.prototype.navigateTo = function(historyInfo) {
	var duration = $tw.utils.getAnimationDuration()
	var listElementIndex = this.listWidget.findListItem(0,historyInfo.title);
	if(listElementIndex === undefined) {
		return;
	}
	var listItemWidget = this.listWidget.children[listElementIndex],
		targetElement = listItemWidget.findFirstDomNode();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
		return;
	}
	if(duration) {
		// Scroll the node into view
		this.listWidget.dispatchEvent({type: "tm-scroll", target: targetElement});
	} else {
		targetElement.scrollIntoView();
	}
};

TiddlyFlexStoryView.prototype.insert = function(widget) {
	var duration = $tw.utils.getAnimationDuration(),
		tiddlerTitle = widget.parseTreeNode.itemTitle;
	if(duration && !widget.wiki.tiddlerExists("$:/state/dragging") && !widget.wiki.tiddlerExists("$:/state/tiddlyflex/adding/" + tiddlerTitle) && !widget.wiki.tiddlerExists("$:/state/tiddlyflex/story-river/fullscreen/" + tiddlerTitle)) {
		var targetElement = widget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
			return;
		}
		// Get the current height of the tiddler
		var computedStyle = window.getComputedStyle(targetElement),
			currMarginBottom = parseInt(computedStyle.marginBottom,10),
			currMarginTop = parseInt(computedStyle.marginTop,10),
			currHeight = targetElement.offsetHeight + currMarginTop;
		// Reset the margin once the transition is over
		clearTimeout(addTimeout);
		addTimeout = setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/tiddlyflex/adding/" + tiddlerTitle);
		},duration);
		setTimeout(function() {
			$tw.utils.setStyle(targetElement,[
				{transition: "none"},
				{marginBottom: ""}
			]);
		},duration);
		// Set up the initial position of the element
		$tw.utils.setStyle(targetElement,[
			{transition: "none"},
			{marginBottom: (-currHeight) + "px"},
			{opacity: "0.0"}
		]);
		$tw.utils.forceLayout(targetElement);
		// Transition to the final position
		$tw.utils.setStyle(targetElement,[
			{transition: "opacity " + duration + "ms " + easing + ", " +
						"margin-bottom " + duration + "ms " + easing},
			{marginBottom: currMarginBottom + "px"},
			{opacity: "1.0"}
		]);
	} else if(duration && !widget.wiki.tiddlerExists("$:/state/dragging") && widget.wiki.tiddlerExists("$:/state/tiddlyflex/adding/" + tiddlerTitle)) {
		var targetElement = widget.findFirstDomNode();
		widget.wiki.setText("$:/state/tiddlyflex/adding/" + tiddlerTitle,"height",undefined,targetElement.offsetHeight);
		clearTimeout(addTimeout);
		addTimeout = setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/tiddlyflex/adding/" + tiddlerTitle);
		},duration);
	} else {
		clearTimeout(addTimeout);
		addTimeout = setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/tiddlyflex/adding/" + tiddlerTitle);
		},duration);
	}
	if($tw.wiki.tiddlerExists("$:/state/dragging")) {
		widget.wiki.deleteTiddler("$:/state/dragging");
	}
};

TiddlyFlexStoryView.prototype.remove = function(widget) {
	var duration = $tw.utils.getAnimationDuration(),
		tiddlerTitle = widget.parseTreeNode.itemTitle;
	if(duration && !widget.wiki.tiddlerExists("$:/state/dragging") && !widget.wiki.tiddlerExists("$:/state/tiddlyflex/removing/" + tiddlerTitle) && !widget.wiki.tiddlerExists("$:/state/tiddlyflex/story-river/fullscreen/" + tiddlerTitle)) {
		var targetElement = widget.findFirstDomNode(),
			removeElement = function() {
				widget.removeChildDomNodes();
				widget.wiki.deleteTiddler("$:/state/tiddlyflex/removing/" + tiddlerTitle);
			};
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
			removeElement();
			return;
		}
		// Get the current height of the tiddler
		var currWidth = targetElement.offsetWidth,
			computedStyle = window.getComputedStyle(targetElement),
			currMarginBottom = parseInt(computedStyle.marginBottom,10),
			currMarginTop = parseInt(computedStyle.marginTop,10),
			currHeight = targetElement.offsetHeight + currMarginTop;
		// Remove the dom nodes of the widget at the end of the transition
		clearTimeout(removeTimeout);
		removeTimeout = setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/tiddlyflex/removing/" + tiddlerTitle);
		},duration);
		setTimeout(removeElement,duration);
		// Animate the closure
		$tw.utils.setStyle(targetElement,[
			{transition: "none"},
			{transform: "translateX(0px)"},
			{marginBottom:  currMarginBottom + "px"},
			{opacity: "1.0"}
		]);
		$tw.utils.forceLayout(targetElement);
		$tw.utils.setStyle(targetElement,[
			{transition: $tw.utils.roundTripPropertyName("transform") + " " + duration + "ms " + easing + ", " +
						"opacity " + duration + "ms " + easing + ", " +
						"margin-bottom " + duration + "ms " + easing},
			{transform: "translateX(-" + currWidth + "px)"},
			{marginBottom: (-currHeight) + "px"},
			{opacity: "0.0"}
		]);
	} else if(duration && !widget.wiki.tiddlerExists("$:/state/dragging") && widget.wiki.tiddlerExists("$:/state/tiddlyflex/removing/" + tiddlerTitle)) {
		var targetElement = widget.findFirstDomNode(),
			removeElement = function() {
				widget.removeChildDomNodes();
			};
		widget.wiki.setText("$:/state/tiddlyflex/removing/" + tiddlerTitle,"height",undefined,targetElement.offsetHeight);
		clearTimeout(removeTimeout);
		removeTimeout = setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/tiddlyflex/removing/" + tiddlerTitle);
		},duration);
		setTimeout(removeElement,duration);
	} else {
		widget.removeChildDomNodes();
		clearTimeout(removeTimeout);
		removeTimeout = setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/tiddlyflex/removing/" + tiddlerTitle);
		},duration);
	}
};

exports.tiddlyflex = TiddlyFlexStoryView;

})();

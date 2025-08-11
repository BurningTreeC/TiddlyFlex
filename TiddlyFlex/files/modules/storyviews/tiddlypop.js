/*\
title: $:/plugins/BTC/TiddlyFlex/modules/storyviews/tiddlypop.js
type: application/javascript
module-type: storyview

Animates list insertions and removals

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var TiddlyPopStoryView = function(listWidget) {
	this.listWidget = listWidget;
};

TiddlyPopStoryView.prototype.navigateTo = function(historyInfo) {
	// Check if storyview scrolling is enabled
	var enableScroll = this.listWidget.getVariable("tv-enable-storyview-scroll");
	if(enableScroll !== "yes") {
		return;
	}
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
	// Scroll the node into view
	this.listWidget.dispatchEvent({type: "tm-scroll", target: targetElement});
};

TiddlyPopStoryView.prototype.insert = function(widget) {
	var targetElement = widget.findFirstDomNode(),
		duration = $tw.utils.getAnimationDuration();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
		return;
	}
	// Reset once the transition is over
	setTimeout(function() {
		$tw.utils.setStyle(targetElement,[
			{transition: "none"},
			{transform: "none"}
		]);
		$tw.utils.setStyle(widget.document.body,[
			{"overflow-x": ""}
		]);
	},duration);
	// Prevent the page from overscrolling due to the zoom factor
	$tw.utils.setStyle(widget.document.body,[
		{"overflow-x": "hidden"}
	]);
	// Set up the initial position of the element
	$tw.utils.setStyle(targetElement,[
		{transition: "none"},
		{transform: "scale(2)"},
		{opacity: "0.0"}
	]);
	$tw.utils.forceLayout(targetElement);
	// Transition to the final position
	$tw.utils.setStyle(targetElement,[
		{transition: $tw.utils.roundTripPropertyName("transform") + " " + duration + "ms ease-in-out, " +
					"opacity " + duration + "ms ease-in-out"},
		{transform: "scale(1)"},
		{opacity: "1.0"}
	]);
};

TiddlyPopStoryView.prototype.remove = function(widget) {
	var targetElement = widget.findFirstDomNode(),
		duration = $tw.utils.getAnimationDuration(),
		removeElement = function() {
			if(targetElement && targetElement.parentNode) {
				widget.removeChildDomNodes();
			}
		};
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
		removeElement();
		return;
	}
	// Remove the element at the end of the transition
	setTimeout(removeElement,duration);
	// Animate the closure
	$tw.utils.setStyle(targetElement,[
		{transition: "none"},
		{transform: "scale(1)"},
		{opacity: "1.0"}
	]);
	$tw.utils.forceLayout(targetElement);
	$tw.utils.setStyle(targetElement,[
		{transition: $tw.utils.roundTripPropertyName("transform") + " " + duration + "ms ease-in-out, " +
					"opacity " + duration + "ms ease-in-out"},
		{transform: "scale(0.1)"},
		{opacity: "0.0"}
	]);
};

exports.tiddlypop = TiddlyPopStoryView;

})();

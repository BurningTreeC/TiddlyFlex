/*\
title: $:/plugins/BTC/TiddlyFlex/modules/utils/dom/tiddlyflex-utils.js
type: application/javascript
module-type: utils

Browser data transfer utilities, used with the clipboard and drag and drop

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Options:

domNode: dom node to make draggable
selector: CSS selector to identify element within domNode to be used as drag handle (optional)
dragImageType: "pill", "blank" or "dom" (the default)
dragTiddlerFn: optional function to retrieve the title of tiddler to drag
dragFilterFn: optional function to retreive the filter defining a list of tiddlers to drag
widget: widget to use as the context for the filter
*/
exports.makeTiddlyFlexDraggable = function(options) {
	var dragImageType = options.dragImageType || "dom",
		dragImage,
		domNode = options.domNode,
		removeEventHandler = options.remove;
	// Make the dom node draggable (not necessary for anchor tags)
	if(!options.selector && ((domNode.tagName || "").toLowerCase() !== "a")) {
		domNode.setAttribute("draggable","true");
	}
	var dragStartHandlerFunction = function(event) {
		if(event.dataTransfer === undefined) {
			return false;
		}
		// Collect the tiddlers being dragged
		var dragTiddler = options.dragTiddlerFn && options.dragTiddlerFn(),
			dragFilter = options.dragFilterFn && options.dragFilterFn(),
			titles = dragTiddler ? [dragTiddler] : [],
			startActions = options.startActions,
			variables,
			domNodeRect;
		if(dragFilter) {
			titles.push.apply(titles,options.widget.wiki.filterTiddlers(dragFilter,options.widget));
		}
		var titleString = $tw.utils.stringifyList(titles);
		// Check that we've something to drag
		if(titles.length > 0 && (options.selector && $tw.utils.domMatchesSelector(event.target,options.selector) || event.target === domNode)) {
			// Mark the drag in progress
			$tw.dragInProgress = domNode;
			// Set the dragging class on the element being dragged
			$tw.utils.addClass(domNode,"tc-dragging");
			// Invoke drag-start actions if given
			if(startActions !== undefined) {
				// Collect our variables
				variables = $tw.utils.collectDOMVariables(domNode,null,event);
				variables.modifier = $tw.keyboardManager.getEventModifierKeyDescriptor(event);
				variables["actionTiddler"] = titleString;
				options.widget.invokeActionString(startActions,options.widget,event,variables);
			}
			// Create the drag image elements
			dragImage = options.widget.document.createElement("div");
			dragImage.className = "tc-tiddler-dragger";
			var inner = options.widget.document.createElement("div");
			inner.className = "tc-tiddler-dragger-inner";
			inner.appendChild(options.widget.document.createTextNode(
				titles.length === 1 ? 
					titles[0] :
					titles.length + " tiddlers"
			));
			dragImage.appendChild(inner);
			options.widget.document.body.appendChild(dragImage);
			// Set the data transfer properties
			var dataTransfer = event.dataTransfer;
			// Set up the image
			dataTransfer.effectAllowed = "all";
			if(dataTransfer.setDragImage) {
				if(dragImageType === "pill") {
					dataTransfer.setDragImage(dragImage.firstChild,-16,-16);
				} else if(dragImageType === "blank") {
					dragImage.removeChild(dragImage.firstChild);
					dataTransfer.setDragImage(dragImage,0,0);
				} else {
					var r = domNode.getBoundingClientRect();
					dataTransfer.setDragImage(domNode,event.clientX-r.left,event.clientY-r.top);
				}
			}
			// Set up the data transfer
			if(dataTransfer.clearData) {
				dataTransfer.clearData();
			}
			var jsonData = [];
			if(titles.length > 1) {
				titles.forEach(function(title) {
					jsonData.push(options.widget.wiki.getTiddlerAsJson(title));
				});
				jsonData = "[" + jsonData.join(",") + "]";
			} else {
				jsonData = options.widget.wiki.getTiddlerAsJson(titles[0]);
			}
			// IE doesn't like these content types
			if(!$tw.browser.isIE) {
				dataTransfer.setData("text/vnd.tiddler",jsonData);
				dataTransfer.setData("text/plain",titleString);
				dataTransfer.setData("text/x-moz-url","data:text/vnd.tiddler," + encodeURIComponent(jsonData));
			}
			// If browser is Chrome-like and has a touch-input device do NOT .setData
			if(!($tw.browser.isMobileChrome)) {
				dataTransfer.setData("URL","data:text/vnd.tiddler," + encodeURIComponent(jsonData));
			}
			dataTransfer.setData("Text",titleString);
			event.stopPropagation();
		}
		return false;
	};

	var dragEndHandlerFunction = function(event) {
		if((options.selector && $tw.utils.domMatchesSelector(event.target,options.selector)) || event.target === domNode) {
			// Collect the tiddlers being dragged
			var dragTiddler = options.dragTiddlerFn && options.dragTiddlerFn(),
				dragFilter = options.dragFilterFn && options.dragFilterFn(),
				titles = dragTiddler ? [dragTiddler] : [],
				endActions = options.endActions,
				variables;
			if(dragFilter) {
				titles.push.apply(titles,options.widget.wiki.filterTiddlers(dragFilter,options.widget));
			}
			var titleString = $tw.utils.stringifyList(titles);
			$tw.dragInProgress = null;
			// Invoke drag-end actions if given
			if(endActions !== undefined) {
				variables = $tw.utils.collectDOMVariables(domNode,null,event);
				variables.modifier = $tw.keyboardManager.getEventModifierKeyDescriptor(event);
				variables["actionTiddler"] = titleString;
				options.widget.invokeActionString(endActions,options.widget,event,variables);
			}
			// Remove the dragging class on the element being dragged
			$tw.utils.removeClass(domNode,"tc-dragging");
			// Delete the drag image element
			if(dragImage) {
				dragImage.parentNode.removeChild(dragImage);
				dragImage = null;
			}
		}
		return false;
	};

	// Add event handlers
	options.widget.dragStartListenerReference = dragStartHandlerFunction;
	options.widget.dragEndListenerReference = dragEndHandlerFunction;
	$tw.utils.addEventListeners(domNode,[
		{name: "dragstart", handlerFunction: dragStartHandlerFunction},
		{name: "dragend", handlerFunction: dragEndHandlerFunction}
	]);
};

})();
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
	// Remember domNode
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

	this.isFirstRender = true;

	function worker() {
		self.checkVisibility();
		isWaitingForAnimationFrame = 0;
	}

	this.onScroll = function(event) {
		if(!isWaitingForAnimationFrame) {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(worker);
		}
		isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_SCROLL;
	};

	this.onResize = function(event) {
		if(!isWaitingForAnimationFrame && !$tw.wiki.tiddlerExists("$:/state/dragging")) {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(worker);
		}
		isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_RESIZE;
	};

	this.resizeObserver = new ResizeObserver(function(entries) {
		self.onResize();
	});

	this.reserveSpaceObserver = new ResizeObserver(function(entries) {
		if(!self.isFirstRender) {
			for(var i=0; i<entries.length; i++) {
				var entry = entries[i];
				self.reserveSpace(entry.target, entry.contentRect);
			}
		}
	});

	this.mutationObserver = new MutationObserver(function(mutations) {
		var childListChanged = false;
		var addedNodes = [],
			removedNodes = [];
		for(var i=0; i<mutations.length; i++) {
			var mutation = mutations[i];
			if(mutation.type === "childList") {
				for(var j=0; j<mutation.addedNodes.length; j++) {
					var addedNode = mutation.addedNodes[j];
					if(addedNode.classList && addedNode.classList.contains("tc-dynanode-track-tiddler-when-visible")) {
						childListChanged = true;
						addedNodes.push(addedNode);
					}
				}
				if(!childListChanged) {
					for(var j=0; j<mutation.removedNodes.length; j++) {
						var removedNode = mutation.removedNodes[j];
						if(removedNode.classList && removedNode.classList.contains("tc-dynanode-track-tiddler-when-visible")) {
							childListChanged = true;
							removedNodes.push(removedNode);
						}
					}					
				}
			}
		}
		if(childListChanged) {
			for(var k=0; k<addedNodes.length; k++) {
				self.reserveSpaceObserver.observe(addedNodes[k]);
			}
			for(var l=0; l<removedNodes.length; l++) {
				self.reserveSpaceObserver.unobserve(removedNodes[l]);
			}
			if(!isWaitingForAnimationFrame) {
				self.domNode.ownerDocument.defaultView.requestAnimationFrame(worker);
			}
			isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_RESIZE;
		}
	});

	if(this.dynanodeEnable) {
		domNode.addEventListener("scroll",this.onScroll,false);
		domNode.ownerDocument.defaultView.addEventListener("resize",this.onResize,false);
		this.resizeObserver.observe(domNode);
		this.mutationObserver.observe(domNode,{attributes: true, childList: true, subtree: true});
	}

	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);

	if(this.dynanodeEnable) {
		this.checkVisibility();
	}
};

DynaNodeWidget.prototype.reserveSpace = function(element,rect = element.getBoundingClientRect()) {
	var self = this;
	var title = element.getAttribute("data-dynanode-track-tiddler");
	if(title && !$tw.wiki.tiddlerExists("$:/state/dragging")) {
		var tiddler = this.wiki.getTiddler(title);
		var oldRect = {
			left: tiddler.fields.left,
			right: tiddler.fields.right,
			top: tiddler.fields.top,
			bottom: tiddler.fields.bottom,
			width: tiddler.fields.width,
			height: tiddler.fields.height
		};
		var newWidth = rect.width,
			newHeight = rect.height;
		if((newHeight !== 0) && ((oldRect.width !== newWidth) || (oldRect.height !== newHeight))) {
			self.wiki.addTiddler(new $tw.Tiddler({title: title, text: tiddler.fields.text || "", left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: newWidth, height: newHeight}));
			$tw.utils.setStyle(element,[
				{containIntrinsicSize: `${newWidth}px ${newHeight}px` },
				{contentVisibility: "auto" }
			]);
		}
	}
};

DynaNodeWidget.prototype.checkVisibility = function() {
	var self = this;
	var elements = this.domNode.querySelectorAll(".tc-dynanode-track-tiddler-when-visible");
	var domNodeWidth = this.domNode.offsetWidth,
		domNodeHeight = this.domNode.offsetHeight,
		domNodeBounds = this.domNode.getBoundingClientRect();

	var domNodeRect = {
		left: domNodeBounds.left,
		right: domNodeBounds.left + domNodeWidth,
		top: domNodeBounds.top,
		bottom: domNodeBounds.top + domNodeHeight
	};
	$tw.utils.each(elements,function(element) {
		// Calculate whether the element is visible
		var elementRect = element.getBoundingClientRect(),
			title = element.getAttribute("data-dynanode-track-tiddler");
		if(title) {
			var currValue = self.wiki.getTiddlerText(title),
				newValue = currValue;
			// Within viewport
			if(!(elementRect.left > domNodeRect.right || 
								elementRect.right < domNodeRect.left || 
								elementRect.top > domNodeRect.bottom ||
								elementRect.bottom < domNodeRect.top)) {
				newValue = STATE_IN_VIEW;
			// Near viewport
			} else if(!(elementRect.left > (domNodeRect.right + domNodeWidth) || 
								elementRect.right < (domNodeRect.left - domNodeWidth) || 
								elementRect.top > (domNodeRect.bottom + domNodeHeight) ||
								elementRect.bottom < (domNodeRect.top - domNodeHeight))) {
				newValue = STATE_NEAR_VIEW;
			} else {
				newValue = STATE_OUT_OF_VIEW;
			}
			if(newValue !== currValue) {
				if(newValue === STATE_IN_VIEW) {
					$tw.utils.addClass(element,"tc-dynanode-visible");
					$tw.utils.removeClass(element,"tc-dynanode-near");
					$tw.utils.removeClass(element,"tc-dynanode-hidden");
				}
				if(newValue === STATE_NEAR_VIEW) {
					$tw.utils.addClass(element,"tc-dynanode-near");
					$tw.utils.removeClass(element,"tc-dynanode-visible");
					$tw.utils.removeClass(element,"tc-dynanode-hidden");
				}
				if(newValue === STATE_OUT_OF_VIEW) {
					$tw.utils.addClass(element,"tc-dynanode-hidden");
					$tw.utils.removeClass(element,"tc-dynanode-visible");
					$tw.utils.removeClass(element,"tc-dynanode-near");
				}
				self.wiki.addTiddler(new $tw.Tiddler({title: title, text: newValue, left: elementRect.left, right: elementRect.right, top: elementRect.top, bottom: elementRect.bottom, width: elementRect.width, height: elementRect.height}));
			}
		}
		if(self.isFirstRender) {
			self.reserveSpace(element,elementRect);
		};
	});
	this.isFirstRender = false;
};

/*
Compute the internal state of the widget
*/
DynaNodeWidget.prototype.execute = function() {
	var self = this;
	this.elementTag = this.getAttribute("tag");
	this.dynanodeColumn = this.getAttribute("column");
	this.dynanodeEnable = this.getAttribute("enable","no") === "yes";
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
	} else if(changedAttributes.enable) {
		this.dynanodeEnable = this.getAttribute("enable","no") === "yes";
		if(this.dynanodeEnable) {
			this.domNode.addEventListener("scroll",this.onScroll,false);
			this.domNode.ownerDocument.defaultView.addEventListener("resize",this.onResize,false);
			this.resizeObserver.observe(this.domNode);
			this.mutationObserver.observe(this.domNode,{attributes: true, childList: true, subtree: true});
			this.checkVisibility();
		} else {
			this.domNode.removeEventListener("scroll",this.onScroll,false);
			this.domNode.ownerDocument.defaultView.removeEventListener("resize",this.onResize,false);
			this.resizeObserver.unobserve(this.domNode);
			this.resizeObserver.disconnect();
			this.mutationObserver.disconnect();
			this.reserveSpaceObserver.disconnect();
		}
	}
	return this.refreshChildren(changedTiddlers);
};

exports.dynanode = DynaNodeWidget;

})();

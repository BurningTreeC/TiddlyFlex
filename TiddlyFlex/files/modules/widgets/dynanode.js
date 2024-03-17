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

var ANIM_FRAME_CAUSED_BY_LOAD = 1, // Animation frame was requested because of page load
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
	this.assignAttributes(domNode,{
		sourcePrefix: "data-",
		destPrefix: "data-"
	});

	this.isWaitingForAnimationFrame = 0;
	this.changedTiddlers = {};
	this.dynanodeElements = [];
	this.spaced = new WeakMap();
	this.spacedTimestamps = new WeakMap();
	this.stateMap = new WeakMap();

	function worker(refreshChildren) {
		for(var i=0; i<self.dynanodeElements.length; i++) {
			self.reserveSpace(self.dynanodeElements.length,i,self.dynanodeElements[i],undefined,refreshChildren);
		}
	};

	this.onScroll = function(event) {
		if(!self.isWaitingForAnimationFrame) {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
				worker(true);
			});
		}
		self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_SCROLL;
	};

	this.onResize = function(event) {
		if(!self.isWaitingForAnimationFrame) {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
				worker(false);
			});
		}
		self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_RESIZE;
	};

	this.dynanodeWorker = function(entries) {
		var length = entries.length;
		for(var i=0; i<length; i++) {
			var entry= entries[i];
			if(!entry.target && (self.dynanodeElements.indexOf(entry) === -1)) {
				self.dynanodeElements.push(entry);
			}
			var rect = entry.contentRect ? entry.contentRect : undefined;
			var target = entry.target ? entry.target : entry;
			self.reserveSpace(length,i,target,rect);
		}
	};

	this.resizeObserver = new ResizeObserver(function(entries) {
		self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
			if(!Array.isArray(entries) || !entries.length) {
				return;
			}
			if(self.isWaitingForAnimationFrame) {
				return;
			}
			if(!self.isWaitingForAnimationFrame) {
				self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
					self.dynanodeWorker(entries);
				});
			}
			self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_RESIZE;
		});
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
					if((addedNode.matches || addedNode.msMatchesSelector) && $tw.utils.domMatchesSelector(addedNode,self.dynanodeSelector)) {
						addedNodes.push(addedNode);
						if(j === (mutation.addedNodes.length - 1)) {
							for(var k=0; k<addedNodes.length; k++) {
								if(self.dynanodeElements.indexOf(addedNodes[k]) === -1) {
									self.dynanodeElements.push(addedNodes[k]);
								}
								self.resizeObserver.observe(addedNodes[k]);
								if(k === (addedNodes.length - 1)) {
									if(!self.isWaitingForAnimationFrame) {
										self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
											self.dynanodeWorker(addedNodes);
										});
									}
									self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_LOAD;
								}
							}
						}
					}
				}
				for(j=0; j<mutation.removedNodes.length; j++) {
					var removedNode = mutation.removedNodes[j];
					if((removedNode.matches || removedNode.msMatchesSelector) && $tw.utils.domMatchesSelector(removedNode,self.dynanodeRemoveSelector)) {
						removedNodes.push(removedNode);
						if(j === (mutation.removedNodes.length - 1)) {
							for(var k=0; k<removedNodes.length; k++) {
								self.resizeObserver.unobserve(removedNodes[k]);
								for(var l=0; l<self.dynanodeElements.length; l++) {
									var dynanodeElement = self.dynanodeElements[l];
									if((removedNodes[k] === dynanodeElement) || (removedNodes[k].contains(dynanodeElement))) {
										self.dynanodeElements.splice(l,1);
										self.spaced.delete(dynanodeElement);
										self.spacedTimestamps.delete(dynanodeElement);
										self.stateMap.delete(dynanodeElement);
									}
								}
								if(k === (removedNodes.length - 1)) {
									if(!self.isWaitingForAnimationFrame) {
										self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
											worker(false);
										});
									}
									self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_LOAD;
								}
							}
						}
					}
				}
			}
		}
	});

	if(this.dynanodeEnable) {
		domNode.addEventListener("scroll",this.onScroll,false);
		domNode.addEventListener("resize",this.onResize,false);
		domNode.ownerDocument.defaultView.addEventListener("resize",this.onResize,false);
		this.mutationObserver.observe(domNode,{childList: true, subtree: true});
	}

	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);

	if(this.dynanodeEnable) {
		this.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
				var elements = self.domNode.querySelectorAll(self.dynanodeSelector);
				self.dynanodeWorker(elements);
			});
		});
		self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_LOAD;
	}
};

DynaNodeWidget.prototype.eqIsh = function(a,b,fuzz = 0) {
	return (Math.abs(a - b) <= fuzz);
};

DynaNodeWidget.prototype.rectNotEQ = function(a,b) {
	return (!this.eqIsh(a.width, b.width) ||
			!this.eqIsh(a.height, b.height));
};

DynaNodeWidget.prototype.reserveSpace = function(length,i,element,rect,refreshChildren) {
	if(rect === undefined) {
		var bounds = element.getBoundingClientRect(),
			width = bounds.width,
			height = bounds.height;
		var computedStyle = this.domNode.ownerDocument.defaultView.getComputedStyle(element);
		rect = {
			width: width - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth)),
			height: height - (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom) + parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth))
		};
	}
	var old = this.spaced.get(element);
	var oldTimestamp = this.spacedTimestamps.get(element),
		newTimestamp = Date.now();
	if(!old || this.rectNotEQ(old,rect)) {
		this.spaced.set(element,rect);
		this.spacedTimestamps.set(element,newTimestamp);
		if(oldTimestamp === undefined) {
			oldTimestamp = newTimestamp - this.dynanodeTimeout;
		}
		if((newTimestamp - oldTimestamp) >= this.dynanodeTimeout) {
			$tw.utils.setStyle(element,[
				{ containIntrinsicSize: `${rect.width}px ${rect.height}px` }
			]);
		}
	}
	if((i === (length - 1)) && ((newTimestamp - oldTimestamp) >= this.dynanodeTimeout)) {
		this.checkVisibility(refreshChildren);
	}
};

DynaNodeWidget.prototype.checkVisibility = function(refreshChildren) {
	var self = this;
	//var elements = this.domNode.querySelectorAll(this.dynanodeSelector);
	var elements = this.dynanodeElements;
	var visibilityChanged = false;
	var domNodeWidth = this.domNode.offsetWidth,
		domNodeHeight = this.domNode.offsetHeight,
		domNodeBounds = this.domNode.getBoundingClientRect();

	var domNodeRect = {
		left: domNodeBounds.left,
		right: domNodeBounds.left + domNodeWidth,
		top: domNodeBounds.top,
		bottom: domNodeBounds.top + domNodeHeight
	};
	for(var i=0; i<elements.length; i++) {
		var element = elements[i];
		// Calculate whether the element is visible
		var elementRect = element.getBoundingClientRect();
		var currValue = self.stateMap.get(element),//self.wiki.getTiddlerText(title),
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
			self.stateMap.set(element,newValue);
			if(newValue === STATE_IN_VIEW) {
				$tw.utils.addClass(element,"tc-dynanode-visible");
				$tw.utils.removeClass(element,"tc-dynanode-near");
				$tw.utils.removeClass(element,"tc-dynanode-hidden");
				$tw.utils.setStyle(element,[
					{ contentVisibility: null }
				]);
				if(currValue !== undefined) {
					visibilityChanged = true;
				}
			}
			if(newValue === STATE_NEAR_VIEW) {
				$tw.utils.addClass(element,"tc-dynanode-near");
				$tw.utils.removeClass(element,"tc-dynanode-visible");
				$tw.utils.removeClass(element,"tc-dynanode-hidden");
				if(element.style["content-visibility"] !== "auto") {
					$tw.utils.setStyle(element,[
						{ contentVisibility: "auto" }
					]);
				}
			}
			if(newValue === STATE_OUT_OF_VIEW) {
				$tw.utils.addClass(element,"tc-dynanode-hidden");
				$tw.utils.removeClass(element,"tc-dynanode-visible");
				$tw.utils.removeClass(element,"tc-dynanode-near");
				if(element.style["content-visibility"] !== "auto") {
					$tw.utils.setStyle(element,[
						{ contentVisibility: "auto" }
					]);
				}
			}
		}
		if(i === (elements.length - 1)) {
			if(visibilityChanged) {
				self.refreshChildren(self.changedTiddlers,true);
			}
			self.isWaitingForAnimationFrame = 0;
		}
	}
};

DynaNodeWidget.prototype.clearElementStyles = function() {
	for(var i=0; i<this.dynanodeElements.length; i++) {
		var element = this.dynanodeElements[i];
		$tw.utils.removeClass(element,"tc-dynanode-visible");
		$tw.utils.removeClass(element,"tc-dynanode-near");
		$tw.utils.removeClass(element,"tc-dynanode-hidden");
		$tw.utils.setStyle(element,[
			{ contentVisibility: null },
			{ containIntrinsicSize: null }
		]);
		if(i === (this.dynanodeElements.length - 1)) {
			this.dynanodeElements = [];
			this.spaced = new WeakMap();
			this.spacedTimestamps = new WeakMap();
			this.stateMap = new WeakMap();
		}
	}
};

/*
Compute the internal state of the widget
*/
DynaNodeWidget.prototype.execute = function() {
	var self = this;
	this.elementTag = this.getAttribute("tag");
	this.dynanodeEnable = this.getAttribute("enable","no") === "yes";
	this.dynanodeSelector = this.getAttribute("selector",".tc-dynanode-track-tiddler-when-visible");
	this.dynanodeRemoveSelector = this.getAttribute("removeselector",".tc-dynanode-track-tiddler-when-visible");
	this.dynanodeTimeout = parseInt(this.getAttribute("timeout","25"));
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
	this.changedTiddlers = changedTiddlers;
	var changedAttributes = this.computeAttributes(),
		changedAttributesCount = $tw.utils.count(changedAttributes);
	if(changedAttributesCount === 1 && changedAttributes["class"]) {
		this.assignDomNodeClasses();
	} else if(changedAttributes.tag || changedAttributes.selector) {
		this.refreshSelf();
		return true;
	} else if(changedAttributes.enable) {
		this.dynanodeEnable = this.getAttribute("enable","no") === "yes";
		if(this.dynanodeEnable) {
			this.domNode.addEventListener("scroll",this.onScroll,false);
			this.domNode.addEventListener("resize",this.onResize,false);
			this.domNode.ownerDocument.defaultView.addEventListener("resize",this.onResize,false);
			this.mutationObserver.observe(this.domNode,{childList: true, subtree: true});
			this.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
				self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
					var elements = self.domNode.querySelectorAll(self.dynanodeSelector);
					self.dynanodeWorker(elements);
					for(var i=0; i<elements.length; i++) {
						self.resizeObserver.observe(elements[i]);
					}
				});
			});
			self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_LOAD;
		} else {
			this.domNode.removeEventListener("scroll",this.onScroll,false);
			this.domNode.removeEventListener("resize",this.onResize,false);
			this.domNode.ownerDocument.defaultView.removeEventListener("resize",this.onResize,false);
			this.resizeObserver.disconnect();
			this.mutationObserver.disconnect();
			this.clearElementStyles();
		}
	} else {
		this.assignAttributes(this.domNode,{
			changedAttributes: changedAttributes,
			sourcePrefix: "data-",
			destPrefix: "data-"
		});
	}
	if(changedAttributes.timeout) {
		this.dynanodeTimeout = parseInt(this.getAttribute("timeout","25"));
	}
	return this.refreshChildren(changedTiddlers);
};

exports.dynanode = DynaNodeWidget;

})();
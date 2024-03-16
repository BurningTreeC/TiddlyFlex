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
	this.isWaitingForAnimationFrame = 0; // Bitmask:
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

	this.changedTiddlers = {};
	this.dynanodeElements = [];
	this.spaced = new WeakMap();
	this.stateMap = new WeakMap();

	function worker() {
		for(var i=0; i<self.dynanodeElements.length; i++) {
			self.reserveSpace(self.dynanodeElements.length,i,self.dynanodeElements[i]);
		}
	};

	this.onScroll = function(event) {
		if(!self.isWaitingForAnimationFrame) {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(worker);
		}
		self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_SCROLL;
	};

	this.onResize = function(event) {
		if(!self.isWaitingForAnimationFrame) {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(worker);
		}
		self.isWaitingForAnimationFrame |= ANIM_FRAME_CAUSED_BY_RESIZE;
	};

	this.dynanodeWorker = function(entries) {
		var length = entries.length,
			targets = [];
		for(var i=0; i<length; i++) {
			var entry = entries[i];
			var target = entry.target ? entry.target : entry;
			if(self.dynanodeElements.indexOf(target) === -1) {
				self.dynanodeElements.push(target);
			}
		}
		for(i=0; i<length; i++) {
			var entry= entries[i];
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
								self.dynanodeElements.push(addedNodes[k]);
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
								var index = self.dynanodeElements.indexOf(removedNodes[k]);
								self.dynanodeElements.splice(index,1);
								self.spaced.delete(removedNodes[k]);
								self.stateMap.delete(removedNodes[k]);
								if(k === (removedNodes.length - 1)) {
									if(!self.isWaitingForAnimationFrame) {
										self.domNode.ownerDocument.defaultView.requestAnimationFrame(worker);
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

DynaNodeWidget.prototype.eqIsh = function(a,b,fuzz = 2) {
	return (Math.abs(a - b) <= fuzz);
};

DynaNodeWidget.prototype.rectNotEQ = function(a,b) {
	return (!this.eqIsh(a.width, b.width) ||
			!this.eqIsh(a.height, b.height));
};

DynaNodeWidget.prototype.reserveSpace = function(length,i,element,rect) {
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
	if(!old || this.rectNotEQ(old,rect)) {
		this.spaced.set(element,rect);
		$tw.utils.setStyle(element,[
			{containIntrinsicSize: `${rect.width}px ${rect.height}px` }
		]);
	}
	if(i === (length - 1)) {
		this.checkVisibility();
	}
};

DynaNodeWidget.prototype.checkVisibility = function() {
	var self = this;
	//var elements = this.domNode.querySelectorAll(this.dynanodeSelector);
	var elements = this.dynanodeElements;
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
					self.refreshChildren(self.changedTiddlers);
					self.changedTiddlers = {};
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
				if(self.dynanodeHide) {
					if(element.style["content-visibility"] !== "hidden") {
						$tw.utils.setStyle(element,[
							{ contentVisibility: "hidden" }
						]);
					}
				} else {
					if(element.style["content-visibility"] !== "auto") {
						$tw.utils.setStyle(element,[
							{ contentVisibility: "auto" }
						]);
					}					
				}
			}
		}
		if(i === (elements.length - 1)) {
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
	this.dynanodeRemoveSelector = this.getAttribute("removeselector",".tc-dynanode-remove-tiddler-frame");
	this.dynanodeHide = this.getAttribute("hide","no") === "yes";
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
	$tw.utils.extend(this.changedTiddlers,changedTiddlers);
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
	if(changedAttributes.hide) {
		this.dynanodeHide = this.getAttribute("hide","no") === "yes";
		if(this.dynanodeEnable) {
			this.checkVisibility();
		}
	}
	return this.refreshChildren(changedTiddlers);
};

exports.dynanode = DynaNodeWidget;

})();

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
	this.changedTiddlersWhileAnimating = {};
	this.changedTiddlersNotAnimating = {};
	this.dynanodeElements = [];
	this.spaced = new WeakMap();
	this.spacedTimestamps = new WeakMap();
	this.stateMap = new WeakMap();

	this.checkObject = function(object,array) {
		var copyObject = object;
		for(var i=0; i<Object.keys(object).length; i++) {
			var obj = Object.keys(object)[i];
			for(var j=0; j<array.length; j++) {
				var arr = array[j];
				if(obj === arr) {
					delete copyObject[arr];
				}
			}
		}
		if(Object.keys(copyObject).length !== 0) {
			return false;
		} else {
			return true;
		}
	};

	this.doneWorker = function() {
		if((Object.keys(self.changedTiddlersWhileAnimating).length !== 0) && $tw.utils.isArray(self.dynanodeAnimationList) && !self.checkObject(self.changedTiddlersWhileAnimating,self.dynanodeAnimationList)) {
			self.refreshChildren(self.changedTiddlersWhileAnimating);
			self.changedTiddlersWhileAnimating = {};
		}
		self.isWaitingForAnimationFrame = 0;
	};

	this.worker = function() {
		for(var i=0; i<self.dynanodeElements.length; i++) {
			self.checkVisibility(self.dynanodeElements[i]);
		}
		self.isWaitingForAnimationFrame = 0;
	};

	this.onScroll = function(event) {
		self.isWaitingForAnimationFrame = 1;
		self.domNode.ownerDocument.defaultView.requestAnimationFrame(self.worker);
	};

	this.dynanodeWorker = function(entries) {
		var length = entries.length;
		for(var i=0; i<length; i++) {
			var entry = entries[i];
			if(entry.target) {
				if(self.dynanodeElements.indexOf(entry.target) === -1) {
					self.dynanodeElements.push(entry.target);
				}
			} else if(self.dynanodeElements.indexOf(entry) === -1) {
				self.dynanodeElements.push(entry);
			}
			var target = entry.target ? entry.target : entry;
			self.checkVisibility(target);
		}
	};

	this.resizeObserver = new ResizeObserver(function(entries) {
		self.isWaitingForAnimationFrame = 1;
		self.domNode.ownerDocument.defaultView.clearTimeout(self.animationFrameTimeout);
		self.dynanodeWorker(entries);
		self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
			self.animationFrameTimeout = self.domNode.ownerDocument.defaultView.setTimeout(self.doneWorker,1);
		});
	});

	this.mutationObserver = new MutationObserver(function(mutations) {
		var addedNodes = [],
			removedNodes = [];
		for(var i=0; i<mutations.length; i++) {
			var mutation = mutations[i];
			if(mutation.type === "childList") {
				for(var j=0; j<mutation.removedNodes.length; j++) {
					var removedNode = mutation.removedNodes[j];
					for(var k=0; k<self.dynanodeSelectors.length; k++) {
						if((removedNode.matches || removedNode.msMatchesSelector) && $tw.utils.domMatchesSelector(removedNode,self.dynanodeRemoveSelectors[k])) {
							removedNodes.push(removedNode);
							if(j === (mutation.removedNodes.length - 1)) {
								for(var l=0; l<removedNodes.length; l++) {
									for(var m=0; m<self.dynanodeElements.length; m++) {
										var dynanodeElement = self.dynanodeElements[m];
										if((removedNodes[l] === dynanodeElement) || (removedNodes[l].contains(dynanodeElement))) {
											self.resizeObserver.unobserve(dynanodeElement);
											self.dynanodeElements.splice(m,1);
											self.spaced.delete(dynanodeElement);
											self.spacedTimestamps.delete(dynanodeElement);
											self.stateMap.delete(dynanodeElement);
										}
									}
									if(l === (removedNodes.length - 1)) {
										self.isWaitingForAnimationFrame = 1;
										self.domNode.ownerDocument.defaultView.requestAnimationFrame(self.worker);
									}
								}
							}
						}
					}
				}
				for(j=0; j<mutation.addedNodes.length; j++) {
					var addedNode = mutation.addedNodes[j];
					for(var k=0; k<self.dynanodeSelectors.length; k++) {
						if((addedNode.matches || addedNode.msMatchesSelector) && $tw.utils.domMatchesSelector(addedNode,self.dynanodeSelectors[k])) {
							addedNodes.push(addedNode);
							if(j === (mutation.addedNodes.length - 1)) {
								for(var l=0; l<addedNodes.length; l++) {
									if(self.dynanodeElements.indexOf(addedNodes[l]) === -1) {
										self.dynanodeElements.push(addedNodes[l]);
									}
									self.resizeObserver.observe(addedNodes[l]);
									if(l === (addedNodes.length - 1)) {
										self.isWaitingForAnimationFrame = 1;
										self.domNode.ownerDocument.defaultView.requestAnimationFrame(self.worker);
									}
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
		this.mutationObserver.observe(domNode,{childList: true, subtree: true});
	}

	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);

	if(this.dynanodeEnable) {
		this.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
			self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
				for(var i=0; i<self.dynanodeSelectors.length; i++) {
					var elements = self.domNode.querySelectorAll(self.dynanodeSelectors[i]);
					self.dynanodeWorker(elements);
				}
			});
		});
	}
};

DynaNodeWidget.prototype.eqIsh = function(a,b,fuzz = 0) {
	return (Math.abs(a - b) <= fuzz);
};

DynaNodeWidget.prototype.rectNotEQ = function(a,b) {
	return (!this.eqIsh(a.width, b.width) ||
			!this.eqIsh(a.height, b.height));
};

DynaNodeWidget.prototype.checkVisibility = function(element) {
	var domNodeWidth = this.domNode.offsetWidth,
		domNodeHeight = this.domNode.offsetHeight,
		domNodeBounds = this.domNode.getBoundingClientRect();

	var domNodeRect = {
		left: domNodeBounds.left,
		right: domNodeBounds.left + domNodeWidth,
		top: domNodeBounds.top,
		bottom: domNodeBounds.top + domNodeHeight
	};

	// Calculate whether the element is visible
	var currValue = this.stateMap.get(element),
		newValue = currValue;
	var elementRect = element.getBoundingClientRect();
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
		this.stateMap.set(element,newValue);
		if(newValue === STATE_IN_VIEW) {
			$tw.utils.addClass(element,"tc-dynanode-visible");
			$tw.utils.removeClass(element,"tc-dynanode-near");
			$tw.utils.removeClass(element,"tc-dynanode-hidden");
			$tw.utils.setStyle(element,[
				{ contain: null }
			]);
		}
		if(newValue === STATE_NEAR_VIEW) {
			$tw.utils.addClass(element,"tc-dynanode-near");
			$tw.utils.removeClass(element,"tc-dynanode-visible");
			$tw.utils.removeClass(element,"tc-dynanode-hidden");
			if(element.style["contain"] !== "content") {
				$tw.utils.setStyle(element,[
					{ contain: "content" }
				]);
			}
		}
		if(newValue === STATE_OUT_OF_VIEW) {
			$tw.utils.addClass(element,"tc-dynanode-hidden");
			$tw.utils.removeClass(element,"tc-dynanode-visible");
			$tw.utils.removeClass(element,"tc-dynanode-near");
			if(element.style["contain"] !== "content") {
				$tw.utils.setStyle(element,[
					{ contain: "content" }
				]);
			}
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
			{ contain: null }
		]);
		if(i === (this.dynanodeElements.length - 1)) {
			this.dynanodeElements = [];
			this.spaced = new WeakMap();
			this.spacedTimestamps = new WeakMap();
			this.stateMap = new WeakMap();
			this.isWaitingForAnimationFrame = 0;
		}
	}
};

/*
Compute the internal state of the widget
*/
DynaNodeWidget.prototype.execute = function() {
	this.elementTag = this.getAttribute("tag");
	this.dynanodeEnable = this.getAttribute("enable","no") === "yes";
	this.dynanodeSelectors = this.wiki.filterTiddlers(this.getAttribute("selectors",".tc-dynanode-track-tiddler-when-visible"));
	this.dynanodeRemoveSelectors = this.wiki.filterTiddlers(this.getAttribute("removeselectors",".tc-dynanode-track-tiddler-when-visible"));
	this.dynanodeAnimationList = this.wiki.filterTiddlers(this.getAttribute("animationlist",""));
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
	if(this.dynanodeEnable && $tw.utils.isArray(this.dynanodeAnimationList) && this.checkObject(changedTiddlers,this.dynanodeAnimationList)) {
		this.isWaitingForAnimationFrame = 1;
		this.domNode.ownerDocument.defaultView.clearTimeout(this.animationFrameTimeout);
		this.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
			self.animationFrameTimeout = self.domNode.ownerDocument.defaultView.setTimeout(self.doneWorker,1);
		});
	}
	if(this.dynanodeEnable && this.isWaitingForAnimationFrame) {
		this.changedTiddlersWhileAnimating = $tw.utils.extend(self.changedTiddlersWhileAnimating,changedTiddlers);
	} else if(this.dynanodeEnable && !this.isWaitingForAnimationFrame) {
		this.changedTiddlersNotAnimating = $tw.utils.extend(self.changedTiddlersNotAnimating,changedTiddlers);
	}
	var changedAttributes = this.computeAttributes(),
		changedAttributesCount = $tw.utils.count(changedAttributes);
	if(changedAttributesCount === 1 && changedAttributes["class"]) {
		this.assignDomNodeClasses();
	} else if(changedAttributes.tag || changedAttributes.selectors || changedAttributes.removeselectors) {
		this.refreshSelf();
		return true;
	} else if(changedAttributes.enable) {
		this.dynanodeEnable = this.getAttribute("enable","no") === "yes";
		if(this.dynanodeEnable) {
			this.domNode.addEventListener("scroll",this.onScroll,false);
			this.mutationObserver.observe(this.domNode,{childList: true, subtree: true});
			this.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
				self.domNode.ownerDocument.defaultView.requestAnimationFrame(function() {
					for(var i=0; i<self.dynanodeSelectors.length; i++) {
						var elements = self.domNode.querySelectorAll(self.dynanodeSelectors[i]);
						self.dynanodeWorker(elements);
						for(var j=0; j<elements.length; j++) {
							self.resizeObserver.observe(elements[j]);
						}
					}
				});
			});
		} else {
			this.domNode.removeEventListener("scroll",this.onScroll,false);
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
	if(this.dynanodeEnable && this.isWaitingForAnimationFrame) {
		return false;
	} else if(this.dynanodeEnable && !this.isWaitingForAnimationFrame && (Object.keys(this.changedTiddlersNotAnimating).length !== 0)) {
		if(Object.keys(this.changedTiddlersWhileAnimating).length !== 0) {
			this.changedTiddlersNotAnimating = $tw.utils.extend(self.changedTiddlersWhileAnimating,self.ChangedTiddlersNotAnimating);
			this.changedTiddlersWhileAnimating = {};
		}
		var refreshed = this.refreshChildren(this.changedTiddlersNotAnimating);
		this.changedTiddlersNotAnimating = {};
		return refreshed;
	} else if(this.dynanodeEnable && !this.isWaitingForAnimationFrame && (Object.keys(this.changedTiddlersWhileAnimating).length !== 0)) {
		var refreshed = this.refreshChildren(this.changedTiddlersWhileAnimating);
		this.changedTiddlersWhileAnimating = {};
		return refreshed;
	} else {
		return this.refreshChildren(changedTiddlers);
	} 
};

exports.dynanode = DynaNodeWidget;

})();

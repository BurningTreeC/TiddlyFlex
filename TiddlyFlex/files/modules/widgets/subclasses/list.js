/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/list.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "list";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

/*
Process any changes to the list
*/
exports.prototype.handleListChanges = function(changedTiddlers) {
	// Get the new list
	var prevList = this.list;
	this.list = this.getTiddlerList();
	// Check for an empty list
	if(this.list.length === 0) {
		// Check if it was empty before
		if(prevList.length === 0) {
			// If so, just refresh the empty message
			return this.refreshChildren(changedTiddlers);
		} else {
			// Replace the previous content with the empty message
			for(t=this.children.length-1; t>=0; t--) {
				this.removeListItem(t);
			}
			var nextSibling = this.findNextSiblingDomNode();
			this.makeChildWidgets(this.getEmptyMessage());
			this.renderChildren(this.parentDomNode,nextSibling);
			return true;
		}
	} else {
		// If the list was empty then we need to remove the empty message
		if(prevList.length === 0) {
			this.removeChildDomNodes();
			this.children = [];
		}
		// If we are providing an counter variable then we must refresh the items, otherwise we can rearrange them
		var hasRefreshed = false,t;
		if(this.counterName) {
			var mustRefreshOldLast = false;
			var thisHasRefreshed = false;
			var oldLength = this.children.length;
			// Cycle through the list and remove and re-insert the first item that has changed, and all the remaining items
			for(t=0; t<this.list.length; t++) {
				if(hasRefreshed || !this.children[t] || this.children[t].parseTreeNode.itemTitle !== this.list[t]) {
					if(this.children[t]) {
						this.removeListItem(t);
					}
					this.insertListItem(t,this.list[t]);
					if(!hasRefreshed && t === oldLength) {
						mustRefreshOldLast = true;
					}
					hasRefreshed = true;
					thisHasRefreshed = true;
				} else {
					// Refresh the item we're reusing
					var refreshed = (thisHasRefreshed && hasRefreshed) || this.children[t].refresh(changedTiddlers);
					var hasRefreshed = hasRefreshed || refreshed;
				}
			}
			// If items were inserted then we must recreate the item that used to be at the last position as it is no longer last
			if(mustRefreshOldLast && oldLength > 0) {
				var oldLastIdx = oldLength-1;
				this.removeListItem(oldLastIdx);
				this.insertListItem(oldLastIdx,this.list[oldLastIdx]);
			}
			// If there are items to remove and we have not refreshed then recreate the item that will now be at the last position
			if(!hasRefreshed && this.children.length > this.list.length) {
				this.removeListItem(this.list.length-1);
				this.insertListItem(this.list.length-1,this.list[this.list.length-1]);
			}
		} else {
			// Cycle through the list, inserting and removing list items as needed
			var mustRecreateLastItem = false;
			var thisHasRefreshed = false;
			if(this.join && this.join.length) {
				if(this.children.length !== this.list.length) {
						mustRecreateLastItem = true;
				} else if(prevList[prevList.length-1] !== this.list[this.list.length-1]) {
						mustRecreateLastItem = true;
				}
			}
			var isLast = false, wasLast = false;
			for(t=0; t<this.list.length; t++) {
				isLast = t === this.list.length-1;
				var index = this.findListItem(t,this.list[t]);
				wasLast = index === this.children.length-1;
				if(wasLast && (index !== t || this.children.length !== this.list.length)) {
					mustRecreateLastItem = !!(this.join && this.join.length);
				}
				if(index === undefined) {
					// The list item must be inserted
					if(isLast && mustRecreateLastItem && t>0) {
						// First re-create previosly-last item that will no longer be last
						this.removeListItem(t-1);
						this.insertListItem(t-1,this.list[t-1]);
					}
					this.insertListItem(t,this.list[t]);
					hasRefreshed = true;
					thisHasRefreshed = true;
				} else {
					// There are intervening list items that must be removed
					for(var n=index-1; n>=t; n--) {
						this.removeListItem(n);
						hasRefreshed = true;
						thisHasRefreshed = false;
					}
					// Refresh the item we're reusing, or recreate if necessary
					if(mustRecreateLastItem && (isLast || wasLast)) {
						this.removeListItem(t);
						this.insertListItem(t,this.list[t]);
						hasRefreshed = true;
						thisHasRefreshed = true;
					} else {
						var refreshed = (thisHasRefreshed && hasRefreshed) || this.children[t].refresh(changedTiddlers);
						hasRefreshed = hasRefreshed || refreshed;
					}
				}
			}
		}
		// Remove any left over items
		for(t=this.children.length-1; t>=this.list.length; t--) {
			this.removeListItem(t);
			hasRefreshed = true;
		}
		return hasRefreshed;
	}
};

})();
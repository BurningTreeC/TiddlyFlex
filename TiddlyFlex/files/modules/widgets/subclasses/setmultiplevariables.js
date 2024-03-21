/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/subclasses/setmultiplevariables.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "setmultiplevariables";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.refresh = function(changedTiddlers,force) {
    var filterNames = this.getAttribute("$names",""),
        filterValues = this.getAttribute("$values",""),
        variableNames = this.wiki.filterTiddlers(filterNames,this),
        variableValues = this.wiki.filterTiddlers(filterValues,this);
    if(!$tw.utils.isArrayEqual(this.variableNames,variableNames) || !$tw.utils.isArrayEqual(this.variableValues,variableValues)) {
        this.refreshSelf();
        return true;
    }
    return this.refreshChildren(changedTiddlers,force);
};

})();
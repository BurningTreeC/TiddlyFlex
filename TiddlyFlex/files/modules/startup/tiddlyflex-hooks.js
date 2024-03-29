/*\
title: $:/plugins/BTC/TiddlyFlex/modules/startup/tiddlyflex-hooks.js
type: application/javascript
module-type: startup

Favicon handling

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "tiddlyflex-hooks";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;

exports.startup = function() {
	$tw.hooks.addHook("th-navigating",function(event) { 
		if(!event.navigateTo && event.event && event.event.navigateTo) {
			if(event.navigateFromTitle && !event.event.navigateFromTitle) {
				event.event.navigateFromTitle = event.navigateFromTitle;
			}
			return event.event;
		} else {
			return event;
		}
	});
};

})();
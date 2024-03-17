/*\
title: $:/plugins/BTC/TiddlyFlex/modules/utils/utils.js
type: application/javascript
module-type: utils

Utils, mainly for catching the "Resizeobserver loop completed with undelivered notifications." error on FireFox

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.error = function(err) {
	// Prepare the error message
	var errHeading = ( $tw.language == undefined ? "Internal JavaScript Error" : $tw.language.getString("InternalJavaScriptError/Title") ),
		promptMsg = ( $tw.language == undefined ? "Well, this is embarrassing. It is recommended that you restart TiddlyWiki by refreshing your browser" : $tw.language.getString("InternalJavaScriptError/Hint") );
	// Log the error to the console
	console.error($tw.node ? "\x1b[1;31m" + err + "\x1b[0m" : err);
	if($tw.browser && !$tw.node && (err !== "ResizeObserver loop completed with undelivered notifications.")) {
		// Display an error message to the user
		var dm = $tw.utils.domMaker,
			heading = dm("h1",{text: errHeading}),
			prompt = dm("div",{text: promptMsg, "class": "tc-error-prompt"}),
			message = dm("div",{text: err, "class":"tc-error-message"}),
			closeButton = dm("div",{children: [dm("button",{text: ( $tw.language == undefined ? "close" : $tw.language.getString("Buttons/Close/Caption") )})], "class": "tc-error-prompt"}),
			downloadButton = dm("div",{children: [dm("button",{text: ( $tw.language == undefined ? "download tiddlers" : $tw.language.getString("Buttons/EmergencyDownload/Caption") )})], "class": "tc-error-prompt"}),
			form = dm("form",{children: [heading,prompt,downloadButton,message,closeButton], "class": "tc-error-form"});
		document.body.insertBefore(form,document.body.firstChild);
		downloadButton.addEventListener("click",function(event) {
			if($tw && $tw.wiki) {
				var tiddlers = [];
				$tw.wiki.each(function(tiddler,title) {
					tiddlers.push(tiddler.fields);
				});
				var link = dm("a"),
					text = JSON.stringify(tiddlers);
				if(Blob !== undefined) {
					var blob = new Blob([text], {type: "text/html"});
					link.setAttribute("href", URL.createObjectURL(blob));
				} else {
					link.setAttribute("href","data:text/html," + encodeURIComponent(text));
				}
				link.setAttribute("download","emergency-tiddlers-" + (new Date()) + ".json");
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				alert("Emergency tiddler download is not available");
			}
			event.preventDefault();
			return false;
		},true);
		form.addEventListener("submit",function(event) {
			document.body.removeChild(form);
			event.preventDefault();
			return false;
		},true);
		return null;
	} else if(!$tw.browser) {
		// Exit if we're under node.js
		process.exit(1);
	}
};

})();
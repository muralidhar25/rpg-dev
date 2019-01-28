import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";
import 'rxjs/add/operator/finally';

import { BsModalService, BsModalRef } from 'ngx-bootstrap';

// cookie names for data we store
// YOUR API KEY DOES NOT GO IN THIS CODE; don't paste it in.
const API_KEY_COOKIE = "49e31e6efd1e47b1ab65035a3e22f613";
const CLIENT_ID_COOKIE = "bing-search-client-id";

@Component({
    selector: 'bing-search-form',
    templateUrl: './bing-search.component.html',
    styleUrls: ['./bing-search.component.css']
})
export class BingSearchComponent implements OnInit {
    

    constructor(
        private bsModalRef: BsModalRef,
        private modalService: BsModalService
    ){

    }

    ngOnInit(){
        

        this.invalidateSubscriptionKey();
        
    }

    invalidateSubscriptionKey() {
		this.storeValue(API_KEY_COOKIE, "");
	}

    storeValue(name, value){
        localStorage.setItem(name, value);
    }

    retrieveValue(name){
        return localStorage.getItem(name) || "";
    }

    SelectImage(){
        
    }
    
    cancel(){
        this.bsModalRef.hide();
    }
}

	// Various browsers differ in their support for persistent storage by local
	// HTML files (IE won't use localStorage, but Chrome won't use cookies). So
	// use localStorage if we can, otherwise use cookies.

	try {
		localStorage.getItem;   // try localStorage

		// window.retrieveValue = function (name) {
			// return localStorage.getItem(name) || "";
		// }
		// window.storeValue = function (name, value) {
		// 	localStorage.setItem(name, value);
		// }
	} catch (e) {
		// window.retrieveValue = function (name) {
		// 	var cookies = document.cookie.split(";");
		// 	for (var i = 0; i < cookies.length; i++) {
		// 		var keyvalue = cookies[i].split("=");
		// 		if (keyvalue[0].trim() === name) return keyvalue[1];
		// 	}
		// 	return "";
		// }
		// window.storeValue = function (name, value) {
		// 	var expiry = new Date();
		// 	expiry.setFullYear(expiry.getFullYear() + 1);
		// 	document.cookie = name + "=" + value.trim() + "; expires=" + expiry.toUTCString();
		// }
	}

	// get stored API subscription key, or prompt if it's not found
	function getSubscriptionKey() {
		// var key = retrieveValue(API_KEY_COOKIE);
		// while (key.length !== 32) {
		// 	key = prompt("Enter Bing Search API subscription key:", "").trim();
		// }
		// always set the cookie in order to update the expiration date
		// storeValue(API_KEY_COOKIE, key);
		// return key;
	}

	// invalidate stored API subscription key so user will be prompted again
	function invalidateSubscriptionKey() {
		// storeValue(API_KEY_COOKIE, "");
	}

	// escape quotes to HTML entities for use in HTML tag attributes
	function escapeQuotes(text) {
		return text.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
	}

	// get the host portion of a URL, strpping out search result formatting and www too
	function getHost(url) {
		return url.replace(/<\/?b>/g, "").replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
	}

	// format plain text for display as an HTML <pre> element
	function preFormat(text) {
		text = "" + text;
		return "<pre>" + text.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</pre>"
	}

	// put HTML markup into a <div> and reveal it
	function showDiv(id, html) {
		var content = document.getElementById("_" + id)
		if (content) content.innerHTML = html;
		var wrapper = document.getElementById(id);
		if (wrapper) wrapper.style.display = html.trim() ? "block" : "none";
	}

	// hides the specified <div>s
	function hideDivs() {
		for (var i = 0; i < arguments.length; i++) {
			var element = document.getElementById(arguments[i])
			if (element) element.style.display = "none";
		}
	}

	// render functions for various types of search results
	// searchItemRenderers = {
		// render Web page result
		// webPages: function (item) {
			var html = [];
			//html.push("<p class='webPages'><a href='" + item.url + "'>" + item.name + "</a>");
			//html.push(" (" + getHost(item.displayUrl) + ")");
			//html.push("<br>" + item.snippet);
			//if ("deepLinks" in item) {
			//    var links = [];
			//    for (var i = 0; i < item.deepLinks.length; i++) {
			//        links.push("<a href='" + item.deepLinks[i].url + "'>" +
			//            item.deepLinks[i].name + "</a>");
			//    }
			//    html.push("<br>" + links.join(" - "));
			//}
			// return html.join("");
		// },
		// render news story
		// news: function (item) {
			// var html = [];
			//html.push("<p class='news'>");
			//if (item.image) {
			//    width = 60;
			//    height = Math.round(width * item.image.thumbnail.height / item.image.thumbnail.width);
			//    html.push("<img src='" +  item.image.thumbnail.contentUrl +
			//        "&h=" + height + "&w=" + width + "' width=" + width + " height=" + height+  ">");
			//}
			//html.push("<a href='" + item.url + "'>" + item.name + "</a>");
			//if (item.category) html.push(" - " + item.category);
			//if (item.contractualRules) {    // MUST display source attributions
			//    html.push(" (");
			//    var rules = [];
			//    for (var i = 0; i < item.contractualRules.length; i++)
			//        rules.push(item.contractualRules[i].text);
			//    html.push(rules.join(", "));
			//    html.push(")");
			//}
			// html.push(" (" + getHost(item.url) + ")");
			//html.push("<br>" + item.description);
		// 	return html.join("");
		// },
		// render image result using thumbnail
		// images: function (item, section, index, count) {
		// 	var height = 100;
		// 	var width = 100; //Math.round(height * item.thumbnail.width / item.thumbnail.height);
		// 	var html = [];
		// 	if (section === "sidebar") {
		// 		if (index) html.push("<br>");
		// 	} else {
		// 		if (!index) html.push("<p class='images'>");
		// 	}
		// 	//html.push("<a href='" + item.hostPageUrl + "'>");
		// 	var title = escapeQuotes(item.name) + "\n" + getHost(item.hostPageDisplayUrl);
		// 	html.push("<img src='" + item.thumbnailUrl + "&h=320&w=320" +
		// 		"' height=" + height + " width=" + width + " title='" + title + "' alt='" + title + "'>");
		// 	//html.push("</a>");
		// 	return html.join("");
		// },

		// relatedSearches: function (item, section, index, count) {
		// 	var html = [];
		// 	//if (section !== "sidebar") html.push(index === 0 ? "<h2>Related</h2>": " - ");
		// 	//else html.push("<p class='relatedSearches'>");
		// 	//html.push("<a href='#' onclick='return doRelatedSearch(&quot;" +
		// 	//    escapeQuotes(item.text) + "&quot;)'>");
		// 	//html.push(item.displayText + "</a>");
		// 	return html.join("");
		// }
	// }

	// render search results from rankingResponse object in specified order
	function renderResultsItems(section, results) {

		var items = results.rankingResponse[section].items;
		var html = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			// collection name has lowercase first letter while answerType has uppercase
			// e.g. `WebPages` rankingResult type is in the `webPages` top-level collection
			var type = item.answerType[0].toLowerCase() + item.answerType.slice(1);
			// must have results of the given type AND a renderer for it
			// if (type in results && type in searchItemRenderers) {
			// 	var render = searchItemRenderers[type];
			// 	// this ranking item refers to ONE result of the specified type
			// 	if ("resultIndex" in item) {
			// 		html.push(render(results[type].value[item.resultIndex], section));
			// 		// this ranking item refers to ALL results of the specified type
			// 	} else {
			// 		var len = results[type].value.length;
			// 		for (var j = 0; j < len; j++) {
			// 			html.push(render(results[type].value[j], section, j, len));
			// 		}
			// 	}
			// }
		}
		return html.join("\n\n");
	}

	// render the search results given the parsed JSON response
	function renderSearchResults(results) {

		// if spelling was corrected, update search field
		if (results.queryContext.alteredQuery)
			// document.forms.bing.query.value = results.queryContext.alteredQuery;

		// add Prev / Next links with result count
		var pagingLinks = renderPagingLinks(results);
		showDiv("paging1", pagingLinks);
		showDiv("paging2", pagingLinks);

		// for each possible section, render the resuts from that section
		// for (section in { pole: 0, mainline: 0, sidebar: 0 }) {
		// 	if (results.rankingResponse[section])
		// 		showDiv(section, renderResultsItems(section, results));
		// }
	}

	function renderErrorMessage(message) {
		showDiv("error", preFormat(message));
		showDiv("noresults", "No results.");
	}

	// handle Bing search request results
	function handleOnLoad() {
		// hideDivs("noresults");

		var json = this.responseText.trim();
		var jsobj = {};

		// try to parse JSON results
		try {
			if (json.length) jsobj = JSON.parse(json);
		} catch (e) {
			renderErrorMessage("Invalid JSON response");
		}

		// show raw JSON and headers
		showDiv("json", preFormat(JSON.stringify(jsobj, null, 2)));
		showDiv("http", preFormat("GET " + this.responseURL + "\n\nStatus: " + this.status + " " +
			this.statusText + "\n" + this.getAllResponseHeaders()));

		// if HTTP response is 200 OK, try to render search results
		if (this.status === 200) {
			var clientid = this.getResponseHeader("X-MSEdge-ClientID");
			// if (clientid) retrieveValue(CLIENT_ID_COOKIE, clientid);
			// if (json.length) {
			// 	if (jsobj._type === "SearchResponse" && "rankingResponse" in jsobj) {
			// 		renderSearchResults(jsobj);
			// 	} else {
			// 		renderErrorMessage("No search results in JSON response");
			// 	}
			// } else {
			// 	renderErrorMessage("Empty response (are you sending too many requests too quickly?)");
			// }
		}

		// Any other HTTP response is an error
		else {
			// 401 is unauthorized; force re-prompt for API key for next request
			if (this.status === 401) invalidateSubscriptionKey();

			// some error responses don't have a top-level errors object, so gin one up
			// var errors = jsobj.errors || [jsobj];
			var errmsg = [];

			// display HTTP status code
			errmsg.push("HTTP Status " + this.status + " " + this.statusText + "\n");

			// add all fields from all error responses
			// for (var i = 0; i < errors.length; i++) {
			// 	if (i) errmsg.push("\n");
			// 	for (var k in errors[i]) errmsg.push(k + ": " + errors[i][k]);
			// }

			// also display Bing Trace ID if it isn't blocked by CORS
			var traceid = this.getResponseHeader("BingAPIs-TraceId");
			if (traceid) errmsg.push("\nTrace ID " + traceid);

			// and display the error message
			renderErrorMessage(errmsg.join("\n"));
		}
	}

	function bingWebSearch(query, options, key) {

		// scroll to top of window
		window.scrollTo(0, 0);
		if (!query.trim().length) return false;     // empty query, do nothing

		showDiv("noresults", "Working. Please wait.");
		// hideDivs("pole", "mainline", "sidebar", "_json", "_headers", "paging1", "paging2", "error");

		var endpoint = "https://api.cognitive.microsoft.com/bing/v7.0/search";
		var request = new XMLHttpRequest();
		var queryurl = endpoint + "?q=" + encodeURIComponent(query) + "&" + options;

		//
		try {
			request.open("GET", queryurl);
		}
		catch (e) {
			renderErrorMessage("Bad request (invalid URL)\n" + queryurl);
			return false;
		}

		// add request headers
		request.setRequestHeader("Ocp-Apim-Subscription-Key", key);
		request.setRequestHeader("Accept", "application/json");
		// var clientid = retrieveValue(CLIENT_ID_COOKIE);
		// if (clientid) request.setRequestHeader("X-MSEdge-ClientID", clientid);

		// event handler for successful response
		request.addEventListener("load", handleOnLoad);

		// event handler for erorrs
		request.addEventListener("error", function () {
			renderErrorMessage("Error completing request");
		});

		// event handler for aborted request
		request.addEventListener("abort", function () {
			renderErrorMessage("Request aborted");
		});

		// send the request
		request.send();
		return false;
	}

	// build query options from the HTML form
	function bingSearchOptions(form) {

		var options = [];
		options.push("mkt=" + form.where.value);
		options.push("SafeSearch=" + (form.safe.checked ? "strict" : "off"));
		if (form.when.value.length) options.push("freshness=" + form.when.value);
		var what = [];
		for (var i = 0; i < form.what.length; i++)
			if (form.what[i].checked) what.push(form.what[i].value);
		if (what.length) {
			options.push("promote=" + what.join(","));
			options.push("answerCount=9");
		}
		options.push("count=" + form.count.value);
		options.push("offset=" + form.offset.value);
		options.push("textDecorations=true");
		options.push("textFormat=HTML");
		return options.join("&");
	}

	// toggle display of a div (used by JSON/HTTP expandos)
	function toggleDisplay(id) {

		var element = document.getElementById(id);
		if (element) {
			var display = element.style.display;
			if (display === "none") {
				element.style.display = "block";
				window.scrollBy(0, 200);
			} else {
				element.style.display = "none";
			}
		}
		return false;
	}

	// perform a related search (used by related search links)
	function doRelatedSearch(query) {

		// var bing = document.forms.bing;
		// bing.query.value = query;
		// bing.offset.value = 0;
		// return bingWebSearch(query, bingSearchOptions(bing), getSubscriptionKey());
	}

	// generate the HTML for paging links (prev/next)
	function renderPagingLinks(results) {

		// var html = [];
		// var bing = document.forms.bing;
		// var offset = parseInt(bing.offset.value, 10);
		// var count = parseInt(bing.count.value, 10);
		// html.push("<p class='paging'><i>Results " + (offset + 1) + " to " + (offset + count));
		// html.push(" of about " + results.webPages.totalEstimatedMatches + ".</i> ");
		// html.push("<a href='#' onclick='return doPrevSearchPage()'>Prev</a> | ");
		// html.push("<a href='#' onclick='return doNextSearchPage()'>Next</a>");
		// return html.join("");
	}

	// go to the next page (used by next page link)
	function doNextSearchPage() {

		// var bing = document.forms.bing;
		// var query = bing.query.value;
		// var offset = parseInt(bing.offset.value, 10);
		// var count = parseInt(bing.count.value, 10);
		// offset += count;
		// bing.offset.value = offset;
		// return bingWebSearch(query, bingSearchOptions(bing), getSubscriptionKey());
	}

	// go to the previous page (used by previous page link)
	function doPrevSearchPage() {

		// var bing = document.forms.bing;
		// var query = bing.query.value;
		// var offset = parseInt(bing.offset.value, 10);
		// var count = parseInt(bing.count.value, 10);
		// if (offset) {
		// 	offset -= count;
		// 	if (offset < 0) offset = 0;
		// 	bing.offset.value = offset;
		// 	return bingWebSearch(query, bingSearchOptions(bing), getSubscriptionKey());
		// }
		// alert("You're already at the beginning!");
		// return false;
	}

/*global alert, document, self, window*/

/*
 * $RCSfile: XmlHttp.js,v $
 *
 * Gallery - a web based photo album viewer and editor
 * Copyright (C) 2000-2005 Bharat Mediratta
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */
 
 
//end on load functions
function fixNav()
{
	if ($('navigationBar'))
	{
		var firstLink = $('navigationBar').getElement('ul[class=horizontal_lists]').getElement('li').getElement('a');
		//alert(firstLink);
		firstLink.set('title','Information about studying at Coventry University');
		//http://alumni.coventry.ac.uk/NetCommunity/Page.aspx?pid=191
		var alumniLink = $('navigationBar').getElement('ul[class=horizontal_lists]').getElements('li')[5].getElement('a');
		alumniLink.set('href','http://alumni.coventry.ac.uk/NetCommunity/Page.aspx?pid=191');
	}
	
	if ($('qlUrl'))
	{
		//http://wwwp.coventry.ac.uk/university-sites-and-information/a/1989
		$('qlUrl').getChildren('option').each(function(item){
			if(item.get("value") == 'http://www.coventry.ac.uk/undergraduate-study/open-days')
			{
				item.set("value",'http://wwwp.coventry.ac.uk/university-sites-and-information/a/1989');
			}
		});
	}
}

function GetXmlHttp() {
    var xmlHttp = null;
    try {
		xmlHttp = new XMLHttpRequest();
    } catch (e) {
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
	    	try {
		    	xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	    	} catch (e) {
				xmlHttp = false;
	    	}
		}
    }

    if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
		xmlHttp = new XMLHttpRequest();
    }

    return xmlHttp;
}

function SendHttpPost(xmlHttp, url, args, callback) {
    xmlHttp.open("POST", url, /* async */ true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function() { callback(xmlHttp); }
    xmlHttp.send(args);
}

function SendHttpGet(xmlHttp, url, callback) {
	try {
		xmlHttp.open("GET", url, /* async */ true);
    } catch (e) {
    }
    xmlHttp.onreadystatechange = function() { callback(xmlHttp); }
    xmlHttp.send("FOO");
}
/*** end xmlHTTP.js**/
/*
 * $RCSfile: AutoComplete.js,v $
 *
 * Gallery - a web based photo album viewer and editor
 * Copyright (C) 2000-2005 Bharat Mediratta
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

/*
 * Inspired by code from:
 * - Guyon Roche (http://www.webreference.com/programming/javascript/gr/column5/)
 * - Zichun (http://codeproject.com/jscript/jsactb.asp)
 */

var autoCompleteContexts = new Array();
var immediateSubmit = true;
var g_PopupIFrame;

function isIE()
{
	return ( navigator.appName=="Microsoft Internet Explorer" );
}

function hidePopupDiv(divPopup)
{
	divPopup.style.visibility = "hidden";

    if (isIE() && g_PopupIFrame != null)
    {
	    document.body.removeChild(g_PopupIFrame);
        g_PopupIFrame = null;
    }
}

function showPopupDiv(divPopup)
{
    if (!isIE())
    {
    	//Just display the div
        divPopup.style.visibility = "visible";
        return;
    }

    //Increase default zIndex of div by 1, so that DIV appears before IFrame
    divPopup.style.zIndex = divPopup.style.zIndex+1;

    var iFrame = document.createElement("IFRAME");
    iFrame.setAttribute("src", "");

    //Match IFrame position with divPopup
    iFrame.style.position = "absolute";
    iFrame.style.left = divPopup.offsetLeft + 'px';
    iFrame.style.top = divPopup.offsetTop + 'px';
    iFrame.style.width = divPopup.offsetWidth + 'px';
    iFrame.style.height = divPopup.offsetHeight + 'px';

    document.body.appendChild(iFrame);

    //Store iFrame in global variable, so it can get removed when divPopup is hidden 
    if (g_PopupIFrame != null)
	{
		document.body.removeChild(g_PopupIFrame);
    }
    g_PopupIFrame = iFrame;
    divPopup.style.visibility = "visible";
}

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

function autoCompleteTrigger(id) 
{
    var responseCallback = function(response) {
		if (response.readyState != 4) {
		    return;
		}
	
		if (response.responseText.trim().length > 0) {
			results = response.responseText.split("\n");
			autoCompleteContexts[id]['results'] = new Array();
			for (i = 0; i < results.length; i++) {
			    autoCompleteContexts[id]['results'][i] = results[i];
			}
			autoCompleteRender(id);
		}
		else
		{
		    autoCompleteContexts[id]['results'] = new Array();
		    autoCompleteHide(id);
	    }
    }

    if (document.getElementById(id).value.trim().length > 0) {
    	var url = autoCompleteContexts[id]['url'].replace(
    	    /__VALUE__/,
    	    escape(document.getElementById(id).value));
    	// encodeURI(document.getElementById(id).value));
    	SendHttpGet(autoCompleteContexts[id]['connection'], url, responseCallback);
    	//autoCompleteContexts[id]['results'] = new Array();
		//for (i = 0; i < 10; i++) {
		//  autoCompleteContexts[id]['results'][i] = "Accountancy BA Honours Degree "+i;
		//}
		autoCompleteRender(id);

    }
    else
    {
    	autoCompleteContexts[id]['results'] = new Array();
    	autoCompleteHide(id);
    }
}

function autoCompleteGetLeft(element)
{
    var offset = 0;
    while (element) {
		offset += element.offsetLeft;
		element = element.offsetParent;
    }
    return offset;
}

function autoCompleteGetTop(element)
{
    var offset = 0;
    while (element) {
		offset += element.offsetTop;
		element = element.offsetParent;
    }
    return offset;
}

function autoCompleteIsVisible(id)
{
    var autoCompleteId = id + '_autocomplete';
    var ac = document.getElementById(autoCompleteId);
    if (!ac) {
		return false;
    }
    return ac.style.visibility == 'visible';
}

function autoCompleteRender(id)
{
    var autoCompleteId = id + '_autocomplete';
    var source = document.getElementById(id);
    var ac = document.getElementById(autoCompleteId);
    if (!ac) {
		ac = document.createElement('div');
		ac.className = 'autoCompleteBackground';
		ac.style.position = 'absolute';
    	ac.style.zIndex = 2000;
		ac.id = autoCompleteId;
		document.body.appendChild(ac);
    }
    ac.style.top = eval(autoCompleteGetTop(source) + source.offsetHeight) + 'px';
    ac.style.left = autoCompleteGetLeft(source) + 'px';

    var matches = autoCompleteFindMatches(source.value, autoCompleteContexts[id]['results']);

    // Windows gives us backslashes in the path which break the regex, so escape them.
    escapedValue = source.value.replace(/\\([^u])/g, '\\\\$1');
    var regexp = new RegExp("("+escapedValue+")", "i");
    if (matches.length > 0) {
		for (i = 0; i < Math.min(matches.length, 15); i++) {
		    var row;
		    var newHTML = 
			matches[i].replace(regexp, '<span class="autoCompleteHighlight">$1</span>');
		    if (i >= ac.childNodes.length) {
				row = document.createElement('div');
				ac.appendChild(row);
		    } else {
				row = ac.childNodes[i];
				if (row.innerHTML == newHTML) {
				    // Already up to date
				    continue;
				}
		    }
		    row.className = 'autoCompleteNotSelected';
		    row.innerHTML = newHTML;
		    row.ac_data = matches[i];
		    row.ac_index = i;
		    row.onmousedown = function() { 
	            source.value = this.ac_data; 
	            if (immediateSubmit) {
	            	submitSearchCourses(source.value); 
	            }
	        };
		    row.onmouseover = function() { autoCompleteSelect(id, this); };
		    row.onmouseout = function() { autoCompleteDeselect(id); };
		}
		while (i < ac.childNodes.length) {
		    ac.removeChild(ac.childNodes[i]);
		}

		showPopupDiv(ac);
		autoCompleteContexts[id]['current'] = -1;
    } else {
		hidePopupDiv(ac);
    }
}

function autoCompleteMove(id, delta)
{
    var autoCompleteId = id + '_autocomplete';
    var ac = document.getElementById(autoCompleteId);
    if (!ac || ac.childNodes.length == 0) {
		return;
    }
    var source = document.getElementById(id);
    var current = autoCompleteContexts[id]['current'] + delta;
    if (current < 0) {
		current += ac.childNodes.length;
    }
    current = current % ac.childNodes.length;
    autoCompleteSelect(id, ac.childNodes[current]);
}

function autoCompleteSelect(id, row)
{
    autoCompleteDeselect(id);
    row.className = 'autoCompleteSelected';
    autoCompleteContexts[id]['current'] = row.ac_index;
}

function autoCompleteDeselect(id)
{
    var current = autoCompleteContexts[id]['current'];
    if (current != -1) {
		var autoCompleteId = id + '_autocomplete';
		var ac = document.getElementById(autoCompleteId);
		ac.childNodes[current].className = 'autoCompleteNotSelected';
		autoCompleteContexts[id]['current'] = -1;
    }
}

function autoCompleteChoose(id)
{
    var current = autoCompleteContexts[id]['current'];
    if (current != -1) {
		var autoCompleteId = id + '_autocomplete';
		var ac = document.getElementById(autoCompleteId);
		var source = document.getElementById(id);
		source.value = ac.childNodes[current].ac_data;
		autoCompleteHide(id);
    }
}

function autoCompleteFindMatches(needle, haystack)
{
    // Windows gives us backslashes in the path which break the regex, so escape them.
    safeNeedle = needle.replace(/\\([^u])/g, '\\\\$1');

    matches = new Array();
    var regexp = new RegExp(safeNeedle, "i");
    /*
    for (hay in haystack) {
        if (regexp.test(haystack[hay])) {
            matches.push(haystack[hay]);
        }
    }
    */
    var i;
    for (i=0; i < haystack.length; i++) {
//        if (regexp.test(haystack[i])) {
    	matches.push(haystack[i]);
//        }
    }
    return matches;//.sort();
}

function autoCompleteHide(id) {
    if (autoCompleteContexts[id]['timerId']) {
		clearTimeout(autoCompleteContexts[id]['timerId']); 
    }

    autoCompleteId = id + '_autocomplete';
    var ac = document.getElementById(autoCompleteId);
    if (ac) {
		hidePopupDiv(ac);
    }
}

function autoCompleteAttach(id, url) {
    autoCompleteContexts[id] = new Array();
    autoCompleteContexts[id]['connection'] = GetXmlHttp();
    autoCompleteContexts[id]['results'] = new Array();
    autoCompleteContexts[id]['url'] = url;

    var source = document.getElementById(id);
    source.setAttribute("autocomplete", "off");
    if (document.all) {
		// IE doesn't let you set attributes by passing in a lambda function like
		// Mozilla does.  Instead, we have to create a string and pass it to the
		// Function() constructor.  We expand the 'id' and 'url' elements in the
		// string, but allow the event object to pass through from the calling
		// scope.  Ugh.
		source.onblur = new Function('autoCompleteHide("' + id + '");');
		source.onkeydown = new Function('return autoCompleteHandleEvent("' + id + 
						'", event, "' + url + '"); ');
    } else {
		// Everything else
		source.onblur = function() { autoCompleteHide(id); }
		source.onkeydown = function(event) { return autoCompleteHandleEvent(id, event, url);}
    }
}

function autoCompleteHandleEvent(id, event, url) {
    switch(event.keyCode) {
	    case 38: // up key
			autoCompleteMove(id, -1);
			break;

	    case 40: // down key
			autoCompleteMove(id, 1);
			break;
	
	    case 9: // tab
			if (autoCompleteIsVisible(id)) {
			    autoCompleteChoose(id);
			    return true;
			}
			break;
		
	    case 13: // enter
	        var source = document.getElementById(id);
			if (autoCompleteIsVisible(id)) {
			    autoCompleteChoose(id);		        
		        if (immediateSubmit) {
		            submitSearchCourses(source.value);
		        }
			    return false;
			}
			else
			{
			    submitSearchCourses(source.value);
			}
			break;
	
	    case 27: // escape
			autoCompleteHide(id);
			break;
	
	    default:
			if (autoCompleteContexts[id]['timerId']) {
			    clearTimeout(autoCompleteContexts[id]['timerId']); 
			}
		autoCompleteContexts[id]['timerId'] = setTimeout("autoCompleteTrigger(\"" + id + "\")", 250);
		autoCompleteRender(id);
    }
    return true;
} 
/** end AutoComplete.js **/

function hola()
{
	alert("hola");
}

/*
    * if we have an external link open this in a new window
    */
    function quicklinkAction(url){
	    if(url!='selected'){
	        if(url.indexOf("http",0) === 0 && url.indexOf('coventry.ac.uk') < 0){
		        var w=window.open(url);
		        w.focus();
	        }else{
    		    self.location=url;
    	    }
	    }
    }
    
    function searchAttach(id)
    { 
    	var source = document.getElementById(id);
	    if (document.all) {
			// IE doesn't let you set attributes by passing in a lambda function like
			// Mozilla does.  Instead, we have to create a string and pass it to the
			// Function() constructor.  We expand the 'id' and 'url' elements in the
			// string, but allow the event object to pass through from the calling
			// scope.  Ugh.
			source.onkeydown = new Function('return searchHandleEvent("' + id + 
							'", event); ');
	    } else {
			// Everything else
			source.onkeydown = function(event) { return searchHandleEvent(id, event);}
	    }

    }
    
    function searchHandleEvent(id, event) {
    

	    if (event.keyCode == 13) { 	
	    		    		
	    	var source = document.getElementById(id);          
			submitSearch(source.value);
	    }
	    return true;
	}   
    
    function submitSearch(queryVal)
    {
        if (queryVal != "")
        {
            self.location.href="http://www.coventry.ac.uk/search?q=" + queryVal + "&cx=012739113142552960993%3A2acz9qbzrpk&cof=FORID%3A11#991";
        }
    }
    
    function submitSearchCourses(queryVal)
    {
        if (queryVal != "")
        {
        	queryVal = '"' + queryVal + '"';
            self.location.href="http://www.coventry.ac.uk/search?q=" + queryVal + "&cx=012739113142552960993%3A1thhlrbwone&cof=FORID%3A11#956";
        }
    }    
    
    function setClassName(objId, className) {
    	var doc = document.getElementById(objId).className = className;
	}
	
	
	function cu_removeNodes(nodeArray)
	{
		if (inputNodes != null && inputNodes.length > 0)
		{
			 for ( var i = 0; i < inputNodes.length; i++)
			 {
			 	var parent = inputNodes[i].parentNode;
			 	var x = parent.removeChild(inputNodes[i]);
			 }
		}
	}
	
function makeMenu3(){
	var navId = "navColumn";
	//alert("hello");
	var navColumn = document.getElementById(navId);
	var navParentUL;
	var currentNode;
	//$('covTools').appendChild();
	//alert(navColumn.innerHTML);
	//get the first ul node as the parent of our 
	for (var i = 0;i < navColumn.childNodes.length;++i)
	{
		
		if (navColumn.childNodes[i].nodeName.toLowerCase() == "ul")
		{
			navParentUL = navColumn.childNodes[i];
		}
	}
	
	//alert(navParentUL.nodeName);
	
	//loop through all the child nodes of the nav and find the li that contains the span tag this is the location of the current node
	var firstLI = "";
	
	for (var i = 0; i < navParentUL.childNodes.length;++i)
	{
		if (navParentUL.childNodes[i].nodeName.toLowerCase() == "li")
		{
			if (firstLI == "")
			{
				firstLI = navParentUL.childNodes[i];
			} 
			var spans = navParentUL.childNodes[i].getElementsByTagName("SPAN");
			//alert(spans.length);
			if (spans.length > 0)
			{
				currentNode = navParentUL.childNodes[i];
			}
			else if(!currentNode)
			{
				try{
					//currentNode = firstLI;
					var siteMapSpans;
					var siteMapPath = document.getElementById("ctl00_siteMapPath");
				
					if (siteMapPath)
					{
						siteMapSpans = siteMapPath.getElementsByTagName("SPAN");	
					}
					var siteNameLink;
					if (siteMapSpans && siteMapSpans.length > 2)
					{				
						siteNameLink = siteMapSpans[2].getElementsByTagName("A")[0].getAttribute("HREF");
					}
					if (siteNameLink)
					{		
						var childInnerHTML = navParentUL.childNodes[i].innerHTML.toLowerCase();
						var url = /http:\/\/wwwm\.coventry\.ac\.uk\//i;
						siteNameLink = siteNameLink.toLowerCase().replace(url,"");
						if (childInnerHTML.indexOf(siteNameLink) > -1)
						{
							currentNode = navParentUL.childNodes[i];				
						}
					}
				}catch (e){
					//alert("error");
					var ten = 10;
				}
			}
		}
	}
	

	if (!currentNode)
	{
		//there isn't a current node so we need to find the current site nav in a more obsucre way
		//this for deep linking and 
		
	}
	var re = /<ul>/i;	
	var positionOfFirstUL = currentNode.innerHTML.search(re);
	
	var siteHeading = currentNode.innerHTML.slice(0,positionOfFirstUL);

	currentNode.innerHTML = currentNode.innerHTML.slice(positionOfFirstUL);
	//alert(currentNode.innerHTML);
	var cNodeHTML = "";
	if (currentNode.innerHTML.length > 5)
	{
		cNodeHTML = currentNode.innerHTML;
	}
	navColumn.innerHTML = "<ul id=\"leftNav\"><li class=\"noborder\"><h3 class=" + '"sectionHeading bold"' + ">" + siteHeading + "</h3>" + cNodeHTML  + "</li></ul>";
	
	var addThisDiv = document.getElementById("addThisDiv");
	navColumn.appendChild(addThisDiv);
	
	fixNav();
}


    function HOBSONS_askAttach(id)
    {
    	var source = document.getElementById(id);
	    if (document.all) {
			// IE doesn't let you set attributes by passing in a lambda function like
			// Mozilla does.  Instead, we have to create a string and pass it to the
			// Function() constructor.  We expand the 'id' and 'url' elements in the
			// string, but allow the event object to pass through from the calling
			// scope.  Ugh.
			source.onkeydown = new Function('return searchHandleEvent("' + id + 
							'", event); ');
	    } else {
			// Everything else
			source.onkeydown = function(event) { return HOBSONS_submitenterkey(id, event);}
	    }

    }


/** hobson's coding **/
function HOBSONS_submitenterkey(myfield,e)
{
var keycode;
if (window.event) keycode = window.event.keyCode;
else if (e) keycode = e.which;
else return true;

if (keycode == 13)
   {
   HOBSONS_submitQuestion(e);
   return false;
   }
else
   return true;
}
function HOBSONS_submitQuestion(event){
	if(document.getElementById('did1').checked == true){
		window.location.href = 'http://emt.askadmissions.net/coventry_ac/ask.aspx?did=23&cid=2253&quser=' + document.getElementById('answerQuestionText').value;
	} else if(document.getElementById('did2').checked == true){
		window.location.href = 'http://emt.askadmissions.net/covpg_ac/ask.aspx?did=24&cid=2326&quser=' + document.getElementById('answerQuestionText').value;
	} else if(document.getElementById('did3').checked == true){
		window.location.href = 'http://emt.askadmissions.net/covpg_ac/ask.aspx?did=1041&cid=2326&quser=' + document.getElementById('answerQuestionText').value;
	} else if(document.getElementById('did4').checked == true){
		window.location.href = 'http://www.coventry.enquiries.uk.com/';
	} else {
	return false;
	}
}

function HOBSONS_blankRadioGroup()
{
	var radioGrp = document.forms[0].did;
	for (var i; i < radioGrp.length;i++)
		radioGrp.checked = false;
}

function HOBSONS_streamEnquiry(event)
{
	if(document.getElementById('ukftug').checked == true){
		window.location.href = 'http://emt.askadmissions.net/coventry_ac/emtinterestpage.aspx?ip=enquiry';
	} else if(document.getElementById('ukptug').checked == true){
		window.location.href = 'http://emt.askadmissions.net/covpg_ac/emtinterestpage.aspx?ip=enquiry';
	} else if(document.getElementById('ukpg').checked == true){
		window.location.href = 'http://emt.askadmissions.net/covpg_ac/emtinterestpage.aspx?ip=enquiry';
	} else if(document.getElementById('euio').checked == true){
		window.location.href = 'http://www.coventry.enquiries.uk.com/';
	} else {
	return false;
	}
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
}

function buildMoreInfoThanksMessage(){
	//alert("test");
	if($('ctl00_PlaceHolderMain_MoreInfo_lblEmailConfirmation'))
	{
		//alert('test');
		var thanksSpan = $('ctl00_PlaceHolderMain_MoreInfo_lblEmailConfirmation');
		var input = new Element('input',{
				'type':'button',
				'value':'Go back to course',
				'class':'f-Submit',
				'events':{
				'click':function(){
					history.go(-2);
					}
				}
			});
			input.inject(thanksSpan);
		$('ctl00_PlaceHolderMain_MoreInfo_myProspectusButton').destroy();
	}
}

function cleanupCourseBreadCrumb()
{
	var breadcrumbSpans = $('ctl00_siteMapPath').getElements('span');
	//alert(breadcrumbSpans);
	if (breadcrumbSpans.length > 6)
	{
		breadcrumbSpans[4].destroy();
		breadcrumbSpans[5].destroy();
	}
}

function closeEmOverlay(id,className)
{	
	$(id).set('class',className);
}

function changeFlashObjects(){
	var flashObjectElms = $$('object[type=application/x-shockwave-flash]');
	//alert(flashObjectElms);
	
	var param = new Element('param',{'name':'wmode',
		'value':'transparent'});
		/**
		<embed height="377" width="550" wmode="transparent" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" quality="high" 
		src="/university/masterplan/Documents/MasterPlan0_5.swf"/>
		*/
	flashObjectElms.each(function(item){
		var embed = new Element('embed',{
			'width':item.get('width'),
			'height':item.get('height'),
			'type':'application/x-shockwave-flash',
			'pluginspage':'http://www.macromedia.com/go/getflashplayer',
			'quality':'high',
			'src':item.get('data')			
		});
		item.appendChild(embed);
		item.appendChild(param.clone());
	});
}

/** end hobson's coding **/


/*	SWFObject v2.0 <http://code.google.com/p/swfobject/>
	Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var Z="undefined",P="object",B="Shockwave Flash",h="ShockwaveFlash.ShockwaveFlash",W="application/x-shockwave-flash",K="SWFObjectExprInst",G=window,g=document,N=navigator,f=[],H=[],Q=null,L=null,T=null,S=false,C=false;var a=function(){var l=typeof g.getElementById!=Z&&typeof g.getElementsByTagName!=Z&&typeof g.createElement!=Z&&typeof g.appendChild!=Z&&typeof g.replaceChild!=Z&&typeof g.removeChild!=Z&&typeof g.cloneNode!=Z,t=[0,0,0],n=null;if(typeof N.plugins!=Z&&typeof N.plugins[B]==P){n=N.plugins[B].description;if(n){n=n.replace(/^.*\s+(\S+\s+\S+$)/,"$1");t[0]=parseInt(n.replace(/^(.*)\..*$/,"$1"),10);t[1]=parseInt(n.replace(/^.*\.(.*)\s.*$/,"$1"),10);t[2]=/r/.test(n)?parseInt(n.replace(/^.*r(.*)$/,"$1"),10):0}}else{if(typeof G.ActiveXObject!=Z){var o=null,s=false;try{o=new ActiveXObject(h+".7")}catch(k){try{o=new ActiveXObject(h+".6");t=[6,0,21];o.AllowScriptAccess="always"}catch(k){if(t[0]==6){s=true}}if(!s){try{o=new ActiveXObject(h)}catch(k){}}}if(!s&&o){try{n=o.GetVariable("$version");if(n){n=n.split(" ")[1].split(",");t=[parseInt(n[0],10),parseInt(n[1],10),parseInt(n[2],10)]}}catch(k){}}}}var v=N.userAgent.toLowerCase(),j=N.platform.toLowerCase(),r=/webkit/.test(v)?parseFloat(v.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,i=false,q=j?/win/.test(j):/win/.test(v),m=j?/mac/.test(j):/mac/.test(v);/*@cc_on i=true;@if(@_win32)q=true;@elif(@_mac)m=true;@end@*/return{w3cdom:l,pv:t,webkit:r,ie:i,win:q,mac:m}}();var e=function(){if(!a.w3cdom){return }J(I);if(a.ie&&a.win){try{g.write("<script id=__ie_ondomload defer=true src=//:><\/script>");var i=c("__ie_ondomload");if(i){i.onreadystatechange=function(){if(this.readyState=="complete"){this.parentNode.removeChild(this);V()}}}}catch(j){}}if(a.webkit&&typeof g.readyState!=Z){Q=setInterval(function(){if(/loaded|complete/.test(g.readyState)){V()}},10)}if(typeof g.addEventListener!=Z){g.addEventListener("DOMContentLoaded",V,null)}M(V)}();function V(){if(S){return }if(a.ie&&a.win){var m=Y("span");try{var l=g.getElementsByTagName("body")[0].appendChild(m);l.parentNode.removeChild(l)}catch(n){return }}S=true;if(Q){clearInterval(Q);Q=null}var j=f.length;for(var k=0;k<j;k++){f[k]()}}function J(i){if(S){i()}else{f[f.length]=i}}function M(j){if(typeof G.addEventListener!=Z){G.addEventListener("load",j,false)}else{if(typeof g.addEventListener!=Z){g.addEventListener("load",j,false)}else{if(typeof G.attachEvent!=Z){G.attachEvent("onload",j)}else{if(typeof G.onload=="function"){var i=G.onload;G.onload=function(){i();j()}}else{G.onload=j}}}}}function I(){var l=H.length;for(var j=0;j<l;j++){var m=H[j].id;if(a.pv[0]>0){var k=c(m);if(k){H[j].width=k.getAttribute("width")?k.getAttribute("width"):"0";H[j].height=k.getAttribute("height")?k.getAttribute("height"):"0";if(O(H[j].swfVersion)){if(a.webkit&&a.webkit<312){U(k)}X(m,true)}else{if(H[j].expressInstall&&!C&&O("6.0.65")&&(a.win||a.mac)){D(H[j])}else{d(k)}}}}else{X(m,true)}}}function U(m){var k=m.getElementsByTagName(P)[0];if(k){var p=Y("embed"),r=k.attributes;if(r){var o=r.length;for(var n=0;n<o;n++){if(r[n].nodeName.toLowerCase()=="data"){p.setAttribute("src",r[n].nodeValue)}else{p.setAttribute(r[n].nodeName,r[n].nodeValue)}}}var q=k.childNodes;if(q){var s=q.length;for(var l=0;l<s;l++){if(q[l].nodeType==1&&q[l].nodeName.toLowerCase()=="param"){p.setAttribute(q[l].getAttribute("name"),q[l].getAttribute("value"))}}}m.parentNode.replaceChild(p,m)}}function F(i){if(a.ie&&a.win&&O("8.0.0")){G.attachEvent("onunload",function(){var k=c(i);if(k){for(var j in k){if(typeof k[j]=="function"){k[j]=function(){}}}k.parentNode.removeChild(k)}})}}function D(j){C=true;var o=c(j.id);if(o){if(j.altContentId){var l=c(j.altContentId);if(l){L=l;T=j.altContentId}}else{L=b(o)}if(!(/%$/.test(j.width))&&parseInt(j.width,10)<310){j.width="310"}if(!(/%$/.test(j.height))&&parseInt(j.height,10)<137){j.height="137"}g.title=g.title.slice(0,47)+" - Flash Player Installation";var n=a.ie&&a.win?"ActiveX":"PlugIn",k=g.title,m="MMredirectURL="+G.location+"&MMplayerType="+n+"&MMdoctitle="+k,p=j.id;if(a.ie&&a.win&&o.readyState!=4){var i=Y("div");p+="SWFObjectNew";i.setAttribute("id",p);o.parentNode.insertBefore(i,o);o.style.display="none";G.attachEvent("onload",function(){o.parentNode.removeChild(o)})}R({data:j.expressInstall,id:K,width:j.width,height:j.height},{flashvars:m},p)}}function d(j){if(a.ie&&a.win&&j.readyState!=4){var i=Y("div");j.parentNode.insertBefore(i,j);i.parentNode.replaceChild(b(j),i);j.style.display="none";G.attachEvent("onload",function(){j.parentNode.removeChild(j)})}else{j.parentNode.replaceChild(b(j),j)}}function b(n){var m=Y("div");if(a.win&&a.ie){m.innerHTML=n.innerHTML}else{var k=n.getElementsByTagName(P)[0];if(k){var o=k.childNodes;if(o){var j=o.length;for(var l=0;l<j;l++){if(!(o[l].nodeType==1&&o[l].nodeName.toLowerCase()=="param")&&!(o[l].nodeType==8)){m.appendChild(o[l].cloneNode(true))}}}}}return m}function R(AE,AC,q){var p,t=c(q);if(typeof AE.id==Z){AE.id=q}if(a.ie&&a.win){var AD="";for(var z in AE){if(AE[z]!=Object.prototype[z]){if(z=="data"){AC.movie=AE[z]}else{if(z.toLowerCase()=="styleclass"){AD+=' class="'+AE[z]+'"'}else{if(z!="classid"){AD+=" "+z+'="'+AE[z]+'"'}}}}}var AB="";for(var y in AC){if(AC[y]!=Object.prototype[y]){AB+='<param name="'+y+'" value="'+AC[y]+'" />'}}t.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+AD+">"+AB+"</object>";F(AE.id);p=c(AE.id)}else{if(a.webkit&&a.webkit<312){var AA=Y("embed");AA.setAttribute("type",W);for(var x in AE){if(AE[x]!=Object.prototype[x]){if(x=="data"){AA.setAttribute("src",AE[x])}else{if(x.toLowerCase()=="styleclass"){AA.setAttribute("class",AE[x])}else{if(x!="classid"){AA.setAttribute(x,AE[x])}}}}}for(var w in AC){if(AC[w]!=Object.prototype[w]){if(w!="movie"){AA.setAttribute(w,AC[w])}}}t.parentNode.replaceChild(AA,t);p=AA}else{var s=Y(P);s.setAttribute("type",W);for(var v in AE){if(AE[v]!=Object.prototype[v]){if(v.toLowerCase()=="styleclass"){s.setAttribute("class",AE[v])}else{if(v!="classid"){s.setAttribute(v,AE[v])}}}}for(var u in AC){if(AC[u]!=Object.prototype[u]&&u!="movie"){E(s,u,AC[u])}}t.parentNode.replaceChild(s,t);p=s}}return p}function E(k,i,j){var l=Y("param");l.setAttribute("name",i);l.setAttribute("value",j);k.appendChild(l)}function c(i){return g.getElementById(i)}function Y(i){return g.createElement(i)}function O(k){var j=a.pv,i=k.split(".");i[0]=parseInt(i[0],10);i[1]=parseInt(i[1],10);i[2]=parseInt(i[2],10);return(j[0]>i[0]||(j[0]==i[0]&&j[1]>i[1])||(j[0]==i[0]&&j[1]==i[1]&&j[2]>=i[2]))?true:false}function A(m,j){if(a.ie&&a.mac){return }var l=g.getElementsByTagName("head")[0],k=Y("style");k.setAttribute("type","text/css");k.setAttribute("media","screen");if(!(a.ie&&a.win)&&typeof g.createTextNode!=Z){k.appendChild(g.createTextNode(m+" {"+j+"}"))}l.appendChild(k);if(a.ie&&a.win&&typeof g.styleSheets!=Z&&g.styleSheets.length>0){var i=g.styleSheets[g.styleSheets.length-1];if(typeof i.addRule==P){i.addRule(m,j)}}}function X(k,i){var j=i?"visible":"hidden";if(S){c(k).style.visibility=j}else{A("#"+k,"visibility:"+j)}}return{registerObject:function(l,i,k){if(!a.w3cdom||!l||!i){return }var j={};j.id=l;j.swfVersion=i;j.expressInstall=k?k:false;H[H.length]=j;X(l,false)},getObjectById:function(l){var i=null;if(a.w3cdom&&S){var j=c(l);if(j){var k=j.getElementsByTagName(P)[0];if(!k||(k&&typeof j.SetVariable!=Z)){i=j}else{if(typeof k.SetVariable!=Z){i=k}}}}return i},embedSWF:function(n,u,r,t,j,m,k,p,s){if(!a.w3cdom||!n||!u||!r||!t||!j){return }r+="";t+="";if(O(j)){X(u,false);var q=(typeof s==P)?s:{};q.data=n;q.width=r;q.height=t;var o=(typeof p==P)?p:{};if(typeof k==P){for(var l in k){if(k[l]!=Object.prototype[l]){if(typeof o.flashvars!=Z){o.flashvars+="&"+l+"="+k[l]}else{o.flashvars=l+"="+k[l]}}}}J(function(){R(q,o,u);if(q.id==u){X(u,true)}})}else{if(m&&!C&&O("6.0.65")&&(a.win||a.mac)){X(u,false);J(function(){var i={};i.id=i.altContentId=u;i.width=r;i.height=t;i.expressInstall=m;D(i)})}}},getFlashPlayerVersion:function(){return{major:a.pv[0],minor:a.pv[1],release:a.pv[2]}},hasFlashPlayerVersion:O,createSWF:function(k,j,i){if(a.w3cdom&&S){return R(k,j,i)}else{return undefined}},createCSS:function(j,i){if(a.w3cdom){A(j,i)}},addDomLoadEvent:J,addLoadEvent:M,getQueryParamValue:function(m){var l=g.location.search||g.location.hash;if(m==null){return l}if(l){var k=l.substring(1).split("&");for(var j=0;j<k.length;j++){if(k[j].substring(0,k[j].indexOf("="))==m){return k[j].substring((k[j].indexOf("=")+1))}}}return""},expressInstallCallback:function(){if(C&&L){var i=c(K);if(i){i.parentNode.replaceChild(L,i);if(T){X(T,true);if(a.ie&&a.win){L.style.display="block"}}L=null;T=null;C=false}}}}}();

/*
 * Date Format 1.2.2
 * (c) 2007-2008 Steven Levithan <stevenlevithan.com>
 * MIT license
 * Includes enhancements by Scott Trenda <scott.trenda.net> and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && (typeof date == "string" || date instanceof String) && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date();
		if (isNaN(date)) throw new SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


/***publishing console***/
function pc_hideUnUsedRows()
{
	var pcTRs = $('idPubConsole').getElements('tr');
	if (pcTRs)
	{
		for (var x=1;x < pcTRs.length; x++)
		{
			pcTRs[x].toggleClass('hide');
		}
	}
}
function pc_resetArrowPosition()
{
	var myEffect = new Fx.Morph('idPubConsole', {duration: 'short', transition: Fx.Transitions.Sine.easeOut});
	myEffect.start({
		'top':10,
		'left':0
	});
}
function pc_init()
{
	$('pcTitle').addEvent("dblclick",function(){
		this.toggleClass('pcShowArrow');
		pc_resetArrowPosition();
		pc_hideUnUsedRows();
	});
	
	pc_hideUnUsedRows();
	var pcConDrag = new Drag.Move($('idPubConsole'));
	pc_resetArrowPosition();
}
/***end publishing console***/

function makeMenuNewLayouts(){
	var navId = "navholder";
	var navDisplayerId = "navColumn";
	//alert("hello");
	var navColumn = $(navId);
	var navParentUL;
	var currentNode;
	
	//clean up empty ULs...
	navColumn.getChildren('li');
	//get the first ul node as the parent of our 
	for (var i = 0;i < navColumn.childNodes.length;++i)
	{
		if (navColumn.childNodes[i].nodeName.toLowerCase() == "ul")
		{
			navParentUL = navColumn.childNodes[i];
		}
	}
	
	//alert(navParentUL.nodeName);
	
	//loop through all the child nodes of the nav and find the li that contains the span tag this is the location of the current node
	var firstLI = "";
	
	for (var i = 0; i < navParentUL.childNodes.length;++i)
	{
		if (navParentUL.childNodes[i].nodeName.toLowerCase() == "li")
		{
			if (firstLI == "")
			{
				firstLI = navParentUL.childNodes[i];
			} 
			var spans = navParentUL.childNodes[i].getElementsByTagName("SPAN");
			//alert(spans.length);
			if (spans.length > 0)
			{
				currentNode = navParentUL.childNodes[i];
			}
			else if(!currentNode)
			{
				try{
					//currentNode = firstLI;
					var siteMapSpans;
					var siteMapPath = document.getElementById("ctl00_siteMapPath");
				
					if (siteMapPath)
					{
						siteMapSpans = siteMapPath.getElementsByTagName("SPAN");	
					
						var siteNameLink;
						if (siteMapSpans && siteMapSpans.length > 2)
						{				
							siteNameLink = siteMapSpans[2].getElementsByTagName("A")[0].getAttribute("HREF");
						}
						if (siteNameLink)
						{		
							var childInnerHTML = navParentUL.childNodes[i].innerHTML.toLowerCase();
							var url = /http:\/\/wwwm\.coventry\.ac\.uk\//i;
							siteNameLink = siteNameLink.toLowerCase().replace(url,"");
							if (childInnerHTML.indexOf(siteNameLink) > -1)
							{
								currentNode = navParentUL.childNodes[i];				
							}
						}
					}
				}catch (e){
					//alert("error");
					var ten = 10;
				}
			}
		}
	}
	
	
	/*var navSpans = $$('span[class=currentNode]'); 
	//alert($type(navSpans));
	if ('array' == $type(navSpans) && navSpans.length > 0)
	{
		currentNode = navSpans[0].getParent();
		//alert(currentNode.innerHTML);
	}*/
	if (!currentNode)
	{
		//could find current node from the breadcrumb - maybe there isn't one.
		//so lets use the url of the current site.
		
		var documentLink = window.location.href;
		
		var regEx = /\/{1}[\w]*\/pages/i;
		var resultsArray = regEx.exec(documentLink);
		resultsArray = documentLink.split("researchnet");
		resultsArray = resultsArray[1].split("/");
		var siteDir = resultsArray[1];
		
		var aTags = navColumn.getElements("a");
		//alert(siteDir);
		aTags.each(function(item)
		{
			
			if (!currentNode && item.get("href").indexOf(siteDir) > -1)
			{		
					currentNode = item.getParent();
			}
		});
		
	}
	
	var re = /<ul>/i;	
	var positionOfFirstUL = currentNode.innerHTML.search(re);
	
	var siteHeading = currentNode.innerHTML.slice(0,positionOfFirstUL);

	currentNode.innerHTML = currentNode.innerHTML.slice(positionOfFirstUL);
	//alert(currentNode.innerHTML);
	var cNodeHTML = "";
	if (currentNode.innerHTML.length > 5)
	{
		cNodeHTML = currentNode.innerHTML;
	}
	navColumn.innerHTML = "<ul id=\"leftNav\"><li class=\"noborder\"><h3 class=" + '"sectionHeading bold"' + ">" + siteHeading + "</h3>" + cNodeHTML + "</li><ul>";;
	
	//remove empty uls
	var ulRegEx = /<ul>\s*<\/ul>/igm;
	navColumn.innerHTML = navColumn.innerHTML.replace(ulRegEx,"");
	//move the nav column to new location
	
	$(navDisplayerId).innerHTML = navColumn.innerHTML;
	
	navColumn.destroy();
}

function makeNavNewLayouts()
{
	
	if ($$('div[class=navColumn]')[0])
	{	
		//alert('nav column');
		$$('div[class=navColumn]')[0].set('id','navColumn');
		$('navColumn').addClass('span-6');
		makeMenuNewLayouts();
	}
}
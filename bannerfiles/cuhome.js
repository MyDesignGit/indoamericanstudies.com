var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();


//alert(BrowserDetect.browser + " " + BrowserDetect.version);
// PLEASE NOTE: THIS SCRIPT REQUIRES MOOTOOLS v1.11 TO RUN

//This script is run once the DOM has loaded, no need to wait for images etc to load.
window.addEvent('domready', function(){
	fixNav();
	if (!(BrowserDetect.browser == "Explorer" && BrowserDetect.version < 2))
	{
	//display content
	var container = document.getElementById("container");
	container.setAttribute("class","hpShow");
	container.setAttribute("className","hpShow");
	//container.style = "display:block";


	//Set The Initial Variables
	var boxNormal = 151, boxSmall = 111, boxFull = 349, boxHeight = 360, boxFontSize = 12, containerHeight = 360, boxSpeed = 1000;
	
	//HIDE BOX CONTENTS
	//Create array of box_inner class
	var box_inners = $$(".box_inner");
	//Loop through and hide
	box_inners.each(function(hidebox,i){
		hidebox.setStyle("display","none");
	})
	
	//HIDE JAVASCRIPT WARNING
	//We hide the Javascript warning as if this is run the browser must have Javascript enabled
	var javascript_warning = $("javascript_warning");
	javascript_warning.setStyle("display","none");
	
	//ALTER STYLES
	//These functions alter styles that are set in the style sheet
	
	//Reset the width of the boxes so that they are all closed initially, also change height
	var cu_box_init = $$("#cu_boxes .box");
	cu_box_init.each(function(myInitBox, h){
		myInitBox.setStyle("width",boxNormal);
		myInitBox.setStyle("height",boxHeight);
	});
	
	//Alter the contents of the boxes, remove the background, change the type size, width etc.
	var cu_box_inner = $$(".box_inner");
	cu_box_inner.each(function(inner,i){
		inner.setStyle("background-color","transparent");
		inner.setStyle("font-size", boxFontSize);
		inner.setStyle("overflow", "hidden");
		inner.setStyle("width",boxFull);
	})
	
	//Resize container height
	var cu_box_container = $("cu_boxes_container");
	cu_box_container.setStyle("height",containerHeight);
			
	//ADD THE ROLLOVER EVENTS TO THE COLUMNS		
	var cu_boxes = $$("#cu_boxes .box");
	
	//Create new fx
	var fx = new Fx.Elements(cu_boxes, {wait: false, duration: boxSpeed, transition: Fx.Transitions.Cubic.easeOut});
	
	//loop through the columns
	cu_boxes.each(function(box, i) {
		//OnMouseEnter Events
		box.addEvent("mouseenter", function(event) {
			//Change the display state of the content of rolled column and hide others 
			box_inners.each(function(mybox,k){
				if(k==i){
					mybox.setStyle("display","block");
				}else{
					mybox.setStyle("display","none");
				}
			})
				
			var o = {};
			o[i] = {width: [box.getStyle("width").toInt(), boxFull]}
			cu_boxes.each(function(other, j) {
				if(i != j) {
					var w = other.getStyle("width").toInt();
					if(w != boxSmall) o[j] = {width: [w, boxSmall]};
				}
			});
			fx.start(o);
		});
	});

	//OnRollOut Events	
	$("cu_boxes").addEvent("mouseleave", function(event) {
		var o = {};
		cu_boxes.each(function(box, i) {
			o[i] = {width: [box.getStyle("width").toInt(), boxNormal]}
		});
		//Hide contents on rollOut
		box_inners.each(function(mybox,h){
			mybox.setStyle("display","none");
		})
		fx.start(o);
	})
	}else{
		
		var container = document.getElementById("container");
		container.setAttribute("class","hpShow");
		container.setAttribute("className","hpShow");
	}	
});	

				
/**
 * SimpleTabs - Unobtrusive Tabs with Ajax
 *
 * @example
 *
 *	var tabs = new SimpleTabs($('tab-element'), {
 * 		selector: 'h2.tab-tab'
 *	});
 *
 * @version		1.0
 *
 * @license		MIT License
 * @author		Harald Kirschner <mail [at] digitarald.de>
 * @copyright	2007 Author
 */
var SimpleTabs = new Class({

	Implements: [Events, Options],

	/**
	 * Options
	 */
	options: {
		show: 1,
		selector: '.tab-tab',
		classWrapper: 'tab-wrapper',
		classMenu: 'tab-menu',
		classContainer: 'tab-container',
		onSelect: function(toggle, container, index) {
			toggle.addClass('tab-selected');
			container.setStyle('display', '');
		},
		onDeselect: function(toggle, container, index) {
			toggle.removeClass('tab-selected');
			container.setStyle('display', 'none');
		},
		onRequest: function(toggle, container, index) {
			container.addClass('tab-ajax-loading');
		},
		onComplete: function(toggle, container, index) {
			container.removeClass('tab-ajax-loading');
		},
		onFailure: function(toggle, container, index) {
			container.removeClass('tab-ajax-loading');
		},
		onAdded: Class.empty,
		getContent: null,
		ajaxOptions: {},
		cache: true
	},

	/**
	 * Constructor
	 *
	 * @param {Element} The parent Element that holds the tab elements
	 * @param {Object} Options
	 */
	initialize: function(element, options) {
		this.element = $(element);
		this.setOptions(options);
		this.selected = null;
		this.build();
	},

	build: function() {
		this.tabs = [];
		this.menu = new Element('ul', {'class': this.options.classMenu});
		this.wrapper = new Element('div', {'class': this.options.classWrapper});

		this.element.getElements(this.options.selector).each(function(el) {
			var content = el.get('href') || (this.options.getContent ? this.options.getContent.call(this, el) : el.getNext());
			this.addTab(el.innerHTML, el.title || el.innerHTML, content);
		}, this);
		this.element.empty().adopt(this.menu, this.wrapper);

		if (this.tabs.length) this.select(this.options.show);
	},

	/**
	 * Add a new tab at the end of the tab menu
	 *
	 * @param {String} inner Text
	 * @param {String} Title
	 * @param {Element|String} Content Element or URL for Ajax
	 */
	addTab: function(text, title, content) {
		var grab = $(content);
		var container = (grab || new Element('div'))
			.setStyle('display', 'none')
			.addClass(this.options.classContainer)
			.inject(this.wrapper);
		var pos = this.tabs.length;
		var evt = (this.options.hover) ? 'mouseenter' : 'click';
		var tab = {
			container: container,
			toggle: new Element('li').grab(new Element('a', {
				href: '#',
				title: title
			}).grab(
				new Element('span', {html: text})
			)).addEvent(evt, this.onClick.bindWithEvent(this, [pos])).inject(this.menu)
		};
		if (!grab && $type(content) == 'string') tab.url = content;
		this.tabs.push(tab);
		return this.fireEvent('onAdded', [tab.toggle, tab.container, pos]);
	},

	onClick: function(evt, index) {
		this.select(index);
		return false;
	},

	/**
	 * Select the tab via tab-index
	 *
	 * @param {Number} Tab-index
	 */
	select: function(index) {
		if (this.selected === index || !this.tabs[index]) return this;
		if (this.ajax) this.ajax.cancel().removeEvents();
		var tab = this.tabs[index];
		var params = [tab.toggle, tab.container, index];
		if (this.selected !== null) {
			var current = this.tabs[this.selected];
			if (this.ajax && this.ajax.running) this.ajax.cancel();
			params.extend([current.toggle, current.container, this.selected]);
			this.fireEvent('onDeselect', [current.toggle, current.container, this.selected]);
		}
		this.fireEvent('onSelect', params);
		if (tab.url && (!tab.loaded || !this.options.cache)) {
			this.ajax = this.ajax || new Request.HTML();
			this.ajax.setOptions({
				url: tab.url,
				method: 'get',
				update: tab.container,
				onFailure: this.fireEvent.pass(['onFailure', params], this),
				onComplete: function(resp) {
					tab.loaded = true;
					this.fireEvent('onComplete', params);
				}.bind(this)
			}).setOptions(this.options.ajaxOptions);
			this.ajax.send();
			this.fireEvent('onRequest', params);
		}
		this.selected = index;
		return this;
	}
});

function cuHomeForthcomingEvents()
{
	var eventLis = $('feLeftCol').getElements('li');
	//alert(eventLis);
	
	if (eventLis.length > 2)
	{
		//some of them into the right column
		var rcEventLis = eventLis.slice(2);
		var lis2Move;
		if (rcEventLis.length > 2)
		{
			lis2Move = 3;
		}
		else
		{
			lis2Move = rcEventLis.length;
		}
		
		for (i = 0;i < rcEventLis.length;i++)
		{
			if (i < lis2Move)
				$('feRightCol').appendChild(rcEventLis[i]); 
			else
				rcEventLis[i].destroy();
		}
	}
	
	
}
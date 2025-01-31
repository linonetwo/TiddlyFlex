/*\
title: $:/plugins/BTC/TiddlyFlex/modules/widgets/tiddlyflex-draggable.js
type: application/javascript
module-type: widget

Draggable widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var DraggableWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
DraggableWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
DraggableWidget.prototype.render = function(parent,nextSibling) {
	var self = this,
		tag,
		domNode,
		classes = [];
	// Save the parent dom node
	this.parentDomNode = parent;
	// Compute our attributes
	this.computeAttributes();
	// Execute our logic
	this.execute();
	// Sanitise the specified tag
	tag = this.draggableTag;
	if($tw.config.htmlUnsafeElements.indexOf(tag) !== -1) {
		tag = "div";
	}
	// Create our element
	domNode = this.document.createElement(tag);
	// Assign classes
	if(this.draggableClasses) {
		classes.push(this.draggableClasses);
	}
	if(!this.dragHandleSelector && this.dragEnable) {
		classes.push("tc-draggable");
	}
	domNode.setAttribute("class",classes.join(" "));
	// Assign data- attributes and style. attributes
	this.assignAttributes(domNode,{
		sourcePrefix: "data-",
		destPrefix: "data-"
	});
	// Insert the node into the DOM and render any children
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.makeDraggable(domNode);
	this.domNodes.push(domNode);
};

DraggableWidget.prototype.makeDraggable = function(domNode) {
	var self = this;
	// Add event handlers
	if(this.dragEnable) {
		$tw.utils.makeTiddlyFlexDraggable({
			domNode: domNode,
			remove: false,
			dragTiddlerFn: function() {return self.getAttribute("tiddler");},
			dragFilterFn: function() {return self.getAttribute("filter");},
			startActions: self.startActions,
			endActions: self.endActions,
			dragImageType: self.dragImageType,
			widget: this,
			selector: self.dragHandleSelector
		});
	} else if(this.dragStartListenerReference && this.dragEndListenerReference) {
		domNode.removeEventListener("dragstart",this.dragStartListenerReference,false);
		domNode.removeEventListener("dragend",this.dragEndListenerReference,false);
		domNode.removeAttribute("draggable");
	}
};

/*
Compute the internal state of the widget
*/
DraggableWidget.prototype.execute = function() {
	// Pick up our attributes
	this.draggableTag = this.getAttribute("tag","div");
	this.draggableClasses = this.getAttribute("class");
	this.startActions = this.getAttribute("startactions");
	this.endActions = this.getAttribute("endactions");
	this.dragImageType = this.getAttribute("dragimagetype");
	this.dragHandleSelector = this.getAttribute("selector");
	this.dragEnable = this.getAttribute("enable","yes") === "yes";
	// Make the child widgets
	this.makeChildWidgets();
};


DraggableWidget.prototype.updateDomNodeClasses = function() {
	var domNodeClasses = this.domNodes[0].className.split(" "),
		oldClasses = this.draggableClasses.split(" ");
	this.draggableClasses = this.getAttribute("class");
	//Remove classes assigned from the old value of class attribute
	$tw.utils.each(oldClasses,function(oldClass){
		var i = domNodeClasses.indexOf(oldClass);
		if(i !== -1) {
			domNodeClasses.splice(i,1);
		}
	});
	//Add new classes from updated class attribute.
	$tw.utils.pushTop(domNodeClasses,this.draggableClasses);
	this.domNodes[0].setAttribute("class",domNodeClasses.join(" "));
}

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
DraggableWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.tag || changedAttributes.selector || changedAttributes.dragimagetype || changedAttributes.startactions || changedAttributes.endactions) {
		this.refreshSelf();
		return true;
	} else {
		if(changedAttributes["enable"]) {
			this.dragEnable = this.getAttribute("enable","yes") === "yes";
			this.makeDraggable(this.domNodes[0]);
			if(!this.dragHandleSelector && this.dragEnable && !this.domNodes[0].classList.contains("tc-draggable")) {
				this.domNodes[0].classList.add("tc-draggable");
			} else if(!this.dragEnable && this.domNodes[0].classList.contains("tc-draggable")) {
				this.domNodes[0].classList.remove("tc-draggable");
			}
		}
		if(changedAttributes["class"]) {
			this.updateDomNodeClasses();
		}
		this.assignAttributes(this.domNodes[0],{
			changedAttributes: changedAttributes,
			sourcePrefix: "data-",
			destPrefix: "data-"
		});
	}
	return this.refreshChildren(changedTiddlers);
};

exports["tiddlyflex-draggable"] = DraggableWidget;

})();
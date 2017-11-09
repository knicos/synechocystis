function SearchPanel(parent) {
	this.element = document.createElement("div");
	this.element.className = "synechocystis-searchpanel";

	this.topbox = document.createElement("div");
	this.topbox.className = "synechocystis-searchbox";
	this.element.appendChild(this.topbox);

	var me = this;
	this.searchinput = document.createElement("input");
	this.searchinput.className = "synechocystis-search";
	this.searchinput.oninput = function(e) {
		me.updateSearch(me.searchinput.value);
	}
	this.topbox.appendChild(this.searchinput);


	this.labelbox = document.createElement("div");
	this.labelbox.className = "synechocystis-labels";
	this.topbox.appendChild(this.labelbox);

	this.updateSearch();

	this.onsearch = null;

	if (parent) parent.appendChild(this.element);
}

SearchPanel.prototype.updateSearch = function(s) {
	var results = model.search(s);

	while (this.labelbox.lastChild) this.labelbox.removeChild(this.labelbox.lastChild);

	if (results) {
		for (var i=0; i<results.length; i++) {
			this.addResult(results[i]);
		}
	}
}

SearchPanel.prototype.addResult = function(item) {
	var me = this;
	function subsysclick(e) {
		if (me.onsearch) {
			var ss = e.target.getAttribute("data-id");
			console.log("OnSearch", model.subsystems[ss].reactions);
			me.onsearch.call(me, model.subsystems[ss].reactions);
		}
	}

	function metabclick(e) {
		if (me.onsearch) {
			var ss = e.target.getAttribute("data-id");
			console.log("OnSearch", model.getMetaboliteById(ss));
			me.onsearch.call(me, model.getMetaboliteById(ss).reactions);
		}
	}

	function reactclick(e) {
		if (me.onsearch) {
			var ss = e.target.getAttribute("data-id");
			console.log("OnSearch", model.getReactionById(ss));
			me.onsearch.call(me, [model.getReactionById(ss)]);
		}
	}


	var ls = item.name.split(" ");
	var l = (ls.length == 1) ? ls[0] : ls[0] + "...";

	//for (var i=0; i<labels.length; i++) {
		let labelitem = document.createElement("button");
		labelitem.className = "synechocystis-label";
		labelitem.setAttribute("data-id", (item.id) ? item.id : item.name);
		if (item.name) {
			labelitem.title = item.name;
			//console.log(labels[i].tooltip);
		}

		if (item.constructor.name == "Subsystem") {
			labelitem.style.backgroundColor = "blue";
			labelitem.addEventListener("click", subsysclick);
		} else if (item.constructor.name == "Metabolite") {
			labelitem.style.backgroundColor = "orange";
			labelitem.addEventListener("click", metabclick);
			l += " (" + item.compartment + ")";
		} else if (item.constructor.name == "Reaction") {
			labelitem.style.backgroundColor = "purple";
			labelitem.addEventListener("click", reactclick);
		} else {
			labelitem.style.backgroundColor = "#666";
		}

		labelitem.innerText = l;

		this.labelbox.appendChild(labelitem);
	//}
}

module.exports = SearchPanel;


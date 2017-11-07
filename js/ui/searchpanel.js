function SearchPanel(parent) {
	this.element = document.createElement("div");
	this.element.className = "synechocystis-searchpanel";

	this.topbox = document.createElement("div");
	this.topbox.className = "synechocystis-searchbox";
	this.element.appendChild(this.topbox);

	this.searchinput = document.createElement("input");
	this.searchinput.className = "synechocystis-search";
	this.topbox.appendChild(this.searchinput);

	let labels = [
	];

	for (var x in model.subsystems) {
		var ls = x.split(" ");
		var l = (ls.length == 1) ? ls[0] : ls[0] + "...";
		labels.push({text: l, colour: "blue", tooltip: x});
	}

	this.labelbox = document.createElement("div");
	this.labelbox.className = "synechocystis-labels";

	for (var i=0; i<labels.length; i++) {
		let labelitem = document.createElement("button");
		labelitem.className = "synechocystis-label";
		labelitem.innerText = labels[i].text;
		labelitem.style.backgroundColor = labels[i].colour;
		if (labels[i].tooltip) {
			labelitem.title = labels[i].tooltip;
			//console.log(labels[i].tooltip);
		}
		this.labelbox.appendChild(labelitem);
	}
	this.topbox.appendChild(this.labelbox);

	if (parent) parent.appendChild(this.element);
}

module.exports = SearchPanel;


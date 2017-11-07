function ReactionList(parent) {
	this.element = document.createElement("div");
	this.element.className = "synechocystis-reactionpanel";

	if (parent) parent.appendChild(this.element);
}

ReactionList.prototype.setReactions = function(list) {
	this.reactions = list;

	// Clear existing reactions
	while (this.element.lastChild) this.element.removeChild(this.element.lastChild);

	for (var i=0; i<list.length; i++) {
		let r = (typeof list[i] == "string") ? window.model.getReactionById(list[i]) : list[i];
		if (!r) continue;

		let re = document.createElement("div");
		re.className = "synechocystis-reaction";
		let label = document.createElement("span");
		label.className = "synechocystis-reactionname";
		label.innerText = ((r.name !== null) ? r.name : r.id.substring(2));
		re.appendChild(label);

		let fluxlower = document.createElement("input");
		fluxlower.value = r.lower;
		fluxlower.setAttribute("type","text");
		re.appendChild(fluxlower);

		let fluxupper = document.createElement("input");
		fluxupper.value = r.upper;
		fluxupper.setAttribute("type","text");
		re.appendChild(fluxupper);


		this.element.appendChild(re);
	}
}

module.exports = ReactionList;


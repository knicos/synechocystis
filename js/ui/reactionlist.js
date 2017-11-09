function ReactionList(parent) {
	this.element = document.createElement("div");
	this.element.className = "synechocystis-reactionpanel";

	this.reactions = [];
	this.reelement = document.createElement("div");
	this.reelement.className = "synechocystis-reactions";
	this.element.appendChild(this.reelement);

	if (parent) parent.appendChild(this.element);

	this.onedit = null;
}

ReactionList.prototype.setReactions = function(list) {
	this.reactions = list;
	var me = this;

	function editLowerBound(e) {
		var rid = e.target.getAttribute("data-rid");
		var r = model.getReactionById(rid);
		if (r) {
			r.modified = true;
			r.lower = parseFloat(e.target.value);
			if (me.onedit) me.onedit.call(me, r);
			//me.setReactions(me.reactions);
			if (!e.target.className.includes(" modified")) e.target.parentNode.parentNode.className += " modified";
		}
	}

	function editUpperBound(e) {
		var rid = e.target.getAttribute("data-rid");
		var r = model.getReactionById(rid);
		if (r) {
			r.modified = true;
			r.upper = parseFloat(e.target.value);
			if (me.onedit) me.onedit.call(me, r);
			//me.setReactions(me.reactions);
			if (!e.target.className.includes(" modified")) e.target.parentNode.parentNode.className += " modified";
		}
	}

	// Clear existing reactions
	while (this.reelement.lastChild) this.reelement.removeChild(this.reelement.lastChild);

	for (var i=0; i<list.length; i++) {
		let r = (typeof list[i] == "string") ? window.model.getReactionById(list[i]) : list[i];
		if (!r) continue;

		let re = document.createElement("div");
		re.className = "synechocystis-reaction";
		if (r === model.objective) re.className += " objective";
		if (r.modified) re.className += " modified";

		let label = document.createElement("div");
		label.className = "synechocystis-reactionname";
		label.innerText = ((r.name !== null) ? r.name : r.id.substring(2));
		label.title = r.id.substring(2);
		re.appendChild(label);

		let params1 = document.createElement("div");
		params1.className = "synechocystis-params";
		re.appendChild(params1);

		let fluxlower = document.createElement("input");
		fluxlower.value = r.lower;
		fluxlower.setAttribute("type","text");
		fluxlower.setAttribute("data-rid", r.id);
		fluxlower.onchange = editLowerBound;
		params1.appendChild(fluxlower);

		let fluxupper = document.createElement("input");
		fluxupper.value = r.upper;
		fluxupper.setAttribute("type","text");
		fluxupper.setAttribute("data-rid", r.id);
		fluxupper.onchange = editUpperBound;
		params1.appendChild(fluxupper);

		let buttons = document.createElement("div");
		buttons.className = "synechocystis-reactionbuts";
		re.appendChild(buttons);
		let objbut = document.createElement("button");
		objbut.innerText = "Objective";
		buttons.appendChild(objbut);

		let fluxvalue = document.createElement("div");
		fluxvalue.className = "synechocystis-flux";
		fluxvalue.innerText = r.flux.toFixed(4);
		if (Math.abs(r.flux) < 0.0000000001) fluxvalue.className += " blocked";
		re.appendChild(fluxvalue);

		this.reelement.appendChild(re);
	}
}

module.exports = ReactionList;


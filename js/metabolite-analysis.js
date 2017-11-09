function hasProductionFlux(m) {
	var metabolite = (typeof m == "string") ? model.getMetaboliteById(m) : m;
	const E = 0.0000000000001;

	for (var i=0; i<metabolite.reactions.length; i++) {
		let r = metabolite.reactions[i];
		if (r.flux > E && r.outputs.hasOwnProperty(metabolite.id)) return true;
		if (r.flux < -E && r.inputs.hasOwnProperty(metabolite.id)) return true;
	}

	return false;
}

exports.hasProductionFlux = hasProductionFlux;


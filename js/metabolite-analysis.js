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

function productionFlux(m) {
	var metabolite = (typeof m == "string") ? model.getMetaboliteById(m) : m;
	var tflux = 0.0;

	for (var i=0; i<metabolite.reactions.length; i++) {
		let r = metabolite.reactions[i];
		if (!r.flux) continue;
		if (r.flux > 0.0 && r.outputs.hasOwnProperty(metabolite.id)) tflux += r.flux;
		if (r.flux < 0.0 && r.inputs.hasOwnProperty(metabolite.id)) tflux -= r.flux;
	}

	metabolite.flux = tflux;
	return tflux;
}

exports.hasProductionFlux = hasProductionFlux;
exports.productionFlux = productionFlux;


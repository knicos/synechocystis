const SBML = require('metabolic-model');
const KEGG = require('kegg-db');

let options = {
	kegg: true,
	keggfill: true
};

function generateOutput(m) {
	var res = "# Wild Type Synechocystis 6803 iSynCJ816\n";

	// Do Metabolites
	res += "\n## Metabolites\n";
	for (var i=0; i<m.metabolites.length; i++) {
		let c = m.metabolites[i];
		res += "\n### Metabolite " + c.id.substring(2) + "\n";
		res += "name = \"" + c.name + "\".\n";
		res += "compartment = \"" + c.compartment + "\".\n";
		if (c.charge !== null) res += "charge = " + c.charge + ".\n";
		if (c.kegg && options.kegg) res += "kegg = \"" + c.kegg + "\".\n";
	}

	// Do Reactions
	res += "\n## Reactions\n";
	for (var i=0; i<m.reactions.length; i++) {
		let r = m.reactions[i];
		res += "\n### Reaction " + r.id.substring(2) + "\n";
		res += "id = \"" + r.id.substring(2) + "\".\n";
		res += "name = \"" + r.name + "\".\n";
		res += "lower constraint = " + r.lower + ".\n";
		res += "upper constraint = " + r.upper + ".\n";
		res += "reversible = " + r.reversable + ".\n";
		if (r.genes && r.genes.length > 0 && r.genes[0] != "") {
			res += "genes = " + r.genes.join(", ") + ".\n";
		}
		if (r.ec) res += "enzyme = ec" + r.ec + ".\n";
		if (r.subsystem) res += "subsystem = \"" + r.subsystem + "\".\n";
		if (r.kegg && options.kegg) res += "kegg = \"" + r.kegg + "\".\n";

		for (var x in r.inputs) {
			res += "reactant " + x.substring(2) + " = " + r.inputs[x] + ".\n";
		}
		for (var x in r.outputs) {
			res += "product " + x.substring(2) + " = " + r.outputs[x] + ".\n";
		}
	}

	// Do Compartments
	res += "\n## Compartments\n";
	for (var x in m.compartments) {
		res += "\n### Compartment " + x + "\n";
		res += "id = " + x + ".\n";
		res += "name = \"" + m.compartments[x].name + "\".\n";
	}

	console.log(res);
}

var filename = "data/iSynCJ816.xml";
SBML.fromFile(filename, function(m) {
	// KEGG Fill Here
	if (options.keggfill) {
		let mettofill = [];
		for (var i=0; i<m.metabolites.length; i++) {
			let c = m.metabolites[i];
			//console.log(c.kegg);
			if (c.kegg == null) {
				mettofill.push(c);
			}
		}

		//console.log(mettofill);

		var lastmetab = 0;
		function updateMetabolite() {
			if (lastmetab > 3 || lastmetab >= mettofill.length) {
				generateOutput(m);
				return;
			}
			let c = mettofill[lastmetab];
			KEGG.findCompound(c.name, function(data) {
				//console.log(data);
				lastmetab++;
				if (data && data.length > 0) {
					for (var i=0; i<data.length; i++) {
						if (data[i].names.indexOf(c.name) >= 0) {
							c.kegg = data[i].id;
							console.log("MATCH", c.kegg);
							break;
						}
					}

					if (!c.kegg) {
						console.log("NOMATCH", c.id);
					}
				}
				updateMetabolite();
			});
		}
		updateMetabolite();
	}

	
});


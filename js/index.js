const SBML = require('metabolic-model');
const FBA = require('flux-balance-analysis');
const KEGG = require('kegg-db');

window.FBA = FBA;

const SearchPanel = require('./ui/searchpanel.js');
const ReactionList = require('./ui/reactionlist.js');
const MetabolicGraph = require('./ui/metgraph.js');
const UTIL = require('./util.js');

let refba = null;

function initUI() {
	let searchpanel = new SearchPanel(document.body);
	let reactionlist = new ReactionList(document.body);
	let metgraph = new MetabolicGraph(document.body);

	searchpanel.onsearch = function(list) {
		reactionlist.setReactions(list);
		metgraph.setReactions(list);
	}

	reactionlist.onedit = function(r) {
		if (refba) clearTimeout(refba);
		refba = setTimeout(function() {
			refba = null;
			let m = window.model;
			/*FBA.run(m, m.objective, function(objective, results) {
				for (var x in results) {
					m.getReactionById(x).flux = results[x];
				}
				console.log("Objective: ", objective);
			});*/
			doFBA(m)
		}, 2000);
	}
	//reactionlist.setReactions(["R_PSP"]);
}

function doFBA(m, cb) {
	FBA.run(m, m.objective, function(objective, results) {

		if (typeof m.objective == "object") {
		let ol = m.objective.lower;
		let ou = m.objective.upper;
		m.objective.setConstraints(results[m.objective.id],results[m.objective.id]);
		/*m.objective.lower = results[m.objective.id];
		m.objective.upper = m.objective.lower;*/

		FBA.run(m, m.getReactionById("R_EX_photon_LPAREN_e_RPAREN_"), function(objective, results) {
			for (var x in results) {
				m.getReactionById(x).flux = results[x];
			}

			/*m.objective.lower = -999999;
			m.objective.upper = 999999;*/
			m.objective.setConstraints(ol,ou);
			console.log("Objective: ", objective);	
			if (cb) cb(objective);
		});
		} else {
			for (var x in results) {
				m.getReactionById(x).flux = results[x];
			}
			if (cb) cb(objective);
		}
	});
}

function knockout(m, gene, cb) {
	var g = m.genes[gene];
	if (!g) {
		if (cb) cb();
		return;
	}

	// Force fluxes to 0 to disable.
	for (var i=0; i<g.length; i++) {
		g[i].setConstraints(0.0,0.0);
	}

	doFBA(m, cb);
}

function lock(m, rid, p) {
	let p2 = (p !== undefined) ? p : 1.0;
	let r = (typeof rid == "string") ? m.getReactionById(rid) : rid;
	r.setConstraints(r.flux*p2,r.flux*p2);
}

function setBounds(m, rid, l, u) {
	let r = (typeof rid == "string") ? m.getReactionById(rid) : rid;
	r.setConstraints(l,u);
	//doFBA(m);
}

function addKEGGReaction(m, rid, compartment, cb) {
	KEGG.getReactionById(rid, function(data) {
		if (data) {
			console.log("KEGG", data);
		}
	});
}

function addSink(m, met) {
	var s = {};
	s[met.id] = 1;
	var nr = new SBML.Reaction("Sink_"+met.id, null, null, s, {});
	m.reactions.push(nr);
	m.index_reactions[nr.id] = nr;
	met.reactions.push(nr);
	met.index_reactions[nr.id] = nr;
	nr.name = met.name + " sink";
	nr.subsystem = "Modeling";
	nr.metabolites[met.id] = met;
	nr.setConstraints(0,999999);
	m.subsystems[nr.subsystem].addReaction(nr);
	m.addToIndex(nr.id, nr.name, nr);
}

function addTransportReaction(m, met_a, met_b, cb) {

}

function setObjectiveMetabolite(m, met_b, ratio) {

}

function create(model, cb) {
	var callback = (typeof(model) == "function") ? model : cb;
	var filename = (typeof(model) == "string") ? model : "data/iSynCJ816.xml";
	SBML.fromURL(filename, function(m) {
		window.model = m;

		// Do initial FBA
		m.objective = m.getReactionById("R_Ec_biomass_SynAuto");
		UTIL.makeAutotrophic(m,-999999,3.7);
		//m.index_reactions.R_HCO3E1.lower = -3.7;
		/*FBA.run(m, m.objective, function(objective, results) {
			for (var x in results) {
				m.getReactionById(x).flux = results[x];
			}
		});*/
		doFBA(m);

		initUI();

		if (callback) callback(m);
	});

	return {
		fba: function() {
			/*let m = window.model;
			FBA.run(m, m.objective, function(objective, results) {
				for (var x in results) {
					m.getReactionById(x).flux = results[x];
				}
				console.log("Objective: ", objective);
			});*/
			doFBA(window.model);
		},
		UTIL: UTIL,
		knockout: knockout,
		addKEGGReaction: addKEGGReaction,
		addSink: addSink,
		KEGG: KEGG,
		lock: lock,
		setBounds: setBounds
	};
}

module.exports = create;


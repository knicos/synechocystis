const SBML = require('metabolic-model');
const FBA = require('flux-balance-analysis');

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
			FBA.run(m, m.objective, function(objective, results) {
				for (var x in results) {
					m.getReactionById(x).flux = results[x];
				}
				console.log("Objective: ", objective);
			});
		}, 2000);
	}
	//reactionlist.setReactions(["R_PSP"]);
}

function create(model, cb) {
	var callback = (typeof(model) == "function") ? model : cb;
	var filename = (typeof(model) == "string") ? model : "data/iSynCJ816.xml";
	SBML.fromURL(filename, function(m) {
		window.model = m;

		// Do initial FBA
		m.objective = m.getReactionById("R_Ec_biomass_SynAuto");
		FBA.run(m, m.objective, function(objective, results) {
			for (var x in results) {
				m.getReactionById(x).flux = results[x];
			}
		});

		initUI();

		if (callback) callback(m);
	});

	return {
		fba: function() {
			let m = window.model;
			FBA.run(m, m.objective, function(objective, results) {
				for (var x in results) {
					m.getReactionById(x).flux = results[x];
				}
				console.log("Objective: ", objective);
			});
		},
		UTIL: UTIL
	};
}

module.exports = create;


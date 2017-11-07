const SBML = require('metabolic-model');
const FBA = require('flux-balance-analysis');

const SearchPanel = require('./ui/searchpanel.js');
const ReactionList = require('./ui/reactionlist.js');
const MetabolicGraph = require('./ui/metgraph.js');

function initUI() {
	let searchpanel = new SearchPanel(document.body);
	let reactionlist = new ReactionList(document.body);
	let metgraph = new MetabolicGraph(document.body);

	searchpanel.onsearch = function(list) {
		reactionlist.setReactions(list);
		metgraph.setReactions(list);
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
}

module.exports = create;


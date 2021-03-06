//const ForceGraph3D = require('3d-force-graph');
const metanal = require('../metabolite-analysis.js');

function MetabolicGraph(parent) {
	this.element = document.createElement("div");
	this.element.className = "synechocystis-graph";

	var width = 2000,
    height = 2000;
	this.svg = d3.select(this.element).append("svg")
		.attr("width", width)
		.attr("height", height);

	if (parent) parent.appendChild(this.element);

	this.element.scrollLeft = 1000;
	this.element.scrollTop = 1000;

	/*this.graph = ForceGraph3D();
	this.graph(this.element); //.graphData();
	this.graph.width(Math.floor(window.innerWidth * 0.75));
	this.graph.height(512);
	this.graph.autoColorBy("type");
	this.graph.lineOpacity(0.5);*/
	//this.graph.numDimensions(2);
	//this.graph.nodeRelSize(10);
}

const specialMetabolites = {
	"M_atp_c": true,
	"M_nad_c": true,
	"M_h_c": true,
	"M_pi_c": true,
	"M_adp_c": true,
	"M_h2o_c": true,
	"M_o2_c": true,
	"M_nadph_c": true,
	"M_co2_c": true,
	"M_nadh_c": true,

	"M_atp_x": true,
	"M_nad_x": true,
	"M_h_x": true,
	"M_pi_x": true,
	"M_adp_x": true,
	"M_h2o_x": true,
	"M_o2_x": true,
	"M_nadph_x": true,
	"M_co2_x": true,
	"M_nadh_x": true,

	"M_atp_p": true,
	"M_nad_p": true,
	"M_h_p": true,
	"M_pi_p": true,
	"M_adp_p": true,
	"M_h2o_p": true,
	"M_o2_p": true,
	"M_nadph_p": true,
	"M_co2_p": true,
	"M_nadh_p": true
};

MetabolicGraph.prototype.setReactions = function(list) {
	let reactions = [];
	let metabs = {};
	var maxmflux = 0.0;

	for (var i=0; i<list.length; i++) {
		let r = null;

		if (typeof list[i] == "string") {
			r = model.getReactionById(list[i]);
		} else {
			r = list[i];
		}

		if (!r) continue;
		reactions.push(r);

		for (var x in r.metabolites) {
			if (!specialMetabolites.hasOwnProperty(x)) {
				metabs[x] = r.metabolites[x];
				metanal.productionFlux(metabs[x]);
				if (metabs[x].flux > maxmflux) maxmflux = metabs[x].flux;	
			}
		}
	}
	var mfluxscale = 5.0 / maxmflux;

	var nodes = {};
	for (var x in metabs) {
		nodes[x] = {"id": x, "name": x, "val": 3, type: "metabolite", fullname: metabs[x].name, flux: metabs[x].flux * mfluxscale, dead: !metanal.hasProductionFlux(metabs[x])};
	}

	var links = [];
	var maxflux = 0.001;
	for (var i=0; i<reactions.length; i++) {
		if (reactions[i].flux > maxflux) maxflux = reactions[i].flux;
	}

	var fluxscale = 5.0 / maxflux;

	for (var i=0; i<reactions.length; i++) {
		let value = reactions[i].flux*fluxscale + 1;
		let blocked = Math.abs(reactions[i].flux) < 0.00000000000001;
		nodes[reactions[i].id] = {id: reactions[i].id, name: reactions[i].name, flux: reactions[i].flux, val: value, type: "reaction"};
		for (var x in reactions[i].inputs) {
			if (specialMetabolites.hasOwnProperty(x)) {
				nodes[x+reactions[i].id] = {"id": x+reactions[i].id, "name": x, "val": 3, type: "metabolite", blocked: blocked, flux: 0.0};
				links.push({source: nodes[x+reactions[i].id], target: nodes[reactions[i].id], input: true, val: value, special: true, blocked: blocked});
			} else {
				links.push({source: nodes[x], target: nodes[reactions[i].id], input: true, val: value, blocked: blocked});
			}
		}

		for (var x in reactions[i].outputs) {
			if (specialMetabolites.hasOwnProperty(x)) {
				nodes[x+reactions[i].id] = {"id": x+reactions[i].id, "name": x, "val": 3, type: "metabolite", blocked: blocked, flux: 0.0};
				links.push({source: nodes[reactions[i].id], target: nodes[x+reactions[i].id], val: value, special: true, blocked: blocked});
			} else {
				links.push({source: nodes[reactions[i].id], target: nodes[x], val: value, blocked: blocked});
			}
		}
	}

	//console.log(nodes, links);
	this.graphData({nodes: nodes, links: links});
}

MetabolicGraph.prototype.graphData = function(data) {
	var width = 2000,
    height = 2000;

	var force = d3.layout.force()
		.nodes(d3.values(data.nodes))
		.links(data.links)
		.size([width, height])
		.linkDistance(60)
		.charge(-300)
		.on("tick", tick)
		.start();

	let svg = this.svg;

	svg.selectAll("*").remove();

	// build the arrow.
	svg.append("svg:defs").selectAll("marker")
		.data(["end"])      // Different link/path types can be defined here
	  .enter().append("svg:marker")    // This section adds in the arrows
		.attr("id", String)
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 15)
		.attr("refY", -1.5)
		.attr("markerWidth", 8)
		.attr("markerHeight", 8)
		.attr("markerUnits","userSpaceOnUse")
		//.attr("style","stroke-width: 3px")
		//.attr("style", "stroke-width: 1.5px")
		.attr("orient", "auto")
	  .append("svg:path")
		.attr("d", "M0,-5L10,0L0,5");


	// add the links and the arrows
	var path = svg.append("svg:g").selectAll("path")
		.data(force.links())
	  .enter().append("svg:path")
	//    .attr("class", function(d) { return "link " + d.type; })
		.attr("class", function(d) { return ((d.special) ? "link special" : "link") + ((d.blocked) ? " blocked" : ""); })
		.attr("style", function(d) { return "stroke-width: " + Math.round(d.val) + "px"; })
		.attr("marker-end", function(d) { return (d.input) ? "" : "url(#end)"; });

	// define the nodes
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", function(d) { return ((d.special) ? "node special" : "node") + " " + d.type + ((d.blocked) ? " blocked" : "") + ((d.dead) ? " dead" : ""); })
		.call(force.drag);

	// add the nodes
	node.append("circle")
		.attr("r", function(d) { return (d.type == "metabolite") ? 6 + Math.floor(d.flux*4) : 2; })
		.attr("title", function(d) { return d.name; })
		.append("title").text(function(d) { return (d.type == "metabolite" && d.fullname) ? d.fullname : d.name; });

	// add the text 
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return (d.type == "metabolite") ? d.name.substring(2) : ""; });

	// add the curvy lines
	function tick() {
		path.attr("d", function(d) {
		    var dx = d.target.x - d.source.x,
		        dy = d.target.y - d.source.y,
		        dr = Math.sqrt(dx * dx + dy * dy);
		    return "M" + 
		        d.source.x + "," + 
		        d.source.y + "A" + 
		        dr + "," + dr + " 0 0," + ((d.input) ? "0" : "1") + " " + 
		        d.target.x + "," + 
		        d.target.y;
		});

		node
		    .attr("transform", function(d) { 
	  	    return "translate(" + d.x + "," + d.y + ")"; });
	}
}

module.exports = MetabolicGraph;



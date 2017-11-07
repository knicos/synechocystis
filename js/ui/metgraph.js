//const ForceGraph3D = require('3d-force-graph');

function MetabolicGraph(parent) {
	this.element = document.createElement("div");
	this.element.className = "synechocystis-graph";

	var width = 960,
    height = 500;
	this.svg = d3.select(this.element).append("svg")
		.attr("width", width)
		.attr("height", height);

	if (parent) parent.appendChild(this.element);

	/*this.graph = ForceGraph3D();
	this.graph(this.element); //.graphData();
	this.graph.width(Math.floor(window.innerWidth * 0.75));
	this.graph.height(512);
	this.graph.autoColorBy("type");
	this.graph.lineOpacity(0.5);*/
	//this.graph.numDimensions(2);
	//this.graph.nodeRelSize(10);
}

MetabolicGraph.prototype.setReactions = function(list) {
	let reactions = [];
	let metabs = {};

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
			metabs[x] = r.metabolites[x];
		}
	}

	var nodes = {};
	for (var x in metabs) {
		nodes[x] = {"id": x, "name": x, "val": 3, type: "metabolite"};
	}

	var links = [];
	var maxflux = 0.001;
	for (var i=0; i<reactions.length; i++) {
		if (reactions[i].flux > maxflux) maxflux = reactions[i].flux;
	}

	var fluxscale = 10.0 / maxflux;

	for (var i=0; i<reactions.length; i++) {
		nodes[reactions[i].id] = {id: reactions[i].id, name: reactions[i].name, flux: reactions[i].flux, val: reactions[i].flux*fluxscale + 5, type: "reaction"};
		for (var x in reactions[i].inputs) {
			links.push({source: nodes[x], target: nodes[reactions[i].id]});
		}

		for (var x in reactions[i].outputs) {
			links.push({source: nodes[reactions[i].id], target: nodes[x]});
		}
	}

	this.graphData({nodes: nodes, links: links});
}

MetabolicGraph.prototype.graphData = function(data) {
	var width = 960,
    height = 500;

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
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
	  .append("svg:path")
		.attr("d", "M0,-5L10,0L0,5");

	// add the links and the arrows
	var path = svg.append("svg:g").selectAll("path")
		.data(force.links())
	  .enter().append("svg:path")
	//    .attr("class", function(d) { return "link " + d.type; })
		.attr("class", "link")
		.attr("marker-end", "url(#end)");

	// define the nodes
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", function(d) { return "node " + d.type; })
		.call(force.drag);

	// add the nodes
	node.append("circle")
		.attr("r", function(d) { return Math.floor(d.val); });

	// add the text 
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return (d.type == "metabolite") ? d.name.substring(2) : "" + d.flux.toFixed(2); });

	// add the curvy lines
	function tick() {
		path.attr("d", function(d) {
		    var dx = d.target.x - d.source.x,
		        dy = d.target.y - d.source.y,
		        dr = Math.sqrt(dx * dx + dy * dy);
		    return "M" + 
		        d.source.x + "," + 
		        d.source.y + "A" + 
		        dr + "," + dr + " 0 0,1 " + 
		        d.target.x + "," + 
		        d.target.y;
		});

		node
		    .attr("transform", function(d) { 
	  	    return "translate(" + d.x + "," + d.y + ")"; });
	}
}

module.exports = MetabolicGraph;



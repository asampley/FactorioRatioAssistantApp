factorio.Recipe = function(json) {
	this.category = json.category; /* MachineClass */
	assert(Object.keys(json.products).length == 1, "Only recipes with one output are currently supported")
	this.output = json.products; /* { name : amount (fraction) } */
	this.energy = json.energy; /* Fraction */
	this.inputs = json.ingredients; /* { name : amount (fraction), ... } */
}

factorio.Recipe.prototype.toString = function() {
	return "(" + this.output.toString() +  ") <- " + this.inputs.toString();
}

factorio.Recipe.prototype.outputItem = function() {
	return Object.keys(this.output)[0];
}

factorio.Recipe.prototype.outputCount = function() {
	return Object.values(this.output)[0];
}

/* This may need to be multiplied by a machine speed to be accurate */
factorio.Recipe.prototype.outputCountPerSec = function() {
	return this.outputCount().div(this.energy);
}

factorio.Recipe.prototype.inputItems = function() {
	return Object.keys(this.inputs);
}

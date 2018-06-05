factorio.Recipe = function(json) {
	this.category = json.category; /* MachineClass */
	assert(json.products.length == 1, "Only recipes with one output are currently supported")
	this.output = json.products[0]; /* { name : amount (fraction) } */
	this.energy = new Fraction(json.energy); /* Fraction */
	this.inputs = json.ingredients; /* [ { name : amount (fraction) }, ... ] */
}

factorio.Recipe.prototype.toString = function() {
	return "(" + this.output.toString() +  ") <- " + this.inputs.toString();
}

factorio.Recipe.prototype.outputItem = function() {
	return Object.keys(this.output)[0];
}

factorio.Recipe.prototype.outputCount = function() {
	return this.output[this.outputItem()];
}

/* This may need to be multiplied by a machine speed to be accurate */
factorio.Recipe.prototype.outputCountPerSec = function() {
	return this.outputCount().divide(this.time);
}

factorio.Recipe.prototype.inputItems = function() {
	return this.inputs.map( input => Object.keys(input)[0] );
}

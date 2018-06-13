factorio.Recipe = function(json) {
	this.category = json.category; /* MachineClass */
	assert(json.products.length == 1, "Only recipes with one output are currently supported")
	this.output = json.products[0]; /* { name: string, amount: fraction } */
	this.energy = json.energy; /* Fraction */
	this.inputs = json.ingredients; /* [{ name: string, amount: fraction }, ...] */
}

factorio.Recipe.prototype.toString = function() {
	return "(" + this.output.toString() +  ") <- " + this.inputs.toString();
}

factorio.Recipe.prototype.outputItem = function() {
	return this.output.name;
}

factorio.Recipe.prototype.outputCount = function() {
	return this.output.amount;
}

/* This may need to be multiplied by a machine speed to be accurate */
factorio.Recipe.prototype.outputCountPerSec = function() {
	return this.outputCount().div(this.energy);
}

factorio.Recipe.prototype.inputItems = function() {
	return this.inputs.map(a => a.name);
}

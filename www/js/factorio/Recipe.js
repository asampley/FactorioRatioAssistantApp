factorio.Recipe = function(machineClass, outputItemName, outputAmount, time, inputItemsNames, inputAmounts) {
	this.machineClass = machineClass; /* MachineClass */
	this.output = {}; /* Item Name: Fraction */
	this.output[outputItemName] = outputAmount;
	this.time = time; /* Fraction */
	this.inputs = {}; /* Item Name: Fraction */

	assert(inputItemsNames.length == inputAmounts.length, "Number of inputs and amounts do not add up");
	for (var i = 0; i < inputItemsNames.length; ++i) {
		this.inputs[inputItemsNames[i]] = inputAmounts[i];
	}
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
	return Object.keys(this.inputs);
}
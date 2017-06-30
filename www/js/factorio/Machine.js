factorio.Machine = function(machineClass, level, recipe) {
	this.machineClass = machineClass; /* MachineClass */
	this.level = level; /* integer */
	this.recipe = recipe; /* Recipe */
}

factorio.Machine.prototype.speed = function() {
	return this.machineClass.speed(this.level);
}

factorio.Machine.prototype.time = function() {
	return this.recipe.time.divide(this.speed());
}

factorio.Machine.prototype.toString = function() {
	return this.name() + " [" + this.time().toFloat() + "s] (" + this.recipe().output + ")";
}

factorio.Machine.prototype.outputCountPerSec = function() {
	return this.recipe.outputCountPerSec().multiply(this.speed());
}

factorio.Machine.prototype.name = function() {
	return this.machineClass.name(this.level);
}
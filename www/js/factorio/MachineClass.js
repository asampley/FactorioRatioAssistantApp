factorio.MachineClass = function(className, names, speeds) {
	this.className = className; /* String */
	this.names = names; /* String list */
	this.speeds = speeds; /* Fraction list */
}

factorio.MachineClass.prototype.hasLevel = function(level) {
	return this.names.length > level && this.speeds.length > level;
}

factorio.MachineClass.prototype.speed = function(level) {
	if (!this.hasLevel(level)) {
		throw "Level out of bounds";
	}

	return this.speeds[level];
}

factorio.MachineClass.prototype.name = function(level) {
	if (!this.hasLevel(level)) {
		throw "Level out of bounds";
	}

	return this.names[level];
}

factorio.MachineClass.prototype.toString = function() {
	return this.className;
}

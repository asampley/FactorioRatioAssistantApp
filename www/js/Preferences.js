Preferences = function(ratioSolver, fileName, raw = {}, machineLevels = {}, beltLevel = 0) {
	this.ratioSolver = ratioSolver;
	this.raw = raw;
	this.machineLevels = machineLevels;
	this.beltLevel = beltLevel;
	this.mod = undefined;
	this.fileName = fileName;
}

Preferences.fromJSON = function(ratioSolver, fileName, onDone, onError = function(error) {console.error(error)}) 
{
	var pref = new Preferences(ratioSolver, fileName);

	fileutil.readTextPersistent(
		fileName,
		function(text) {
			try {
				var obj = JSON.parse(text);
			} catch (err) {
				onError(err);
			}
			Object.assign(pref, obj);
			onDone(pref);
		}, 
		onError, 
		onError
	);
}

Preferences.prototype.save = function() {
	obj = {}
	obj.raw = this.raw;
	obj.machineLevels = this.machineLevels;
	obj.beltLevel = this.beltLevel;
	obj.mod = this.mod;

	fileutil.writeTextPersistent(
		this.fileName,
		JSON.stringify(obj)
	);
}

Preferences.prototype.inherit = function() {
	this.raw = this.ratioSolver.raw;
	this.machineLevels = this.ratioSolver.machineLevels;
	this.beltLevel = this.ratioSolver.beltLevel;
}

Preferences.prototype.apply = function() {
	for (item in this.raw) {
		var raw = this.raw[item] ? true : false;

		try {
			this.ratioSolver.setRaw(item, raw);
		} catch (err) {
			console.warn(err);
		}
	}

	for (machine in this.machineLevels) {
		try {
			this.ratioSolver.setMachineLevel(machine, this.machineLevels[machine]);
		} catch (err) {
			console.warn(err);
		}
	}

	this.ratioSolver.beltLevel = this.beltLevel;
}

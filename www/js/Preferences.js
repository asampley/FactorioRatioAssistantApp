Preferences = function(ratioSolver, fileName, raw = {}, machineLevels = {}) {
	this.ratioSolver = ratioSolver;
	this.raw = raw;
	this.machineLevels = machineLevels;
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

	fileutil.writeTextPersistent(
		this.fileName,
		JSON.stringify(obj)
	);
}

Preferences.prototype.inherit = function() {
	this.raw = this.ratioSolver.raw;
	this.machineLevels = this.ratioSolver.machineLevels;
}

Preferences.prototype.apply = function() {
	for (item in this.raw) {
		if (this.raw[item]) {
			this.ratioSolver.setRaw(item, true);
		} else {
			this.ratioSolver.setRaw(item, false);
		}
	}

	for (machine in this.machineLevels) {
		this.ratioSolver.setMachineLevel(machine, this.machineLevels[machine]);
	}
}
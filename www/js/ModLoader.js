var ModLoader = function(mods, onModsLoaded = function(){}) {
	this.mods = mods;
	this.modStatus = {};

	this.onModsLoaded = onModsLoaded;

	this.reset();
}

ModLoader.prototype.reset = function() {
	this._environment = new factorio.Environment();
	this.modStatus = {};

	for (var modName in this.mods) {
		this.modStatus[modName] = {
			overall: 0,
			items: 0,
			machines: {status : 0},
			recipes: {status : 0}
		}
	}
}

ModLoader.prototype.environment = function() { return this._environment }

ModLoader.prototype.loadMods = function() {
	for (var modName in this.mods) {
		this.loadMod(modName, this.mods[modName]);
	}
}

ModLoader.prototype.loadMod = function(modName, modVersion) {
	this.updateModStatusAndContinue(modName, modVersion);
}

ModLoader.prototype.updateModStatusAndContinue = function(modName, modVersion) {
	var modString = modName + ' ' + modVersion;

	if (this.modStatus[modName].items == 0) {
		console.log('Loading items from ' + modString);
		this.loadItemsFromMod(modName, modVersion);
	}
	if (this.modStatus[modName].machines.status == 0) {
		console.log('Loading machines from ' + modString);
		this.loadMachineClassesFromMod(modName, modVersion);
	}
	if (this.modStatus[modName].recipes.status == 0 
		&& this.modStatus[modName].items == 2 
		&& this.modStatus[modName].machines.status == 2) {
		console.log('Loading recipes from ' + modString);
		this.loadRecipesFromMod(modName, modVersion);
	}
	if (this.modStatus[modName].recipes.status == 2
		&& this.modStatus[modName].items == 2 
		&& this.modStatus[modName].machines.status == 2) {
		this.modStatus[modName].overall = 2;
		console.log('Done loading mod ' + modString);

		var done = true;
		for (var modName in this.modStatus) {
			if (this.modStatus[modName].overall != 2) {
				done = false;
				break;
			}
		}

		if (done) {
			this.onModsLoaded();
		}
	}
}

ModLoader.prototype.loadItemsFromMod = function(modName, modVersion) {
	var self = this;
	
	self.modStatus[modName].items = 1;
	self.updateModStatusAndContinue(modName, modVersion);

	fileutil.readTextAppWWW(
		'mods/' + modName + '/' + modVersion + '/items.txt', 
		function(text) {
			var lines = text.split('\n');
			for (var i = 0; i < lines.length; ++i) {
				var item = lines[i].trim();
				if (item.length == 0) continue;
				self._environment.addItem(item, 'mods/' + modName + '/img/' + item + '.png');
			}

			self.modStatus[modName].items = 2;
			self.updateModStatusAndContinue(modName, modVersion);
		},
		function(error) {
			console.log(error);
			self.modStatus[modName].items = -1;
			self.updateModStatusAndContinue(modName, modVersion);
		}
	);
}

ModLoader.prototype.loadMachineClassesFromMod = function(modName, modVersion) {
	var self = this;
	self.modStatus[modName].machines.status = 1;
	self.updateModStatusAndContinue(modName, modVersion);

	fileutil.readTextAppWWW(
		'mods/' + modName + '/' + modVersion + '/machines.txt',
		function(text) {
			var lines = text.split('\n');

			var nMachines = 0;
			var machineDef = [];

			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				++nMachines;

				machineDef.push([modName, modVersion, line]);
			}

			self.modStatus[modName].machines.done = 0;
			self.modStatus[modName].machines.total = nMachines;

			if (nMachines == 0) {
				self.modStatus[modName].machines.status = 2;
				self.updateModStatusAndContinue(modName, modVersion);
			} else {
				for (var i = 0; i < machineDef.length; ++i) {
					self.loadMachineClassFromMod.apply(self, machineDef[i]);
				}
			}
		},
		function(error) {
			console.log(error);
			self.modStatus[modName].machines.status = -1;
			self.updateModStatusAndContinue(modName, modVersion);
		}
	);
}

ModLoader.prototype.loadMachineClassFromMod = function(modName, modVersion, machineName) {
	var self = this;
	var machineClassPath = 'mods/' + modName + '/' + modVersion + '/machine/' + machineName;
	fileutil.readTextAppWWW(
		machineClassPath,
		function(text) {
			var lines = text.split('\n');

			var names = [];
			var speeds = [];

			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				var split = line.split(':');
				assert(split.length == 2, "Invalid Syntax: No ':' on line " + i + " of " + machineClassPath);

				names.push(split[0].trim());
				speeds.push(Fraction.parse(split[1].trim()));
			}

			var machineClass = new factorio.MachineClass(machineName, names, speeds);
			self._environment.addMachineClass(machineClass);

			++self.modStatus[modName].machines.done;
			if (self.modStatus[modName].machines.total == self.modStatus[modName].machines.done){
				self.modStatus[modName].machines.status = 2;
				self.updateModStatusAndContinue(modName, modVersion);
			}
		},
		function(error) {
			console.log(error);
		}
	);
}

ModLoader.prototype.loadRecipesFromMod = function(modName, modVersion) {
	var self = this;
	var recipesPath = 'mods/' + modName + '/' + modVersion + '/recipes.txt';
	self.modStatus[modName].recipes.status = 1;
	self.updateModStatusAndContinue(modName, modVersion);

	fileutil.readTextAppWWW(
		recipesPath,
		function(text) {
			var lines = text.split('\n');

			var machineName = null;

			var nRecipes = 0;

			recipeDef = [];
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				if (line.startsWith('#')) {
					machineName = line.substring(1).trim();
					assert(self._environment.hasMachineClass(machineName), "Invalid machine name: " + machineName + " in " + recipesPath);
					continue;
				}

				assert(machineName != null, "Invalid Syntax in '" + recipesPath + "': No machine specified at start.");

				++nRecipes;

				recipeDef.push([modName, modVersion, machineName, line]);
			}

			self.modStatus[modName].recipes.done = 0;
			self.modStatus[modName].recipes.total = nRecipes;

			if (nRecipes == 0) {
				self.modStatus[modName].recipes.status = 2;
				self.updateModStatusAndContinue(modName, modVersion);
			} else {
				for (var i = 0; i < recipeDef.length; ++i) {
					self.loadRecipeFromMod.apply(self, recipeDef[i]);
				}
			}
		},
		function(error) {
			console.log(error);
			self.modStatus[modName].recipes.status = -1;
			self.updateModStatusAndContinue(modName, modVersion);
		}
	);
}

ModLoader.prototype.loadRecipeFromMod = function(modName, modVersion, machineName, outputName) {
	var self = this;
	var path = 'mods/' + modName + '/' + modVersion + '/recipes/' + machineName + '/' + outputName;
	fileutil.readTextAppWWW(
		path,
		function(text) {
			var lines = text.split('\n');
			var time = Fraction.parse(lines[0]);

			var outputLineParts = lines[1].split(':');
			assert(outputLineParts.length >= 2, "Invalid Syntax: No ':' found in " + path + " line 1");

			var outputItem = outputLineParts[0].trim();
			var outputCount = Fraction.parse(outputLineParts[1].trim());

			var inputItems = [];
			var inputAmounts = [];
			for (var i = 2; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				var split = line.split(':');

				assert(split.length >= 2, "Invalid Syntax: No ':' found in " + path + " line" + i);
				inputItems.push(split[0].trim());
				inputAmounts.push(Fraction.parse(split[1]));
			}

			try {
				self._environment.addRecipe(
					new factorio.Recipe(
						self._environment.getMachineClass(machineName),
						outputItem,
						outputCount,
						time,
						inputItems,
						inputAmounts
					)
				);
			} catch (error) {
				console.error("Error in '" + path + "': " + error);
			}

			++self.modStatus[modName].recipes.done;
			if (self.modStatus[modName].recipes.done == self.modStatus[modName].recipes.total) {
				self.modStatus[modName].recipes.status = 2;
				self.updateModStatusAndContinue(modName, modVersion);
			}
		},
		function(error) {
			console.log(error);
		}
	);
}
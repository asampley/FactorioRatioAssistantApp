var ModLoader = function(environment, mods, onModsLoaded = function(){}) {
	this.environment = environment;
	this.mods = mods;
	this.modStatus = {};

	this.onModsLoaded = onModsLoaded;

	for (var i = 0; i < mods.length; ++i) {
		this.modStatus[mods[i].name] = {
			overall: 0,
			items: 0,
			machines: 0,
			recipes: {status : 0}
		}
	}
}

ModLoader.prototype.loadMods = function() {
	for (var i = 0; i < this.mods.length; ++i) {
		var mod = this.mods[i];

		this.loadMod(mod);
	}
}

ModLoader.prototype.loadMod = function(mod) {
	this.updateModStatusAndContinue(mod);
}

ModLoader.prototype.updateModStatusAndContinue = function(mod) {
	var modString = mod.name + ' ' + mod.version;

	if (this.modStatus[mod.name].items == 0) {
		console.log('Loading items from ' + modString);
		this.loadItemsFromMod(mod);
	}
	if (this.modStatus[mod.name].machines == 0) {
		console.log('Loading machines from ' + modString);
		this.loadMachineClassesFromMod(mod);
	}
	if (this.modStatus[mod.name].recipes.status == 0 
		&& this.modStatus[mod.name].items == 2 
		&& this.modStatus[mod.name].machines == 2) {
		console.log('Loading recipes from ' + modString);
		this.loadRecipesFromMod(mod);
	}
	if (this.modStatus[mod.name].recipes.status == 2
		&& this.modStatus[mod.name].items == 2 
		&& this.modStatus[mod.name].machines == 2) {
		this.modStatus[mod.name].overall = 2;
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

ModLoader.prototype.loadItemsFromMod = function(mod) {
	var self = this;
	
	self.modStatus[mod.name].items = 1;
	self.updateModStatusAndContinue(mod);

	fileutil.readTextAppWWW(
		'mods/' + mod.name + '/' + mod.version + '/items.txt', 
		function(text) {
			var lines = text.split('\n');
			for (var i = 0; i < lines.length; ++i) {
				var item = lines[i].trim();
				if (item.length == 0) continue;
				self.environment.addItem(item, 'mods/' + mod.name + '/img/' + item + '.png');
			}

			self.modStatus[mod.name].items = 2;
			self.updateModStatusAndContinue(mod);
		},
		function(error) {
			console.log(error);
			self.modStatus[mod.name].items = -1;
			self.updateModStatusAndContinue(mod);
		}
	);
}

ModLoader.prototype.loadMachineClassesFromMod = function(mod) {
	var self = this;
	self.modStatus[mod.name].machines = 1;
	self.updateModStatusAndContinue(mod);

	fileutil.readTextAppWWW(
		'mods/' + mod.name + '/' + mod.version + '/machines.txt',
		function(text) {
			var lines = text.split('\n');

			var nMachines = 0;

			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				++nMachines;

				self.loadMachineClassFromMod(mod, line);
			}

			self.modStatus[mod.name].machines.done = 0;
			self.modStatus[mod.name].machines.total = nMachines;
		},
		function(error) {
			console.log(error);
			self.modStatus[mod.name].machines = -1;
			self.updateModStatusAndContinue(mod);
		}
	);
}

ModLoader.prototype.loadMachineClassFromMod = function(mod, machineName) {
	var self = this;
	var machineClassPath = 'mods/' + mod.name + '/' + mod.version + '/machine/' + machineName;
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
			self.environment.addMachineClass(machineClass);

			++self.modStatus[mod.name].machines.done;
			if (self.modStatus[mod.name].machines.total == self.modStatus[mod.name].machines.done){
				self.modStatus[mod.name].machines = 2;
				self.updateModStatusAndContinue(mod);
			}
		},
		function(error) {
			console.log(error);
		}
	);
}

ModLoader.prototype.loadRecipesFromMod = function(mod) {
	var self = this;
	var recipesPath = 'mods/' + mod.name + '/' + mod.version + '/recipes.txt';
	self.modStatus[mod.name].recipes.status = 1;
	self.updateModStatusAndContinue(mod);

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
					assert(self.environment.hasMachineClass(machineName), "Invalid machine name: " + machineName + " in " + recipesPath);
					continue;
				}

				assert(machineName != null, "Invalid Syntax in '" + recipesPath + "': No machine specified at start.");

				++nRecipes;

				recipeDef.push([mod, machineName, line]);
			}

			self.modStatus[mod.name].recipes.done = 0;
			self.modStatus[mod.name].recipes.total = nRecipes;

			for (var i = 0; i < recipeDef.length; ++i) {
				self.loadRecipeFromMod.apply(self, recipeDef[i]);
			}
		},
		function(error) {
			console.log(error);
			self.modStatus[mod.name].recipes.status = -1;
			self.updateModStatusAndContinue(mod);
		}
	);
}

ModLoader.prototype.loadRecipeFromMod = function(mod, machineName, outputName) {
	var self = this;
	var path = 'mods/' + mod.name + '/' + mod.version + '/recipes/' + machineName + '/' + outputName;
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
				self.environment.addRecipe(
					new factorio.Recipe(
						self.environment.getMachineClass(machineName),
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

			++self.modStatus[mod.name].recipes.done;
			if (self.modStatus[mod.name].recipes.done == self.modStatus[mod.name].recipes.total) {
				self.modStatus[mod.name].recipes.status = 2;
				self.updateModStatusAndContinue(mod);
			}
		},
		function(error) {
			console.log(error);
		}
	);
}
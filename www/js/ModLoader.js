var ModLoader = function(environment, mods) {
	this.environment = environment;
	this.mods = mods;
	this.modStatus = {};

	for (var i = 0; i < mods.length; ++i) {
		this.modStatus[mods[i]] = {
			items: 0,
			machines: 0,
			recipes: 0,
		}
	}
}

ModLoader.prototype.loadMods = function() {
	for (var i = 0; i < this.mods.length; ++i) {
		var modName = this.mods[i];

		this.loadMod(modName);
	}
}

ModLoader.prototype.loadMod = function(modName) {
	this.updateModStatusAndContinue(modName);
}

ModLoader.prototype.updateModStatusAndContinue = function(modName) {
	if (this.modStatus[modName].items == 0) {
		this.loadItemsFromMod(modName);
	}
	if (this.modStatus[modName].machines == 0) {
		this.loadMachineClassesFromMod(modName);
	}
	if (this.modStatus[modName].recipes == 0 
		&& this.modStatus[modName].items == 2 
		&& this.modStatus[modName].machines == 2) {
		this.loadRecipesFromMod(modName);
	}
}

ModLoader.prototype.loadItemsFromMod = function(modName) {
	var self = this;
	
	self.modStatus[modName].items = 1;
	self.updateModStatusAndContinue(modName);

	fileutil.readTextAppWWW(
		'mods/' + modName + '/items.txt', 
		function(text) {
			var lines = text.split('\n');
			for (var i = 0; i < lines.length; ++i) {
				var item = lines[i].trim();
				if (item.length == 0) continue;
				self.environment.addItem(item, 'mods/' + modName + '/img/' + item + '.png');
			}

			self.modStatus[modName].items = 2;
			self.updateModStatusAndContinue(modName);
		},
		function(error) {
			console.log(error);
			self.modStatus[modName].items = -1;
			self.updateModStatusAndContinue(modName);
		}
	);
}

ModLoader.prototype.loadMachineClassesFromMod = function(modName) {
	var self = this;
	self.modStatus[modName].machines = 1;
	self.updateModStatusAndContinue(modName);

	fileutil.readTextAppWWW(
		'mods/' + modName + '/machines.txt',
		function(text) {
			var lines = text.split('\n');

			var nMachines = 0;

			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				++nMachines;

				self.loadMachineClassFromMod(modName, line);
			}

			self.modStatus[modName].machines.done = 0;
			self.modStatus[modName].machines.total = nMachines;
		},
		function(error) {
			console.log(error);
			self.modStatus[modName].machines = -1;
			self.updateModStatusAndContinue(modName);
		}
	);
}

ModLoader.prototype.loadMachineClassFromMod = function(modName, machineName) {
	var self = this;
	var machineClassPath = 'mods/' + modName + '/machine/' + machineName;
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

			++self.modStatus[modName].machines.done;
			if (self.modStatus[modName].machines.total == self.modStatus[modName].machines.done){
				self.modStatus[modName].machines = 2;
				self.updateModStatusAndContinue(modName);
			}
		},
		function(error) {
			console.log(error);
		}
	);
}

ModLoader.prototype.loadRecipesFromMod = function(modName) {
	var self = this;
	var recipesPath = 'mods/' + modName + '/recipes.txt';
	self.modStatus[modName].recipes = 1;
	self.updateModStatusAndContinue(modName);

	fileutil.readTextAppWWW(
		recipesPath,
		function(text) {
			var lines = text.split('\n');

			var machineName = null;

			var nRecipes = 0;

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

				self.loadRecipeFromMod(modName, machineName, line);
			}

			self.modStatus[modName].recipes.done = 0;
			self.modStatus[modName].recipes.total = nRecipes;
		},
		function(error) {
			console.log(error);
			self.modStatus[modName].recipes = -1;
			self.updateModStatusAndContinue(modName);
		}
	);
}

ModLoader.prototype.loadRecipeFromMod = function(modName, machineName, outputName) {
	var self = this;
	var path = 'mods/' + modName + '/recipes/' + machineName + '/' + outputName;
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

			++self.modStatus[modName].recipes.done;
			if (self.modStatus[modName].recipes.done == self.modStatus[modName].recipes.total) {
				self.modStatus[modName].recipes = 2;
				self.updateModStatusAndContinue(modName);
			}
		},
		function(error) {
			console.log(error);
		}
	);
}
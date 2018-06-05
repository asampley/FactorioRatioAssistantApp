var ModLoader = function(mod, onModLoaded = function(){}) {
	this.mod = mod;
	this.modStatus = {};

	this.onModLoaded = onModLoaded;

	this.reset();
}

ModLoader.prototype.reset = function() {
	this._environment = new factorio.Environment();
	this.modStatus = {};

	this.modStatus = {
		overall: 0,
		items: 0,
		fluids: 0,
		machines: 0,
		recipes: 0,
		belts: 0
	}
}

ModLoader.prototype.environment = function() { return this._environment }

ModLoader.prototype.loadMod = function() {
	this.updateModStatusAndContinue();
}

ModLoader.prototype.updateModStatusAndContinue = function() {
	if (this.modStatus.items == 0) {
		console.log('Loading items from ' + this.mod);
		this.loadItems();
	}
	if (this.modStatus.fluids == 0) {
		console.log('Loading fluids from ' + this.mod);
		this.loadFluids();
	}
	if (this.modStatus.machines == 0) {
		console.log('Loading machines from ' + this.mod);
		this.loadMachines();
	}
	if (this.modStatus.recipes == 0 
		&& this.modStatus.items == 2
	        && this.modStatus.fluids == 2	
		&& this.modStatus.machines == 2) {
		console.log('Loading recipes from ' + this.mod);
		this.loadRecipes();
	}
	if (this.modStatus.belts == 0) {
		console.log('Loading belts from ' + this.mod);
		this.loadBelts();
	}
	if (this.modStatus.recipes == 2
		&& this.modStatus.items == 2 
		&& this.modStatus.fluids == 2
		&& this.modStatus.machines == 2
		&& this.modStatus.belts == 2
		&& this.modStatus.overall != 2) {
		this.modStatus.overall = 2;
		console.log('Done loading mod ' + this.mod);

		this.onModLoaded();
	}
}

ModLoader.prototype.loadItems = function() {
	var self = this;
	
	self.modStatus.items = 1;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/items.txt', 
		function(text) {
			var items = JSON.parse(text);
			for (var item in items) {
				self._environment.addItem(item, 'mods/' + self.mod + '/img/' + item + '.png');
			}

			self.modStatus.items = 2;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.items = 2;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadFluids = function() {
	var self = this;
	
	self.modStatus.fluids = 1;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/fluids.txt', 
		function(text) {
			var fluids = JSON.parse(text);
			for (var fluid in fluids) {
				self._environment.addItem(fluid, 'mods/' + self.mod + '/img/' + fluid + '.png');
			}

			self.modStatus.fluids = 2;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.fluids = 2;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadMachines = function() {
	var self = this;
	self.modStatus.machines = 1;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/machines.txt',
		function(text) {
			var machines = JSON.parse(text);

			category_machines = {}
			for (var mname in machines) {
				for (var categoryi in machines[mname].crafting_categories) {
					category = machines[mname].crafting_categories[categoryi]
					if (!(category in category_machines)) {
						category_machines[category] = { names: [], speeds: [] };
					}
					category_machines[category].names.push(mname);
					category_machines[category].speeds.push(machines[mname].speed);
				}
			}


			for (var category in category_machines) {
				var machineClass = new factorio.MachineClass(category, category_machines[category].names, category_machines[category].speeds);
				self._environment.addMachineClass(machineClass)
			}

			self.modStatus.machines = 2;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.machines = 2;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadRecipes = function() {
	var self = this;
	var recipesPath = 'mods/' + this.mod + '/recipes.txt';
	self.modStatus.recipes = 1;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		recipesPath,
		function(text) {
			var recipes = JSON.parse(text);

			for (var rname in recipes) {
				if (recipes[rname].products.length != 1) {
					continue;
				}
				self._environment.addRecipe( new factorio.Recipe(recipes[rname]) );
			}

			self.modStatus.recipes = 2;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.recipes = 2;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadBelts = function() {
	var self = this;
	var beltsFile = 'mods/' + this.mod + '/belts.txt';

	self.modStatus.belts = 1;

	fileutil.readTextAppWWW(
		beltsFile,
		function(text) {
			// TODO

			/*
			var lines = text.split('\n');

			var names = [];
			var itemsPerSec = [];

			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i].trim();
				if (line.length == 0) continue;

				var split = line.split(':');
				assert(split.length == 2, "Invalid Syntax: No ':' on line " + i + " of " + beltsFile);

				name = split[0].trim();
				itemsPerSec = Fraction.parse(split[1].trim());

				var belt = new factorio.Belt(name, itemsPerSec);
				self.environment().addBelt(belt);
			}
			*/

			self.modStatus.belts = 2;
			self.updateModStatusAndContinue();
		},
		function(error) {
			self.modStatus.belts = 2;
			self.updateModStatusAndContinue();
		}
	);
}

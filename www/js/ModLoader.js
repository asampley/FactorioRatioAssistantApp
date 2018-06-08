var ModLoader = function(mod, onModLoaded = function(){}) {
	this.mod = mod;
	this.modStatus = {};
	this.blacklist = {};

	this.onModLoaded = onModLoaded;

	this.reset();
}

ModLoader.prototype.STATUS = {
	NONE: 0,
	BLACKLIST_PENDING: 1,
	BLACKLIST_DONE: 2,
	PRIMARY_PENDING: 3,
	DONE: 4
}

ModLoader.prototype.JSONparse = function(json) {
	return JSON.parse(json, function (k, v) {
		if (typeof v === 'number') {
			return new Fraction(v);
		} else {
			return v;
		}
	});
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

	this.blacklist = {
		items: {},
		fluids: {},
		machines: {},
		recipes: {},
		belts: {}
	}
}

ModLoader.prototype.environment = function() { return this._environment }

ModLoader.prototype.loadMod = function() {
	this.updateModStatusAndContinue();
}

ModLoader.prototype.updateModStatusAndContinue = function() {
	if (this.modStatus.items == this.STATUS.NONE) {
		console.log('Loading items blacklist from ' + this.mod);
		this.loadBlackList('items');
	} else if (this.modStatus.items == this.STATUS.BLACKLIST_DONE) {
		console.log('Loading items from ' + this.mod);
		this.loadItems();
	}

	if (this.modStatus.fluids == this.STATUS.NONE) {
		console.log('Loading fluids blacklist from ' + this.mod);
		this.loadBlackList('fluids');
	} else if (this.modStatus.fluids == this.STATUS.BLACKLIST_DONE) {
		console.log('Loading fluids from ' + this.mod);
		this.loadFluids();
	}

	if (this.modStatus.machines == this.STATUS.NONE) {
		console.log('Loading machines blacklist from ' + this.mod);
		this.loadBlackList('machines');
	} else if (this.modStatus.machines == this.STATUS.BLACKLIST_DONE) {
		console.log('Loading machines from ' + this.mod);
		this.loadMachines();
	}

	if (this.modStatus.items == this.STATUS.DONE
		&& this.modStatus.fluids == this.STATUS.DONE
		&& this.modStatus.machines == this.STATUS.DONE) 
	{
		if (this.modStatus.recipes == this.STATUS.NONE) {
			console.log('Loading recipes blacklist from ' + this.mod);
			this.loadBlackList('recipes');
		} else if (this.modStatus.recipes == this.STATUS.BLACKLIST_DONE) {
			console.log('Loading recipes from ' + this.mod);
			this.loadRecipes();
		}
	}

	if (this.modStatus.belts == this.STATUS.NONE) {
		console.log('Loading belts blacklist from ' + this.mod);
		this.loadBlackList('belts');
	} else if (this.modStatus.belts == this.STATUS.BLACKLIST_DONE) {
		console.log('Loading belts from ' + this.mod);
		this.loadBelts();
	}
	if (this.modStatus.recipes == this.STATUS.DONE
		&& this.modStatus.items == this.STATUS.DONE
		&& this.modStatus.fluids == this.STATUS.DONE
		&& this.modStatus.machines == this.STATUS.DONE
		&& this.modStatus.belts == this.STATUS.DONE
		&& this.modStatus.overall != this.STATUS.DONE) {
		this.modStatus.overall = this.STATUS.DONE;
		console.log('Loaded mod ' + this.mod);

		this.onModLoaded();
	}
}

ModLoader.prototype.loadBlackList = function(key) {
	var self = this;

	self.modStatus[key] = this.STATUS.BLACKLIST_PENDING;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/' + key + '-blacklist.txt',
		function(text) {
			var blacklist = self.JSONparse(text);
			self.blacklist[key] = blacklist;
			self.modStatus[key] = self.STATUS.BLACKLIST_DONE;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus[key] = self.STATUS.BLACKLIST_DONE;
			self.updateModStatusAndContinue();
		}
	);			
}

ModLoader.prototype.loadItems = function() {
	var self = this;
	
	self.modStatus.items = this.STATUS.PRIMARY_PENDING;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/items.txt', 
		function(text) {
			var items = self.JSONparse(text);
			for (var item in items) {
				if (item in self.blacklist.items && self.blacklist.items[item]) continue;
				self._environment.addItem(item, 'mods/' + self.mod + '/img/' + item + '.png');
			}

			self.modStatus.items = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.items = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadFluids = function() {
	var self = this;
	
	self.modStatus.fluids = this.STATUS.PRIMARY_PENDING;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/fluids.txt', 
		function(text) {
			var fluids = self.JSONparse(text);
			for (var fluid in fluids) {
				if (fluid in self.blacklist.fluids && self.blacklist.fluids[fluid]) continue;
				self._environment.addItem(fluid, 'mods/' + self.mod + '/img/' + fluid + '.png');
			}

			self.modStatus.fluids = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.fluids = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadMachines = function() {
	var self = this;
	self.modStatus.machines = this.STATUS.PRIMARY_PENDING;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		'mods/' + self.mod + '/machines.txt',
		function(text) {
			var machines = self.JSONparse(text);

			category_machines = {}
			for (var mname in machines) {
				if (mname in self.blacklist.machines && self.blacklist.machines[mname]) continue;
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

			self.modStatus.machines = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.machines = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadRecipes = function() {
	var self = this;
	var recipesPath = 'mods/' + this.mod + '/recipes.txt';
	self.modStatus.recipes = this.STATUS.PRIMARY_PENDING;
	self.updateModStatusAndContinue();

	fileutil.readTextAppWWW(
		recipesPath,
		function(text) {
			var recipes = self.JSONparse(text);

			for (var rname in recipes) {
				if (rname in self.blacklist.recipes && self.blacklist.recipes[rname]) continue;
				if (Object.keys(recipes[rname].products).length != 1) {
					continue;
				}
				self._environment.addRecipe( new factorio.Recipe(recipes[rname]) );
			}

			self.modStatus.recipes = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.recipes = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		}
	);
}

ModLoader.prototype.loadBelts = function() {
	var self = this;
	var beltsFile = 'mods/' + this.mod + '/belts.txt';

	self.modStatus.belts = this.STATUS.PRIMARY_PENDING;

	fileutil.readTextAppWWW(
		beltsFile,
		function(text) {
			var belts = self.JSONparse(text);
			for (var belt in belts) {
				if (belt in self.blacklist.belts && self.blacklist.belts[belt]) continue;
				self._environment.addBelt(new factorio.Belt(belt, belts[belt].speed));
			}

			self.modStatus.belts = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		},
		function(error) {
			console.log(error);
			self.modStatus.belts = self.STATUS.DONE;
			self.updateModStatusAndContinue();
		}
	);
}

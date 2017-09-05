factorio.RatioSolver = function(environment) {
	this.environment = environment;
	this.raw = {};
	this.solution = {}
	this.solution.raw = {};
	this.solution.tree = {};
	this.machineLevels = {};
	this.beltLevel = 0;
	this._rawListeners = [];
	this._unrawListeners = [];
	this._machineLevelListeners = [];
	this._beltLevelListeners = [];

	var self = this;
	this.environment.addItemListener(function(item) {
		self.setRaw(item, true)
	});
	this.environment.addRecipeListener(function(recipe) {
		self.setRaw(recipe.outputItem(), false);
	});
	this.environment.addMachineClassListener(function(machineClass) {
		self.setMachineLevel(machineClass.className, 0);
	});
}

factorio.RatioSolver.prototype.setMachineLevel = function(machineClassName, level) {
	this.machineLevels[machineClassName] = level;

	for (var i = 0; i < this._machineLevelListeners.length; ++i) {
		this._machineLevelListeners[i](this.environment.machineClasses[machineClassName], level);
	}
}

factorio.RatioSolver.prototype.getMachineLevel = function(machineClassName) {
	return this.machineLevels[machineClassName];
}

factorio.RatioSolver.prototype.setBeltLevel = function(level) {
	this.beltLevel = level;

	for (var i = 0; i < this._beltLevelListeners.length; ++i) {
		this._beltLevelListeners[i](level);
	}
}

factorio.RatioSolver.prototype.getBeltLevel = function() {
	return this.beltLevel;
}

factorio.RatioSolver.prototype.solve = function(item) {
	this.solution.tree = this.solveRecurse(item, this.perSecForWhole(item));
	return this.solution.tree;
}

factorio.RatioSolver.prototype.isRaw = function(item) {
	return this.raw[item] === true;
}

factorio.RatioSolver.prototype.setRaw = function(item, isRaw = true) {
	if (!this.hasRecipe(item) && !isRaw) {
		throw "Cannot make an ingredient unraw without a recipe";
	}

	this.raw[item] = isRaw;

	var listeners = isRaw ? this._rawListeners : this._unrawListeners;

	for (var i = 0; i < listeners.length; ++i) {
		listeners[i](item);
	}
}

factorio.RatioSolver.prototype.toggleRaw = function(item) {
	this.setRaw(item, !this.isRaw(item));
}

factorio.RatioSolver.prototype.hasRecipe = function(item) {
	return item in this.environment.recipes;
};

factorio.RatioSolver.prototype.getRecipe = function(item) {
	return this.environment.recipes[item];
}

factorio.RatioSolver.prototype.solveRecurse = function(item, itemPerSec) {
	var recipe = this.getRecipe(item);

	if (recipe == null) {
		if (item in this.solution.raw) {
			this.solution.raw[item] += itemPerSec;
		} else {
			this.solution.raw[item] = itemPerSec;
		}
		var tree = new Tree({
			machine: null,
			machineCount: null,
			itemPerSec: itemPerSec,
			item: item,
			belt: null,
			beltCount: 0
		});
		if (this.environment.belts.length != 0) {
			tree.belt = this.environment.belts[this.beltLevel];
			tree.beltCount = this.environment.belts[this.beltLevel].numRequired(itemPerSec);
		}
	} else {
		var mc = recipe.machineClass;
		var machine = new factorio.Machine(mc, this.machineLevels[mc.className], recipe);
		//var machine = new factorio.Machine(mc, 0, recipe);
		var machineCount = itemPerSec.divide(machine.outputCountPerSec());
		var tree = new Tree({
			machine: machine, 
			machineCount: machineCount,
			itemPerSec: itemPerSec,
			item: item,
			belt: null,
			beltCount: 0
		});
		if (this.environment.belts.length != 0) {
			tree.belt = this.environment.belts[this.beltLevel];
			tree.beltCount = this.environment.belts[this.beltLevel].numRequired(itemPerSec);
		}
		
		/*if (machineCounts.contains(machine)) {
			machineCounts.put(machine, machineCounts.get(machine).add(machineCount));
		} else {
			machineCounts.put(machine, machineCount);
		}*/
		
		for (var item in recipe.inputs) {
			var child = this.solveRecurse(item, itemPerSec.multiply(recipe.inputs[item]).divide(recipe.outputCount()));
			if (child != null) {
				tree.addChild(child);
			}
		}
	}
	
	return tree;
}

factorio.RatioSolver.prototype.perSecForWhole = function(item) {
	var multiple = 1;
	var machinesToGo = [];

	var recipe = this.getRecipe(item);
	if (recipe == null) return new Fraction(multiple);

	var mc = recipe.machineClass;
	var machine = new factorio.Machine(mc, this.machineLevels[mc.className], recipe);
	//var machine = new factorio.Machine(mc, 0, recipe);
	var topItemPerSec = machine.outputCountPerSec();
	var itemPerSec = topItemPerSec;

	if (this.isRaw(item)) return topItemPerSec;

	machinesToGo.push([machine, itemPerSec]);

	while(machinesToGo.length != 0) {
		var pair = machinesToGo.pop();

		machine = pair[0];
		recipe = machine.recipe;
		itemPerSec = pair[1];

		machines = itemPerSec.multiply(multiple).divide(machine.outputCountPerSec());
		multiple *= machines.den;

		for (item in recipe.inputs) {
			var nextRecipe = this.getRecipe(item);

			if (nextRecipe == null || this.isRaw(item)) continue;

			var nextMc = nextRecipe.machineClass;
			var nextMachine = new factorio.Machine(nextMc, this.machineLevels[nextMc.className], nextRecipe);
			//var nextMachine = new factorio.Machine(nextMc, 0, nextRecipe);
			machinesToGo.push([nextMachine, itemPerSec.multiply(recipe.inputs[item]).divide(recipe.outputCount())])
		}
	}

	return topItemPerSec.multiply(multiple);
}

factorio.RatioSolver.prototype.addSetRawListener = function(fRaw, fUnraw) {
	this._rawListeners.push(fRaw);
	this._unrawListeners.push(fUnraw);

	for (item in this.raw) {
		if (this.isRaw(item)) {
			fRaw(item);
		} else {
			fUnraw(item);
		}
	}
}

factorio.RatioSolver.prototype.addMachineLevelListener = function(f) {
	this._machineLevelListeners.push(f);

	for (mcName in this.machineLevels) {
		f(this.environment.machineClasses[mcName], this.machineLevels[mcName]);
	}
}

factorio.RatioSolver.prototype.addBeltLevelListener = function(f) {
	this._beltLevelListeners.push(f);

	f(this.beltLevel);
}
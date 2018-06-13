factorio.RatioSolver = function(environment) {
	this.environment = environment;
	this.raw = {};
	this.solutions = []
	this.machineLevels = {};
	this._beltLevel = 0;
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
	this._beltLevel = level;

	for (var i = 0; i < this._beltLevelListeners.length; ++i) {
		this._beltLevelListeners[i](level);
	}
}

factorio.RatioSolver.prototype.getBeltLevel = function() {
	return this._beltLevel;
}

factorio.RatioSolver.prototype.push = function(item) {
	var solution = { item: item, coeff: new Fraction(1), raw: {}, tree: {} };
	var index = this.solutions.push(solution) - 1;
	return index;
}

factorio.RatioSolver.prototype.solve = function(index) {
	if (!(index in this.solutions)) {
		throw solutions + ' has no index: ' + index + '. Index should be the number returned from push(item)';
	}
	this.solutions[index].raw = {};
	this.solutions[index].tree = this.solveRecurse(index, this.solutions[index].item, new Fraction(1));
	this.solutions[index].coeff = this.perSecForWhole(this.solutions[index].item);

	return this.solutions[index].tree;
}

factorio.RatioSolver.prototype.isRaw = function(item) {
	return this.raw[item] === true;
}

factorio.RatioSolver.prototype.setRaw = function(item, isRaw = true) {
	if (!this.canSetUnraw(item) && !isRaw) {
		throw "Cannot make an ingredient unraw without a recipe";
	}

	this.raw[item] = isRaw;

	var listeners = isRaw ? this._rawListeners : this._unrawListeners;

	for (var i = 0; i < listeners.length; ++i) {
		listeners[i](item);
	}
}

factorio.RatioSolver.prototype.canSetUnraw = function(item) {
	return this.hasRecipe(item);
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

factorio.RatioSolver.prototype.solveRecurse = function(index, item, itemPerSec) {
	var recipe = this.getRecipe(item);
	var tree = null;

	if (recipe == null) {
		if (item in this.solutions[index].raw) {
			this.solutions[index].raw[item] += itemPerSec;
		} else {
			this.solutions[index].raw[item] = itemPerSec;
		}
		tree = new Tree({
			machine: null,
			machineCount: null,
			itemPerSec: itemPerSec,
			item: item,
			belt: null,
			beltCount: new Fraction(0)
		});
	} else {
		var mc = this.environment.machineClasses[recipe.category];
		var machine = new factorio.Machine(mc, this.machineLevels[mc.className], recipe);
		var machineCount = itemPerSec.div(machine.outputCountPerSec());
		tree = new Tree({
			machine: machine, 
			machineCount: machineCount,
			itemPerSec: itemPerSec,
			item: item,
			belt: null,
			beltCount: new Fraction(0)
		});
		
		/*if (machineCounts.contains(machine)) {
			machineCounts.put(machine, machineCounts.get(machine).add(machineCount));
		} else {
			machineCounts.put(machine, machineCount);
		}*/
		
		for (var i = 0; i < recipe.inputs.length; ++i) {
			var input = recipe.inputs[i];
			var child = this.solveRecurse(index, input.name, itemPerSec.mul(input.amount).div(recipe.outputCount()));
			if (child != null) {
				tree.addChild(child);
			}
		}
	}

	if (this.environment.belts.length != 0 && this.environment.hasItem(item)) {
		tree.rootValue().belt = this.environment.belts[this._beltLevel];
		tree.rootValue().beltCount = this.environment.belts[this._beltLevel].numRequired(itemPerSec);
	}
	
	return tree;
}

factorio.RatioSolver.prototype.perSecForWhole = function(item) {
	var multiple = 1;
	var machinesToGo = [];

	var recipe = this.getRecipe(item);
	if (recipe == null) return new Fraction(multiple);

	var mc = this.environment.machineClasses[recipe.category];
	var machine = new factorio.Machine(mc, this.machineLevels[mc.className], recipe);
	var topItemPerSec = machine.outputCountPerSec();
	var itemPerSec = topItemPerSec;

	if (this.isRaw(item)) return topItemPerSec;

	machinesToGo.push([machine, itemPerSec]);

	while(machinesToGo.length != 0) {
		var pair = machinesToGo.pop();

		machine = pair[0];
		recipe = machine.recipe;
		itemPerSec = pair[1];

		machines = itemPerSec.mul(multiple).div(machine.outputCountPerSec());
		multiple *= machines.d;

		for (var i = 0; i < recipe.inputs.length; ++i) {
			var input = recipe.inputs[i];
			var nextRecipe = this.getRecipe(input.name);

			if (nextRecipe == null || this.isRaw(input.name)) continue;

			var nextMc = this.environment.machineClasses[nextRecipe.category];
			var nextMachine = new factorio.Machine(nextMc, this.machineLevels[nextMc.className], nextRecipe);
			machinesToGo.push([nextMachine, itemPerSec.mul(input.amount).div(recipe.outputCount())])
		}
	}

	return topItemPerSec.mul(multiple);
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

	f(this._beltLevel);
}

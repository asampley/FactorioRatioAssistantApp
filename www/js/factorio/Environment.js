factorio.Environment = function() {
	this.items = [];
	this.fluids = [];
	this.imgPaths = {};
	this.recipes = {};
	this.machineClasses = {};
	this.belts = [];
	this._addFluidListeners = [];
	this._addItemListeners = [];
	this._addRecipeListeners = [];
	this._addMachineClassListeners = [];
	this._addBeltListeners = [];
}

factorio.Environment._notify = function(listeners) {
	const skipStart = 1;
	var args = new Array(arguments.length - skipStart);
	for (var i = 0; i < args.length; ++i) {
		args[i] = arguments[i+skipStart];
	}
	for (var i = 0; i < listeners.length; ++i) {
		listeners[i].apply(null, args);
	}
}

factorio.Environment.prototype.addRecipe = function(recipe) {
	var outputItem = recipe.outputItem();
	var inputItems = recipe.inputItems();

	assert(this.hasItem(outputItem) || this.hasFluid(outputItem), "No such item: \"" + outputItem + "\"");
	for (var i = 0; i < inputItems.length; ++i) {
		assert(this.hasItem(inputItems[i]) || this.hasFluid(inputItems[i]), "No such item: " + inputItems[i]);
	}

	this.recipes[outputItem] = recipe;

	factorio.Environment._notify(this._addRecipeListeners, recipe);
}

/*
 * Adds an item, and informs all listeners of the new item.
 * If the item is already added, the function silently returns.
 * Items should not be added directly to the items object.
 */
factorio.Environment.prototype.addItem = function(item, imgPath) {
	if (this.hasItem(item)) {
		return;
	}

	this.items.push(item);
	this.imgPaths[item] = imgPath;

	factorio.Environment._notify(this._addItemListeners, item, imgPath);
}

factorio.Environment.prototype.addFluid = function(fluid, imgPath) {
	if (this.hasFluid(fluid)) {
		return;
	}

	this.fluids.push(fluid);
	this.imgPaths[fluid] = imgPath;

	factorio.Environment._notify(this._addFluidListeners, fluid, imgPath);
}

factorio.Environment.prototype.addMachineClass = function(machineClass) {
	this.machineClasses[machineClass.className] = machineClass;

	factorio.Environment._notify(this._addMachineClassListeners, machineClass);
}

factorio.Environment.prototype.addBelt = function(belt) {
	this.belts.push(belt);

	factorio.Environment._notify(this._addBeltListeners, belt);
}

factorio.Environment.prototype.hasItem = function(item) {
	return this.items.indexOf(item) != -1;
}

factorio.Environment.prototype.hasFluid = function(fluid) {
	return this.fluids.indexOf(fluid) != -1;
}

factorio.Environment.prototype.hasMachineClass = function(machineClassName) {
	return machineClassName in this.machineClasses;
}

factorio.Environment.prototype.getMachineClass = function(machineClassName) {
	return this.machineClasses[machineClassName];
};

factorio.Environment.prototype.getBelt = function(level) {
	return this.belts[level];
}

/* 
 * Add listener that is notified when a new item is added.
 * fAdd is a function that takes the item name as an argument.
 * The listener is notified of all existing items immediately.
 */
factorio.Environment.prototype.addItemListener = function(fAdd) {
	this._addItemListeners.push(fAdd);

	for (var i = 0; i < this.items.length; ++i) {
		var item = this.items[i];
		var imgPath = this.imgPaths[item];
		fAdd(item, imgPath);
	}
}

factorio.Environment.prototype.addFluidListener = function(fAdd) {
	this._addFluidListeners.push(fAdd);

	for (var i = 0; i < this.fluids.length; ++i) {
		var fluid = this.fluids[i];
		var imgPath = this.imgPaths[fluid];
		fAdd(fluid, imgPath);
	}
}

factorio.Environment.prototype.addRecipeListener = function(fAdd) {
	this._addRecipeListeners.push(fAdd);

	for (var key in this.recipes) {
		fAdd(this.recipes[key]);
	}
}

factorio.Environment.prototype.addMachineClassListener = function(fAdd) {
	this._addMachineClassListeners.push(fAdd);

	for (var key in this.machineClasses) {
		fAdd(this.machineClasses[key]);
	}
}

factorio.Environment.prototype.addBeltListener = function(fAdd) {
	this._addBeltListeners.push(fAdd);

	for (var i = 0; i < this.belts.length; ++i) {
		fAdd(this.belts[i]);
	}
}

factorio.Environment = function() {
	this.items = [];
	this.itemImgPaths = {};
	this.recipes = {};
	this.machineClasses = {};
	this._addItemListeners = [];
	this._addRecipeListeners = [];
	this._addMachineClassListeners = [];
}

factorio.Environment.prototype.addRecipe = function(recipe) {
	outputItem = recipe.outputItem();
	inputItems = recipe.inputItems();

	assert(this.hasItem(outputItem), "No such item: " + outputItem);
	for (var i = 0; i < inputItems.length; ++i) {
		assert(this.hasItem(inputItems[i]), "No such item: " + inputItems[i]);
	}

	this.recipes[outputItem] = recipe;

	for (var i = 0; i < this._addRecipeListeners.length; ++i) {
		this._addRecipeListeners[i](recipe);
	}
}

/*
 * Adds an item, and informs all listeners of the new item.
 * If the item is already added, the function silently returns.
 * Items should not be added directly to the items object.
 */
factorio.Environment.prototype.addItem = function(item, itemImgPath) {
	if (this.hasItem(item)) {
		return;
	}

	this.items.push(item);
	this.itemImgPaths[item] = itemImgPath;

	for (var i = 0; i < this._addItemListeners.length; ++i) {
		this._addItemListeners[i](item, itemImgPath);
	}
}

factorio.Environment.prototype.addMachineClass = function(machineClass) {
	this.machineClasses[machineClass.className] = machineClass;

	for (var i = 0; i < this._addMachineClassListeners.length; ++i) {
		this._addMachineClassListeners[i](machineClass);
	}
}

factorio.Environment.prototype.hasItem = function(item) {
	return this.items.indexOf(item) != -1;
}

factorio.Environment.prototype.hasMachineClass = function(machineClassName) {
	return machineClassName in this.machineClasses;
}

factorio.Environment.prototype.getMachineClass = function(machineClassName) {
	return this.machineClasses[machineClassName];
};

/* 
 * Add listener that is notified when a new item is added.
 * fAdd is a function that takes the item name as an argument.
 * The listener is notified of all existing items immediately.
 */
factorio.Environment.prototype.addItemListener = function(fAdd) {
	this._addItemListeners.push(fAdd);

	for (var i = 0; i < this.items.length; ++i) {
		fAdd(this.items[i]);
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
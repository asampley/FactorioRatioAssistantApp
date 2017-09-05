factorio.Belt = function(name, itemsPerSec) {
	this.name = name;
	this.itemsPerSec = itemsPerSec;
}

factorio.Belt.prototype.numRequired = function(itemsPerSec) {
	return itemsPerSec.divide(this.itemsPerSec);
};
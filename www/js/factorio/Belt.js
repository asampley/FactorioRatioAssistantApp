factorio.Belt = function(name, speed) {
	this.name = name;
	this.speed = speed;
}

factorio.Belt.prototype.numRequired = function(itemsPerSec) {
	return itemsPerSec.div(this.speed.mul(32).div(9).mul(60).mul(2)) // based on standard belt density, and converting to seconds and 2 sided belt
};

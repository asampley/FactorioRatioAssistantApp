Tree = function(item) {
	this.item = item;
	this.children = [];
}

Tree.prototype.rootValue = function() {
	return this.item;
}

Tree.prototype.isLeaf = function() {
	return this.children.length == 0;
}

Tree.prototype.addChild = function(child) {
	this.children.push(child);
}

Tree.prototype.getChild = function(index) {
	return this.children[index];
}
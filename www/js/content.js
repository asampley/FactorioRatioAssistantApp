var content = {
	currentPage: null,
	pageMap: {},
	prevPageStack: [],

	switchToPage: function(pageName, arguments) {
		if (pageName in this.pageMap) {
			this.currentPage.hide();
			this.prevPageStack.push(this.currentPage);
			this.currentPage = this.pageMap[pageName];
			this.currentPage.show(arguments);
			console.log('Switched to page named "' + pageName + '"');
		}
	},

	goBackToPage: function() {
		if (this.prevPageStack.length > 0) {
			this.currentPage.hide();
			this.currentPage = this.prevPageStack.pop();
			this.currentPage.show();
			console.log('Went back a page');
			return true;
		} else {
			return false;
		}
	},

	addPage: function(pageName, page) {
		this.pageMap[pageName] = page;
	}
};

Page = function(view, onenter) {
	this.view = view;
	this.onenter = onenter;
};

Page.prototype.show = function(arguments) {
	this.view.style.display = 'block';

	if (this.onenter != undefined) {
		this.onenter(arguments);
	}
};

Page.prototype.hide = function() {
	this.view.style.display = 'none';
};

document.addEventListener(
	'deviceready',
	function() {
		document.getElementById('button-back').onclick = function() {
			cordova.fireDocumentEvent('backbutton');
		}
	},
	false
);

document.addEventListener(
	'backbutton',
	function() {
		if (!content.goBackToPage()) {
			navigator.app.exitApp();
		}
	},
	false
);
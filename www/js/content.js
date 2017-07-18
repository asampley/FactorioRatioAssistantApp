var content = {
	currentPage: null,
	currentPageName: null,
	pageMap: {},
	prevPageNameStack: [],
	pageListeners: [],

	switchToPage: function(pageName, arguments) {
		if (pageName in this.pageMap) {
			if (this.currentPage != null) {
				this.currentPage.hide();
				this.prevPageNameStack.push(this.currentPageName);
			}
			this.currentPage = this.pageMap[pageName];
			this.currentPageName = pageName;
			this.currentPage.show(arguments);
			console.log('Switched to page named "' + pageName + '"');
			for (var i = 0; i < this.pageListeners.length; ++i) {
				this.pageListeners[i](this.currentPageName);
			}
		}
	},

	goBackToPage: function() {
		if (this.prevPageNameStack.length > 0) {
			this.currentPage.hide();
			this.currentPageName = this.prevPageNameStack.pop();
			this.currentPage = this.pageMap[this.currentPageName];
			this.currentPage.show();
			console.log('Went back a page');
			for (var i = 0; i < this.pageListeners.length; ++i) {
				this.pageListeners[i](this.currentPageName);
			}
			return true;
		} else {
			return false;
		}
	},

	addPage: function(pageName, page) {
		this.pageMap[pageName] = page;
	},

	addPageListener: function(listener, immediateUpdate=true) {
		this.pageListeners.push(listener);

		if (immediateUpdate) {
			listener(this.currentPageName);
		}
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
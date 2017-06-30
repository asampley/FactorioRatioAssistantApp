var fileutil = {
	appWWW: {valueOf: function() {return cordova.file.applicationDirectory + 'www/'}},

	readText: function(path, fText, eText) {
		var request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				if (request.status == 200 || request.status == 0) {
					fText(request.responseText);
				} else {
					eText("Error in file '" + path + "':" + request.statusText);
				}
			}
		}
		request.send();
	},

	readTextAppWWW: function(relPath, fText, eText) {
		this.readText(this.appWWW + relPath, fText, eText);
	}
}
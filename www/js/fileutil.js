var fileutil = {
	appWWW: {valueOf: function() {return cordova.file.applicationDirectory + 'www/'}},
	persistent: undefined,


	init: function() {
		self = this;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(fs) {
				console.log('Opened file system "' + fs.name + '" at ' + fs.root.toURL());
				self.persistent = fs;
				cordova.fireDocumentEvent('fileutilready');
				console.log('fileutil ready');
			},
			function(event) {
				cordova.fireDocumentEvent('fileutilready');
				console.log('fileutil unable to open persistent file system');
			}
		);
	},

	readText: function(path, 
		fText = function(text) {console.log(text)}, 
		eText = function(error) {console.log(error)}) 
	{
		var request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				if (request.status == 200) {
					fText(request.responseText);
				} else {
					eText("Error in file '" + path + "':" + request.statusText);
				}
			}
		}
		request.send();
	},

	readTextPersistent: function(
		relPath, 
		fText = function(text) {console.log(text)}, 
		eText = function(error) {console.error(error)}, 
		eFile = function(error) {console.error(error)})
	{
		if (this.persistent === undefined) {
			eFile("Persistent file system could not be accessed");
			return;
		}

		this.persistent.root.getFile(relPath, {create: false, exclusive: false}, 
			function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();

					reader.onload = function(e) {
						fText(e.target.result)
					}

					reader.onerror = function(e) {
						eText(e.target.result);
					}

					reader.readAsText(file);
				})
			}, 
			eFile
		);
	},

	readTextAppWWW: function(relPath, fText, eText) {
		this.readText(this.appWWW + relPath, fText, eText);
	},

	writeTextPersistent: function(relPath, text, 
		onDone = function() {console.log('Success writing file')}, 
		onWriteError = function(error) {console.error(error)}, 
		onFileError = function(error) {console.error(error)}
	) {
		if (this.persistent === undefined) {
			onFileError("Persistent file system could not be accessed");
			return;
		}

		self = this;

		write = function(relPath) {
			self.persistent.root.getFile(relPath, {create: true},
				function(fileEntry) {
					fileEntry.createWriter(function(writer) {
						writer.onwrite = function() {
							onDone();
						}

						writer.onerror = function(e) {
							onWriteError(e);
						}

						var blob = new Blob([text], {type: 'text/plain'});
						writer.write(blob);
					})
				},
				onFileError
			)
		}

		this.persistent.root.getFile(relPath, {create: false},
			function(fileEntry) {
				fileEntry.remove();
				write(relPath);
			},
			function(error) {
				write(relPath);
			}
		);
	}
}

document.addEventListener('deviceready', fileutil.init.bind(fileutil), false);

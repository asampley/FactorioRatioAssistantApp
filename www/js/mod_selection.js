document.addEventListener(
	'deviceready', 
	function() {
		var mainElement = document.getElementById('mod_selection');
		var treeTemplate = document.getElementById('template-tree-node-mod');
		var rootTreeNode = null;

		var modButtons = {};
		var versionButtons = {};

		fileutil.readTextAppWWW('mods/mods.txt', function(text) {
			var modNames = [];

			var lines = text.split('\n');
			for (var i = 0; i < lines.length; ++i) {
				var modName = lines[i].trim();
				if (modName.length != 0) {
					modNames.push(modName);
				}
			}

			for (var i = 0; i < modNames.length; ++i) {
				var modName = modNames[i];

				var modSelector = treeTemplate.cloneNode(true);
				modSelector.classList.remove('hidden');
				mainElement.appendChild(modSelector);

				var modIcon = modSelector.getElementsByClassName('tree-node-mod-icon')[0];
				modIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				//machineIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(0)];
				modSelector.getElementsByClassName('tree-node-mod-name')[0].textContent = modName;
				modButtons[modName] = modSelector;

				modSelector.getElementsByClassName('tree-node-button')[0].onclick = function() {
					app.modLoader.mod = modName;
					console.log('Set mod to "' + modName + '"');
								
					this.style.backgroundColor = "var(--color-button-selected)";
				};

				if (app.modLoader.mod == modName) {
					modSelector.style.backgroundColor = "var(--color-button-selected)";
				}
			}
		});

		content.addPage('mod_selection', new Page(
			mainElement,
			undefined,
			function() {
				app.reloadMod();
				app.preferences.save();
			})
		);
	},
	false
);

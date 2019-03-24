pages.mod_selection = {
	modButtons: {},
	mainElement: {},
	treeTemplate: {},

	list_mods: function(text) {
		var rootTreeNode = null;

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
			console.log('Loading mod_selection button for ' + modName);

			var modSelector = pages.mod_selection.treeTemplate.cloneNode(true);
			modSelector.classList.remove('hidden');
			pages.mod_selection.mainElement.appendChild(modSelector);

			var modIcon = modSelector.getElementsByClassName('tree-node-mod-icon')[0];
			modIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
			modSelector.getElementsByClassName('tree-node-mod-name')[0].textContent = modName;
			pages.mod_selection.modButtons[modName] = modSelector.getElementsByClassName('tree-node-button')[0];

			pages.mod_selection.modButtons[modName].onclick = function(mod) {
				console.log('modname ' + mod);
				return function() {
					app.modLoader.mod = mod;
					console.log('Set mod to "' + mod + '"');
								
					for (var modButtonName in pages.mod_selection.modButtons) {
						pages.mod_selection.modButtons[modButtonName].style.backgroundColor = "";
					}
					this.style.backgroundColor = "var(--color-button-selected)";
				}
			}(modName);

			if (app.modLoader.mod == modName) {
				pages.mod_selection.modButtons[modName].style.backgroundColor = "var(--color-button-selected)";
			}
			console.log('Added mod selector for mod with name "' + modName + '"');
		}
	}
}
document.addEventListener(
	'fileutilready', 
	function() {
		pages.mod_selection.mainElement = document.getElementById('mod_selection');
		pages.mod_selection.treeTemplate = document.getElementById('template-tree-node-mod');

		fileutil.readTextAppWWW('mods/mods.txt', pages.mod_selection.list_mods);
		//fileutil.readTextPersistent('mods/mods.txt', pages.mod_selection.list_mods);

		content.addPage('mod_selection', new Page(
			pages.mod_selection.mainElement,
			undefined,
			function() {
				app.reloadMod();
				app.preferences.save();
			})
		);
	},
	false
);

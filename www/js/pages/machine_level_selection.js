pages.machine_level_selection = {
	machineButtons: {},
	mcButtons: {}
};

pages.machine_level_selection.addMachineClassFunc = function(machineClass) {
	console.log('Adding machine class button ' + machineClass);
	if (machineClass instanceof factorio.MachineClass) {

	} else if (machineClass instanceof factorio.Belt) {
		var belt = machineClass;
	}

	if (belt) {
		var imgSrc = app.factorioEnvironment.itemImgPaths[app.factorioEnvironment.belts[0].name];
		var selectorText = 'belts';
	} else {
		var imgSrc = app.factorioEnvironment.itemImgPaths[machineClass.name(0)];
		var selectorText = machineClass.className;
	}

	if (!(selectorText in pages.machine_level_selection.machineButtons)) {
		var machineSelector = pages.machine_level_selection.treeTemplate.cloneNode(true);
		machineSelector.classList.remove('hidden');
		pages.machine_level_selection.mainElement.appendChild(machineSelector);

		var machineIcon = machineSelector.getElementsByClassName('tree-node-machine-icon')[0];
		machineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
		machineIcon.src = imgSrc;
		machineSelector.getElementsByClassName('tree-node-machine-name')[0].textContent = selectorText;
		pages.machine_level_selection.machineButtons[selectorText] = machineSelector;

		machineSelector.getElementsByClassName('tree-node-button')[0].onclick = function() {
			childElement.classList.toggle('hidden');
		}

		pages.machine_level_selection.mcButtons[selectorText] = [];
	}

	var childElement = pages.machine_level_selection.machineButtons[selectorText].getElementsByClassName('tree-node-children')[0];
	var childTemplate = document.getElementById('template-button-machine-level');

	if (belt) {
		var machineLevelButton = childTemplate.cloneNode(true);
		machineLevelButton.classList.remove('hidden');

		var machineLevelIcon = machineLevelButton.getElementsByClassName('tree-node-machine-icon')[0];
		machineLevelIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
		machineLevelIcon.src = app.factorioEnvironment.itemImgPaths[belt.name];
		machineLevelButton.getElementsByClassName('tree-node-machine-name')[0].textContent = belt.name;

		pages.machine_level_selection.mcButtons[selectorText].push(machineLevelButton);

		function createButtonClick(level) {
			return function() {
				app.ratioSolver.setBeltLevel(level);
				console.log("Set belt to " + level);
			}
		}

		for (var i = 0; i < app.factorioEnvironment.belts.length; ++i) {
			if (app.factorioEnvironment.getBelt(i) == belt) {
				machineLevelButton.onclick = createButtonClick(i);
			}
		}

		childElement.appendChild(machineLevelButton);

		if (app.factorioEnvironment.getBelt(app.ratioSolver.getBeltLevel()) == belt) {
			machineLevelButton.style.backgroundColor = "var(--color-button-selected)";
		}
	} else {
		for (var i = 0; i < machineClass.names.length; ++i) {
			var machineLevelButton = childTemplate.cloneNode(true);
			machineLevelButton.classList.remove('hidden');

			var machineLevelIcon = machineLevelButton.getElementsByClassName('tree-node-machine-icon')[0];
			machineLevelIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
			machineLevelIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(i)];
			machineLevelButton.getElementsByClassName('tree-node-machine-name')[0].textContent = machineClass.name(i);

			pages.machine_level_selection.mcButtons[machineClass.className].push(machineLevelButton);

			function createButtonClick(className, level) {
				return function() {
					app.ratioSolver.setMachineLevel(className, level);
					console.log("Set machine class " + className + " to " + level);
				}
			}

			machineLevelButton.onclick = createButtonClick(machineClass.className, i);

			childElement.appendChild(machineLevelButton);

			if (app.ratioSolver.getMachineLevel(machineClass.className) == i) {
				machineLevelButton.style.backgroundColor = "var(--color-button-selected)";
			}
		}
	}
}

pages.machine_level_selection.machineLevelFunc = function(machineClass, level) {
	if (!(machineClass.className in pages.machine_level_selection.mcButtons)) return;
	
	var machineButton = pages.machine_level_selection.machineButtons[machineClass.className];
	var classButtons = pages.machine_level_selection.mcButtons[machineClass.className];

	var machineIcon = machineButton.getElementsByClassName('tree-node-machine-icon')[0];
	machineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
	machineIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(level)];

	for (var i = 0; i < classButtons.length; ++i) {
		classButtons[i].style.backgroundColor = "";
	}

	if (classButtons.length > level) {
		classButtons[level].style.backgroundColor = "var(--color-button-selected)";
	}
}

pages.machine_level_selection.beltLevelFunc = function(level) {
	if (!('belts' in pages.machine_level_selection.mcButtons)) return;

	var belt = app.factorioEnvironment.getBelt(level);
	
	var machineButton = pages.machine_level_selection.machineButtons['belts'];
	var classButtons = pages.machine_level_selection.mcButtons['belts'];

	var machineIcon = machineButton.getElementsByClassName('tree-node-machine-icon')[0];
	machineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
	machineIcon.src = app.factorioEnvironment.itemImgPaths[belt.name];

	for (var i = 0; i < classButtons.length; ++i) {
		classButtons[i].style.backgroundColor = "";
	}

	if (classButtons.length > level) {
		classButtons[level].style.backgroundColor = "var(--color-button-selected)";
	}
}

document.addEventListener(
	'deviceready', 
	function() {
		pages.machine_level_selection.mainElement = document.getElementById('machine_level_selection');
		pages.machine_level_selection.treeTemplate = document.getElementById('template-tree-node-machine');

		document.addEventListener(
			'modsunloaded',
			function() {
				for (var machineClass in pages.machine_level_selection.machineButtons) {
					pages.machine_level_selection.mainElement.removeChild(pages.machine_level_selection.machineButtons[machineClass]);
				}
				pages.machine_level_selection.machineButtons = {};
				pages.machine_level_selection.mcButtons = {};
			}
		);

		document.addEventListener(
			'modsloaded',
			function() {
				app.factorioEnvironment.addMachineClassListener(pages.machine_level_selection.addMachineClassFunc);
				app.ratioSolver.addMachineLevelListener(pages.machine_level_selection.machineLevelFunc);
				app.factorioEnvironment.addBeltListener(pages.machine_level_selection.addMachineClassFunc);
				app.ratioSolver.addBeltLevelListener(pages.machine_level_selection.beltLevelFunc);
			}
		);

		content.addPage('machine_level_selection', new Page(
			pages.machine_level_selection.mainElement,
			undefined,
			function() {
				app.preferences.inherit();
				app.preferences.save();
			})
		);
	},
	false
);

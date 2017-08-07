document.addEventListener(
	'deviceready', 
	function() {
		var mainElement = document.getElementById('machine_level_selection');
		var treeTemplate = document.getElementById('template-tree-node-machine');

		var mcButtons = {};
		var machineButtons = {};

		document.addEventListener(
			'modsunloaded',
			function() {
				for (var machineClass in machineButtons) {
					mainElement.removeChild(machineButtons[machineClass]);
				}
			}
		);

		document.addEventListener(
			'modsloaded',
			function() {
				app.factorioEnvironment.addMachineClassListener(
					function(machineClass) {
						var machineSelector = treeTemplate.cloneNode(true);
						machineSelector.classList.remove('hidden');
						mainElement.appendChild(machineSelector);

						var machineIcon = machineSelector.getElementsByClassName('tree-node-machine-icon')[0];
						machineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
						machineIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(0)];
						machineSelector.getElementsByClassName('tree-node-machine-name')[0].textContent = machineClass.className;
						machineButtons[machineClass.className] = machineSelector;

						var childElement = machineSelector.getElementsByClassName('tree-node-children')[0];
						var childTemplate = document.getElementById('template-button-machine-level');

						machineSelector.getElementsByClassName('tree-node-button')[0].onclick = function() {
							childElement.classList.toggle('hidden');
						}

						mcButtons[machineClass.className] = [];

						for (var i = 0; i < machineClass.names.length; ++i) {
							var machineLevelButton = childTemplate.cloneNode(true);
							machineLevelButton.classList.remove('hidden');

							var machineLevelIcon = machineLevelButton.getElementsByClassName('tree-node-machine-icon')[0];
							machineLevelIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
							machineLevelIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(i)];
							machineLevelButton.getElementsByClassName('tree-node-machine-name')[0].textContent = machineClass.name(i);

							mcButtons[machineClass.className].push(machineLevelButton);

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
				);

				app.ratioSolver.addMachineLevelListener(
					function(machineClass, level) {
						if (!(machineClass.className in mcButtons)) return;
						
						var machineButton = machineButtons[machineClass.className];
						var classButtons = mcButtons[machineClass.className];

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
				);
			}
		);

		content.addPage('machine_level_selection', new Page(
			mainElement,
			undefined,
			function() {
				app.preferences.inherit();
				app.preferences.save();
			})
		);
	},
	false
);
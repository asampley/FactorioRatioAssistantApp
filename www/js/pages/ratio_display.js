pages.ratio_display = {
	item: null,
	trees: [],
	trashButtons: {},
	setRawButtons: {}
}

document.addEventListener(
	'modsloaded',
	function() {
		app.ratioSolver.addSetRawListener(
			function(item) {
				if (item in pages.ratio_display.setRawButtons) {
					for (var i = 0; i < pages.ratio_display.setRawButtons[item].length; ++i) {
						pages.ratio_display.setRawButtons[item][i].style.backgroundColor = "";
					}
				}
			},
			function(item) {
				if (item in pages.ratio_display.setRawButtons) {
					for (var i = 0; i < pages.ratio_display.setRawButtons[item].length; ++i) {
						pages.ratio_display.setRawButtons[item][i].style.backgroundColor = "var(--color-button-raw)";
					}
				}
			}
		);
	},
	false
);

document.addEventListener(
	'deviceready',
	function() {
		var mainElement = document.getElementById('ratio_display');
		var treeTemplate = document.getElementById('template-tree-node-ratio');
		var trashTemplate = document.getElementById('template-button-trash');

		var page = new Page(
			mainElement,
			function() {
				for (var i = 0; i < app.ratioSolver.solutions.length; ++i) {
					showTree(i);
				}
			},
			function() {},
			function() {
				for (var i = 0; i < app.ratioSolver.solutions.length; ++i) {
					showTree(i, false);
				}
			}
		)

		content.addPage('ratio_display', page);

		function showTree(index, newTree=true) {
			if (newTree && pages.ratio_display.trees.length > index) { // clear area
				mainElement.removeChild(pages.ratio_display.trees[index]);
				pages.ratio_display.trees[index] = null;
				pages.ratio_display.setRawButtons = {};
			}

			var item = app.ratioSolver.solutions[index].item;

			function constructTree(parent, tree, coeff, oldNode=undefined) {
				var treeRoot = tree.rootValue();
				var machine = treeRoot.machine;
				var machineCount = treeRoot.machineCount === null ? null : treeRoot.machineCount.mul(coeff);
				var outputItem = treeRoot.item;
				var outputCountPerSec = treeRoot.itemPerSec.mul(coeff);
				var outputIconPath = app.factorioEnvironment.imgPaths[outputItem];
				var belt = treeRoot.belt;
				var beltCount = treeRoot.beltCount === null ? null : treeRoot.beltCount.mul(coeff);

				if (oldNode == undefined) {
					var treeNode = treeTemplate.cloneNode(true);
					if (!(outputItem in pages.ratio_display.setRawButtons)) {
						pages.ratio_display.setRawButtons[outputItem] = [];
					}
					pages.ratio_display.setRawButtons[outputItem].push(treeNode.getElementsByClassName('tree-node-raw-toggle')[0]);
					parent.appendChild(treeNode);
					
					if (parent == mainElement) {
						trashButton = trashTemplate.cloneNode(true);
						trashButton.onclick = function(event) {
							event.stopPropagation();

							var index = pages.ratio_display.trees.indexOf(treeNode);
							console.log('Removed ratio at index ' + index);
							app.ratioSolver.solutions.splice(index, 1);
							pages.ratio_display.trees.splice(index, 1);
							mainElement.removeChild(treeNode);
						}
						trashButton.classList.remove('hidden');
						var rightDiv = treeNode.getElementsByClassName('tree-node-right-div')[0];
						rightDiv.insertBefore(trashButton, rightDiv.firstChild);
					}
				} else {
					var treeNode = oldNode;
				}


				var childrenElement = treeNode.getElementsByClassName('tree-node-children')[0];

				treeNode.classList.remove('hidden');
				outputInt = outputCountPerSec.s * ~~(outputCountPerSec.n / outputCountPerSec.d); // magic
				outputFrac = new Fraction(outputCountPerSec.n % outputCountPerSec.d, outputCountPerSec.d);
				var treeNodeItemInt = treeNode.getElementsByClassName('tree-node-item-pre-icon-int')[0];
				var treeNodeItemFrac = treeNode.getElementsByClassName('tree-node-item-pre-icon-frac')[0];
				var treeNodeItemPost = treeNode.getElementsByClassName('tree-node-item-post-icon-text')[0];
				var treeNodeItemInput = treeNode.getElementsByClassName('tree-node-item-input')[0];

				treeNodeItemInt.textContent = (outputInt == 0 ? "" : outputInt);
				treeNodeItemFrac.textContent = (outputFrac.n == 0 ? "" : outputFrac.toFraction());
				treeNodeItemPost.textContent = " / s";
				treeNodeItemInput.value =
					(outputInt == 0 ? "" : outputInt)
					+ (outputInt !== 0 && outputFrac.n !== 0 ? " " : "")
					+ (outputFrac.n == 0 ? "" : outputFrac.toFraction());

				// hide on click, and switch to input mode
				var itemNumberClick = function(event) {
					event.stopPropagation();

					treeNodeItemInt.classList.add('hidden');
					treeNodeItemFrac.classList.add('hidden');

					treeNodeItemInput.classList.remove('hidden');
				}
				treeNodeItemInt.onclick = itemNumberClick;
				treeNodeItemFrac.onclick = itemNumberClick;

				// on input, change the coeff, and refresh the tree
				var itemInputLeave = function(event) {
					treeNodeItemInput.classList.add('hidden');

					try {
						var fraction = new Fraction(treeNodeItemInput.value.trim());
						app.ratioSolver.solutions[index].coeff = fraction.div(treeRoot.itemPerSec);
						app.ratioSolver.solutions[index].coeffLock = true;
					} catch (error) {
						console.warn("Invalid fraction entered: \"" + treeNodeItemInput.value + "\"");
					}

					showTree(index, false);

					treeNodeItemInt.classList.remove('hidden');
					treeNodeItemFrac.classList.remove('hidden');
				}
				treeNodeItemInput.onblur = itemInputLeave;
				treeNodeItemInput.onchange = itemInputLeave;

				var treeNodeIcon = treeNode.getElementsByClassName('tree-node-item-icon')[0];
				treeNodeIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				
				if (machine != null) {
					var machineIconPath = app.factorioEnvironment.imgPaths[machine.name()];
					var treeNodeMachineIcon = treeNode.getElementsByClassName('tree-node-machine-icon')[0];
					treeNodeMachineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
					treeNodeMachineIcon.src = machineIconPath;
					machineInt = machineCount.s * ~~(machineCount.n / machineCount.d); // magic
					machineFrac = new Fraction(machineCount.n % machineCount.d, machineCount.d);
					treeNode.getElementsByClassName('tree-node-machine-int')[0].textContent = (machineInt == 0 ? "" : machineInt);
					treeNode.getElementsByClassName('tree-node-machine-frac')[0].textContent = (machineFrac.n == 0 ? "" : machineFrac.toFraction());
				} else {
					treeNode.getElementsByClassName('tree-node-machine')[0].classList.add('hidden');
				}

				if (belt != null) {
					var beltIconPath = app.factorioEnvironment.imgPaths[belt.name];
					var treeNodeBeltIcon = treeNode.getElementsByClassName('tree-node-belt-icon')[0];
					treeNodeBeltIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
					treeNodeBeltIcon.src = beltIconPath;
					beltInt = beltCount.s * ~~(beltCount.n / beltCount.d);
					beltFrac = new Fraction(beltCount.n % beltCount.d, beltCount.d);
					treeNode.getElementsByClassName('tree-node-belt-int')[0].textContent = (beltInt == 0 ? "" : beltInt);
					treeNode.getElementsByClassName('tree-node-belt-frac')[0].textContent = (beltFrac.n == 0 ? "" : beltFrac.toFraction());
				} else {
					treeNode.getElementsByClassName('tree-node-belt')[0].classList.add('hidden');
				}

				if (app.ratioSolver.canSetUnraw(outputItem)) {
					var treeNodeRawToggle = treeNode.getElementsByClassName('tree-node-raw-toggle')[0];
					treeNodeRawToggle.classList.remove('hidden');
					treeNodeRawToggle.onclick = function(event) {
						event.stopPropagation(); // don't let the click propogate to parents

						app.ratioSolver.toggleRaw(outputItem);
						page.refresh();
					}

					if (!app.ratioSolver.isRaw(outputItem)) {
						treeNodeRawToggle.style.backgroundColor = "var(--color-button-raw)";
					}
				}

				treeNodeIcon.src = outputIconPath;
				var treeNodeButton = treeNode.getElementsByClassName('tree-node-button')[0];

				if (app.ratioSolver.isRaw(outputItem)) {
					treeNodeButton.style.backgroundColor = "var(--color-button-raw)";

				} else {
					treeNodeButton.style.backgroundColor = "";
				}

				treeNode.getElementsByClassName('tree-node-button')[0].onclick = function() {
					childrenElement.classList.toggle('hidden');
				}

				for (var i = 0; i < tree.children.length; ++i) {
					if (childrenElement.children.length > i) { // save old child objects where we can
						constructTree(childrenElement, tree.getChild(i), coeff, childrenElement.children[i]);
					} else {
						constructTree(childrenElement, tree.getChild(i), coeff);
					}
				}

				return treeNode;
			}

			var tree = app.ratioSolver.solve(index);
			var coeff = app.ratioSolver.solutions[index].coeff;

			if (newTree) {
				pages.ratio_display.trees[index] = constructTree(mainElement, tree, coeff);
			} else {
				pages.ratio_display.trees[index] = constructTree(mainElement, tree, coeff, pages.ratio_display.trees[index]);
			}
		}
	},
	false
);

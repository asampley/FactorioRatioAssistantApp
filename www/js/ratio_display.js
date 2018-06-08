pages.ratio_display = {
	item: null,
	rootTreeNode: null,
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

		var page = new Page(
			mainElement,
			function(item) {
				pages.ratio_display.item = item;
				showTree(item);
			},
			function() {},
			function() {
				showTree(pages.ratio_display.item, false);
			}
		)

		content.addPage('ratio_display', page);

		function showTree(item, newTree=true) {
			if (newTree && pages.ratio_display.rootTreeNode != null) { // clear area
				mainElement.removeChild(pages.ratio_display.rootTreeNode);
				pages.ratio_display.rootTreeNode = null;
				pages.ratio_display.setRawButtons = {};
			}

			function constructTree(parent, tree, oldNode=undefined) {

				var treeRoot = tree.rootValue();
				var machine = treeRoot.machine;
				var machineCount = treeRoot.machineCount;
				var outputItem = treeRoot.item;
				var outputCountPerSec = treeRoot.itemPerSec;
				var outputIconPath = app.factorioEnvironment.itemImgPaths[outputItem];
				var belt = tree.belt;
				var beltCount = tree.beltCount;

				if (oldNode == undefined) {
					var treeNode = treeTemplate.cloneNode(true);
					if (!(outputItem in pages.ratio_display.setRawButtons)) {
						pages.ratio_display.setRawButtons[outputItem] = [];
					}
					pages.ratio_display.setRawButtons[outputItem].push(treeNode.getElementsByClassName('tree-node-raw-toggle')[0]);
					parent.appendChild(treeNode);
				} else {
					var treeNode = oldNode;
				}

				var childrenElement = treeNode.getElementsByClassName('tree-node-children')[0];

				treeNode.classList.remove('hidden');
				outputInt = outputCountPerSec.s * ~~(outputCountPerSec.n / outputCountPerSec.d); // magic
				outputFrac = new Fraction(outputCountPerSec.n % outputCountPerSec.d, outputCountPerSec.d);
				treeNode.getElementsByClassName('tree-node-item-pre-icon-int')[0].textContent = (outputInt == 0 ? "" : outputInt);
				treeNode.getElementsByClassName('tree-node-item-pre-icon-frac')[0].textContent = (outputFrac.n == 0 ? "" : outputFrac.toFraction());
				treeNode.getElementsByClassName('tree-node-item-post-icon-text')[0].textContent = " / s";
				var treeNodeIcon = treeNode.getElementsByClassName('tree-node-item-icon')[0];
				treeNodeIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				if (machine != null) {
					var machineIconPath = app.factorioEnvironment.itemImgPaths[machine.name()];
					var treeNodeMachineIcon = treeNode.getElementsByClassName('tree-node-machine-icon')[0];
					treeNodeMachineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
					treeNodeMachineIcon.src = machineIconPath;
					machineInt = machineCount.s * ~~(machineCount.n / machineCount.d); // magic
					machineFrac = new Fraction(machineCount.n % machineCount.d, machineCount.d);
					treeNode.getElementsByClassName('tree-node-machine-int')[0].textContent = (machineInt == 0 ? "" : machineInt);
					treeNode.getElementsByClassName('tree-node-machine-frac')[0].textContent = (machineFrac.n == 0 ? "" : machineFrac.toFraction());
				}
				if (belt != null) {
					var beltIconPath = app.factorioEnvironment.itemImgPaths[belt.name];
					var treeNodeBeltIcon = treeNode.getElementsByClassName('tree-node-belt-icon')[0];
					treeNodeBeltIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
					treeNodeBeltIcon.src = beltIconPath;
					beltInt = beltCount.s * ~~(beltCount.n / beltCount.d);
					beltFrac = new Fraction(beltCount.n % beltCount.d, beltCount.d);
					treeNode.getElementsByClassName('tree-node-belt-int')[0].textContent = (beltInt == 0 ? "" : beltInt);
					treeNode.getElementsByClassName('tree-node-belt-frac')[0].textContent = (beltFrac.n == 0 ? "" : beltFrac.toFraction());
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
						constructTree(childrenElement, tree.getChild(i), childrenElement.children[i]);
					} else {
						constructTree(childrenElement, tree.getChild(i));
					}
				}

				return treeNode;
			}

			var tree = app.ratioSolver.solve(item);

			if (newTree) {
				pages.ratio_display.rootTreeNode = constructTree(mainElement, tree);
				pages.ratio_display.rootTreeNode.getElementsByClassName('tree-node-children')[0].classList.remove('hidden');
			} else {
				pages.ratio_display.rootTreeNode = constructTree(mainElement, tree, pages.ratio_display.rootTreeNode);
			}
		}
	},
	false
);

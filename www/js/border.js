document.addEventListener(
	'deviceready',
	function() {
		document.getElementById('button-back').onclick = function() {
			cordova.fireDocumentEvent('backbutton');
		}

        document.getElementById('button-help').onclick = function() {
            var helpPanel = document.getElementById('help_popup');
            var helpOverlay = document.getElementById('popup_overlay');
            helpPanel.classList.remove('hidden');
            helpOverlay.classList.remove('hidden');
        }

		var ratioButton = document.getElementById('tab-ratio');
        ratioButton.onclick = function() {
        	content.switchToPage('ratio_selection');
        }
        content.addPageListener(function(pageName) {
        	if (pageName == 'ratio_selection') {
        		ratioButton.style.backgroundColor = 'var(--color-button-selected)';
        	} else {
        		ratioButton.style.backgroundColor = '';
        	}
        });
        var rawMatButton = document.getElementById('tab-raw_materials');
        rawMatButton.onclick = function () {
        	content.switchToPage('raw_materials_selection');
        }
        content.addPageListener(function(pageName) {
        	if (pageName == 'raw_materials_selection') {
        		rawMatButton.style.backgroundColor = 'var(--color-button-selected)';
        	} else {
        		rawMatButton.style.backgroundColor = '';
        	}
        });
        var machineLevelsButton = document.getElementById('tab-machine_levels');
        machineLevelsButton.onclick = function () {
        	content.switchToPage('machine_level_selection');
        }
        content.addPageListener(function(pageName) {
        	if (pageName == 'machine_level_selection') {
        		machineLevelsButton.style.backgroundColor = 'var(--color-button-selected)';
        	} else {
        		machineLevelsButton.style.backgroundColor = '';
        	}
        });
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
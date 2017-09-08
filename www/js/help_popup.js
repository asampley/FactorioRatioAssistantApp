document.addEventListener(
	'deviceready',
	function() {
        var helpPanel = document.getElementById('help_popup');

		document.getElementById('help_popup-button_close').onclick = function() {
			helpPanel.classList.add('hidden');
		}
    },
	false
);
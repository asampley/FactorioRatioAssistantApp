document.addEventListener('fileutilready', 
	function() {
		var es = document.getElementsByClassName('data-mods');
		console.log('Filling ' + es.length + ' data-mods class elements');
		for (var i = 0; i < es.length; ++i) {
			es[i].innerHTML = fileutil.appWWW + 'mods'
		}
	},
	false
);

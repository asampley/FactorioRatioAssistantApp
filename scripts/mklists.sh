#!/bin/bash

baseDir='www/mods/'
lsPlus() {
	ls -Q --color='never' -1 $1
}

modsList="${baseDir}/mods.txt"
rm "${modsList}"
touch "${modsList}"

for modPath in "${baseDir}"/*; do
	if [ ! -d "${modPath}" ]; then
		continue;
	fi
	
	mod=$(basename "${modPath}")
	echo "Mod: ${mod}"
	echo "${mod}" >> "${modsList}"
done

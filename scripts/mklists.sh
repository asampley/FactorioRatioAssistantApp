#!/bin/bash

baseDir='www/mods/'
lsPlus() {
	ls -Q --color='never' -1 $1
}

for modPath in "${baseDir}"/*; do
	if [ ! -d "${modPath}" ]; then
		continue;
	fi
	
	echo "Mod: ${modPath}"

	versionsList="${modPath}/versions.txt"
	rm "${versionsList}"
	touch "${versionsList}"
	for path in "${modPath}"/*; do
		version=$(basename "${path}")
		if [ "${version}" == "img" ]; then
			continue;
		fi
		if [ ! -d "${path}" ]; then
			continue;
		fi
		echo "Version: ${version}"
		echo "${version}" >> "${versionsList}"
		recipeList="${path}/recipes.txt"
		machineList="${path}/machines.txt"
		rm "${recipeList}"
		touch "${recipeList}"
		rm "${machineList}"
		touch "${machineList}"
		
		recipePath="${path}/recipes/"
		for machinePath in "${recipePath}"/*; do
			machine=$(basename "${machinePath}")
			
			echo "${machine}" >> "${machineList}"	
			echo "# ${machine}"
			echo "# ${machine}" >> "${recipeList}"
			for recipePath in "${machinePath}"/*; do
				recipe=$(basename "${recipePath}")
				echo "${recipe}"
				echo "${recipe}" >> "${recipeList}"
			done
		done
	done
done

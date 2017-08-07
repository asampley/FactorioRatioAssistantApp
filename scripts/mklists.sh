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
		
		machinesPath="${path}/machine/"
		for machinePath in "${machinesPath}"/*; do
			machine=$(basename "${machinePath}")
			if [ "${machine}" == '*' ]; then
				continue;
			fi
			
			echo "${machine}" >> "${machineList}"
		done

		recipePath="${path}/recipes/"
		for machinePath in "${recipePath}"/*; do
			machine=$(basename "${machinePath}")
			
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

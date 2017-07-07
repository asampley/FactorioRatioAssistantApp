#!/bin/bash

baseDir='www/mods/'
lsPlus() {
	ls -Q --color='never' -1 $1
}

for modPath in "${baseDir}"/*; do
	for path in "${modPath}"/*; do
		recipeList="${path}/recipes.txt"
		rm "${recipeList}"
		touch "${recipeList}"
		
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

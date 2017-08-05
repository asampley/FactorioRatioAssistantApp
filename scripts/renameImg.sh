if [[ $# < 1 ]]; then
	echo "Usage: $0 <directory>"
	exit 1
fi

for filePath in "$1"/*; do
	base="$(basename "${filePath}")"
	dir="$(dirname "${filePath}")"
	new=$(echo "${base}" | sed -r 's/-/ /g; s/[^ ]*/\u&/g; s/([^.]*)\$/\L\1/')
	if [[ ${base} != ${new} ]]; then
		mv "${dir}/${base}" "${dir}/${new}"
		echo "${dir}/${base} -> ${dir}/${new}"
	fi
done

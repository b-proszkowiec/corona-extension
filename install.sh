#!/bin/bash

MIN_GNOME_SHELL_VER="3.36.0"
MAIN_FOLDER="corona-extension@bproszkowiec"
EXTENSIONS_PATH="${HOME}/.local/share/gnome-shell/extensions"

verlte() {
    [  "$1" = "`echo -e "$1\n$2" | sort -V | head -n1`" ]
}

verlt() {
    [ "$1" = "$2" ] && return 0 || verlte $1 $2
}

# Make sure the "gnome-shell" tool is installed on the system.
if ! gnome-shell --version &> /dev/null
then
    echo "gnome-shell could not be found!"
    exit
fi

# Check whether gnome-shell version meets minimal.
currentver="$(gnome-shell --version | awk '{print $(NF)}')"
requiredver="$(echo $MIN_GNOME_SHELL_VER)"
verlt $requiredver $currentver
if [ "$?" -eq 1 ]; then
    echo "gnome-shell at least ${MIN_GNOME_SHELL_VER} required"
    exit
fi

# Make sure the directory for storing the user's shell extension exists.
mkdir -p `echo "$EXTENSIONS_PATH"`

# Copy content of project to extension folder
cp -R "$MAIN_FOLDER" "$EXTENSIONS_PATH"

echo "Covid-19 informer installed in $EXTENSIONS_PATH/$MAIN_FOLDER"
echo "Please restart gnome-shell and enable the extension in gnome-tweaks"

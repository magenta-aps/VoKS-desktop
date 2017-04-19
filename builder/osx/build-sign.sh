#!/bin/bash

# where the script lays
BASEDIR=$(dirname $0)

# go into sources dir
cd $BASEDIR;
BASEDIR=${PWD}
cd ../../source

SOURCE_DIR=${PWD}
cd $BASEDIR;

# Change the identities based on your certificates
identity="[Developer ID Here]";
installer_identity="[Developer ID Installer Here]"

OUTPUT_DIR="${BASEDIR}/output";
PACKAGES_PROGRAM="/usr/local/bin/packagesbuild";

SCRIPT_EN="${BASEDIR}/scripts/alarm-en-64.pkgproj";
SCRIPT_NO="${BASEDIR}/scripts/alarm-no-64.pkgproj";

# First parameter is app location
function sign_app(){
codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Versions/56.0.2924.87/nwjs Framework.framework/Helpers/crashpad_handler"
codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Versions/56.0.2924.87/nwjs Framework.framework/libnode.dylib"
codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Versions/56.0.2924.87/nwjs Framework.framework/libffmpeg.dylib"
codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Versions/56.0.2924.87/nwjs Framework.framework"
codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Versions/56.0.2924.87/nwjs Helper.app"
codesign --force --verify --verbose --sign "$identity" "$1"
	spctl -a -vvvv $1;
}

# First parameter package location, second parameter - signed package output location
function sign_installer(){
	productsign --sign "$installer_identity" $1 $2;
	spctl -a -vvvv --type install $2;
}

# First parameter app location; second parameter - installer project file
# third parameter package location, fourth parameter signed package output location
function build_installer (){
	rm -rf ${1}/Contents/Resources/*.lproj
	sign_app $1;
	$PACKAGES_PROGRAM -v $2;
	sign_installer $3 $4;
}

# Prepare the output directory
cd $BASEDIR
rm -rf ${BASEDIR}/output
ditto -x -k ${BASEDIR}/output.zip ${BASEDIR};

# Sign applications, build installers, and sign installers
build_installer ${BASEDIR}/output/en/alarm/osx64/alarm.app $SCRIPT_EN ${BASEDIR}/output/en/alarm-en-64.pkg ${BASEDIR}/output/en/alarm-en-64-signed.pkg
build_installer ${BASEDIR}/output/no/alarm/osx64/alarm.app $SCRIPT_NO ${BASEDIR}/output/no/alarm-no-64.pkg ${BASEDIR}/output/no/alarm-no-64-signed.pkg

# Cleanup output directory
rm -rf ${BASEDIR}/output/en/alarm
rm -rf ${BASEDIR}/output/no/alarm
rm -rf ${BASEDIR}/output/en/alarm-en-64.pkg
rm -rf ${BASEDIR}/output/no/alarm-no-64.pkg

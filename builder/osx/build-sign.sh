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
identity="<Developer ID Application certificate identity>";
installer_identity="<Developer ID Installer certificate identity>"

OUTPUT_DIR="${BASEDIR}/output";
PACKAGES_PROGRAM="/usr/local/bin/packagesbuild";

SCRIPT_EN_A="${BASEDIR}/scripts/alarm-en-32.pkgproj";
SCRIPT_NO_A="${BASEDIR}/scripts/alarm-no-32.pkgproj";
SCRIPT_EN_B="${BASEDIR}/scripts/alarm-en-64.pkgproj";
SCRIPT_NO_B="${BASEDIR}/scripts/alarm-no-64.pkgproj";


# First parameter is app location
function sign_app(){
	
	codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Frameworks/crash_inspector";
	codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Frameworks/nwjs Framework.framework";
	codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Frameworks/nwjs Helper EH.app";
	codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Frameworks/nwjs Helper NP.app";
	codesign --force --verify --verbose --sign "$identity" "${1}/Contents/Frameworks/nwjs Helper.app";

	codesign --force --verify --verbose --sign "$identity" "$1";
	codesign -vvv -d $1;
	spctl -a -vvvv $1;
}

# First parameter output directory
function replace_icons(){
    # replace icons
    cp -f "${BASEDIR}/files/nw.icns" "${1}/alarm/osx32/alarm.app/Contents/Resources/nw.icns"
    cp -f "${BASEDIR}/files/nw.icns" "${1}/alarm/osx64/alarm.app/Contents/Resources/nw.icns"
}

# First parameter package location, second parameter - signed package output location
function sign_installer(){
	productsign --sign "$installer_identity" $1 $2;
	spctl -a -vvvv --type install $2;
}

# First parameter app location; second parameter - installer project file
# third parameter package location, fourth parameter signed package output location 
function build_installer (){
	sign_app $1;
	$PACKAGES_PROGRAM -v $2;
	sign_installer $3 $4;
}

# Prepare the output directory

cd $BASEDIR

rm -rf ${BASEDIR}/output
ditto -x -k ${BASEDIR}/output.zip ${BASEDIR};

# Replace app icons
replace_icons ${BASEDIR}/output/en
replace_icons ${BASEDIR}/output/no

# Sign applications, build installers, and sign installers
build_installer ${BASEDIR}/output/en/alarm/osx64/alarm.app $SCRIPT_EN_B ${BASEDIR}/output/en/alarm-en-64.pkg ${BASEDIR}/output/en/alarm-en-64-signed.pkg
build_installer ${BASEDIR}/output/en/alarm/osx32/alarm.app $SCRIPT_EN_A ${BASEDIR}/output/en/alarm-en-32.pkg ${BASEDIR}/output/en/alarm-en-32-signed.pkg 
build_installer ${BASEDIR}/output/no/alarm/osx64/alarm.app $SCRIPT_NO_B ${BASEDIR}/output/no/alarm-no-64.pkg ${BASEDIR}/output/no/alarm-no-64-signed.pkg
build_installer ${BASEDIR}/output/no/alarm/osx32/alarm.app $SCRIPT_NO_A ${BASEDIR}/output/no/alarm-no-32.pkg ${BASEDIR}/output/no/alarm-no-32-signed.pkg

# Cleanup output directory
rm -rf ${BASEDIR}/output/en/alarm
rm -rf ${BASEDIR}/output/no/alarm

rm -rf ${BASEDIR}/output/en/alarm-en-64.pkg
rm -rf ${BASEDIR}/output/en/alarm-en-32.pkg

rm -rf ${BASEDIR}/output/no/alarm-no-64.pkg
rm -rf ${BASEDIR}/output/no/alarm-no-32.pkg

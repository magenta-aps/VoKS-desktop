=================================================================================================================
	BEFORE USE
=================================================================================================================

1. Resource hacker must be installed and the location specified in the builder.bat:
   SET RH_EXE="C:\Program Files (x86)\Resource Hacker\ResourceHacker.exe"
   DOWNLOAD LINK: http://www.angusj.com/resourcehacker/#download

2. Inno setup must be installed and the location specified in the builder.bat:
   SET INNO_EXE="C:\Program Files (x86)\Inno Setup 5\ISCC.exe"
   DOWNLOAD LINK: http://www.jrsoftware.org/isdl.php

3. Node must be installed
   DOWNLOAD LINK: https://nodejs.org/en/download/

4. 7Zip must be installed and the location specified in the builder.bat:
   SET ZIP_EXE="C:\Program Files\7-Zip\7z.exe"
   DOWNLOAD LINK: http://www.7-zip.org/download.html

5. Node webkit builder must be installed via command line: npm install nw-builder -g

6. "npm install" should be executed via command line to install application dependencies.

7. Change config/config-en.js and config/config-no.js domain value.
   
8. Generate AppId and change it in scripts/*.iss files (To generate a new GUID, in Inno setup, click Tools | Generate GUID inside the IDE.)

=================================================================================================================
	HOW TO USE
=================================================================================================================
1. Run it by clicking the bat file or opening it from the cmd
2. After script finishes executing "output" directory will contain windows installers, and output.zip which will be required to build the osx installers.
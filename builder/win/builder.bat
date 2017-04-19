@ECHO OFF

:: ====================================== BUILDER CONSTANTS ============================================
:: Builder location (DO NOT CHANGE)
SET BUILDER_LOC=%~dp0

:: Path to Resource Hacker exe file
SET RH_EXE="C:\Program Files (x86)\Resource Hacker\ResourceHacker.exe"

:: Path to Inno Setup Builder exe file
SET INNO_EXE="C:\Program Files (x86)\Inno Setup 5\ISCC.exe"

:: Path to 7zip program
SET ZIP_EXE="C:\Program Files\7-Zip\7z.exe"


echo ================== CLEANING DIRECTORY AND CREATING FOLDERS ==================
cd %BUILDER_LOC%
CALL npm install
RD /Q /S output
MKDIR output
cd output

:: Path to the output directory. If you change this directory, make sure that all  *.iss scripts reflect that change too
SET BUILD_OUTPUT=%cd%
MKDIR %BUILD_OUTPUT%\en
MKDIR %BUILD_OUTPUT%\no


:: Path to pc app source folder
cd %BUILDER_LOC%
cd ../../source
SET SOURCE_LOCATION=%cd%


echo ================== BUILDING PCAPP AND REPLACING ICONS ==================

:: =====================BUILDING BComeSafe EN VERSION===================================

:: Replace the config file
COPY /Y %BUILDER_LOC%config\config-en.js %SOURCE_LOCATION%\front\js\config.js

:: build the node application
cd %BUILDER_LOC%
CALL node buildApplication.js %BUILD_OUTPUT%\en

:: This command will replace the icons for windows applications
cd %BUILD_OUTPUT%\en\alarm\win64\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033

cd %BUILD_OUTPUT%\en\alarm\win32\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033


:: =====================BUILDING BComeSafe NO VERSION===================================

:: Replace the config file
COPY /Y %BUILDER_LOC%config\config-no.js %SOURCE_LOCATION%\front\js\config.js

:: build the node application
cd %BUILDER_LOC%
CALL node buildApplication.js %BUILD_OUTPUT%\no

:: This command will replace the icons for windows applications
cd %BUILD_OUTPUT%\no\alarm\win64\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033

cd %BUILD_OUTPUT%\no\alarm\win32\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033


:: =====================BUILDING WINDOWS INSTALLERS===================================

echo ================== BUILDING INSTALLERS ==================
cd %BUILDER_LOC%scripts\no_compression\

CALL %INNO_EXE% /Qp "32setup_en.iss"
CALL %INNO_EXE% /Qp "32setup_no.iss"
CALL %INNO_EXE% /Qp "64setup_en.iss"
CALL %INNO_EXE% /Qp "64setup_no.iss"

echo ================== CLEANING UP FOLDERS ==================

:: Create output directory for osx
cd %BUILD_OUTPUT%
MKDIR output
cd %BUILD_OUTPUT%\output
MKDIR en
MKDIR no

:: Remove windows builds
cd %BUILD_OUTPUT%\en\alarm
RD /Q /S win32
RD /Q /S win64

:: Move folders to match the expected folder structure for osx build phase
cd %BUILD_OUTPUT%\en
MOVE /Y %BUILD_OUTPUT%\en\alarm %BUILD_OUTPUT%\output\en\alarm

:: Remove windows builds
cd %BUILD_OUTPUT%\no\alarm
RD /Q /S win32
RD /Q /S win64

:: Move folders to match the expected folder structure for osx build phase
cd %BUILD_OUTPUT%\no
MOVE /Y %BUILD_OUTPUT%\no\alarm %BUILD_OUTPUT%\output\no\alarm

:: Zip output for osx, and remove the folder
cd %BUILD_OUTPUT%
CALL %ZIP_EXE% a output.zip output
RD /Q /S output

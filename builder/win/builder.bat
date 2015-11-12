@ECHO OFF

:: ====================================== BUILDER CONSTANTS ============================================
:: Builder location (DO NOT CHANGE)
SET BUILDER_LOC=%~dp0

:: Path to Resource Hacker exe file
SET RH_EXE="C:\Program Files (x86)\Resource Hacker\ResourceHacker.exe"

:: Path to Inno Setup Builder exe file
SET INNO_EXE="C:\Program Files (x86)\Inno Setup 5\ISCC.exe"


echo ================== CLEANING DIRECTORY AND CREATING FOLDERS ==================
cd %BUILDER_LOC%
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
cd %BUILD_OUTPUT%\en
CALL nwbuild -p win32,win64 %SOURCE_LOCATION% -v --v 0.12.3

:: This command will replace the icons for windows applications
cd %BUILD_OUTPUT%\en\build\alarm\win64\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033

cd %BUILD_OUTPUT%\en\build\alarm\win32\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033


:: =====================BUILDING BComeSafe NO VERSION===================================

:: Replace the config file
COPY /Y %BUILDER_LOC%config\config-no.js %SOURCE_LOCATION%\front\js\config.js

:: build the node application
cd %BUILD_OUTPUT%\no
CALL nwbuild -p win32,win64 %SOURCE_LOCATION% -v --v 0.12.3

:: This command will replace the icons for windows applications
cd %BUILD_OUTPUT%\no\build\alarm\win64\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033

cd %BUILD_OUTPUT%\no\build\alarm\win32\
%RH_EXE% -addoverwrite "alarm.exe", "alarm.exe", "%BUILDER_LOC%img\app-icon.ico", ICONGROUP, IDR_MAINFRAME, 1033


:: =====================BUILDING WINDOWS INSTALLERS===================================

echo ================== BUILDING INSTALLERS ==================
cd %BUILDER_LOC%scripts

CALL %INNO_EXE% /Qp "32setup_en.iss"
CALL %INNO_EXE% /Qp "32setup_no.iss"
CALL %INNO_EXE% /Qp "64setup_en.iss"
CALL %INNO_EXE% /Qp "64setup_no.iss"

echo ================== CLEANING UP FOLDERS ==================

cd %BUILD_OUTPUT%\en

RD /Q /S build

cd %BUILD_OUTPUT%\no
RD /Q /S build

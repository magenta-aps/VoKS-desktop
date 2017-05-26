; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={}
AppName=Alarm
AppVersion=1.0
;AppVerName=Alarm 1.0
AppPublisher=BComeSafe
AppPublisherURL=http://www.bcomesafe.com/
AppSupportURL=http://www.bcomesafe.com/
AppUpdatesURL=http://www.bcomesafe.com/
DefaultDirName={pf}\BComeSafe Alarm
DefaultGroupName=Alarm
AllowNoIcons=yes
OutputDir=..\..\output\en
OutputBaseFilename=alarm-setup-win64
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
UninstallDisplayIcon={app}\alarm.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}";
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "..\..\output\en\alarm\win64\front\*"; DestDir: "{app}\front\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\output\en\alarm\win64\locales\*"; DestDir: "{app}\locales\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\output\en\alarm\win64\node_modules\*"; DestDir: "{app}\node_modules\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\output\en\alarm\win64\alarm.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\d3dcompiler_47.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\ffmpeg.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\icudtl.dat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\index.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\libEGL.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\libGLESv2.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\natives_blob.bin"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\node.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\nw.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\nw_100_percent.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\nw_200_percent.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\nw_elf.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\resources.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\output\en\alarm\win64\snapshot_blob.bin"; DestDir: "{app}"; Flags: ignoreversion

; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{commonstartup}\Alarm"; Filename: "{app}\alarm.exe"
Name: "{group}\Alarm"; Filename: "{app}\alarm.exe"; Parameters: "--show-window"
Name: "{group}\{cm:UninstallProgram,Alarm}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Alarm"; Filename: "{app}\alarm.exe"; Tasks: desktopicon; Parameters: "--show-window"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Alarm"; Filename: "{app}\alarm.exe"; Tasks: quicklaunchicon; Parameters: "--show-window"

[Run]
Filename: "{app}\alarm.exe"; Description: "{cm:LaunchProgram,Alarm}"; Flags: nowait postinstall skipifsilent

[Code]
function IsAppRunning(const FileName : string): Boolean;
var
    FSWbemLocator: Variant;
    FWMIService   : Variant;
    FWbemObjectSet: Variant;
begin
    Result := false;
    FSWbemLocator := CreateOleObject('WBEMScripting.SWBEMLocator');
    FWMIService := FSWbemLocator.ConnectServer('', 'root\CIMV2', '', '');
    FWbemObjectSet := FWMIService.ExecQuery(Format('SELECT Name FROM Win32_Process Where Name="%s"',[FileName]));
    Result := (FWbemObjectSet.Count > 0);
    FWbemObjectSet := Unassigned;
    FWMIService := Unassigned;
    FSWbemLocator := Unassigned;
end;

function ConfirmAppClosing(Text: string): Boolean;
var
    ResultCode: Integer;
    AppRunning: Boolean;
begin
  Result:=True;
  AppRunning:= IsAppRunning('alarm.exe');
   If AppRunning = True then
   begin
    If MsgBox(Text, mbConfirmation, MB_YESNO) = IDYES then
      begin
        Exec(ExpandConstant('{sys}\taskkill.exe'), '/f /im alarm.exe', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
        Result:=True;
      end
    else
      begin
        Result:=False;
      end;
   end
end;

function InitializeSetup(): Boolean;
begin
  Result:=ConfirmAppClosing('Do you wish to close the application, and continue to install?');
end;

function InitializeUninstall(): Boolean;
begin
  Result:=ConfirmAppClosing('Do you wish to close the application, and continue to uninstall?');
end;
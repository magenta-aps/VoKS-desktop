#! /bin/bash

if [ ! -f /Applications/alarm.app ]; then
	sudo rm /Library/LaunchAgents/com.BComeSafe.pkg.Alarm.cleanup.plist;
	sudo rm /Library/LaunchAgents/com.BComeSafe.pkg.Alarm.plist;
	sudo rm -- "$0";
fi
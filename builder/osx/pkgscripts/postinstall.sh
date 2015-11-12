#!/usr/bin/env sh
set -e

# Launch agent location
LAUNCH_AGENT_SRC="../files/com.BComeSafe.pkg.Alarm.plist"
LAUNCH_AGENT_DEST="$HOME/Library/LaunchAgents/com.BComeSafe.pkg.Alarm.plist"

# Uninstall old launch agent
launchctl unload "$LAUNCH_AGENT_DEST" || true
rm -f "$LAUNCH_AGENT_DEST" || true

# Install launch agent
cp "$LAUNCH_AGENT_SRC" "$LAUNCH_AGENT_DEST" || true
launchctl load "$LAUNCH_AGENT_DEST" || true

# Open application
open -a "alarm"

exit 0
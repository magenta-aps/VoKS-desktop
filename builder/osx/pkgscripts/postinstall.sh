#!/usr/bin/env sh
set -e

# Launch agent location
LAUNCH_AGENT_DEST="/Library/LaunchAgents/com.BComeSafe.pkg.Alarm.plist"

# Uninstall old launch agent
launchctl unload "$LAUNCH_AGENT_DEST" || true

# Install launch agent
launchctl load "$LAUNCH_AGENT_DEST" || true

exit 0
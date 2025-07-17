const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function runAppleScriptForName(name) {
  return new Promise((resolve, reject) => {
    const scriptContent = `
-- Simulate mouse click at 'Close' button
-- do shell script "cliclick c:139,93"
-- delay 1

-- Simulate mouse click at 'Do not Save'
-- do shell script "cliclick c:585,566"
-- delay 3

-- Set the paths
set templatePath to "/Users/mcbookpro13/Desktop/coke/F1_XTool_Backend/output/template.xcs"
set pngPath to "Users/mcbookpro13/Desktop/coke/F1_XTool_Backend/output/${name}.png"

-- Step 1: Open the XCS template project
-- do shell script "open -a 'xTool Creative Space' " & quoted form of templatePath

-- Step 2: Wait for XCS to fully launch
-- delay 7

-- Define the target size
set targetWidth to 1440
set targetHeight to 900

-- Get the main screen size
tell application "Finder"
	set screenBounds to bounds of window of desktop
end tell

set screenWidth to item 3 of screenBounds
set screenHeight to item 4 of screenBounds

-- Calculate centered position
set posX to (screenWidth - targetWidth) / 2
set posY to (screenHeight - targetHeight) / 2

-- Resize and reposition the XCS window
tell application "System Events"
	tell application process "xTool Creative Space"
		set frontmost to true
		delay 0.5
		set position of front window to {posX, posY}
		set size of front window to {targetWidth, targetHeight}
	end tell
end tell

-- Step 3: Import the PNG using Cmd+Shift+I and typing the file path
tell application "System Events"
	tell application process "xTool Creative Space"
		-- Press Command + N (New)
		keystroke "n" using {command down}
		delay 3

		-- Press Command + I (Import)
		keystroke "i" using {command down}
		delay 2

		-- Type the full path of the PNG
		keystroke "/"
        delay 0.5

        --delay
        keystroke pngPath
        delay 1

        -- Press Return to confirm the path
		keystroke return
        delay 1

        -- Press Return to confirm the import
		keystroke return
        delay 1

	end tell
end tell

-- Simulate mouse click at 'Trace' button
do shell script "cliclick c:762,206"
delay 1

-- Simulate mouse click at 'Save' button
do shell script "cliclick c:1427,862"
delay 1


-- Simulate mouse click at 'Y' button
do shell script "cliclick c:396,195"
delay 0.5

-- Simulate type '50' for Height
tell application "System Events"
	keystroke "100"
    delay 0.5

    -- Press Return to confirm the input
    keystroke return
    delay 0.5
end tell

-- Simulate mouse click at 'Center' of original Image
do shell script "cliclick c:742,566"
delay 0.5


-- Simulate Del keyboard
tell application "System Events"
	key code 51
    delay 0.5
end tell

-- Simulate mouse click at 'Center' of Traced Image
do shell script "cliclick c:707,869"
delay 0.5

-- Simulate mouse click at 'Y' button
do shell script "cliclick c:396,195"
delay 0.5

-- Simulate type '50' for Height
tell application "System Events"
	keystroke "50"
    delay 0.5

    -- Press Return to confirm the input
    keystroke return
    delay 0.5
end tell

-- Simulate mouse click at 'Engrave' button
do shell script "cliclick c:1439,386"
delay 0.5

-- Simulate mouse click at 'Unknown Material' button
do shell script "cliclick c:1475,139"
delay 0.5

-- Simulate mouse click at 'Select Material' button
do shell script "cliclick c:718,506"
delay 0.5

-- Simulate mouse click at 'Save' button
do shell script "cliclick c:1097,753"
delay 0.5

-- Simulate mouse click at 'Laser Type' button
do shell script "cliclick c:1521,575"
delay 0.5

-- Simulate mouse click at 'IR' button
do shell script "cliclick c:1410,631"
delay 0.5

-- Simulate mouse click at 'Speed' button
do shell script "cliclick c:1332,676"
delay 0.5

-- Simulate mouse click at 'LinesPerCM' button
do shell script "cliclick c:1521,749"
delay 0.5

-- Simulate mouse click at '220' button
do shell script "cliclick c:1424,596"
delay 0.5

-- Simulate mouse click at 'Height' button
do shell script "cliclick c:398,223"
delay 0.5

-- Simulate type '15' for Height
tell application "System Events"
	keystroke "15"
    delay 0.5

    -- Press Return to confirm the input
    keystroke return
    delay 0.5
end tell

-- Simulate mouse click at 'X' button
do shell script "cliclick c:259,186"
delay 0.5

-- Simulate type '35' for Height
tell application "System Events"
	keystroke "35"
    delay 0.5

    -- Press Return to confirm the input
    keystroke return
    delay 0.5
end tell

-- Simulate mouse click at 'Frame' button
do shell script "cliclick c:1424,900"
delay 0.5
`;

    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.scpt`);

    // Step 1: Write the script to a temp file
    fs.writeFile(tempFilePath, scriptContent, (err) => {
      if (err) return reject(err);

      // Step 2: Execute the AppleScript
      exec(`osascript "${tempFilePath}"`, (error, stdout, stderr) => {
        // Step 3: Delete the temp file
        fs.unlink(tempFilePath, () => {
          if (error) return reject(stderr || error.message);
          resolve(stdout);
        });
      });
    });
  });
}

module.exports = { runAppleScriptForName };
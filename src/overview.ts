/**
 * # Home Security Setup
 * A simple homebrew alarm system.
 * 
 * ##Installation
 * 1. User Setup
 *     - create a standard user `obs`
 *     - Create folder `/Users/<user>/homeSec`
 *     - Create folder `/Users/<user>/homeSec/log`
 *     - Create folder `/Users/<user>/homeSec/alarm`
 *     - Create folder `/Users/<user>/homeSec/snap`
 *     - Create folder `/Users/<user>/homeSec/C1_C4D6553FAFB7/`
 *     - Create folder `/Users/<user>/homeSec/C1_C4D6553FAFB7/snap`
 *     - Create folder `/Users/<user>/homeSec/C1_C4D6553FAFB7/record`
 *     - install `nodejs` globally
 * 2. System Preferences
 *     - select `Desktop & Screen Saver`, set `Start after:` to `never`
 *     - select `Energy Saver`; set `Computer Sleep` to `never`; deselect `Put hard disk to sleep`
 *     - select `Security & Privacy`; deselect `Require Password`
 *     - select `Network-> Advanced->TCP/IP`; set `COnfigure IPv4` to `Using DHCP with manual address;
 *       set `IPv4 Address` to `192.168.1.101`
 *     - install voice `Allison`
 *         - open panel `Accessibility->Speech`; 
 *         - select `System Voice: Custom` and select `Allison`. Then close. 
 *           Voice will be downloaded automatically. 
 * 3. copy into `homeSec` folder:
 *     - the `dev/node` folder
 *     - replace the `hsNode` alias with the original source folder
 *     - the `xcode/CameraOSX.app` application
 *     - the `postRestartScript` script
 *     - the `start FTP` script
 *     - the `relayChatCommands.applescript` script
 * 4. Messages setup
 *     - open `Messages` and select `Messages->Preferences->AppleScript Handler->Open Scripts Folder`
 *       to create the `~/Library/Application Scripts/com.apple.iChat` folder
 *     - copy into that folder the `relayChatCommands.applescript` script
 *     - close and reopen the `Messages->Preferences`.
 *     - select `relayChatCommands.applescript` in `AppleScript Handler->Open Scripts Folder`
 * 5. Startup behaviour
 *     - in `System Preferences`, select `Users & Groups` and the relevant user
 *     - select `Login Items` and add the `postRestartScript` script
 * 6. Network Setup 
 *     - FTP server for `puppy`: in `Terminal`, ruyn the `start FTP` script
 *     - fixed IP address: 
 *     - Only needed to run once after System Upgrade
 * 7. Setup Contacts
 *     - open `Contacts`
 *     - define entry `Hauke Schmidt` and `Regine Schmidt`
 * 8. Miscelaneous
 *     - disable `are you sure you want to restart your computer now` question: ???
 *     - `Terminal->Preferences->Profiles->Shell`:
 *         - `When the shell exits: Close the window`
 *         - `Ask befor closing: Never` 
 */

 /**
 # Alarm Lib
 A simple homebrew alarm system.
 ## Installation
 ### How it works:

 ### Installation Steps
 On the target system: 
 1. create folder and content structure:
     - `/Downloads/homesec/`
     - `/Applications/homesec/MyCamera/CameraOSX.app`
 2. install Messages Script:
     - copy _relayChatCommand.applescript_ to `~/Library/Application Scripts/con.apple.iChat`
     - open Messages
     - under `Preferences...` -> `General` -> `AppleScript handler`, select _relayChatCommand.applescript_ 
 3. add to login items:
     - _postRestartScript.app_
     - _Safari_
     - _Messages_
 4. System Preferences settings:
     - `Accessibility` -> `SystemVoice`: install voice _Allison_ in 
     - `Network`: set manual IP Address: 192.168.1.101
     - `Network`: check 'Ask to join Networks' 

 */
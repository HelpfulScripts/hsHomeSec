# Home Security Setup
A simple homebrew alarm system for OSX High Sierra

- supports cameras with built-in web api. Currently tested
    - WansView Q3S
    - Foscam C1
- creates its own ftp server and configures devices to send snapshots and videos there
- communicates with users via email and OSX services Messages, Facetime 
- receives remote user commands vial email

See [documentation for more details](http://helpfulscripts.github.io/hsHomeSec/indexGH.html#!/api/hsHomeSec/0)

## Installation
1. `> git clone https://github.com/HelpfulScripts/hsHomeSec.git`
2. `> cd hsHomeSec`
3. `> npm i`

## Setup
1. create homeCfg.json: `> cp src/config/homeCfg-template.json src/config/homeCfg.json`
2. create a recordings directory: `> mkdir recordings`
3. configure homeCfg.json with server IPs and available cameras
- hint: it may be a good idea to also configure your DHCP server to assign fixed addresses to the computer 
  running the homeSec server, as well as to connected devices.
4. configure Mail to communicate with homeSec
- copy script to mail script folder: `> cp src/osascript/respondToMailAs.scpt ~/Library/Application\ Scripts/com.apple.mail`.
if necessary, first create the `com.apple.mail` folder
- on OSX, open Mail and ensure that a valid mail account is active
- open `Preferences` -> `Rules`, then `Add Rule`
- give it a desciptive name, such as `talkToHomeSec`
- configure it as <code>if `any` of the folowing conditions are met: `Every Message` 
perform the following actions: `Run Applescript`</code> and select respondToMailAs.scpt from the popdown
5. Optional: Setup your Mac as follows
- select `Desktop & Screen Saver`, set `Start after:` to `never`
- select `Energy Saver`; set `Computer Sleep` to `never`; deselect `Put hard disk to sleep`
- install voice `Allison`
    - open panel `Accessibility->Speech`; 
    - select `System Voice: Custom` and select `Allison`. Then close. 
      Voice will be downloaded automatically.
- `Terminal->Preferences->Profiles->Shell`:
    - `When the shell exits: Close the window`
    - `Ask befor closing: Never`

## Run
- Call `> sudo node ./index` to start the system without starting an ftp server
- Call `> sudo node ./index ftp` to start the system with its own ftp server

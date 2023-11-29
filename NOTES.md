# uptimer
Simple logging app that counts up instead of down to time how long tasks take to complete.

Enter goal, then GO!

When done, log will show how long all tasks have taken.



# dev notes
Created with Electron Forge: https://www.electronforge.io/config/configuration
Helpful Links:
- https://www.reddit.com/r/electronjs/comments/10dh3lz/what_is_the_proper_way_to_permanently_store_data/
- https://stackoverflow.com/questions/75844516/user-save-progress-to-file-in-electron-react-app

GITHUB_TOKEN needs to be set in shell, not in .env:
- https://github.com/electron/forge/issues/3221
- https://apple.stackexchange.com/questions/356441/how-to-add-permanent-environment-variable-in-zsh

## to do

/initial
[ x ] start & stop timer
[ x ] input goal (for a task)
[ x ] store task after timer done
[ x ] display log of tasks in table

/pt2
[ x ] fetch logData on load
[ x ] fix unique id issue
[ x ] clean up UI

/v0.1.0   || Initial Commit
[ x ] fix scroll issue
[ x ] learn how to package
[ x ] upload to github

/v0.1.1   || Fix initial commit bugs & missing features
[ x ] reset timer on new goal
[ x ] start without goal behavior
-- extras
[ x ] allowed 'enter' to start goal
[ x ] condensed goal form to one button

/v0.2.0   || Adding edit functionality
[ x ] reset log
[ x ] clean up UI
[ ] allow for editing of notes
  [ x ] successfully edit JSON file
  [ x ] update display after editing

//v0.2.1
[ ] update task log UI (convert to table or clean up list)

/ later
[ ] display in system tray
[ ] add nanoseconds
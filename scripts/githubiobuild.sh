cordova build browser &&
cordova build android --release &&
rsync -r platforms/browser/www/ ../asampley.github.io/factorio/
sudo cp platforms/android/app/build/outputs/apk/release/app-release.apk ../asampley.github.io/factorio/build/android/factorio-ratio-assistant.apk

cordova build browser &&
cordova build android --release &&

sudo rsync -r --delete platforms/browser/www/ /var/www/factorio/
sudo mkdir -p /var/www/factorio/build/android/
sudo cp platforms/android/app/build/outputs/apk/release/app-release.apk /var/www/factorio/build/android/factorio-ratio-assistant.apk

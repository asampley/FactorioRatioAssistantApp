cordova build browser &&
cordova build android --release &&

rsync -r --delete platforms/browser/www/ ../asampley.github.io/factorio/
mkdir -p ../asampley.github.io/factorio/build/android/
cp platforms/android/app/build/outputs/apk/release/app-release.apk ../asampley.github.io/factorio/build/android/factorio-ratio-assistant.apk

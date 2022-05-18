# VPN user managment node app

## Initialization

The script `src/initializeApp` must be run before starting the app. It prepares the local db with the necessary data so the VPN daemon can initialize correctly.

It is recommended to run `src/initializeApp` in the Dockerfile's entrypoint and then starting simultaneously the VPN daemon and the node app by running `src/index`.

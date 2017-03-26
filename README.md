# node-docker-debug

This library creates a simple command (`dbug`) for running the docker script

```sh
docker-compose up --build && docker-compose down
```

This script performs 2 extra steps to support easier node debugging:

1. It injects the runtime-calculated host IP address as an environment variable (`HOST_IP`)
  ```sh
HOST_IP=$(ifconfig | awk '/broadcast/ { print $2 }')
```

1. It watches stdout for a node --inspect chrome-devtools url and opens a new Chrome tab for debugging

## setup

1. Your docker container should run node with the `--inspect` flag
1. Your docker container should expose the node inspect port

## port

If you have customized your node inspect port to be different from the default (9229), you may pass it to dbug as either an environment variable

```sh
PORT=9220 dbug
```

or as the first paramter

```sh
dbug 9220
```

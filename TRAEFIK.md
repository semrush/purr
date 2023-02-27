# access to http api

Purr provides several http endpoints. 
For local development you can use traefik.


## Setup traefik

Modify  `/etc/hosts` and add 
```
0.0.0.0 purr.traefik.lcl
```
to it. 

Default docker-compose configured to provice access to `purr.traefik.lcl` hostname
It should be opened in browser on port 80.
# Información útil

Este repositorio solamente tiene includios todos los archivos de frontend, para implementar la API localmente deberá utilizar el otro repositorio.

## Frontend API local
Algo importante a tener en cuenta es que en el archivo <b>"/constants/enviroment"</b> tenemos el acceso a nuestra API del proyecto del backend, pero desde nuestro dispositivo accederemos mediante la IP local de nuestro equipo, por ende si estamos en windows o linux podemos hacer lo siguiente:

```bash
ipconfig #windows

ipconfig getifaddr en0 #mac para wifi
ipconfig getifaddr en1 # mac para conexión por cable

ifconfig #mac o linux
```

Una vez nos aparezca "Dirección IPv4" en windows/mac/linux y por ende esa dirección la cambiaremos en API_URL sumandole el puerto 3000. por ejemplo si mi dirección IPv4 es 192.168.1.51 quedaría como http://192.168.1.51:3000, damos a guardar y listo.

En este caso ya podemos dirigirnos a la carpeta del proyecto de front y realizamos los siguientes comandos. 

## Frontend API Remota

```bash
npm install
npx expo start
```

Ya podemos escanear el QR para utilizar Expo (con la cárama en IOS o con la app en Android), en caso de que en android la versión de la app de expo no sea la adecuada, podemos decargar la antigua o directamente instalar SDK con Android Studio y ejecutar desde el comando "a" una vez iniciada la app, la cual se puede conectar via usb.

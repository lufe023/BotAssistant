# Hotel Whatsapp BotAssistant

BotAssistant es un proyecto diseñado para atender a los clientes de un hotel a través de WhatsApp. Su función principal es gestionar reservaciones, brindar atención al cliente, proporcionar información de disponibilidad y precios, todo mediante WhatsApp. Además, el proyecto incluye funcionalidades completas de administración hotelera.

## Características

- **Bot de atención al cliente:** Permite a los usuarios realizar consultas y gestionar reservaciones vía WhatsApp.
- **Gestión hotelera:** Herramientas para administrar habitaciones, huéspedes, precios y disponibilidad.
- **Punto de venta:** Sistema integrado para gestionar las ventas del hotel.
- **Informes:** Generación de reportes detallados sobre habitaciones, huéspedes y más.
- **Integración con WhatsApp Web:** Automatización de interacciones usando WhatsApp Web.
--**Atencion al cliente via el chat de la app y directamente llegando los mensajes al whatsapp del cliente.

## Requisitos previos

Antes de comenzar, asegúrate de tener los siguientes elementos instalados en tu entorno:

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Puppeteer](https://pptr.dev/) (se instala con las dependencias del proyecto)

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/lufe023/BotAssistant.git
   cd BotAssistant
   ```

2. Instala las dependencias:

   ```bash
   npm install
   # o
   yarn install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
  NODE_ENV='developer'
PORT=9000
HOST="http://localhost:9000"
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASS= 
DB_NAME=
JWT_SECRET=


#Session con google
FRONTEND_HOST=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=

#Configuracion para enviar emails de recuperacion de contraseña, buscar la configuracion de correo smtp de su provedor de correo electronico
HOST_EMAIL_SENDER=
HOST_EMAIL_PORT=
EMAIL_HOST_USER=
PASSWORD_HOST_USER=
   ```

4. Inicia la aplicación:

   ```bash
   npm start
   # o
   yarn start
   ```

5. Escanea el código QR que aparecerá en la terminal con tu aplicación de WhatsApp para iniciar la sesión.

## Uso

1. Una vez que el bot esté conectado, comenzará a responder mensajes automáticamente.
2. Los usuarios pueden consultar disponibilidad, precios y realizar reservaciones directamente desde WhatsApp o pedir hablar con un agente humano.
3. Los usuarios podrán hablar con los agentes humanos que se encuentren disponibles en la app.
4. Accede al panel administrativo para gestionar habitaciones, generar informes y realizar tareas administrativas del hotel.

## Estructura del proyecto

```
BotAssistant/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   └── index.js
├── .env.example
├── package.json
├── README.md
└── ...
```

- **`src/controllers/`**: Contiene la lógica del bot y las funcionalidades administrativas.
- **`src/services/`**: Servicios auxiliares para la gestión de datos.
- **`src/utils/`**: Utilidades comunes para el proyecto.
- **`index.js`**: Archivo principal del backend.

## Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto, sigue los pasos a continuación:

1. Haz un fork del repositorio.
2. Crea una rama con una descripción clara de tu funcionalidad:
   ```bash
   git checkout -b nueva-funcionalidad
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Agrega nueva funcionalidad"
   ```
4. Haz un push a tu rama:
   ```bash
   git push origin nueva-funcionalidad
   ```
5. Abre un Pull Request en el repositorio original.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

## Contacto

- **Autor:** Luis Gómez
- **Correo:** lufe023@gmail.com
- **GitHub:** [lufe023](https://github.com/lufe023)

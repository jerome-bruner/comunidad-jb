/* ==========================================================
   Comunidad JB — config.js
   ----------------------------------------------------------
   LO ÚNICO QUE SE EDITA A MANO EN TODA LA APP.

   Pega aquí la liga /exec del proyecto PORTAL_PADRES ya
   publicado. Es la MISMA liga del portal, pero SIN el /a/~/:
   ese truco era para abrir la página con varias cuentas de
   Google iniciadas, y aquí no se abre ninguna página —la app
   solo manda datos—, así que la forma simple es la correcta.

   OJO: después de pegar los archivos 02, 10 y 70 en Apps
   Script hay que PUBLICAR VERSIÓN NUEVA. Si no, la liga sigue
   sirviendo la versión anterior, que no tiene doPost, y la app
   va a decir que no se pudo conectar.
   ========================================================== */

var CONFIG = {

  /* Ejemplo:
     https://script.google.com/macros/s/AKfycbx.../exec            */
  API: 'https://script.google.com/macros/s/AKfycbxdXsq8FuagLn9LViCdsw8_8VL8D9r3SKq6VfW-D5bmwSxS0qLNUsucH4MFINZti5sImw/exec',

  COLEGIO: 'COLEGIO JEROME BRUNER',
  CICLO: 'Ciclo escolar 2026 – 2027',
  CORREO_CONTACTO: 'coordinacioncolegiojbsecundaria@jeromebrunermorelia.edu.mx',
  WHATSAPP: '',          // opcional: '524431234567' para el botón de contacto

  /* Sube este número cada vez que cambies archivos de la app.
     Es lo que hace que el celular de los papás se entere de que
     hay versión nueva en vez de seguir con la que tiene guardada. */
  VERSION: '1.1.0'
};

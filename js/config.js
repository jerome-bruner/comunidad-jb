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
  /* ----------------------------------------------------------
     WHATSAPP DE LA DIRECCIÓN

     Con número aquí, el botón de contacto de la app abre WhatsApp
     con el mensaje ya empezado y el nombre del alumno adentro.
     Vacío, abre el correo de arriba.

     CÓMO SE ESCRIBE: solo dígitos, con clave de país y SIN el +,
     sin espacios y sin guiones. Para México son 52 y los 10
     dígitos del celular:

         WHATSAPP: '524431234567'

     Si al probarlo WhatsApp dice que el número no es válido,
     ponle un 1 después del 52 ('5214431234567'): los números
     mexicanos dados de alta hace años todavía llevan ese 1.
     Pruébalo tú antes de subirlo.
     ---------------------------------------------------------- */
  WHATSAPP: '524438576891',

  /* ----------------------------------------------------------
     LAS PESTAÑAS QUE ESTÁN ENCENDIDAS

     Aquí se prende cada pestaña cuando ya tenga datos de verdad.
     Mientras no esté en esta lista, el papá no la ve: ni la
     pestaña ni el espacio. Eso es a propósito — una pestaña que
     dice «en construcción» invita a tocarla todos los días para
     ver si ya, y acaba pareciendo que la app está a medias.

     El orden de esta lista es el orden en que salen abajo.
     Los nombres válidos son exactamente estos cinco:
       calificaciones · pagos · cooperativa · calendario · credencial

     Con una sola encendida, la barra de abajo ni aparece.
     ---------------------------------------------------------- */
  TABS: ['calificaciones'],

  /* Sube este número cada vez que cambies archivos de la app.
     Es lo que hace que el celular de los papás se entere de que
     hay versión nueva en vez de seguir con la que tiene guardada. */
  VERSION: '1.5.1'
};

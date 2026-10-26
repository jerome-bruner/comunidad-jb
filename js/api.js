/* ==========================================================
   Comunidad JB — api.js
   ----------------------------------------------------------
   El único lugar de la app que habla con Apps Script.

   EL DETALLE QUE ROMPE TODO ESTO SI SE TOCA
   La cabecera va como 'text/plain;charset=utf-8', NO como
   'application/json'. Apps Script no manda cabeceras CORS, y
   el navegador solo deja pasar un POST a otro dominio sin
   pedir permiso previo cuando el tipo de contenido es de los
   "simples" (text/plain es uno). Con application/json el
   navegador manda primero una petición de permiso que Apps
   Script nunca contesta, y la app falla como si el servidor
   estuviera caído. Del otro lado, el 70_api.gs parsea el
   cuerpo a mano, así que el JSON llega igual.

   Tampoco se manda 'credentials': la app no necesita que el
   papá tenga cuenta de Google, y mandar cookies de Google
   sería justo lo que rompe a quien trae varias sesiones.
   ========================================================== */

var API = (function () {

  /** El texto que identifica el teléfono, para la lista de sesiones. */
  function dispositivo() {
    try { return (navigator.userAgent || '').substring(0, 120); }
    catch (e) { return ''; }
  }

  /**
   * Manda una acción y regresa la respuesta ya parseada.
   * Nunca lanza: los errores vuelven como { ok:false, mensaje }
   * para que cada pantalla los pinte igual que los del servidor
   * y no haya dos caminos de error.
   */
  function pedir(accion, datos) {
    if (!CONFIG.API || CONFIG.API.indexOf('PEGA_AQUI') === 0) {
      return Promise.resolve({
        ok: false,
        mensaje: 'La aplicación no está configurada. Avise a la dirección del colegio.'
      });
    }

    var cuerpo = Object.assign({ accion: accion, dispositivo: dispositivo() }, datos || {});

    return fetch(CONFIG.API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(cuerpo),
      redirect: 'follow'       // Apps Script contesta con un salto a googleusercontent
    })
      .then(function (r) { return r.text(); })
      .then(function (texto) {
        try {
          return JSON.parse(texto);
        } catch (e) {
          // Pasa cuando la liga apunta a una versión sin doPost:
          // Apps Script devuelve una página de error en HTML.
          return {
            ok: false,
            mensaje: 'El servidor contestó algo que no entendimos. Intente más tarde.'
          };
        }
      })
      .catch(function () {
        return {
          ok: false,
          sinRed: true,
          mensaje: 'No hay conexión. Revise su internet e intente de nuevo.'
        };
      });
  }

  return {
    verInvitacion: function (token) { return pedir('verInvitacion', { token: token }); },

    registrar: function (token, correo, nombre, parentesco) {
      return pedir('registrar', {
        token: token, correo: correo, nombre: nombre, parentesco: parentesco
      });
    },

    crearContrasena: function (correo, codigo, contrasena) {
      return pedir('crearContrasena', {
        correo: correo, codigo: codigo, contrasena: contrasena
      });
    },

    entrar: function (correo, contrasena) {
      return pedir('entrar', { correo: correo, contrasena: contrasena });
    },

    sesion: function (token) { return pedir('sesion', { sesion: token }); },
    cerrarSesion: function (token) { return pedir('cerrarSesion', { sesion: token }); },
    olvide: function (correo) { return pedir('olvide', { correo: correo }); },

    cambiarContrasena: function (token, actual, nueva) {
      return pedir('cambiarContrasena', { sesion: token, actual: actual, nueva: nueva });
    },

    calificaciones: function (token, grupo, alumno) {
      return pedir('calificaciones', { sesion: token, grupo: grupo, alumno: alumno });
    },

    pdf: function (token, grupo, alumno) {
      return pedir('pdf', { sesion: token, grupo: grupo, alumno: alumno });
    },

    /** Los avisos vigentes para los hijos de este tutor. */
    avisos: function (token) { return pedir('avisos', { sesion: token }); }
  };
})();


/* ==========================================================
   MEMORIA DEL TELÉFONO
   ----------------------------------------------------------
   Aquí NO se guarda la contraseña: se guarda el token de la
   sesión, que la dirección puede cortar desde su panel sin
   pedirle nada al papá. Si el navegador tiene bloqueado el
   almacenamiento (modo privado de algunos celulares), todo
   sigue funcionando: solo vuelve a pedir la contraseña cada
   vez, en vez de tronar.
   ========================================================== */

var MEMORIA = {
  leer: function (llave) {
    try { return localStorage.getItem('jb_' + llave); } catch (e) { return null; }
  },
  guardar: function (llave, valor) {
    try { localStorage.setItem('jb_' + llave, valor); } catch (e) { /* ni modo */ }
  },
  borrar: function (llave) {
    try { localStorage.removeItem('jb_' + llave); } catch (e) { /* ni modo */ }
  }
};

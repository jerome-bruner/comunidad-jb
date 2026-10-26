/* ==========================================================
   Comunidad JB — avisos.js
   ----------------------------------------------------------
   Los avisos del colegio, DENTRO de la app.

   POR QUÉ NO SON NOTIFICACIONES DEL CELULAR
   Una notificación de verdad —la que suena con la app cerrada—
   obliga a firmar y cifrar cada mensaje con llaves que Apps
   Script no puede generar: no tiene esas funciones de cifrado.
   Haría falta un servicio aparte (Firebase) nada más para
   mandarlas.

   Entonces estos avisos funcionan así: el papá los ve al abrir
   la app. Hay una tira arriba mientras tenga alguno sin leer, y
   un punto rojo en el menú. Es lo que se puede hacer sin
   infraestructura, y funciona igual en todos los teléfonos.
   Lo urgente sigue yendo por correo.

   CÓMO SE PUBLICA UNO
   En el Libro Directivo, con atajoPublicarAviso(). Se puede
   mandar a toda la secundaria o a un solo grupo.

   LO QUE NO SE GUARDA EN EL TELÉFONO
   El texto de los avisos nunca se guarda: se pide fresco cada
   vez. Lo único que se recuerda es cuáles ya vio, para no
   volver a marcárselos como nuevos.
   ========================================================== */

var AVISOS = {
  lista: [],
  pedidos: false,

  /** Los que todavía no ha visto en este teléfono. */
  sinLeer: function () {
    var vistos = this.vistos();
    return this.lista.filter(function (a) {
      return vistos.indexOf(String(a.id)) === -1;
    });
  },

  vistos: function () {
    var t = MEMORIA.leer('avisosVistos') || '';
    return t ? t.split(',') : [];
  },

  marcarTodosVistos: function () {
    var ids = this.lista.map(function (a) { return String(a.id); });
    // Solo se guardan los que siguen vigentes: si se guardaran todos
    // los de la historia, la memoria del teléfono crecería sin fin.
    MEMORIA.guardar('avisosVistos', ids.join(','));
  },

  /**
   * Los trae del servidor. Si falla, se queda callado: un aviso
   * que no cargó no debe estorbarle las calificaciones.
   */
  cargar: function (alAcabar) {
    var yo = this;
    if (!ESTADO.sesion) { if (alAcabar) alAcabar(); return; }

    API.avisos(ESTADO.sesion).then(function (r) {
      yo.pedidos = true;
      yo.lista = (r && r.ok && r.avisos) ? r.avisos : [];
      pintarTiraAvisos();
      if (alAcabar) alAcabar();
    });
  }
};

/* ==========================================================
   LA TIRA
   ========================================================== */

function pintarTiraAvisos() {
  var caja = $('tiraAvisos');
  if (!caja) return;

  var nuevos = ESTADO.sesion ? AVISOS.sinLeer() : [];
  if (!nuevos.length) {
    caja.className = 'tira oculto';
    caja.innerHTML = '';
    return;
  }

  var texto = nuevos.length === 1
    ? '<b>Aviso del colegio:</b> ' + esc(nuevos[0].titulo)
    : '<b>' + nuevos.length + ' avisos del colegio</b> sin leer';

  caja.className = 'tira azul';
  caja.innerHTML = '<div>' + texto + '</div>' +
    '<button class="tirabtn az" id="tiraAvBtn">Ver</button>';

  $('tiraAvBtn').addEventListener('click', vistaAvisos);
}

/* ==========================================================
   LA PANTALLA
   ========================================================== */

function vistaAvisos() {
  etiqueta('Avisos');
  $('tabs').classList.remove('on');

  if (!AVISOS.lista.length) {
    pintar(
      '<div class="icono gris">&#128276;</div>' +
      '<p class="titulo c">No hay avisos</p>' +
      '<p class="texto c">Cuando el colegio publique algo, lo va a ver aquí.</p>' +
      '<button class="btn sec chi" id="btnAtras">Regresar</button>'
    );
    $('btnAtras').addEventListener('click', volverAlHijo);
    return;
  }

  var vistos = AVISOS.vistos();

  var tarjetas = AVISOS.lista.map(function (a) {
    var nuevo = vistos.indexOf(String(a.id)) === -1;
    return '<div class="avisocard' + (nuevo ? ' nuevo' : '') + '">' +
      '<div class="ac-enc">' +
        '<div class="ac-tit">' + esc(a.titulo) + '</div>' +
        (nuevo ? '<span class="ac-nuevo">NUEVO</span>' : '') +
      '</div>' +
      '<div class="ac-fecha">' + esc(a.fecha) +
        (a.destino && a.destino !== 'TODOS' ? ' · ' + esc(a.destino) : '') + '</div>' +
      '<div class="ac-txt">' + esc(a.texto).replace(/\n/g, '<br>') + '</div>' +
    '</div>';
  }).join('');

  pintar(
    '<p class="titulo">Avisos del colegio</p>' +
    '<div class="avisolista">' + tarjetas + '</div>' +
    '<button class="btn sec chi" id="btnAtras">Regresar</button>' +
    '<p class="mini c" style="margin-top:14px">Los avisos urgentes también le llegan ' +
      'por correo electrónico.</p>'
  );

  // Se marcan vistos al abrirlos, no antes.
  AVISOS.marcarTodosVistos();
  pintarTiraAvisos();

  $('btnAtras').addEventListener('click', volverAlHijo);
}

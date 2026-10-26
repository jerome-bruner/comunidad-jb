/* ==========================================================
   Comunidad JB — instalar.js
   ----------------------------------------------------------
   El paso de instalación y la tira que insiste después.

   LO QUE NO SE PUEDE, Y POR QUÉ ESTO ESTÁ ARMADO ASÍ
   Ninguna página puede instalarse sola. Instalar es decisión
   del teléfono y del papá. Lo único que existe es un permiso
   que el navegador le ofrece a la página —y solo en algunos
   navegadores— para abrir el cuadro de instalación.

   Entonces aquí hay cuatro caminos, y la app averigua cuál le
   toca a cada papá:

   1. El navegador avisó que sí se puede  → botón de verdad.
   2. iPhone                              → los tres toques a mano.
   3. Dentro de WhatsApp o Facebook       → que salga al navegador.
   4. Computadora                         → nota de que es para celular.

   Un botón que no funciona hace más daño que no poner botón:
   el papá lo toca, no pasa nada, y llama al colegio. Por eso
   el botón solo aparece cuando el navegador ya confirmó que
   puede abrir el cuadro.

   EL LÍMITE HONESTO
   No se puede obligar. Si bloqueáramos las calificaciones
   hasta detectar la instalación, el papá con iPhone que abrió
   desde WhatsApp quedaría atorado sin salida posible. Por eso
   la presión es: el paso se ve completo y sin brincarlo, y
   después queda una tira arriba que no se puede cerrar hasta
   que instale.
   ========================================================== */

var INSTALAR = {

  /* El navegador deja este evento guardado cuando la app se puede
     instalar. Sin él no hay botón posible. */
  evento: null,

  /* El evento puede llegar DESPUÉS de que ya pintamos la pantalla.
     Cuando llega, se vuelve a pintar para que aparezca el botón. */
  alLlegarElEvento: null,

  /* ---------- de dónde está abriendo ---------- */

  /** Abierta desde el ícono, no desde el navegador. */
  yaInstalada: function () {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
      if (window.navigator.standalone === true) return true;   // iPhone
    } catch (e) { /* si el navegador no sabe contestar, se asume que no */ }
    return false;
  },

  /** Él mismo dijo que ya la agregó (en iPhone no hay cómo comprobarlo). */
  dijoQueYa: function () {
    return MEMORIA.leer('instalada') === '1';
  },

  /** Lo que decide si se le sigue insistiendo. */
  faltaInstalar: function () {
    if (this.yaInstalada()) return false;
    if (this.dijoQueYa()) return false;
    if (this.esEscritorio()) return false;   // en computadora sería molestar
    return true;
  },

  esIOS: function () {
    var ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    // iPad moderno se hace pasar por Mac; se delata por la pantalla táctil.
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  },

  esAndroid: function () {
    return /Android/i.test(navigator.userAgent || '');
  },

  /**
   * Dentro del navegador de otra app. Es el caso más común, porque
   * la liga llega por WhatsApp, y es el único donde instalar de
   * plano no se puede.
   */
  enNavegadorAjeno: function () {
    var ua = navigator.userAgent || '';
    return /WhatsApp|FBAN|FBAV|FB_IAB|Instagram|Line\/|Messenger|MicroMessenger/i.test(ua);
  },

  esEscritorio: function () {
    if (this.esIOS() || this.esAndroid()) return false;
    return !/Mobile|Tablet/i.test(navigator.userAgent || '');
  },

  marcarInstalada: function () {
    MEMORIA.guardar('instalada', '1');
  },

  /** Abre el cuadro de instalación del teléfono. Solo si hay evento. */
  lanzar: function (alAcabar) {
    var ev = this.evento;
    if (!ev) { if (alAcabar) alAcabar(false); return; }
    this.evento = null;        // el navegador solo lo deja usar una vez
    try {
      ev.prompt();
      ev.userChoice.then(function (r) {
        var si = r && r.outcome === 'accepted';
        if (si) INSTALAR.marcarInstalada();
        if (alAcabar) alAcabar(si);
      }).catch(function () { if (alAcabar) alAcabar(false); });
    } catch (e) {
      if (alAcabar) alAcabar(false);
    }
  }
};

/* El navegador avisa aquí que la app se puede instalar. Hay que
   detenerlo para que no saque su propia barrita y para poder usar
   el evento cuando nos toque. */
window.addEventListener('beforeinstallprompt', function (ev) {
  ev.preventDefault();
  INSTALAR.evento = ev;
  if (typeof INSTALAR.alLlegarElEvento === 'function') INSTALAR.alLlegarElEvento();
});

window.addEventListener('appinstalled', function () {
  INSTALAR.marcarInstalada();
  INSTALAR.evento = null;
  pintarTiraInstalar();
});

/* ==========================================================
   LA PANTALLA
   ========================================================== */

/**
 * @param {Object} o
 *   o.alta     true = es parte del alta (acaba de crear su contraseña)
 *   o.alSeguir función que continúa el flujo
 */
function vistaInstalar(o) {
  o = o || {};
  var alta = !!o.alta;
  var seguir = o.alSeguir || function () {};

  // Si abrió desde el ícono, este paso no tiene razón de existir.
  if (INSTALAR.yaInstalada()) { seguir(); return; }

  modoEncabezado(false);
  etiqueta(alta ? 'Último paso' : 'Instalar la app');

  // Cuando el navegador avise tarde que sí se puede, se repinta.
  INSTALAR.alLlegarElEvento = function () {
    INSTALAR.alLlegarElEvento = null;
    vistaInstalar(o);
  };

  var encabezado = alta
    ? '<div class="icono ok">&#10003;</div>' +
      '<p class="titulo" style="text-align:center">Su contraseña quedó lista</p>'
    : '<div class="icono instala">&#128241;</div>' +
      '<p class="titulo" style="text-align:center">Instale la app</p>';

  var porQue =
    '<div class="aviso verde"><b>¿Para qué instalarla?</b> Entra desde el ícono sin buscar ' +
      'la liga, ve los avisos del colegio, y ahí mismo van a estar pagos, cooperativa, ' +
      'calendario y la credencial de su hijo.</div>';

  var salida = '<button class="salida" id="btnSeguir">' +
    (alta ? 'Seguir sin instalar' : 'Ahora no') + '</button>';

  /* ---- 1. el navegador sí deja instalar: botón de verdad ---- */
  if (INSTALAR.evento) {
    pintar(
      encabezado +
      '<p class="texto c">' + (alta ? 'Falta un paso: dejar la app instalada en su teléfono.'
                                    : 'Deje el ícono en su teléfono para no volver a buscar la liga.') + '</p>' +
      iconoDeLaApp() +
      '<p class="mini c">Así se va a ver el ícono</p>' +
      aviso('resIns') +
      '<button class="btn oro" id="btnInstalar">Instalar la app</button>' +
      porQue + salida
    );

    $('btnInstalar').addEventListener('click', function () {
      this.disabled = true;
      INSTALAR.lanzar(function (si) {
        if (si) { vistaInstalada(seguir); return; }
        var b = $('btnInstalar');
        if (b) b.disabled = false;
        ponAviso('resIns', 'ambar',
          'No se completó la instalación. Puede intentar otra vez o seguir sin instalar.');
      });
    });
    $('btnSeguir').addEventListener('click', function () { sinInstalar(seguir); });
    return;
  }

  /* ---- 2. dentro de WhatsApp o Facebook: imposible desde aquí ---- */
  if (INSTALAR.enNavegadorAjeno()) {
    pintar(
      encabezado +
      '<div class="aviso rojo"><b>Está dentro de otra aplicación.</b> Desde aquí la app no ' +
        'se puede instalar. Hay que abrirla en el navegador del teléfono — una sola vez.</div>' +
      pasos([
        'Toque los <b>tres puntos</b> de la esquina de arriba.',
        'Elija <b>Abrir en el navegador</b> (o «Abrir en Chrome»).',
        'Ahí le va a aparecer la opción de instalar.'
      ]) +
      aviso('resIns') +
      '<button class="btn sec" id="btnCopiar">Copiar la liga de la app</button>' +
      '<div class="aviso ambar"><b>Su contraseña ya quedó guardada.</b> Cuando abra en el ' +
        'navegador entra con su correo y su contraseña; no necesita el código otra vez.</div>' +
      salida
    );

    $('btnCopiar').addEventListener('click', function () { copiarLiga('resIns'); });
    $('btnSeguir').addEventListener('click', function () { sinInstalar(seguir); });
    return;
  }

  /* ---- 3. iPhone: tres toques a mano ---- */
  if (INSTALAR.esIOS()) {
    pintar(
      encabezado +
      '<p class="texto c">En iPhone la app se agrega a mano. Son tres toques:</p>' +
      pasos([
        'Toque <b>Compartir</b>, el cuadrito con la flecha, abajo de la pantalla.',
        'Baje en la lista y elija <b>Agregar a pantalla de inicio</b>.',
        'Toque <b>Agregar</b>. Le queda el ícono rojo con el escudo.'
      ], true) +
      '<div class="aviso ambar">Si no ve la opción, es que abrió desde otra aplicación. ' +
        'Abra la liga en <b>Safari</b> y vuelva a intentar.</div>' +
      '<button class="btn sec" id="btnYa">Ya la agregué</button>' +
      salida
    );

    $('btnYa').addEventListener('click', function () {
      INSTALAR.marcarInstalada();
      vistaInstalada(seguir);
    });
    $('btnSeguir').addEventListener('click', function () { sinInstalar(seguir); });
    return;
  }

  /* ---- 4. computadora ---- */
  if (INSTALAR.esEscritorio()) {
    pintar(
      encabezado +
      '<p class="texto c">Puede entrar aquí mismo, pero la app es para el celular: ahí le ' +
        'van a servir los avisos y la credencial.</p>' +
      aviso('resIns') +
      '<div class="aviso ambar"><b>En su teléfono:</b> abra esta misma liga y entre con el ' +
        'mismo correo y la misma contraseña que acaba de crear.</div>' +
      '<button class="btn sec" id="btnCopiar">Copiar la liga de la app</button>' +
      '<button class="btn" id="btnSeguir2">Entrar en esta computadora</button>'
    );
    $('btnCopiar').addEventListener('click', function () { copiarLiga('resIns'); });
    $('btnSeguir2').addEventListener('click', function () { sinInstalar(seguir); });
    return;
  }

  /* ---- 5. Android sin aviso del navegador, u otro caso ---- */
  pintar(
    encabezado +
    '<p class="texto c">Deje la app instalada en su teléfono. Son dos toques en el menú ' +
      'de su navegador:</p>' +
    pasos([
      'Toque el menú de su navegador (los <b>tres puntos</b> de la esquina).',
      'Elija <b>Instalar aplicación</b> o <b>Agregar a pantalla de inicio</b>.'
    ]) +
    '<button class="btn sec" id="btnYa">Ya la agregué</button>' +
    porQue + salida
  );
  $('btnYa').addEventListener('click', function () {
    INSTALAR.marcarInstalada();
    vistaInstalada(seguir);
  });
  $('btnSeguir').addEventListener('click', function () { sinInstalar(seguir); });
}

function sinInstalar(seguir) {
  INSTALAR.alLlegarElEvento = null;
  seguir();
}

function vistaInstalada(seguir) {
  INSTALAR.alLlegarElEvento = null;
  etiqueta('Listo');
  pintar(
    '<div class="icono ok">&#10003;</div>' +
    '<p class="titulo c">La app quedó instalada</p>' +
    '<p class="texto c">De aquí en adelante entre desde el ícono rojo de su pantalla de ' +
      'inicio. Ya no necesita la liga.</p>' +
    iconoDeLaApp() +
    '<button class="btn" id="btn">Continuar</button>'
  );
  $('btn').addEventListener('click', seguir);
}

/* ==========================================================
   PIEZAS
   ========================================================== */

function iconoDeLaApp() {
  return '<div class="iconoapp"><img src="./iconos/icono-192.png" alt="Comunidad JB"></div>';
}

/** Lista de pasos numerados. Con glifos de iOS si se le pide. */
function pasos(lista, conGlifosIOS) {
  var glifos = [
    '<svg viewBox="0 0 24 24"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/>' +
      '<path d="M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/>' +
      '<path d="M12 9v6M9 12h6"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M5 12.5l5 5 9-10"/></svg>'
  ];
  var filas = lista.map(function (t, i) {
    var glifo = (conGlifosIOS && glifos[i])
      ? '<div class="glifo' + (i === 0 ? ' azul' : '') + '">' + glifos[i] + '</div>'
      : '';
    return '<div class="pasoi"><div class="num">' + (i + 1) + '</div>' +
           glifo + '<div>' + t + '</div></div>';
  }).join('');
  return '<div class="tarjetapasos">' + filas + '</div>';
}

/** Copia la liga de la app. Para quien no halla los tres puntos. */
function copiarLiga(idAviso) {
  var liga = window.location.origin + window.location.pathname;
  var listo = function () { ponAviso(idAviso, 'verde', 'Liga copiada. Péguela en su navegador.'); };
  var falla = function () {
    ponAviso(idAviso, 'ambar', 'No se pudo copiar. La liga es:<br><b>' + esc(liga) + '</b>');
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(liga).then(listo).catch(falla);
      return;
    }
  } catch (e) { /* abajo va el plan B */ }
  falla();
}

/* ==========================================================
   LA TIRA QUE INSISTE
   Se queda arriba todos los días hasta que instale. No tiene
   tache a propósito: es la presión real, y no deja a nadie
   fuera de sus calificaciones.
   ========================================================== */

function pintarTiraInstalar() {
  var caja = $('tiraInstalar');
  if (!caja) return;

  if (!ESTADO.sesion || !INSTALAR.faltaInstalar()) {
    caja.className = 'tira oculto';
    caja.innerHTML = '';
    return;
  }

  caja.className = 'tira';
  caja.innerHTML =
    '<div><b>Le falta instalar la app.</b> Así entra desde el ícono y ve los avisos ' +
      'del colegio.</div>' +
    '<button class="tirabtn" id="tiraIns">Instalar</button>';

  $('tiraIns').addEventListener('click', function () {
    vistaInstalar({ alta: false, alSeguir: volverAlHijo });
  });
}

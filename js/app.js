/* ==========================================================
   Comunidad JB — app.js
   ----------------------------------------------------------
   Todas las pantallas de la app.

   CÓMO ESTÁ ARMADA
   Una sola página que cambia lo que hay dentro de #cuerpo.
   No hay navegación entre archivos: así la app se siente
   instantánea y el botón de atrás no saca al papá de la app
   sin querer.

   LO QUE LA APP NO DECIDE
   Ningún candado vive aquí. La app esconde botones por
   comodidad, pero quien de verdad revisa si este tutor puede
   ver a este alumno es el servidor, en cada llamada. Si
   alguien abriera la consola del navegador y cambiara lo que
   quisiera, no alcanzaría nada: el servidor le volvería a
   preguntar por su sesión y su vínculo.
   ========================================================== */

var ESTADO = {
  sesion: null,     // token guardado en el teléfono
  tutor: '',        // nombre del adulto
  correo: '',       // enmascarado, solo para mostrar
  hijos: [],
  hijo: null,       // el alumno seleccionado
  tab: 'calificaciones'
};

/* ---------- utilidades ---------- */

function $(id) { return document.getElementById(id); }

/** Escapa lo que venga del servidor antes de meterlo en la página. */
function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pintar(html) {
  $('cuerpo').innerHTML = html;
  window.scrollTo(0, 0);
}

function etiqueta(t) { $('encEtiqueta').textContent = t; }

/* ---------- pestañas encendidas ---------- */

/** Las de CONFIG.TABS que de verdad existen en la página. */
function tabsEncendidas() {
  var pedidas = (CONFIG.TABS && CONFIG.TABS.length) ? CONFIG.TABS : ['calificaciones'];
  return pedidas.filter(function (t) {
    return document.querySelector('.tab[data-t="' + t + '"]');
  });
}

/**
 * Esconde las pestañas apagadas y acomoda el orden de CONFIG.TABS.
 * Con una sola encendida la barra no se muestra: una barra de una
 * pestaña no sirve de nada y ocupa alto de pantalla.
 */
function prepararTabs() {
  var vivas = tabsEncendidas();
  var barra = $('tabs');

  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
    b.classList.toggle('oculto', vivas.indexOf(b.dataset.t) === -1);
  });

  // Reacomoda para que salgan en el orden que diga CONFIG.TABS.
  vivas.forEach(function (t) {
    barra.appendChild(document.querySelector('.tab[data-t="' + t + '"]'));
  });

  if (ESTADO.tab && vivas.indexOf(ESTADO.tab) === -1) ESTADO.tab = vivas[0];
}

function hayBarraDeTabs() { return tabsEncendidas().length > 1; }

/** Encabezado grande (antes de entrar) o barra chica (ya adentro). */
function modoEncabezado(dentro) {
  $('enc').classList.toggle('oculto', !!dentro);
  $('barra').classList.toggle('on', !!dentro);
  $('tabs').classList.toggle('on', !!dentro && hayBarraDeTabs());
  if (!dentro) cerrarCajonHijos();

  // Las tiras de arriba son de adentro: en las pantallas de entrar
  // o de alta no tienen nada que hacer.
  if (!dentro) {
    ['tiraAvisos', 'tiraInstalar'].forEach(function (id) {
      var c = $(id);
      if (c) { c.className = 'tira oculto'; c.innerHTML = ''; }
    });
  }
}

/** Las dos tiras de arriba, en orden: primero avisos, luego instalar. */
function pintarTiras() {
  pintarTiraAvisos();
  pintarTiraInstalar();
}

function hoyTexto() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

/* ==========================================================
   CAMPOS DE CONTRASEÑA, CON OJO PARA VERLA
   ----------------------------------------------------------
   En el celular se teclea mal y a ciegas, y una contraseña que
   no se puede revisar es la primera causa de «no me deja entrar».
   El ojo arranca cerrado: se ve solo si el papá lo pide.
   ========================================================== */

var OJO_ABIERTO =
  '<svg viewBox="0 0 24 24"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/>' +
  '<circle cx="12" cy="12" r="3.2"/></svg>';

var OJO_CERRADO =
  '<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/>' +
  '<path d="M10.6 6.2A9.9 9.9 0 0112 6c7 0 10.5 7 10.5 7a18 18 0 01-3.3 4.1"/>' +
  '<path d="M6.6 7.6A18 18 0 001.5 13s3.5 7 10.5 7a9.8 9.8 0 004.3-.97"/>' +
  '<path d="M9.8 10.1a3.2 3.2 0 004.4 4.4"/></svg>';

/**
 * Un campo de contraseña con su ojo. Devuelve la etiqueta y el
 * campo ya armados; el id sigue siendo el del <input>, así que
 * todo lo que ya lo buscaba por $(id) sigue igual.
 */
function campoClave(id, etiqueta, marcador, autocompletar) {
  return '<label for="' + id + '">' + esc(etiqueta) + '</label>' +
    '<div class="conclave">' +
      '<input type="password" id="' + id + '" autocomplete="' + autocompletar + '" ' +
        'placeholder="' + esc(marcador) + '">' +
      '<button type="button" class="ojo" data-ojo="' + id + '" ' +
        'aria-label="Mostrar la contraseña">' + OJO_CERRADO + '</button>' +
    '</div>';
}

/* Un solo oyente para todos los ojos, puesto una vez. Los campos se
   crean y se destruyen al cambiar de pantalla; el oyente no. */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest ? ev.target.closest('[data-ojo]') : null;
  if (!b) return;
  var campo = $(b.dataset.ojo);
  if (!campo) return;
  var mostrando = campo.type === 'text';
  campo.type = mostrando ? 'password' : 'text';
  b.innerHTML = mostrando ? OJO_CERRADO : OJO_ABIERTO;
  b.setAttribute('aria-label', mostrando ? 'Mostrar la contraseña' : 'Ocultar la contraseña');
  b.classList.toggle('on', !mostrando);
  // El foco vuelve al campo, donde estaba el papá escribiendo.
  try { campo.focus(); } catch (e) { /* ni modo */ }
});

/* ==========================================================
   CONTACTO CON LA DIRECCIÓN
   ----------------------------------------------------------
   Por WhatsApp si hay número en config; si no, correo. Un papá
   atorado a las ocho de la noche no escribe un correo.

   El mensaje va prellenado con el alumno y el grupo: quien
   contesta del otro lado ya sabe de quién le hablan, en vez de
   empezar con «¿de qué alumno me dice?».
   ========================================================== */

function ligaDeContacto() {
  var wa = String((CONFIG && CONFIG.WHATSAPP) || '').replace(/[^0-9]/g, '');
  if (!wa) return 'mailto:' + CONFIG.CORREO_CONTACTO;

  var quien = ESTADO.hijo
    ? ('sobre ' + ESTADO.hijo.nombre + ' de ' + ESTADO.hijo.grupo)
    : 'sobre la aplicación Comunidad JB';

  var texto = 'Hola, le escribo ' + quien + '.';
  return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(texto);
}

function contactarEscuela() {
  var liga = ligaDeContacto();
  // En la app instalada, window.open deja la ventana colgada si el
  // teléfono no tiene WhatsApp; cambiar de ubicación se comporta
  // igual que tocar una liga normal.
  window.location.href = liga;
}

function hayWhatsapp() {
  return String((CONFIG && CONFIG.WHATSAPP) || '').replace(/[^0-9]/g, '') !== '';
}

function aviso(id) { return '<div class="aviso" id="' + id + '"></div>'; }

function ponAviso(id, clase, texto) {
  var c = $(id);
  if (!c) return;
  c.className = 'aviso ' + clase;
  c.innerHTML = texto;
}

function limpiaAviso(id) {
  var c = $(id);
  if (c) { c.className = 'aviso'; c.innerHTML = ''; }
}

function iniciales(nombre) {
  var p = String(nombre || '').trim().split(/\s+/);
  return ((p[0] || '')[0] || '') + ((p[1] || '')[0] || '');
}

function tarjetaAlumno(nombre, grupo) {
  return '<div class="alumno"><div class="nom">' + esc(nombre) + '</div>' +
         '<div class="det">' + esc(grupo) + '</div></div>';
}

/* ==========================================================
   CAJÓN DE HERMANOS
   Va en el encabezado, no en una pantalla aparte: con varias
   pestañas el papá cambia de hijo seguido, y mandarlo a otra
   pantalla cada vez le hace perder dónde estaba.
   ========================================================== */

function cerrarCajonHijos() {
  var c = $('cajonHijos');
  if (c) { c.classList.add('oculto'); c.innerHTML = ''; }
  var b = $('barraCambiar');
  if (b) b.classList.remove('abierto');
}

function alternarCajonHijos() {
  var c = $('cajonHijos');
  if (!c) return;
  if (!c.classList.contains('oculto')) { cerrarCajonHijos(); return; }

  var actual = ESTADO.hijo ? (ESTADO.hijo.grupo + '|' + ESTADO.hijo.nombre) : '';

  c.innerHTML = ESTADO.hijos.map(function (h, i) {
    var esEste = (h.grupo + '|' + h.nombre) === actual;
    return '<button class="cjhijo' + (esEste ? ' viendo' : '') + '" data-i="' + i + '">' +
      '<div class="ini">' + esc(iniciales(h.nombre)) + '</div>' +
      '<div class="cjdatos"><div class="nom">' + esc(h.nombre) + '</div>' +
      '<div class="det">' + esc(h.grupo) + '</div></div>' +
      (esEste ? '<div class="viendoet">Viendo</div>' : '') +
      '</button>';
  }).join('');

  c.classList.remove('oculto');
  $('barraCambiar').classList.add('abierto');

  Array.prototype.forEach.call(c.querySelectorAll('.cjhijo'), function (b) {
    b.addEventListener('click', function () {
      cerrarCajonHijos();
      entrarConHijo(ESTADO.hijos[Number(b.dataset.i)]);
    });
  });
}

/** Barra de fuerza de la contraseña. Orienta, no califica. */
function medirContrasena(c) {
  var n = 0;
  if (c.length >= 6) n++;
  if (c.length >= 10) n++;
  if (/[0-9]/.test(c) && /[a-zA-Z]/.test(c)) n++;
  return n;   // 0 a 3
}

function engancharFuerza(idCampo, idBarra) {
  var campo = $(idCampo), barra = $(idBarra);
  if (!campo || !barra) return;
  campo.addEventListener('input', function () {
    var n = medirContrasena(campo.value);
    barra.style.width = (n === 0 ? 8 : n * 33) + '%';
    barra.className = n >= 3 ? 'buena' : (n === 2 ? 'media' : '');
  });
}

/* ==========================================================
   ARRANQUE
   ========================================================== */

function arrancar() {
  $('encColegio').textContent = CONFIG.COLEGIO;
  $('encCiclo').textContent = CONFIG.CICLO;
  $('pie').innerHTML = 'Dirección de secundaria · ' + esc(CONFIG.COLEGIO) +
    '<br><span style="font-size:9.5px">Versión ' + esc(CONFIG.VERSION) + '</span>';

  $('barraMenu').addEventListener('click', function () {
    cerrarCajonHijos();
    vistaMenu();
  });
  $('barraCambiar').addEventListener('click', alternarCajonHijos);

  prepararTabs();

  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
    b.addEventListener('click', function () {
      cerrarCajonHijos();
      irATab(b.dataset.t);
    });
  });

  // ¿Viene con una liga de alta? Eso manda sobre todo lo demás.
  var token = new URLSearchParams(window.location.search).get('r');
  if (token) { abrirInvitacion(token); return; }

  // ¿Hay sesión guardada en este teléfono?
  var guardada = MEMORIA.leer('sesion');
  if (guardada) { revalidarSesion(guardada); return; }

  vistaEntrar();
}

function revalidarSesion(token) {
  modoEncabezado(false);
  etiqueta('Comunidad JB');
  pintar('<div class="cargando">Abriendo su cuenta…</div>');

  API.sesion(token).then(function (r) {
    if (!r.ok) {
      // Si se cayó la red NO se borra la sesión: el papá volvería a
      // teclear su contraseña nada más por estar en el elevador.
      if (!r.sinRed) MEMORIA.borrar('sesion');
      vistaEntrar(r.sinRed ? r.mensaje : '');
      return;
    }
    ESTADO.sesion = token;
    ESTADO.tutor = r.tutor;
    ESTADO.correo = r.correo || '';
    ESTADO.hijos = r.hijos || [];
    elegirHijoOEntrar();
  });
}

/**
 * Con un solo hijo se brinca el selector. Con varios, se recuerda
 * el último que vio, que casi siempre es el que va a querer otra vez.
 */
function elegirHijoOEntrar() {
  if (ESTADO.hijos.length === 1) { entrarConHijo(ESTADO.hijos[0]); return; }

  var ultimo = MEMORIA.leer('hijo');
  if (ultimo) {
    var hallado = ESTADO.hijos.filter(function (h) {
      return (h.grupo + '|' + h.nombre) === ultimo;
    })[0];
    if (hallado) { entrarConHijo(hallado); return; }
  }
  vistaHijos();
}

/* ==========================================================
   ALTA · la liga personal
   ========================================================== */

function abrirInvitacion(token) {
  modoEncabezado(false);
  etiqueta('Registro de acceso');
  pintar('<div class="cargando">Revisando su liga…</div>');

  API.verInvitacion(token).then(function (r) {
    if (!r.ok) { vistaLigaNoSirve(r.mensaje); return; }
    vistaRegistro(token, r.alumno, r.grupo, r.usados, r.tope);
  });
}

function vistaRegistro(token, alumno, grupo, usados, tope) {
  etiqueta('Registro de acceso');

  // Cuántos lugares quedan. Se dice solo cuando ya hay alguien
  // registrado: en una liga nueva, «quedan 3 de 3» no informa nada
  // y de paso invita a repartirla.
  var lugares = '';
  if (usados > 0 && tope) {
    var faltan = Math.max(0, tope - usados);
    // Cada mitad concuerda por su cuenta: la primera con los que ya
    // entraron, la segunda con los que faltan. Juntarlas en un solo
    // if producía «Ya se registraron 1».
    var ya = usados === 1
      ? 'Ya se registró 1 adulto.'
      : 'Ya se registraron ' + usados + ' adultos.';
    var quedan = faltan === 1 ? 'Queda 1 lugar.' : 'Quedan ' + faltan + ' lugares.';
    lugares = ya + ' ' + quedan;
  }

  pintar(
    tarjetaAlumno(alumno, grupo) +
    '<p class="titulo">Registre su correo</p>' +
    '<p class="texto">Esta liga es de su familia. Con ella pueden darse de alta ' +
      'hasta <b>tres adultos</b> para ver la información de este alumno, cada uno con ' +
      'su propio correo y su propia contraseña.</p>' +
    (lugares ? '<p class="texto"><b>' + lugares + '</b></p>' : '') +

    '<label for="correo">Su correo electrónico</label>' +
    '<input type="email" id="correo" autocomplete="email" inputmode="email" placeholder="correo@ejemplo.com">' +

    '<label for="nombre">Su nombre completo</label>' +
    '<input type="text" id="nombre" autocomplete="name" placeholder="Nombre y apellidos">' +

    '<label for="parentesco">Parentesco</label>' +
    '<input type="text" id="parentesco" placeholder="Madre, padre, abuela, tutor…">' +

    '<div class="aviso ambar"><b>No comparta esta liga fuera de su familia.</b> ' +
      'Quien la reciba puede registrarse y ver la información de su hijo. No la reenvíe ' +
      'al grupo del salón.</div>' +

    aviso('res') +
    '<button class="btn" id="btn">Continuar</button>' +

    '<p class="mini" style="margin-top:16px">Los datos del alumno son información confidencial. ' +
      'El colegio es responsable de su resguardo conforme a la Ley Federal de Protección de ' +
      'Datos Personales en Posesión de los Particulares.</p>'
  );

  $('btn').addEventListener('click', function () {
    var correo = $('correo').value.trim();
    var nombre = $('nombre').value.trim();
    var parentesco = $('parentesco').value.trim();

    if (!correo || correo.indexOf('@') === -1) {
      ponAviso('res', 'rojo', 'Escriba un correo electrónico válido.'); return;
    }
    if (nombre.length < 5) {
      ponAviso('res', 'rojo', 'Escriba su nombre completo.'); return;
    }

    this.disabled = true;
    ponAviso('res', 'ambar', 'Registrando…');

    API.registrar(token, correo, nombre, parentesco).then(function (r) {
      $('btn').disabled = false;
      if (!r.ok) {
        if (r.usada || r.vencida) { vistaLigaNoSirve(r.mensaje); return; }
        ponAviso('res', 'rojo', esc(r.mensaje));
        return;
      }
      // Un papá que ya tenía cuenta solo sumó otro hijo: no hay
      // código nuevo que esperar, entra con lo que ya sabe.
      if (r.yaTeniaCuenta) { vistaYaTeniaCuenta(r.mensaje, correo); return; }
      vistaCodigoEnviado(correo, r.correoOculto);
    });
  });
}

function vistaCodigoEnviado(correo, correoOculto) {
  etiqueta('Revise su correo');
  pintar(
    '<div class="icono ok">&#10003;</div>' +
    '<p class="titulo" style="text-align:center">Le enviamos un código</p>' +
    '<p class="texto">Va en camino a <b>' + esc(correoOculto || correo) + '</b>. Puede tardar ' +
      'un par de minutos; revise también el correo no deseado.</p>' +
    '<p class="texto">Con ese código va a crear la contraseña con la que entrará de ' +
      'ahora en adelante.</p>' +
    // Aquí ya NO se le dice que instale: la instalación es un paso
    // completo más adelante, cuando ya tenga su contraseña. Pedirle
    // dos cosas a la vez es lo que hace que no haga ninguna.
    '<div class="aviso ambar"><b>No cierre esta pantalla.</b> Si la cierra, puede volver ' +
      'a abrir la liga y tocar «Tengo un código del colegio».</div>' +
    '<button class="btn" id="btn">Ya tengo el código</button>'
  );
  $('btn').addEventListener('click', function () { vistaCrearContrasena(correo); });
}

function vistaYaTeniaCuenta(mensaje, correo) {
  etiqueta('Listo');
  pintar(
    '<div class="icono ok">&#10003;</div>' +
    '<p class="titulo" style="text-align:center">Ya quedó agregado</p>' +
    '<p class="texto">' + esc(mensaje) + '</p>' +
    '<button class="btn" id="btn">Entrar</button>'
  );
  $('btn').addEventListener('click', function () { vistaEntrar('', correo); });
}

function vistaCrearContrasena(correo, mensajePrevio) {
  etiqueta('Primera vez');
  pintar(
    '<p class="titulo">Cree su contraseña</p>' +
    '<p class="texto">Escriba el código que le llegó por correo y elija la contraseña ' +
      'con la que va a entrar de ahora en adelante.</p>' +

    (mensajePrevio ? '<div class="aviso ambar">' + esc(mensajePrevio) + '</div>' : '') +

    '<label for="correo">Su correo</label>' +
    '<input type="email" id="correo" autocomplete="email" inputmode="email" value="' + esc(correo || '') + '">' +

    '<label for="codigo">Código del correo</label>' +
    '<input type="text" id="codigo" class="cod" maxlength="5" autocomplete="one-time-code" ' +
      'autocapitalize="characters" placeholder="-----">' +

    campoClave('c1', 'Su contraseña nueva', 'Mínimo 6 caracteres', 'new-password') +
    '<div class="fuerza"><i id="fz"></i></div>' +

    campoClave('c2', 'Repita la contraseña', 'La misma de arriba', 'new-password') +

    '<div class="aviso ambar"><b>Nadie más la va a saber, ni el colegio.</b> Si la olvida, ' +
      'se repone con un código nuevo a su correo.</div>' +

    aviso('res') +
    '<button class="btn" id="btn">Guardar y entrar</button>'
  );
  engancharFuerza('c1', 'fz');

  $('btn').addEventListener('click', function () {
    var correoV = $('correo').value.trim();
    var codigo = $('codigo').value.trim();
    var c1 = $('c1').value, c2 = $('c2').value;

    if (codigo.length < 5) { ponAviso('res', 'rojo', 'El código es de 5 caracteres.'); return; }
    if (c1 !== c2) { ponAviso('res', 'rojo', 'Las dos contraseñas no son iguales.'); return; }
    if (c1.length < 6) { ponAviso('res', 'rojo', 'La contraseña debe tener al menos 6 caracteres.'); return; }

    this.disabled = true;
    ponAviso('res', 'ambar', 'Guardando…');

    API.crearContrasena(correoV, codigo, c1).then(function (r) {
      $('btn').disabled = false;
      if (!r.ok) { ponAviso('res', r.bloqueado ? 'rojo' : 'ambar', esc(r.mensaje)); return; }
      abrirSesion(r, 'alta');
    });
  });
}

function vistaLigaNoSirve(mensaje) {
  modoEncabezado(false);
  etiqueta('Liga no disponible');
  pintar(
    '<div class="icono alto">!</div>' +
    '<p class="titulo" style="text-align:center">Esta liga ya no sirve</p>' +
    '<p class="texto">' + esc(mensaje || 'La liga no es válida.') + '</p>' +
    '<div class="aviso ambar">' +
      '<b>Si usted ya se registró:</b> entre con su correo y su contraseña.<br><br>' +
      '<b>Si necesita darse de alta:</b> pida una liga en la dirección del colegio. ' +
      'Cada liga alcanza para tres adultos de la misma familia.</div>' +
    '<button class="btn sec" id="btn">Ya tengo cuenta, entrar</button>' +
    (hayWhatsapp()
      ? '<button class="btn" id="btnWa">Pedir una liga nueva por WhatsApp</button>'
      : '')
  );
  $('btn').addEventListener('click', function () { vistaEntrar(); });
  if (hayWhatsapp()) $('btnWa').addEventListener('click', contactarEscuela);
}

/* ==========================================================
   ENTRAR
   ========================================================== */

function vistaEntrar(mensajePrevio, correoSugerido) {
  modoEncabezado(false);
  etiqueta('Comunidad JB');

  var recordado = correoSugerido || MEMORIA.leer('correo') || '';

  pintar(
    '<p class="titulo">Entre a su cuenta</p>' +
    (mensajePrevio ? '<div class="aviso ambar">' + esc(mensajePrevio) + '</div>' : '') +

    '<label for="correo">Correo</label>' +
    '<input type="email" id="correo" autocomplete="email" inputmode="email" ' +
      'placeholder="correo@ejemplo.com" value="' + esc(recordado) + '">' +

    campoClave('pass', 'Contraseña', 'Su contraseña', 'current-password') +

    aviso('res') +
    '<button class="btn" id="btn">Entrar</button>' +
    '<button class="btn sec chi" id="btnOlvide">Olvidé mi contraseña</button>' +

    // Esta puerta es la salida del papá al que la dirección le
    // repuso el acceso: su contraseña ya no sirve y tiene un código
    // esperándolo en el correo. El mensaje de «entrar» no se lo
    // puede decir sin delatar qué correos están dados de alta, así
    // que el camino tiene que estar a la vista por su cuenta.
    '<button class="btn sec chi" id="btnCodigo">Tengo un código del colegio</button>' +

    '<p class="mini" style="margin-top:18px;text-align:center">Después de 5 intentos ' +
      'fallidos el acceso se bloquea por 30 minutos.</p>'
  );

  $('btnOlvide').addEventListener('click', function () {
    vistaOlvide($('correo').value.trim());
  });

  $('btnCodigo').addEventListener('click', function () {
    vistaCrearContrasena($('correo').value.trim());
  });

  $('pass').addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') $('btn').click();
  });

  $('btn').addEventListener('click', function () {
    var correo = $('correo').value.trim();
    var pass = $('pass').value;
    if (!correo || !pass) { ponAviso('res', 'rojo', 'Escriba su correo y su contraseña.'); return; }

    this.disabled = true;
    ponAviso('res', 'ambar', 'Entrando…');

    API.entrar(correo, pass).then(function (r) {
      $('btn').disabled = false;
      if (!r.ok) {
        ponAviso('res', r.bloqueado ? 'rojo' : 'ambar', esc(r.mensaje));
        return;
      }
      MEMORIA.guardar('correo', correo);
      abrirSesion(r, 'entrar');
    });
  });
}

/**
 * @param {Object} r       respuesta del servidor
 * @param {string} momento 'alta'   acaba de crear su contraseña
 *                         'entrar' entró con correo y contraseña
 *                         vacío    se revalidó una sesión guardada
 *
 * EL PASO DE INSTALAR VA AQUÍ, Y A PROPÓSITO DESPUÉS DEL ALTA:
 * primero se identifica con su código y su contraseña, y ya
 * identificado se le pide instalar. Nunca al revés.
 */
function abrirSesion(r, momento) {
  ESTADO.sesion = r.sesion;
  ESTADO.tutor = r.tutor || '';
  ESTADO.hijos = r.hijos || [];
  MEMORIA.guardar('sesion', r.sesion);

  // Alta: el paso se ve completo, incluso en computadora (ahí sale
  // la nota de que la app es para el celular).
  if (momento === 'alta' && !INSTALAR.yaInstalada()) {
    vistaInstalar({ alta: true, alSeguir: elegirHijoOEntrar });
    return;
  }

  // Ya tenía cuenta: se le ofrece, pero una sola vez al día. Ya se
  // identificó, estorbarle en cada entrada sería de más.
  if (momento === 'entrar' && INSTALAR.faltaInstalar() &&
      MEMORIA.leer('ofrecido') !== hoyTexto()) {
    MEMORIA.guardar('ofrecido', hoyTexto());
    vistaInstalar({ alta: false, alSeguir: elegirHijoOEntrar });
    return;
  }

  elegirHijoOEntrar();
}

function vistaOlvide(correoSugerido) {
  modoEncabezado(false);
  etiqueta('Recuperar acceso');
  pintar(
    '<p class="titulo">Reponer su contraseña</p>' +
    '<p class="texto">Escriba su correo registrado y le enviaremos un código para poner ' +
      'una contraseña nueva.</p>' +

    '<label for="correo">Correo registrado</label>' +
    '<input type="email" id="correo" autocomplete="email" inputmode="email" ' +
      'placeholder="correo@ejemplo.com" value="' + esc(correoSugerido || '') + '">' +

    aviso('res') +
    '<button class="btn" id="btn">Enviarme el código</button>' +
    '<button class="btn sec chi" id="btnAtras">Regresar</button>' +

    '<div class="aviso ambar"><b>Ni el colegio puede ver su contraseña.</b> La única ' +
      'forma de recuperarla es poniendo una nueva.</div>'
  );

  $('btnAtras').addEventListener('click', function () { vistaEntrar(); });

  $('btn').addEventListener('click', function () {
    var correo = $('correo').value.trim();
    if (!correo || correo.indexOf('@') === -1) {
      ponAviso('res', 'rojo', 'Escriba un correo electrónico válido.'); return;
    }
    this.disabled = true;
    ponAviso('res', 'ambar', 'Enviando…');

    API.olvide(correo).then(function (r) {
      $('btn').disabled = false;
      // El servidor contesta lo mismo exista o no el correo, a
      // propósito: esta pantalla no debe servir de buscador.
      ponAviso('res', 'verde', esc(r.mensaje));
      setTimeout(function () { vistaCrearContrasena(correo); }, 2200);
    });
  });
}

/* ==========================================================
   CUÁL HIJO
   ========================================================== */

function vistaHijos() {
  modoEncabezado(false);
  etiqueta('Comunidad JB');

  var lista = ESTADO.hijos.map(function (h, i) {
    return '<button class="hijo" data-i="' + i + '">' +
      '<div class="ini">' + esc(iniciales(h.nombre)) + '</div>' +
      '<div><div class="nom">' + esc(h.nombre) + '</div>' +
      '<div class="det">' + esc(h.grupo) + '</div></div></button>';
  }).join('');

  pintar(
    '<p class="titulo" style="text-align:center">¿A quién quiere ver?</p>' +
    '<p class="texto" style="text-align:center">Hola, ' + esc(ESTADO.tutor.split(' ')[0]) + '.</p>' +
    '<div style="margin-top:18px">' + lista + '</div>'
  );

  Array.prototype.forEach.call(document.querySelectorAll('.hijo'), function (b) {
    b.addEventListener('click', function () {
      entrarConHijo(ESTADO.hijos[Number(b.dataset.i)]);
    });
  });
}

function entrarConHijo(hijo) {
  ESTADO.hijo = hijo;
  MEMORIA.guardar('hijo', hijo.grupo + '|' + hijo.nombre);
  $('barraNombre').textContent = hijo.nombre;
  $('barraGrupo').textContent = hijo.grupo;
  $('barraIni').textContent = iniciales(hijo.nombre);

  // El botón de cambiar solo tiene sentido con más de un hijo.
  $('barraCambiar').classList.toggle('oculto', ESTADO.hijos.length < 2);

  modoEncabezado(true);

  pintarTiraInstalar();
  // Los avisos se piden una vez por apertura de la app, no cada que
  // cambia de hijo: son los mismos para toda la familia.
  if (AVISOS.pedidos) pintarTiraAvisos(); else AVISOS.cargar();

  irATab('calificaciones');
}

/* ==========================================================
   PESTAÑAS
   ========================================================== */

function irATab(cual) {
  // Si alguien llega a una pestaña apagada (una sesión vieja que
  // recordaba otra), se le manda a la primera encendida.
  var vivas = tabsEncendidas();
  if (vivas.indexOf(cual) === -1) cual = vivas[0] || 'calificaciones';

  ESTADO.tab = cual;
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
    b.classList.toggle('on', b.dataset.t === cual);
  });

  if (cual === 'calificaciones') { tabCalificaciones(); return; }
  tabEnConstruccion(cual);
}

function tabEnConstruccion(cual) {
  var textos = {
    pagos: ['Pagos', 'Aquí va a ver los pagos del ciclo: lo que ya está cubierto y lo que falta.'],
    cooperativa: ['Cooperativa', 'Aquí va a ver el saldo del comedor y los prepagos.'],
    calendario: ['Calendario', 'Aquí va a ver el calendario mensual y los eventos próximos.'],
    credencial: ['Credencial', 'Aquí va a ver la credencial con el código de su hijo, para la salida.']
  };
  var t = textos[cual] || ['Próximamente', ''];
  pintar(
    '<div class="icono ok" style="background:#F3EFEC;border-color:#E0D9D3;color:#8C8377">&#8987;</div>' +
    '<p class="titulo" style="text-align:center">' + esc(t[0]) + '</p>' +
    '<p class="texto" style="text-align:center">' + esc(t[1]) + '</p>' +
    '<div class="aviso ambar">Esta sección todavía está en construcción. Le avisaremos ' +
      'desde el colegio en cuanto esté lista.</div>'
  );
}

/* ---------- calificaciones ---------- */

function colorCal(c) { return c >= 8 ? 'ok' : (c >= 7 ? 'med' : 'baj'); }

function tabCalificaciones() {
  pintar('<div class="cargando">Cargando calificaciones…</div>');

  API.calificaciones(ESTADO.sesion, ESTADO.hijo.grupo, ESTADO.hijo.nombre).then(function (r) {
    if (!r.ok) {
      if (r.expirada) { sesionVencida(); return; }
      pintar('<div class="aviso rojo">' + esc(r.mensaje) + '</div>');
      return;
    }
    if (r.sinReporte) {
      pintar(
        '<div class="icono ok" style="background:#F3EFEC;border-color:#E0D9D3;color:#8C8377">&#8987;</div>' +
        '<p class="titulo" style="text-align:center">Todavía no hay reporte</p>' +
        '<p class="texto" style="text-align:center">' + esc(r.mensaje) + '</p>'
      );
      return;
    }
    pintarReporte(r.reporte);
  });
}

function pintarReporte(rep) {
  var filas = (rep.calificaciones || []).map(function (m) {
    return '<tr><td class="mat">' + esc(m.a) + '</td>' +
      '<td class="c"><span class="cal ' + colorCal(m.c) + '">' +
      Number(m.c).toFixed(1) + '</span></td></tr>';
  }).join('');

  if (!filas) {
    filas = '<tr><td colspan="2" style="color:#8C8377">Todavía no hay calificaciones capturadas.</td></tr>';
  }

  var hayPromedio = (rep.promedio !== null && rep.promedio !== undefined);

  pintar(
    // El orden es el de la maqueta: primero el promedio, grande,
    // que es lo que el papá viene a ver; después el desglose.
    '<p class="reptit">' + esc(rep.etiqueta) + '</p>' +

    (hayPromedio
      ? '<div class="promedio arriba">' +
          '<div class="et">Promedio parcial</div>' +
          '<div class="nu">' + Number(rep.promedio).toFixed(1) + '</div>' +
          '<div class="alcorte">al ' + esc(rep.fechaCorte) + '</div>' +
        '</div>'
      : '') +

    '<div class="aviso ambar" style="cursor:pointer" id="avLey">' +
      '<b>Calificaciones parciales.</b> Son el avance a la fecha de corte, no la calificación ' +
      'final del trimestre. <span style="text-decoration:underline;white-space:nowrap" id="masLey">Leer más</span>' +
      '<div id="ley" class="oculto" style="margin-top:9px;padding-top:9px;border-top:1px solid rgba(107,85,22,.25)">' +
      'Las calificaciones de este reporte son las reales al día en que se generó: pueden subir ' +
      'o bajar según el desempeño del alumno en la segunda mitad del trimestre.<br><br>' +
      'Para reponer trabajos no entregados, el alumno debe hablar directamente con los ' +
      'profesores de esas asignaturas y llegar a un acuerdo para regularizarse.</div></div>' +

    '<p class="seccion">Por materia</p>' +
    '<table><thead><tr><th>Asignatura</th><th class="c">Calificación parcial</th></tr></thead>' +
    '<tbody>' + filas + '</tbody></table>' +

    aviso('resPdf') +

    (rep.hayPdf
      ? '<button class="btn" id="btnPdf">Ver el reporte parcial</button>' +
        '<p class="mini c" style="margin-top:9px">Se descarga en PDF, con el ' +
        'desglose por asignatura y las indicaciones de la dirección.</p>'
      : '<div class="aviso ambar">El reporte detallado todavía no está disponible.</div>') +

    '<p class="corte">Corte del ' + esc(rep.fechaCorte) + '</p>' +

    '<p class="mini" style="margin-top:14px">Estas calificaciones corresponden al corte ' +
      'indicado y pueden cambiar hasta el cierre del trimestre. Dudas sobre una asignatura: ' +
      'con el profesor correspondiente o con el asesor de grupo.</p>'
  );

  $('avLey').addEventListener('click', function () {
    var caja = $('ley'), mas = $('masLey');
    var abierto = !caja.classList.contains('oculto');
    caja.classList.toggle('oculto', abierto);
    mas.textContent = abierto ? 'Leer más' : 'Ocultar';
  });

  var btn = $('btnPdf');
  if (btn) btn.addEventListener('click', bajarPdf);
}

function bajarPdf() {
  var btn = $('btnPdf');
  btn.disabled = true;
  ponAviso('resPdf', 'ambar', 'Preparando el archivo…');

  API.pdf(ESTADO.sesion, ESTADO.hijo.grupo, ESTADO.hijo.nombre).then(function (r) {
    btn.disabled = false;
    if (!r.ok) {
      if (r.expirada) { sesionVencida(); return; }
      ponAviso('resPdf', 'rojo', esc(r.mensaje));
      return;
    }
    guardarArchivo(r.base64, r.nombreArchivo);
    ponAviso('resPdf', 'verde', 'Listo, revise sus descargas.');
  });
}

/**
 * Arma el PDF y dispara la descarga. Se hace por pedazos de 4 KB
 * porque atob() sobre una cadena de cientos de miles de caracteres
 * de un golpe se atora en celulares de gama baja.
 */
function guardarArchivo(base64, nombre) {
  try {
    var binario = atob(base64);
    var pedazos = [];
    for (var i = 0; i < binario.length; i += 4096) {
      var trozo = binario.slice(i, i + 4096);
      var bytes = new Uint8Array(trozo.length);
      for (var j = 0; j < trozo.length; j++) bytes[j] = trozo.charCodeAt(j);
      pedazos.push(bytes);
    }
    var url = URL.createObjectURL(new Blob(pedazos, { type: 'application/pdf' }));
    var a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  } catch (e) {
    ponAviso('resPdf', 'rojo', 'No se pudo abrir el archivo en este teléfono.');
  }
}

/* ==========================================================
   MENÚ
   ========================================================== */

function vistaMenu() {
  etiqueta('Mi cuenta');
  $('tabs').classList.remove('on');

  // «Cambiar de hijo» ya vive en el encabezado, así que aquí ya no va.
  var sinLeer = AVISOS.sinLeer().length;
  var falta = INSTALAR.sePuedeOfrecer();

  pintar(
    '<p class="titulo">Mi cuenta</p>' +
    '<p class="mini">' + esc(ESTADO.tutor) + (ESTADO.correo ? ' · ' + esc(ESTADO.correo) : '') + '</p>' +

    '<div class="menu-caja">' +
      '<button class="menu-op" id="opAvisos"><span>Avisos del colegio' +
        (sinLeer ? ' <span class="punto">' + sinLeer + '</span>' : '') +
        '</span><span style="color:#C9C4BD">&rsaquo;</span></button>' +
      (falta
        ? '<button class="menu-op oro" id="opInstalar"><span>Instalar la app</span>' +
          '<span style="color:#C9A227">&rsaquo;</span></button>'
        : '') +
      '<button class="menu-op" id="opPass"><span>Cambiar mi contraseña</span><span style="color:#C9C4BD">&rsaquo;</span></button>' +
      '<button class="menu-op" id="opContacto"><span>' +
        (hayWhatsapp() ? 'Escribir al colegio por WhatsApp' : 'Contactar a la escuela') +
        '</span><span style="color:#C9C4BD">&rsaquo;</span></button>' +
      '<button class="menu-op rojo" id="opSalir"><span>Cerrar sesión</span><span>&rsaquo;</span></button>' +
    '</div>' +

    '<div class="aviso ambar"><b>Ojo con cerrar sesión:</b> para volver a entrar necesita ' +
      'su correo y su contraseña.</div>' +

    '<button class="btn sec chi" id="btnAtras">Regresar</button>' +
    '<div class="chips"><span class="chip">Versión ' + esc(CONFIG.VERSION) + '</span></div>'
  );

  $('btnAtras').addEventListener('click', volverAlHijo);
  $('opAvisos').addEventListener('click', vistaAvisos);
  if (falta) {
    $('opInstalar').addEventListener('click', function () {
      vistaInstalar({ alta: false, alSeguir: volverAlHijo });
    });
  }
  $('opPass').addEventListener('click', vistaCambiarContrasena);
  $('opContacto').addEventListener('click', contactarEscuela);
  $('opSalir').addEventListener('click', cerrarSesion);
}

function volverAlHijo() {
  etiqueta('Comunidad JB');
  modoEncabezado(true);
  pintarTiras();
  irATab(ESTADO.tab === 'calificaciones' ? 'calificaciones' : ESTADO.tab);
}

function vistaCambiarContrasena() {
  etiqueta('Cambiar contraseña');
  $('tabs').classList.remove('on');

  pintar(
    '<p class="titulo">Cambiar mi contraseña</p>' +
    campoClave('actual', 'Contraseña actual', 'La que usa hoy', 'current-password') +
    campoClave('c1', 'Contraseña nueva', 'Mínimo 6 caracteres', 'new-password') +
    '<div class="fuerza"><i id="fz"></i></div>' +
    campoClave('c2', 'Repita la nueva', 'La misma de arriba', 'new-password') +
    aviso('res') +
    '<button class="btn" id="btn">Guardar</button>' +
    '<button class="btn sec chi" id="btnAtras">Cancelar</button>' +
    '<div class="aviso ambar">Al cambiarla se cierran las sesiones abiertas en otros ' +
      'teléfonos. En este se queda abierta.</div>'
  );
  engancharFuerza('c1', 'fz');
  $('btnAtras').addEventListener('click', vistaMenu);

  $('btn').addEventListener('click', function () {
    var actual = $('actual').value, c1 = $('c1').value, c2 = $('c2').value;
    if (!actual) { ponAviso('res', 'rojo', 'Escriba su contraseña actual.'); return; }
    if (c1 !== c2) { ponAviso('res', 'rojo', 'Las dos contraseñas nuevas no son iguales.'); return; }
    if (c1.length < 6) { ponAviso('res', 'rojo', 'La contraseña debe tener al menos 6 caracteres.'); return; }

    this.disabled = true;
    ponAviso('res', 'ambar', 'Guardando…');

    API.cambiarContrasena(ESTADO.sesion, actual, c1).then(function (r) {
      $('btn').disabled = false;
      if (!r.ok) {
        if (r.expirada) { sesionVencida(); return; }
        ponAviso('res', 'rojo', esc(r.mensaje));
        return;
      }
      ESTADO.sesion = r.sesion;
      MEMORIA.guardar('sesion', r.sesion);
      ponAviso('res', 'verde', 'Listo, su contraseña quedó cambiada.');
      setTimeout(volverAlHijo, 1500);
    });
  });
}

function cerrarSesion() {
  var token = ESTADO.sesion;
  // Se borra del teléfono de inmediato, sin esperar al servidor:
  // si la red falla, el papá igual queda fuera de este aparato.
  MEMORIA.borrar('sesion');
  MEMORIA.borrar('hijo');
  ESTADO.sesion = null; ESTADO.hijo = null; ESTADO.hijos = [];
  AVISOS.lista = []; AVISOS.pedidos = false;
  if (token) API.cerrarSesion(token);
  vistaEntrar('Cerró su sesión.');
}

function sesionVencida() {
  MEMORIA.borrar('sesion');
  ESTADO.sesion = null;
  vistaEntrar('Por seguridad, vuelva a entrar con su correo y contraseña.');
}

/* ==========================================================
   SERVICE WORKER
   Es lo que hace que la app se pueda instalar como ícono.
   Si falla, la app sigue funcionando: solo no se instala.
   ========================================================== */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () { /* ni modo */ });
  });
}

arrancar();

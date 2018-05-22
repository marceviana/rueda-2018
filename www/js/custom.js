
var urlActual = document.location.href;
var loginPage = urlActual.indexOf('login.html') >= 0;
var homePage = urlActual.indexOf('inicio.html') >= 0;

var versionApp = '1.1.1';
var versionCatalogo = 2;
var ultimoCatalogo = localStorage.getItem('versionCatalogo');

if( ultimoCatalogo == null || ultimoCatalogo == undefined ){
    versionCatalogo = 1;
}else if ( parseInt(ultimoCatalogo) > versionCatalogo ){
    versionCatalogo = ultimoCatalogo;
};

var isAndroid;
var isIOS;

var db;
var fechaDB;

var info = {};
var isReady = false;
var conEstado;
var estadoIntVal;
var timer = 0;

var isLogin = false;
var navBarIsReady = false;
var representanteIsReady = false;
var fotosIsReady = false;

var entrevistas = {};
var entrevistasHTML = '';
var entrevistasIsReady = false;
var entrevistasIsWritten = false;
var entrevistasHTMLIsReady = false;

var catalogo = {};
var catalogoHTML = '';
var catalogoIsReady = false;
var catalogoHTMLIsReady = false;
var catalogoIsWritten = false;

var noAsignadas = {};
var noAsignadasHTML = '';
var noAsignadasHTMLIsReady = false;
var noAsignadasIsWritten = false;

var misdatos = {};
var fileData = null;

var notificaciones = {};
var fechasRueda = [];
var fotosCatalogo = [];
var fotosTimeout;

var rootURL = '';
var numeroOrden = '';
var razonSocial = '';
var codCatalogo = '';
var codRepresentante = '';

var ferreUsers = ['04836','04567'];
var ferrePass = ['R7LMB','111706'];

fechasRueda[0] = { iso: '2016-06-30' };
fechasRueda[1] = { iso: '2016-07-01' };

var hoyDateObj = new Date();
var fechaLanzaObj = new Date('2016-06-29');
fechaLanzaObj.setMinutes(fechaLanzaObj.getMinutes() + fechaLanzaObj.getTimezoneOffset());

var bajarJSONCount = 0;

// SETTINGS
var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    jqmReadyDeferred.resolve();
});

document.addEventListener("deviceready", function(){

    navigator.splashscreen.hide();
    
    isAndroid = device.platform.toLowerCase() === 'android';
    isIOS = device.platform.toLowerCase() === 'ios';

    // Vincular JQM a PHONEGAP para inicializacion
    deviceReadyDeferred.resolve();

}, false);

$.when(deviceReadyDeferred, jqmReadyDeferred).then(function(){});

var typeListenerVal = {};
var listenTimeout;
var catalogoNavbar = '<div data-role="navbar" id="categos-navbar">\
                        <ul>\
                          <li><a data-theme="b" href="#CAT-MAYORISTA" class="fapp-text-c" data-transition="flip"><span class="fapp-icono-may"></span></a></li>\
                          <li><a data-theme="b" href="#CAT-FABRICANTE" class="fapp-text-c" data-transition="flip"><span class="fapp-icono-fab"></span></a></li>\
                          <li><a data-theme="b" href="#CAT-EXPORTADOR" class="fapp-text-c" data-transition="flip"><span class="fapp-icono-exp"></span></a></li>\
                          <li><a data-theme="b" href="#CAT-IMPORTADOR" class="fapp-text-c" data-transition="flip"><span class="fapp-icono-imp"></span></a></li>\
                          <li><a data-theme="b" href="#CAT-REPRESENTANTE" class="fapp-text-c" data-transition="flip"><span class="fapp-icono-rep"></span></a></li>\
                        </ul>\
                      </div><!-- /navbar -->';

var scrollBtns = '<span class="fapp-scroll-btn ui-btn ui-icon-carat-u ui-btn-icon-notext"></span>';
    // scrollBtns += '<span class="fapp-alfa-btn"></span>';
var noitemsHTML = '<li id="sin-resultados"><h3>No se encontraron resultados</h3></li>';

var caracteresEsp    = ['á','é','í','ó','ú','ñ','Á','É','Í','Ó','Ú','Ñ','ç','Ç','ã','Ã','õ','Õ','â','Â','ô','Ô','ê','Ê'];
var caracteresEspRep = ['a','e','i','o','u','n','A','E','I','O','U','N','c','C','a','A','o','O','a','A','o','O','e','E'];
    
$.mobile.document.on( "filterablecreate", "#catalogo .listview", function() {

    $( "#catalogo .listview" ).filterable( "option", "filterCallback", function( index, searchValue ) {
        filtrarResultados(input, searchValue.toLowerCase());
        return false;
    });

    var input = $('#catalogo .ui-filterable input');

    input.on({
        focus: function() {
            // console.log('focus::::::::::::::::::');

            typeListenerVal = {};
            typeListenerVal['elem'] = input;
            typeListenerVal[1] = input.val().toLowerCase();
            typeListenerVal[2] = input.val().toLowerCase();

        },
        keydown: function(e) {
            // console.log('keydown::::::::::::::::::');

            var newValue = input.val().toLowerCase();
            typeListenerVal[1] = newValue;

        },
        keyup: function(){ 
            // console.log('keyup::::::::::::::::::');
            filtrarResultados(input, input.val().toLowerCase());
        },
        change: function(){ 
            // console.log('change::::::::::::::::::');
            filtrarResultados(input, input.val().toLowerCase());
        },
        paste: function(){ 
            // console.log('paste::::::::::::::::::');
            filtrarResultados(input, input.val().toLowerCase());
        }
    });


    $( "#catalogo .listview" ).css('margin','0 -1em -1em -1em').before(catalogoNavbar);

    $(document).on('click','#categos-navbar li a',function(){ 

        $('#sin-resultados').remove();

        var boton = $(this);

        var targetCat = boton.attr('href').replace('#CAT-','');
        var matchClass = 'cat-match-'+targetCat;

        var targetLi = $('ul.listview li[data-categos*="'+targetCat+'"]');
        targetLi = targetLi.add(targetLi.prev());

        var activar = boton.is('.inactive');

        if (activar) {
            
            boton.removeClass('inactive');
            targetLi.removeClass('cat-hide').addClass(matchClass);

        }else{

            if (!$('#categos-navbar li a.inactive').length) {

                $('#categos-navbar li a').not(boton).addClass('inactive');
                $('ul.listview li').not(targetLi).addClass('cat-hide');
                targetLi.addClass(matchClass);

            }else{

                boton.addClass('inactive');
                targetLi.removeClass(matchClass);
                $('ul.listview li').not('[class*="cat-match-"]').addClass('cat-hide');

            };

        }

        var todos = true;

        $('#categos-navbar li a').each(function(){
            if (!$(this).is('.inactive')) {
                todos = false;
            }
        });

        if ( todos ) {
            $('#categos-navbar li a').removeClass('inactive');
            $('.cat-hide').removeClass('cat-hide');
        }

        if (!$('ul.listview li:visible').length) {
            $('ul.listview').append(noitemsHTML).listview('refresh');
        }

        // console.log($('ul.listview li:visible').length);
    });

    $('body').append(scrollBtns);

});

$(window).on('scrollstart', function(){
    $('.fapp-scroll-btn,.fapp-alfa-btn').stop().animate({'opacity':'0.9'});
});

$(window).on('scrollstop', function(){
    setTimeout( function(){ 
        var opacity = $('body').scrollTop()>15 ? '0.3' : '0';
        $('.fapp-scroll-btn,.fapp-alfa-btn').stop().animate({'opacity': opacity});
    }, 500 );
});

$('.fapp-alfa-btn').click(function (e) {
        // $('html, body').animate({scrollTop: $elem.height()}, 800);
});

$(document).on('click','.fapp-scroll-btn', function (e) {
    $('html, body').animate({scrollTop: '0px'}, 600 );
});


function filtrarResultados(input, searchValue) {

    var listened = input;
    searchValue = $.trim(searchValue.toLowerCase());

    typeListenerVal[2] = searchValue;

    clearTimeout( listenTimeout );
    listenTimeout = setTimeout( function(){ 

        // console.log('filtrarResultados::::::::::::::::::');
        // console.log(typeListenerVal);
        // console.log([isDefined(typeListenerVal[1],true,true), isDefined(typeListenerVal[2],true,false), typeListenerVal[1] != typeListenerVal[2] ]);

        $('#sin-resultados').remove();

        if ( isDefined(typeListenerVal[1],true,true) && isDefined(typeListenerVal[2],true,false) && typeListenerVal[1] != typeListenerVal[2] ) {

            getCatalogo(function(nuevoCatalogo){

                catalogo = nuevoCatalogo.catalogo;
                var resultados = [];

                for (var codCatalogoE in catalogo ){

                    var catalogoE = catalogo[codCatalogoE];

                    if( catalogoE != undefined && 'detalle' in catalogoE ){

                        var nombreCatalogoE = catalogoE.nombreCatalogo.toLowerCase();
                        var categosE = catalogoE.categos.toLowerCase();
                        var localidadE = catalogoE.localidad.toLowerCase();
                        var detalleE = catalogoE.detalle.toLowerCase();
                        var coinc = 0;

                        for (var c = 0; c < caracteresEsp.length; c++) {
                            searchValue = searchValue.replaceAll(caracteresEsp[c],caracteresEspRep[c]);
                            nombreCatalogoE = nombreCatalogoE.replaceAll(caracteresEsp[c],caracteresEspRep[c]);
                            localidadE = localidadE.replaceAll(caracteresEsp[c],caracteresEspRep[c]);
                            detalleE = detalleE.replaceAll(caracteresEsp[c],caracteresEspRep[c]);
                        }

                        // console.log('codCatalogoE:'+codCatalogoE);
                        // console.log('searchValue:'+searchValue);

                        if ( hasStr( nombreCatalogoE,searchValue ) ) coinc = coinc + 5;
                        if ( hasStr( categosE,searchValue ) ) coinc = coinc + 2;
                        if ( hasStr( localidadE,searchValue ) ) coinc = coinc + 2;
                        if ( hasStr( detalleE,searchValue ) ) coinc = coinc + 1;

                        if ( coinc > 0 ) {
                            resultados.pushNew({ coinc: coinc, codCatalogoE: codCatalogoE, nombreCatalogoE: nombreCatalogoE });
                        };
                    }

                }

                $('#listview-results').remove();
                $('ul.listview').addClass('force-hide').after('<ul data-role="listview" class="force-hide listview" id="listview-results" style="margin-top: 0;"></ul>');
                
                if (resultados.length) {

                    resultados.sort(function(a, b) {
                        var coincA = a['coinc'];
                        var coincB = b['coinc'];
                        return (coincA < coincB) ? -1 : (coincA > coincB) ? 1 : 0;
                    });

                    // console.log(JSON.stringify(resultados));

                    for (var i = 0; i < resultados.length; i++) {

                        var esteCod = resultados[i].codCatalogoE;
                        var targetLi = $('ul.listview:not(#listview-results) li[data-catalogo="'+esteCod+'"]');
                        targetLi = targetLi.add(targetLi.prev());

                        $('#listview-results').prepend(targetLi.clone());
                    }

                    $('#listview-results').listview().removeClass('force-hide');

                }else{

                    $('#listview-results').html(noitemsHTML).listview().removeClass('force-hide');

                }
                
            });
            
        }else{
            $('#listview-results').remove();
            $('ul.listview').removeClass('force-hide');
        }

    }, 1000);

}


document.addEventListener("backbutton", onBackClickEvent, false);

function onBackClickEvent(e) {

    var stackLength = $.mobile.navigate.history.stack.length;

    if( homePage || loginPage ){

        navigator.app.exitApp();

    }else if (window.history.state.hash == '#detalle' && stackLength >= 2) {

        var targetHash = $.mobile.navigate.history.stack[stackLength-2].hash;
        if (targetHash != undefined && targetHash != 'undefined' ) {
            $('body').pagecontainer('change',targetHash);
        }

    }else if ($('#home-btn').length){

        $('#home-btn').click();

    }else{

        $('h1').animate({ left: '100%' }, 300);
        $('[data-role="header"]').slideUp(300, function(){ $(this).animate({top: '-50px' }) })
        $('[data-role="navbar"]').animate({ left: '-100%' }, 300);
        $('[data-role="panel"]').css({ right: 'auto' }).animate({ left: '100%' }, 300);
        $('div[data-role="page"]')
            .animate({ 
                    top: '100%',
                    background: '#fff'
                },
                500, 
                function(){
                    document.location.href = 'inicio.html';
                }
            );
    }

}

document.addEventListener("deviceready", function(){

    if ( document.location.href.indexOf('index.html') >= 0 ) {

        $('#waiting').fadeOut();
        $('#received').fadeIn();

    }

    if( loginPage ){

        // Local Storage
        localStorage.setItem('conEstado', 0);

    }

    if ( hoyDateObj < fechaLanzaObj ) {

        // Local Storage
        localStorage.setItem('updated', 0);

    }

    conEstado = localStorage.getItem("conEstado");

    if( conEstado == null || conEstado == 0 ){

        if( !loginPage ){

            document.location.href = 'login.html';
        }

        conEstado = 0;

    }else
    if( conEstado == 1 && loginPage ){
        document.location.href = 'inicio.html';
    }

    // Database
    db = window.openDatabase('rueda','1.0','rueda', 1000000);
    db.transaction(setupDB,errorDB,successDB);

    // Updated => Actualizar una sola vez si es 27/6 o posterior
    if(!localStorage.getItem('updated')){
        localStorage.setItem('updated',0);
    }

    // Notificaciones
    notificaciones = localJSON.get("notificaciones");

    if (notificaciones == null) {

        notificaciones = {
                      on: 0,
                      sonido: 0,
                      agenda: []
                  };

        localJSON.set("notificaciones", notificaciones );
    }

    if (conEstado == 1) {

        if( notificaciones.on == 0 ){

            navigator.notification.confirm(
                '¿Desea recibir notificaciones momentos antes de sus entrevistas con los datos de su contraparte? Ud. puede cambiar esta configuración posteriormente.', // message
                 onConfirm,                 // callback to invoke with index of button pressed
                '11ª Rueda de Negocios',    // title
                ['Sí','No, Gracias']        // buttonLabels
            );

        }

        var update = localStorage.getItem('updated') == 0;

        if( hoyDateObj >= fechaLanzaObj && update ){
            
            // console.log('hoyDateObj >= fechaLanzaObj && update');
            
            bajarJSON(null,true,false,function(){
                localStorage.setItem('updated',1);
                notificar('11ª Rueda de Negocios', 'Sus entrevistas ya están disponibles en la aplicación');
            });

        };

        chequearVersion();


    }else{

        // Cancelar Notificaciones
        cancelarNotificaciones();

        notificaciones.on = 0;
        localJSON.set("notificaciones", notificaciones);

    }

    $('#login-btn').click(function(){ 

        var user = $('#user').val();
        var pass = $('#pass').val();

        $.mobile.loading('show');
        loginRueda(user,pass);
        
    });


}, false);



// ------------------------------------------------------------------------
// TEMPLATE FUNCTIONS
// ------------------------------------------------------------------------

var clickCount = 0;
$(document).on('click','.logo, h1',function(event){
    clickCount++;
    if (clickCount>=7) {
        $('body').addClass('lanza');
        $('a[href="#pending"]').show();
        $('a[href="#add"]').show();

        var mensaje = '';
        mensaje += 'Version App: '+versionApp;
        mensaje += ' / ';
        mensaje += 'Version Catalogo: '+versionCatalogo;
        mensaje += ' / ';
        mensaje += 'Actualizada: '+localStorage.getItem('updated');

        navigator.notification.alert(mensaje, function(){}, '11ª Rueda de Negocios', 'Aceptar');
    }
    setTimeout( function(){ 
        clickCount=0;
    }, 3000 );
});

$(document).on('click','.maps',function(event){

    var url = 'https://www.google.com.ar/maps/place/Goldencenter+Eventos/@-34.54827,-58.435967,15z/data=!4m5!3m4!1s0x0:0xad90f72012d90499!8m2!3d-34.54827!4d-58.435967';

    if (device.platform.toLowerCase() === 'android') {
        window.open(url, { openExternal: true });
    }
    else if (device.platform.toLowerCase() === 'ios') {
        window.open(url, '_system');
    }

});


$(document).on('click','#desactivar_notif',function(event){

    notificaciones = localJSON.get("notificaciones");

    if (notificaciones.on == 1) {
        $('#desactivar_notif').hide();
        $('#activar_notif').show();
        notificaciones.on = 2;
        notificaciones = localJSON.set("notificaciones",notificaciones);
        desactivarNotificaciones(true);
    }
    
})

$(document).on('click','#activar_notif',function(event){

    notificaciones = localJSON.get("notificaciones");

    if (notificaciones.on == 0 || notificaciones.on == 2) {
        $('#desactivar_notif').show();
        $('#activar_notif').hide();
        notificaciones.on = 1;
        notificaciones = localJSON.set("notificaciones",notificaciones);
        agendarNotificaciones();
    }
})


$( document ).on( "pagebeforeshow", '#notificacion', function() {

    notificaciones = localJSON.get("notificaciones");
    if (notificaciones.on == 1) {
        $('#desactivar_notif').show();
        $('#activar_notif').hide();
    }else{
        $('#desactivar_notif').hide();
        $('#activar_notif').show();
    }

    if (localStorage.getItem("rueda")) {
        info = localJSON.get("rueda");
        var esteUsuario = info.user;
    }else{
        var esteUsuario = '';
    }

    $('a[href="#pending"]').hide();
    $('a[href="#add"]').hide();

})


$(document).on("pagebeforeshow","#all",function(){

    var html = '';

    notificaciones = localJSON.get("notificaciones");

    if (notificaciones.on == 1) {

        var agenda = notificaciones.agenda;

        for (var i in agenda) {
            if (isDefined(agenda[i].at)) {

                var localeString = scheduled.toLocaleString();
                var dia = hasStr(localeString,'30/') ? 'JUE' : 'VIE' ;
                var mesa = agenda[i].title.split('MESA')[1];
                var horario = agenda[i].title.split('| MESA')[0];
                var empresa = agenda[i].text;

                html += '<tr><td>' + dia + ' ' + horario + '</td><td>' + mesa + '</td><td>' + empresa + '</td></tr>';
            }
        }

    };

    $("table#allTable tbody").empty();
    $("table#allTable tbody").append(html).closest("table#allTable").table("refresh").trigger("create");
    
});

$(document).on("pagebeforeshow","#pending",function(){

    var html = '';

    notificaciones = localJSON.get("notificaciones");
    var agenda = notificaciones.agenda;

    for (var i in agenda) {
        if (isDefined(agenda[i].at)) {

            var scheduled = new Date(agenda[i].at);
            var hoy = new Date();

            if( hoy < scheduled ){

                var ISOString = scheduled.toISOString();
                var dia = hasStr(ISOString,'06-30') ? 'JUE' : 'VIE' ;
                var mesa = agenda[i].title.split('MESA')[1];
                var horario = agenda[i].title.split('| MESA')[0];
                var empresa = agenda[i].text;
                var cancelable = true;

                if ( typeof agenda[i].data == 'object' ) {
                    
                    var data = agenda[i].data; 
                    if ( 'cancelable' in data ) {
                        cancelable = data.cancelable !== false;
                    }
                }

                if (notificaciones.on == 1 || !cancelable) {

                  if (isDefined(mesa)) {
                      html += '<tr><td>' + dia + ' ' + horario + '</td><td>' + mesa + '</td><td>' + empresa + '</td></tr>';
                  }else{
                      var dia = ISOString.split('T')[0].slice(5,10).split('-')[1];
                      var mes = ISOString.split('T')[0].slice(5,10).split('-')[0];
                      var fecha = dia +'/'+ mes;
                      var horario = scheduled.toLocaleString().split(' ')[1].replace(':00','');
                      var texto = agenda[i].text;
                      html += '<tr><td>' + fecha + ' ' + horario + '</td><td></td><td>' + texto + '</td></tr>';
                  }

                }
            }
        }
    }
    

    $("table#pendingTable tbody").empty();
    $("table#pendingTable tbody").append(html).closest("table#pendingTable").table("refresh").trigger("create");  

});


$(document).bind('pageinit',function() {

    $('body').fadeIn(500).animate({ opacity: 1 });

});

$(document).on("pagecontainerbeforechange", function (e, ui) {
    // if (typeof ui.toPage == "string" && ui.options.direction == "back" && ui.prevPage.is('#detalle') ) {
    //     // ui.toPage = ui.prevPage; /* redirect to pageY */
    //     // ui.options.transition = "flip"; /* optional */
    // }
});

$( document ).on( "pagebeforeshow pagecontainerchange", function(e,ui) {

    if (localStorage.getItem("rueda")) {
        info = localJSON.get("rueda");
        var esteUsuario = info.user;
    }else{
        var esteUsuario = '';
    }

    // var bodyClass = (hoyDateObj < fechaLanzaObj) && !arrHasVal(ferreUsers, esteUsuario ) ? '' : 'lanza' ;
    // $('body').addClass(bodyClass);

    if ( ui.toPage.find('[data-role="navbar"] h2').length) {
        $('.ui-panel-wrapper').addClass('fapp-panel-fix');
    }else{
        $('.ui-panel-wrapper').removeClass('fapp-panel-fix');
    }

});


// Update the contents of the toolbars
$( document ).on( "pagecontainerchange", function() {

    // Each of the four pages in this demo has a data-title attribute
    // which value is equal to the text of the nav button
    // For example, on first page: <div data-role="page" data-title="Info">

    var current = $( ".ui-page-active" ).attr( "data-title" );
    var title = $( ".ui-page-active" ).attr( "data-parent" );

    // Change the heading
    $( "[data-role='header'] h1" ).text( title );
    // Remove active class from nav buttons
    $( "[data-role='navbar'] a.ui-btn-active" ).removeClass( "ui-btn-active" );
    // Add active class to current nav button
    $( "[data-role='navbar'] a" ).each(function() {
        if ( $.trim($( this ).text()).toLowerCase() === $.trim(current).toLowerCase() ) {
            $( this ).addClass( "ui-btn-active" );
        }
    });


});

$(document).on('pagecontainerchange', function(e, ui) {

    if (isDefined(ui.toPage) && ui.toPage.is('#placeholder') && isDefined(ui.prevPage) && ui.prevPage.is('.entrevistas')) {
        $('a[href="inicio.html"]').first().click();
    }

});

$( document ).on( 'pageshow', 'div[data-role="page"]', function() {

    $('body').fadeIn(500).animate({ opacity: 1 });

})

$( document ).on( "pageshow", '[data-role="page"][data-ready="false"]', function(e,ui) {

    $.mobile.loading('show');
})

$( document ).on( "pageshow pagecontainerchange", '[data-role="page"][data-ready="true"]', function(e,ui) {
        
    setTimeout( function(){ 
        $.mobile.loading('hide');
    }, 1000 );
})

$( document ).on( "pagebeforeshow", '#manual', function() {

    info = localJSON.get("rueda");
    var numeroOrden = info.numeroOrden;

    $('#numeroOrden b').text(numeroOrden);
});    
 

// HEADER FIJO
$( document ).on( "pagebeforecreate", "#login,#inicio", function() {
    // $('#eventos-header').hide();
    // $('#index-header').toolbar();
    // $( "[data-role='navbar']" ).navbar();
});


$( document ).on( "pagebeforecreate", "#catalogo-placeholder", function(e,ui) {

    catalogoHTML = '';
    setTimeout( function(){ 
        readCatalogo( function(catalogoHTML){

            if ($.trim(catalogoHTML) != '') {
                
                $('#catalogo ul.listview').html(catalogoHTML);
                $('#catalogo').attr('data-ready','true');
                $('body').pagecontainer('change','#catalogo',{ transition: 'pop'} );
            }
                
        });
    }, 500 );

})

$( document ).on( "pagecreate", "#catalogo", function(e,ui) {


    var timer = 0;
    var estadoIntVal = setInterval( function(){ 

        if ($('#catalogo').attr('data-ready') == 'true') {

            clearInterval(estadoIntVal);
            $('#catalogo ul.listview').listview('refresh');
            $.mobile.loading('hide');

        }

        if ( timer==6 && $('ul.listview li').length < 1 ) {
            $('#catalogo-placeholder').trigger('pagebeforecreate');
        }

        if (timer>=30) {
            clearInterval(estadoIntVal);
            navigator.notification.alert('No se pudo cargar la página correctamente. Vuelva al inicio e intente nuevamente.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
        }
        timer++;
    }, 500 );

})

$( document ).on( "pagebeforecreate", "#noasignadas-placeholder", function(e,ui) {

    noAsignadasHTML = '';

    setTimeout( function(){ 
    readNoAsignadas(function(noAsignadasHTML){

        if (noAsignadasHTML != '' && hasStr(noAsignadasHTML,'/--BREAK--/')) {
            
            var propiasHTML = noAsignadasHTML.split('//--BREAK--//')[0];
            if ( $.trim(propiasHTML) == '' ){
                propiasHTML = '<li>';
                propiasHTML += '<span class="horario"></span>';
                propiasHTML += '<h3>No hay entrevistas para mostrar</h3>';
                propiasHTML += '</li>';
            }

            $('#propias ul.listview').html(propiasHTML);
            $('#propias').attr('data-ready','true')

            var ajenasHTML = noAsignadasHTML.split('//--BREAK--//')[1];
            if ( $.trim(ajenasHTML) == '' ){
                ajenasHTML = '<li>';
                ajenasHTML += '<span class="horario"></span>';
                ajenasHTML += '<h3>No hay entrevistas para mostrar</h3>';
                ajenasHTML += '</li>';
            }

            $('#ajenas ul.listview').html(ajenasHTML);
            $('#ajenas').attr('data-ready','true')

            $('body').pagecontainer('change','#propias',{ transition: 'pop'} );

        }

    });
    }, 500 );

})

$( document ).on( "pagecreate", ".noasignadas", function(e,ui) {


    var timer = 0;
    var estadoIntVal = setInterval( function(){ 

        if ($('#propias').attr('data-ready') == 'true' || $('#ajenas').attr('data-ready') == 'true') {

            clearInterval(estadoIntVal);
            $('#propias ul.listview').listview('refresh')
            $('#ajenas ul.listview').listview('refresh')
            $.mobile.loading('hide');
        }

        if ( timer==6 && $('ul.listview li').length < 1 ) {
            $('#noasignadas-placeholder').trigger('pagebeforecreate');
            $.mobile.loading('hide');
        }

        if (timer>=30) {
            clearInterval(estadoIntVal);
            navigator.notification.alert('No se pudo cargar la página correctamente. Vuelva al inicio e intente nuevamente.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
        }
        timer++;
    }, 500 );

})

$( document ).on( "pagebeforecreate", "#placeholder", function(e,ui) {

    var navBarHTML = localStorage.navBarHTML;
    $('#eventos-header ul').html(navBarHTML);

    readEntrevistas(function(entrevistasHTML){

        if ( entrevistasHTML != '') {
            $('#placeholder').attr('data-ready','true').after(entrevistasHTML);
        }
            
    });

})

$( document ).on( "pagecreate", "#placeholder", function(e,ui) {

    $('#eventos-header').toolbar();
    info = localJSON.get("rueda");
    codRepresentante = info.codRepresentante;

    var timer = 0;
    var estadoIntVal = setInterval( function(){ 

        if ($('#placeholder').attr('data-ready') == 'true') {

            clearInterval(estadoIntVal);

            var hoyDateObj = new Date();
            var primerFechaDateObj = new Date(fechasRueda[0].iso);
            primerFechaDateObj.setMinutes(primerFechaDateObj.getMinutes() + primerFechaDateObj.getTimezoneOffset());

            var fechaDefault = (hoyDateObj <= primerFechaDateObj) ? 'jue' : 'vie' ;
            var redirectPageID = '#'+codRepresentante+'-'+fechaDefault;

            if (!$(redirectPageID).length) {
                redirectPageID = $('#eventos-header ul li').first().find('a').attr('href');
                redirectPageID = redirectPageID.replace('jue',fechaDefault)
            }

            $('#placeholder').remove();
            $('body').pagecontainer('change',redirectPageID);

        }

        if ( timer==6 && $('ul.listview li').length < 1 ) {
            refreshPage();
        }
        
        if (timer>=30) {
            clearInterval(estadoIntVal);
            navigator.notification.alert('No se pudo cargar la página correctamente. Vuelva al inicio e intente nuevamente.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
        }
        timer++;
    }, 500 );

})

$( document ).on( "pageshow", "#placeholder", function(e,ui) {

    $.mobile.loading('show');

})

$( document ).on( "pagecreate pagecontainerchange", '[data-role="page"]', function() {
    $('#eventos-header').toolbar();
    $( '[data-role="navbar"]' ).navbar();
    $( 'body>[data-role="panel"]' ).panel()
            .panel()
        .on('panelbeforeopen', function(){    
            $('#eventos-header').animate({'top':'-7em'});
            $('.ui-mobile .ui-page-active').animate({'top':'-7em'});
        })
        .on('panelbeforeclose', function(){    
            $('#eventos-header').animate({'top':'-1px'});
            $('.ui-mobile .ui-page-active').animate({'top':'0'});
        })
})

$(document).on('click', '.fecha-btn', function(){

    $( ".header [data-role='navbar'] a" ).each(function() {

        var targetHref = $(this).attr('href');

        if ( hasStr(targetHref,'jue') && $(targetHref.replace('jue','vie')).length ) {
            $(this).attr('href',targetHref.replace('jue','vie'))
        }else
        if ( hasStr(targetHref,'vie') && $(targetHref.replace('vie','jue')).length ) {
            $(this).attr('href',targetHref.replace('vie','jue'))
        }

    });

});


$(document).on('click', '.abrir-detalle:not(.mi-detalle)', function(){

    var indexEntrevista = $(this).attr('data-index');
    var codCatalogoE = $(this).attr('data-catalogo');
    var codRepresentante = $(this).attr('data-representante');
    var estaFecha = $(this).attr('data-fecha');

    // store some data
    sessionStorage.setItem('codCatalogoE',codCatalogoE);
    sessionStorage.setItem('indexEntrevista',indexEntrevista);
    sessionStorage.setItem('codRepresentante',codRepresentante);
    sessionStorage.setItem('estaFecha',estaFecha);
 
});
 
$( document ).on( "pagebeforeshow", '#detalle', function(e,ui) {

    var pagAnt = ui.prevPage;
    var pagActual = ui.toPage;

    pagActual.attr('data-title',pagAnt.attr('data-title'));

    var esMisDatos = pagActual.is('.mis-datos');

    // nuevoCatalogo;
    getCatalogo(function(nuevoCatalogo){

        var navbar = $('#detalle .top-navbar');
        var indexEntrevista = sessionStorage.getItem('indexEntrevista');

        if (!esMisDatos && indexEntrevista !== undefined && indexEntrevista !== null && indexEntrevista !== '') {

            // Entrevistas
            entrevistas = nuevoCatalogo.entrevistas;

            var codRepresentante = sessionStorage.getItem('codRepresentante');
            var estaFecha = sessionStorage.getItem('estaFecha');
            var estaEntrevista = entrevistas[estaFecha][codRepresentante][indexEntrevista];

            var fecha = estaEntrevista.fecha;
            var horario = estaEntrevista.horario;
            var mesa = estaEntrevista.mesa;

            horario = (parseInt(horario)<=12) ? horario + ' AM' : horario + ' PM' ;
            
            // NAV-BAR
            var fechaStr = estaFecha == 'jue' ? 'Jueves' : 'Viernes' ;
            var diaStr = estaFecha == 'jue' ? '30' : '01' ;
            var mesStr = estaFecha == 'jue' ? 'Junio' : 'Julio' ;
            
            navbar.find('h2').html(fechaStr+' '+diaStr+' <span>de '+mesStr+' de 2016</span>');
            $('.ui-content > h3').css('margin-top','1.5em');

            $('strong.horario').text(horario);
            $('strong.salon').text('MESA '+mesa);
            $('#detalle .detalle-header').show();

        }else{

            navbar.find('h2').html('<span></span>');
            $('.ui-content > h3').css('margin-top','0');
            $('#detalle .detalle-header').hide();

        }
            
        // Catalogo
        if (esMisDatos){
            info = localJSON.get("rueda");
            var codCatalogoE = info.codCatalogo;
        }else{
            var codCatalogoE = sessionStorage.getItem('codCatalogoE');
        }

        var catalogoE = nuevoCatalogo.catalogo[codCatalogoE];

        $('#tituloCod').text(catalogoE.nombreCatalogo +' ('+codCatalogoE+')');
        $('#nombreCatalogo').text(catalogoE.nombreCatalogo);
        $('#categos').text(catalogoE.categos);
        $('#localidad').text(catalogoE.localidad);
        $('#detalle-desc').html(catalogoE.detalle);

        var fotoSRC = catalogoE.fotoCatalogo;
        $('#fotoCatalogo').attr('src',fotoSRC);


    });

});

$( document ).on('click', '.page-change', function(e){
    
    e.preventDefault();
    var button = $(this);

    $('h1').animate({ left: '100%' }, 300);
    $('[data-role="header"]').slideUp(300, function(){ $(this).animate({top: '-50px' }) })
    $('[data-role="navbar"]').animate({ left: '-100%' }, 300);
    $('[data-role="panel"]').css({ right: 'auto' }).animate({ left: '100%' }, 300);
    $('div[data-role="page"]')
        .animate({ 
                top: '100%',
                background: '#fff'
            },
            500, 
            function(){
                document.location.href = button.attr('href');
            }
        );

});


// -------------------------------------------------------------------------
// LOGIN Y ESTADO
// -------------------------------------------------------------------------

function loginRueda(user,pass){
    // console.log('loginRueda::::::::::::::::::');

    var userAnterior = '';
    var representanteAnterior = "";
    var updated = localStorage.getItem('updated') == 1;
    info = localJSON.get("rueda");

    if( info !== null && updated && localStorage.getItem("catalogo") ){

        userAnterior = info.user;
        representanteAnterior = info.codRepresentante;

    };

    if ( userAnterior != '' && userAnterior == user ) {

        localStorage.setItem("conEstado", 1);

        representanteIsReady = false;
        catalogoIsWritten = false;
        entrevistasIsWritten = false;
        noAsignadasIsWritten = false;

        var writeCount = 0;

        getCatalogo(function(dataJSON){

            establecerRepresentante(dataJSON);

            var loginTimer = 0;
            var loginIntVal = setInterval( function(){ 

                if ( representanteIsReady ) {

                    // console.log('loginRueda=>representanteIsReady:::');

                    if ( representanteAnterior != codRepresentante ) {

                        // console.log(' representanteAnterior != codRepresentante ');

                        if ( writeCount == 0 ) {

                            writeCount = 1;

                            notificaciones = {
                                          on: 0,
                                          sonido: 0,
                                          agenda: []
                                      };

                            localJSON.set("notificaciones", notificaciones );

                            generarCatalogo(false, function(){ catalogoIsWritten = true; }, dataJSON);
                            generarEntrevistas(false, function(){ entrevistasIsWritten = true; }, dataJSON);
                            generarNoAsignadas(false, function(){ noAsignadasIsWritten = true; }, dataJSON);

                        };

                    }else{

                        // console.log(' representanteAnterior == codRepresentante ');

                        catalogoIsWritten = true;
                        entrevistasIsWritten = true;
                        noAsignadasIsWritten = true;

                    };

                };

                if ( catalogoIsWritten && entrevistasIsWritten && noAsignadasIsWritten ) {

                    // console.log(' catalogoIsWritten && entrevistasIsWritten && noAsignadasIsWritten ');

                    clearInterval(loginIntVal);
                    $.mobile.loading('hide');
                    document.location.href = 'inicio.html';

                }

            loginTimer++;
            }, 500);

        });

    }else{

        isLogin = true;
        var loginURL = 'user='+user+'&pass='+pass;
        
        $.ajax({
            url: 'http://www.tecnifer.com.ar/rueda/app/login.php?'+loginURL,
            type: 'post',
            data: {
                format: "json"
            },
            dataType: 'jsonp',
            success: function(data) {

                conEstado = data[0].conEstado;

                if (conEstado == 1) {

                    localStorage.setItem("conEstado", 1);
                    
                    numeroOrden = data[0].numeroOrden;
                    razonSocial = data[0].razonSocial;
                    codCatalogo = numeroOrden;

                    info = {
                              user: user,
                              pass: pass,
                              conEstado: conEstado,
                              numeroOrden: numeroOrden,
                              codCatalogo: codCatalogo,
                              codRepresentante: '',
                              razonSocial: razonSocial
                          };

                    localJSON.set("rueda", info);
                    
                    notificaciones = {
                                  on: 0,
                                  sonido: 0,
                                  agenda: []
                              };

                    localJSON.set("notificaciones", notificaciones );

                    bajarJSON(numeroOrden, true, true, establecerRepresentante);


                }else if(conEstado == 0) {

                    navigator.notification.alert("Datos incorrectos. Pruebe nuevamente.", function(){}, '11ª Rueda de Negocios', 'Aceptar');
                    localStorage.setItem("conEstado", 0);
                    $.mobile.loading('hide');

                }else{

                    navigator.notification.alert("No fue posible ingresar. Pruebe nuevamente.", function(){}, '11ª Rueda de Negocios', 'Aceptar');
                    localStorage.setItem("conEstado", 0);
                    $.mobile.loading('hide');

                }

            },
            error: function(error){
                navigator.notification.alert('No fue posible realizar el ingreso por problemas de conexión. Intente nuevamente o aguarde e intente más tarde.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
                $.mobile.loading('hide');
            }
        });
    }
};

function establecerRepresentante(dataJSON){

    var representantes = [];
    entrevistas = dataJSON.entrevistas;
    info = localJSON.get("rueda");

    for (var estaFecha in entrevistas ){
        for (var esteRepresentante in entrevistas[estaFecha] ){
            representantes.pushNew(esteRepresentante);
        }
    }

    if (representantes.length > 1) {

        navigator.notification.confirm(
            'Su empresa tiene más de una agenda de entrevistas. Seleccione de cual agenda desea recibir notificaciones:', // message
             function(buttonIndex){                   // callback to invoke with index of button pressed

                codRepresentante = representantes[buttonIndex-1];
                info.codRepresentante = codRepresentante;
                localJSON.set("rueda", info);
                representanteIsReady = true;
                
             },                 
            '11ª Rueda de Negocios',    // title
            representantes              // buttonLabels
        );

    }else{

        codRepresentante = representantes[0];
        info.codRepresentante = codRepresentante;
        localJSON.set("rueda", info);
        representanteIsReady = true;
        
    }

};

function bajarJSON(numeroOrden,writeNew,redirect,callback){
    // console.log('bajarJSON::::::::::::::::::');

    if (numeroOrden == null || numeroOrden == undefined ) {
        info = localJSON.get("rueda");
        numeroOrden = info.numeroOrden;
    }

    writeNew = writeNew == true;
    redirect = redirect == true;

    var timer = 0;

    entrevistasIsWritten = !writeNew;
    noAsignadasIsWritten = !writeNew;
    catalogoIsWritten = !writeNew;

    if (bajarJSONCount <= 5) {

        var estadoIntVal = setInterval( function(){ 

            if (timer == 0 && numeroOrden !== undefined && numeroOrden !== null ) {

                var catalogoURL = 'http://www.tecnifer.com.ar/rueda/app/data.php?numeroOrden='+numeroOrden;

                $.ajax({
                    url: catalogoURL,
                    type: 'get',
                    data: {
                        format: "json"
                    },
                    dataType: 'jsonp',
                    success: function(dataJSON) {

                        if ( !$.isEmptyObject(dataJSON) && 'catalogo' in dataJSON && 'entrevistas' in dataJSON && 'misdatos' in dataJSON && 'noAsignadas' in dataJSON){

                            catalogo = dataJSON.catalogo;

                            for (var codCatalogoE in catalogo ){

                                if (codCatalogoE.length>3) {
                                    codCatalogoE = codCatalogoE.slice(1,4);
                                }
                                codCatalogoE = parseInt(codCatalogoE);

                                var catalogoE = catalogo[codCatalogoE];

                                if( catalogoE != undefined && 'fotoCatalogo' in catalogoE ){
                                    var fotoCatalogo = catalogoE['fotoCatalogo'];
                                    if ( hasStr(fotoCatalogo,'/nofoto/') ) {
                                        var fotoSRC = fotoCatalogo.replace('http://www.tecnifer.com.ar/rueda/img/nofoto/','images/fotos/');
                                    }else{
                                        var fotoSRC = fotoCatalogo.replace('http://www.tecnifer.com.ar/rueda/img/fotos/','images/fotos/');
                                    }
                                    dataJSON.catalogo[codCatalogoE]['fotoCatalogo'] = fotoSRC;
                                }

                            }

                            if ( typeof callback == 'function' ) {
                                // console.log('callback=>bajarJSON::::::::::::::::::');
                                callback(dataJSON);
                            }

                            var bufferTimer = 0;
                            var bufferIntVal = setInterval( function(){ 

                                if ( bajarJSONCount == 0 && ( !isLogin || (isLogin && representanteIsReady) ) ) {

                                    // console.log(' bajarJSONCount == 0 && ( !isLogin || (isLogin && representanteIsReady) ) ');

                                    clearInterval(bufferIntVal);

                                    bufferDatos(dataJSON, function(dataJSON){

                                        generarCatalogo(false, function(){ catalogoIsWritten = true; }, dataJSON);
                                        generarEntrevistas(false, function(){ entrevistasIsWritten = true; }, dataJSON);
                                        generarNoAsignadas(false, function(){ noAsignadasIsWritten = true; }, dataJSON);

                                        var update = localStorage.getItem('updated') == 0;

                                        if( hoyDateObj >= fechaLanzaObj && update ){
                                            // console.log('bajarJSON=> hoyDateObj >= fechaLanzaObj');
                                            localStorage.setItem('updated',1);
                                            // notificar('11ª Rueda de Negocios', 'Sus entrevistas ya están disponibles en la aplicación');
                                        }

                                    });

                                };

                            bufferTimer++;
                            }, 500);

                        }

                    },
                    error: function(error){
                        navigator.notification.alert("Para ingresar es necesario una conexión a internet.", function(){}, '11ª Rueda de Negocios', 'Aceptar');
                    }
                });

            }

            if ( entrevistasIsWritten && noAsignadasIsWritten && catalogoIsWritten && ( !isLogin || (isLogin && representanteIsReady) ) ) {

                entrevistasIsReady = entrevistasIsWritten;
                noAsignadasIsReady = noAsignadasIsWritten;
                catalogoIsReady = catalogoIsWritten;

                clearInterval(estadoIntVal);

                $.mobile.loading('hide');

                if ( redirect ){
                    document.location.href = 'inicio.html';
                }

            }

            if ( timer>=60 && ( !entrevistasIsWritten || !noAsignadasIsWritten || !catalogoIsWritten ) ) {
                clearInterval(estadoIntVal);
                navigator.notification.alert('No se pudo cargar la aplicación correctamente. Ud. será redireccionado a la página de login.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
                document.location.href = 'login.html';
            }

        timer++;
        }, 1000 );
    }
};


function chequearVersion(){
    // console.log('chequearVersion::::::::::::::::::');
    
    $.ajax({
        url: 'http://www.tecnifer.com.ar/rueda/app/version.php',
        type: 'post',
        data: {
            format: "json"
        },
        dataType: 'jsonp',
        success: function(data) {

            // console.log(data);

            //  Notificaciones
            var alerta = data.alerta;
            var mensaje = alerta.mensaje;
            var seccion = alerta.seccion;
            if (seccion == '') seccion = 'html';

            if ( isDefined(mensaje) && hasStr(urlActual,seccion) ) {
                navigator.notification.alert(mensaje, function(){}, '11ª Rueda de Negocios', 'Aceptar');
            }

            var mensajes = data.notificacion;

            if (Array.isArray(mensajes) && mensajes.length ) {

                notificaciones = localJSON.get("notificaciones");
                var agenda = notificaciones.agenda;

                for (var i = mensajes.length - 1; i >= 0; i--) {
                    
                    var agregar = true;
                    var esteMensaje = mensajes[i];
                    var id = esteMensaje.id;

                    for (var a in agenda) {

                        if ( isDefined(agenda[a].id) && agenda[a].id == id ) {
                            // console.log(' agenda.id == id ');
                            agregar = false;

                        }
                    }

                    if (agregar) {

                        var fecha = esteMensaje.fecha;
                        var expira = 'expira' in esteMensaje && esteMensaje.expira == 1;
                        var noexpira = 'expira' in esteMensaje && esteMensaje.expira == 0;

                        if ( $.trim(fecha) == '' || noexpira ) {

                            fecha = new Date();
                            fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset() + 3);
                            var fechaISO = fecha.toISOString().split('T')[0];
                            var horarioHM = fecha.toISOString().split('T')[1].slice(0,5);

                        }else{

                            var fechaISO = fecha.split(' ')[0];
                            var horarioHM = fecha.split(' ')[1];

                            if ( expira && new Date(fechaISO + " " + horarioHM) < new Date() ) {
                                // console.log('expira && < Date() ');
                                agregar = false;
                            }

                        }

                        // console.log('fechaISO: '+fechaISO);
                        // console.log('horarioHM: '+horarioHM);
                    }
                        
                    // console.log('agregar:'+agregar.toString());
                    // console.log('id:'+id);

                    if (!agregar) {
                        mensajes.splice(i,1);
                        continue;
                    }

                    var mensaje = esteMensaje.mensaje;

                    if (fechaISO.length == 10 && horarioHM.length == 5) {
                        prepararNotificacion(id, '11ª Rueda de Negocios', mensaje, fechaISO, horarioHM, { cancelable: false });
                    }

                }

                if (mensajes.length) agendarNotificaciones();

            }

            //  Version Catálogo
            ultimoCatalogo = parseInt(data.versionCatalogo);

            // console.log('versionCatalogo: '+versionCatalogo);
            // console.log('ultimoCatalogo: '+ultimoCatalogo);

            if( versionCatalogo < ultimoCatalogo ){
                // console.log(' versionCatalogo < ultimoCatalogo ');
                bajarJSON(null,true,false,function(){
                    localStorage.setItem('versionCatalogo',ultimoCatalogo);
                });
            };
                
            if ( homePage ) {

                //  Version App
                var versionUltima = data.versionApp;

                if (hasStr(versionUltima,'!')) {

                    // console.log('versionUltima: '+versionUltima);
                    
                    versionUltima = versionUltima.replaceAll('!','');
                    var versionUltimaInt = parseInt(versionUltima.replaceAll('.',''));
                    var versionAppInt = parseInt(versionApp.replaceAll('.',''));

                    // console.log('versionAppInt: '+versionAppInt);
                    // console.log('versionUltimaInt: '+versionUltimaInt);

                    if( versionAppInt < versionUltimaInt ){
                        navigator.notification.alert('La versión de la aplicación instalada en su dispositivo puede contener errores. Por favor actualice la misma ingresando a google play desde su dispositivo.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
                    }
                    
                }else{

                    var versionUltimaInt = parseInt(versionUltima.replaceAll('.',''));
                    var versionAppInt = parseInt(versionApp.replaceAll('.',''));

                    // console.log('versionAppInt: '+versionAppInt);
                    // console.log('versionUltimaInt: '+versionUltimaInt);

                    if( versionAppInt < versionUltimaInt ){
                        // console.log('versionAppInt < versionUltimaInt ');
                        navigator.notification.alert('Ud. no está utilizando la última versión de la aplicación. Por favor actualice la misma ingresando a google play desde su dispositivo.', function(){}, '11ª Rueda de Negocios', 'Aceptar');
                    };

                }
            }


        },
        error: function(error){
        }
    });


};

function getCatalogo(callback) {
    // console.log('getCatalogo::::::::::::::::::');

    entrevistasIsReady = false;
    noAsignadasIsReady = false;
    catalogoIsReady = false;

    if(localStorage.getItem("misdatos") && localStorage.getItem("entrevistas") && localStorage.getItem("noAsignadas") && localStorage.getItem("catalogo"))
    {
        misdatos = localJSON.get("misdatos");
        entrevistas = localJSON.get("entrevistas");
        noAsignadas = localJSON.get("noAsignadas");
        catalogo = localJSON.get("catalogo");

        entrevistasIsReady = true;
        noAsignadasIsReady = true;
        catalogoIsReady = true;

        if ( typeof callback == 'function' ) {
            callback({ misdatos: misdatos, entrevistas: entrevistas, noAsignadas: noAsignadas, catalogo: catalogo });
        }

    }else{

        loadCatalogo(callback);

    }
        
}

function loadCatalogo(callback) {
    // console.log('loadCatalogo::::::::::::::::::');

    queryDB('*', callback, function(callback){

        bajarJSON(null,true,false, function(dataJSON){
            callback(dataJSON);
            bajarJSONCount++;
        });

    });

}

function bufferDatos(dataJSON, callback){
    // console.log('bufferDatos::::::::::::::::::');

    misdatos = dataJSON.misdatos;
    entrevistas = dataJSON.entrevistas;
    noAsignadas = dataJSON.noAsignadas;
    catalogo = dataJSON.catalogo;

    var misdatosToStr = JSON.stringify(misdatos);
    var entrevistasToStr = JSON.stringify(entrevistas);
    var noAsignadasToStr = JSON.stringify(noAsignadas);
    var catalogoToStr = JSON.stringify(catalogo);

    localStorage.setItem("misdatos",misdatosToStr);
    localStorage.setItem("entrevistas",entrevistasToStr);
    localStorage.setItem("noAsignadas",noAsignadasToStr);
    localStorage.setItem("catalogo",catalogoToStr);

    var misdatosToDB = misdatosToStr.replaceAll('"',"'");
    var entrevistasToDB = entrevistasToStr.replaceAll('"',"'");
    var noAsignadasToDB = noAsignadasToStr.replaceAll('"',"'");
    var catalogoToDB = catalogoToStr.replaceAll('"',"'");

    var hoy = new Date();
    fechaDB = hoy.getTime();

    db = window.openDatabase('rueda','1.0','rueda', 1000000);
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS RUEDA (id INTEGER PRIMARY KEY AUTOINCREMENT, misdatos TEXT, entrevistas TEXT, noasignadas TEXT, catalogo TEXT, fecha DATE)');
        tx.executeSql('INSERT OR REPLACE INTO RUEDA (id, misdatos, entrevistas, noasignadas, catalogo, fecha) VALUES (1,"'+misdatosToDB+'","'+entrevistasToDB+'","'+noAsignadasToDB+'","'+catalogoToDB+'",'+fechaDB+')');
    }, errorDB, function(){});

    entrevistasIsReady = true;
    noAsignadasIsReady = true;
    catalogoIsReady = true;

    if ( typeof callback == 'function' ) {
        callback(dataJSON);
    }

}


// -------------------------------------------------------------------------
// SQL FUNCTIONS
// -------------------------------------------------------------------------

function setupDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS RUEDA (id INTEGER PRIMARY KEY AUTOINCREMENT, misdatos TEXT, entrevistas TEXT, noasignadas TEXT, catalogo TEXT, fecha DATE)');
}

function errorDB(e) {
}

function successDB() {
}
// Query the database
//
function queryDB(field, callback, errorFallBack) {
    // console.log('queryDB::::::::::::::::::');

    if (field == null || field == undefined) { field = '*'; }

    var dbErrorHandler = function(){};

    if (typeof errorFallBack == 'function') {
        dbErrorHandler = errorFallBack;
    }else{
        dbErrorHandler = errorDB;
    }

    db = window.openDatabase('rueda','1.0','rueda', 1000000);
    db.transaction(function(tx){

        tx.executeSql('SELECT '+field+' FROM RUEDA', [], function(tx, results){

            if (typeof callback == 'function') {

                var len = results.rows.length;

                var resultados = {};

                for (var i=0; i<len; i++){
                    resultados['misdatos'] = results.rows.item(i).misdatos.replaceAll("'",'"');
                    resultados['entrevistas'] = results.rows.item(i).entrevistas.replaceAll("'",'"');
                    resultados['noasignadas'] = results.rows.item(i).noasignadas.replaceAll("'",'"');
                    resultados['catalogo'] = results.rows.item(i).catalogo.replaceAll("'",'"');
                    resultados['fechaDB'] = results.rows.item(i).fecha;
                }

                if (resultados['misdatos'] != undefined && resultados['misdatos'] != null ) { misdatos = JSON.parse(resultados['misdatos']); }
                if (resultados['entrevistas'] != undefined && resultados['entrevistas'] != null ) { entrevistas = JSON.parse(resultados['entrevistas']); }
                if (resultados['noasignadas'] != undefined && resultados['noasignadas'] != null ) { noAsignadas = JSON.parse(resultados['noasignadas']); }
                if (resultados['catalogo'] != undefined && resultados['catalogo'] != null ) { catalogo = JSON.parse(resultados['catalogo']); }

                // console.log('callback=>queryDB::::::::::::::::::');
                callback({ misdatos: misdatos, entrevistas: entrevistas, noAsignadas: noAsignadas, catalogo: catalogo });

            }else{

                querySuccess(tx, results);

            }

        }, function(e){ 
            // console.log('dbErrorHandler=>1::::::::::::::::::');
                dbErrorHandler(callback);
            });

    }, function(e){ 
        // console.log('dbErrorHandler=>2::::::::::::::::::');
            dbErrorHandler(callback);
        }, function(){});

}

// Query the success callback
//
function querySuccess(tx, results) {

    var len = results.rows.length;

    for (var i=0; i<len; i++){


        misdatos = results.rows.item(i).misdatos;
        catalogo = results.rows.item(i).catalogo;
        entrevistas = results.rows.item(i).entrevistas;
        noasignadas = results.rows.item(i).noasignadas;
        fechaDB = results.rows.item(i).fecha;

    }
}

// -------------------------------------------------------------------------
// NOTIFICACIONES
// -------------------------------------------------------------------------

$(document).on('click','#add_reminder',add_reminder);

function onConfirm(buttonIndex) {

    // navigator.notification.alert('Opción guardada con éxito');
    notificaciones = localJSON.get("notificaciones");
    notificaciones.on = buttonIndex;
    localJSON.set("notificaciones", notificaciones);

    if (buttonIndex == 1) {
        agendarNotificaciones();
    }else if (buttonIndex == 2) {
        desactivarNotificaciones();
    }

}

function prepararNotificacion(id, titulo, mensaje, fechaISO, horarioHM, options){
    // console.log('prepararNotificacion::::::::::::::::::');

    var antecipar = 0;
    var cancelable = true;
    var data = {};

    if ( typeof options == 'object' ) {

        if ('antecipar' in options ) antecipar = parseInt(options.antecipar);
        if ('cancelable' in options ) cancelable = options.cancelable === true;

        if (isNaN(antecipar)) antecipar = 0;

        data = { antecipar: antecipar, cancelable: cancelable };
    }

    notificaciones = localJSON.get("notificaciones");
    var agenda = notificaciones.agenda;

    var now = new Date().getTime();
    var horario = new Date((fechaISO + " " + horarioHM)).getTime();

    if ( antecipar !== 0 ) horario = horario - antecipar*60*1000;
    
    if ( horario > now ) {

        if (id == null || id == undefined) { id = agenda.length; }
        var index = agenda.length;

        for (var i in agenda) {
            if ( isDefined(agenda[i].id) && agenda[i].id == id || isDefined(agenda[i].at) && agenda[i].at == horario ) {
                index = i;
                editarNotificacion(agenda[i].id, titulo, mensaje, horario, data);
            }
        }

        var agendaItem = { id: id, title: titulo, text: mensaje, at: horario, icon: "res://icon.png", data: data };
        agenda[index] = agendaItem;
        localJSON.set("notificaciones", notificaciones);
    }

}



function agendarNotificaciones(){
    // console.log('agendarNotificaciones::::::::::::::::::');

    notificaciones = JSON.parse(localStorage.getItem("notificaciones"));

    if (notificaciones.on == 1) {

        var agenda = notificaciones.agenda;
        var agendaCopia = JSON.parse(JSON.stringify(agenda));
        var removerArr = [];
        var ahoraObj = new Date();

        for (var i in agendaCopia) {
            if (isDefined(agendaCopia[i].at)) {
                if ( new Date(agenda[i].at) < ahoraObj ) {
                    removerArr.push(i);
                }else{
                    agenda[i].at = new Date(agenda[i].at);
                }
            }
        }

        for (var r = removerArr.length - 1; r >= 0; r--) {
            var index = removerArr[r];
            agenda.splice(index,1);
            agendaCopia.splice(index,1);
        }

        if (isDefined(cordova.plugins) && isDefined(cordova.plugins.notification)) {

            cordova.plugins.notification.local.hasPermission(function(granted){

              if(granted == true)
              {
                cordova.plugins.notification.local.schedule(agenda);
              }
              else
              {
                cordova.plugins.notification.local.registerPermission(function(granted) {
                    if(granted == true)
                    {
                        cordova.plugins.notification.local.schedule(agenda);
                    }
                    else
                    {
                        navigator.notification.alert("Para recibir notificaciones de eventos es necesario activar estos permisos.", function(){}, '11ª Rueda de Negocios', 'Aceptar');
                    }
                });
              }
            });
        }

        notificaciones.agenda = agendaCopia;
        localStorage.setItem("notificaciones",JSON.stringify(notificaciones));

    }

}

function editarNotificacion(id, title, text, at, data){
    // console.log('editarNotificacion::::::::::::::::::');

    notificaciones = localJSON.get("notificaciones");

    var agenda = notificaciones.agenda;

    var agendaItem = { id: id, title: title, text: text, at: at, icon: "res://icon.png", data: data };

    for (var i in agenda) {
        if ( isDefined(agenda[i].id) && agenda[i].id == id ) {
            agenda[i] = agendaItem;
        }
    }

    localJSON.set("notificaciones", notificaciones);

    var agendaUpdateItem = { id: id, title: title, text: text, at: new Date(at), icon: "res://icon.png", data: data };

    if (notificaciones.on == 1 && isDefined(cordova.plugins) && isDefined(cordova.plugins.notification)) {
        cordova.plugins.notification.local.update(agendaUpdateItem);
    }
}

function cancelarNotificacion(id){
    cordova.plugins.notification.local.cancel(id, function() {
        navigator.notification.alert('La notificación fue desactivada', function(){}, '11ª Rueda de Negocios', 'Aceptar');
    });
}

function desactivarNotificaciones(alerta){
    // console.log('desactivarNotificaciones::::::::::::::::::');

    alerta = alerta == true;
    notificaciones = localJSON.get("notificaciones");
    var agenda = notificaciones.agenda;

    if (isDefined(cordova.plugins) && isDefined(cordova.plugins.notification)) {

        var cancelablesArr = [];
        var agendaArr = [];

        for (var i in agenda) {

            if ( typeof agenda[i].data == 'object' ) {
                
                var id = i;
                var cancelable = true;
                var data = agenda[i].data; 
                if ( 'cancelable' in data ) {
                    cancelable = data.cancelable !== false;
                }

                agendaArr.pushNew(id);
                if (cancelable) cancelablesArr.pushNew(id);
            }

        }

        // console.log(agenda.length);
        // console.log(cancelablesArr.length);
        // console.log(JSON.stringify(cancelablesArr));

        cordova.plugins.notification.local.cancel(cancelablesArr, function() {

            notificaciones = localJSON.get("notificaciones");
            notificaciones.on = 2;
            localJSON.set("notificaciones", notificaciones);

            if(alerta) navigator.notification.alert('Las notificaciones fueron desactivadas', function(){}, '11ª Rueda de Negocios', 'Aceptar');

        }, this);
    }
}

function cancelarNotificaciones(){
    // console.log('cancelarNotificaciones::::::::::::::::::');

    if (isDefined(cordova.plugins) && isDefined(cordova.plugins.notification)) {
        cordova.plugins.notification.local.cancelAll(function() {}, this);
    }
}

function add_reminder()
{
 
    var date = document.getElementById("date").value;
    var time = document.getElementById("time").value;
    var title = document.getElementById("title").value;
    var message = document.getElementById("message").value;

    if(date == "" || time == "" || title == "" || message == "")
    {
      navigator.notification.alert("Todos los campos deben ser informados.", function(){}, '11ª Rueda de Negocios', 'Aceptar');
      return;
    }

    var schtime = new Date((date + " " + time)).getTime();
    schtime = new Date(schtime);

    add_notification(title, message, schtime);
    navigator.notification.alert("Notificación agregada.", function(){}, '11ª Rueda de Negocios', 'Aceptar');

}

function add_notification(title, message, schtime)
{
    notificaciones = localJSON.get("notificaciones");

    var id = notificaciones.agenda.length;

    cordova.plugins.notification.local.hasPermission(function(granted){
      if(granted == true)
      {
        schedule_notification(id, title, message, schtime);
      }
      else
      {
        cordova.plugins.notification.local.registerPermission(function(granted) {
            if(granted == true)
            {
              schedule_notification(id, title, message, schtime);
            }
            else
            {
              navigator.notification.alert("Para recibir notificaciones de eventos es necesario activar estos permisos.", function(){}, '11ª Rueda de Negocios', 'Aceptar');
            }
        });
      }
    });
}

function notificar(title, message)
{
    notificaciones = localJSON.get("notificaciones");

    var id = notificaciones.agenda.length;

    cordova.plugins.notification.local.schedule({
        id: id,
        title: title,
        text: message,
        icon: "res://icon.png"
    });
}

function schedule_notification(id, title, message, schtime)
{
    cordova.plugins.notification.local.schedule({
        id: id,
        title: title,
        text: message,
        at: schtime,
        icon: "res://icon.png"
    });

    var notifObj = { id: id, title: title, text: message, at: schtime.getTime(), icon: "res://icon.png" };
    notificaciones = localJSON.get("notificaciones");
    notificaciones.agenda[notificaciones.agenda.length] = notifObj;
    localJSON.set("notificaciones", notificaciones);

}


function readEntrevistas(callback) {
    

    entrevistasHTMLIsReady = false;
    entrevistasHTML = false;

    var localFile = localStorage.getItem('entrevistasHTML');

    if (localFile !== null && localFile !== undefined && localFile !== '') {

        entrevistasHTMLIsReady = true;
        entrevistasHTML = localFile;
        callback(entrevistasHTML);

    }else{

        var sessionFile = sessionStorage.getItem('entrevistasHTML');

        if (sessionFile !== null && sessionFile !== undefined && sessionFile !== '') {

            entrevistasHTMLIsReady = true;
            entrevistasHTML = sessionFile;
            callback(entrevistasHTML);

        }else{

            generarEntrevistas(false,callback);

        }
    }
}


function generarEntrevistas(writeNew, callback) {
    // console.log('generarEntrevistas::::::::::::::::::');

    writeNew = writeNew == true;

    getCatalogo(function(nuevoCatalogo){
        // console.log('callback=>generarEntrevistas::::::::::::::::::');

        entrevistasHTMLIsReady = false;

        if (nuevoCatalogo.catalogo !== undefined && nuevoCatalogo.entrevistas !== undefined ) {

            info = localJSON.get("rueda");
            codRepresentante = info.codRepresentante;

            entrevistasHTML = '';
            var navBarHTML = '';
            catalogo = nuevoCatalogo.catalogo;
            entrevistas = nuevoCatalogo.entrevistas;
            var representantes = [];
            var iconos = [];

            iconos[1] = 'hand-left';
            iconos[2] = 'hand-right';
            iconos[3] = 'handshake-w';

            for (var estaFecha in entrevistas ){

                var fechaStr = estaFecha == 'jue' ? 'Jueves' : 'Viernes' ;
                var diaStr = estaFecha == 'jue' ? '30' : '01' ;
                var mesStr = estaFecha == 'jue' ? 'Junio' : 'Julio' ;
                var btnStr = estaFecha == 'jue' ? 'prox' : 'ant' ;
                var attr = estaFecha == 'jue' ? 'class="ui-content" role="main" id="jue"' : 'data-role="panel" id="vie"' ;
                var iconStr = estaFecha == 'jue' ? 'ui-icon-carat-r' : 'ui-icon-carat-l' ;
                var dia = estaFecha == 'jue' ? 1 : 2 ;

                for (var esteRepresentante in entrevistas[estaFecha] ){

                    var cambioFechaStr = estaFecha == 'jue' ? esteRepresentante+'-vie' : esteRepresentante+'-jue' ;
                    var fechaAttrStr = estaFecha == 'jue' ? '' : ' data-direction="reverse"' ;

                    representantes.pushNew(esteRepresentante);

                    entrevistasHTML += '<div data-role="page" data-title=" '+esteRepresentante+'" data-theme="b" class="eventos eventos-lista" data-cod="'+esteRepresentante+'" data-parent="MIS ENTREVISTAS" id="'+esteRepresentante+'-'+estaFecha+'" data-fecha="'+estaFecha+'" data-ready="true">';
                        
                    entrevistasHTML += '<div data-role="navbar" class="top-navbar ui-navbar" role="navigation">';
                    entrevistasHTML += '<h2>'+fechaStr+' '+diaStr+' <span>de '+mesStr+' de 2016</span></h2>';
                    entrevistasHTML += '<a href="#'+cambioFechaStr+'" class="ui-btn '+iconStr+' ui-btn-icon-notext ui-corner-all fecha-btn '+btnStr+'-btn" data-transition="slide" '+fechaAttrStr+' data-iconpos="notext"></a>';
                    entrevistasHTML += '</div>';

                    entrevistasHTML += '<div class="ui-content" role="main">';
                    entrevistasHTML += '<ul class="lista-alternada listview" data-role="listview" data-filter="true" data-filter-placeholder="Filtrar...">';

                    for (var index in entrevistas[estaFecha][esteRepresentante] ) {

                        var estaEntrevista = entrevistas[estaFecha][esteRepresentante][index];
                        var fecha = estaEntrevista.fecha;
                        var horario = estaEntrevista.horario;

                        var codCatalogoE = estaEntrevista.codCatalogo;

                        if ( isDefined(codCatalogoE) && codCatalogoE.length>3) {
                            codCatalogoE = codCatalogoE.slice(1,4);
                        }
                        codCatalogoE = parseInt(codCatalogoE);

                        if(codCatalogoE==1) {
                
                             entrevistasHTML += '<li class="break">ALMUERZO<p class="ui-li-aside"><strong>'+horario+'</strong> PM</p></li>';

                        }else
                        if (codCatalogoE==0) {

                             entrevistasHTML += '<li class="disponible">';
                             entrevistasHTML += '<span class="horario">'+horario+'</span>';
                             entrevistasHTML += '<h3>DISPONIBLE</h3>';
                             entrevistasHTML += '</li>';

                        }else{

                             var mesa = estaEntrevista.mesa;
                             var mesaStr = mesa.toString();

                             if (mesa.length < 3 ) {
                                for (var i = mesa.length; i < 3; i++) {
                                    mesaStr = '&nbsp;'+mesaStr;
                                }
                             }

                             var solicitante = estaEntrevista.solicitante;

                             var internacional = estaEntrevista.internacional;
                             var esInternacional = internacional == '1';
                             var iconosIndex = estaEntrevista.solicitante;
                             var mostrarIcono = iconosIndex > 0 && iconosIndex < 4;

                             var catalogoE = catalogo[codCatalogoE];

                             if( catalogoE != undefined ){

                                var nombreCatalogoE = catalogoE.nombreCatalogo;
                                var fotoSRC = catalogoE.fotoCatalogo;
                                var detalleE = catalogoE.detalle;
                                var categosE = catalogoE.categos;
                                var classStr = esInternacional ? ' internacional' : '';

                                var esExp = (hasStr(categosE, 'EXPORTADOR') || categosE == 'EXPORTADOR');
                                var esFab = (hasStr(categosE, 'FABRICANTE') || categosE == 'FABRICANTE');
                                var esDist = (hasStr(categosE, 'MAYORISTA') || categosE == 'MAYORISTA');
                                var esImp = (hasStr(categosE, 'IMPORTADOR') || categosE == 'IMPORTADOR');
                                var esRep = (hasStr(categosE, 'REPRESENTANTE') || categosE == 'REPRESENTANTE');

                                entrevistasHTML += '<li data-role="list-divider" class="list-divider '+classStr+'">';

                                if(esFab)  entrevistasHTML += '<span class="fapp-icono-fab fapp-float-l"></span>';
                                if(esDist) entrevistasHTML += '<span class="fapp-icono-may fapp-float-l"></span>';
                                if(esExp)  entrevistasHTML += '<span class="fapp-icono-exp fapp-float-l"></span>';
                                if(esImp)  entrevistasHTML += '<span class="fapp-icono-imp fapp-float-l"></span>';
                                if(esRep)  entrevistasHTML += '<span class="fapp-icono-rep fapp-float-l"></span>';

                                if(esInternacional) entrevistasHTML += '<figure class="handshake fapp-globo-auto fapp-auto"><img src="images/internacional.png"></figure>';

                                entrevistasHTML += '<span class="horario fapp-float-r">MESA ' + mesaStr + ' | ' + horario + '</span>';
                                if(mostrarIcono) entrevistasHTML += '<figure class="handshake fapp-float-r"><img src="images/'+iconos[iconosIndex]+'.png"></figure>';
                                entrevistasHTML += '</li>';
                                 
                                entrevistasHTML += '<li class="'+classStr+'"><a href="#detalle" class="lista-btn abrir-detalle" data-transition="slide" data-catalogo="'+codCatalogoE+'" data-index="'+index+'" data-representante="'+esteRepresentante+'" data-fecha="'+estaFecha+'">';
                                entrevistasHTML += '<figure class="lista-thumb"><img src="'+fotoSRC+'"></figure>';
                                entrevistasHTML += '<h3>'+nombreCatalogoE+' ('+codCatalogoE+')</h3>';
                                entrevistasHTML += '<div class="force-hide">'+detalleE+'</div>';
                                entrevistasHTML += '</a>';
                                entrevistasHTML += '</li>';

                                if (codRepresentante==esteRepresentante) {
                                    var id = fechasRueda[dia-1].iso.replaceAll('-','')+horario.replaceAll(':','');
                                    prepararNotificacion(id, horario+' | MESA '+mesa, nombreCatalogoE+' ('+codCatalogoE+')', fechasRueda[dia-1].iso, horario, { antecipar: 5 });
                                }

                             }

                        }
                    
                    }


                    entrevistasHTML += '</ul>';
                    entrevistasHTML += '</div>';

                    entrevistasHTML += '</div>';

                }
                
            }

            // Agendar Notificaciones 
            agendarNotificaciones();

            for (var i = 0; i < representantes.length; i++) {
                navBarHTML += '<li><a data-theme="b" href="#'+representantes[i]+'-jue" class="" data-transition="flip"> '+representantes[i]+'</a></li>';
            }
            
            localStorage.setItem("navBarHTML", navBarHTML);

            if (typeof callback == 'function'){ callback(entrevistasHTML); }

            localStorage.setItem("entrevistasHTML", entrevistasHTML);
            sessionStorage.setItem("entrevistasHTML", entrevistasHTML);

            entrevistasHTMLIsReady = true;

        }

    });

}

function readCatalogo(callback) {
    

    catalogoHTMLIsReady = false;

    var localFile = localStorage.getItem('catalogoHTML');

    if (localFile !== null && localFile !== undefined && localFile !== '') {

        catalogoHTMLIsReady = true;
        catalogoHTML = localFile;
        callback(catalogoHTML);

    }else{

        var sessionFile = sessionStorage.getItem('catalogoHTML');

        if (sessionFile !== null && sessionFile !== undefined && sessionFile !== '') {

            catalogoHTMLIsReady = true;
            catalogoHTML = sessionFile;
            callback(catalogoHTML);

        }else{

            catalogoHTML = generarCatalogo(false,callback);

        }
    }
}

function generarCatalogo(writeNew, callback) {
    // console.log('generarCatalogo::::::::::::::::::');

    writeNew = writeNew == true;
    catalogoHTMLIsReady = false;
    catalogoHTML = '';

    getCatalogo(function(nuevoCatalogo){
        // console.log('callback=>generarCatalogo::::::::::::::::::');

        if (nuevoCatalogo.catalogo !== undefined ) {

            var entrevistasIndex = {};

            if (nuevoCatalogo.entrevistas !== undefined ) {

                entrevistas = nuevoCatalogo.entrevistas;

                for (var estaFecha in entrevistas ){

                    for (var esteRepresentante in entrevistas[estaFecha] ){

                        for (var index in entrevistas[estaFecha][esteRepresentante] ) {

                            var estaEntrevista = entrevistas[estaFecha][esteRepresentante][index];
                            var codCatalogoE = estaEntrevista.codCatalogo;

                            if ( isDefined(codCatalogoE) && codCatalogoE.length>3) {
                                codCatalogoE = codCatalogoE.slice(1,4);
                            }
                            codCatalogoE = parseInt(codCatalogoE);

                            entrevistasIndex[codCatalogoE] = estaEntrevista;
                            entrevistasIndex[codCatalogoE]['index'] = index;
                            entrevistasIndex[codCatalogoE]['dia'] = estaFecha;
                            entrevistasIndex[codCatalogoE]['codRepresentante'] = esteRepresentante;

                        }
                    }
                }

            }

            catalogo = nuevoCatalogo.catalogo;
            var catalogoArr = [];

            var i=0;
            for (var codCatalogoE in catalogo ){

                if (codCatalogoE.length>3) {
                    codCatalogoE = codCatalogoE.slice(1,4);
                }
                codCatalogoE = parseInt(codCatalogoE);

                var catalogoE = catalogo[codCatalogoE];

                if( catalogoE != undefined ){
                    catalogoArr[i] = catalogoE;
                    catalogoArr[i]['nombreCatalogo'] = catalogoE.nombreCatalogo;
                i++;
                }

            }

            catalogoArr.sort(function(a, b) {
                var textA = a['nombreCatalogo'];
                var textB = b['nombreCatalogo'];
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            var iconos = [];

            iconos[1] = 'hand-left';
            iconos[2] = 'hand-right';
            iconos[3] = 'handshake-w';

            for (var iLength in catalogoArr ){

                if ( catalogoArr[iLength].codCatalogo ) {

                     var catalogoE = catalogoArr[iLength];

                     if( catalogoE != undefined ){

                         var codCatalogoE = catalogoE.codCatalogo;
                         var esExterior = parseInt(codCatalogoE) > 9999;
                         var classStr = esExterior ? ' exterior' : '';

                         catalogoHTML += '<li data-role="list-divider" class="list-divider '+classStr+'">';

                         if(esExterior) catalogoHTML += '<span class="fapp-icono-int fapp-float-r"></span>';
                         
                         var tieneEntrevista = (codCatalogoE in entrevistasIndex);
                         var entrevistasAttr = ' data-index="" data-representante="" data-fecha=""';
                         
                         if (tieneEntrevista) {

                            var estaEntrevista = entrevistasIndex[codCatalogoE];
                            var estaFecha = estaEntrevista['dia'];
                            var esteRepresentante = estaEntrevista['codRepresentante'];
                            var index = estaEntrevista['index'];
                            var mesa = estaEntrevista.mesa;
                            var horario = estaEntrevista.horario;

                            entrevistasAttr = ' data-index="'+index+'" data-representante="'+esteRepresentante+'" data-fecha="'+estaFecha+'"';

                            var iconosIndex = estaEntrevista['solicitante'];
                            var mostrarIcono = iconosIndex > 0 && iconosIndex < 4;
                            catalogoHTML += '<span class="postLanza horario fapp-float-r">' + estaFecha.toUpperCase() + ' | ' + horario + '</span>';
                            if(mostrarIcono) catalogoHTML += '<figure class="postLanza handshake fapp-float-r"><img src="images/'+iconos[iconosIndex]+'.png"></figure>';

                         }

                         var nombreCatalogoE = catalogoE.nombreCatalogo;
                         var categosE = catalogoE.categos;
                         var fotoSRC = catalogoE.fotoCatalogo;

                         var esExp = (hasStr(categosE, 'EXPORTADOR') || categosE == 'EXPORTADOR');
                         var esFab = (hasStr(categosE, 'FABRICANTE') || categosE == 'FABRICANTE');
                         var esDist = (hasStr(categosE, 'MAYORISTA') || categosE == 'MAYORISTA');
                         var esImp = (hasStr(categosE, 'IMPORTADOR') || categosE == 'IMPORTADOR');
                         var esRep = (hasStr(categosE, 'REPRESENTANTE') || categosE == 'REPRESENTANTE');

                         if(esFab)  catalogoHTML += '<span class="fapp-icono-fab fapp-float-l"></span>';
                         if(esDist) catalogoHTML += '<span class="fapp-icono-may fapp-float-l"></span>';
                         if(esExp)  catalogoHTML += '<span class="fapp-icono-exp fapp-float-l"></span>';
                         if(esImp)  catalogoHTML += '<span class="fapp-icono-imp fapp-float-l"></span>';
                         if(esRep)  catalogoHTML += '<span class="fapp-icono-rep fapp-float-l"></span>';

                         catalogoHTML += '</li>';
                         
                         catalogoHTML += '<li class="'+classStr+'" data-catalogo="'+codCatalogoE+'" data-categos="'+categosE+'">';
                         catalogoHTML += '<a href="#detalle" class="lista-btn abrir-detalle" data-transition="slide" data-catalogo="'+codCatalogoE+'" '+entrevistasAttr+'>';
                         catalogoHTML += '<figure class="lista-thumb"><img src="'+fotoSRC+'"></figure>';
                         catalogoHTML += '<h3>'+nombreCatalogoE+' ('+codCatalogoE+')</h3>';
                         catalogoHTML += '</a>';
                         catalogoHTML += '</li>';

                    };
                };
            };


            if (typeof callback == 'function'){ callback(catalogoHTML); }

            localStorage.setItem("catalogoHTML", catalogoHTML);
            sessionStorage.setItem("catalogoHTML", catalogoHTML);

            catalogoHTMLIsReady = true;

        }

    });

}

function readNoAsignadas(callback) {
    

    noAsignadasHTMLIsReady = false;

    var localFile = localStorage.getItem('noAsignadasHTML');

    if (localFile !== null && localFile !== undefined && localFile !== '') {

        noAsignadasHTMLIsReady = true;
        noAsignadasHTML = localFile;
        callback(noAsignadasHTML);

    }else{

        var sessionFile = sessionStorage.getItem('noAsignadasHTML');

        if (sessionFile !== null && sessionFile !== undefined && sessionFile !== '') {

            noAsignadasHTMLIsReady = true;
            noAsignadasHTML = sessionFile;
            callback(noAsignadasHTML);

        }else{

            noAsignadasHTML = generarNoAsignadas(false,callback);

        }
    }
}

function generarNoAsignadas(writeNew, callback) {
    // console.log('generarNoAsignadas::::::::::::::::::');

    writeNew = writeNew == true;
    noAsignadasHTMLIsReady = false;
    noAsignadasHTML = '';

    getCatalogo(function(nuevoCatalogo){
        // console.log('callback=>generarNoAsignadas::::::::::::::::::');

        if (nuevoCatalogo.catalogo !== undefined && nuevoCatalogo.noAsignadas !== undefined ) {
        
            noAsignadas = nuevoCatalogo.noAsignadas;
            catalogo = nuevoCatalogo.catalogo;

            var iconos = [];

            iconos[1] = 'hand-left';
            iconos[2] = 'hand-right';
            iconos[3] = 'handshake-w';

            var i = 0;
            for (var solicitante in noAsignadas ){

                if (i>0) noAsignadasHTML += '//--BREAK--//';
                i++;

                var propias = solicitante == 'propias';

                for (var index in noAsignadas[solicitante] ) {

                    var estaEntrevista = noAsignadas[solicitante][index];
                    var codCatalogoE = estaEntrevista.codCatalogo;
                    var mutuo = estaEntrevista.mutuo;

                    if (codCatalogoE.length>3) {
                        codCatalogoE = codCatalogoE.slice(1,4);
                    }
                    codCatalogoE = parseInt(codCatalogoE);

                    var catalogoE = catalogo[codCatalogoE];

                    if( catalogoE != undefined ){

                        var esMutuo = mutuo == '1';
                        var classStr = esMutuo ? ' mutuo' : '';
                        var iconosIndex = esMutuo ? 3 : propias ? 1 : 2 ;

                        noAsignadasHTML += '<li data-role="list-divider" class="list-divider '+classStr+'">';
                        var entrevistasAttr = ' data-index="" data-representante="" data-fecha=""';                        

                        noAsignadasHTML += '<figure class="handshake fapp-float-r"><img src="images/'+iconos[iconosIndex]+'.png"></figure>';

                        var nombreCatalogoE = catalogoE.nombreCatalogo;
                        var categosE = catalogoE.categos;
                        var detalleE = catalogoE.detalle;
                        var fotoSRC = catalogoE.fotoCatalogo;

                        var esExp = (hasStr(categosE, 'EXPORTADOR') || categosE == 'EXPORTADOR');
                        var esFab = (hasStr(categosE, 'FABRICANTE') || categosE == 'FABRICANTE');
                        var esDist = (hasStr(categosE, 'MAYORISTA') || categosE == 'MAYORISTA');
                        var esImp = (hasStr(categosE, 'IMPORTADOR') || categosE == 'IMPORTADOR');
                        var esRep = (hasStr(categosE, 'REPRESENTANTE') || categosE == 'REPRESENTANTE');

                        if(esFab)  noAsignadasHTML += '<span class="fapp-icono-fab fapp-float-l"></span>';
                        if(esDist) noAsignadasHTML += '<span class="fapp-icono-may fapp-float-l"></span>';
                        if(esExp)  noAsignadasHTML += '<span class="fapp-icono-exp fapp-float-l"></span>';
                        if(esImp)  noAsignadasHTML += '<span class="fapp-icono-imp fapp-float-l"></span>';
                        if(esRep)  noAsignadasHTML += '<span class="fapp-icono-rep fapp-float-l"></span>';

                        noAsignadasHTML += '</li>';

                        noAsignadasHTML += '<li class="'+classStr+'">';
                        noAsignadasHTML += '<a href="#detalle" class="lista-btn abrir-detalle" data-transition="slide" data-catalogo="'+codCatalogoE+'" '+entrevistasAttr+'>';
                        noAsignadasHTML += '<figure class="lista-thumb"><img src="'+fotoSRC+'"></figure>';
                        noAsignadasHTML += '<h3>'+nombreCatalogoE+' ('+codCatalogoE+')</h3>';
                        noAsignadasHTML += '<div class="force-hide">'+detalleE+'</div>';
                        noAsignadasHTML += '</a>';
                        noAsignadasHTML += '</li>';

                    }
                
                }

            }
       

            if (typeof callback == 'function'){ callback(noAsignadasHTML); }

            localStorage.setItem("noAsignadasHTML", noAsignadasHTML);
            sessionStorage.setItem("noAsignadasHTML", noAsignadasHTML);

            noAsignadasHTMLIsReady = true;

            return noAsignadasHTML;

        }

    });

}

function refreshPage(){
    $.mobile.changePage(window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
}



// -------------------------------------------
// EXTENSIONS---------------------------------
// -------------------------------------------

var localJSON = {
    set: function (key, value) {
        window.localStorage.setItem( key, JSON.stringify(value) );
    },
    get: function (key) {
        try {
            return JSON.parse( window.localStorage.getItem(key) );
        } catch (e) {
            return null;
        }
    },
    remove: function (key) {
        window.localStorage.removeItem( key );
    }
};

if (!Array.prototype.pushNew) {

    Array.prototype.pushNew = function(values) {

    if (!Array.isArray(values)) values = [values];
    var thisArray = this;
    for (var i = 0; i < values.length; i++) {
        if ( !arrHasVal( thisArray, values[i] ) ) { thisArray.push(values[i]) };
    };
    return thisArray;
    };

}

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str,replace) {
      var parentStr = this;
      if ( isDefined(str, true, true) && isDefined(replace, true, true) ) {
          if (str=='.') {
              return parentStr.replace(/\./g, replace);
          }else{
              return parentStr.replace(new RegExp(str, 'g'), replace);
          }
      }else{
          return parentStr.toString();
      };
    };
}

function sortAsc(array,key){

    if ( !Array.isArray(array) ) { return array; }

    array.sort(function(a, b) {
        var textA = a[key];
        var textB = b[key];
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
};



arrHasVal=function( array, value, match ) {

    if ( !Array.isArray(array) ) { return; }

    match = isDefined(match) && (match == true || match == false ) ? match : true;

    for (var i = 0; i < array.length; i++) {
        if ( (match && array[i] == value) || (!match && hasStr( array[i], value ) ) ) {
            return true;
        };
    };

    return false;

}

hasStr=function ( string, subString ){

    string = stringfy(string);
    subString = stringfy(subString);

    if ( string.indexOf( subString ) >= 0 ) {
        return true;
    }else{
        return false;
    }

}


isDefined=function( variable, aceptnull, aceptempty ){

    if ( aceptnull == true && aceptempty == true && variable == undefined ) {
        return false;
    }else
    if ( aceptnull == true && aceptempty == true && variable != undefined ) {
        return true;
    }else
    if ( ( aceptnull == true && ( variable == '' || variable == undefined ) ) || ( aceptempty == true && ( variable == null || variable == undefined ) ) ) {
        return false;
    }else
    if ( ( aceptnull == true && ( variable != '' && variable != undefined ) ) || ( aceptempty == true && ( variable != null && variable != undefined ) ) ) {
        return true;
    }else
    if ( variable == null || variable == undefined || variable == "" ) {
        return false;
    }else{
        return true;
    }

}

stringfy=function( obj, separator ){

    if ( obj == null || obj == undefined ){ 
        obj = ""; 
    }else if ( Array.isArray(obj) ) {
        obj.join(separator);
    }else{
        obj = obj.toString();
    };

    return obj;

}



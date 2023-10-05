var DELTA_ORE_RICERCA = 2;
var TRADUZIONI = {
    'it': 0,
    'en': 1,
    'de': 2,
    'fr': 3,
    'sp': 4,
    'ro': 5,
    'jp': 6,
    'zh': 7,
    'ru': 8
};

var LIMITE_SCROLL_TAB;

var indiceTraduzione;

var lastSearchedItems = new Array();
var lastSearchedItemsTreni = new Array();
var lastSearchedItemsStazioni = new Array();
var lastSearchedItemsOrigine = new Array();
var lastSearchedItemsDestinazione = new Array();

$('html').hide();

VT.App = function () {
    $("#contenuto-infotraffico").hide();
    $("#link-wrap").hide();
    $("#filtri-modprog").hide();
    this.map = new VT.Map();
    this.caricamenti = 0;
    
    this.aggiornaNews();
    this.aggiornaStatistiche();


    this.tabs = [];

    var app = this;
    var map = this.map;

    caricaRSSTab(false);
    caricaTicker();
    var lang = $.cookie('LANG');
    if (lang == 'it' || lang == 'fr' || lang == 'en'){
        $('#spanInfoMob').removeClass('paddingSpan');
    } else {
        $('#spanInfoMob').addClass('paddingSpan');
    }
    if (lang == 'zh' || lang == 'jp') {
        $('#spanModProg').addClass('paddingSpan');
    } else {
        $('#spanModProg').removeClass('paddingSpan');
    }
    $("#contenuto-infotraffico").show();
    if (lang != 'it') {
        $('#link-lavora').addClass('hidden');
        $('#link-fsnews').addClass('hidden');
        $('#link-social').addClass('hidden');
    } else {
        $('#link-lavora').removeClass('hidden');
        $('#link-fsnews').removeClass('hidden');
        $('#link-social').removeClass('hidden');
    }
    $("#link-wrap").show();
    indiceTraduzione = TRADUZIONI[$.cookie('LANG')];

    //############### Modifiche WebStorage HTML5 ######################################
    if (localStorage.lastSearchedItems) {
        lastSearchedItems = JSON.parse(localStorage.lastSearchedItems);
    }
    if (localStorage.lastSearchedItemsTreni) {
        lastSearchedItemsTreni = JSON.parse(localStorage.lastSearchedItemsTreni);
    }
    if (localStorage.lastSearchedItemsStazioni) {
        lastSearchedItemsStazioni = JSON.parse(localStorage.lastSearchedItemsStazioni);
    }
    if (localStorage.lastSearchedItemsOrigine) {
        lastSearchedItemsOrigine = JSON.parse(localStorage.lastSearchedItemsOrigine);
    }
    if (localStorage.lastSearchedItemsDestinazione) {
        lastSearchedItemsDestinazione = JSON.parse(localStorage.lastSearchedItemsDestinazione);
    }
    //##################################################################################

    $('#refreshInfoMob').click(function (event) {
        caricaRSSTab(false);
        caricaTicker();
    });

    $('#refreshInfoLav').click(function (event) {
        caricaRSSTab(true);
    });

    $('#link-home').click(function (event) {
        app.chiudiContenuti();
        $('nav a.on').trigger('click');
        $('.pagina-secondaria:visible .chiudi').trigger('click');
        $('#link-nazionale').trigger('click');
        $('#tuttoRegionale').trigger('click');
        $('#tuttoNazionale').trigger('click');
        // fix IE8 per evitare che fa l'uncheck della checkbox
        $('#filtri-nazionale .tutto').attr('checked', 'checked');

        //###################################### SiteCatalyst #############################################
        sc_send('Home Page', null, null, null, null);
        //#################################################################################################
        event.preventDefault();
    });

    $('#link-siti').click(function (event) {
        $(this).toggleClass('on');
        $('#crossbar-siti').slideToggle();
        $('#link-social').removeClass('on');
        $('#crossbar-social').slideUp();
        return false;
    });

    $('#link-social').click(function (event) {
        $(this).toggleClass('on');
        $('#crossbar-social').slideToggle();
        $('#link-siti').removeClass('on');
        $('#crossbar-siti').slideUp();
        return false;
    });

    $('#crossbar-siti a.chiudi').click(function (event) {
        $('#link-siti').removeClass('on');
        $('#crossbar-siti').slideUp();
        return false;
    });

    $('#crossbar-social a.chiudi').click(function (event) {
        $('#link-social').removeClass('on');
        $('#crossbar-social').slideUp();
        return false;
    });

    $('.tab').live('click', function (event) {
        var index = $(this).index();
        app.selezionaTab(index);
        return false;
    });

    $('.chiudi').live('click', function (event) {

        var index = $(this).parent().index();

        $(document).off('click', '#contenuto-' + index + " .link-precedente");
        $(document).off('click', '#contenuto-' + index + " .link-successivo");

        if (app.tabs.length == 1) {
            app.chiudiContenuti();
            return;
        }

        app.chiudiTab(index);

        return false;
    });

    $('.home').live('click', function (event) {
        app.chiudiContenuti();
        return false;
    });

    $('.stazione table .attivo, .tratta table .attivo, .contenitore-corrispondenze table .attivo').live('click', function (event) {
        app.apriDettaglioTreno($(this).data('treno'), $(this).data('origine'), $(this).data('datapartenza'));
    });

    $('#zoom_in').click(function (event) {
        app.map.zoomIn();
        return false;
    });

    $('#zoom_reset').click(function (event) {
        app.map.resetZoom(false);
    });

    $('#zoom_out').click(function (event) {
        app.map.zoomOut();
    });

    $('.box h2').click(function (event) {
        $(this).parent().toggleClass("attivo");
        $(this).next(".contenuto-box").slideToggle();
    });

    $('.boxInfoMob h2').click(function (event) {
        $(this).parent().toggleClass("attivo");
        $(this).next(".contenuto-box").slideToggle();
    });

    $('#bottone-cerca').click(function (event) {
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('.pagina-secondaria').fadeOut();
        $(this).toggleClass('on');
        if ($(this).hasClass('on')) {
            $('#cartina-regioni').fadeOut();
            if ($cercaTreno.data('ricorda') && lastSearchedItems.length > 0) {
                var valore = lastSearchedItems[lastSearchedItems.length - 1];
                $('#dati-treno').val(valore.split(/\|/)[0]);  //$('#dati-treno').val(''); Richiesta Capitanelli del 17/04/2014
                $('#form-cercatreno input[type=submit]').prop('disabled', false);
                $('#dati-treno').autocomplete('search');
            } else {
                $('#dati-treno').val('');
                $('#form-cercatreno input[type=submit]').prop('disabled', true);
            }
        }
        $('#form-cercatreno').fadeToggle(200);
        $('#dati-treno').focus();
        return false;
    });

    $('#form-cercatreno a.bottone').click(function (event) {
        $('#form-cercatreno').trigger('submit');
        return false;
    });

    $('#form-cercatreno a.chiudi').click(function (event) {
        $('#bottone-cerca').trigger('click');
        $cercaTreno.removeData('disambigua');
        $('#dati-treno').autocomplete("close");
        return false;
    });

    $('#bottone-imposta').click(function (event) {
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('.pagina-secondaria').fadeOut();
        //$('.input-localita').autocomplete("close");
        $(this).toggleClass('on');
        if ($(this).hasClass('on')) {
            $('#cartina-regioni').fadeOut();

            if ($impostaViaggio.data('ricorda') && lastSearchedItemsOrigine.length > 0) {
                var valore = lastSearchedItemsOrigine[lastSearchedItemsOrigine.length - 1];
                $('#localita-partenza').val(valore.split(/\|/)[0]);
                //$('#localita-partenza').autocomplete('search');
            }
            if ($impostaViaggio.data('ricorda') && lastSearchedItemsDestinazione.length > 0) {
                var valore = lastSearchedItemsDestinazione[lastSearchedItemsDestinazione.length - 1];
                $('#localita-arrivo').val(valore.split(/\|/)[0]);
                //$('#localita-arrivo').autocomplete('search');
            }

            $('#localita-partenza').focus();
        }
        $('#form-impostaviaggio').fadeToggle(200);
        return false;
    });

    $('#form-impostaviaggio a.bottone').click(function (event) {
        $('#form-impostaviaggio').trigger('submit');
        return false;
    });

    $('#form-impostaviaggio a.chiudi').click(function (event) {
        $('#bottone-imposta').trigger('click');
        return false;
    });

    $('#bottone-stampatreno').click(function (event) {
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('.pagina-secondaria').fadeOut();
        $('.stampatreno.aperta a').trigger('click');
        $(this).toggleClass('on');
        if ($(this).hasClass('on')) {
            $('#cartina-regioni').fadeOut();

            checkAbilitaCreaPdf('#form-stampatreno');
        }
        $('#form-stampatreno').fadeToggle(200);
        $('#form-stampatreno #st-input-numero-treno').focus();
        return false;
    });

    $('#form-stampatreno a.bottone').click(function (event) {
        $('#form-stampatreno').trigger('submit');
        return false;
    });

    $('#form-stampatreno a.chiudi').click(function (event) {
        $('#bottone-stampatreno').trigger('click');
        return false;
    });

    $('#dati-treno').placeholder();
    $('#localita-partenza').placeholder();
    $('#localita-arrivo').placeholder();

    $('#dati-treno').data('scelto', false);
    $('#dati-treno').keyup(function (event) {
        if (event.keyCode != 13 && !/^\d+$/.test($(this).val())) {
            $('#form-cercatreno input[type=submit]').prop('disabled', true);
            $("#dati-treno").data('scelto', false);
        }

    });

    $('#dati-treno').click(function (event) {
        $('#dati-treno').autocomplete('search', {click: true, value: $(this).val()});
    });

    $cercaTreno = $('#form-cercatreno');
    $impostaViaggio = $('#form-impostaviaggio');

    $cercaTreno.data('ricorda', false);

    $('#dati-treno').autocomplete({
        autoFocus: true,
        minLength: 2,
        source: function (request, response) {
            var url;
            var numero;
            var dati = {};
            var suggerimenti = [];
            var suggerimentiFilter = [];
            if (request.term.click && request.term.value.length == 0) {	//Array Misto Treni/Stazioni
                if (lastSearchedItems.length > 0)
                {
                    var risp = lastSearchedItems;
                    var risposte = risp.unique();
                    for (var i = risposte.length - 1; i >= 0; i--) {
                        risposta = risposte[i].split(/\|/);
                        suggerimenti.push(risposta[0]);
                        dati[risposta[0]] = risposta[1];
                    }
                }
                $cercaTreno.data('risposte', dati);
                response(suggerimenti);
            } else if (request.term.length == 1) { //Array con autocompletamento Treni o Stazioni
                var risp = [];
                if (/^\d+$/.test(request.term)) {
                    if (lastSearchedItemsTreni.length > 0) {
                        risp = lastSearchedItemsTreni;
                    }
                } else
                {
                    if (lastSearchedItemsStazioni.length > 0) {
                        risp = lastSearchedItemsStazioni;
                    }
                }
                if (risp.length > 0) {
                    var risposte = risp.unique();
                    for (var i = risposte.length - 1; i >= 0; i--) {
                        risposta = risposte[i].split(/\|/);
                        suggerimenti.push(risposta[0]);
                        dati[risposta[0]] = risposta[1];
                    }
                }
                $cercaTreno.data('risposte', dati);
                suggerimentiFilter = suggerimenti.filter(request.term);
                response(suggerimentiFilter);
            } else if (request.term.length >= 2) { //Array da chiamata Server su DB (standard)
                if (/^\d+$/.test(request.term)) {
                    $cercaTreno.data('numero', true);
                    var risposte = $cercaTreno.data('disambigua');

                    if (typeof (risposte) == 'undefined') {
                        $('#form-cercatreno input[type=submit]').prop('disabled', false);
                        response([]);
                    } else {
                        suggerimenti = [];
                        for (var risposta in risposte) {
                            suggerimenti.push(risposta);
                        }
                        response(suggerimenti);
                    }
                } else {
                    $('#form-cercatreno input[type=submit]').prop('disabled', true);
                    $cercaTreno.data('numero', false);

                    $.ajax({
                        url: "./resteasy/viaggiatreno/autocompletaStazione/" + request.term,
                        type: 'get',
                        dataType: 'html',
                        success: function (data, textStatus, xhr) {
                            var dati = {};
                            var suggerimenti = [];
                            if (data.trim() !== "") {
                                var risposte = data.trim().split("\n");
                                for (var i = 0; i < risposte.length; i++) {
                                    risposta = risposte[i].split(/\|/);
                                    suggerimenti[i] = risposta[0];
                                    dati[risposta[0]] = risposta[1];
                                }
                            }
                            $cercaTreno.data('risposte', dati);
                            response(suggerimenti);
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            $cercaTreno.removeData('risposte');
                            response([]);
                        }
                    });
                }
            }
        },
        select: function (event, ui) {
            if (/^[0-9]/.test(ui.item.value))
                $cercaTreno.data('numero', true);
            else
                $cercaTreno.data('numero', false);

            if ($cercaTreno.data('numero') && typeof ($cercaTreno.data('disambigua')) != 'undefined') {
                risposta = $cercaTreno.data('disambigua')[ui.item.label].split("-");
                app.apriDettaglioTreno(risposta[0], risposta[1], risposta[2]);
                $('#bottone-cerca').trigger('click');
                $cercaTreno.removeData('disambigua');
            }
            $('#form-cercatreno input[type=submit]').removeAttr('disabled');
            $(this).data('scelto', true);
        }
    });

    $('#form-cercatreno').submit(function (event) {
        $('#form-cercatreno .error').hide();
        if (!$('#dati-treno').data('scelto') && !($cercaTreno.data('numero'))) {
            return false;
        }
        form = $(this);
        $('#dati-treno').autocomplete("close");

        var testo = $('#dati-treno').val();

        //############### Modifiche WebStorage HTML5 ######################################
        if (lastSearchedItems.length >= 3) {
            lastSearchedItems.shift();
        }
        if (form.data('numero')) {
            if (lastSearchedItemsTreni.length >= 3) {
                lastSearchedItemsTreni.shift();
            }
            lastSearchedItems.push(testo);
            lastSearchedItemsTreni.push(testo);
        } else {
            if (lastSearchedItemsStazioni.length >= 3) {
                lastSearchedItemsStazioni.shift();
            }
            var risposte = form.data('risposte');
            lastSearchedItems.push(testo + "|" + risposte[testo]);
            lastSearchedItemsStazioni.push(testo + "|" + risposte[testo]);
        }
        $cercaTreno.data('ricorda', true);
        localStorage.lastSearchedItems = JSON.stringify(lastSearchedItems);
        localStorage.lastSearchedItemsTreni = JSON.stringify(lastSearchedItemsTreni);
        localStorage.lastSearchedItemsStazioni = JSON.stringify(lastSearchedItemsStazioni);

        //#################################################################################

        if (form.data('numero')) {
            $.ajax({
                url: "./resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/" + testo,
                type: 'get',
                dataType: 'html',
                success: function (data, textStatus, xhr) {
                    //###################################### SiteCatalyst #############################################
                    sc_send('Cerca Treno', testo, null, null, null);
                    //#################################################################################################
                    var risposte = data.trim().split("\n");
                    if (risposte.length > 0 && risposte[0].length > 0) {
                        if (risposte.length == 1) {
                            risposta = risposte[0].split(/\|/)[1].split("-");
                            app.apriDettaglioTreno(risposta[0], risposta[1], risposta[2]);
                            $('#bottone-cerca').trigger('click');
                        } else {
                            $('#form-cercatreno input[type=submit]').prop('disabled', true);
                            dati = {};
                            for (var i = 0; i < risposte.length; i++) {
                                risposta = risposte[i].split(/\|/);
                                dati[risposta[0]] = risposta[1];
                            }
                            $cercaTreno.data('disambigua', dati);
                            $('#dati-treno').autocomplete('search');
                        }
                    } else {
                        $('.error', form).css("display", "inline-block");
                    }
                }
            });
        } else {
            //###################################### SiteCatalyst #############################################
            sc_send('Cerca Treno', null, null, testo, null);
            //#################################################################################################
            var risposte = form.data('risposte');
            app.apriDettaglioStazione(risposte[testo], testo);
            $('#bottone-cerca').trigger('click');
        }
        event.preventDefault();
    });
    $('#localita-partenza').click(function (event) {
        $('#localita-partenza').autocomplete('search', {click: true, value: $(this).val()});
    });

    $('#localita-arrivo').click(function (event) {
        $('#localita-arrivo').autocomplete('search', {click: true, value: $(this).val()});
    });

    $impostaViaggio.data('ricorda', false);
    $('.input-localita-impostaViaggio').autocomplete({
        source: function (request, response) {
            var el = $(this.element);
            var suggerimentiFilter = [];
            var suggerimenti = [];
            var risp = [];
            var baseUrl = "./resteasy/viaggiatreno/autocompletaStazioneImpostaViaggio/";
            var testo = "";

            if (request.term.click) {
                testo = request.term.value;
            } else {
                testo = request.term;
            }

            if ((testo.length < 2) || (request.term.click && testo.length == 0)) {
                if (lastSearchedItemsOrigine.length > 0)
                {

                    if (el[0].id == 'localita-partenza') {
                        risp = lastSearchedItemsOrigine;
                    } else {
                        risp = lastSearchedItemsDestinazione;
                    }
                    var risposte = risp.unique();
                    for (var i = risposte.length - 1; i >= 0; i--) {
                        risposta = risposte[i].split(/\|/);
                        suggerimenti.push(risposta[0]);
                        risp[risposta[0]] = risposta[1];
                    }
                }
                el.data('dati', risp);
                suggerimentiFilter = suggerimenti.filter(testo);
                response(suggerimentiFilter);
            } else if (testo.length > 1) {
                $.ajax({
                    url: baseUrl + testo, //request.term,
                    type: 'GET',
                    dataType: 'html',
                    success: function (data, textStatus, xhr) {
                        var risposte = data.split("\n");
                        var suggerimenti = new Array(risposte.length - 1);
                        var dati = {};
                        for (var i = 0; i < risposte.length - 1; i++) {
                            risposta = risposte[i].split(/\|/);
                            suggerimenti[i] = risposta[0];
                            dati[risposta[0]] = risposta[1];
                        }
                        el.data('dati', dati);
                        response(suggerimenti);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        response([]);
                    }
                });
            }
        },
        select: function (event, ui) {
            var lengthArrivo = 0;
            var lengthPartenza = 0;
            if (event.target.id === "localita-arrivo") {
                lengthArrivo = ui.item.value.length;
                lengthPartenza = $("#localita-partenza").val().length;
            } else {
                lengthPartenza = ui.item.value.length;
                lengthArrivo = $("#localita-arrivo").val().length;
            }
            if (lengthPartenza > 2 && lengthArrivo > 2) {
                $('#form-impostaviaggio input[type=submit]').removeAttr('disabled');
            } else {
                $('#form-impostaviaggio input[type=submit]').attr('disabled', 'disabled');
            }
        }
    });
    
    $('.input-localita').autocomplete({
        source: function (request, response) {
            var el = $(this.element);
            var suggerimentiFilter = [];
            var suggerimenti = [];
            var risp = [];
            var baseUrl = "./resteasy/viaggiatreno/autocompletaStazione/";
            var testo = "";

            if (request.term.click) {
                testo = request.term.value;
            } else {
                testo = request.term;
            }
            
            if (testo.length > 1) {
                $.ajax({
                    url: baseUrl + testo, //request.term,
                    type: 'GET',
                    dataType: 'html',
                    success: function (data, textStatus, xhr) {
                        var risposte = data.split("\n");
                        var suggerimenti = new Array(risposte.length - 1);
                        var dati = {};
                        for (var i = 0; i < risposte.length - 1; i++) {
                            risposta = risposte[i].split(/\|/);
                            suggerimenti[i] = risposta[0];
                            dati[risposta[0]] = risposta[1];
                        }
                        el.data('dati', dati);
                        response(suggerimenti);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        response([]);
                    }
                });
            }
        }
    });

    $('#form-stampatreno #st-input-giorno').datepicker({
        minDate: '-7',
        maxDate: '0'
    });


    $('#form-stampatreno #st-input-numero-treno, #form-stampatreno #st-input-giorno').keyup(function (event) {
        checkAbilitaCreaPdf('#form-stampatreno');
    });

    $('#form-stampatreno #st-input-giorno').change(function (event) {
        checkAbilitaCreaPdf('#form-stampatreno');
    });

    $('.input-localita').keyup(function (event) {
        if ($("#localita-partenza").val().length > 0 && $("#localita-arrivo").val().length > 0) {
            $('#form-impostaviaggio input[type=submit]').removeAttr('disabled');
        } else {
            $('#form-impostaviaggio input[type=submit]').attr('disabled', 'disabled');
        }

        checkAbilitaCreaPdf('#form-stampatreno');
    });

    $('.input-localita').change(function (event) {
        if ($("#localita-partenza").val().length > 0 && $("#localita-arrivo").val().length > 0) {
            $('#form-impostaviaggio input[type=submit]').removeAttr('disabled');
        } else {
            $('#form-impostaviaggio input[type=submit]').attr('disabled', 'disabled');
        }

        checkAbilitaCreaPdf('#form-stampatreno');
    });

    ore = moment().tz("Europe/Rome").hours();
    var fascia;
    if (ore < 6) {
        fascia = 0;
    } else if (ore >= 6 && ore < 9) {
        fascia = 1;
    } else if (ore >= 9 && ore < 12) {
        fascia = 2;
    } else if (ore >= 12 && ore < 15) {
        fascia = 3;
    } else if (ore >= 15 && ore < 18) {
        fascia = 4;
    } else if (ore >= 18 && ore < 21) {
        fascia = 5;
    } else {
        fascia = 6;
    }
    $('#fascia-' + fascia).attr('selected', 'selected');

    $('.inputDate').val(moment().tz("Europe/Rome").format('DD/MM/YYYY'));
    $('.inputDate').datepicker($.datepicker.regional[$.cookie('LANG')]);

    $('#form-impostaviaggio').submit(function (event) {
        if ($('#form-impostaviaggio input[type=submit]').attr('disabled')) {
            return false;
        }

        //$('.input-localita').autocomplete("close");

        $partenza = $('#localita-partenza');
        $arrivo = $('#localita-arrivo');
        var partenza = $partenza.data('dati')[$partenza.val()];
        var arrivo = $arrivo.data('dati')[$arrivo.val()];
        //######################################## Web storage HTML5
        if (lastSearchedItemsOrigine.length >= 3) {
            lastSearchedItemsOrigine.shift();
        }
        if (lastSearchedItemsDestinazione.length >= 3) {
            lastSearchedItemsDestinazione.shift();
        }

        lastSearchedItemsOrigine.push($partenza.val() + "|" + partenza);
        lastSearchedItemsDestinazione.push($arrivo.val() + "|" + arrivo);

        $impostaViaggio.data('ricorda', true);
        localStorage.lastSearchedItemsOrigine = JSON.stringify(lastSearchedItemsOrigine);
        localStorage.lastSearchedItemsDestinazione = JSON.stringify(lastSearchedItemsDestinazione);
        //########################################
        app.apriProgrammaOrario(moment($('#input-giorno').val(), "DD/MM/YYYY"), parseInt($('#fascia-oraria').val(), 10), $partenza.val(), partenza, $arrivo.val(), arrivo);
        $("#bottone-imposta").trigger('click');
        return false;
    });

    $('#form-stampatreno').submit(function (event) {
        stampaPdf('#form-stampatreno');

        return false;
    });

    function download(strData, strFileName, strMimeType) {

        var D = document, A = arguments, a = D.createElement("a"), d = A[0], n = A[1], t = A[2] || "application/pdf";
        var newdata = "data:" + strMimeType + ";base64," + escape(strData);
        a.href = newdata;

        if ('download' in a) {
            a.setAttribute("download", n);
            a.innerHTML = "downloading...";
            D.body.appendChild(a);
            setTimeout(function () {
                var e = D.createEvent("MouseEvents");
                e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
                        );

                a.dispatchEvent(e);
                D.body.removeChild(a);
            }, 66);

            return true;
        }
        ;
    }

    $('#bottone-meteo').click(function (event) {
        $(this).toggleClass('on');
        if ($(this).hasClass('on')) {
            app.chiudiContenuti();
            $('#bottone-cerca.on').trigger('click');
            $('#bottone-imposta.on').trigger('click');
            $('#bottone-news.on').trigger('click');
            $('#bottone-stampatreno.on').trigger('click');
            $('.pagina-secondaria').fadeOut();
            $('#cartina-regioni').fadeOut();
            app.map.mapMode = "meteo";
            //###################################### SiteCatalyst #############################################
            if ($('#selettore-regione').val() == null) {
                sc_send('Meteo  Nazionale', null, null, null, null);
            } else {
                sc_send('Meteo ' + $('#selettore-regione').val(), null, null, null, null);
            }
            //#################################################################################################
        } else {
            app.map.mapMode = "stations";
        }
        app.map.loadStazioni();
    });

    $('#bottone-modprog').click(function (event) {
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('.pagina-secondaria').fadeOut();
        $(this).toggleClass('on');
        if ($(this).hasClass('on')) {
            $('#cartina-regioni').fadeOut();
            $('#mod-prog').fadeIn();
            caricaRSS(true);
            event.preventDefault();
        } 
        return false;
    });

    $('#bottone-news').click(function (event) {

        $('#bottone-cerca.on').trigger('click');
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('.pagina-secondaria').fadeOut();
        $(this).toggleClass('on');
        if ($(this).hasClass('on')) {
            $('#cartina-regioni').fadeOut();
            $('#info-mobilita').fadeIn();
            caricaRSS(false);
            caricaRSSTab(false);
            caricaTicker();
            event.preventDefault();
        }
        return false;
    });

    $('#pagina-news a.chiudi').click(function (event) {
        $('#bottone-news').trigger('click');
        return false;
    });

    $('div.contenuto.tratta:visible .legenda a, div.contenuto.treno:visible .legenda a, div.contenuto.stazione:visible .legenda a').live('click', function (event) {
        var legenda = $(this).parent();

        if (legenda.hasClass('aperta')) {
            var testo = $(this).text();
            testo = testo.replace('-', '+');
            $(this).text(testo);

            legenda.animate({bottom: "-144px"}, 400);

            $('div.contenuto.treno:visible .stampatreno a').show();
        } else {
            var testo = $(this).text();
            testo = testo.replace('+', '-');
            $(this).text(testo);

            legenda.animate({bottom: 0}, 400);

            $('div.contenuto.treno:visible .stampatreno a').hide();
        }
        legenda.toggleClass('aperta');
        return false;
    });

    $('div.contenuto.treno:visible .stampatreno a').live('click', function (event) {

        checkAbilitaCreaPdf('div.contenuto.treno:visible');

        var stampatreno = $(this).parent();
        if (stampatreno.hasClass('aperta')) {
            var testo = $(this).text();
            testo = testo.replace('-', '+');
            $(this).text(testo);
            stampatreno.animate({bottom: "-73px"}, 400);

            $('div.contenuto.treno:visible .legenda a').show();
        } else {
            var testo = $(this).text();
            testo = testo.replace('+', '-');
            $(this).text(testo);

            stampatreno.animate({bottom: 0}, 400);

            $('div.contenuto.treno:visible .legenda a').hide();
        }
        stampatreno.toggleClass('aperta');
        return false;
    });

    var linguaSelezionata = $.cookie('LANG');
    if (linguaSelezionata == 'ru') {
        LIMITE_SCROLL_TAB = 15;
    } else {
        LIMITE_SCROLL_TAB = 25;
    }
    $('#lingua-' + linguaSelezionata).addClass('selezionata');
    $('html').addClass('lingua-' + linguaSelezionata);

    $(".lingua").click(function (event) {
        if ($(this).not(".selezionata")) {
            $('#scelta-lingua .lingua.selezionata').removeClass("selezionata");
            $(this).addClass("selezionata");
            setLanguage($(this).data('lingua'));
            //####################################### SiteCatalyst ################################
            sc_custom_send($(this).data('lingua'));
            //#####################################################################################
        }
    });

    var $selettoreRegione = $('#selettore-regione');
    for (var name in regioniData) {
        regione = regioniData[name];
        if (regione.id !== 0) {
            option = $('<option>').attr('value', name).html(regione.name);
            $selettoreRegione.append(option);
        }
    }

    $selettoreRegione.change(function (event) {
        $('#cartina-regioni').fadeOut();
        map.loadRegione($(this).val());
    });

    function aggiornaFiltri() {
        $('#contenuto-infotraffico').hide();
        map.filtroTreniCorrente = [];
        $('#box-filtri .attivo input:checked').each(function (event) {
            map.filtroTreniCorrente.push(filtroTreni[$(this).attr("data-filtro")]);
        });
        $('#contenuto-infotraffico').show();
    }

    $('#link-nazionale').click(function (event) {
        if ($(this).is('.attivo')) {
            return false;
        }
        $('#cartina-regioni').fadeOut();
        $('option', $selettoreRegione).removeAttr('selected');
        $('#seleziona-regione', $selettoreRegione).attr('selected', 'selected');
        $(this).addClass('attivo');
        $('#link-regionale').removeClass('attivo');
        $('#filtri-nazionale').addClass('attivo');
        $('#filtri-regionale').removeClass('attivo');
        $('#filtri-nazionale input').removeAttr('checked');
        $('#filtri-nazionale .tutto').attr('checked', 'checked');
        aggiornaFiltri();
        map.loadRegione('italia');
        return false;
    });

    $('#link-regionale').click(function (event) {
        $(this).addClass('attivo');
        //###################################### SiteCatalyst #############################################
        sc_send('Traffico Regionale - selezione', null, null, null, null);
        //################################################################################################
        $('#cartina-regioni').fadeIn();
        $('#link-nazionale').removeClass('attivo');
        $('#filtri-regionale').addClass('attivo');
        $('#filtri-nazionale').removeClass('attivo');
        $('#filtri-regionale input').removeAttr('checked');
        $('#filtri-regionale .tutto').attr('checked', 'checked');
        $('nav a.on').trigger('click');
        $('.pagina-secondaria:visible .chiudi').trigger('click');
        aggiornaFiltri();
        return false;
    });

    //nuovo tab infomob

    $('#link-infomob').click(function (event) {
        $(this).addClass('attivo');
        $('#link-modprog').removeClass('attivo');
        $("#filtri-modprog").hide();
        $('#filtri-modprog').fadeOut();
        $('#filtri-infomob').fadeIn();
        caricaRSSTab(false);
    });

    $('#link-modprog').click(function (event) {
        $(this).addClass('attivo');
        $('#link-infomob').removeClass('attivo');
        $("#filtri-infomob").hide();
        $('#filtri-infomob').fadeOut();
        $('#filtri-modprog').fadeIn();
        $('nav a.on').trigger('click');
        $('.pagina-secondaria:visible .chiudi').trigger('click');
        caricaRSSTab(true);
    });

    //nuovo tab infomob

    $('#cartina-regioni a').on('click', function (event) {
        if ($(this).parent().is(':visible')) { // Check necessario per bug IE8
            var idRegione = $(this).data('regione');
            $selettoreRegione.find('option').removeAttr('selected');
            $selettoreRegione.find('option[value=' + idRegione + ']').attr('selected', 'selected');
            $('#cartina-regioni').fadeOut();
            map.loadRegione(idRegione);
            event.preventDefault();
        }
    });

    $('#box-filtri input').change(function (event) {
        var $container = $(this).parent().parent().parent();

        // Bisogna evitare di finire con tutte le caselle deselezionate
        if ($container.find('input:checked').length === 0) {
            $(this).attr('checked', 'checked');
        }

        if ($(this).hasClass("tutto")) {
            $container.find('.singolo').removeAttr('checked');
        } else {
            $container.find('.tutto').removeAttr('checked');
        }
        aggiornaFiltri();
        map.loadTratte();
    });

    $('#bottone-come').on('click', function (event) {
        $('#cartina-regioni').fadeOut();
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('#note-legali').fadeOut();
        $('#contatti').fadeOut();
        $('#come-funziona').fadeIn();
        //###################################### SiteCatalyst #############################################
        sc_send('Come Funziona', null, null, null, null);
        //#################################################################################################
        event.preventDefault();
    });

    $('.pagina-secondaria .chiudi').on('click', function (event) {
        $(this).parent().fadeOut();
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        event.preventDefault();
    });

    /*POPUP ALERT RITARDO*/
    $('#popupAlertRitardo a.chiudiPopup').on('click', function (event) {
        $('#popupAlertRitardo').fadeOut();
        event.preventDefault();
    });

    $('#bottone-legale').on('click', function (event) {
        $('#cartina-regioni').fadeOut();
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('#come-funziona').fadeOut();
        $('#contatti').fadeOut();
        $('#note-legali').fadeIn();
        //###################################### SiteCatalyst #############################################
        sc_send('Note Legali', null, null, null, null);
        //#################################################################################################
        event.preventDefault();
    });

    $('#bottone-contatti').on('click', function (event) {
        $('#cartina-regioni').fadeOut();
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('#note-legali').fadeOut();
        $('#come-funziona').fadeOut();
        $('#contatti').fadeIn();
        //###################################### SiteCatalyst #############################################
        sc_send('Contatti', null, null, null, null);
        //#################################################################################################
        event.preventDefault();
    });

    $('#bottone-stampatreno').on('click', function (event) {
        $('#cartina-regioni').fadeOut();
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#note-legali').fadeOut();
        $('#come-funziona').fadeOut();
        $('#contatti').fadeOut();
        $('#stampatreno').fadeIn();

        event.preventDefault();
    });

    var redirectRegione = getParameterByName("idreg");
    if (redirectRegione !== '') {
        for (var codiceRegione in regioniData) {
            var regione = regioniData[codiceRegione];
            if (redirectRegione == regione.id) {
                $('#link-regionale').addClass('attivo');
                $('#link-nazionale').removeClass('attivo');
                $('#filtri-regionale').addClass('attivo');
                $('#filtri-nazionale').removeClass('attivo');
                $('#filtri-regionale input').removeAttr('checked');
                $('#filtri-regionale .tutto').attr('checked', 'checked');
                $('nav a.on').trigger('click');
                $('.pagina-secondaria:visible .chiudi').trigger('click');
                aggiornaFiltri();
                map.loadRegione(codiceRegione);
            }
        }
    }

    // Nasconde la barra degli indirizzi su android
    if (navigator.userAgent.match(/Android/i)) {
        $('html').addClass('android');
    }
    MBP.hideUrlBarOnLoad();

    $(window).on('orientationchange', function (event) {
        if (Math.abs(window.orientation) != 90 && app.tabs.length > 3) {
            app.chiudiTab(3);
        }
    });

    window.setInterval(function () {
        app.aggiornaStatistiche();
        app.aggiornaNews();
    }, 900000);
};

VT.App.prototype.apriTab = function (classe) {
    var maxTab = 4;

    //if (window.supportsOrientation && Math.abs(window.orientation) != 90) {
    if (window.supportsOrientation) {
        maxTab = 3;
    }

    if (this.tabs.length >= maxTab) {
        $('#alert' + maxTab).fadeIn(200).delay(1200).fadeOut(200);
        return -1;
    }
    var index = 0;
    if (this.tabs.length === 0) {
        $('#map').fadeOut();
        var verifyReg = document.getElementById("selettore-regione");
        var selectedReg = verifyReg.options[verifyReg.selectedIndex].value;
        if (selectedReg === "emiliaromagna"){
            $('#logo_emiliaromagna').css('display', 'none');
        }
        $('#colonna-box').fadeOut();
        $('#zoomContainer').fadeOut();
        $('#testata-main').fadeIn();
        $('#main').fadeIn();
        $('#ticker').css('width', '480px');
        $('#freccianera').css('right', '731px');
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
    } else {
        var max = 0;
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].tabIndex >= max) {
                max = this.tabs[i].tabIndex;
            }
        }
        index = max + 1;
    }

    this.renderTemplateAppend('#tabs', 'tab-vuoto', {
        index: index
    });
    this.renderTemplateAppend('#contenuti', 'contenuto-vuoto', {
        index: index,
        classe: classe
    });

    this.selezionaTab(this.tabs.length);
    return index;
};

VT.App.prototype.selezionaTab = function (index) {
    $('#tabs .tab').removeClass('attivo').eq(index).addClass('attivo');
    $("#contenuti .contenuto").hide().eq(index).show();
    updatejScrollPane();
};

VT.App.prototype.chiudiTab = function (index) {
    $(window).off('orientationchange.tab' + index);

    var attivo = $("#tabs .tab").eq(index).is(".attivo");
    $("#tabs .tab").eq(index).fadeOut(400, function () {
        $(this).remove();
    });
    $("#contenuti .contenuto").eq(index).fadeOut(400, function () {
        $(this).remove();
    });

    app.tabs.splice(index, 1);
    if (attivo) {
        app.selezionaTab(index - 1);
    }
};

VT.App.prototype.chiudiContenuti = function () {
    for (var i = 0; i < this.tabs.length; i++) {
        $(window).off('orientationchange.tab' + this.tabs[i].tabIndex);
    }
    $('#main').fadeOut(400, function () {
        $('#contenuti .contenuto').remove();
        $('#tabs .tab').remove();
    });
    $('#map').fadeIn(400);
    var verifyReg = document.getElementById("selettore-regione");
    var selectedReg = verifyReg.options[verifyReg.selectedIndex].value;
    if (selectedReg === "emiliaromagna"){
        $('#logo_emiliaromagna').css('display', 'inline');
    }    
    $('#ticker').css('width', '250px');
    $('#freccianera').css('right', '504px');

    var that = this;
    window.setTimeout(function () {
        that.map.map.invalidateSize(false);
        that.map.resetZoom();
    }, 200);
    $('#testata-main').fadeOut();
    $('#colonna-box').fadeIn();
    $('#zoomContainer').fadeIn();
    this.tabs = [];
};

VT.App.prototype.mostraLoader = function () {
    this.caricamenti++;
    $('#loader').fadeIn(200);
};

VT.App.prototype.nascondiLoader = function () {
    this.caricamenti--;
    if (this.caricamenti <= 0) {
        this.caricamenti = 0;
        $('#loader').fadeOut(200);
    }
};

VT.App.prototype.getTemplate = function (templateName) {
    var templateAccessor = templateName + "Template";
    if (typeof this[templateAccessor] === "undefined" || this[templateAccessor] === null) {
        var source = $("#" + templateName + "-template").html();
        this[templateAccessor] = Handlebars.compile(source);
    }
    return this[templateAccessor];
};

VT.App.prototype.renderTemplate = function (selector, templateName, context) {
    template = this.getTemplate(templateName);
    var renderedTemplate = template(context);
    var recompiledTemplate = Handlebars.compile(renderedTemplate);
    $(selector).html(recompiledTemplate(context));
    updatejScrollPane();
};

VT.App.prototype.renderTemplateAppend = function (selector, templateName, context) {
    template = this.getTemplate(templateName);
    var renderedTemplate = template(context);
    var recompiledTemplate = Handlebars.compile(renderedTemplate);
    $(selector).append(recompiledTemplate(context));
    updatejScrollPane();
};

function updatejScrollPane() {
    if (!$.browser.msie) {
        $.each($('.scrollable'), function (index, val) {
            var $scrol = $(this);
            var jspData = $scrol.closest('.jspScrollable').jScrollPane().data();
            if (jspData && jspData.jsp) {
                jspData.jsp.destroy();
            }
        });
        $('.scrollable').jScrollPane();
    }
}

VT.App.prototype.getRenderedTemplate = function (templateName, context) {
    template = this.getTemplate(templateName);
    var renderedTemplate = template(context);
    var recompiledTemplate = Handlebars.compile(renderedTemplate);
    return recompiledTemplate(context);
};

VT.App.prototype.aggiornaNews = function () {
    ViaggiaTrenoService.getListaNews({
        codRegione: 0,
        lingua: lang,
        "$callback": function (a, b, webNews) {
            if (webNews && webNews.length > 0) {
                for (var i = 0; i < webNews.length; i++) {
                    news = webNews[i];
                    news.primoPiano = (news.primoPiano != "false");
                }
                webNewsBox = $.extend(true, [], webNews.slice(0, 3));
                webNews[webNews.length - 1].last = true;
                webNewsBox[webNewsBox.length - 1].last = true;
                this.renderTemplate("#box-notizie .contenuto-box", "news", {
                    notizie: webNewsBox
                });
                this.renderTemplate("#contenuto-pagina-news", "news", {
                    notizie: webNews
                });
            }
        }.bind(this)
    });
};

VT.App.prototype.aggiornaStatistiche = function () {
    ViaggiaTrenoService.getStatisticheCircolazione({
        timestamp: (new Date()).getTime(),
        "$callback": function (a, b, statistica) {
            this.renderTemplate("#ultimo-aggiornamento", "ultimo-aggiornamento", statistica);
            this.renderTemplate("#statistiche", "statistiche", statistica);
            $('#statistiche').marqueeLoop({speed: 20000});
        }.bind(this)
    });
};

//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~



function manageWebPartenze(webPartenze) {
    var len = webPartenze.length;
    var partenze = new Array(len);
   
            
    for (var i = 0; i < len; i++) {
        var webPartenza = webPartenze[i];
        var nonPartitoEstero = true;
        if (webPartenza.oraPartenzaEstera != null && !webPartenza.circolante){
            var partenzaEstero = webPartenza.oraPartenzaEstera;
            var convertPartenzaEstero = formatTime(partenzaEstero);
            var dataAttuale = formatTime(Date.now());
            if(convertPartenzaEstero < dataAttuale){
            	nonPartitoEstero = false;
            }
            } 
        partenze[i] = {
            alternanza: (i % 2 ? "pari" : ""),
            codOrigine: webPartenza.codOrigine,
            datapartenza: webPartenza.dataPartenzaTreno,
            idTreno: webPartenza.numeroTreno,
            numero: webPartenza.compNumeroTreno,
            destinazione: webPartenza.destinazioneEstera ? webPartenza.destinazioneEstera : webPartenza.destinazione,
            orario: webPartenza.compOrarioPartenza,
            binarioProgrammato: webPartenza.binarioProgrammatoPartenzaDescrizione,
            binarioEffettivo: webPartenza.binarioEffettivoPartenzaDescrizione,
            orientamento: webPartenza.compOrientamento[indiceTraduzione],
            ritardo: webPartenza.compRitardo[indiceTraduzione],
            partito: webPartenza.compInStazionePartenza[indiceTraduzione],
            imgCambi: webPartenza.compImgCambiNumerazione,
            imgRitardo: webPartenza.compImgRitardo,
            nonPartitoEstero : nonPartitoEstero
        };
    }
    return partenze;
}

function manageWebArrivi(webArrivi) {
    var len = webArrivi.length;
    var arrivi = new Array(len);   
    
     
    
    for (var i = 0; i < len; i++) {
        var webArrivo = webArrivi[i];
        var nonPartitoEstero = true;
        if (webArrivo.oraPartenzaEstera != null && !webArrivo.circolante){
            var partenzaEstero = webArrivo.oraPartenzaEstera;
            var convertPartenzaEstero = formatTime(partenzaEstero);
            var dataAttuale = formatTime(Date.now());
            if(convertPartenzaEstero < dataAttuale){
            	nonPartitoEstero = false;
            }
            }
        arrivi[i] = {
            alternanza: (i % 2 ? "pari" : ""),
            codOrigine: webArrivo.codOrigine,
            datapartenza: webArrivo.dataPartenzaTreno,
            idTreno: webArrivo.numeroTreno,
            numero: webArrivo.compNumeroTreno,
            origine: webArrivo.origineEstera ? webArrivo.origineEstera : webArrivo.origine,
            orario: webArrivo.compOrarioArrivo,
            binarioProgrammato: webArrivo.binarioProgrammatoArrivoDescrizione,
            binarioEffettivo: webArrivo.binarioEffettivoArrivoDescrizione,
            orientamento: webArrivo.compOrientamento[indiceTraduzione],
            ritardo: webArrivo.compRitardo[indiceTraduzione],
            partito: webArrivo.compInStazioneArrivo[indiceTraduzione],
            imgCambi: webArrivo.compImgCambiNumerazione,
            imgRitardo: webArrivo.compImgRitardo,
            nonPartitoEstero : nonPartitoEstero
        };
    }
    return arrivi;
}

function manageDettaglioTreno(treno) {
    var primaFermata = treno.fermate[0];
    var ultimaFermata = treno.fermate[treno.fermate.length - 1];
    var orarioPartenzaOriginale = treno.compOrarioPartenzaZero;
    if(treno.oraPartenzaEstera === null) {
        orarioPartenzaOriginale = treno.compOrarioPartenzaZero;
    } else {
        orarioPartenzaOriginale = formatTime(treno.oraPartenzaEstera);
    }
    var orarioPartenza = treno.compOrarioPartenza;
    var orarioPartenzaCambiato = orarioPartenza !== null && orarioPartenzaOriginale !== null && orarioPartenzaOriginale != orarioPartenza;
    var orarioPartenzaEffettivo = formatTime(primaFermata.effettiva);

    var orarioArrivoOriginale = treno.compOrarioArrivoZero;
    var orarioArrivo = treno.compOrarioArrivo;
    var orarioArrivoCambiato = orarioArrivo !== null && orarioArrivoOriginale !== null && orarioArrivoOriginale != orarioArrivo;
    var orarioArrivoEffettivo = (!!ultimaFermata.arrivoReale) ? formatTime(ultimaFermata.effettiva) : treno.compOrarioArrivoZeroEffettivo;

    var orarioUltimoRilevamento = formatTime(treno.oraUltimoRilevamento);

    var cambiNumero = treno.cambiNumero;
    for (var i = 0; i < cambiNumero.length; i++) {
        cambiNumero[i].numero = treno.compNumeroTreno;
    }
    var nProvv = treno.cambiNumero.length + (treno.subTitle.length > 0 ? 1 : 0);

    var descrizioneVCO = treno.descrizioneVCO;

    /* START - Gestione treni con origine o destino estero
     * Treno con origine estera:
     Sul box di stazione di partenza, lÃ¢â‚¬â�?¢orario di partenza programmata sarÃƒÂ  quella dellÃ¢â‚¬â�?¢origine estera, mentre lÃ¢â‚¬â�?¢orario di partenza effettiva non potrÃƒÂ  mai essere valorizzata. Esempio del treno 87 con partenza da Muenchen HBF:
     Partenza programmata: 11:38
     Partenza effettiva: --:--
     Treno con destinazione estera:
     Sul box di stazione di arrivo, lÃ¢â‚¬â�?¢orario di arrivo programmato sarÃƒÂ  quello del destino estero, mentre lÃ¢â‚¬â�?¢oario di arrivo previsto sarÃƒÂ  quello di arrivo programmato+eventuale ritardo accumulato in corsa. Esempio del treno 86 che arriva a Muenchen HBF con confine Brennero:
     Arrivo programmato: 20:21
     Arrivo previsto:: Arrivo programmato + eventuale ritardo in corsa
     * */
    if (treno.oraPartenzaEstera !== null) {
        orarioPartenza = formatTime(treno.oraPartenzaEstera);
        orarioPartenzaCambiato = false;
        orarioPartenzaEffettivo = "--:--";
    }
    if (treno.oraArrivoEstera !== null) {
        orarioArrivo = formatTime(treno.oraArrivoEstera);
        orarioArrivoCambiato = false;
        orarioArrivoEffettivo = treno.ritardo > 0 ? formatTime(treno.oraArrivoEstera + (treno.ritardo * 60000)) : orarioArrivo;
    }
    /* END - Gestione treni con origine o destino estero */

    /*INIZIO: GESTIONE POPUP ALERT RITARDO*/

    //START - Controllo per visualizzazione alert ritardo
    var alertRitardo = false;
    if (ultimaFermata.arrivoReale === null && orarioUltimoRilevamento !== "--:--")
    {
        var now = moment().tz("Europe/Rome");

        //Creo la data di ultimo rilevamento
        var dataUltimoRilevamentoString = now.get("year") + "-" + (now.get("month") + 1) + "-" + (now.get("date")) + " " + orarioUltimoRilevamento;
        var dataUltimoRilevamento = moment(dataUltimoRilevamentoString, "YYYY-MM-DD HH:mm").tz("Europe/Rome");

        //Aggiungo 15 minuti alla data di ultimo rilevamento
        var dataCompare = dataUltimoRilevamento.add(15, "minutes");

        //Differenza in secondi tra la data di adesso e la data di ultimo rilevamento + 15 minuti
        var diffSecond = Math.floor((moment.duration(now.diff(dataCompare))).asSeconds());

        //Se la differenza � maggiore di 0 vuol dire che non ricevo rilevamenti da + di 15 minuti
        // TT. 0013921289 Capitanelli modificato da 30 a 15 minuti
        //email di Barbara del mercoled� 29/05/2019 10:22
        if (diffSecond > 0)
        {
            alertRitardo = true;
            //imgAlertRitardo = "/vt_static/img/avvisi/alert.png";
        }
    }
    //END - Controllo per visualizzazione alert ritardo

    /*FINE: GESTIONE POPUP ALERT RITARDO*/

    var strDataPartenzaTreno = moment(treno.dataPartenzaTreno).format('DD/MM/YYYY');
    
    var partenzaEstero = treno.oraPartenzaEstera;
    var nonPartitoEstero = true;
    if (partenzaEstero != null){
    var convertPartenzaEstero = formatTime(partenzaEstero);
    var dataAttuale = formatTime(Date.now());
    if(convertPartenzaEstero < dataAttuale){
    	nonPartitoEstero = false;
    }
    
    }
    
    
    return {
        arrivato: !!(ultimaFermata.arrivoReale),
        cambiNumero: cambiNumero,
        destinazione: treno.destinazioneEstera ? treno.destinazioneEstera : treno.destinazioneZero,
        imgRitardo: treno.compImgRitardo,
        numero: treno.compNumeroTreno,
        orarioPartenzaOriginale: orarioPartenzaOriginale,
        orarioPartenza: orarioPartenza,
        orarioPartenzaCambiato: orarioPartenzaCambiato,
        orarioPartenzaEffettivo: orarioPartenzaEffettivo,
        orarioArrivoOriginale: orarioArrivoOriginale,
        orarioArrivo: orarioArrivo,
        orarioArrivoCambiato: orarioArrivoCambiato,
        orarioArrivoEffettivo: orarioArrivoEffettivo,
        orarioUltimoRilevamento: orarioUltimoRilevamento,
        origine: treno.origineEstera ? treno.origineEstera : treno.origineZero,
        partito: getInfoPartenzaTreno(primaFermata, treno),
        provvedimenti: treno.cambiNumero.length > 0 || treno.subTitle.length > 0,
        ritardo: treno.compRitardoAndamento[indiceTraduzione],
        subtitle: treno.subTitle,
        ultimoRilevamento: treno.stazioneUltimoRilevamento,
        numProvv: nProvv - 1,
        alertRitardo: alertRitardo,
        descrizioneVCO: descrizioneVCO,
        dataPartenzaTreno: strDataPartenzaTreno,
        nonPartitoEstero : nonPartitoEstero
    };
}
function getInfoPartenzaTreno(fermata, treno) {
    var ret = false;
    if (fermata.effettiva !== null) {
        return true;
    }
    if (treno.stazioneUltimoRilevamento !== "--") {
        return true;
    }
    return ret;
}
function manageTratta(webTratta) {
    var len = webTratta.treni.length;
    var treni = new Array(len);
    for (var i = 0; i < len; i++) {
        treno = webTratta.treni[i];
        treni[i] = {
            alternanza: (i % 2 ? "pari" : ""),
            codOrigine: treno.codOrigine,
            datapartenza: treno.dataPartenzaTreno,
            destinazione: treno.destinazioneEstera ? treno.destinazioneEstera : treno.destinazione,
            idTreno: treno.numeroTreno,
            imgRitardo: treno.compImgRitardo,
            numero: treno.compNumeroTreno,
            origine: treno.origineEstera ? treno.origineEstera : treno.origine,
            ritardo: treno.compRitardo[indiceTraduzione]
        };
    }

    return {
        tratta: webTratta.tratta,
        treni: treni
    };
}

function manageInfoFermata(stazione, ritardo) {
    var orarioArrivoCambiato = stazione.fermata.programmataZero && stazione.fermata.programmata && stazione.fermata.programmata != stazione.fermata.programmataZero;
    var prima = stazione.first;
    var ultima = stazione.last;
    var partenzaProg;
    var partenzaEff;
    var orarioPartEff;
    var orarioArrEff;

    orarioPartEff = stazione.partenzaReale === true;
    orarioArrEff = stazione.arrivoReale === true;

    var orarioEff = formatTime(prima ? stazione.fermata.partenzaReale : stazione.fermata.arrivoReale);


    if (stazione.fermata.partenza_teorica != null) {
        partenzaProg = formatTime(stazione.fermata.partenza_teorica);
    }
    if (stazione.fermata.partenzaReale != null) {
        if (stazione.fermata.partenzaReale < stazione.fermata.partenza_teorica) {
            stazione.fermata.partenzaReale = stazione.fermata.partenza_teorica;
        }
        partenzaEff = formatTime(stazione.fermata.partenzaReale);
    } else {

        if (stazione.fermata.nextTrattaType != 0) {
            if (ritardo > 0) {
                partenzaEff = formatTime(stazione.fermata.partenza_teorica + (ritardo * 60000));
            } else {
                partenzaEff = formatTime(stazione.fermata.partenza_teorica);
            }
        } else {
            partenzaEff = "--:--";
            orarioPartEff = true;
        }

    }
    if (orarioEff === "--:--") {

        if (stazione.fermata.nextTrattaType !== 0) {
            if (ritardo > 0) {
                orarioEff = formatTime(stazione.fermata.programmata + (ritardo * 60000));

            } else {
                orarioEff = formatTime(stazione.fermata.programmata);
            }
        } else {
            orarioEff = "--:--";
            orarioArrEff = true;
        }

    }
    return {
        arrivato: orarioArrEff,
        orarioPartEff: orarioPartEff,
        binarioProgrammato: prima ? stazione.fermata.binarioProgrammatoPartenzaDescrizione : stazione.fermata.binarioProgrammatoArrivoDescrizione,
        binarioEffettivo: prima ? stazione.fermata.binarioEffettivoPartenzaDescrizione : stazione.fermata.binarioEffettivoArrivoDescrizione,
        orarioPrevisto: formatTime(stazione.fermata.programmata),
        orarioPrevistoPrecedente: formatTime(stazione.fermata.programmataZero),
        orarioEffettivo: orarioEff,
        orientamento: stazione.orientamento[indiceTraduzione],
        nome: stazione.fermata.stazione,
        prima: prima,
        ultima: ultima,
        partenzaProg: partenzaProg,
        partenzaEff: partenzaEff
    };
}

VT.DettaglioStazione = function (stazione, descrStaz, tabIndex) {
    dettaglioStazione = this;
    this.tabIndex = tabIndex;
    this.stazione = stazione;
    this.regioneStazione = null;
    this.nomeStazioneCercata = descrStaz;

    app.renderTemplateAppend("#contenuto-" + tabIndex, "stazione", {});
    this.orarioApertura = moment().tz("Europe/Rome");
    this.orarioRicerca = moment().tz("Europe/Rome");

    this.linkPrecedente = $("#contenuto-" + this.tabIndex + " .link-precedente");
    this.linkSuccessivo = $("#contenuto-" + this.tabIndex + " .link-successivo");

    this.controllaDate();
    this.aggiorna();

    $(".legenda a").css('left', '140px');

    $("#contenuto-" + tabIndex + " select").live('change', function (event) {
        dettaglioStazione.stazione = $(this).val();
        dettaglioStazione.orarioApertura = moment().tz("Europe/Rome");
        dettaglioStazione.orarioRicerca = moment().tz("Europe/Rome");
        dettaglioStazione.controllaDate();
        dettaglioStazione.aggiorna();
    });

    this.linkPrecedente.click(function (event) {
        if ($(this).is('.abilitato')) {
            dettaglioStazione.orarioRicerca.subtract('hours', DELTA_ORE_RICERCA);
            dettaglioStazione.aggiorna();
            dettaglioStazione.controllaDate();
        }
        return false;
    });

    this.linkSuccessivo.click(function (event) {
        if ($(this).is('.abilitato')) {
            dettaglioStazione.orarioRicerca.add('hours', DELTA_ORE_RICERCA);
            dettaglioStazione.aggiorna();
            dettaglioStazione.controllaDate();
        }
        return false;
    });
};

VT.DettaglioStazione.prototype.controllaDate = function () {
    this.linkPrecedente.removeClass('abilitato');
    this.linkSuccessivo.removeClass('abilitato');

    fineGiornata = this.orarioRicerca.clone().endOf('day');
    futuro = this.orarioRicerca.clone().add('hours', DELTA_ORE_RICERCA);
    if (fineGiornata.diff(futuro) > 0) {
        this.linkSuccessivo.addClass('abilitato');
    }

    passato = this.orarioRicerca.clone().subtract('hours', DELTA_ORE_RICERCA);
    if (this.orarioApertura.diff(passato) <= 0) {
        this.linkPrecedente.addClass('abilitato');
    }
};

VT.DettaglioStazione.prototype.aggiorna = function () {
    var stazione = this.stazione;
    var tabIndex = this.tabIndex;
    var orario = this.orarioRicerca.toDate();
    var dettaglioStazione = this;

    app.mostraLoader();
    ViaggiaTrenoService.getStazioniCitta({
        stazione: stazione,
        "$callback": function (a, b, webLocalita) {
            var nomeStazione = null;
            if (webLocalita && webLocalita.length > 0) {
                for (var i = 0; i < webLocalita.length; i++) {
                    if (webLocalita[i].id == stazione) {
                        webLocalita[i].selected = true;
                        app.renderTemplate("#contenuto-" + tabIndex + " .selettore-stazione", "selettore-stazione", {
                            localita: webLocalita
                        });
                        nomeStazione = webLocalita[i].nomeLungo;
                    }
                }
            }
            codiceRegione = 0;
            app.mostraLoader();
            ViaggiaTrenoService.getRegioneStazione({
                codiceStazione: stazione,
                "$callback": function (a, b, codiceRegioneStazioneSelected) {
                    if (typeof codiceRegioneStazioneSelected == 'undefined' || codiceRegioneStazioneSelected === null || codiceRegioneStazioneSelected === '') {
                        if (typeof dettaglioStazione.regioneStazione !== 'undefined' && dettaglioStazione.regioneStazione !== null) {
                            codiceRegione = dettaglioStazione.regioneStazione;
                        }
                    } else {
                        codiceRegione = codiceRegioneStazioneSelected;
                        dettaglioStazione.codiceRegione = codiceRegione;
                    }

                    app.mostraLoader();
                    ViaggiaTrenoService.getDettaglioStazione({
                        codiceStazione: stazione,
                        codiceRegione: codiceRegione,
                        "$callback": function (a, b, webDettaglioStazione) {
                            var nome = $('#contenuto-' + tabIndex + " option:selected").text();
                            if (nomeStazione !== null) {
                                nome = nomeStazione;
                            }
                            if (nomeStazione === null && typeof webDettaglioStazione !== 'undefined' && webDettaglioStazione !== null && webDettaglioStazione !== '') {
                                if (webDettaglioStazione.localita && webDettaglioStazione.localita.nomeBreve) {
                                    nome = webDettaglioStazione.localita.nomeBreve;
                                }
                            }
                            if (nome === '' || nome === null) {
                                nome = dettaglioStazione.nomeStazioneCercata;
                            }
                            app.renderTemplate("#tab-" + tabIndex, "stazione-tab", {
                                nome: nome
                            });
                            //###################################### SiteCatalyst ################################
                            sc_send('Partenze arrivi', null, null, nome, null)
                            //####################################################################################
                            var $bottoneStazione = $('#contenuto-' + tabIndex + " .link-mappa-citta").unbind('click');
                            if (webDettaglioStazione && webDettaglioStazione.lat !== null && webDettaglioStazione.lon !== null) {
                                $bottoneStazione.addClass('abilitato').click(function (event) {
                                    app.apriMappaCitta(stazione, nome, codiceRegione);
                                    return false;
                                });
                            } else {
                                $bottoneStazione.removeClass('abilitato');
                            }
                            app.nascondiLoader();
                        }}
                    );

                    app.mostraLoader();
                    ViaggiaTrenoService.getPartenze({
                        codiceStazione: stazione,
                        orario: orario,
                        "$callback": function (a, b, webPartenze) {
                            if (webPartenze) {
                                console.log(webPartenze);
                                app.renderTemplate("#contenuto-" + tabIndex + " .contenitore-partenze", "partenze", {
                                    partenze: manageWebPartenze(webPartenze)
                                });
                            }
                            app.nascondiLoader();
                        }
                    });

                    app.mostraLoader();
                    ViaggiaTrenoService.getArrivi({
                        codiceStazione: stazione,
                        orario: orario,
                        "$callback": function (a, b, webArrivi) {
                            if (webArrivi) {
                                app.renderTemplate("#contenuto-" + tabIndex + " .contenitore-arrivi", "arrivi", {
                                    arrivi: manageWebArrivi(webArrivi)
                                });
                            }
                            app.nascondiLoader();
                        }
                    });
                    app.nascondiLoader();
                }
            });
            app.nascondiLoader();
        }
    });
};

VT.DettaglioTratta = function (tratta, tabIndex) {
    this.tabIndex = tabIndex;
    var filtriAV = [];
    for (var i = 0; i < app.map.filtroTreniCorrente.length; i++) {
        filtriAV.push(app.map.filtroTreniCorrente[i][1]);
    }
    if (filtriAV.length === 1 && filtriAV[0] === null) {
        filtriAV = null;
    }
    app.mostraLoader();
    ViaggiaTrenoService.getDettagliTratta({
        idRegione: tratta.idRegione,
        idTrattaAB: tratta.idTrattaAB,
        idTrattaBA: tratta.idTrattaBA,
        categoriaTreni: app.map.filtroTreniCorrente[0][0],
        catAV: filtriAV,
        "$callback": function (a, b, webDettagliTratta) {
            if (webDettagliTratta) {
                app.renderTemplateAppend("#tab-" + tabIndex, "tratta-tab", {
                    data: formatDate(new Date())
                });
                app.renderTemplateAppend("#contenuto-" + tabIndex, "tratta", {
                    tratte: $.map(webDettagliTratta, manageTratta)
                });

                $(".legenda a").css('left', '10px');

                //###################################### SiteCatalyst ################################
                sc_send('Dettaglio Tratta', null, webDettagliTratta[0].tratta, null, null);
                //####################################################################################
            }
        }
    });
    app.nascondiLoader();
};


//gestione link dentro InfoMob
VT.DettaglioTrattaInfoMob = function (tratta, tabIndex) {
    this.tabIndex = tabIndex;
    var filtriAV = [];
    for (var i = 0; i < app.map.filtroTreniCorrente.length; i++) {
        filtriAV.push(app.map.filtroTreniCorrente[i][1]);
    }
    if (filtriAV.length === 1 && filtriAV[0] === null) {
        filtriAV = null;
    }
    app.mostraLoader();
    ViaggiaTrenoService.getDettagliTratta({
        idRegione: tratta.idRegione,
        idTrattaAB: tratta.idTrattaAB,
        idTrattaBA: tratta.idTrattaBA,
        categoriaTreni: app.map.filtroTreniCorrente[0][0],
        catAV: filtriAV,
        "$callback": function (a, b, webDettagliTratta) {
            if (webDettagliTratta) {
                app.renderTemplateAppend("#tab-" + tabIndex, "tratta-tab", {
                    data: formatDate(new Date())
                });
                app.renderTemplateAppend("#contenuto-" + tabIndex, "tratta", {
                    tratte: $.map(webDettagliTratta, manageTratta)
                });

                $(".legenda a").css('left', '10px');

                //###################################### SiteCatalyst ################################
                sc_send('Dettaglio Tratta', null, webDettagliTratta[0].tratta, null, null);
                //####################################################################################
            }
        }
    });
    app.nascondiLoader();
};
//////////////////////////////////////////////////////////////////////



function getOrario(fermata) {
    var msOrario = null;
    if (fermata.actualFermataType !== 0) {
        msOrario = new Date().getTime();
    } else if (fermata.effettiva !== null && fermata.effettiva !== undefined) {
        msOrario = fermata.effettiva;
    } else if (fermata.partenzaTeorica !== null && fermata.partenzaTeorica !== undefined) {
        msOrario = fermata.partenzaTeorica;
    } else if (fermata.programmata !== null && fermata.programmata !== undefined) {
        msOrario = fermata.programmata;
    }
    return new Date(msOrario);
}

VT.DettaglioTreno = function (treno, origine, datapartenza, tabIndex, webAndamentoTreno) {
    this.treno = treno;
    this.origine = origine;
    this.datapartenza = datapartenza;

    this.tabIndex = tabIndex;
    dettaglioTreno = this;
    var dettaglioTreno = manageDettaglioTreno(webAndamentoTreno);
    app.renderTemplateAppend("#tab-" + tabIndex, "treno-tab", dettaglioTreno);
    app.renderTemplateAppend("#contenuto-" + tabIndex, "treno", dettaglioTreno);

    $(".legenda a").css('left', '175px');

    var contenuto = $('div.contenuto.treno:visible');
    contenuto.find('#st-input-numero-treno').val(treno);

    $('div.contenuto.treno:visible #st-input-giornoA').datepicker({
        minDate: '-7',
        maxDate: '0'
    });

    $('div.contenuto.treno:visible #st-input-numero-treno, ' +
            'div.contenuto.treno:visible #st-input-giornoA, ' +
            'div.contenuto.treno:visible .input-localita').on('keyup', function (event) {
        checkAbilitaCreaPdf('div.contenuto.treno:visible');
    });

    $('div.contenuto.treno:visible #st-input-giornoA, ' +
            'div.contenuto.treno:visible .input-localita').on('change', function (event) {
        checkAbilitaCreaPdf('div.contenuto.treno:visible');
    });


    $('div.contenuto.treno:visible .inputDate').datepicker({
        onSelect: function (dateText) {
            $('div.contenuto.treno:visible .inputDate').val(dateText);
        }
    });



    $('div.contenuto.treno:visible .inputDate').val(moment().tz("Europe/Rome").format('DD/MM/YYYY'));
    $('div.contenuto.treno:visible .inputDate').datepicker($.datepicker.regional[$.cookie('LANG')]);

    $(document).on("focus", ".input-localita", function (e) {
        if (!$(this).data("autocomplete")) { // If the autocomplete wasn't called yet:
            $(this).autocomplete({//   call it
                source: function (request, response) {
                    var el = $(this.element);
                    var suggerimentiFilter = [];
                    var suggerimenti = [];
                    var risp = [];
                    var baseUrl = "./resteasy/viaggiatreno/autocompletaStazione/";
                    var testo = "";
                    if (request.term.click) {
                        testo = request.term.value;
                    } else {
                        testo = request.term;
                    }

                    if ((testo.length < 2) || (request.term.click && testo.length == 0)) {
                        if (lastSearchedItemsOrigine.length > 0)
                        {

                            if (el[0].id == 'localita-partenza') {
                                risp = lastSearchedItemsOrigine;
                            } else {
                                risp = lastSearchedItemsDestinazione;
                            }
                            var risposte = risp.unique();
                            for (var i = risposte.length - 1; i >= 0; i--) {
                                risposta = risposte[i].split(/\|/);
                                suggerimenti.push(risposta[0]);
                                risp[risposta[0]] = risposta[1];
                            }
                        }
                        el.data('dati', risp);
                        suggerimentiFilter = suggerimenti.filter(testo);
                        response(suggerimentiFilter);
                    } else if (testo.length > 1) {
                        $.ajax({
                            url: baseUrl + testo, //request.term,
                            type: 'GET',
                            dataType: 'html',
                            success: function (data, textStatus, xhr) {
                                var risposte = data.split("\n");
                                var suggerimenti = new Array(risposte.length - 1);
                                var dati = {};
                                for (var i = 0; i < risposte.length - 1; i++) {
                                    risposta = risposte[i].split(/\|/);
                                    suggerimenti[i] = risposta[0];
                                    dati[risposta[0]] = risposta[1];
                                }
                                el.data('dati', dati);
                                response(suggerimenti);
                            },
                            error: function (xhr, textStatus, errorThrown) {
                                response([]);
                            }
                        });
                    }
                },
                select: function (event, ui) {
                    var lengthArrivo = 0;
                    var lengthPartenza = 0;
                    if (event.target.id == "localita-arrivo") {
                        lengthArrivo = ui.item.value.length;
                        lengthPartenza = $("#localita-partenza").val().length;
                    } else {
                        lengthPartenza = ui.item.value.length;
                        lengthArrivo = $("#localita-arrivo").val().length;
                    }
                    if (lengthPartenza > 0 && lengthArrivo > 0) {
                        $('#form-impostaviaggio input[type=submit]').removeAttr('disabled');
                    } else {
                        $('#form-impostaviaggio input[type=submit]').attr('disabled', 'disabled');
                    }
                },
                position: {
                    my: "left bottom",
                    at: "left top"
                }
            });
        }
    });

    this.linkPrecedente = $("#contenuto-" + this.tabIndex + " .link-precedente");
    this.linkSuccessivo = $("#contenuto-" + this.tabIndex + " .link-successivo");

    this.refresh = $("#contenuto-" + this.tabIndex + " .refresh");

    this.refresh.click(function (event) {

        ViaggiaTrenoService.getAndamentoTreno({
            codOrigine: origine,
            numeroTreno: treno,
            dataPartenza: datapartenza,
            "$callback": function (a, b, webAndamentoTreno) {
                dettaglioTreno.aggiorna(webAndamentoTreno);
            }.bind(this)
        });
        return false;
    });

    this.linkPrecedente.click(function (event) {
        if ($(this).is('.abilitato')) {
            dettaglioTreno.orarioRicerca.subtract('hours', DELTA_ORE_RICERCA);
            dettaglioTreno.aggiornaCorrispondenze(); // aggiorno sulo il tab partenze delle corrispondenze
            dettaglioTreno.controllaDate();
        }
        return false;
    });

    this.linkSuccessivo.click(function (event) {
        if ($(this).is('.abilitato')) {
            dettaglioTreno.orarioRicerca.add('hours', DELTA_ORE_RICERCA);
            dettaglioTreno.aggiornaCorrispondenze(); // aggiorno sulo il tab partenze delle corrispondenze
            dettaglioTreno.controllaDate();
        }
        return false;
    });

    dettaglioTreno = this;
    this.aggiorna(webAndamentoTreno);
};

VT.DettaglioTreno.prototype.controllaDate = function () {
    this.linkPrecedente.removeClass('abilitato');
    this.linkSuccessivo.removeClass('abilitato');

    fineGiornata = this.orarioRicerca.clone().endOf('day');
    futuro = this.orarioRicerca.clone().add('hours', DELTA_ORE_RICERCA);
    if (fineGiornata.diff(futuro) > 0) {
        this.linkSuccessivo.addClass('abilitato');
    }

    passato = this.orarioRicerca.clone().subtract('hours', DELTA_ORE_RICERCA);
    if (this.orarioApertura.diff(passato) <= 0) {
        this.linkPrecedente.addClass('abilitato');
    }
};

VT.DettaglioTreno.prototype.aggiornaFermata = function (stazione, orario, ritardo) {
    app.renderTemplate("#contenuto-" + this.tabIndex + " .contenitore-info-fermata", "info-fermata", manageInfoFermata(stazione, ritardo));
    this.stazione = stazione;
    this.orarioApertura = moment(orario).tz("Europe/Rome");
    this.orarioRicerca = this.orarioApertura.clone();
    this.controllaDate();
    this.aggiornaCorrispondenze();
    var tabIndex = this.tabIndex;
    app.mostraLoader();
    $('#contenuto-' + tabIndex + " .link-mappa-citta").removeClass('abilitato').unbind('click');

    if (stazione !== undefined)
    {
        //Imposto la stazione corrente nella maschera stampa il tuo treno
        var contenuto = $('div.contenuto.treno:visible');
        $partenza = contenuto.find('#st-input-localita-arrivo');
        $partenza.val(this.stazione.stazione);
        var dati = {};
        dati[this.stazione.stazione] = this.stazione.id;
        $partenza.data('dati', dati);
    }

    ViaggiaTrenoService.getRegioneStazione({
        codiceStazione: stazione.id,
        "$callback": function (a, b, codiceRegione) {
            if (codiceRegione) {
                $('#contenuto-' + tabIndex + " .link-mappa-citta").addClass('abilitato').bind('click', function (event) {
                    app.apriMappaCitta(stazione.id, stazione.stazione, codiceRegione);
                    return false;
                });
            }
            app.nascondiLoader();
        }
    });
};

VT.DettaglioTreno.prototype.aggiornaCorrispondenze = function () {
    var stazione = this.stazione;
    var tabIndex = this.tabIndex;
    var orario = this.orarioRicerca.toDate();

    app.mostraLoader();
    ViaggiaTrenoService.getPartenze({
        codiceStazione: stazione.id,
        orario: orario,
        "$callback": function (a, b, corrispondenze) {
            if (corrispondenze) {
                app.renderTemplate("#contenuto-" + tabIndex + " .contenitore-corrispondenze", "corrispondenze", {
                    partenze: manageWebPartenze(corrispondenze)
                });
            }
            // TODO: Cos'ÃƒÂ¨?
            // checkButton('andamentoTreno_tabellaCorrispondenze');
            app.nascondiLoader();
        }.bind(this)
    });
};

VT.DettaglioTreno.prototype.aggiorna = function (webAndamentoTreno) {
    var stazione = this.stazione;
    var tabIndex = this.tabIndex;

    var dettaglioTreno = manageDettaglioTreno(webAndamentoTreno);
    app.renderTemplate("#contenuto-" + this.tabIndex + " .contenitore-box-treno", "box-treno", dettaglioTreno);
    app.renderTemplate("#contenuto-" + this.tabIndex + " .contenitore-box-stazione-arrivo", "box-stazione-arrivo", dettaglioTreno);

    /*INIZIO: GESTIONE POPUP ALERT RITARDO*/
    $("#popupAlertRitardoTemplate").empty();
    app.renderTemplateAppend("#popupAlertRitardoTemplate", "popup-alert-ritardo", {});

    $('#alertRitardo').click(function (event) {
        $('#bottone-imposta.on').trigger('click');
        $('#bottone-cerca.on').trigger('click');
        $('#bottone-news.on').trigger('click');
        $('#bottone-modprog.on').trigger('click');
        $('#bottone-stampatreno.on').trigger('click');
        $('#note-legali').fadeOut();
        $('#contatti').fadeOut();
        $('#come-funziona').fadeOut();

        $('#popupAlertRitardo').fadeIn();

        event.preventDefault();
        return false;
    });

    /*FINE: GESTIONE POPUP ALERT RITARDO*/

    ViaggiaTrenoService.getTratteCanvas({
        codOrigine: this.origine,
        numeroTreno: this.treno,
        dataPartenza: this.datapartenza,
        "$callback": function (a, b, webTratteCanvas) {
            if (webTratteCanvas) {
                var useViewBox = true;
                var useTouchEvents = true;
                if ($.browser.msie && $.browser.version == '8.0') {
                    useViewBox = false;
                }
                if ($.browser.msie) {
                    useTouchEvents = false;
                }
                dettaglioTreno = this;
                canvas = new VTCanvas(
                        $('#contenuto-' + tabIndex + " .canvas-sinistra")[0],
                        $('#contenuto-' + tabIndex + " .canvas-percorso")[0],
                        $('#contenuto-' + tabIndex + " .canvas-destra")[0],
                        useViewBox,
                        useTouchEvents,
                        function (stazione) {
                            for (var i = 0; i < webAndamentoTreno.fermate.length; i++) {
                                if (webAndamentoTreno.fermate[i].id == stazione.trattaCanvas.id) {
                                    orarioAndamento = getOrario(webAndamentoTreno.fermate[i]);
                                }
                            }
                            dettaglioTreno.aggiornaFermata(stazione.trattaCanvas, orarioAndamento, webAndamentoTreno.ritardo);
                        }
                );
                if (supportsOrientation) {
                    $(window).on('orientationchange.tab' + tabIndex, canvas.updateOrientation);
                }

                canvas.drawStations(webTratteCanvas);
                canvas.selectActualStation();
            }
            app.nascondiLoader();
        }.bind(this)
    });
};

VT.MappaCitta = function (stazione, nomeStazione, regione, tabIndex) {
    this.tabIndex = tabIndex;
    app.mostraLoader();
    ViaggiaTrenoService.getDettaglioStazione({
        codiceStazione: stazione,
        codiceRegione: regione,
        "$callback": function (a, b, webDettaglioStazione) {
            app.renderTemplateAppend("#tab-" + tabIndex, "mappa-tab", {
                nome: nomeStazione
            });
            app.renderTemplateAppend("#contenuto-" + tabIndex, "mappa", {});
            centro = new ubiest.maps.LatLng(webDettaglioStazione.latMappaCitta > 0 ? webDettaglioStazione.latMappaCitta : webDettaglioStazione.lat, webDettaglioStazione.lonMappaCitta > 0 ? webDettaglioStazione.lonMappaCitta : webDettaglioStazione.lon);

            var opzioniMappa = {
                zoom: 16,
                minZoom: 10,
                maxZoom: 18,
                center: centro,
                mapTypeControl: false,
                panControl: false,
                zoomControl: true,
                mapTypeId: ubiest.maps.MapTypeId.ROADMAP,
                zoomControlOptions: {
                    style: ubiest.maps.ZoomControlStyle.SMALL,
                    position: ubiest.maps.ControlPosition.LEFT_BOTTOM
                }
            };

            var mappaCitta = new ubiest.maps.Map($("#contenuto-" + tabIndex + " .mappa-citta")[0], opzioniMappa);

            var pinPoint = null;
            urlPinPoint = null;
            urlMappaCitta = null;
            if (webDettaglioStazione.mappaCitta) {
                urlPinPoint = webDettaglioStazione.mappaCitta.urlImagePinpoint;
                urlMappaCitta = webDettaglioStazione.mappaCitta.urlImageBaloon;
            }
            if (urlPinPoint !== null && typeof urlPinPoint != 'undefined' && urlPinPoint !== '') {
                pinPoint = new ubiest.maps.MarkerImage(urlPinPoint);
            }

            var marker = new ubiest.maps.Marker({
                position: centro,
                map: mappaCitta,
                icon: pinPoint
            });

            template = app.getTemplate('fumetto');
            var contentContext = {
                codiceStazione: stazione,
                nomeStazione: nomeStazione,
                urlMappaCitta: urlMappaCitta
            };
            var opzioniFumetto = {
                content: app.getRenderedTemplate('fumetto', contentContext),
                infoBoxClearance: new ubiest.maps.Size(40, 100),
                pixelOffset: new ubiest.maps.Size(-72, -240),
                closeBoxMargin: "4px 125px 2px 2px",
                closeBoxPadding: "5px",
                pane: "floatPane",
                pixelMarkerOffsetY_: 25, // offset created by the label
                boxStyle: {
                    width: "366px",
                    height: "228px"
                }
            };
            var infowindow = new InfoBox(opzioniFumetto);
            //infoWindow deve essere avviato aperto
            infowindow.open(mappaCitta, marker);
            /* Se clicco sul marker visualizza la infowindow */
            ubiest.maps.event.addListener(marker, 'click', function () {
                infowindow.open(mappaCitta, marker);
            });

            $(infowindow.div_).find('.pulsante-partenze').live('click', function (event) {
                var codiceStazione = $(this).data('stazione');
                app.apriDettaglioStazione(codiceStazione);
                return false;
            });
            app.nascondiLoader();
        }
    });
};

VT.ProgrammaOrario = function (data, fascia, nomeOrigine, origine, nomeDestinazione, destinazione, tabIndex) {
    this.tabIndex = tabIndex;
    this.data = data;
    this.fascia = fascia;
    this.nomeOrigine = nomeOrigine;
    this.origine = origine;
    this.nomeDestinazione = nomeDestinazione;
    this.destinazione = destinazione;
    this.ultimaDataCercata = null;
    programmaOrario = this;

    app.renderTemplateAppend("#tab-" + this.tabIndex, "programma-tab", {
        origine: nomeOrigine,
        destinazione: nomeDestinazione
    });

    if ($("#tab-" + tabIndex + " h1").text().length > LIMITE_SCROLL_TAB) {
        $('#tab-' + tabIndex + " h1").marqueeLoop({speed: 10000});
    }

    $(document).on('click', '#contenuto-' + this.tabIndex + " .link-precedente", function (event) {
        programmaOrario.fascia--;
        if (programmaOrario.fascia == -1) {
            programmaOrario.fascia = 6;
            programmaOrario.data.subtract('days', 1);
        }
        programmaOrario.aggiorna();

        return false;
    });

    $(document).on('click', '#contenuto-' + this.tabIndex + " .link-successivo", function (event) {
        programmaOrario.fascia++;
        if (programmaOrario.fascia == 7) {
            programmaOrario.fascia = 0;
            programmaOrario.data.add('days', 1);
        }
        programmaOrario.aggiorna();

        return false;
    });

    this.aggiorna();
};

function manageProgrammaOrario(soluzioni, shouldOpenTrainDetail) {
    if (soluzioni === null) {
        return null;
    }
    return $.map(soluzioni, function (soluzione, index) {
        var numeroCambi = soluzione.vehicles.length - 1;

        var primoTreno = soluzione.vehicles[0];
        var ultimoTreno = soluzione.vehicles[numeroCambi];

        soluzione.vehicles[numeroCambi].ultimo = true;

        var categoriaSenzaAndamenti = false;
        for (var i = 0; i < soluzione.vehicles.length; i++) {
            //Imposto una proprietÃƒÂ  che mi dice se ÃƒÂ¨ possibile visualizzare il dettaglioTreno
            soluzione.vehicles[i]["dettaglioTreno"] = shouldOpenTrainDetail;

            //Controllo se la soluzione contiene una categoria che non puÃƒÂ² avere andamenti "AUTOBUS (193), SFM (195), TRAGHETTO (999), URBANO (83)"
            if (shouldOpenTrainDetail && (soluzione.vehicles[i].categoria === '193' || soluzione.vehicles[i].categoria === '195' || soluzione.vehicles[i].categoria === '999' || soluzione.vehicles[i].categoria === '83'))
            {
                categoriaSenzaAndamenti = true;
                soluzione.vehicles[i]["dettaglioTreno"] = false;
            }
        }

        orarioPartenza = moment(primoTreno.orarioPartenza).tz("Europe/Rome");
        orarioArrivo = moment(ultimoTreno.orarioArrivo).tz("Europe/Rome");
        return {
            alternanza: index % 2 ? "pari" : "",
            destinazione: ultimoTreno.destinazione,
            durata: soluzione.durata,
            orarioPartenzaMoment: orarioPartenza,
            orarioArrivo: orarioArrivo.format("HH:mm"),
            orarioPartenza: orarioPartenza.format("HH:mm"),
            origine: primoTreno.origine,
            cambi: soluzione.vehicles
        };
    });
}

VT.ProgrammaOrario.prototype.aggiorna = function () {
    var tabIndex = this.tabIndex;
    var origine = this.origine;
    var destinazione = this.destinazione;
    var codLocOrig = parseInt(origine.replace(/^(S?)[0]*/, ""), 10);
    var codLocDest = parseInt(destinazione.replace(/^(S?)[0]*/, ""), 10);

    if (this.ultimaDataCercata === null || !this.data.isSame(this.ultimaDataCercata, 'day')) {
        app.mostraLoader();
        var that = this;

        var url = "./resteasy/viaggiatreno/soluzioniViaggioNew/" + codLocOrig + "/" + codLocDest + "/" + that.data.format("YYYY-MM-DDTHH:mm:ss").toString();

        $.ajax({
            type: 'GET',
            dataType: "json",
            url: url,
            timeout: 10000, // 10 secondi
            success: function webSoluzioniViaggioNew_callback(webSoluzioniViaggioNewResponse) {
                if (webSoluzioniViaggioNewResponse)
                {
                    that.ultimaDataCercata = that.data.clone();
                    that.webSoluzioniViaggioNew = webSoluzioniViaggioNewResponse;
                    that.servizioDisponibile = (webSoluzioniViaggioNewResponse.errore == null || webSoluzioniViaggioNewResponse.errore == "");
                    that.render();
                    app.nascondiLoader();
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                that.ultimaDataCercata = that.data;
                that.webSoluzioniViaggioNew = {"soluzioni": [], "origine": null, "destinazione": null};
                that.servizioDisponibile = false;
                that.render();
                app.nascondiLoader();
            }
        });

    } else {
        this.render();
    }
};

VT.ProgrammaOrario.prototype.render = function () {
    var shouldOpenTrainDetail = this.data.isSame(moment(), 'day');
    var dataDa = this.data.clone();
    var dataA = dataDa.clone();
    var fascia = this.fascia;
    switch (this.fascia) {
        case 0:
            dataDa.startOf('day');
            dataA.hours(6);
            break;
        case 1:
            dataDa.hours(6);
            dataA.hours(9);
            break;
        case 2:
            dataDa.hours(9);
            dataA.hours(12);
            break;
        case 3:
            dataDa.hours(12);
            dataA.hours(15);
            break;
        case 4:
            dataDa.hours(15);
            dataA.hours(18);
            break;
        case 5:
            dataDa.hours(18);
            dataA.hours(21);
            break;
        case 6:
            dataDa.hours(21);
            dataA.endOf('day');
            break;
    }

    var tutteSoluzioni = manageProgrammaOrario(this.webSoluzioniViaggioNew.soluzioni, shouldOpenTrainDetail);
    var soluzioniFiltrate = $.grep(tutteSoluzioni, function (e, i) {
        var ret = false;
        var dataACopied = dataA.clone(); // le copio perche altrimenti mi cambia la Label del range
        var dataDaCopied = dataDa.clone();  // le copio perche altrimenti mi cambia la Label del range

        if (dataACopied.hour() === 6) {
            dataACopied.add(-1, 'minutes'); // Prima delle 06 am (00:00 alle 05:59)
        }
        if (dataDaCopied.hour() === 21) {
            dataDaCopied.add(1, 'minutes'); // dopo le 23 pm (21:01 23:59)
        }
        if ((e.orarioPartenzaMoment.isAfter(dataDaCopied) || e.orarioPartenzaMoment.isSame(dataDaCopied)) && (e.orarioPartenzaMoment.isBefore(dataACopied) || e.orarioPartenzaMoment.isSame(dataACopied))) {
            ret = true;
        }
        return ret;
    });
    app.renderTemplate("#contenuto-" + this.tabIndex, "programma", {
        dataA: dataA,
        dataDa: dataDa,
        destinazione: $("#localita-arrivo").val(),
        origine: $("#localita-partenza").val(),
        primaFascia: (fascia === 0),
        ultimaFascia: (fascia == 6),
        soluzioni: soluzioniFiltrate,
        servizioDisponibile: this.servizioDisponibile
    });
    //################################# SiteCatalyst ########################################
    sc_send('Soluzioni Viaggio', null, null, null, $("#localita-partenza").val() + ";" + $("#localita-arrivo").val() + ";" + $('#fascia-oraria :selected').text() + ";" + $('#input-giorno').val());
    //#######################################################################################
    $("#contenuto-" + this.tabIndex + " tr.attivo").click(function (event) {
        app.apriDettaglioSoluzione(soluzioniFiltrate[$(this).index()], shouldOpenTrainDetail);
    });
};

VT.DettaglioSoluzione = function (soluzione, shouldOpenTrainDetail, tabIndex) {
    //######################################## SiteCatalyst ##########################
    sc_send('Dettaglio Soluzioni Viaggio', null, null, null, null);
    //################################################################################
    this.tabIndex = tabIndex;

    var categoriaSenzaAndamenti = false;
    for (var i = 0; i < soluzione.cambi.length; i++) {
        soluzione.cambi[i].alternanza = i % 2 ? "pari" : "";
        soluzione.cambi[i].arrivo = moment(soluzione.cambi[i].orarioArrivo).tz("Europe/Rome").format("HH:mm");

        //Imposto una proprietÃƒÂ  che mi dice se la riga non deve essere cliccabile
        soluzione.cambi[i]["rigaCliccabile"] = shouldOpenTrainDetail;

        //Controllo se la soluzione contiene una categoria che non puÃƒÂ² avere andamenti "AUTOBUS (193), SFM (195), TRAGHETTO (999), URBANO (83)"
        if (shouldOpenTrainDetail && (soluzione.cambi[i].categoria == '193' || soluzione.cambi[i].categoria == '195' || soluzione.cambi[i].categoria == '999' || soluzione.cambi[i].categoria == '83'))
        {
            categoriaSenzaAndamenti = true;
            soluzione.cambi[i]["rigaCliccabile"] = false;
        }
    }
    app.renderTemplate("#tab-" + tabIndex, "dettaglio-soluzione-tab", {
        origine: soluzione.origine,
        destinazione: soluzione.destinazione
    });

    if ($("#tab-" + tabIndex + " h1").text().length > LIMITE_SCROLL_TAB) {
        $('#tab-' + tabIndex + " h1").marqueeLoop({speed: 10000});
    }

    app.renderTemplate("#contenuto-" + tabIndex, "dettaglio-soluzione", {
        cambi: soluzione.cambi,
        shouldOpenTrainDetail: shouldOpenTrainDetail,
        categoriaSenzaAndamenti: categoriaSenzaAndamenti
    });

    $('#contenuto-' + tabIndex + " .attivo tr, tr.cliccabile.attivo").click(function (event) {
        var numeroTreno = $(this).data('treno');
        $.ajax({
            url: "./resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/" + numeroTreno,
            type: 'get',
            dataType: 'html',
            success: function (data, textStatus, xhr) {
                if (data != null && data.trim() != "")
                {
                    var origine = data.split("\n")[0].split("|")[1].split("-")[1];
                    var datapartenza = data.split("\n")[0].split("|")[1].split("-")[2];
                    app.apriDettaglioTreno(numeroTreno, origine, datapartenza);
                }
            }
        });
        return false;
    });
};

VT.App.prototype.apriDettaglioStazione = function (stazione, descrStaz) {
    var tabIndex = this.apriTab('stazione');
    if (tabIndex != -1) {
        var dettaglio = new VT.DettaglioStazione(stazione, descrStaz, tabIndex);
        this.tabs.push(dettaglio);
    }
};

VT.App.prototype.apriDettaglioTratta = function (tratta) {
    var tabIndex = this.apriTab('tratta');
    if (tabIndex != -1) {
        var dettaglio = new VT.DettaglioTratta(tratta, tabIndex);
        this.tabs.push(dettaglio);
    }
};

//gestito link dentro infomobilita'
VT.App.prototype.apriDettaglioTrattaInfoMob = function (tratta) {
    var tabIndex = this.apriTab('tratta');
    if (tabIndex != -1) {
        var dettaglio = new VT.DettaglioTrattaInfoMob(tratta, tabIndex);
        this.tabs.push(dettaglio);
    }
};
//////////////////////////////////////////

VT.App.prototype.apriDettaglioTreno = function (treno, origine, datapartenza) {

    //############################ SiteCatalyst ##########################
    sc_send('Scheda Treno', treno.toString(), null, null, null);
    //####################################################################
    app.mostraLoader();
    ViaggiaTrenoService.getAndamentoTreno({
        codOrigine: origine,
        numeroTreno: treno,
        dataPartenza: datapartenza,
        "$callback": function (a, b, webAndamentoTreno) {
            if (webAndamentoTreno.provvedimento !== 1) {
                var tabIndex = this.apriTab('treno');
                if (tabIndex != -1) {
                    var dettaglio = new VT.DettaglioTreno(treno, origine, datapartenza, tabIndex, webAndamentoTreno);
                    this.tabs.push(dettaglio);
                }
                app.nascondiLoader();
            } else {
                alert(labels.treno_cancellato);
                app.nascondiLoader();
            }
        }.bind(this)
    });
};

VT.App.prototype.apriMappaCitta = function (stazione, nomeStazione, regione) {
    var tabIndex = this.apriTab('mappa');
    if (tabIndex != -1) {
        var dettaglio = new VT.MappaCitta(stazione, nomeStazione, regione, tabIndex);
        this.tabs.push(dettaglio);
    }
};

VT.App.prototype.apriProgrammaOrario = function (data, fascia, nomeOrigine, origine, nomeDestinazione, destinazione) {
    var tabIndex = this.apriTab('programma-orario');
    if (tabIndex != -1) {
        var dettaglio = new VT.ProgrammaOrario(data, fascia, nomeOrigine, origine, nomeDestinazione, destinazione, tabIndex);
        this.tabs.push(dettaglio);
    }
};

VT.App.prototype.apriDettaglioSoluzione = function (soluzione, shouldOpenTrainDetail) {
    var tabIndex = this.apriTab('dettaglio-soluzione');
    if (tabIndex != -1) {
        var dettaglio = new VT.DettaglioSoluzione(soluzione, shouldOpenTrainDetail, tabIndex);
        this.tabs.push(dettaglio);
    }
};

function apriDettaglioSoluzione(numeroTreno) {
    var codiceOrigine = "";
    var datapartenza = "";
    var targetUrl = "./resteasy/viaggiatreno/cercaNumeroTreno/" + numeroTreno;
    $.ajax({
        'url': targetUrl,
        'type': 'GET',
        'dataType': 'json',
        'async': false,
        'success': function (data) {
            codiceOrigine = data.codLocOrig;
            datapartenza = data.dataPartenza;
            app.apriDettaglioTreno(numeroTreno, codiceOrigine, datapartenza);
        },
        'error': function () {
            alert("error");
        }
    });
    return codiceOrigine;
}

//nuova gestione link dentro infomob
function getSchedaTreno(numTreno, codOrigine) {
    apriDettaglioSoluzioneInfoMob(numTreno, codOrigine);
    $('#info-mobilita').fadeOut();
}

function apriDettaglioSoluzioneInfoMob(numeroTreno, codOrigine) {
    var codiceOrigine = codOrigine;
    var datapartenza = new Date();
    var targetUrl = "./resteasy/viaggiatreno/cercaNumeroTreno/" + numeroTreno;
    $.ajax({
        'url': targetUrl,
        'type': 'GET',
        'dataType': 'json',
        'async': false,
        'success': function (data) {
            codiceOrigine = codiceOrigine;
            datapartenza = datapartenza.getTime();
            app.apriDettaglioTreno(numeroTreno, codiceOrigine, datapartenza);
        },
        'error': function () {
            alert("error");
        }
    });
    return codiceOrigine;
}

//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~
//###~#~#~#~#~#~#~#~#~#~#~~#~#~#~#~#~~#~#~#~#~#~#~#~#~#~#~#~#~

//////////////////////////////////////////////////////////////

function getBaseURL() {
    return location.protocol + "//" + location.host + location.pathname.substring(0, location.pathname.indexOf('/', 1) + 1);
}

function checkAbilitaCreaPdf(contenitore)
{
    /*  ABILITARE TUTTO SE SI VUOLE INSERIRE IL CONTROLLO SUL PULSANTE
     
     var contenuto = $(contenitore);
     
     var numTreno = contenuto.find('#st-input-numero-treno').val();
     $partenza = contenuto.find('#st-input-localita-arrivo');
     var partVal = $partenza.val();
     var partDati = $partenza.data('dati');
     var partCod = "";
     if(partDati !== undefined)
     {
     partCod = partDati[partVal];
     }
     
     var dataVal = contenuto.find('#st-input-giorno').val();
     var data = moment(dataVal, "DD/MM/YYYY").tz("Europe/Rome");
     var dataString = data.format('DD/MM/YYYY');
     
     if(!isNaN(numTreno) && partCod !== undefined && dataVal.length === 10 &&
     numTreno !== "" && partCod !== "" && data.isValid()) {
     contenuto.find('input.bottone').prop('disabled', false);
     } else {
     contenuto.find('input.bottone').prop('disabled', true);
     }
     */
    return false;

}

function stampaPdf(contenitore)
{
    //Recupero il contenuto della scheda selezionata
    var contenuto = $(contenitore);

    var numTreno = contenuto.find('#st-input-numero-treno').val();
    $partenza = contenuto.find('#st-input-localita-arrivo');
    var partVal = $partenza.val();
    var partDati = $partenza.data('dati');
    var partCod = "";
    if (partDati !== undefined)
    {
        partCod = partDati[partVal];
    }

    var dataVal = contenuto.find('.inputDate').val();
    var data = moment(dataVal, "DD/MM/YYYY").tz("Europe/Rome");
    var dataString = data.format('DD/MM/YYYY');

    if (numTreno != "" && partCod != "" && dataString != "" && dataString != "Invalid date") {
        recuperaDatiStampaArrivo(numTreno, partCod, partVal, dataString);
    } else {
        alert("Inserire tutti i campi richiesti");
    }
    return false;
}
function recuperaDatiStampaArrivo(numeroTreno, stazione, stazioneDesc, data) {
    var dpartenza = data.replace(/\//g, "-");
    var targetUrl = getBaseURL() + "StampaTreno";
    var comunicazione;
    var creaPdf;
    var provvedimenti;

    $.ajax({
        'url': targetUrl,
        'type': 'POST',
        'dataType': 'json',
        'async': true,
        'cache': false,
        'data': {
            numTreno: numeroTreno,
            locArrivo: stazione,
            locArrivoDesc: stazioneDesc,
            date: dpartenza
        },
        'success': function (data) {
            comunicazione = data.comunicazione;
            creaPdf = data.pdf;
            //Per ora lasciamo vuoto lo spazio per le note dei provvedimenti
            provvedimenti = "";//data.provvedimenti;

            if (creaPdf) {
                var url = getBaseURL() + "certificato/certificato.jsp" + "?comunicazione=" + escape(comunicazione) + "&provvedimenti=" + escape(provvedimenti);
                if (isSafari()) {
                    window.location.href = url;
                } else {
                    window.open(url);
                }
            } else {
                //Gestisco messaggio da far visualizzare
                alert(comunicazione);
            }
        },
        'error': function () {
            alert("error");
        }
    });

    return false;
}

function isSafari() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
        return true;
    }
    return false;
}

function caricaRSS(isInfolavori) {

    $.ajax({
        url: "./resteasy/viaggiatreno/infomobilitaRSS/" + isInfolavori,
        type: 'get',
        dataType: 'html',
        success: function (data, textStatus, xhr) {
            if (isInfolavori) {
                $('#rssInfolavori').html(data);
            } else {
                $('#rssInfomobilita').html(data);
            }
        }
    });
}

function caricaRSSTab(isInfolavori) {

    $.ajax({
        url: "./resteasy/viaggiatreno/infomobilitaRSSBox/" + isInfolavori,
        type: 'get',
        dataType: 'html',
        success: function (data, textStatus, xhr) {
            data = "<div id='boxInfoMob'>" + data + "</div>";
            if (isInfolavori) {
                $('#rssInfolavoriTab').html(data);
            } else {
                $('#rssInfomobilitaTab').html(data);
            }
        }
    });
}

function caricaTicker() {

    $.ajax({
        url: "./resteasy/viaggiatreno/infomobilitaTicker/",
        type: 'get',
        dataType: 'html',
        success: function (data, textStatus, xhr) {

            data = "<marquee scrollamount='3' onmouseover='this.stop();' onmouseout='this.start();'>" + data + "</marquee>";
            $('#ticker').html(data);
        }
    });
}

function infoCollapse(id) {
    var a = $("#" + id);
    a.next("div.boxAcc").slideToggle(400).promise().done(function () {
        if ($("div.boxAcc").is(":visible")) {
            a.parent().addClass("current");
            a.css('background-image', 'url("/vt_static/img/arUp-accord.png")');
        } else {
            a.parent().removeClass("current");
            a.css('background-image', 'url("/vt_static/img/arDown-accord.png")');
        }
    });
}

function infoBox(id) {

    $('#bottone-cerca.on').trigger('click');
    $('#bottone-imposta.on').trigger('click');
    $('#bottone-modprog.on').trigger('click');
    $('#bottone-stampatreno.on').trigger('click');
    $(this).toggleClass('on');
    $('#cartina-regioni').fadeOut();
    if (id=='headingNewsAccordion'){
        $('#info-mobilita').fadeIn();
        $('#mod-prog').fadeOut();
        // $('.pagina-secondaria').fadeOut();
        caricaRSS(false);
    } else {
        $('#mod-prog').fadeIn();
        $('#info-mobilita').fadeOut();
        // $('.pagina-secondaria').fadeOut();
        caricaRSS(true);
    }
    event.preventDefault();

}

$('html').show();

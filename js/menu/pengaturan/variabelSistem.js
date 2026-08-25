var baseURLPath         =   baseURL + "pengaturan/variabelSistem/",
    containerContent    =   $('#pengaturanVariabelSistem-content');

if (pengaturanVariabelSistemFunc == null) {
    var pengaturanVariabelSistemFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '.pengaturanVariabelSistem-tabContent',
                ['pengaturanVariabelSistem-header', 'pengaturanVariabelSistem-hr', 'pengaturanVariabelSistem-tabPills']
            );

            $('#pengaturanVariabelSistem-tabPills').find('a[data-bs-toggle="pill"]')
            .off('click').on('click', function (e) {
                var targetTab   =   $(e.target).attr('href');

                switch (targetTab) {
                    case '#pills-pengaturan-sistem':
                        getDataPengaturanSistem();
                        break;
                    case '#pills-barang-sistem-utama':
                        getDataVariabelSistemBarangSistemUtama();
                        break;
                    case '#pills-wilayah-ongkir':
                        getDataVariabelSistemWilayahOngkir();
                        break;
                }
            });

            $('#pengaturanSistem-searchKeyword').off('keypress');
            $("#pengaturanSistem-searchKeyword").on('keypress', function (e) {
                if (e.which == 13) {
                    getDataPengaturanSistem();
                }
            });

            $('#btnSyncDataBarangSistemUtama').on('click', function() {
                syncDataBarangSistemUtama();
            });

            $('#dataBarangSistemUtama-searchKeyword').off('keypress');
            $("#dataBarangSistemUtama-searchKeyword").on('keypress', function (e) {
                if (e.which == 13) {
                    getDataVariabelSistemBarangSistemUtama();
                }
            });

            $('#btnSyncDataWilayahOngkir').on('click', function() {
                syncDataWilayahOngkir();
            });

            $('#dataWilayahOngkir-searchKeywordProvinsi, #dataWilayahOngkir-searchKeywordKotaKabupaten, #dataWilayahOngkir-searchKeyword').off('keypress');
            $("#dataWilayahOngkir-searchKeywordProvinsi, #dataWilayahOngkir-searchKeywordKotaKabupaten, #dataWilayahOngkir-searchKeyword").on('keypress', function (e) {
                if (e.which == 13) {
                    getDataVariabelSistemWilayahOngkir();
                }
            });

            getDataPengaturanSistem();
        });
    }
}

function getDataPengaturanSistem() {
    let dataTableContent=   $('#pills-pengaturan-sistem').find('table tbody'),
        searchKeyword   =   $('#pengaturanSistem-searchKeyword').val(),
        dataSend        =   {
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getRowPengaturanSistem",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            setElemDisabledProperty(['#btnSimpanPengaturanSistem', '#pengaturanSistem-searchKeyword'], true);
            dataTableContent.html("<tr><td class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    rows    =   responseJSON.rowPengaturan;
                    break;
                case 404:
                default:
                    rows    =   '<tr><td class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            setElemDisabledProperty(['#btnSimpanPengaturanSistem', '#pengaturanSistem-searchKeyword'], false);
            activateOnclickBtnSimpanPengaturanSistem();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnclickBtnSimpanPengaturanSistem() {
    $('#btnSimpanPengaturanSistem').off('click').on('click', function () {
        let dataSend    =   {
            dataPengaturan  :   []
        };

        $('.pengaturan-sistem-input').each(function () {
            let inputElem       =   $(this),
                idPengaturan    =   inputElem.closest('tr').data('id-pengaturan'),
                valuePengaturan =   inputElem.val();

            dataSend.dataPengaturan.push({
                idPengaturan:   idPengaturan,
                valuePengaturan:  valuePengaturan
            });
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "simpanPengaturanSistem",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: {withCredentials: true},
            headers: {Authorization: "Bearer " + getUserToken()},
            beforeSend: function () {
                Pace.start();
                toggleWindowLoader(true);
            },
            complete: function (jqXHR, textStatus) {
                if (jqXHR.status === 200) toastMessage("success", getMessageResponse(jqXHR));
                if (jqXHR.status !== 200) generateWarningMessageResponse(jqXHR);
            }
        }).always(function (jqXHR, textStatus) {
            toggleWindowLoader(false);
            Pace.stop();
            setUserToken(jqXHR);
        });
    });
}

function syncDataBarangSistemUtama() {
    $.ajax({
        type: 'POST',
        url: baseURLPath + "syncDataBarangSistemUtama",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend({}),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
        },
        complete: function (jqXHR, textStatus) {
            if (jqXHR.status === 200) {
                toastMessage("success", getMessageResponse(jqXHR));
                getDataVariabelSistemBarangSistemUtama();
            }
            if (jqXHR.status !== 200) generateWarningMessageResponse(jqXHR);
        }
    }).always(function (jqXHR, textStatus) {
        toggleWindowLoader(false);
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function generateDataTableBarangSistemUtama(pageNumber){
    getDataVariabelSistemBarangSistemUtama(pageNumber);
}

function getDataVariabelSistemBarangSistemUtama(pageNumber = 1) {
    let dataTableContent=   $('#dataBarangSistemUtama-table tbody'),
        totalColumns    =   $('#dataBarangSistemUtama-table thead tr th').length,
        searchKeyword   =   $('#dataBarangSistemUtama-searchKeyword').val(),
        dataSend        =   {
            searchKeyword: searchKeyword,
            pageNumber: pageNumber,
            dataPerPage: 25
        };
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataBarangSistemUtama",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            setElemDisabledProperty(['.paginationElem', '#btnSyncDataBarangSistemUtama', '#dataBarangSistemUtama-searchKeyword'], true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    $.each(listData, function (index, arrayData) {
                        rows    +=  '<tr>\
                                        <td class="text-break">' + arrayData.NAMAMERK + '</td>\
                                        <td class="text-break">' + arrayData.KATEGORIBARANG + '</td>\
                                        <td class="text-break">' + arrayData.KUALITASBARANG + '</td>\
                                        <td class="text-break">' + arrayData.FINISHBARANG + '</td>\
                                        <td class="text-break">' + arrayData.NAMAKODEBARANG + '</td>\
                                    </tr>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            setElemDisabledProperty(['.paginationElem', '#btnSyncDataBarangSistemUtama', '#dataBarangSistemUtama-searchKeyword'], false);
            generatePagination('dataBarangSistemUtama-paginationInfo', 'dataBarangSistemUtama-paginationControl', pageNumber, responseJSON.pageProperty, 'comboBoxPagination-dataBarangSistemUtama', 'generateDataTableBarangSistemUtama');
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function syncDataWilayahOngkir() {
    $.ajax({
        type: 'POST',
        url: baseURLPath + "syncDataWilayahOngkir",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend({}),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
        },
        complete: function (jqXHR, textStatus) {
            if (jqXHR.status === 200) {
                toastMessage("success", getMessageResponse(jqXHR));
                getDataVariabelSistemWilayahOngkir();
            }
            if (jqXHR.status !== 200) generateWarningMessageResponse(jqXHR);
        }
    }).always(function (jqXHR, textStatus) {
        toggleWindowLoader(false);
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function generateDataTableWilayahOngkir(pageNumber){
    getDataVariabelSistemWilayahOngkir(pageNumber);
}

function getDataVariabelSistemWilayahOngkir(pageNumber = 1) {
    let dataTableContent    =   $('#dataWilayahOngkir-table tbody'),
        totalColumns        =   $('#dataWilayahOngkir-table thead tr th').length,
        keywordProvinsi     =   $('#dataWilayahOngkir-searchKeywordProvinsi').val(),
        keywordKotaKabupaten=   $('#dataWilayahOngkir-searchKeywordKotaKabupaten').val(),
        keyword             =   $('#dataWilayahOngkir-searchKeyword').val(),
        dataSend            =   {
            keywordProvinsi: keywordProvinsi,
            keywordKotaKabupaten: keywordKotaKabupaten,
            searchKeyword: keyword,
            pageNumber: pageNumber,
            dataPerPage: 50
        };
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataWilayahOngkir",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            setElemDisabledProperty(['.paginationElem', '#btnSyncDataWilayahOngkir', '#dataWilayahOngkir-searchKeyword'], true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    $.each(listData, function (index, arrayData) {
                        rows    +=  '<tr>\
                                        <td class="text-break">\
                                            ' + arrayData.NAMAPROVINSI + '\
                                            <p class="text-muted mb-0">Kode API :' + arrayData.KODEAPIPROVINSI + '</p>\
                                        </td>\
                                        <td class="text-break">\
                                            ' + arrayData.NAMAKOTAKABUPATEN + '\
                                            <p class="text-muted mb-0">Kode API :' + arrayData.KODEAPIKOTAKABUPATEN + '</p>\
                                        </td>\
                                        <td class="text-break">\
                                            ' + arrayData.NAMAKECAMATAN + '\
                                            <p class="text-muted mb-0">Kode API :' + arrayData.KODEAPIKECAMATAN + '</p>\
                                        </td>\
                                    </tr>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            setElemDisabledProperty(['.paginationElem', '#btnSyncDataWilayahOngkir', '#dataWilayahOngkir-searchKeyword'], false);
            generatePagination('dataWilayahOngkir-paginationInfo', 'dataWilayahOngkir-paginationControl', pageNumber, responseJSON.pageProperty, 'comboBoxPagination-dataWilayahOngkir', 'generateDataTableWilayahOngkir');
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

pengaturanVariabelSistemFunc();
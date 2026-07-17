var baseURLPath         =   baseURL + "pengaturan/variabelSistem/",
    containerContent    =   $('#pengaturanVariabelSistem-content');

if (pengaturanVariabelSistemFunc == null) {
    var pengaturanVariabelSistemFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '.pengaturanVariabelSistem-tabContent',
                ['pengaturanVariabelSistem-header', 'pengaturanVariabelSistem-hr', 'pengaturanVariabelSistem-tabPills']
            );

            $('.pengaturanVariabelSistem-tabPills a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
                var targetTab   =   $(e.target).attr('href');
                
                switch (targetTab) {
                    case '#pills-barang-sistem-utama':
                        getDataVariabelSistemBarangSistemUtama();
                        break;
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

            getDataVariabelSistemBarangSistemUtama();
        });
    }
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
                getDataVariabelSistemBarangSistemUtama();
            }
            toastMessage("success", getMessageResponse(jqXHR));
            toggleWindowLoader(false);
        }
    }).always(function (jqXHR, textStatus) {
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

pengaturanVariabelSistemFunc();
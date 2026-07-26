var baseURLPath     =   baseURL + "customer/customer/daftarCustomer/",
    dataTableContent=   $('#customerDaftarCustomer-cardContent').find('table:first').find('tbody').first(),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length;

if (customerDaftarCustomerFunc == null) {
    var customerDaftarCustomerFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerDaftarCustomer-cardContent',
                ['customerDaftarCustomer-header', 'customerDaftarCustomer-hr', 'customerDaftarCustomer-alert']
            );
            getCustomerDataCustomer();

            $('#customerDaftarCustomer-searchKeyword').off('keydown');
            $('#customerDaftarCustomer-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerDataCustomer();
                }
            });

            $('#btnKembali').on('click', function() {
                toggleSlideContainerDaftarCustomer();
                toggleDisplayTopButton(true);
            });
        });
    }
}

function toggleSlideContainerDaftarCustomer() {
    toggleSlideContainer('customerDaftarCustomer-leftContainer', 'customerDaftarCustomer-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnKembali').addClass('d-none');
    } else {
        $('#btnKembali').removeClass('d-none');
    }
}

function generateDataTable(pageNumber){
    getCustomerDataCustomer(pageNumber);
}

function getCustomerDataCustomer(pageNumber = 1) {
    let searchKeyword   =   $('#customerDaftarCustomer-searchKeyword').val(),
        dataSend        =   {
            searchKeyword: searchKeyword,
            pageNumber: pageNumber
        };
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getData",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            setElemDisabledProperty(['.paginationElem', '#customerDaftarCustomer-searchKeyword'], true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData        =   responseJSON.listData,
                        baseURLAvatar   =   responseJSON.urlBaseAvatarImage;

                    $.each(listData, function (index, arrayData) {
                        let statusBadge     =   parseInt(arrayData.STATUS) == 1 ?
                                                '<span><i class="far fa-check-circle text-success fa-fw fa-lg"></i> Aktif</span>' :
                                                '<span><i class="far fa-times-circle text-danger fa-fw fa-lg"></i> Non Aktif</span>',
                            developerBadge  =   parseInt(arrayData.ISDEVELOPER) == 1 ?
                                                '<span><i class="far fa-check-circle text-success fa-fw fa-lg"></i> Ya</span>' :
                                                '<span><i class="far fa-times-circle text-danger fa-fw fa-lg"></i> Tidak</span>';
                        rows    +=  '<tr class="dataCustomer-row" title="Klik untuk melihat detail" data-id="' + arrayData.IDCUSTOMER + '">\
                                        <td class="text-center" data-tag="avatar-img">\
                                            <img src="' + baseURLAvatar + arrayData.AVATAR + '" alt="" width="50" class="rounded-circle mx-auto">\
                                        </td>\
                                        <td data-tag="nama">' + arrayData.NAMA + '</td>\
                                        <td data-tag="loyalti-tier">' + arrayData.LOYALTITIER + '</td>\
                                        <td data-tag="tanggal-daftar">' + arrayData.TANGGALDAFTAR + '</td>\
                                        <td data-tag="tanggal-lahir">' + arrayData.TANGGALLAHIR + '</td>\
                                        <td data-tag="email">' + arrayData.EMAIL + '</td>\
                                        <td data-tag="nomor-hp">' + arrayData.NOMORHP + '</td>\
                                        <td data-tag="kode-unik">' + arrayData.KODEUNIK + '</td>\
                                        <td data-tag="status">' + statusBadge + '</td>\
                                        <td data-tag="developer">' + developerBadge + '</td>\
                                    </tr>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            setElemDisabledProperty(['.paginationElem', '#customerDaftarCustomer-searchKeyword'], false);
            generatePagination('customerDaftarCustomer-paginationInfo', 'customerDaftarCustomer-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickRowData();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnClickRowData() {
    $('.dataCustomer-row').off('click');
    $('.dataCustomer-row').on('click', function() {
        let arrDetailType   =   ['alamat', 'transaksi', 'feed'],
            rowData         =   $(this),
            idCustomer      =   rowData.data('id'),
            avatarImg       =   rowData.find('td[data-tag="avatar-img"]').find('img').attr('src'),
            nama            =   rowData.find('td[data-tag="nama"]').text(),
            loyaltiTier     =   rowData.find('td[data-tag="loyalti-tier"]').text(),
            tanggalDaftar   =   rowData.find('td[data-tag="tanggal-daftar"]').text(),
            tanggalLahir    =   rowData.find('td[data-tag="tanggal-lahir"]').text(),
            email           =   rowData.find('td[data-tag="email"]').text(),
            nomorHp         =   rowData.find('td[data-tag="nomor-hp"]').text(),
            kodeUnik        =   rowData.find('td[data-tag="kode-unik"]').text(),
            status          =   rowData.find('td[data-tag="status"]').html(),
            developer       =   rowData.find('td[data-tag="developer"]').html(),
            activeTabDetail =   $('.detailCustomer-tabPills').find('a.active').attr('href'),
            activeDetailType=   activeTabDetail.replace('#pills-data-', '');

        $("#detailCustomer-avatarImage").attr('src', avatarImg);
        $("#detailCustomer-nama").text(nama);
        $("#detailCustomer-loyaltiTier").text(loyaltiTier);
        $("#detailCustomer-tanggalDaftar").text(tanggalDaftar);
        $("#detailCustomer-tanggalLahir").text(tanggalLahir);
        $("#detailCustomer-email").text(email);
        $("#detailCustomer-noTelpon").text(nomorHp);
        $("#detailCustomer-kodeCustomer").text(kodeUnik);
        $("#detailCustomer-status").html(status);
        $("#detailCustomer-developer").html(developer);
        
        toggleSlideContainerDaftarCustomer();
        toggleDisplayTopButton(false);

        let switcherTabDetailCustomer   =   function (tabType) {
            switch (tabType) {
                case 'alamat':
                    getDataTableDetailCustomer('alamat', idCustomer, 1);
                    break;
                case 'transaksi':
                    getDataTableDetailCustomer('transaksi', idCustomer, 1);
                    break;
                case 'feed':
                    getDataTableDetailCustomer('feed', idCustomer, 1);
                    break;
            }
        };

        $('.detailCustomer-tabPills a[data-bs-toggle="pill"]').on('shown.bs.tab', function (e) {
            let targetTab       =   $(e.target).attr('href'),
                activeDetailType=   targetTab.replace('#pills-data-', '');
            switcherTabDetailCustomer(activeDetailType);

            arrDetailType.filter(function (item) {
                if(item !== activeDetailType) {
                    $('#pills-data-' + item).removeClass('d-flex flex-column').addClass('d-none');
                } else {
                    $('#pills-data-' + item).removeClass('d-none').addClass('d-flex flex-column');
                }
            });
        });

        switcherTabDetailCustomer(activeDetailType);
    });
}

function getDataTableDetailCustomer(dataType, idCustomer, pageNumber = 1) {
    let pillsElement            =   $('#detailCustomer-tabContentBody').find('#pills-data-' + dataType),
        dataTableDetailContent  =   pillsElement.find('table:first').find('tbody').first(),
        totalColumns            =   pillsElement.find('table:first').find('thead:first').find('th').length,
        paginationInfoElemID    =   'detailCustomer-' + dataType + '-paginationInfo',
        paginationControlElemID =   'detailCustomer-' + dataType + '-paginationControl',
        dataSend                =   {
            dataType: dataType,
            idCustomer: idCustomer,
            pageNumber: pageNumber
        };

    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataTableDetail",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            setElemDisabledProperty(['.paginationElem'], true);
            dataTableDetailContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    switch (dataType) {
                        case 'alamat':
                            $.each(listData, function (index, arrayData) {
                                let statusBadge     =   parseInt(arrayData.STATUS) == 1 ?
                                                        '<span><i class="far fa-check-circle text-success fa-fw fa-lg"></i> Aktif</span>' :
                                                        '<span><i class="far fa-times-circle text-danger fa-fw fa-lg"></i> Non Aktif</span>',
                                    alamatUtamaBadge=   parseInt(arrayData.ISALAMATUTAMA) == 1 ?
                                                        '<span><i class="far fa-check-circle text-success fa-fw fa-lg"></i> Ya</span>' :
                                                        '<span><i class="far fa-times-circle text-danger fa-fw fa-lg"></i> Tidak</span>';
                                rows    +=  '<tr>\
                                                <td>' + arrayData.NAMAALAMAT + '</td>\
                                                <td>\
                                                    <dl class="row mb-0">\
                                                        <dt class="col-sm-4">Nama</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.NAMAPENERIMA + '</dd>\
                                                        <dt class="col-sm-4">Nomor HP</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.NOMORHPPENERIMA + '</dd>\
                                                    </dl>\
                                                </td>\
                                                <td>\
                                                    ' + arrayData.ALAMAT + '<br/>\
                                                    Kel. ' + arrayData.KELURAHAN + ' (' + arrayData.KODEPOS + '), Kec. ' + arrayData.KECAMATAN + '<br/>\
                                                </td>\
                                                <td>\
                                                    <dl class="row mb-0">\
                                                        <dt class="col-sm-4">Kota / Kab.</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.KOTA + '</dd>\
                                                        <dt class="col-sm-4">Provinsi</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.PROPINSI + '</dd>\
                                                    </dl>\
                                                </td>\
                                                <td>' + alamatUtamaBadge + '</td>\
                                                <td>' + statusBadge + '</td>\
                                            </tr>';
                            });
                            break;
                        case 'transaksi':
                            $.each(listData, function (index, arrayData) {
                                rows    +=  '<tr>\
                                                <td>\
                                                    <dl class="row mb-0">\
                                                        <dt class="col-sm-4">Waktu</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.INPUTTANGGALWAKTUSTR + '</dd>\
                                                        <dt class="col-sm-4">Regional</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.NAMAREGIONAL + '</dd>\
                                                        <dt class="col-sm-4">No. Transaksi</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.NOMORTRANSAKSI + '</dd>\
                                                        <dt class="col-sm-4">Pembayaran</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.NAMAKANALPEMBAYARAN + '</dd>\
                                                        <dt class="col-sm-4">Status</dt>\
                                                        <dd class="col-sm-8 mb-0">: ' + arrayData.STATUSTRANSAKSI + '</dd>\
                                                    </dl>\
                                                </td>\
                                                <td>\
                                                    <dl class="row mb-0">\
                                                        <dt class="col-sm-5">Jumlah Item</dt>\
                                                        <dd class="col-sm-7 mb-0">: ' + numberFormat(arrayData.TOTALBARANG) + '</dd>\
                                                        <dt class="col-sm-5">Ekspedisi</dt>\
                                                        <dd class="col-sm-7 mb-0">: ' + arrayData.NAMAEKSPEDISI + '</dd>\
                                                        <dt class="col-sm-5">No. Resi</dt>\
                                                        <dd class="col-sm-7 mb-0">: ' + arrayData.NOMORRESIEKSPEDISI + '</dd>\
                                                        <dt class="col-sm-5">Tag Alamat</dt>\
                                                        <dd class="col-sm-7 mb-0">: ' + arrayData.ALAMATNAMA + '</dd>\
                                                    </dl>\
                                                </td>\
                                                <td>\
                                                    ' + arrayData.PENERIMANAMA + ' (' + arrayData.PENERIMANOMORTELEPON + ')<br/>\
                                                    ' + arrayData.ALAMATKIRIM + '\
                                                </td>\
                                                <td>' + arrayData.CATATAN + ' </td>\
                                                <td>\
                                                    <dl class="row mb-0">\
                                                        <dt class="col-sm-6">Harga Barang</dt>\
                                                        <dd class="col-sm-6 mb-0 text-end">' + numberFormat(arrayData.TOTALNOMINALBARANG) + '</dd>\
                                                        <dt class="col-sm-6">Ongkos Kirim</dt>\
                                                        <dd class="col-sm-6 mb-0 text-end">' + numberFormat(arrayData.TOTALNOMINALONGKIR) + '</dd>\
                                                        <dt class="col-sm-6">Potongan</dt>\
                                                        <dd class="col-sm-6 mb-0 text-end">-' + numberFormat(arrayData.TOTALNOMINALDISKON) + '</dd>\
                                                        <dt class="col-sm-6">Total Bayar</dt>\
                                                        <dd class="col-sm-6 mb-0 text-end"><b>' + numberFormat(arrayData.TOTALNOMINALBAYAR) + '</b></dd>\
                                                    </dl>\
                                                </td>\
                                            </tr>';
                            });
                            break;
                        case 'feed':
                            $.each(listData, function (index, arrayData) {
                                let badgeSuka     =   parseInt(arrayData.ISSUKA) == 1 ?
                                                        '<i class="far fa-check-circle text-success fa-fw fa-lg"></i>' :
                                                        '<i class="far fa-times-circle text-danger fa-fw fa-lg"></i>',
                                    badgeBookmark   =   parseInt(arrayData.ISBOOKMARK) == 1 ?
                                                        '<i class="far fa-check-circle text-success fa-fw fa-lg"></i>' :
                                                        '<i class="far fa-times-circle text-danger fa-fw fa-lg"></i>';
                                rows    +=  '<tr>\
                                                <td class="text-break">' + arrayData.JUDUL + '</td>\
                                                <td class="text-break">' + arrayData.DESKRIPSI + '</td>\
                                                <td class="text-break">\
                                                    <a href="' + arrayData.URLFEED + '" target="_blank">' + arrayData.URLFEED + '</a>\
                                                </td>\
                                                <td class="text-center">' + badgeSuka + '</td>\
                                                <td class="text-center">' + badgeBookmark + '</td>\
                                            </tr>';
                            });
                            break;
                    }
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableDetailContent.html(rows);
            setElemDisabledProperty(['.paginationElem'], false);
            generatePagination(paginationInfoElemID, paginationControlElemID, pageNumber, responseJSON.pageProperty);
        
            applyAutoResizeDocHeight(
                '#pills-data-'+dataType,
                ['customerDaftarCustomer-header', 'customerDaftarCustomer-hr', 'detailCustomer-cardDetailCustomer', 'detailCustomer-tabContentHeader']
            );
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

customerDaftarCustomerFunc();
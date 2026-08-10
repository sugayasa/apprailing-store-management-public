var baseURLPath     =   baseURL + "customer/transaksi/daftarTransaksi/",
    dataTableContent=   $('#customerDaftarTransaksi-cardContent').find('table:first').find('tbody').first(),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length;

if (customerDaftarTransaksiFunc == null) {
    var customerDaftarTransaksiFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerDaftarTransaksi-cardContent',
                ['customerDaftarTransaksi-header', 'customerDaftarTransaksi-hr']
            );
            setOptionHelper('customerDaftarTransaksi-optionRegional', 'dataCustomerRegional');
            getCustomerDataTransaksi();

            $('#customerDaftarTransaksi-optionRegional').off('change');
            $('#customerDaftarTransaksi-optionRegional').on('change', function(e) {
                getCustomerDataTransaksi();
            });

            $('#customerDaftarTransaksi-searchKeyword').off('keydown');
            $('#customerDaftarTransaksi-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerDataTransaksi();
                }
            });

            $('#btnKembali').on('click', function() {
                toggleSlideContainerDaftarTransaksi();
                toggleDisplayTopButton(true);
            });
        });

        $('#customerDaftarTransaksi-rentangTanggal').datepicker({
            autoclose: true,
            format: 'dd MM yyyy',
            language: 'id',
            todayHighlight: true,
            toggleActive: true
        }).on('changeDate', function (e) {
            getCustomerDataTransaksi();
        });

        var today           =   new Date();
        var thirtyDaysAgo   =   new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        $('#customerDaftarTransaksi-rentangTanggal input[name="tanggalAwal"]').datepicker('setDate', thirtyDaysAgo);
        $('#customerDaftarTransaksi-rentangTanggal input[name="tanggalAkhir"]').datepicker('setDate', today);
    }
}

function toggleSlideContainerDaftarTransaksi() {
    toggleSlideContainer('customerDaftarTransaksi-leftContainer', 'customerDaftarTransaksi-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnKembali').addClass('d-none');
    } else {
        $('#btnKembali').removeClass('d-none');
    }
}

function generateDataTable(pageNumber){
    getCustomerDataTransaksi(pageNumber);
}

function getCustomerDataTransaksi(pageNumber = 1) {
    let idRegional      =   $('#customerDaftarTransaksi-optionRegional').val(),
        tanggalAwalVal  =   $('#customerDaftarTransaksi-rentangTanggal input[name="tanggalAwal"]').datepicker('getDate'),
        tanggalAkhirVal =   $('#customerDaftarTransaksi-rentangTanggal input[name="tanggalAkhir"]').datepicker('getDate'),
        tanggalAwal     =   tanggalAwalVal ? formatDateYMDBootstrapDatePicker(tanggalAwalVal) : '',
        tanggalAkhir    =   tanggalAkhirVal ? formatDateYMDBootstrapDatePicker(tanggalAkhirVal) : '',
        searchKeyword   =   $('#customerDaftarTransaksi-searchKeyword').val(),
        dataSend        =   {
            searchKeyword: searchKeyword,
            idRegional: idRegional,
            tanggalAwal: tanggalAwal,
            tanggalAkhir: tanggalAkhir,
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
            toggleWindowLoader(true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    $.each(listData, function (index, arrayData) {
                        let badgeStatus =   '<span class="badge bg-' + arrayData.COLORCLASSBS + ' bg-opacity-20 text-' + arrayData.COLORCLASSBS + '">' + arrayData.STATUSTRANSAKSI + '</span>';
                        
                        rows    +=  '<tr class="dataTransaksi-row" title="Klik untuk melihat detail" data-id="' + arrayData.IDTRANSAKSIREKAP + '">\
                                        <td>\
                                            <div class="fw-600 text-body">' + arrayData.NAMA + '</div>\
                                            <div class="fs-13px">' + arrayData.EMAIL + '</div>\
                                            <div class="fs-13px">' + arrayData.NOMORHP + '</div>\
                                        </td>\
                                        <td>\
                                            ' + badgeStatus + '\
                                            <div class="fw-600 text-body">' + arrayData.NOMORTRANSAKSI + '</div>\
                                            <div class="fs-13px">' + arrayData.INPUTTANGGALWAKTUSTR + '</div>\
                                            <div class="fs-13px">' + arrayData.NAMAREGIONAL + '</div>\
                                            <div class="fs-13px">' + arrayData.NAMAKANALPEMBAYARAN + '</div>\
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
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            toggleWindowLoader(false);
            generatePagination('customerDaftarTransaksi-paginationInfo', 'customerDaftarTransaksi-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickRowData();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnClickRowData() {
    $('.dataTransaksi-row').off('click');
    $('.dataTransaksi-row').on('click', function() {
        let idTransaksiRekap=   $(this).data('id'),
            dataSend        =   {
                idTransaksiRekap: idTransaksiRekap
            };

        $.ajax({
            type: 'POST',
            url: baseURLPath + "getDetail",
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
                var responseJSON=   jqXHR.responseJSON;

                switch (jqXHR.status) {
                    case 200:
                        let detailData      =   responseJSON.detailData,
                            daftarProduk    =   responseJSON.daftarProduk,
                            prefixElemDetail=   '#detailTransaksi-',
                            totalPcs        =   0;

                        $(prefixElemDetail + 'avatar').attr('src', baseUrlCustomerAvatar + detailData.AVATAR);
                        $(prefixElemDetail + 'namaCustomer').text(detailData.NAMA);
                        $(prefixElemDetail + 'kodeCustomer').text(detailData.KODECUSTOMER);
                        $(prefixElemDetail + 'emailCustomer').text(detailData.EMAIL);
                        $(prefixElemDetail + 'telpCustomer').text(detailData.NOMORHP);
                        $(prefixElemDetail + 'levelLoyaltiCustomerIcon').attr('src', baseUrlIconLevelLoyalti + detailData.ICONFILELOYALTI);
                        $(prefixElemDetail + 'levelLoyaltiCustomer').text(detailData.LOYALTITIER);
                        $(prefixElemDetail + 'kode').text(detailData.NOMORTRANSAKSI);
                        $(prefixElemDetail + 'statusTransaksi').html('<span class="badge bg-' + detailData.COLORCLASSBS + ' bg-opacity-20 text-' + detailData.COLORCLASSBS + '">' + detailData.STATUSTRANSAKSI + '</span>');
                        $(prefixElemDetail + 'tanggalWaktu').text(detailData.INPUTTANGGALWAKTUSTR);
                        $(prefixElemDetail + 'regional').text(detailData.NAMAREGIONAL);
                        $(prefixElemDetail + 'metodePembayaran').text(detailData.NAMAKANALPEMBAYARAN);
                        $(prefixElemDetail + 'catatan').text(detailData.CATATAN);
                        $(prefixElemDetail + 'ekspedisi').text(': ' + detailData.NAMAEKSPEDISI);
                        $(prefixElemDetail + 'noResi').text(': ' + detailData.NOMORRESIEKSPEDISI);
                        $(prefixElemDetail + 'tagAlamat').text(': ' + detailData.ALAMATNAMA);
                        $(prefixElemDetail + 'namaTelponCustomer').text(detailData.PENERIMANAMA+' ('+detailData.PENERIMANOMORTELEPON+')');
                        $(prefixElemDetail + 'alamatPengiriman').text(detailData.ALAMATKIRIM);
                        $(prefixElemDetail + 'totalProduk').text(numberFormat(detailData.TOTALBARANG));
                        $(prefixElemDetail + 'totalHargaProduk').text(numberFormat(detailData.TOTALNOMINALBARANG));
                        $(prefixElemDetail + 'ongkosKirim').text(numberFormat(detailData.TOTALNOMINALONGKIR));
                        $(prefixElemDetail + 'diskon').text(numberFormat(detailData.TOTALNOMINALDISKON));
                        $(prefixElemDetail + 'totalBayar').text(numberFormat(detailData.TOTALNOMINALBAYAR));

                        if (daftarProduk.length > 0) {
                            let rowsProduk  =   "";
                            $.each(daftarProduk, function (index, arrayData) {
                                let arrImageProduk  =   JSON.parse(arrayData.ARRIMAGE) ? JSON.parse(arrayData.ARRIMAGE) : [],
                                    imageProduk     =   arrImageProduk && arrImageProduk.length > 0 ? arrImageProduk[0] : 'default.png';

                                if(index != 0) rowsProduk  +=  '<hr class="opacity-1 my-3">';
                                rowsProduk  +=  '<div class="row align-items-center">\
                                                    <div class="col-lg-8 d-flex align-items-center">\
                                                        <div class="h-65px w-65px d-flex align-items-center justify-content-center position-relative bg-body rounded">\
                                                            <img src="'+baseUrlCustomerProduk+imageProduk+'" class="mw-100 mh-100 rounded">\
                                                            <span class="w-20px h-20px p-0 d-flex align-items-center justify-content-center badge bg-theme text-theme-color position-absolute end-0 top-0 fw-bold fs-12px rounded-pill mt-n2 me-n2">'+arrayData.JUMLAH+'</span>\
                                                        </div>\
                                                        <div class="ps-3 flex-1">\
                                                            <div class="text-decoration-none text-body">'+arrayData.NAMAPRODUK+'</div>\
                                                            <div class="text-body text-opacity-50 small">\
                                                                '+arrayData.NAMAMERK+' - '+arrayData.NAMAKATEGORI+'\
                                                            </div>\
                                                            <div class="text-body text-opacity-50 small">\
                                                                '+arrayData.KETERANGAN+'\
                                                            </div>\
                                                        </div>\
                                                    </div>\
                                                    <div class="col-lg-2 m-0 ps-lg-3">\
                                                        '+numberFormat(arrayData.NOMINALSATUAN)+' x '+arrayData.JUMLAH+'\
                                                    </div>\
                                                    <div class="col-lg-2 m-0 text-end">\
                                                        '+numberFormat(arrayData.NOMINALTOTAL)+'\
                                                    </div>\
                                                </div>';
                                totalPcs    +=  parseInt(arrayData.JUMLAH);
                            });
                            $(prefixElemDetail + 'daftarProdukContainer').html(rowsProduk);
                        } else {
                            $(prefixElemDetail + 'daftarProdukContainer').html(
                                '<div class="text-center py-4">\
                                    <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                    <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                </div>'
                            );
                        }
                        $(prefixElemDetail + 'totalPcs').text(numberFormat(totalPcs));

                        toggleSlideContainerDaftarTransaksi();
                        toggleDisplayTopButton(false);
                        break;
                    case 404:
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            Pace.stop();
            setUserToken(jqXHR);
            toggleWindowLoader(false);
        });        
    });
}

customerDaftarTransaksiFunc();
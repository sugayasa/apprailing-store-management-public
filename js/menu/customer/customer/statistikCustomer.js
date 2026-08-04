var baseURLPath                 =   baseURL + "customer/customer/statistikCustomer/",
    grafikKunjunganCanvas       =   $('#customerStatistikCustomer-grafikKunjunganCanvas'),
    defaultEmptyCardContent     =   '<div class="text-center py-4">\
                                        <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                        <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                    </div>',
    arrElemTotalDataKunjungan   =   [
        'totalKunjungan',
        'jumlahPerangkat',
        'jumlahTamu',
        'jumlahRegistrasi',
        'jumlahTeregistrasi',
        'rerataKunjungan'
    ];

if (customerStatistikCustomerFunc == null) {
    var customerStatistikCustomerFunc = function () {
        $(document).ready(function () {
            getCustomerStatistikCustomer();
        });

        $('#customerStatistikCustomer-rentangTanggal').datepicker({
            autoclose: true,
            format: 'dd MM yyyy',
            language: 'id',
            todayHighlight: true,
            toggleActive: true
        });

        var today           =   new Date();
        var thirtyDaysAgo   =   new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAwal"]').datepicker('setDate', thirtyDaysAgo);
        $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAkhir"]').datepicker('setDate', today);
        $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAwal"], #customerStatistikCustomer-rentangTanggal input[name="tanggalAkhir"]').on('change', function () {
            getCustomerStatistikCustomer();
        });
    }
}

function getCustomerStatistikCustomer() {
    let tanggalAwalVal  =   $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAwal"]').datepicker('getDate');
    let tanggalAkhirVal =   $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAkhir"]').datepicker('getDate');
    let tanggalAwal     =   tanggalAwalVal ? formatDateYMDBootstrapDatePicker(tanggalAwalVal) : '';
    let tanggalAkhir    =   tanggalAkhirVal ? formatDateYMDBootstrapDatePicker(tanggalAkhirVal) : '';
    let dataSend        =   {
        tanggalAwal: tanggalAwal,
        tanggalAkhir: tanggalAkhir
    };

    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataStatistik",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true },
        headers: {Authorization: 'Bearer ' + getUserToken()},
        beforeSend: function () {
            Pace.start();
            grafikKunjunganCanvas.html(loaderElem);
            resetTotalDataKunjunganElem();
            resetDataTabelStatistik();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let jumlahHariPeriode           =   responseJSON.jumlahHariPeriode,
                        arrTanggalPeriode           =   responseJSON.arrTanggalPeriode,
                        dataGrafikKunjungan         =   responseJSON.dataGrafikKunjungan,
                        dataKunjunganRekap          =   responseJSON.dataKunjunganRekap,
                        dataStatistikBerita         =   responseJSON.dataStatistikBerita,
                        dataStatistikGaleriKlien    =   responseJSON.dataStatistikGaleriKlien,
                        dataStatistikGaleriProyek   =   responseJSON.dataStatistikGaleriProyek,
                        dataStatistikFeed           =   responseJSON.dataStatistikFeed;

                    generateChartKunjungan(arrTanggalPeriode, dataGrafikKunjungan);
                    setDataKunjunganElem(jumlahHariPeriode, dataKunjunganRekap);
                    setStatistikBeritaElem(dataStatistikBerita);
                    setStatistikGaleriKlienElem(dataStatistikGaleriKlien);
                    setStatistikGaleriProyekElem(dataStatistikGaleriProyek);
                    setStatistikFeedElem(dataStatistikFeed);
                    break;
                default:
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function resetTotalDataKunjunganElem() {
    arrElemTotalDataKunjungan.forEach(function (selector) {
        $('#customerStatistikCustomer-'+selector).html('0');
    });
}

function resetDataTabelStatistik() {
    let prefixSelector      =   '#customerStatistikCustomer-',
        arrTableContainer   =   [
            'beritaTabel',
            'galeriKlien',
            'galeriProyek',
            'feed'
        ];
    $('\
        '+prefixSelector+'beritaDilihat, \
        '+prefixSelector+'beritaArtikel, \
        '+prefixSelector+'galeriKlienDilihat, \
        '+prefixSelector+'galeriKlienGaleri, \
        '+prefixSelector+'galeriKlienUser, \
        '+prefixSelector+'galeriProyekDilihat, \
        '+prefixSelector+'galeriProyekGaleri, \
        '+prefixSelector+'galeriProyekUser, \
        '+prefixSelector+'feedDilihat, \
        '+prefixSelector+'feedFeed, \
        '+prefixSelector+'feedUser \
    ').html('0');

    for (let i = 0; i < arrTableContainer.length; i++) {
        let tableContainerName      =   arrTableContainer[i],
            tableContainerSelector  =   prefixSelector + tableContainerName + ' table tbody',
            colspanTable            =   2;

        switch (tableContainerName) {
            case 'beritaTabel'  :   
            case 'feed'         :   colspanTable = 2; break;
            case 'galeriKlien'  :   
            case 'galeriProyek' :   colspanTable = 3; break;
            default             :   colspanTable = 2; break;
        }
        
        $(tableContainerSelector).html(generateEmptyRowTableStatistik(colspanTable));
    }
}

function generateEmptyRowTableStatistik(colspanTable) {
    return '<tr>\
                <td colspan="' + colspanTable + '" align="center">\
                    <i class="fa fa-inbox fa-2x text-muted mb-2"></i>\
                    <p class="text-muted mb-0">Tidak ada data yang ditampilkan</p>\
                </td>\
            </tr>';
}

function setDataKunjunganElem(jumlahHariPeriode, dataKunjunganRekap) {
    arrElemTotalDataKunjungan.forEach(function (selector) {
        if (selector != 'rerataKunjungan'){
            $('#customerStatistikCustomer-'+selector).html(numberFormat(dataKunjunganRekap[selector] ?? '0'));
        } else {
            let rerataKunjungan = (dataKunjunganRekap['totalKunjungan'] ?? 0) / jumlahHariPeriode;
            $('#customerStatistikCustomer-'+selector).html(numberFormat(rerataKunjungan));
        }
    });
}

function generateChartKunjungan(arrTanggalPeriode, dataGrafikKunjungan) {
    var ctx = document.getElementById('customerStatistikCustomer-grafikKunjunganCanvas');

    dataGrafikKunjungan.forEach(function (dataset) {
        if (dataset.pointBackgroundColor === 'app.color.componentBg') {
            dataset.pointBackgroundColor = 'transparent';
        }
    });

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: arrTanggalPeriode,
            datasets: dataGrafikKunjungan
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0
                }
            }
        }
    });
}

function setStatistikBeritaElem(dataStatistikBerita) {
    let jumlahDilihat   =   dataStatistikBerita.jumlahDilihat ?? 0,
        jumlahBerita    =   dataStatistikBerita.jumlahBerita ?? 0,
        baseUrlImage    =   dataStatistikBerita.baseUrlImageBerita ?? '',
        databerita      =   dataStatistikBerita.dataBerita ?? [];

    $('#customerStatistikCustomer-beritaDilihat').html(numberFormat(jumlahDilihat));
    $('#customerStatistikCustomer-beritaArtikel').html(numberFormat(jumlahBerita));

    var beritaTabelBody =   $('#customerStatistikCustomer-beritaTabel table tbody');
    beritaTabelBody.empty();

    if (databerita && databerita.length > 0) {
        databerita.forEach(function (berita, index) {
            var row =   '<tr>\
                            <td align="center">\
                                <img src="' + baseUrlImage + berita.IMAGE + '" class="img-fluid">\
                            </td>\
                            <td width="75%" class="text-truncate" style="max-width: 1px;">' + 
                                berita.JUDUL + '\
                                <br/>\
                                <span class="text-muted fw-600">Total Dilihat : ' + numberFormat(berita.JUMLAHDILIHAT) + 'x</span>\
                            </td>\
                        </tr>';
            beritaTabelBody.append(row);
        });
    } else {
        beritaTabelBody.append(generateEmptyRowTableStatistik(2));
    }
}

function setStatistikGaleriKlienElem(dataStatistikGaleriKlien) {
    let jumlahDilihat   =   dataStatistikGaleriKlien.jumlahDilihat ?? 0,
        jumlahGaleri    =   dataStatistikGaleriKlien.jumlahGaleriKlien ?? 0,
        jumlahUser      =   dataStatistikGaleriKlien.jumlahUser ?? 0,
        baseUrlImage    =   dataStatistikGaleriKlien.baseUrlGaleriKlien ?? '',
        datagaleri      =   dataStatistikGaleriKlien.dataGaleriKlien ?? [];

    $('#customerStatistikCustomer-galeriKlienDilihat').html(numberFormat(jumlahDilihat));
    $('#customerStatistikCustomer-galeriKlienGaleri').html(numberFormat(jumlahGaleri));
    $('#customerStatistikCustomer-galeriKlienUser').html(numberFormat(jumlahUser));

    var galeriTabelBody =   $('#customerStatistikCustomer-galeriKlienTabel table tbody');
    galeriTabelBody.empty();

    if (datagaleri && datagaleri.length > 0) {
        datagaleri.forEach(function (galeri, index) {
            var row =   '<tr>\
                            <td align="center">\
                                <img src="' + baseUrlImage + galeri.IMAGE + '" class="img-fluid">\
                            </td>\
                            <td width="65%" class="text-truncate" style="max-width: 1px;">\
                                <span class="fw-600">' + galeri.NAMAMERK + '</span><br/>\
                                <span class="fw-600 text-muted">' + galeri.NAMAKLIEN + '</span><br/>\
                                <span class="text-muted">' + galeri.DESKRIPSI + '</span>\
                            </td>\
                            <td width="15%">\
                                <span class="text-muted fw-600"><i class="fa fa-eye fa-fw text-primary me-1"></i>' + numberFormat(galeri.JUMLAHDILIHAT) + 'x</span><br/>\
                                <span class="text-muted fw-600"><i class="fa fa-user fa-fw text-gray me-1"></i>' + numberFormat(galeri.JUMLAHUSER) + '</span>\
                            </td>\
                        </tr>';
            galeriTabelBody.append(row);
        });
    } else {
        galeriTabelBody.append(generateEmptyRowTableStatistik(3));
    }
}

function setStatistikGaleriProyekElem(dataStatistikGaleriProyek) {
    let jumlahDilihat   =   dataStatistikGaleriProyek.jumlahDilihat ?? 0,
        jumlahGaleri    =   dataStatistikGaleriProyek.jumlahGaleriProyek ?? 0,
        jumlahUser      =   dataStatistikGaleriProyek.jumlahUser ?? 0,
        baseUrlImage    =   dataStatistikGaleriProyek.baseUrlGaleriProyek ?? '',
        datagaleri      =   dataStatistikGaleriProyek.dataGaleriProyek ?? [];

    $('#customerStatistikCustomer-galeriProyekDilihat').html(numberFormat(jumlahDilihat));
    $('#customerStatistikCustomer-galeriProyekGaleri').html(numberFormat(jumlahGaleri));
    $('#customerStatistikCustomer-galeriProyekUser').html(numberFormat(jumlahUser));

    var galeriTabelBody =   $('#customerStatistikCustomer-galeriProyekTabel table tbody');
    galeriTabelBody.empty();

    if (datagaleri && datagaleri.length > 0) {
        datagaleri.forEach(function (galeri, index) {
            var row =   '<tr>\
                            <td align="center">\
                                <img src="' + baseUrlImage + galeri.IMAGE + '" class="img-fluid">\
                            </td>\
                            <td width="65%" class="text-truncate" style="max-width: 1px;">\
                                <span class="fw-600">' + galeri.NAMAMERK + '</span><br/>\
                                <span class="fw-600 text-muted">' + galeri.NAMAKLIEN + '</span><br/>\
                                <span class="text-muted">' + galeri.ALAMATPROYEK + '</span>\
                            </td>\
                            <td width="15%">\
                                <span class="text-muted fw-600"><i class="fa fa-eye fa-fw text-primary me-1"></i>' + numberFormat(galeri.JUMLAHDILIHAT) + 'x</span><br/>\
                                <span class="text-muted fw-600"><i class="fa fa-user fa-fw text-gray me-1"></i>' + numberFormat(galeri.JUMLAHUSER) + '</span>\
                            </td>\
                        </tr>';
            galeriTabelBody.append(row);
        });
    } else {
        galeriTabelBody.append(generateEmptyRowTableStatistik(3));
    }
}

function setStatistikFeedElem(dataStatistikFeed) {
    let jumlahDilihat   =   dataStatistikFeed.jumlahDilihat ?? 0,
        jumlahFeed      =   dataStatistikFeed.jumlahFeed ?? 0,
        jumlahUser      =   dataStatistikFeed.jumlahUser ?? 0,
        datafeed        =   dataStatistikFeed.dataFeed ?? [];

    $('#customerStatistikCustomer-feedDilihat').html(numberFormat(jumlahDilihat));
    $('#customerStatistikCustomer-feedFeed').html(numberFormat(jumlahFeed));
    $('#customerStatistikCustomer-feedUser').html(numberFormat(jumlahUser));

    var feedTabelBody =   $('#customerStatistikCustomer-feedTabel table tbody');
    feedTabelBody.empty();

    if (datafeed && datafeed.length > 0) {
        datafeed.forEach(function (feed, index) {
            var row =   '<tr>\
                            <td width="65%" class="text-truncate" style="max-width: 1px;">\
                                <span class="fw-600">' + feed.JUDUL + '</span><br/>\
                                <span class="text-muted">' + feed.DESKRIPSI + '</span><br/>\
                                <a href="' + feed.URLFEED + '" target="_blank">' + feed.URLFEED + '</a>\
                            </td>\
                            <td width="15%">\
                                <span class="text-muted fw-600"><i class="fa fa-eye fa-fw text-primary me-1"></i>' + numberFormat(feed.JUMLAHDILIHAT) + 'x</span><br/>\
                                <span class="text-muted fw-600"><i class="fa fa-user fa-fw text-gray me-1"></i>' + numberFormat(feed.JUMLAHUSER) + '</span>\
                            </td>\
                        </tr>';
            feedTabelBody.append(row);
        });
    } else {
        feedTabelBody.append(generateEmptyRowTableStatistik(2));
    }
}

customerStatistikCustomerFunc();
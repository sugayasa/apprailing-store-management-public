var prefixStatistikElement  =   '#customerTransaksiStatistik-',
    grafikTransaksiCanvas   =   $(prefixStatistikElement+'grafikTransaksiCanvas'),
    rekapitulasiPerMerk     =   $(prefixStatistikElement+'rekapitulasiPerMerk'),
    progressBarRegional     =   $(prefixStatistikElement+'progressBarRegional'),
    totalTransaksiNominal   =   $(prefixStatistikElement+'totalTransaksiNominal'),
    rekapitulasiPerRegional =   $(prefixStatistikElement+'rekapitulasiPerRegional'),
    produkBestSeller        =   $(prefixStatistikElement+'produkBestSeller'),
    daftarRiwayat           =   $(prefixStatistikElement+'daftarRiwayat'),
    defaultEmptyCardContent =   '<div class="text-center py-4">\
                                    <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                    <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                </div>';

if (statistikTransaksiFunc == null) {
    var statistikTransaksiFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerTransaksiStatistik-produkBestSellerContainer',
                ['customerTransaksiStatistik-header', 'customerTransaksiStatistik-hr', 'customerTransaksiStatistik-topContainer']
            );
            getStatistikTransaksi();
        });

        $('#customerTransaksiStatistik-bulanTahunInput').datepicker({
            format: 'MM yyyy',
            viewMode: 'months',
            minViewMode: 'months',
            autoclose: true,
            language: 'id',
            todayHighlight: true
        });

        $('#customerTransaksiStatistik-bulanTahunInput').datepicker('setDate', new Date());
        $('#customerTransaksiStatistik-bulanTahunInput').on('changeDate', function (e) {
            getStatistikTransaksi();
        });
    }
}

function getStatistikTransaksi() {
    let bulanTahunVal   =   $('#customerTransaksiStatistik-bulanTahunInput').datepicker('getDate'),
        bulanTahun      =   bulanTahunVal ? formatDateYMDBootstrapDatePicker(bulanTahunVal, 'YYYY-MM') : '',
        dataSend        =   {
            bulanTahun: bulanTahun
        };

    $.ajax({
        type: 'POST',
        url: baseURL + "customer/transaksi/statistikTransaksi/getDataStatistik",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true },
        headers: {Authorization: 'Bearer ' + getUserToken()},
        beforeSend: function () {
            Pace.start();
            rekapitulasiPerMerk.html(loaderElem);
            rekapitulasiPerRegional.html(loaderElem);
            produkBestSeller.html(loaderElem);
            totalTransaksiNominal.html('-');
            progressBarRegional.html('<div class="progress-bar bg-gray" style="width: 100%"></div>');
            daftarRiwayat.html('<tr><td colspan="3">'+loaderElem+'</td></tr>');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let arrTanggalPeriode       =   responseJSON.arrTanggalPeriode,
                        dataGrafikTransaksi     =   responseJSON.dataGrafikTransaksi,
                        dataRekapPerMerk        =   responseJSON.dataRekapPerMerk,
                        dataRekapPerRegional    =   responseJSON.dataRekapPerRegional,
                        rekapRegionalMargin     =   responseJSON.rekapRegionalMargin,
                        dataProdukBestSeller    =   responseJSON.dataProdukBestSeller,
                        dataRiwayatTransaksi    =   responseJSON.dataRiwayatTransaksi,
                        urlAssetLogoMerk        =   responseJSON.urlAssetLogoMerk,
                        urlAssetCustomerProduk  =   responseJSON.urlAssetCustomerProduk;

                    generateChartTransaksi(arrTanggalPeriode, dataGrafikTransaksi);
                    renderRekapPerMerk(dataRekapPerMerk, urlAssetLogoMerk);
                    renderRekapPerRegional(dataRekapPerRegional, rekapRegionalMargin);
                    renderProdukBestSeller(dataProdukBestSeller, urlAssetCustomerProduk);
                    renderRiwayatTransaksi(dataRiwayatTransaksi);
                    break;
                default:
                    rekapitulasiPerMerk.html(defaultEmptyCardContent);
                    rekapitulasiPerRegional.html(defaultEmptyCardContent);
                    produkBestSeller.html(defaultEmptyCardContent);
                    daftarRiwayat.html('<tr><td colspan="3" class="text-center text-muted">Tidak ada data tersedia</td></tr>');
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function generateChartTransaksi(arrTanggalPeriode, dataGrafikTransaksi) {
    var ctx = document.getElementById('customerTransaksiStatistik-grafikTransaksiCanvas');

    dataGrafikTransaksi.forEach(function (dataset) {
        if (dataset.pointBackgroundColor === 'app.color.componentBg') {
            dataset.pointBackgroundColor = 'transparent';
        }
    });

    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: arrTanggalPeriode,
            datasets: dataGrafikTransaksi
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    grafikTransaksiCanvas.css('max-height', '360px');
}

function renderRekapPerMerk(dataRekapPerMerk, urlAssetLogoMerk) {
    let rowRekapPerMerk = '';
    rekapitulasiPerMerk.empty();

    if(dataRekapPerMerk && dataRekapPerMerk.length > 0){
        $.each(dataRekapPerMerk, function (index, detailMerk) {
            rowRekapPerMerk +=  '<div class="d-flex align-items-justify mb-2">\
                                    <span class="rounded-circle d-inline-flex align-items-center justify-content-center me-2 flex-shrink-0" style="width: 50px; height: 50px; background-color: #2D2D2D;">\
                                        <img src="'+ urlAssetLogoMerk + detailMerk.LOGO+'" class="img-fluid" style="max-height: 44px; max-width: 44px;">\
                                    </span>\
                                    <div class="ms-3 flex-grow-1">\
                                        <div class="fw-600 text-body">' + detailMerk.TOTALTRANSAKSI + ' Transaksi</div>\
                                        <div class="fs-13px">Total Nominal : Rp. '+ numberFormat(detailMerk.TOTALTRANSAKSINOMINAL) +'</div>\
                                    </div>\
                                </div>';
        });
    } else {
        rowRekapPerMerk =  defaultEmptyCardContent;
    }
    rekapitulasiPerMerk.html(rowRekapPerMerk);
}

function renderRekapPerRegional(dataRekapPerRegional, rekapRegionalMargin) {
    let progressBarChild    =   '',
        rowRekapPerRegional =   '',
        grandTotalTransaksi =   0,
        grandTotalNominal   =   0;
    rekapitulasiPerRegional.empty();

    if (dataRekapPerRegional && dataRekapPerRegional.length > 0) {
        $.each(dataRekapPerRegional, function (index, detailRegional) {
            progressBarChild    +=  '<div class="progress-bar bg-' + detailRegional.CLASSWARNA + '" style="width: ' + detailRegional.PERSENTASE + '%"></div>';
            rowRekapPerRegional +=  '<div class="d-flex align-items-center mb-2">\
                                            <div class="flex-grow-1">\
                                                <div class="d-flex align-items-center ps-1">\
                                                    <i class="fa fa-circle fs-9px fa-fw text-'+ detailRegional.CLASSWARNA + ' me-2"></i>\
                                                    <div class="fw-600 text-body">' + detailRegional.NAMAREGIONAL + '</div>\
                                                </div>\
                                                <div class="fs-13px ms-4">' + numberFormat(detailRegional.TOTALTRANSAKSI) + ' Transaksi | Rp. ' + numberFormat(detailRegional.TOTALNOMINAL) + '</div>\
                                            </div>\
                                            <div class="fw-600 text-body">' + detailRegional.PERSENTASE + '%</div>\
                                        </div>';
            grandTotalTransaksi +=  parseInt(detailRegional.TOTALTRANSAKSI);
            grandTotalNominal   +=  parseInt(detailRegional.TOTALNOMINAL);
        });
    } else {
        rowRekapPerRegional =   defaultEmptyCardContent;
    }

    progressBarRegional.html(progressBarChild);
    totalTransaksiNominal.html(grandTotalTransaksi + ' Sales Order | Rp. ' + numberFormat(grandTotalNominal));
    rekapitulasiPerRegional.html(rowRekapPerRegional).addClass('mb-' + rekapRegionalMargin);
}

function renderProdukBestSeller(dataProdukBestSeller, urlAssetCustomerProduk) {
    let rowBestSellerProduk = '';
    bestSellerBarangContent.empty();

    if (dataProdukBestSeller && dataProdukBestSeller.length > 0) {
        $.each(dataProdukBestSeller, function (index, detailBestSeller) {
            rowBestSellerProduk += '<div class="d-flex align-items-center mb-3">\
                                        <div class="d-flex align-items-center justify-content-center me-3 w-100px h-50px bg-white p-3px rounded">\
                                            <img src="' + urlAssetCustomerProduk + detailBestSeller.IMAGE +'" alt="" class="ms-100 mh-100">\
                                        </div>\
                                        <div class="flex-grow-1">\
                                            <div>\
                                                <div class="text-body fw-600">[' + detailBestSeller.NAMAKATEGORI + '] ' + detailBestSeller.NAMAMERK + ' - ' + detailBestSeller.NAMAPRODUK + '</div>\
                                                <div class="fs-13px">Total Penjualan Rp. ' + numberFormat(detailBestSeller.NOMINALTOTAL) + '</div>\
                                            </div>\
                                        </div>\
                                        <div class="ps-3 text-center">\
                                            <div class="text-body fw-600">' + numberFormat(detailBestSeller.JUMLAHBARANG) + '</div>\
                                            <div class="fs-13px">Pcs</div>\
                                        </div>\
                                    </div>';
        });
    } else {
        rowBestSellerProduk = defaultEmptyCardContent;
    }

    produkBestSeller.html(rowBestSellerProduk);
}

function renderRiwayatTransaksi(dataRiwayatTransaksi) {
    let rowRiwayatTransaksi =   '';
    daftarRiwayat.empty();

    if (dataRiwayatTransaksi && dataRiwayatTransaksi.length > 0) {
        $.each(dataRiwayatTransaksi, function (index, detailTransaksi) {
            let badgeStatus =   '<span class="badge bg-' + detailTransaksi.COLORCLASSBS + ' bg-opacity-20 text-' + detailTransaksi.COLORCLASSBS + '">' + detailTransaksi.STATUSTRANSAKSI + '</span>';

            rowRiwayatTransaksi +=  '<tr>\
                                        <td class="sticky-col-left">\
                                            <div class="fw-600 text-body">' + detailTransaksi.NAMA + '</div>\
                                            <div class="fs-13px">' + detailTransaksi.EMAIL + '</div>\
                                            <div class="fs-13px">' + detailTransaksi.NOMORHP + '</div>\
                                        </td>\
                                        <td>\
                                            ' + badgeStatus + '\
                                            <div class="fw-600 text-body">' + detailTransaksi.NOMORTRANSAKSI + '</div>\
                                            <div class="fs-13px">' + detailTransaksi.INPUTTANGGALWAKTU + '</div>\
                                            <div class="fs-13px">' + detailTransaksi.NAMAREGIONAL + '</div>\
                                        </td>\
                                        <td>\
                                            <dl class="row mb-0 fs-13px">\
                                                <dt class="col-sm-6">Harga Barang</dt>\
                                                <dd class="col-sm-6 mb-0 text-end">' + numberFormat(detailTransaksi.TOTALNOMINALBARANG) + '</dd>\
                                                <dt class="col-sm-6">Ongkos Kirim</dt>\
                                                <dd class="col-sm-6 mb-0 text-end">' + numberFormat(detailTransaksi.TOTALNOMINALONGKIR) + '</dd>\
                                                <dt class="col-sm-6">Potongan</dt>\
                                                <dd class="col-sm-6 mb-0 text-end">-' + numberFormat(detailTransaksi.TOTALNOMINALDISKON) + '</dd>\
                                                <dt class="col-sm-6">Total Bayar</dt>\
                                                <dd class="col-sm-6 mb-0 text-end"><b>' + numberFormat(detailTransaksi.TOTALNOMINALBAYAR) + '</b></dd>\
                                            </dl>\
                                        </td>\
                                    </tr>';
        });
    } else {
        rowRiwayatTransaksi = '<tr><td colspan="3">' + defaultEmptyCardContent + '</td></tr>';
    }

    daftarRiwayat.html(rowRiwayatTransaksi);
}

statistikTransaksiFunc();
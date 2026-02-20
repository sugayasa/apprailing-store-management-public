var grafikPenjualanCanvas           =   $('#grafikPenjualanCanvas'),
    statistikPerMerkContent         =   $('#statistikPerMerkContent'),
    statistikPerMarketplaceContent  =   $('#statistikPerMarketplaceContent'),
    statistikPerRegionalContent     =   $('#statistikPerRegionalContent'),
    bestSellerBarangContent         =   $('#bestSellerBarangContent'),
    historiSalesOrderContent        =   $('#historiSalesOrderContent'),
    totalSalesOrderNominal          =   $('#totalSalesOrderNominal'),
    progressBarStatistikRegional    =   $('#progressBarStatistikRegional'),
    defaultEmptyCardContent         =   '<div class="text-center py-4">\
                                            <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                            <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                        </div>';
if (dashboardFunc == null) {
    var dashboardFunc = function () {
        $(document).ready(function () {
            statistikPerMerkContent.html(defaultEmptyCardContent);
            statistikPerMarketplaceContent.html(defaultEmptyCardContent);
            statistikPerRegionalContent.html(defaultEmptyCardContent);
            totalSalesOrderNominal.html('-');
            progressBarStatistikRegional.html('<div class="progress-bar bg-gray" style="width: 100%"></div>');
            getDataDashboard();
        });
    }
}

function getDataDashboard() {
    let dataSend = {};

    $.ajax({
        type: 'POST',
        url: baseURL + "dashboard/getDataDashboard",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true },
        headers: {Authorization: 'Bearer ' + getUserToken()},
        beforeSend: function () {
            Pace.start();
            grafikPenjualanCanvas.html(loaderElem);
            statistikPerMerkContent.html(loaderElem);
            statistikPerMarketplaceContent.html(loaderElem);
            statistikPerRegionalContent.html(loaderElem);
            bestSellerBarangContent.html(loaderElem);
            historiSalesOrderContent.html('<tr><td colspan="3">'+loaderElem+'</td></tr>');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let arrTanggalPeriode = responseJSON.arrTanggalPeriode,
                        dataGrafikPenjualan = responseJSON.dataGrafikPenjualan,
                        dataStatistikMerk = responseJSON.dataStatistikMerk,
                        dataStatistikMarketplace = responseJSON.dataStatistikMarketplace,
                        statistikRegionalMarginBottom = responseJSON.statistikRegionalMarginBottom,
                        dataStatistikRegional = responseJSON.dataStatistikRegional,
                        dataBarangBestSeller = responseJSON.dataBarangBestSeller,
                        dataHistoriSalesOrder = responseJSON.dataHistoriSalesOrder,
                        urlAssetLogoMerk = responseJSON.urlAssetLogoMerk,
                        urlAssetLogoMarketplace = responseJSON.urlAssetLogoMarketplace,
                        urlAssetFotoBarang = responseJSON.urlAssetFotoBarang;

                    generateChartPenjualan(arrTanggalPeriode, dataGrafikPenjualan);
                    renderStatistikMerk(dataStatistikMerk, urlAssetLogoMerk);
                    renderStatistikMarketplace(dataStatistikMarketplace, urlAssetLogoMarketplace);
                    renderStatistikRegional(dataStatistikRegional, statistikRegionalMarginBottom);
                    renderBarangBestSeller(dataBarangBestSeller, urlAssetFotoBarang);
                    renderHistoriSalesOrder(dataHistoriSalesOrder, urlAssetLogoMarketplace);
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

function renderStatistikMerk(dataStatistikMerk, urlAssetLogoMerk) {
    let cardStatistikPerMerk = '';
    statistikPerMerkContent.empty();

    if(dataStatistikMerk && dataStatistikMerk.length > 0){
        $.each(dataStatistikMerk, function (index, detailMerk) {
            cardStatistikPerMerk += '<div class="d-flex align-items-justify mb-2">\
                                        <div class="w-120px h-30px">\
                                            <img src="'+ urlAssetLogoMerk + detailMerk.FILELOGO+'" alt="" class="ms-100 mh-100">\
                                        </div>\
                                        <div class="ms-3 flex-grow-1">\
                                            <div class="fw-600 text-body">' + detailMerk.TOTALSALESORDER + ' Sales Order</div>\
                                            <div class="fs-13px">Total Nominal : Rp. '+ numberFormat(detailMerk.TOTALNOMINAL) +'</div>\
                                        </div>\
                                    </div>';
        });
    } else {
        cardStatistikPerMerk =  defaultEmptyCardContent;
    }
    statistikPerMerkContent.html(cardStatistikPerMerk);
}

function renderStatistikMarketplace(dataStatistikMarketplace, urlAssetLogoMarketplace) {
    let cardStatistikPerMarketplace = '';
    statistikPerMarketplaceContent.empty();

    if (dataStatistikMarketplace && dataStatistikMarketplace.length > 0) {
        $.each(dataStatistikMarketplace, function (index, detailMarketplace) {
            cardStatistikPerMarketplace += '<div class="d-flex align-items-justify mb-2">\
                                        <div class="w-120px h-30px">\
                                            <img src="'+ urlAssetLogoMarketplace + detailMarketplace.FILELOGO + '" alt="" class="ms-100 mh-100">\
                                        </div>\
                                        <div class="ms-3 flex-grow-1">\
                                            <div class="fw-600 text-body">' + detailMarketplace.TOTALSALESORDER + ' Sales Order</div>\
                                            <div class="fs-13px">Total Nominal : Rp. '+ numberFormat(detailMarketplace.TOTALNOMINAL) + '</div>\
                                        </div>\
                                    </div>';
        });
    } else {
        cardStatistikPerMarketplace = defaultEmptyCardContent;
    }
    statistikPerMarketplaceContent.html(cardStatistikPerMarketplace);
}

function renderStatistikRegional(dataStatistikRegional, statistikRegionalMarginBottom) {
    let progressBarChild            =   '',
        cardStatistikPerRegional    =   '',
        grandTotalSalesOrder        =   0,
        grandTotalNominal           =   0;
    statistikPerRegionalContent.empty();

    if (dataStatistikRegional && dataStatistikRegional.length > 0) {
        $.each(dataStatistikRegional, function (index, detailRegional) {
            progressBarChild        +=  '<div class="progress-bar bg-' + detailRegional.CLASSWARNA + '" style="width: ' + detailRegional.PERSENTASE + '%"></div>';
            cardStatistikPerRegional+=  '<div class="d-flex align-items-center mb-2">\
                                            <div class="flex-grow-1">\
                                                <div class="d-flex align-items-center ps-1">\
                                                    <i class="fa fa-circle fs-9px fa-fw text-'+ detailRegional.CLASSWARNA + ' me-2"></i>\
                                                    <div class="fw-600 text-body">' + detailRegional.NAMAREGIONAL + '</div>\
                                                </div>\
                                                <div class="fs-13px ms-4">' + numberFormat(detailRegional.TOTALSALESORDER) + ' Sales Order | Rp. ' + numberFormat(detailRegional.TOTALNOMINAL) + '</div>\
                                            </div>\
                                            <div class="fw-600 text-body">' + detailRegional.PERSENTASE + '%</div>\
                                        </div>';
            grandTotalSalesOrder    +=  parseInt(detailRegional.TOTALSALESORDER);
            grandTotalNominal       +=  parseInt(detailRegional.TOTALNOMINAL);
        });
    } else {
        cardStatistikPerRegional = defaultEmptyCardContent;
    }

    progressBarStatistikRegional.html(progressBarChild);
    totalSalesOrderNominal.html(grandTotalSalesOrder + ' Sales Order | Rp. ' + numberFormat(grandTotalNominal));
    statistikPerRegionalContent.html(cardStatistikPerRegional).addClass('mb-' + statistikRegionalMarginBottom);
}

function renderBarangBestSeller(dataBarangBestSeller, urlAssetFotoBarang) {
    let rowBestSellerBarang = '';
    bestSellerBarangContent.empty();

    if (dataBarangBestSeller && dataBarangBestSeller.length > 0) {
        $.each(dataBarangBestSeller, function (index, detailBestSeller) {
            rowBestSellerBarang += '<div class="d-flex align-items-center mb-3">\
                                        <div class="d-flex align-items-center justify-content-center me-3 w-100px h-50px bg-white p-3px rounded">\
                                            <img src="' + urlAssetFotoBarang + detailBestSeller.IMAGE1 +'" alt="" class="ms-100 mh-100">\
                                        </div>\
                                        <div class="flex-grow-1">\
                                            <div>\
                                                <div class="text-body fw-600">[' + detailBestSeller.KATEGORIBARANG + '] ' + detailBestSeller.NAMAMERK + ' - ' + detailBestSeller.NAMAKODEBARANG + '</div>\
                                                <div class="fs-13px">Total Penjualan Rp. ' + numberFormat(detailBestSeller.HARGATOTAL) + '</div>\
                                            </div>\
                                        </div>\
                                        <div class="ps-3 text-center">\
                                            <div class="text-body fw-600">' + numberFormat(detailBestSeller.JUMLAHPCS) + '</div>\
                                            <div class="fs-13px">Pcs</div>\
                                        </div>\
                                    </div>';
        });
    } else {
        rowBestSellerBarang = defaultEmptyCardContent;
    }

    bestSellerBarangContent.html(rowBestSellerBarang);
}

function renderHistoriSalesOrder(dataHistoriSalesOrder, urlAssetLogoMarketplace) {
    let rowHistoriSalesOrder = '';
    historiSalesOrderContent.empty();

    if (dataHistoriSalesOrder && dataHistoriSalesOrder.length > 0) {
        $.each(dataHistoriSalesOrder, function (index, detailSalesOrder) {
            let badgeStatusSalesOrder = '';
            switch (parseInt(detailSalesOrder.STATUSPENAWARAN)) {
                case -1: badgeStatusSalesOrder = '<span class="badge bg-danger bg-opacity-20 text-danger" style="min-width: 60px;">Dibatalkan</span>'; break;
                case 0: badgeStatusSalesOrder = '<span class="badge bg-warning bg-opacity-20 text-warning" style="min-width: 60px;">Pengajuan</span>'; break;
                case 1: badgeStatusSalesOrder = '<span class="badge bg-primary bg-opacity-20 text-primary" style="min-width: 60px;">Disetujui</span>'; break;
                case 2: badgeStatusSalesOrder = '<span class="badge bg-success bg-opacity-20 text-success" style="min-width: 60px;">Diproses</span>'; break;
                default: badgeStatusSalesOrder = "-"; break;
            }

            rowHistoriSalesOrder += '<tr>\
                                        <td>\
                                            <div class="d-flex align-items-center">\
                                                <div class="w-40px h-40px">\
                                                    <img src="' + urlAssetLogoMarketplace + detailSalesOrder.FILELOGOSQUARE+'" alt="" class="ms-100 mh-100">\
                                                </div>\
                                                <div class="ms-3 flex-grow-1">\
                                                    <div class="fw-600 text-body">[' + detailSalesOrder.NAMAKOTA + '] ' + detailSalesOrder.NOMORTRANSAKSIMP + ' - ' + detailSalesOrder.NAMACUSTOMERMP + '</div>\
                                                    <div class="fw-600 text-body">[' + detailSalesOrder.NAMAEKSPEDISIMP + '] ' + detailSalesOrder.NOMORRESIMP + '</div>\
                                                    <div class="fs-13px">' + detailSalesOrder.TANGGALWAKTU + '</div>\
                                                </div>\
                                            </div>\
                                        </td>\
                                        <td class="text-center">'+ badgeStatusSalesOrder +'</td>\
                                        <td class="text-end pe-0">'+ numberFormat(detailSalesOrder.GRANDTOTALHARGA) +'</td>\
                                    </tr>';
        });
    } else {
        rowHistoriSalesOrder = '<tr><td colspan="3">' + defaultEmptyCardContent + '</td></tr>';
    }

    historiSalesOrderContent.html(rowHistoriSalesOrder);
}

function generateChartPenjualan(arrTanggalPeriode, dataGrafikPenjualan) {
    var ctx = document.getElementById('grafikPenjualanCanvas');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: arrTanggalPeriode,
            datasets: dataGrafikPenjualan,
            color:'#1daf31ff'
        }
    });
}

dashboardFunc();
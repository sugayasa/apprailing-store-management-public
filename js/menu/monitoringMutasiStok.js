var elemEmptyDataMonitoringMutasiStok ='<div class="mutasi-item mt-5 pb-3 mb-3">\
                                            <div class="alert alert-danger mb-0 mx-2" role="alert">\
                                                <i class="fa-solid fa-triangle-exclamation me-2"></i>\
                                                Tidak ada data yang ditemukan\
                                            </div>\
                                        </div>';
if (monitoringMutasiStokFunc == null) {
    var monitoringMutasiStokFunc = function () {
        $(document).ready(function () {
            getDataMonitoringMutasiStok();
        });
    }
}

function getDataMonitoringMutasiStok() {
    var dataSend= {};
    $.ajax({
        type: 'POST',
        url: baseURL + "monitoringMutasiStok/getDataMonitoringMutasiStok",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            $.each($('.cardRegionalMonitoringMutasi'), function (index, element) {
                $(element).html(loaderElem);
            });
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON= jqXHR.responseJSON,
                rows        = "";

            switch (jqXHR.status) {
                case 200:
                    let dataResult = responseJSON.dataResult;

                    $.each(dataResult, function (index, arrayResult) {
                        let idRegional      =   arrayResult.idRegional,
                            dataPerRegional =   arrayResult.dataPerRegional,
                            rows            = "";
                        
                        if (dataPerRegional.length > 0) {
                            $.each(dataPerRegional, function (index, arrayDataPerRegional) {
                                let classBadgeMutasi = 'bg-info',
                                    classIconMutasi = 'fa-repeat';
                                switch(arrayDataPerRegional.JENISMUTASI) {
                                    case 'Barang Masuk' :
                                        classBadgeMutasi= 'bg-success';
                                        classIconMutasi = 'fa-arrow-down';
                                        break;
                                    case 'Barang Keluar':
                                        classBadgeMutasi= 'bg-danger';
                                        classIconMutasi = 'fa-arrow-up';
                                        break;
                                }

                                rows += '<div class="mutasi-item border-bottom pb-3 mb-3">\
                                            <div class="d-flex align-items-start justify-content-between mb-2">\
                                                <small class="text-muted"><i class="fa fa-clock me-1"></i>'+arrayDataPerRegional.TANGGALWAKTUSTR+'</small>\
                                                <span class="badge '+classBadgeMutasi+'"><i class="fa '+classIconMutasi+' me-1"></i>'+arrayDataPerRegional.JENISMUTASI+'</span>\
                                            </div>\
                                            <h6 class="mb-1 fw-bold">'+arrayDataPerRegional.NAMABARANG+'</h6>\
                                            <div class="row g-2 mt-2">\
                                                <div class="col-3">\
                                                    <div class="d-flex align-items-center">\
                                                        <i class="fa-solid fa-warehouse text-info me-2"></i>\
                                                        <small class="text-muted d-block">Stok Awal</small>\
                                                    </div>\
                                                    <div class="d-flex align-items-center">\
                                                        <strong class="ms-4">'+numberFormat(arrayDataPerRegional.STOKAWAL)+'</strong>\
                                                    </div>\
                                                </div>\
                                                <div class="col-3">\
                                                    <div class="d-flex align-items-center">\
                                                        <i class="fa-solid fa-exchange text-primary me-2"></i>\
                                                        <small class="text-muted d-block">Mutasi</small>\
                                                    </div>\
                                                    <div class="d-flex align-items-center">\
                                                        <strong class="ms-4">'+numberFormat(arrayDataPerRegional.STOKMUTASI)+'</strong>\
                                                    </div>\
                                                </div>\
                                                <div class="col-3">\
                                                    <div class="d-flex align-items-center">\
                                                        <i class="fa-solid fa-lock text-warning me-2"></i>\
                                                        <small class="text-muted d-block">Stok Ditahan</small>\
                                                    </div>\
                                                    <div class="d-flex align-items-center">\
                                                        <strong class="ms-4">'+numberFormat(arrayDataPerRegional.STOKDITAHAN)+'</strong>\
                                                    </div>\
                                                </div>\
                                                <div class="col-3">\
                                                    <div class="d-flex align-items-center">\
                                                        <i class="fa-solid fa-check-to-slot text-success me-2"></i>\
                                                        <small class="text-muted d-block">Stok Tersedia</small>\
                                                    </div>\
                                                    <div class="d-flex align-items-center">\
                                                        <strong class="ms-4">'+numberFormat(arrayDataPerRegional.STOKTERSEDIA)+'</strong>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>';
                            });
                        } else {
                            rows = elemEmptyDataMonitoringMutasiStok;
                        }
                        $('.cardRegionalMonitoringMutasi[data-idRegional="' + idRegional + '"]').html(rows);
                    });
                    break;
                case 404:
                default:
                    $('.cardRegionalMonitoringMutasi').html(elemEmptyDataMonitoringMutasiStok);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

monitoringMutasiStokFunc();
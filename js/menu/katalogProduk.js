var katalogProdukContent    =   $('#katalogProdukContent'),
    defaultEmptyContent     =   '<div class="text-center py-4">\
                                    <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                    <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                </div>';
if (katalogProdukFunc == null) {
    var katalogProdukFunc = function () {
        $(document).ready(function () {
            setOptionHelper('filterKatalogProduk-optionMerk', 'dataMerk');
            setOptionHelper('filterKatalogProduk-optionKategori', 'dataBarangKategori');
            getDataKatalogProduk();
        });
    }
}

$('#filterKatalogProduk-optionMerk, #filterKatalogProduk-optionKategori, #filterKatalogProduk-optionUrutBerdasar, #filterKatalogProduk-optionJenisUrutan').off('change');
$('#filterKatalogProduk-optionMerk, #filterKatalogProduk-optionKategori, #filterKatalogProduk-optionUrutBerdasar, #filterKatalogProduk-optionJenisUrutan').on('change', function (e) {
    getDataKatalogProduk();
});

$('#filterKatalogProduk-keywordCariBarang').off('keypress');
$("#filterKatalogProduk-keywordCariBarang").on('keypress', function (e) {
    if (e.which == 13) {
        getDataKatalogProduk();
    }
});

function getDataKatalogProduk() {
    var merk            =   $('#filterKatalogProduk-optionMerk').val(),
        kategori        =   $('#filterKatalogProduk-optionKategori').val(),
        urutBerdasar    =   $('#filterKatalogProduk-optionUrutBerdasar').val(),
        jenisUrutan     =   $('#filterKatalogProduk-optionJenisUrutan').val(),
        keywordCari     =   $('#filterKatalogProduk-keywordCariBarang').val(),
        dataSend        = {
            merk: merk,
            kategori: kategori,
            urutBerdasar: urutBerdasar,
            jenisUrutan: jenisUrutan,
            keywordCari: keywordCari
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "katalogProduk/getDataKatalogProduk",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            katalogProdukContent.html(loaderElem);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    let listData = responseJSON.listData,
                        urlAssetFotoBarang = responseJSON.urlAssetFotoBarang;

                    $.each(listData, function (index, arrayData) {
                        let dataStokBarang  =   arrayData.STOKBARANG,
                            dataStokRegional=   '';
                        
                        $.each(dataStokBarang, function (index, arrayDataStok) {
                            dataStokRegional +=   '<div class="d-flex justify-content-between mb-1"><span>' + arrayDataStok.NAMAREGIONAL + '</span> <span class="badge bg-primary">' + numberFormat(arrayDataStok.STOKBARANG) + '</span></div>';
                        });

                        rows += '<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 pb-3">\
                                    <div class="pos-product">\
                                        <div class="img" style="background-image: url(' + urlAssetFotoBarang + arrayData.IMAGE1 +')"></div>\
                                        <div class="info">\
                                            <div class="title text-truncate">' + arrayData.NAMAKODEBARANG +'</div>\
                                            <div class="desc text-truncate">' + arrayData.KATEGORIBARANG +'</div>\
                                            <div class="price">Rp ' + numberFormat(arrayData.HARGA) +'</div>\
                                            <div class="stok-regional mt-2">\
                                                <div class="regional-list">' + dataStokRegional + '</div>\
                                            </div>\
                                            <div class="mt-3">\
                                                <span class="btn btn-theme fw-semibold d-block mb-2">Detail</span>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';
                    });
                    break;
                case 404:
                default:
                    rows = '<li class="text-center">' +
                        '<div class="alert alert-warning mb-0 mx-2" role="alert">' +
                        '<i class="ri-error-warning-line me-2"></i>' +
                        'No data found' +
                        '</div>' +
                        '</li>';
                    break;
            }

            katalogProdukContent.html(rows);
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

katalogProdukFunc();
var baseURLPath         =   baseURL + "customer/produk/katalog/",
    currentPageNumber   =   1,
    totalPageNumber     =   1,
    containerContent    =   $('#customerProdukKatalog-content');

if (customerProdukKatalogFunc == null) {
    var customerProdukKatalogFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerProdukKatalog-content',
                ['customerProdukKatalog-header', 'customerProdukKatalog-hr', 'customerProdukKatalog-filter']
            );

            setOptionHelper('customerProdukKatalog-optionMerk', 'dataCustomerMerk');
            setOptionHelper('customerProdukKatalog-optionKategori', 'dataCustomerKategori');

            containerContent.on('scroll', function() {
                var el = this;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
                    if(currentPageNumber < totalPageNumber){
                        currentPageNumber++;
                        getDataProdukKatalog(currentPageNumber);
                    }
                }
            });

            getDataProdukKatalog();
        });
    }
}

$('#customerProdukKatalog-optionMerk, #customerProdukKatalog-optionKategori, #customerProdukKatalog-optionUrutBerdasar, #customerProdukKatalog-optionJenisUrutan').off('change');
$('#customerProdukKatalog-optionMerk, #customerProdukKatalog-optionKategori, #customerProdukKatalog-optionUrutBerdasar, #customerProdukKatalog-optionJenisUrutan').on('change', function (e) {
    getDataProdukKatalog();
});

$('#customerProdukKatalog-keywordCariProduk').off('keypress');
$("#customerProdukKatalog-keywordCariProduk").on('keypress', function (e) {
    if (e.which == 13) {
        getDataProdukKatalog();
    }
});

function getDataProdukKatalog(pageNumber = 1) {
    var merk            =   $('#customerProdukKatalog-optionMerk').val(),
        kategori        =   $('#customerProdukKatalog-optionKategori').val(),
        urutBerdasar    =   $('#customerProdukKatalog-optionUrutBerdasar').val(),
        jenisUrutan     =   $('#customerProdukKatalog-optionJenisUrutan').val(),
        keywordCari     =   $('#customerProdukKatalog-keywordCariProduk').val(),
        dataSend        = {
            pageNumber:pageNumber,
            merk: merk,
            kategori: kategori,
            urutBerdasar: urutBerdasar,
            jenisUrutan: jenisUrutan,
            keywordCari: keywordCari
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
            if(pageNumber == 1) containerContent.html(loaderElem);
            if(pageNumber != 1) containerContent.append(loaderElem);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData,
                        pageProperty=   responseJSON.pageProperty;

                    totalPageNumber =   pageProperty.pageTotal;

                    $.each(listData, function (index, arrayData) {
                        let image1Produk    =   imageProdukBaseUrl + (JSON.parse(arrayData.ARRIMAGE)[0]) ?? imageProdukDefault;
                        rows += '<div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 pb-3">\
                                    <div class="pos-product">\
                                        <div class="img" style="background-image: url(' + image1Produk +')"></div>\
                                        <div class="info">\
                                            <div class="title text-truncate">' + arrayData.NAMAPRODUK +'</div>\
                                            <div class="desc text-truncate">' + arrayData.NAMAMERK + ' - '+ arrayData.NAMAKATEGORI +'</div>\
                                            <div class="desc text-truncate">' + arrayData.DESKRIPSI +'</div>\
                                            <div class="price">Rp ' + numberFormat(arrayData.HARGAJUAL) +'</div>\
                                            <div class="mt-3">\
                                                <span class="btn btn-theme fw-semibold d-block mb-0">Detail</span>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<li class="text-center">\
                                    <div class="alert alert-warning mb-0 mx-2" role="alert">\
                                        <i class="ri-error-warning-line me-2"></i>\
                                       '+getMessageResponse(jqXHR)+'\
                                    </div>\
                                </li>';
                    break;
            }

            if(pageNumber == 1) containerContent.html(rows);
            if(pageNumber != 1) containerContent.append(rows);
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        $("#loaderElem").remove();
    });
}

customerProdukKatalogFunc();
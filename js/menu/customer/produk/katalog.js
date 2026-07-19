var baseURLPath         =   baseURL + "customer/produk/katalog/",
    currentPageNumber   =   1,
    totalPageNumber     =   1,
    containerContent    =   $('#customerProdukKatalog-content'),
    containerFotoProduk =   $('#customerProdukKatalog-fotoProdukContainer'),
    defaultEmptyImage   =   '<div id="fotoProdukDefault" class="bg-light rounded d-flex align-items-center justify-content-center mx-auto mb-2" style="max-width:300px;height:150px;">\
                                <i class="fa fa-image fa-4x text-secondary"></i>\
                            </div>';

if (customerProdukKatalogFunc == null) {
    var customerProdukKatalogFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerProdukKatalog-content',
                ['customerProdukKatalog-header', 'customerProdukKatalog-hr', 'customerProdukKatalog-filter']
            );

            setOptionHelper('customerProdukKatalog-optionMerk', 'dataCustomerMerk');
            setOptionHelper('customerProdukKatalog-optionKategori', 'dataCustomerKategori');

            setOptionHelper('optionMerk', 'dataCustomerMerk');
            setOptionHelper('optionKategori', 'dataCustomerKategori');

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

            $('#btnAddProduk').on('click', function() {
                containerFotoProduk.html(defaultEmptyImage);
                $('input[name="arrFotoProdukFileName"]').val('[]');
                $('input[name="namaProduk"]').val('');
                $('#optionMerk').val($('#optionMerk option:first').val());
                $('#optionKategori').val($('#optionKategori option:first').val());
                $('input[name="produkPadanan"]').val('');
                $('input[name="hargaJual"]').val(0);
                $('input[name="status"][value="1"]').prop('checked', true);
                $('.summernote').val('');
                $('input[name="idProduk"]').val('');
                $('input[name="idProdukPadanan"]').val('');
                
                toggleSlideContainerProduk();
                toggleDisplayTopButton(false);
                createUploaderFotoProduk();
                activateOnFocusInputProdukPadanan();
                generateSummernoteDeskripsi();
                activateOnSubmitFormEditor();
            });

            $('#btnBatalEditor').on('click', function() {
                toggleSlideContainerProduk();
                toggleDisplayTopButton(true);
            });

            $(document).on('click', '.btn-hapus-foto', function() {
                let $item   =   $(this).closest('.foto-produk-item');
                let fileName=   $item.data('file-name');

                let arrFotoProdukFileName   =   JSON.parse($('input[name="arrFotoProdukFileName"]').val()) || [];
                arrFotoProdukFileName = arrFotoProdukFileName.filter(function(name) {
                    return name !== fileName;
                });
                
                $item.remove();
                $('input[name="arrFotoProdukFileName"]').val(JSON.stringify(arrFotoProdukFileName));
                if (containerFotoProduk.find('.foto-produk-item').length === 0) {
                    containerFotoProduk.html(defaultEmptyImage);
                }
            });
        });
    }
}

function toggleSlideContainerProduk() {
    toggleSlideContainer('customerProdukKatalog-leftContainer', 'customerProdukKatalog-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnAddProduk').removeClass('d-none');
        $('#btnBatalEditor').addClass('d-none');
    } else {
        $('#btnAddProduk').addClass('d-none');
        $('#btnBatalEditor').removeClass('d-none');
    }
}

function createUploaderFotoProduk() {
    createUploadFileInput("uploadFotoProduk", baseURLPath+"uploadFotoProduk", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        containerFotoProduk.append(
            '<div class="position-relative d-inline-block me-2 mb-2 foto-produk-item" data-file-name="'+responseJSON.fileName+'">\
                <img class="rounded" \
                    src="'+responseJSON.urlImage+'" \
                    style="max-width: 400px; max-height: 150px;"\
                />\
                <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle btn-hapus-foto" style="width:24px;height:24px;padding:0;line-height:1;">\
                    <i class="fa fa-times"></i>\
                </button>\
            </div>'
        );
        containerFotoProduk.find('#fotoProdukDefault').remove();

        let arrFotoProdukFileName   =   JSON.parse($('input[name="arrFotoProdukFileName"]').val()) ?? [];
        arrFotoProdukFileName.push(responseJSON.fileName);
        $('input[name="arrFotoProdukFileName"]').val(JSON.stringify(arrFotoProdukFileName));
    });
}

function activateOnFocusInputProdukPadanan() {
    $('#produkPadanan, #icon-produkPadanan').off('focus');
    $('#produkPadanan, #icon-produkPadanan').on('focus', function() {
        let currentIdProdukPadanan  =   $('input[name="idProdukPadanan"]').val();
        let tableBody    =   $('#customerProdukKatalog-modalBarangPadanan tbody');
        $.ajax({
            type: 'POST',
            url: baseURLPath + "getDataProdukPadanan",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend({}),
            xhrFields: {withCredentials: true},
            headers: {Authorization: "Bearer " + getUserToken()},
            beforeSend: function () {
                Pace.start();
                toggleWindowLoader(true);
                $('#modalBarangPadanan-namaProduk').off('keyup');
                $('button[name="modalBarangPadanan-btnSetBarang"]').addClass('disabled').prop('disabled', true);
                tableBody.html('<tr><td colspan="2" class="text-center py-4">Tidak ada data yang ditampilkan</td></tr>');
            },
            complete: function (jqXHR, textStatus) {
                if (jqXHR.status === 200) {
                    let responseJSON=   jqXHR.responseJSON,
                        dataBarang  =   responseJSON.dataBarang,
                        rows        =  '';

                    $.each(dataBarang, function (index, arrayData) {
                        let idBarang        =   arrayData.IDBARANG,
                            classSelected   =   (idBarang == currentIdProdukPadanan) ? 'class="table-selected-row"' : '';
                        if (idBarang == currentIdProdukPadanan) {
                            $('#modalBarangPadanan-namaProdukTerpilih').html(arrayData.NAMAKODEBARANG);
                            $('input[name="modalBarangPadanan-idProdukPadanan"]').val(idBarang);
                            $('button[name="modalBarangPadanan-btnSetBarang"]').removeClass('disabled').prop('disabled', false);
                        }

                        rows    +=  '<tr data-idBarang="' + idBarang + '" ' + classSelected + '>\
                                        <td class="text-break">' + arrayData.NAMAMERK + '</td>\
                                        <td class="text-break">' + arrayData.NAMAKODEBARANG + '</td>\
                                    </tr>';
                    });

                    tableBody.html(rows);
                    $('#customerProdukKatalog-modalBarangPadanan').modal('show');
                    $('#modalBarangPadanan-namaProduk').on('keyup', function () {
                        let keyword =   $(this).val().toLowerCase();
                        tableBody.find('tr').each(function () {
                            let namaMerk    =   $(this).find('td:nth-child(1)').text().toLowerCase(),
                                namaProduk  =   $(this).find('td:nth-child(2)').text().toLowerCase();
                            $(this).toggle(namaProduk.indexOf(keyword) !== -1 || namaMerk.indexOf(keyword) !== -1);
                        });
                    });

                    tableBody.find('tr').off('click');
                    tableBody.find('tr').on('click', function () {
                        let idBarang    =   $(this).data('idbarang'),
                            namaProduk  =   $(this).find('td:nth-child(2)').text();
                        $('#modalBarangPadanan-namaProdukTerpilih').html(namaProduk);
                        $('input[name="modalBarangPadanan-idProdukPadanan"]').val(idBarang);
                        $('button[name="modalBarangPadanan-btnSetBarang"]').removeClass('disabled').prop('disabled', false);
                        tableBody.find('tr').removeClass('table-selected-row');
                        $(this).addClass('table-selected-row');

                        $('button[name="modalBarangPadanan-btnSetBarang"]').off('click');
                        $('button[name="modalBarangPadanan-btnSetBarang"]').on('click', function () {
                            let idProdukPadanan    =   $('input[name="modalBarangPadanan-idProdukPadanan"]').val();
                            $('#produkPadanan').val(namaProduk);
                            $('input[name="idProdukPadanan"]').val(idProdukPadanan);
                            $('#customerProdukKatalog-modalBarangPadanan').modal('hide');
                        });
                    });
                } else {
                    generateWarningMessageResponse(jqXHR);
                }
            }
        }).always(function (jqXHR, textStatus) {
            Pace.stop();
            setUserToken(jqXHR);
            toggleWindowLoader(false);
        });
    });
}

var generateSummernoteDeskripsi    =   function() {
    $('.summernote').summernote('destroy');
    $('.summernote').summernote({
        height: 294
    });
};

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
            if(pageNumber != 1) containerContent.append(loaderElem);
            if(pageNumber == 1) {
                currentPageNumber   =   1;
                containerContent.html(loaderElem);
            }
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
                                            <div class="text-truncate mb-1">' + arrayData.NAMAMERK + ' - '+ arrayData.NAMAKATEGORI +'</div>\
                                            <div class="desc text-truncate">' + arrayData.DESKRIPSI +'</div>\
                                            <div class="price">Rp ' + numberFormat(arrayData.HARGAJUAL) +'</div>\
                                            <div class="mt-3">\
                                                <span class="btn btn-theme btn-detail fw-semibold d-block mb-0" data-id="' + arrayData.IDPRODUK + '">Detail</span>\
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
            activateOnClickBtnDetail();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        $("#loaderElem").remove();
    });
}

function activateOnClickBtnDetail() {
    $('.btn-detail').off('click');
    $('.btn-detail').on('click', function() {
        let idProduk    =   $(this).data('id'),
            dataSend    =   {
                idProduk:idProduk
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
                switch (jqXHR.status) {
                    case 200:
                        let responseJSON=   jqXHR.responseJSON,
                            dataDetail  =   responseJSON.dataDetail,
                            baseURLImage=   responseJSON.baseURLImageProduk;

                        $('input[name="arrFotoProdukFileName"]').val(dataDetail.ARRIMAGE);
                        $('input[name="namaProduk"]').val(dataDetail.NAMAPRODUK);
                        $('select[name="optionMerk"]').val(dataDetail.IDMERK);
                        $('select[name="optionKategori"]').val(dataDetail.IDKATEGORI);
                        $('input[name="produkPadanan"]').val(dataDetail.NAMABARANG);
                        $('input[name="hargaJual"]').val(numberFormat(dataDetail.HARGAJUAL));
                        $('input[name="status"][value="' + parseInt(dataDetail.STATUS) + '"]').prop('checked', true);
                        $('.summernote').val(dataDetail.DESKRIPSI);
                        $('input[name="idProduk"]').val(idProduk);
                        $('input[name="idProdukPadanan"]').val(dataDetail.IDBARANG);

                        if (dataDetail.ARRIMAGE.length > 0) {
                            containerFotoProduk.html('');
                            let arrFotoProdukFileName   =   JSON.parse(dataDetail.ARRIMAGE) ?? [];
                            $.each(arrFotoProdukFileName, function (index, fileName) {
                                containerFotoProduk.append(
                                    '<div class="position-relative d-inline-block me-2 mb-2 foto-produk-item" data-file-name="'+fileName+'">\
                                        <img class="rounded" \
                                            src="'+baseURLImage+fileName+'" \
                                            style="max-width: 400px; max-height: 150px;"\
                                        />\
                                        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle btn-hapus-foto" style="width:24px;height:24px;padding:0;line-height:1;">\
                                            <i class="fa fa-times"></i>\
                                        </button>\
                                    </div>'
                                );
                            });
                        } else {
                            containerFotoProduk.html(defaultEmptyImage);
                        }
                        
                        toggleSlideContainerProduk();
                        toggleDisplayTopButton(false);
                        createUploaderFotoProduk();
                        activateOnFocusInputProdukPadanan();
                        generateSummernoteDeskripsi();
                        activateOnSubmitFormEditor();
                        break;
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            toggleWindowLoader(false);
            setUserToken(jqXHR);
            Pace.stop();
        });
    });
}

function activateOnSubmitFormEditor() {
    $('#btnSimpanProduk').off('click');
    $('#btnSimpanProduk').on('click', function(e) {
        e.preventDefault();
        let formData    =   $("#customerProdukKatalog-rightContainer :input").serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            switch (field.name) {
                case 'arrFotoProdukFileName':   dataSend[field.name]  =   JSON.parse(field.value); break;
                case 'deskripsi'            :   dataSend[field.name]  =   $('.summernote').summernote('code'); break;
                case 'hargaJual'            :   dataSend[field.name]  =   field.value.replace(/[^\d]/g, ''); break;
                default                     :   dataSend[field.name]  =   field.value; break;
            }
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveData",
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
                switch (jqXHR.status) {
                    case 200:
                        toastMessage("success", getMessageResponse(jqXHR));
                        toggleSlideContainerProduk();
                        toggleDisplayTopButton(true);
                        getDataProdukKatalog();
                        break;
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            toggleWindowLoader(false);
            setUserToken(jqXHR);
            Pace.stop();
        });
    });
}

customerProdukKatalogFunc();
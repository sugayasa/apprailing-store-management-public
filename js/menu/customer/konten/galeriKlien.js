var baseURLPath         =   baseURL + "customer/konten/galeriKlien/",
    currentPageNumber   =   1,
    totalPageNumber     =   1,
    containerContent    =   $('#customerKontenGaleriKlien-content'),
    modalEditorKlien    =   $('#customerKontenGaleriKlien-editorKlien'),
    modalEditorGaleri   =   $('#customerKontenGaleriKlien-editorGaleri');

if (customerKontenGaleriKlienFunc == null) {
    var customerKontenGaleriKlienFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenGaleriKlien-content',
                ['customerKontenGaleriKlien-header', 'customerKontenGaleriKlien-hr']
            );

            $('#btnAddKlien').on('click', function() {
                modalEditorKlien
                .find('input[name="idKlien"]').val('').end()
                .find('input[name="namaKlien"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="logoFileName"]').val('').end();
                
                modalEditorKlien.find("#galeriKlienLogo").removeAttr('src').attr("src", imageGaleriKlienLogoDefault);
                modalEditorKlien.modal('show');
                modalEditorKlien.one('shown.bs.modal', function() {
                    createUploaderLogoKlien();
                });
                activateOnSubmitFormEditorKlien();
            });

            containerContent.on('scroll', function() {
                var el = this;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
                    if(currentPageNumber < totalPageNumber){
                        currentPageNumber++;
                        getCustomerKontenGaleriKlien(currentPageNumber);
                    }
                }
            });

            setOptionHelper('idMerkUtama', 'dataCustomerMerk');
            getCustomerKontenGaleriKlien();
        });
    }
}

function getCustomerKontenGaleriKlien(pageNumber = 1) {
    let dataSend=   {
        pageNumber:pageNumber,
        dataPerPage:3
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
                        pageProperty=   responseJSON.pageProperty

                    totalPageNumber =   pageProperty.pageTotal;
                    $.each(listData, function (indexData, arrayData) {
                        let classGaleri     =   (indexData == 0) ? '' : 'mt-4 pt-4',
                            detailGaleri    =   arrayData.DETAILGALERI,
                            listGaleri      =   '',
                            dataAttrKlien   =   'data-id="'+arrayData.IDKLIEN+'" \
                                                data-nama-klien="'+arrayData.NAMAKLIEN+'" \
                                                data-logo-file-name="'+arrayData.LOGO+'" \
                                                data-status="'+arrayData.STATUS+'"';

                        if(detailGaleri && detailGaleri.length > 0){
                            listGaleri  +=  '<div class="gallery-image">\
                                                <ul class="gallery-image-list">';

                            $.each(detailGaleri, function(indexGaleri, dataGaleri){
                                let imageGaleri     =   JSON.parse(dataGaleri.IMAGE)[0],
                                    dataAttrGaleri  =   'data-id-klien="'+arrayData.IDKLIEN+'" \
                                                        data-id-galeri-klien="'+dataGaleri.IDGALERIKLIEN+'" \
                                                        data-id-merk-utama="'+dataGaleri.IDMERKUTAMA+'" \
                                                        data-deskripsi="'+dataGaleri.DESKRIPSI+'" \
                                                        data-image-file-name="'+imageGaleri+'"';
                                listGaleri          +=  '<li class="gallery-image-item" '+dataAttrGaleri+'>\
                                                            <a data-pswp-src="'+imageGaleriKlienUrl+imageGaleri+'" data-pswp-width="752" data-pswp-height="502">\
                                                                <div class="gallery-image-floating">\
                                                                    <div class="gallery-image-floating-logo rounded-circle">\
                                                                        <img src="'+imageLogoMerkUrl+dataGaleri.LOGOMERK+'" alt="'+dataGaleri.NAMAMERK+'">\
                                                                    </div>\
                                                                    <div class="gallery-image-floating-text">\
                                                                        <span class="gallery-image-floating-merk">'+dataGaleri.NAMAMERK+'</span>\
                                                                        <span class="gallery-image-floating-desc">'+dataGaleri.DESKRIPSI+'</span>\
                                                                    </div>\
                                                                </div>\
                                                                <img src="'+imageGaleriKlienUrl+imageGaleri+'" alt="Wedding Image 1" class="img-portrait">\
                                                            </a>\
                                                        </li>';
                            });

                            listGaleri  +=  '</ul>\
                                            </div>';
                        } else {
                            listGaleri += '<div class="gallery-image-empty text-center py-4">\
                                                <div class="mb-2">\
                                                    <i class="fa fa-image fa-3x text-muted"></i>\
                                                </div>\
                                                <p class="text-muted mb-2">Belum ada galeri proyek untuk klien ini.</p>\
                                            </div>';
                        }

                        rows    +=  '<div class="gallery p-0 '+classGaleri+'">\
                                        <div class="d-flex align-items-center mb-3">\
                                            <div role="button" class="gallery-title mb-0" '+dataAttrKlien+'>\
                                                <img class="mb-2" style="max-width: 200px; max-height: 40px;" src="'+imageGaleriKlienLogoUrl+arrayData.LOGO+'" alt="'+arrayData.NAMAKLIEN+'"><br/>\
                                                '+arrayData.NAMAKLIEN+' <i class="fa fa-chevron-right"></i> \
                                            </div>\
                                            <button type="button" class="btn btn-outline-info ms-auto btnAdd-galeri-image" data-id-klien="'+arrayData.IDKLIEN+'">\
                                                <i class="fa fa-plus me-1"></i> Galeri\
                                            </button>\
                                        </div>\
                                        '+listGaleri+'\
                                    </div>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<div class="text-center">\
                                    <div class="alert alert-danger mb-0 mx-2" role="alert">\
                                        <div class="mb-4">\
                                            <i class="fa fa-image fa-3x text-muted"></i>\
                                        </div>\
                                        <i class="ri-error-danger-line me-2"></i>\
                                        '+getMessageResponse(jqXHR)+'\
                                    </div>\
                                </div>';
                    break;
            }

            if(pageNumber == 1) containerContent.html(rows);
            if(pageNumber != 1) containerContent.append(rows);
            activateOnClickKlien();
            activateOnClickAddGaleriImage();
            activateOnClickGaleriImageItem();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        $("#loaderElem").remove();
    });
}

function activateOnClickKlien() {
    $('.gallery-title').off('click');
    $('.gallery-title').on('click', function() {
        let idKlien     =   $(this).data('id'),
            namaKlien   =   $(this).data('nama-klien'),
            logoFileName=   $(this).data('logo-file-name'),
            status      =   $(this).data('status');

        modalEditorKlien.find("#galeriKlienLogo").removeAttr('src').attr("src", imageGaleriKlienLogoUrl + logoFileName);
        modalEditorKlien
        .find('input[name="namaKlien"]').val(namaKlien).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="idKlien"]').val(idKlien).end()
        .find('input[name="logoFileName"]').val(logoFileName);

        modalEditorKlien.modal('show');
        modalEditorKlien.one('shown.bs.modal', function() {
            createUploaderLogoKlien();
        });
        activateOnSubmitFormEditorKlien();
    });
}

function createUploaderLogoKlien() {
    createUploadFileInput("uploadGaleriKlienLogo", baseURLPath+"uploadLogoKlien", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        modalEditorKlien.find("#galeriKlienLogo").removeAttr('src').attr("src", responseJSON.urlLogo);
        modalEditorKlien.find('input[name="logoFileName"]').val(responseJSON.fileName);
    });
}

function activateOnSubmitFormEditorKlien() {
    modalEditorKlien.find('form').off('submit');
    modalEditorKlien.find('form').on('submit', function(e) {
        e.preventDefault();
        let formData    =   $(this).serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            dataSend[field.name]  =   field.value;
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveDataKlien",
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
                        modalEditorKlien.modal('hide');
                        getCustomerKontenGaleriKlien();
                        break;
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            toggleWindowLoader(false);
            Pace.stop();

            setUserToken(jqXHR);
        });
    });
}

function activateOnClickAddGaleriImage() {
    $('.btnAdd-galeri-image').off('click');
    $('.btnAdd-galeri-image').on('click', function() {
        let idKlien = $(this).data('id-klien');

        modalEditorGaleri
        .find('input[name="idKlien"]').val(idKlien).end()
        .find('input[name="idGaleriKlien"]').val('').end()
        .find('select[name="idMerkUtama"]').val('').end()
        .find('textarea[name="deskripsi"]').val('').end()
        .find('input[name="logoFileName"]').val('').end();

        modalEditorGaleri.find("#galeriKlienImage").removeAttr('src').attr("src", imageGaleriDefault);
        modalEditorGaleri.modal('show');
        modalEditorGaleri.one('shown.bs.modal', function() {
            createUploaderImageGaleriKlien();
        });
        activateOnSubmitFormEditorGaleri();
    });
}

function activateOnClickGaleriImageItem() {
    $('.gallery-image-item').off('click');
    $('.gallery-image-item').on('click', function() {
        let idGaleriKlien   =   $(this).data('id-galeri-klien'),
            idKlien         =   $(this).data('id-klien'),
            idMerkUtama     =   $(this).data('id-merk-utama'),
            deskripsi       =   $(this).data('deskripsi'),
            imageFileName   =   $(this).data('image-file-name');

        modalEditorGaleri.find("#galeriKlienImage").removeAttr('src').attr("src", imageGaleriKlienUrl + imageFileName);
        modalEditorGaleri
        .find('input[name="idKlien"]').val(idKlien).end()
        .find('input[name="idGaleriKlien"]').val(idGaleriKlien).end()
        .find('select[name="idMerkUtama"]').val(idMerkUtama).end()
        .find('textarea[name="deskripsi"]').val(deskripsi).end()
        .find('input[name="logoFileName"]').val(imageFileName).end();

        modalEditorGaleri.modal('show');
        modalEditorGaleri.one('shown.bs.modal', function() {
            createUploaderImageGaleriKlien();
        });
        activateOnSubmitFormEditorGaleri();
    });
}

function createUploaderImageGaleriKlien() {
    createUploadFileInput("uploadGaleriKlienImage", baseURLPath+"uploadImageGaleriKlien", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        modalEditorGaleri.find("#galeriKlienImage").removeAttr('src').attr("src", responseJSON.urlImage);
        modalEditorGaleri.find('input[name="imageFileName"]').val(responseJSON.fileName);
    });
}

function activateOnSubmitFormEditorGaleri() {
    modalEditorGaleri.find('form').off('submit');
    modalEditorGaleri.find('form').on('submit', function(e) {
        e.preventDefault();
        let formData    =   $(this).serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            dataSend[field.name]  =   field.value;
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveDataKlienGaleri",
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
                        modalEditorGaleri.modal('hide');
                        getCustomerKontenGaleriKlien();
                        break;
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            toggleWindowLoader(false);
            Pace.stop();

            setUserToken(jqXHR);
        });
    });
}

customerKontenGaleriKlienFunc();
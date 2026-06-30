var baseURLPath         =   baseURL + "customer/konten/galeriProyek/",
    currentPageNumber   =   1,
    totalPageNumber     =   1,
    containerContent    =   $('#customerKontenGaleriProyek-content'),
    modalEditor         =   $('#customerKontenGaleriProyek-editor'),
    defaultEmptyContent =   '<div class="text-center py-4">\
                                <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                            </div>';

if (customerKontenGaleriProyekFunc == null) {
    var customerKontenGaleriProyekFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenGaleriProyek-content',
                ['containerMenuCustomerKontenGaleriProyek', 'customerKontenGaleriProyek-hr']
            );
            getCustomerKontenGaleriProyek();

            $('#btnAddGaleriProyek').on('click', function() {
                createUploaderImageGaleriProyek();
                modalEditor
                .find('input[name="idMerkUtama"]').val('').end()
                .find('input[name="namaKlien"]').val('').end()
                .find('input[name="alamatProyek"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('textarea[name="deskripsi"]').val('').end()
                .find('input[name="idGaleriProyek"]').val('').end()
                .find('input[name="imageFileName"]').val('').end();
                
                modalEditor.find("#galeriProyekImg").removeAttr('src').attr("src", imageGaleriProyekDefault);
                modalEditor.modal('show');
                activateOnSubmitFormEditor();
            });
            
            $('input[name="customerKontenGaleriProyek-filterMerk"]').on('change', function() {
                currentPageNumber   =   1;
                getCustomerKontenGaleriProyek(1);
            });

            containerContent.on('scroll', function() {
                var el = this;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
                    if(currentPageNumber < totalPageNumber){
                        currentPageNumber++;
                        getCustomerKontenGaleriProyek(currentPageNumber);
                    }
                }
            });

            setOptionHelper('idMerkUtama', 'dataCustomerMerk');
        });
    }
}

function getCustomerKontenGaleriProyek(pageNumber = 1) {
    let idMerk  =   $('input[name="customerKontenGaleriProyek-filterMerk"]:checked').val(),
        dataSend=   {
            pageNumber:pageNumber,
            idMerk:idMerk
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
                    let listData                    =   responseJSON.listData,
                        pageProperty                =   responseJSON.pageProperty,
                        urlAssetImageGaleryProyek   =   responseJSON.urlAssetImageGaleryProyek;

                    totalPageNumber     =   pageProperty.pageTotal;
                    $.each(listData, function (index, arrayData) {
                        let imagePreview=   JSON.parse(arrayData.IMAGE)[0];
                            statusBadge =   parseInt(arrayData.STATUS) == 1 ?
                                            '<span><i class="far fa-check-circle text-success fa-fw fa-lg"></i> Aktif</span>' :
                                            '<span><i class="far fa-times-circle text-danger fa-fw fa-lg"></i> Tidak Aktif</span>';

                        rows    +=  '<div class="col-lg-3 col-md-4 col-sm-6 pb-3 item-galeri-proyek" \
                                        data-idgaleriproyek="'+arrayData.IDGALERIPROYEK+'" \
                                        data-idmerkutama="'+arrayData.IDMERKUTAMA+'" \
                                        data-nama-klien="'+arrayData.NAMAKLIEN+'" \
                                        data-alamat-proyek="'+arrayData.ALAMATPROYEK+'" \
                                        data-deskripsi="'+arrayData.DESKRIPSI+'" \
                                        data-image="'+imagePreview+'" \
                                        data-status="'+arrayData.STATUS+'" \
                                    >\
                                        <div class="pos-product">\
                                            <div class="img img-wide" style="background-image: url(\''+urlAssetImageGaleryProyek+imagePreview+'\'); background-size: cover; height: 200px;"></div>\
                                            <div class="info text-start small px-3 py-3">\
                                                <div class="mb-1"><i class="fa fa-industry fa-fw me-1"></i> '+arrayData.NAMAMERK+'</div>\
                                                <div class="mb-1"><i class="fa fa-user fa-fw me-1"></i> '+arrayData.NAMAKLIEN+'</div>\
                                                <div class="mb-1"><i class="fa fa-map-marker-alt fa-fw me-1"></i> '+arrayData.ALAMATPROYEK+'</div>\
                                                <div class="text-muted mb-3 deskripsi"><i class="fa fa-info-circle fa-fw me-1"></i> '+arrayData.DESKRIPSI+'</div>\
                                                <div class="text-muted d-flex justify-content-between align-items-center mt-1">\
                                                    '+statusBadge+'\
                                                    <span class="text-truncate ms-2">'+arrayData.INPUTUSER+' ['+arrayData.INPUTTANGGALWAKTU+']</span>\
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
            activateOnClickGaleriProyek();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        $("#loaderElem").remove();
    });
}

function activateOnClickGaleriProyek() {
    $('.item-galeri-proyek').off('click');
    $('.item-galeri-proyek').on('click', function() {
        let idGaleriProyek  =   $(this).data('idgaleriproyek'),
            idMerkUtama     =   $(this).data('idmerkutama'),
            namaKlien       =   $(this).data('nama-klien'),
            alamatProyek    =   $(this).data('alamat-proyek'),
            status          =   $(this).data('status'),
            deskripsi       =   $(this).data('deskripsi'),
            image           =   $(this).data('image');

        createUploaderImageGaleriProyek();
        modalEditor.find("#galeriProyekImg").removeAttr('src').attr("src", imageGaleriProyekBaseUrl + image);
        modalEditor
        .find('input[name="idMerkUtama"]').val(idMerkUtama).end()
        .find('input[name="namaKlien"]').val(namaKlien).end()
        .find('input[name="alamatProyek"]').val(alamatProyek).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('textarea[name="deskripsi"]').val(deskripsi).end()
        .find('input[name="idGaleriProyek"]').val(idGaleriProyek).end()
        .find('input[name="imageFileName"]').val(image);

        modalEditor.modal('show');
        activateOnSubmitFormEditor();
    });
}

function createUploaderImageGaleriProyek() {
    createUploadFileInput("uploadGaleriProyekImg", baseURLPath+"uploadImage", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        modalEditor.find("#galeriProyekImg").removeAttr('src').attr("src", responseJSON.urlLogo);
        modalEditor.find('input[name="imageFileName"]').val(responseJSON.fileName);
    });
}

function activateOnSubmitFormEditor() {
    modalEditor.find('form').off('submit');
    modalEditor.find('form').on('submit', function(e) {
        e.preventDefault();
        let formData    =   $(this).serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            dataSend[field.name]  =   field.value;
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
                        modalEditor.modal('hide');
                        getCustomerKontenGaleriProyek();
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

customerKontenGaleriProyekFunc();
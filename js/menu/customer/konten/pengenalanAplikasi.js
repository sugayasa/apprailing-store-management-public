var baseURLPath             =   baseURL + "customer/konten/pengenalanAplikasi/",
    containerSortableUrutan =   document.getElementById('customerKontenPengenalanAplikasi-sortable'),
    containerContent        =   $('#customerKontenPengenalanAplikasi-content'),
    modalUrutanSlide        =   $('#customerKontenPengenalanAplikasi-urutanSlide'),
    modalEditor             =   $('#customerKontenPengenalanAplikasi-editor'),
    defaultEmptyContent     =   '<div class="text-center py-4">\
                                    <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                    <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                </div>'
    sortableUrutan          =   null,
    arrUrutanSlide          =   null;

if (customerKontenPengenalanAplikasiFunc == null) {
    var customerKontenPengenalanAplikasiFunc = function () {
        $(document).ready(function () {
            getCustomerKontenPengenalanAplikasi();

            $('#btnAddSlide').on('click', function() {
                createUploaderImageOnboarding();
                modalEditor
                .find('textarea[name="kontenDeskripsi"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="idSlideBoarding"]').val('').end()
                .find('input[name="imageFileName"]').val('').end();
                
                modalEditor.find("#onboardingImg").removeAttr('src').attr("src", imageOnboardingDefault);
                modalEditor.modal('show');
                activateOnSubmitFormEditor();
            });
        });
    }
}

function getCustomerKontenPengenalanAplikasi() {
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getData",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            containerContent.html(loaderElem);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON    =   jqXHR.responseJSON,
                liSortableUrutan=   rows    =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData                =   responseJSON.listData,
                        urlAssetSlideOnboarding =   responseJSON.urlAssetSlideOnboarding;

                    $.each(listData, function (index, arrayData) {
                        let statusBadge =   parseInt(arrayData.STATUS) == 1 ?
                                            '<span>Aktif <i class="far fa-check-circle text-success fa-fw fa-lg"></i></span>' :
                                            '<span>Tidak Aktif <i class="far fa-times-circle text-danger fa-fw fa-lg"></i></span>';
                        
                        liSortableUrutan+=  parseInt(arrayData.STATUS) == 1 ?
                                            '<li class="list-group-item d-flex align-items-center text-truncate" data-id="'+ arrayData.IDSLIDEBOARDING +'">\
                                                <i class="fa fa-bars me-1"></i> ' + arrayData.KONTEN +'\
                                            </li>' :
                                            '';

                        rows += '<div class="col-lg-3 col-md-4 col-sm-6 pb-3">\
                                    <div class="pos-product">\
                                        <div class="img img-wide mt-3 mx-3" style="background-image: url(' + urlAssetSlideOnboarding + arrayData.IMAGE + '); background-size: contain;"></div>\
                                        <div class="info">\
                                            <div class="desc text-truncate">' + arrayData.KONTEN +'</div>\
                                            <div class="desc text-truncate d-flex justify-content-between mb-1">\
                                                <span class="fw-bold">Input : </span>' + arrayData.INPUTUSER + ' [' + arrayData.INPUTTANGGALWAKTU + ']\
                                            </div>\
                                            <div class="desc text-truncate d-flex justify-content-between">\
                                                <span class="fw-bold">Status : </span>' + statusBadge + '\
                                            </div>\
                                            <div class="mt-1">\
                                                <span \
                                                    class="btn btn-theme fw-semibold d-block mb-2 btn-detail" \
                                                    data-id="' + arrayData.IDSLIDEBOARDING + '" \
                                                    data-kontenDeskripsi="' + arrayData.KONTEN + '" \
                                                    data-image="' + arrayData.IMAGE + '" \
                                                    data-status="' + arrayData.STATUS + '"\
                                                >Detail</span>\
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

            containerContent.html(rows);
            activateOnClickBtnDetail();

            containerSortableUrutan.innerHTML   =   liSortableUrutan;
            sortableUrutan  =   Sortable.create(containerSortableUrutan);
            activateOnSubmitFormurutanSlide();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnSubmitFormurutanSlide() {
    modalUrutanSlide.find('form').off('submit');
    modalUrutanSlide.find('form').on('submit', function(e) {
        e.preventDefault();
        let arrUrutanSlide  =   Array.from(containerSortableUrutan.querySelectorAll('li')).map(function(li) { return li.getAttribute('data-id'); });
            dataSend        =   {arrUrutanSlide:arrUrutanSlide};

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveUrutanSlide",
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
                        modalUrutanSlide.modal('hide');
                        getCustomerKontenPengenalanAplikasi();
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

function activateOnClickBtnDetail() {
    $('.btn-detail').off('click');
    $('.btn-detail').on('click', function() {
        let idSlideBoarding =   $(this).data('id'),
            kontenDeskripsi =   $(this).data('kontendeskripsi'),
            imageOnboarding =   $(this).data('image'),
            status          =   $(this).data('status');
            
        createUploaderImageOnboarding();
        modalEditor.find("#onboardingImg").removeAttr('src').attr("src", imageOnboardingBaseUrl + imageOnboarding);
        modalEditor
        .find('textarea[name="kontenDeskripsi"]').val(kontenDeskripsi).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="idSlideBoarding"]').val(idSlideBoarding).end()
        .find('input[name="imageFileName"]').val(imageOnboarding);

        modalEditor.modal('show');
        activateOnSubmitFormEditor();
    });
}

function createUploaderImageOnboarding() {
    createUploadFileInput("uploadOnboardingImg", baseURLPath+"uploadImage", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        modalEditor.find("#onboardingImg").removeAttr('src').attr("src", responseJSON.urlLogo);
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
                        getCustomerKontenPengenalanAplikasi();
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

customerKontenPengenalanAplikasiFunc();
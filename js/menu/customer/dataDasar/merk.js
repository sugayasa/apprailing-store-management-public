var baseURLPath         =   baseURL + "customer/dataDasar/merk/",
    containerContent    =   $('#customerDataDasarMerk-content'),
    modalEditor         =   $('#customerDataDasarMerk-editor'),
    defaultEmptyContent =   '<div class="text-center py-4">\
                                <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                            </div>';

if (customerDataDasarMerkFunc == null) {
    var customerDataDasarMerkFunc = function () {
        $(document).ready(function () {
            getCustomerDataDasarMerk();

            $('#btnAddMerk').on('click', function() {
                createUploaderLogoMerk();
                modalEditor
                .find('input[name="namaMerk"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="idMerk"]').val('').end()
                .find('input[name="logoFileName"]').val('').end();
                
                modalEditor.find("#logoMerkImg").removeAttr('src').attr("src", logoMerkDefault);
                modalEditor.modal('show');
                activateOnSubmitFormEditor();
            });
        });
    }
}

function getCustomerDataDasarMerk() {
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
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData        =   responseJSON.listData,
                        urlAssetLogoMerk=   responseJSON.urlAssetLogoMerk;

                    $.each(listData, function (index, arrayData) {
                        let statusBadge =   parseInt(arrayData.STATUS) == 1 ?
                                            '<span>Aktif <i class="far fa-check-circle text-success fa-fw fa-lg"></i></span>' :
                                            '<span>Tidak Aktif <i class="far fa-times-circle text-danger fa-fw fa-lg"></i></span>';

                        rows += '<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 pb-3">\
                                    <div class="pos-product">\
                                        <div class="img img-wide mt-3 mx-3" style="background-image: url(' + urlAssetLogoMerk + arrayData.LOGO + '); background-size: contain;"></div>\
                                        <div class="info">\
                                            <div class="title text-truncate">' + arrayData.NAMAMERK +'</div>\
                                            <div class="desc text-truncate d-flex justify-content-between"><span>Status : </span>' + statusBadge + '</div>\
                                            <div class="mt-1">\
                                                <span \
                                                    class="btn btn-theme fw-semibold d-block mb-2 btn-detail" \
                                                    data-id="' + arrayData.IDMERK + '" \
                                                    data-nama-merk="' + arrayData.NAMAMERK + '" \
                                                    data-logo="' + arrayData.LOGO + '" \
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
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnClickBtnDetail() {
    $('.btn-detail').off('click');
    $('.btn-detail').on('click', function() {
        let idMerk  =   $(this).data('id'),
            namaMerk=   $(this).data('nama-merk'),
            logoMerk=   $(this).data('logo'),
            status  =   $(this).data('status');

        createUploaderLogoMerk();
        modalEditor.find("#logoMerkImg").removeAttr('src').attr("src", logoMerkBaseUrl + logoMerk);
        modalEditor
        .find('input[name="namaMerk"]').val(namaMerk).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="idMerk"]').val(idMerk).end()
        .find('input[name="logoFileName"]').val(logoMerk);

        modalEditor.modal('show');
        activateOnSubmitFormEditor();
    });
}

function createUploaderLogoMerk() {
    console.log('[TRACE] createUploaderLogoMerk called');
    console.log('[TRACE] elem #uploadLogoMerk exists:', document.getElementById('uploadLogoMerk'));
    console.log('[TRACE] elem visible:', $('#uploadLogoMerk').is(':visible'));
    console.log('[TRACE] urlUpload:', baseURLPath + "uploadLogo");

    createUploadFileInput("uploadLogoMerk", baseURLPath+"uploadLogo", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        modalEditor.find("#logoMerkImg").removeAttr('src').attr("src", responseJSON.urlLogo);
        modalEditor.find('input[name="logoFileName"]').val(responseJSON.fileName);
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
                        getCustomerDataDasarMerk();
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

customerDataDasarMerkFunc();
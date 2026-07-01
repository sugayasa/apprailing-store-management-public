var baseURLPath         =   baseURL + "customer/dataDasar/levelLoyalti/",
    containerContent    =   $('#customerDataDasarLevelLoyalti-content'),
    modalEditor         =   $('#customerDataDasarLevelLoyalti-editor'),
    defaultEmptyContent =   '<div class="text-center py-4">\
                                <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                            </div>';

if (customerDataDasarLevelLoyaltiFunc == null) {
    var customerDataDasarLevelLoyaltiFunc = function () {
        $(document).ready(function () {
            getCustomerDataDasarLevelLoyalti();

            $('#btnAddLevelLoyalti').on('click', function() {
                modalEditor
                .find('input[name="levelLoyalti"]').val('').end()
                .find('input[name="deskripsi"]').val('').end()
                .find('input[name="minNominalPembelian"]').val('0').end()
                .find('input[name="minPoin"]').val('0').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="idCustomerLoyalti"]').val('').end()
                .find('input[name="cardFileName"]').val('').end()
                .find('input[name="iconFileName"]').val('').end();

                $("#cardLevelLoyaltiImg").removeAttr('src').attr("src", levelLoyaltiCardDefault);
                $("#iconLevelLoyaltiImg").removeAttr('src').attr("src", levelLoyaltiIconDefault);
                modalEditor.modal('show');
                modalEditor.one('shown.bs.modal', function() {
                    createUploaderCardLevelLoyalti();
                    createUploaderIconLevelLoyalti();
                });
                activateOnSubmitFormEditor();
            });
        });
    }
}

function getCustomerDataDasarLevelLoyalti() {
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
                    let listData                =   responseJSON.listData,
                        urlAssetIconLevelLoyalti=   responseJSON.urlAssetIconLevelLoyalti,
                        urlAssetCardLevelLoyalti=   responseJSON.urlAssetCardLevelLoyalti;

                    $.each(listData, function (index, arrayData) {
                        let statusBadge =   parseInt(arrayData.STATUS) == 1 ?
                                            '<span>Aktif <i class="far fa-check-circle text-success fa-fw fa-lg"></i></span>' :
                                            '<span>Tidak Aktif <i class="far fa-times-circle text-danger fa-fw fa-lg"></i></span>';

                        rows += '<div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 pb-3">\
                                    <div class="pos-product">\
                                        <div class="img img-wide mt-3 mx-3">\
                                            <img src="' + urlAssetCardLevelLoyalti + arrayData.CARDFILE + '" class="img-fluid rounded-4" style="min-height: 17.8rem;">\
                                        </div>\
                                        <div class="info">\
                                            <div class="title text-truncate">' + arrayData.LOYALTITIER +'</div>\
                                            <div class="desc text-truncate">' + arrayData.DESKRIPSI +'</div>\
                                            <div class="desc text-truncate d-flex justify-content-between mb-1"><span>Min. Pembelian : </span>' + numberFormat(arrayData.MINIMALNOMINALPEMBELIAN) + '</div>\
                                            <div class="desc text-truncate d-flex justify-content-between mb-1"><span>Min. Poin : </span>' + numberFormat(arrayData.MINIMALPOIN) + '</div>\
                                            <div class="desc text-truncate d-flex justify-content-between mb-1"><span>Status : </span>' + statusBadge + '</div>\
                                            <div class="desc text-truncate d-flex justify-content-between" style="line-height: 2;">\
                                                <span>Icon : </span>\
                                                <img src="' + urlAssetIconLevelLoyalti + arrayData.ICONFILE + '" class="img-fluid rounded-circle" style="width: 20px; height: 20px;">\
                                            </div>\
                                            <div class="mt-1">\
                                                <span \
                                                    class="btn btn-theme fw-semibold d-block mb-2 btn-detail" \
                                                    data-id="' + arrayData.IDCUSTOMERLOYALTI + '" \
                                                    data-loyalti-tier="' + arrayData.LOYALTITIER + '" \
                                                    data-deskripsi="' + arrayData.DESKRIPSI + '" \
                                                    data-min-nominal-pembelian="' + numberFormat(arrayData.MINIMALNOMINALPEMBELIAN) + '" \
                                                    data-min-poin="' + numberFormat(arrayData.MINIMALPOIN) + '" \
                                                    data-icon-file="' + arrayData.ICONFILE + '" \
                                                    data-card-file="' + arrayData.CARDFILE + '" \
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
        let idLevelLoyalti      =   $(this).data('id'),
            loyaltiTier         =   $(this).data('loyalti-tier'),
            deskripsi           =   $(this).data('deskripsi'),
            minNominalPembelian =   $(this).data('min-nominal-pembelian'),
            minPoin             =   $(this).data('min-poin'),
            iconFile            =   $(this).data('icon-file'),
            cardFile            =   $(this).data('card-file'),
            status              =   $(this).data('status');

        $("#cardLevelLoyaltiImg").removeAttr('src').attr("src", levelLoyaltiCardBaseUrl + cardFile);
        $("#iconLevelLoyaltiImg").removeAttr('src').attr("src", levelLoyaltiIconBaseUrl + iconFile);

        modalEditor
        .find('input[name="levelLoyalti"]').val(loyaltiTier).end()
        .find('input[name="deskripsi"]').val(deskripsi).end()
        .find('input[name="minNominalPembelian"]').val(numberFormat(minNominalPembelian)).end()
        .find('input[name="minPoin"]').val(numberFormat(minPoin)).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="idCustomerLoyalti"]').val(idLevelLoyalti).end()
        .find('input[name="cardFileName"]').val(cardFile).end()
        .find('input[name="iconFileName"]').val(iconFile);

        modalEditor.modal('show');
        modalEditor.one('shown.bs.modal', function() {
            createUploaderCardLevelLoyalti();
            createUploaderIconLevelLoyalti();
        });
        activateOnSubmitFormEditor();
    });
}

function createUploaderCardLevelLoyalti() {
    createUploadFileInput("uploadCardLevelLoyalti", baseURLPath+"uploadCard", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#cardLevelLoyaltiImg").removeAttr('src').attr("src", responseJSON.urlCard);
        modalEditor.find('input[name="cardFileName"]').val(responseJSON.fileName);
    });
}

function createUploaderIconLevelLoyalti() {
    createUploadFileInput("uploadIconLevelLoyalti", baseURLPath+"uploadIcon", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#iconLevelLoyaltiImg").removeAttr('src').attr("src", responseJSON.urlIcon);
        modalEditor.find('input[name="iconFileName"]').val(responseJSON.fileName);
    });
}

function activateOnSubmitFormEditor() {
    modalEditor.find('form').off('submit');
    modalEditor.find('form').on('submit', function(e) {
        e.preventDefault();
        let formData    =   $(this).serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            if (field.name == "minNominalPembelian" || field.name == "minPoin") {
                dataSend[field.name]  =   parseInt(field.value.replace(/,/g, ''));
            } else {
                dataSend[field.name]  =   field.value;
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
                        modalEditor.modal('hide');
                        getCustomerDataDasarLevelLoyalti();
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

customerDataDasarLevelLoyaltiFunc();
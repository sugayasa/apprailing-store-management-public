var baseURLPath     =   baseURL + "customer/dataDasar/daftarMarketing/",
    containerContent=   $('#customerDataDasarDaftarMarketing-content'),
    rowInfoKosong   =   $('#customerDataDasarDaftarMarketing-rowInfoKosong'),
    modalEditor     =   $('#customerDataDasarMarketing-editor');

if (customerDataDasarDaftarMarketingFunc == null) {
    var customerDataDasarDaftarMarketingFunc = function () {
        $(document).ready(function () {
            getCustomerDataDasarDaftarMarketing();
        });
    }
}

function getCustomerDataDasarDaftarMarketing() {
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
            toggleWindowLoader(true);
            rowInfoKosong.hide();
            containerContent.find('.daftarMarketing-col').remove();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON    =   jqXHR.responseJSON,
                rows            =   "";

            switch (jqXHR.status) {
                case 200:
                    var listData    =   responseJSON.listData ?? [];

                    if (listData.length === 0) {
                        rowInfoKosong.show();
                        break;
                    }

                    $.each(listData, function (index, data) {
                        var ratingRerata    =   parseFloat(data.RATINGRERATA) || 0,
                            totalReview     =   parseInt(data.REVIEWTOTAL) || 0,
                            starsHtml       =   "",
                            imgSrc          =   baseURLImageMarketing + (data.IMAGE ?? defaultImage);

                        for (var s = 1; s <= 5; s++) {
                            if (s <= Math.floor(ratingRerata)) {
                                starsHtml += '<i class="fa fa-star text-warning fs-6"></i>';
                            } else if (s - ratingRerata > 0 && s - ratingRerata < 1) {
                                starsHtml += '<i class="fa fa-star-half-o text-warning fs-6"></i>';
                            } else {
                                starsHtml += '<i class="fa fa-star-o text-muted fs-6"></i>';
                            }
                        }

                        rows += '<div class="daftarMarketing-col col-xl-2 col-lg-3 col-md-4 col-sm-6 pb-3">\
                                    <div class="pos-product">\
                                        <div class="image-marketing img img-wide mt-3 mx-3" data-id="' + (data.IDMARKETING ?? '') + '" data-image="' + data.IMAGE + '" data-nama="' + (data.NAMAMARKETING ?? '') + '" data-regional="' + (data.NAMAREGIONAL ?? '') + '">\
                                            <img src="' + imgSrc + '" class="img-fluid rounded-4" style="min-height: 4rem;">\
                                        </div>\
                                        <div class="info">\
                                            <div class="fw-semibold text-truncate w-100 fs-6" title="' + (data.NAMAMARKETING ?? '') + '">' + (data.NAMAMARKETING ?? '-') + '</div>\
                                            <div class="text-muted text-truncate w-100 fs-7 fw-bold">' + (data.NAMAREGIONAL ?? '-') + '</div>\
                                            <div class="mt-1">' + starsHtml + '</div>\
                                            <div class="desc text-truncate d-flex justify-content-between mb-0">Rating : ' + ratingRerata.toFixed(1) + ' - ' + totalReview + ' ulasan</div>\
                                        </div>\
                                    </div>\
                                </div>';
                    });
                    containerContent.append(rows);
                    activateOnClickImageMarketing();
                    break;
                case 404:
                    rowInfoKosong.show();
                    break;
                default:
                    containerContent.html(
                        '<div class="col-12">' +
                            '<div class="alert alert-warning d-flex flex-column align-items-center justify-content-center gap-2 text-center mb-0 py-4">' +
                                '<i class="fa fa-exclamation-triangle fa-3x opacity-50"></i>' +
                                '<div>' + getMessageResponse(jqXHR) + '</div>' +
                            '</div>' +
                        '</div>'
                    );
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        toggleWindowLoader(false);
        setUserToken(jqXHR);
    });
}

function activateOnClickImageMarketing() {
    $('.image-marketing').off('click');
    $('.image-marketing').on('click', function() {
        let idMarketing =   $(this).data('id'),
            image       =   $(this).data('image'),
            nama        =   $(this).data('nama'),
            regional    =   $(this).data('regional');

        $("#marketingImg").removeAttr('src').attr("src", baseURLImageMarketing + image);
        $("#marketingNama").text(nama);
        $("#marketingRegional").text(regional);

        modalEditor
        .find('input[name="idMarketing"]').val(idMarketing).end()
        .find('input[name="marketingImageFileName"]').val(image);

        modalEditor.modal('show');
        modalEditor.one('shown.bs.modal', function() {
            createUploaderImageMarketing();
        });
        activateOnSubmitFormEditor();
    });
}

function createUploaderImageMarketing() {
    createUploadFileInput("uploadImageMarketing", baseURLPath+"uploadImageMarketing", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#marketingImg").removeAttr('src').attr("src", responseJSON.urlImage);
        modalEditor.find('input[name="marketingImageFileName"]').val(responseJSON.fileName);
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
                        getCustomerDataDasarDaftarMarketing();
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

customerDataDasarDaftarMarketingFunc();
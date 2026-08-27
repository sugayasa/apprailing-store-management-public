var baseURLPath     =   baseURL + "customer/konten/slideKolaborasi/",
    dataTableContent=   $('#customerKontenSlideKolaborasi-cardContent').find('table:first').find('tbody').first(),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length;

if (customerKontenSlideKolaborasiFunc == null) {
    var customerKontenSlideKolaborasiFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenSlideKolaborasi-cardContent',
                ['customerKontenSlideKolaborasi-header', 'customerKontenSlideKolaborasi-hr', 'customerKontenSlideKolaborasi-alert']
            );
            getCustomerKontenSlideKolaborasi();

            $('#btnAddSlideKolaborasi').on('click', function() {
                $('input[name="produkFileName"]').val('');
                $('input[name="judul"]').val('');
                $('input[name="urlVideo"]').val('');
                $('input[name="status"][value="1"]').prop('checked', true);
                $('.summernote').val('');
                $('input[name="idSlideKolaborasi"]').val('');
                $("#imgProduk").removeAttr('src').attr("src", defaultImageProduk);
                $("#imgThumbnail").removeAttr('src').attr("src", defaultImageThumbnail);
                
                toggleSlideContainerSlideKolaborasi();
                toggleDisplayTopButton(false);
                createUploaderSlideKolaborasi();
                generateSummernoteKonten();
                activateOnSubmitFormEditorSlideKolaborasi();
            });

            $('#btnBatalEditor').on('click', function() {
                toggleSlideContainerSlideKolaborasi();
                toggleDisplayTopButton(true);
            });

            $('#customerKontenSlideKolaborasi-searchKeyword').off('keydown');
            $('#customerKontenSlideKolaborasi-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerKontenSlideKolaborasi();
                }
            });
        });
    }
}

function toggleSlideContainerSlideKolaborasi() {
    toggleSlideContainer('customerKontenSlideKolaborasi-leftContainer', 'customerKontenSlideKolaborasi-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnAddSlideKolaborasi').removeClass('d-none');
        $('#btnBatalEditor').addClass('d-none');
    } else {
        $('#btnAddSlideKolaborasi').addClass('d-none');
        $('#btnBatalEditor').removeClass('d-none');
    }
}

function generateDataTable(pageNumber){
    getCustomerKontenSlideKolaborasi(pageNumber);
}

function getCustomerKontenSlideKolaborasi(pageNumber = 1) {
    let searchKeyword   =   $('#customerKontenSlideKolaborasi-searchKeyword').val(),
        dataSend        =   {
            searchKeyword: searchKeyword,
            pageNumber: pageNumber
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
            setElemDisabledProperty(['.paginationElem', '#btnAddSlideKolaborasi', '#customerKontenSlideKolaborasi-searchKeyword'], true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    $.each(listData, function (index, arrayData) {
                        let statusBadge =   parseInt(arrayData.STATUS) == 1 ?
                                            '<span>Aktif <i class="far fa-check-circle text-success fa-fw fa-lg"></i></span>' :
                                            '<span>Tidak Aktif <i class="far fa-times-circle text-danger fa-fw fa-lg"></i></span>',
                            btnEdit     =   '<button \
                                                class="btn btn-sm btn-icon btn-outline-primary btn-detail" \
                                                data-bs-toggle="tooltip" \
                                                data-bs-placement="top" \
                                                title="Ubah Data" \
                                                data-id="' + arrayData.IDSLIDEKOLABORASI + '" \
                                            >\
                                                <i class="fa fa-edit"></i>\
                                            </button>';
                        rows    +=  '<tr>\
                                        <td>\
                                            <img src="' + arrayData.IMAGEPRODUK + '" class="img-fluid mx-auto" style="max-height: 100px;max-width: 100px;"/>\
                                        </td>\
                                        <td>\
                                            <img src="' + arrayData.IMAGETHUMBNAILVIDEO + '" class="img-fluid mx-auto" style="max-height: 100px;max-width: 150px;"/>\
                                        </td>\
                                        <td class="text-break">' + arrayData.JUDUL + '</td>\
                                        <td class="text-break">\
                                            <a href="' + arrayData.URLVIDEO + '" target="_blank">' + arrayData.URLVIDEO + '</a>\
                                        </td>\
                                        <td class="text-break">' + arrayData.KONTEN + '</td>\
                                        <td>' + arrayData.INPUTUSER + '<br/>' + arrayData.INPUTTANGGALWAKTUSTR + '</td>\
                                        <td>' + statusBadge + '</td>\
                                        <td class="text-end">' + btnEdit + '</td>\
                                    </tr>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            setElemDisabledProperty(['.paginationElem', '#btnAddSlideKolaborasi', '#customerKontenSlideKolaborasi-searchKeyword'], false);
            generatePagination('customerKontenSlideKolaborasi-paginationInfo', 'customerKontenSlideKolaborasi-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickBtnDetail();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function createUploaderSlideKolaborasi() {
    createUploadFileInput("uploadImageProduk", baseURLPath+"uploadImageProduk", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#imgProduk").removeAttr('src').attr("src", responseJSON.urlImage);
        $('input[name="produkFileName"]').val(responseJSON.fileName);
    });

    createUploadFileInput("uploadImageThumbnail", baseURLPath+"uploadImageThumbnail", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#imgThumbnail").removeAttr('src').attr("src", responseJSON.urlImage);
        $('input[name="thumbnailFileName"]').val(responseJSON.fileName);
    });
}

var generateSummernoteKonten    =   function() {
    $('.summernote').summernote('destroy');
    $('.summernote').summernote({
        height: 384
    });
};

function activateOnSubmitFormEditorSlideKolaborasi() {
    $('#btnSimpanSlideKolaborasi').off('click');
    $('#btnSimpanSlideKolaborasi').on('click', function(e) {
        e.preventDefault();
        let produkFileName      =   $('input[name="produkFileName"]').val(),
            thumbnailFileName   =   $('input[name="thumbnailFileName"]').val(),
            judul               =   $('#judul').val(),
            urlVideo            =   $('#urlVideo').val(),
            konten              =   $('.summernote').summernote('code'),
            status              =   $('input[name="status"]:checked').val(),
            idSlideKolaborasi   =   $('input[name="idSlideKolaborasi"]').val(),
            dataSend            =   {
                produkFileName:produkFileName,
                thumbnailFileName:thumbnailFileName,
                judul:judul,
                urlVideo:urlVideo,
                konten:konten,
                status:status,
                idSlideKolaborasi:idSlideKolaborasi
            };

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
                        toggleSlideContainerSlideKolaborasi();
                        toggleDisplayTopButton(true);
                        getCustomerKontenSlideKolaborasi();
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
        let idSlideKolaborasi   =   $(this).data('id'),
            dataSend            =   {
                idSlideKolaborasi:idSlideKolaborasi
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
                            dataDetail  =   responseJSON.dataDetail;

                        $('input[name="produkFileName"]').val(dataDetail.IMAGEPRODUK);
                        $('input[name="thumbnailFileName"]').val(dataDetail.IMAGETHUMBNAILVIDEO);
                        $('input[name="judul"]').val(dataDetail.JUDUL);
                        $('input[name="urlVideo"]').val(dataDetail.URLVIDEO);
                        $('input[name="status"][value="' + parseInt(dataDetail.STATUS) + '"]').prop('checked', true);
                        $('.summernote').val(dataDetail.KONTEN);
                        $('input[name="idSlideKolaborasi"]').val(idSlideKolaborasi);
                        $("#imgProduk").removeAttr('src').attr("src", baseURLImageProduk + dataDetail.IMAGEPRODUK);
                        $("#imgThumbnail").removeAttr('src').attr("src", baseURLImageThumbnail + dataDetail.IMAGETHUMBNAILVIDEO);
                        
                        toggleSlideContainerSlideKolaborasi();
                        toggleDisplayTopButton(false);
                        createUploaderSlideKolaborasi();
                        generateSummernoteKonten();
                        activateOnSubmitFormEditorSlideKolaborasi();
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

customerKontenSlideKolaborasiFunc();
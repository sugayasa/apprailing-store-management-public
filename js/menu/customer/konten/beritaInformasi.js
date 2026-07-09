var baseURLPath     =   baseURL + "customer/konten/beritaInformasi/",
    dataTableContent=   $('#customerKontenBeritaInformasi-cardContent').find('table:first').find('tbody').first(),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length;

if (customerKontenBeritaInformasiFunc === null) {
    var customerKontenBeritaInformasiFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenBeritaInformasi-cardContent',
                ['customerKontenBeritaInformasi-header', 'customerKontenBeritaInformasi-hr', 'customerKontenBeritaInformasi-alert']
            );
            getCustomerKontenBeritaInformasi();

            $('#btnAddBeritaInformasi').on('click', function() {
                $('input[name="slideBannerFileName"]').val('');
                $('input[name="judul"]').val('');
                $('input[name="status"][value="1"]').prop('checked', true);
                $('.summernote').val('');
                $('input[name="idSlideBanner"]').val('');
                $("#imgSlideBanner").removeAttr('src').attr("src", defaultImage);
                
                toggleSlideContainerBeritaInformasi();
                toggleDisplayTopButton(false);
                createUploaderSlideBanner();
                generateSummernoteKonten();
                activateOnSubmitFormEditorBeritaInformasi();
            });

            $('#btnBatalEditor').on('click', function() {
                toggleSlideContainerBeritaInformasi();
                toggleDisplayTopButton(true);
            });

            $('#customerKontenBeritaInformasi-searchKeyword').off('keydown');
            $('#customerKontenBeritaInformasi-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerKontenBeritaInformasi();
                }
            });
        });
    }
}

function toggleSlideContainerBeritaInformasi() {
    toggleSlideContainer('customerKontenBeritaInformasi-leftContainer', 'customerKontenBeritaInformasi-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnAddBeritaInformasi').removeClass('d-none');
        $('#btnBatalEditor').addClass('d-none');
    } else {
        $('#btnAddBeritaInformasi').addClass('d-none');
        $('#btnBatalEditor').removeClass('d-none');
    }
}

function generateDataTable(pageNumber){
    getCustomerKontenBeritaInformasi(pageNumber);
}

function getCustomerKontenBeritaInformasi(pageNumber = 1) {
    let searchKeyword   =   $('#customerKontenBeritaInformasi-searchKeyword').val(),
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
            setElemDisabledProperty(['.paginationElem', '#btnAddBeritaInformasi', '#customerKontenBeritaInformasi-searchKeyword'], true);
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
                                                data-id="' + arrayData.IDSLIDEBANNER + '" \
                                            >\
                                                <i class="fa fa-edit"></i>\
                                            </button>';
                        rows    +=  '<tr>\
                                        <td>\
                                            <img src="' + arrayData.IMAGE + '" class="img-fluid mx-auto" style="max-height: 100px;max-width: 150px;"/>\
                                        </td>\
                                        <td class="text-break">' + arrayData.JUDUL + '</td>\
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
            setElemDisabledProperty(['.paginationElem', '#btnAddBeritaInformasi', '#customerKontenBeritaInformasi-searchKeyword'], false);
            generatePagination('customerKontenBeritaInformasi-paginationInfo', 'customerKontenBeritaInformasi-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickBtnDetail();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function createUploaderSlideBanner() {
    createUploadFileInput("uploadSlideBanner", baseURLPath+"uploadImage", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#imgSlideBanner").removeAttr('src').attr("src", responseJSON.urlImage);
        $('input[name="slideBannerFileName"]').val(responseJSON.fileName);
    });
}

var generateSummernoteKonten    =   function() {
    $('.summernote').summernote('destroy');
    $('.summernote').summernote({
        height: 322
    });
};

function activateOnSubmitFormEditorBeritaInformasi() {
    $('#btnSimpanBeritaInformasi').off('click');
    $('#btnSimpanBeritaInformasi').on('click', function(e) {
        e.preventDefault();
        let slideBannerFileName =   $('input[name="slideBannerFileName"]').val(),
            judul               =   $('#judul').val(),
            konten              =   $('.summernote').summernote('code'),
            status              =   $('input[name="status"]:checked').val(),
            idSlideBanner       =   $('input[name="idSlideBanner"]').val(),
            dataSend            =   {
                slideBannerFileName:slideBannerFileName,
                judul:judul,
                konten:konten,
                status:status,
                idSlideBanner:idSlideBanner
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
                        toggleSlideContainerBeritaInformasi();
                        toggleDisplayTopButton(true);
                        getCustomerKontenBeritaInformasi();
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
        let idSlideBanner   =   $(this).data('id'),
            dataSend        =   {
                idSlideBanner:idSlideBanner
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
                        $('input[name="slideBannerFileName"]').val(dataDetail.IMAGE);
                        $('input[name="judul"]').val(dataDetail.JUDUL);
                        $('input[name="status"][value="' + parseInt(dataDetail.STATUS) + '"]').prop('checked', true);
                        $('.summernote').val(dataDetail.KONTEN);
                        $('input[name="idSlideBanner"]').val(idSlideBanner);
                        $("#imgSlideBanner").removeAttr('src').attr("src", baseURLImage + dataDetail.IMAGE);
                        
                        toggleSlideContainerBeritaInformasi();
                        toggleDisplayTopButton(false);
                        createUploaderSlideBanner();
                        generateSummernoteKonten();
                        activateOnSubmitFormEditorBeritaInformasi();
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

customerKontenBeritaInformasiFunc();
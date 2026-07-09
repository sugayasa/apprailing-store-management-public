var baseURLPath             =   baseURL + "customer/konten/profilPerusahaan/",
    containerSortableUrutan =   document.getElementById('customerKontenProfilPerusahaan-sortable'),
    modalUrutanProfil       =   $('#customerKontenProfilPerusahaan-urutanProfil'),
    dataTableContent        =   $('#customerKontenProfilPerusahaan-cardContent').find('table:first').find('tbody').first(),
    totalColumns            =   dataTableContent.closest('table').find('thead:first').find('th').length,
    sortableUrutan          =   null,
    arrUrutanProfil         =   null;

if (customerKontenProfilPerusahaanFunc === null) {
    var customerKontenProfilPerusahaanFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenProfilPerusahaan-cardContent',
                ['customerKontenProfilPerusahaan-header', 'customerKontenProfilPerusahaan-hr', 'customerKontenProfilPerusahaan-alert']
            );
            getCustomerKontenProfilPerusahaan();

            $('#btnAddProfilPerusahaan').on('click', function() {
                $('input[name="thumbnailVideoFileName"]').val('');
                $('input[name="judul"]').val('');
                $('input[name="urlVideo"]').val('');
                $('input[name="status"][value="1"]').prop('checked', true);
                $('.summernote').val('');
                $('input[name="idVideoProfilPerusahaan"]').val('');
                $("#imgThumbnailVideo").removeAttr('src').attr("src", defaultImage);
                
                toggleSlideContainerProfilPerusahaan();
                toggleDisplayTopButton(false);
                createUploaderThumbnailVideo();
                generateSummernoteKonten();
                activateOnSubmitFormEditorProfilPerusahaan();
            });

            $('#btnBatalEditor').on('click', function() {
                toggleSlideContainerProfilPerusahaan();
                toggleDisplayTopButton(true);
            });

            $('#customerKontenProfilPerusahaan-searchKeyword').off('keydown');
            $('#customerKontenProfilPerusahaan-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerKontenProfilPerusahaan();
                }
            });
        });
    }
}

function toggleSlideContainerProfilPerusahaan() {
    toggleSlideContainer('customerKontenProfilPerusahaan-leftContainer', 'customerKontenProfilPerusahaan-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnAddProfilPerusahaan, #btnUrutanProfilPerusahaan').removeClass('d-none');
        $('#btnBatalEditor').addClass('d-none');
    } else {
        $('#btnAddProfilPerusahaan, #btnUrutanProfilPerusahaan').addClass('d-none');
        $('#btnBatalEditor').removeClass('d-none');
    }
}

function generateDataTable(pageNumber){
    getCustomerKontenProfilPerusahaan(pageNumber);
}

function getCustomerKontenProfilPerusahaan(pageNumber = 1) {
    let searchKeyword   =   $('#customerKontenProfilPerusahaan-searchKeyword').val(),
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
            setElemDisabledProperty(['.paginationElem', '#btnAddProfilPerusahaan', '#btnUrutanProfilPerusahaan', '#customerKontenProfilPerusahaan-searchKeyword'], true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON    =   jqXHR.responseJSON,
                liSortableUrutan=   "",
                rows            =   "";

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
                                                data-id="' + arrayData.IDVIDEOCOMPANYPROFILE + '" \
                                            >\
                                                <i class="fa fa-edit"></i>\
                                            </button>';
                        
                        liSortableUrutan+=  '<li class="list-group-item d-flex align-items-center text-truncate" data-id="'+ arrayData.IDVIDEOCOMPANYPROFILE +'">\
                                                <i class="fa fa-bars me-2"></i> ' + arrayData.JUDUL +'\
                                            </li>';
                        rows    +=  '<tr>\
                                        <td>\
                                            <img src="' + arrayData.IMAGETHUMBNAIL + '" class="img-fluid mx-auto" style="max-height: 100px;max-width: 150px;"/>\
                                        </td>\
                                        <td class="text-break">' + arrayData.JUDUL + '</td>\
                                        <td class="text-break">' + arrayData.KONTEN + '</td>\
                                        <td class="text-break"><a href="' + arrayData.URLVIDEO + '" target="_blank">' + arrayData.URLVIDEO + '</a></td>\
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
            setElemDisabledProperty(['.paginationElem', '#btnAddProfilPerusahaan', '#btnUrutanProfilPerusahaan', '#customerKontenProfilPerusahaan-searchKeyword'], false);
            generatePagination('customerKontenProfilPerusahaan-paginationInfo', 'customerKontenProfilPerusahaan-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickBtnDetail();

            containerSortableUrutan.innerHTML   =   liSortableUrutan;
            
            if (sortableUrutan) sortableUrutan.destroy();
            if (typeof Sortable !== 'undefined') {
                sortableUrutan                      =   Sortable.create(containerSortableUrutan);
            }
            activateOnSubmitFormUrutanProfilPerusahaan();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnSubmitFormUrutanProfilPerusahaan() {
    modalUrutanProfil.find('form').off('submit');
    modalUrutanProfil.find('form').on('submit', function(e) {
        e.preventDefault();
        let arrUrutanProfil =   Array.from(containerSortableUrutan.querySelectorAll('li')).map(function(li) { return li.getAttribute('data-id'); });
            dataSend        =   {arrUrutanProfil:arrUrutanProfil};

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveUrutanProfilPerusahaan",
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
                        modalUrutanProfil.modal('hide');
                        getCustomerKontenProfilPerusahaan();
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

function createUploaderThumbnailVideo() {
    createUploadFileInput("uploadThumbnailVideo", baseURLPath+"uploadThumbnailVideo", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        $("#imgThumbnailVideo").removeAttr('src').attr("src", responseJSON.urlImage);
        $('input[name="thumbnailVideoFileName"]').val(responseJSON.fileName);
    });
}

function generateSummernoteKonten() {
    $('.summernote').summernote('destroy');
    $('.summernote').summernote({
        height: 402
    });
};

function activateOnSubmitFormEditorProfilPerusahaan() {
    $('#btnSimpanProfilPerusahaan').off('click');
    $('#btnSimpanProfilPerusahaan').on('click', function(e) {
        e.preventDefault();
        let thumbnailVideoFileName  =   $('input[name="thumbnailVideoFileName"]').val(),
            judul                   =   $('#judul').val(),
            urlVideo                =   $('#urlVideo').val(),
            konten                  =   $('.summernote').summernote('code'),
            status                  =   $('input[name="status"]:checked').val(),
            idVideoProfilPerusahaan =   $('input[name="idVideoProfilPerusahaan"]').val(),
            dataSend                =   {
                thumbnailVideoFileName:thumbnailVideoFileName,
                judul:judul,
                urlVideo:urlVideo,
                konten:konten,
                status:status,
                idVideoProfilPerusahaan:idVideoProfilPerusahaan
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
                        toggleSlideContainerProfilPerusahaan();
                        toggleDisplayTopButton(true);
                        getCustomerKontenProfilPerusahaan();
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
        let idVideoProfilPerusahaan =   $(this).data('id'),
            dataSend                =   {
                idVideoProfilPerusahaan:idVideoProfilPerusahaan
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
                        $('input[name="thumbnailVideoFileName"]').val(dataDetail.IMAGETHUMBNAIL);
                        $('input[name="judul"]').val(dataDetail.JUDUL);
                        $('input[name="urlVideo"]').val(dataDetail.URLVIDEO);
                        $('input[name="status"][value="' + parseInt(dataDetail.STATUS) + '"]').prop('checked', true);
                        $('.summernote').val(dataDetail.KONTEN);
                        $('input[name="idVideoProfilPerusahaan"]').val(idVideoProfilPerusahaan);
                        $("#imgThumbnailVideo").removeAttr('src').attr("src", baseURLImage + dataDetail.IMAGETHUMBNAIL);
                        
                        toggleSlideContainerProfilPerusahaan();
                        toggleDisplayTopButton(false);
                        createUploaderThumbnailVideo();
                        generateSummernoteKonten();
                        activateOnSubmitFormEditorProfilPerusahaan();
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

customerKontenProfilPerusahaanFunc();
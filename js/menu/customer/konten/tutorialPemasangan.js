var baseURLPath             =   baseURL + "customer/konten/tutorialPemasangan/",
    containerSortableUrutan =   document.getElementById('customerKontenTutorialPemasangan-sortable'),
    modalUrutanTutorial     =   $('#customerKontenTutorialPemasangan-urutanTutorial'),
    dataTableContent        =   $('#customerKontenTutorialPemasangan-cardContent').find('table:first').find('tbody').first(),
    totalColumns            =   dataTableContent.closest('table').find('thead:first').find('th').length,
    sortableUrutan          =   null,
    arrUrutanTutorial       =   null;

if (customerKontenTutorialPemasanganFunc === null) {
    var customerKontenTutorialPemasanganFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenTutorialPemasangan-cardContent',
                ['customerKontenTutorialPemasangan-header', 'customerKontenTutorialPemasangan-hr', 'customerKontenTutorialPemasangan-alert']
            );
            getCustomerKontenTutorialPemasangan();

            $('#btnAddTutorialPemasangan').on('click', function() {
                $('input[name="thumbnailVideoFileName"]').val('');
                $('input[name="judul"]').val('');
                $('input[name="urlVideo"]').val('');
                $('input[name="status"][value="1"]').prop('checked', true);
                $('.summernote').val('');
                $('input[name="idVideoCaraPemasangan"]').val('');
                $("#imgThumbnailVideo").removeAttr('src').attr("src", defaultImage);
                
                toggleSlideContainerTutorialPemasangan();
                toggleDisplayTopButton(false);
                createUploaderThumbnailVideo();
                generateSummernoteKonten();
                activateOnSubmitFormEditorTutorialPemasangan();
            });

            $('#btnBatalEditor').on('click', function() {
                toggleSlideContainerTutorialPemasangan();
                toggleDisplayTopButton(true);
            });

            $('#customerKontenTutorialPemasangan-searchKeyword').off('keydown');
            $('#customerKontenTutorialPemasangan-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerKontenTutorialPemasangan();
                }
            });
        });
    }
}

function toggleSlideContainerTutorialPemasangan() {
    toggleSlideContainer('customerKontenTutorialPemasangan-leftContainer', 'customerKontenTutorialPemasangan-rightContainer');
}

function toggleDisplayTopButton(isDefault) {
    if (isDefault) {
        $('#btnAddTutorialPemasangan, #btnUrutanTutorial').removeClass('d-none');
        $('#btnBatalEditor').addClass('d-none');
    } else {
        $('#btnAddTutorialPemasangan, #btnUrutanTutorial').addClass('d-none');
        $('#btnBatalEditor').removeClass('d-none');
    }
}

function generateDataTable(pageNumber){
    getCustomerKontenTutorialPemasangan(pageNumber);
}

function getCustomerKontenTutorialPemasangan(pageNumber = 1) {
    let searchKeyword   =   $('#customerKontenTutorialPemasangan-searchKeyword').val(),
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
            setElemDisabledProperty(['.paginationElem', '#btnAddTutorialPemasangan', '#btnUrutanTutorial', '#customerKontenTutorialPemasangan-searchKeyword'], true);
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
                                                data-id="' + arrayData.IDVIDEOCARAPEMASANGAN + '" \
                                            >\
                                                <i class="fa fa-edit"></i>\
                                            </button>';
                        
                        liSortableUrutan+=  '<li class="list-group-item d-flex align-items-center text-truncate" data-id="'+ arrayData.IDVIDEOCARAPEMASANGAN +'">\
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
            setElemDisabledProperty(['.paginationElem', '#btnAddTutorialPemasangan', '#btnUrutanTutorial', '#customerKontenTutorialPemasangan-searchKeyword'], false);
            generatePagination('customerKontenTutorialPemasangan-paginationInfo', 'customerKontenTutorialPemasangan-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickBtnDetail();

            containerSortableUrutan.innerHTML   =   liSortableUrutan;

            if (sortableUrutan) sortableUrutan.destroy();
            if (typeof Sortable !== 'undefined') {
                sortableUrutan  =   Sortable.create(containerSortableUrutan);
            }
            activateOnSubmitFormUrutanTutorial();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnSubmitFormUrutanTutorial() {
    modalUrutanTutorial.find('form').off('submit');
    modalUrutanTutorial.find('form').on('submit', function(e) {
        e.preventDefault();
        let arrUrutanTutorial   =   Array.from(containerSortableUrutan.querySelectorAll('li')).map(function(li) { return li.getAttribute('data-id'); });
            dataSend            =   {arrUrutanTutorial:arrUrutanTutorial};

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveUrutanTutorial",
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
                        modalUrutanTutorial.modal('hide');
                        getCustomerKontenTutorialPemasangan();
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

var generateSummernoteKonten    =   function() {
    $('.summernote').summernote('destroy');
    $('.summernote').summernote({
        height: 402
    });
};

function activateOnSubmitFormEditorTutorialPemasangan() {
    $('#btnSimpanTutorialPemasangan').off('click');
    $('#btnSimpanTutorialPemasangan').on('click', function(e) {
        e.preventDefault();
        let thumbnailVideoFileName  =   $('input[name="thumbnailVideoFileName"]').val(),
            judul                   =   $('#judul').val(),
            urlVideo                =   $('#urlVideo').val(),
            konten                  =   $('.summernote').summernote('code'),
            status                  =   $('input[name="status"]:checked').val(),
            idVideoCaraPemasangan   =   $('input[name="idVideoCaraPemasangan"]').val(),
            dataSend                =   {
                thumbnailVideoFileName:thumbnailVideoFileName,
                judul:judul,
                urlVideo:urlVideo,
                konten:konten,
                status:status,
                idVideoCaraPemasangan:idVideoCaraPemasangan
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
                        toggleSlideContainerTutorialPemasangan();
                        toggleDisplayTopButton(true);
                        getCustomerKontenTutorialPemasangan();
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
        let idVideoCaraPemasangan   =   $(this).data('id'),
            dataSend                =   {
                idVideoCaraPemasangan:idVideoCaraPemasangan
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
                        $('input[name="idVideoCaraPemasangan"]').val(idVideoCaraPemasangan);
                        $("#imgThumbnailVideo").removeAttr('src').attr("src", baseURLImage + dataDetail.IMAGETHUMBNAIL);
                        
                        toggleSlideContainerTutorialPemasangan();
                        toggleDisplayTopButton(false);
                        createUploaderThumbnailVideo();
                        generateSummernoteKonten();
                        activateOnSubmitFormEditorTutorialPemasangan();
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

customerKontenTutorialPemasanganFunc();
var baseURLPath             =   baseURL + "customer/dataDasar/sosmedMarketplace/",
    containerContent        =   $('#customerDataDasarSosmedMarketplace-content'),
    containerSortableUrutan =   document.getElementById('customerDataDasarSosmedMarketplace-sortable'),
    modalEditorTipe         =   $('#customerDataDasarSosmedMarketplace-editorTipe'),
    modalEditorAkun         =   $('#customerDataDasarSosmedMarketplace-editorAkun'),
    modalUrutanTipe         =   $('#customerDataDasarSosmedMarketplace-urutanTipe'),
    sortableUrutan          =   null;

if (customerDataDasarSosmedMarketplaceFunc == null) {
    var customerDataDasarSosmedMarketplaceFunc = function () {
        $(document).ready(function () {
            getCustomerDataDasarSosmedMarketplace();

            $('#btnAddTipeSosmedMarketplace').off('click').on('click', function() {
                modalEditorTipe
                .find('input[name="namaTipeSosmedMarketplace"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="idTipeSosmedMarketplace"]').val('').end()
                .find('input[name="iconFileName"]').val('').end();
                
                modalEditorTipe.find("#iconSosmedMarketplaceImg").removeAttr('src').attr("src", defaultImageIcon);
                modalEditorTipe.modal('show');
                modalEditorTipe.one('shown.bs.modal', function() {
                    createUploaderIconSosmedMarketplace();
                });
                activateOnSubmitFormEditorTipe();
            });
        });
    }
}

function getCustomerDataDasarSosmedMarketplace() {
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
                liSortableUrutan=   "",
                cards           =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData,
                        urlAssetIcon=   responseJSON.urlAssetIcon;

                    $.each(listData, function (index, arrayData) {
                        let statusBadge =   parseInt(arrayData.STATUS) == 1 ?
                                            '<span class="ms-auto">Aktif <i class="far fa-check-circle text-success fa-fw"></i></span>' :
                                            '<span class="ms-auto">Tidak Aktif <i class="far fa-times-circle text-danger fa-fw"></i></span>',
                            arrDataAkun =   arrayData.LISTAKUN,
                            listAkun    =   "";
                        
                        if (arrDataAkun.length > 0) {
                            $.each(arrDataAkun, function (indexAkun, arrayDataAkun) {
                                let borderBottom=   indexAkun < arrDataAkun.length - 1 ? 'border-bottom' : '',
                                    akunProperty=   'data-id-tipe="'+arrayData.IDTIPESOSMEDMARKETPLACE+'" \
                                                    data-icon-tipe="'+arrayData.FILEICON+'" \
                                                    data-nama-tipe="'+arrayData.NAMATIPE+'" \
                                                    data-id-akun="'+arrayDataAkun.IDSOSMEDMARKETPLACE+'" \
                                                    data-nama-akun="'+arrayDataAkun.NAMAAKUN+'" \
                                                    data-url-akun="'+arrayDataAkun.URL+'"';

                                listAkun        +=  '<div class="d-flex align-items-center py-2 '+borderBottom+'">\
                                                        <span><i class="fa fa-circle me-2 text-success fa-fw fa-lg"></i></span>\
                                                        <div class="flex-fill me-2">\
                                                            <div class="fw-semibold text-dark text-truncate">'+arrayDataAkun.NAMAAKUN+'</div>\
                                                            <a href="'+arrayDataAkun.URL+'" target="_blank" class="text-muted small text-decoration-none text-truncate d-block">'+arrayDataAkun.URL+'</a>\
                                                        </div>\
                                                        <div class="flex-shrink-0">\
                                                            <button class="btn btn-sm btn-icon btn-outline-primary border-0 me-1 btn-editAkun" title="Edit" '+akunProperty+'><i class="fa fa-edit"></i></button>\
                                                            <button class="btn btn-sm btn-icon btn-outline-danger border-0 btn-deleteAkun" title="Hapus" '+akunProperty+'><i class="fa fa-trash"></i></button>\
                                                        </div>\
                                                    </div>';
                            });
                        } else {
                            listAkun =   '<div class="text-center py-4">\
                                            <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                            <p class="text-muted mb-0">Tidak ada akun tersedia</p>\
                                        </div>';
                        }
                        
                        let tipeProperty =  'data-id="'+arrayData.IDTIPESOSMEDMARKETPLACE+'" \
                                            data-nama-tipe="'+arrayData.NAMATIPE+'" \
                                            data-file-icon="'+arrayData.FILEICON+'" \
                                            data-status="'+arrayData.STATUS+'"';
                        cards   +=  '<div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 p-2">\
                                        <div class="card">\
                                            <div class="card-header d-flex align-items-center">\
                                                <span class="rounded-circle d-inline-flex align-items-center justify-content-center me-2 flex-shrink-0" style="width: 28px; height: 28px; background-color: #2D2D2D;">\
                                                    <img src="'+urlAssetIcon+arrayData.FILEICON+'" class="img-fluid" style="max-height: 14px;"/>\
                                                </span>\
                                                <h5 class="card-title mb-0">'+arrayData.NAMATIPE+'</h5>\
                                                '+statusBadge+'\
                                            </div>\
                                            <div class="card-body py-2 px-3" style="height: 250px; overflow-y: auto;">'+listAkun+'</div>\
                                            <div class="card-footer p-0">\
                                                <div class="d-flex">\
                                                    <button class="btn btn-info fw-semibold rounded-0 border-end w-50 py-2 btn-editTipe" '+tipeProperty+'>Edit Tipe</button>\
                                                    <button class="btn btn-primary fw-semibold rounded-0 w-50 py-2 btn-tambahAkun" '+tipeProperty+'>Tambah Akun</button>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>';
                        
                        liSortableUrutan+=  '<li class="list-group-item d-flex align-items-center text-truncate" data-id="'+ arrayData.IDTIPESOSMEDMARKETPLACE +'">\
                                                <i class="fa fa-bars me-2"></i> ' + arrayData.NAMATIPE +'\
                                            </li>';
                    });
                    break;
                case 404:
                default:
                    cards    =   '<li class="text-center">\
                                    <div class="alert alert-warning mb-0 mx-2" role="alert">\
                                        <i class="ri-error-warning-line me-2"></i>\
                                        '+getMessageResponse(jqXHR)+'\
                                    </div>\
                                </li>';
                    break;
            }

            containerContent.html(cards);
            activateOnClickBtnEditTipe();
            activateOnClickBtnAddAkun();
            activateOnClickBtnEditAkun();
            activateOnClickBtnDeleteAkun();

            containerSortableUrutan.innerHTML   =   liSortableUrutan;

            if (sortableUrutan) sortableUrutan.destroy();
            if (typeof Sortable !== 'undefined') {
                sortableUrutan  =   Sortable.create(containerSortableUrutan);
            }
            activateOnSubmitFormUrutanTipe();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function activateOnSubmitFormUrutanTipe() {
    modalUrutanTipe.find('form').off('submit');
    modalUrutanTipe.find('form').on('submit', function(e) {
        e.preventDefault();
        let arrUrutanTipe   =   Array.from(containerSortableUrutan.querySelectorAll('li')).map(function(li) { return li.getAttribute('data-id'); });
            dataSend        =   {arrUrutanTipe:arrUrutanTipe};

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveUrutanTipe",
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
                        modalUrutanTipe.modal('hide');
                        getCustomerDataDasarSosmedMarketplace();
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

function activateOnClickBtnEditTipe() {
    $('.btn-editTipe').off('click');
    $('.btn-editTipe').on('click', function() {
        let idTipe  =   $(this).data('id'),
            namaTipe=   $(this).data('nama-tipe'),
            iconTipe=   $(this).data('file-icon'),
            status  =   $(this).data('status');

        modalEditorTipe
        .find("#iconSosmedMarketplaceImg").removeAttr('src').attr("src", iconBaseUrl + iconTipe).end()
        .find('input[name="namaTipeSosmedMarketplace"]').val(namaTipe).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="idTipeSosmedMarketplace"]').val(idTipe).end()
        .find('input[name="iconFileName"]').val(iconTipe);

        modalEditorTipe.modal('show');
        modalEditorTipe.one('shown.bs.modal', function() {
            createUploaderIconSosmedMarketplace();
        });
        activateOnSubmitFormEditorTipe();
    });
}

function createUploaderIconSosmedMarketplace() {
    createUploadFileInput("uploadIconSosmedMarketplace", baseURLPath+"uploadIcon", function(files, data, jqXHR, pd) {
        var responseJSON=   jqXHR.responseJSON;
        modalEditorTipe.find("#iconSosmedMarketplaceImg").removeAttr('src').attr("src", responseJSON.urlIcon);
        modalEditorTipe.find('input[name="iconFileName"]').val(responseJSON.fileName);
    });
}

function activateOnSubmitFormEditorTipe() {
    modalEditorTipe.find('form').off('submit');
    modalEditorTipe.find('form').on('submit', function(e) {
        e.preventDefault();
        let formData    =   $(this).serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            dataSend[field.name]  =   field.value;
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveDataTipe",
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
                        modalEditorTipe.modal('hide');
                        getCustomerDataDasarSosmedMarketplace();
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

function activateOnClickBtnAddAkun() {
    $('.btn-tambahAkun').off('click');
    $('.btn-tambahAkun').on('click', function() {
        let idTipe  =   $(this).data('id'),
            namaTipe=   $(this).data('nama-tipe'),
            iconTipe=   $(this).data('file-icon');

        modalEditorAkun
        .find("#iconTipeSosmedMarketplaceImg").removeAttr('src').attr("src", iconBaseUrl + iconTipe).end()
        .find("#namaSosmedMarketplace").text(namaTipe).end()
        .find('input[name="namaAkun"]').val('').end()
        .find('input[name="urlAkun"]').val('').end()
        .find('input[name="idTipeSosmedMarketplace"]').val(idTipe).end()
        .find('input[name="idSosmedMarketplace"]').val('').end();
        
        modalEditorAkun.modal('show');
        activateOnSubmitFormEditorAkun();
    });
}

function activateOnClickBtnEditAkun() {
    $('.btn-editAkun').off('click');
    $('.btn-editAkun').on('click', function() {
        let idTipeSosmedMarketplace  =   $(this).data('id-tipe'),
            idSosmedMarketplace      =   $(this).data('id-akun'),
            namaTipe                 =   $(this).data('nama-tipe'),
            iconTipe                 =   $(this).data('icon-tipe'),
            namaAkun                 =   $(this).data('nama-akun'),
            urlAkun                  =   $(this).data('url-akun');

        modalEditorAkun
        .find("#iconTipeSosmedMarketplaceImg").removeAttr('src').attr("src", iconBaseUrl + iconTipe).end()
        .find("#namaSosmedMarketplace").text(namaTipe).end()
        .find('input[name="namaAkun"]').val(namaAkun).end()
        .find('input[name="urlAkun"]').val(urlAkun).end()
        .find('input[name="idTipeSosmedMarketplace"]').val(idTipeSosmedMarketplace).end()
        .find('input[name="idSosmedMarketplace"]').val(idSosmedMarketplace);

        modalEditorAkun.modal('show');
        activateOnSubmitFormEditorAkun();
    });
}

function activateOnSubmitFormEditorAkun() {
    modalEditorAkun.find('form').off('submit');
    modalEditorAkun.find('form').on('submit', function(e) {
        e.preventDefault();
        let formData    =   $(this).serializeArray(),
            dataSend    =   {};

        $.each(formData, function (index, field) {
            dataSend[field.name]  =   field.value;
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "saveDataAkun",
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
                        modalEditorAkun.modal('hide');
                        getCustomerDataDasarSosmedMarketplace();
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

function activateOnClickBtnDeleteAkun() {
    $('.btn-deleteAkun').off('click');
    $('.btn-deleteAkun').on('click', function() {
        let idSosmedMarketplace =   $(this).data('id-akun'),
            namaTipe            =   $(this).data('nama-tipe'),
            iconTipe            =   $(this).data('icon-tipe'),
            namaAkun            =   $(this).data('nama-akun'),
            elemBodyConfirm     =   '<div class="text-center">\
                                        <span class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 48px; height: 48px; background-color: #2D2D2D;">\
                                            <img src="'+iconBaseUrl + iconTipe+'" class="img-fluid" style="max-height: 22px;"/>\
                                        </span>\
                                        <span class="d-block">Apakah Anda yakin ingin menghapus akun;<br/><b>' + namaTipe + ' - ' + namaAkun + '</b>?</span>\
                                        <input type="hidden" name="idSosmedMarketplace" value="'+idSosmedMarketplace+'"/>\
                                    </div>';

        confirmActionShowDialog(elemBodyConfirm, function(dataSend) {
            $.ajax({
                type: 'POST',
                url: baseURLPath + "deleteDataAkun",
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
                            getCustomerDataDasarSosmedMarketplace();
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
    });
}

customerDataDasarSosmedMarketplaceFunc();
var baseURLPath         =   baseURL + "pengaturan/userLevelMenu/",
    modalEditor         =   $('#pengaturanUserLevelMenu-editor'),
    containerDataLevel  =   $('#pengaturanUserLevelMenu-listLevelUser');

if (pengaturanUserLevelMenuFunc == null) {
    var pengaturanUserLevelMenuFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#pengaturanUserLevelMenu-cardLevelUser',
                ['pengaturanUserLevelMenu-header', 'pengaturanUserLevelMenu-hr']
            );

            applyAutoResizeDocHeight(
                '#pengaturanUserLevelMenu-cardMenuLevel',
                ['pengaturanUserLevelMenu-header', 'pengaturanUserLevelMenu-hr']
            );
            
            $('#btnAddLevelUser').off('click');
            $('#btnAddLevelUser').on('click', function() {
                modalEditor
                .find('input[name="namaLevel"]').val('').end()
                .find('textarea[name="deskripsi"]').val('').end()
                .find('input[name="idLevelUser"]').val('').end();
                
                modalEditor.modal('show');
                activateOnSubmitFormEditor();
            });

            getDataLevelUserMenu();
        });
    }
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
            url: baseURLPath + "saveLevelUser",
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
                        getDataLevelUserMenu();
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

function getDataLevelUserMenu() {
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataLevelUser",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend({}),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    $.each(listData, function (index, arrayData) {
                        let badgeSuperAdmin =   parseInt(arrayData.ISSUPERADMIN) == 1 ? '<span class="badge text-bg-danger">Super Admin</span>' : '',
                            classSelected   =   (index === 0) ? 'border-2 border-primary' : '';
                        rows                +=  '<div class="list-group-item list-group-item-action d-flex align-items-center gap-2 border rounded-2 mb-2 ' + classSelected + '" data-id-user-level="' + arrayData.IDUSERADMINLEVEL + '">\
                                                    <div class="flex-grow-1 overflow-hidden">\
                                                        <div class="d-flex align-items-center flex-wrap gap-1 mb-1">\
                                                            <span class="fw-semibold text-truncate">' + arrayData.LEVELNAME + '</span>\
                                                            ' + badgeSuperAdmin + '\
                                                        </div>\
                                                        <p class="text-muted small text-truncate mb-0">' + arrayData.DESCRIPTION + '</p>\
                                                    </div>\
                                                    <button \
                                                        type="button" \
                                                        class="btn btn-sm btn-outline-primary flex-shrink-0 btn-detail-level" \
                                                        data-id-user-level="' + arrayData.IDUSERADMINLEVEL + '" \
                                                        data-nama-level="' + arrayData.LEVELNAME + '" \
                                                        data-deskripsi="' + arrayData.DESCRIPTION + '" \
                                                        title="Ubah Level User"\
                                                    >\
                                                        <i class="fa fa-pencil"></i>\
                                                    </button>\
                                                </div>';
                        if(index === 0) getDetailMenuLevelUser(arrayData.IDUSERADMINLEVEL);
                    });
                    break;
                case 404:
                default:
                    rows    =   '<div class="alert alert-warning mb-0" role="alert">'+getMessageResponse(jqXHR)+'</div>';
                    break;
            }
            
            containerDataLevel.html(rows);
            activateOnClickListGroupItem();
            activateOnClickBtnDetail();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        toggleWindowLoader(false);
    });
}

function activateOnClickListGroupItem() {
    containerDataLevel.find('.list-group-item').off('click').on('click', function () {
        let idUserLevel =   $(this).data('id-user-level');
        containerDataLevel.find('.list-group-item').removeClass('border-2 border-primary');
        $(this).addClass('border-2 border-primary');
        getDetailMenuLevelUser(idUserLevel);
    });
}

function activateOnClickBtnDetail() {
    $('.btn-detail-level').off('click').on('click', function() {
        let idUserLevel =   $(this).data('id-user-level'),
            namaLevel   =   $(this).data('nama-level'),
            deskripsi   =   $(this).data('deskripsi');

        modalEditor
        .find('input[name="namaLevel"]').val(namaLevel).end()
        .find('textarea[name="deskripsi"]').val(deskripsi).end()
        .find('input[name="idLevelUser"]').val(idUserLevel);

        modalEditor.modal('show');
        activateOnSubmitFormEditor();
    });
}

function getDetailMenuLevelUser(idUserLevel) {
    let $tableBody  =   $('#pengaturanUserLevelMenu-daftarMenuLevel').find('tbody'),
        columnNumber=   $tableBody.closest('table').find('thead > tr > th').length;
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDetailMenuLevelUser",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend({idUserLevel: idUserLevel}),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rowsMenu    =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData        =   responseJSON.listData,
                        platformAktif   =   '',
                        grupMenuAktif   =   '';
                    $.each(listData, function (index, arrayData) {
                        let idMenuAdmin =   arrayData.IDMENUADMIN,
                            cBPermission=   '';

                        for (let i = 1; i <= 3; i++) {
                            if (arrayData['PERMISSION' + i] != null && arrayData['PERMISSION' + i] != '') {
                                cBPermission+=  '<div class="form-check">\
                                                    <input type="checkbox" class="form-check-input solid-checkbox" name="menuLevelPermission-' + idMenuAdmin + '-' + i + '" ' + (arrayData['ALLOWPERMISSION' + i] == 1 ? 'checked' : '') + '>\
                                                    <label class="form-check-label" for="menuLevelCheck-' + idMenuAdmin + '-' + i + '">' + arrayData['PERMISSION' + i] + '</label>\
                                                </div>';
                            }
                        }

                        rowsMenu+=  '<tr data-idMenu="' + idMenuAdmin + '" data-idMenuLevelAdmin="' + arrayData.IDMENULEVELADMIN + '">\
                                        <td>' + (platformAktif != arrayData.NAMAPLATFORM ? arrayData.NAMAPLATFORM : '') + '<br></td>\
                                        <td>' + (grupMenuAktif != arrayData.GROUPNAME ? arrayData.GROUPNAME : '') + '<br></td>\
                                        <td>\
                                            ' + arrayData.MENUNAME + '<br>\
                                            <small class="text-muted">' + arrayData.DESCRIPTION + '</small>\
                                        </td>\
                                        <td>' + cBPermission + '</td>\
                                        <td>\
                                            <div class="form-check form-check-inline">\
                                                <input type="radio" class="form-check-input solid-radio" value="1" id="menuLevelYa-' + idMenuAdmin + '" name="menuLevelRadio-' + idMenuAdmin + '" ' + (arrayData.ISMENUOPEN == 1 ? 'checked' : '') + '>\
                                                <label class="form-check-label" for="menuLevelYa-' + idMenuAdmin + '">Ya</label>\
                                            </div>\
                                            <div class="form-check form-check-inline">\
                                                <input type="radio" class="form-check-input solid-radio" value="0" id="menuLevelTidak-' + idMenuAdmin + '" name="menuLevelRadio-' + idMenuAdmin + '" ' + (arrayData.ISMENUOPEN == 0 ? 'checked' : '') + '>\
                                                <label class="form-check-label" for="menuLevelTidak-' + idMenuAdmin + '">Tidak</label>\
                                            </div>\
                                        </td>\
                                    </tr>';
                        platformAktif   =   arrayData.NAMAPLATFORM;
                        grupMenuAktif   =   arrayData.GROUPNAME;
                    });
                    $('#pengaturanUserLevelMenu-idUserLevel').val(idUserLevel);
                    break;
                case 404:
                default:
                    rowsMenu=   '<tr>\
                                    <td colspan="'+columnNumber+'">\
                                        <div class="alert alert-warning mb-0" role="alert">'+getMessageResponse(jqXHR)+'</div>\
                                    </td>\
                                </tr>';
                    break;
            }
            
            $tableBody.html(rowsMenu);
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        toggleWindowLoader(false);
    });
}

$('#pengaturanUserLevelMenu-btnSaveMenuLevel').off('click').on('click', function (e) {
    e.preventDefault();
    let idUserLevel     =   $("#pengaturanUserLevelMenu-idUserLevel").val(),
        $tableBody      =   $('#pengaturanUserLevelMenu-daftarMenuLevel').find('tbody'),
        userLevelMenu   =   [];

    $tableBody.find('tr').each(function () {
        let idMenuAdmin     =   $(this).data('idmenu'),
            idMenuLevelAdmin=   $(this).data('idmenuleveladmin'),
            isMenuOpen      =   $(this).find('input[name="menuLevelRadio-' + idMenuAdmin + '"]:checked').val(),
            allowPermission1=   $(this).find('input[name="menuLevelPermission-' + idMenuAdmin + '-1"]').is(':checked') ? 1 : 0,
            allowPermission2=   $(this).find('input[name="menuLevelPermission-' + idMenuAdmin + '-2"]').is(':checked') ? 1 : 0,
            allowPermission3=   $(this).find('input[name="menuLevelPermission-' + idMenuAdmin + '-3"]').is(':checked') ? 1 : 0;

        userLevelMenu.push({
            idMenuAdmin: idMenuAdmin,
            idMenuLevelAdmin: idMenuLevelAdmin,
            isMenuOpen: isMenuOpen,
            allowPermission1: allowPermission1,
            allowPermission2: allowPermission2,
            allowPermission3: allowPermission3
        });
    });

    let dataSend = {
        idUserLevel: idUserLevel,
        userLevelMenu: userLevelMenu
    };

    $.ajax({
        type: 'POST',
        url: baseURLPath + "saveLevelMenu",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    getDetailMenuLevelUser(idUserLevel);
                    toastMessage("success", getMessageResponse(jqXHR));
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

pengaturanUserLevelMenuFunc();
if (userAdminFunc == null) {
    var userAdminFunc = function () {
        $(document).ready(function () {
            let  dataLevelMenu, lastIdUserAdmin;
            setOptionHelper('filterUserAdmin-optionLevelUserAdmin', 'dataUserAdminLevel');
            setOptionHelper('editorUserAdmin-optionLevelUserAdmin', 'dataUserAdminLevel');
            activatePasswordVisibility();
            getDataUserAdmin();
        });
    }
}

$('#filterUserAdmin-optionLevelUserAdmin').off('change');
$('#filterUserAdmin-optionLevelUserAdmin').on('change', function (e) {
    getDataUserAdmin();
});

$('#filterUserAdmin-searchKeyword').off('keypress');
$("#filterUserAdmin-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataUserAdmin();
    }
});

function getDataUserAdmin(idUserAdmin = false) {
    var $elemList = $('#list-userAdminData'),
        idLevelUserAdmin = $('#filterUserAdmin-optionLevelUserAdmin').val(),
        searchKeyword = $('#filterUserAdmin-searchKeyword').val(),
        dataSend = {
            idLevelUserAdmin: idLevelUserAdmin,
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "userAdmin/getDataUserAdmin",
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
            NProgress.set(0.4);
            $elemList.html(loaderElem);
            recalculateSimpleBar('simpleBar-list-userAdminData');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    let dataUserAdmin = responseJSON.dataUserAdmin,
                        dataMenu = responseJSON.dataMenu;
                    dataLevelMenu = responseJSON.dataLevelMenu;

                    $.each(dataUserAdmin, function (index, arrayUserAdmin) {
                        rows += '<li class="userAdmin-item mb-2 px-3 py-2 mx-2 border-bottom rounded-2 active bg-light" ' +
                            'data-idUserAdmin="' + arrayUserAdmin.IDUSERADMIN + '" ' +
                            'data-idUserAdminLevel="' + arrayUserAdmin.IDUSERADMINLEVEL + '" ' +
                            'data-name="' + arrayUserAdmin.NAME + '" ' +
                            'data-username="' + arrayUserAdmin.USERNAME + '" ' +
                            'data-email="' + arrayUserAdmin.EMAIL + '" ' +
                            'data-dateTimeLogin="' + arrayUserAdmin.DATETIMELOGIN + '" ' +
                            'data-dateTimeActivity="' + arrayUserAdmin.DATETIMEACTIVITY + '">' +
                            '<div class="pills-list-item d-flex align-items-center">' +
                            '<div class="flex-grow-1">' +
                            '<h5 class="text-truncate font-size-15 mb-1">' + arrayUserAdmin.NAME + '</h5>' +
                            '<p class="text-muted text-truncate mb-0">' + arrayUserAdmin.LEVELNAME + '</p>' +
                            '<p class="text-muted text-truncate mb-0">' + arrayUserAdmin.USERNAME + ' - ' + arrayUserAdmin.EMAIL + '</p>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    });
                    generateMenuList(dataMenu);
                    break;
                case 404:
                default:
                    rows = '<li class="text-center">' +
                        '<div class="alert alert-warning mb-0 mx-2" role="alert">' +
                        '<i class="ri-error-warning-line me-2"></i>' +
                        'No data found' +
                        '</div>' +
                        '</li>';
                    break;
            }

            $elemList.html(rows);
            activateOnClickUserAdminItem();
            if (!idUserAdmin) $('.userAdmin-item').first().trigger('click');
            if (idUserAdmin) $('.userAdmin-item[data-idUserAdmin=' + idUserAdmin + ']').trigger('click');
            recalculateSimpleBar('simpleBar-list-userAdminData');
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function refreshSimpleScrollBarDetailUserAdmin() {
    var sideMenuHeight = $(".side-menu").height(),
        sideMenuHeight = sideMenuHeight <= 80 ? $(document).height() : sideMenuHeight,
        userAdminListHeight = sideMenuHeight - 160;
    $("#simpleScrollBar-detailUserAdmin").css('height', userAdminListHeight + 'px');
    $('#simpleScrollBar-detailUserAdmin').sScrollBar();
}

function activateOnClickUserAdminItem() {
    $('.userAdmin-item').off('click');
    $('.userAdmin-item').on('click', function (e) {
        var idUserAdmin = $(this).attr('data-idUserAdmin'),
            idUserAdminLevel = $(this).attr('data-idUserAdminLevel'),
            name = $(this).attr('data-name'),
            username = $(this).attr('data-username'),
            email = $(this).attr('data-email'),
            dateTimeLogin = $(this).attr('data-dateTimeLogin'),
            dateTimeActivity = $(this).attr('data-dateTimeActivity');
        lastIdUserAdmin = idUserAdmin;
        resetFormEditorUserAdmin();
        $(".userAdmin-item").removeClass('active bg-light');
        $(this).addClass('active bg-light');

        $("#editorUserAdmin-name").val(name);
        $("#editorUserAdmin-username").val(username);
        $("#editorUserAdmin-email").val(email);

        $("#editorUserAdmin-optionLevelUserAdmin").val(idUserAdminLevel).trigger('change');
        $("#editorUserAdmin-idUserAdmin").val(idUserAdmin);

        $("#userAdminDetails-lastLogin").html(dateTimeLogin);
        $("#userAdminDetails-lastActivity").html(dateTimeActivity);
        $("#userAdmin-btnAddNewUserAdmin, #editorUserAdmin-containerCurrentPassword, #editorUserAdmin-containerDateTimeDetails").removeClass('d-none');
        $("#editorUserAdmin-form input, #editorUserAdmin-form option, #editorUserAdmin-form button").prop("disabled", false);
        $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', false);
        $("#editorUserAdmin-btnCancel").addClass('d-none');
        refreshSimpleScrollBarDetailUserAdmin();
    });
    activateOnClickPillsItem();
}

function generateMenuList(dataMenu) {
    let menuList = '';
    if (dataMenu.length > 0) {
        $.each(dataMenu, function (index, arrayMenu) {
            menuList += '<li class="list-group-item d-flex justify-content-between align-items-center" data-idMenu="' + arrayMenu.IDMENUADMIN + '">' + arrayMenu.MENUNAME + ' <i class="editorUserAdmin-menuListAvailableIcon ri-check-line text-success font-size-20"></i></li>';
        });
    } else {
        menuList = '<li class="list-group-item d-flex justify-content-between align-items-center">No menu assigned <i class="ri-close-line text-danger font-size-20"></i></li>';
    }
    $('#editorUserAdmin-menuListAvailable').html(menuList);
    $('#editorUserAdmin-optionLevelUserAdmin').trigger('change');
}

$('#userAdmin-btnAddNewUserAdmin').off('click');
$('#userAdmin-btnAddNewUserAdmin').on('click', function (e) {
    $("#filterUserAdmin-optionLevelUserAdmin, #filterUserAdmin-searchKeyword").prop("disabled", true);
    $('.userAdmin-item').off('click').removeClass('active bg-light');
    $("#userAdmin-btnAddNewUserAdmin, #editorUserAdmin-containerCurrentPassword, #editorUserAdmin-containerDateTimeDetails").addClass('d-none');
    $("#editorUserAdmin-form input, #editorUserAdmin-form option, #editorUserAdmin-form button").prop("disabled", false);
    $("#editorUserAdmin-btnCancel").removeClass('d-none');
    $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', true);
    resetFormEditorUserAdmin();
});

function resetFormEditorUserAdmin() {
    $('#editorUserAdmin-name, #editorUserAdmin-username, #editorUserAdmin-email').val("");
    $('#editorUserAdmin-optionLevelUserAdmin, #editorUserAdmin-idUserAdmin').val("");
    $('.editorUserAdmin-menuListAvailableIcon').removeClass('ri-check-line text-success').addClass('ri-close-line text-danger');
    $("#editorUserAdmin-currentPassword, #editorUserAdmin-password, #editorUserAdmin-repeatPassword").val("");
    $('#editorUserAdmin-optionLevelUserAdmin').trigger('change');
}

$('#editorUserAdmin-optionLevelUserAdmin').off('change');
$('#editorUserAdmin-optionLevelUserAdmin').on('change', function (e) {
    $(".editorUserAdmin-menuListAvailableIcon").removeClass('ri-check-line text-success').addClass('ri-close-line text-danger');
    if (typeof dataLevelMenu !== 'undefined' && dataLevelMenu.length > 0) {
        let idLevelUserAdmin = $(this).val();
        $.each(dataLevelMenu, function (index, arrayLevel) {
            if (arrayLevel.IDUSERADMINLEVEL == idLevelUserAdmin) {
                let idMenuLevel = arrayLevel.IDMENUADMIN,
                    elemListMenu = $('#editorUserAdmin-menuListAvailable').find('li[data-idMenu=' + idMenuLevel + ']');
                elemListMenu.find('.editorUserAdmin-menuListAvailableIcon').removeClass('ri-close-line text-danger').addClass('ri-check-line text-success');
            }
        });
    }
});

$('#editorUserAdmin-btnCancel').off('click');
$('#editorUserAdmin-btnCancel').on('click', function (e) {
    const elemUserAdminItem = $('.userAdmin-item[data-idUserAdmin=' + lastIdUserAdmin + ']');
    $("#filterUserAdmin-optionLevelUserAdmin, #filterUserAdmin-searchKeyword").prop("disabled", false);
    $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', false);
    activateOnClickUserAdminItem();

    if (elemUserAdminItem.length > 0) {
        elemUserAdminItem.trigger('click');
    } else {
        $("#userAdmin-btnAddNewUserAdmin, #editorUserAdmin-containerCurrentPassword, #editorUserAdmin-containerDateTimeDetails").removeClass('d-none');
        $("#editorUserAdmin-btnCancel").addClass('d-none');
        $("#editorUserAdmin-form input, #editorUserAdmin-form option, #editorUserAdmin-form button").prop("disabled", true);
        resetFormEditorUserAdmin();
    }
});

$('#editorUserAdmin-form').off('submit');
$('#editorUserAdmin-form').on('submit', function (e) {
    e.preventDefault();
    const idUserAdmin = $('#editorUserAdmin-idUserAdmin').val(),
        idLevelUserAdmin = $('#editorUserAdmin-optionLevelUserAdmin').val(),
        name = $('#editorUserAdmin-name').val(),
        username = $('#editorUserAdmin-username').val(),
        email = $('#editorUserAdmin-email').val(),
        currentPassword = $('#editorUserAdmin-currentPassword').val(),
        newPassword = $('#editorUserAdmin-password').val(),
        repeatPassword = $('#editorUserAdmin-repeatPassword').val();
    let dataSend = {
        idUserAdmin: idUserAdmin,
        idLevelUserAdmin: idLevelUserAdmin,
        name: name,
        username: username,
        email: email,
        currentPassword: currentPassword,
        newPassword: newPassword,
        repeatPassword: repeatPassword
    };

    if (idUserAdmin == "" && newPassword != repeatPassword) {
        showWarning("Password and Repeat Password is not match");
    } else {
        $.ajax({
            type: 'POST',
            url: baseURL + "userAdmin/saveUserAdmin",
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
                NProgress.set(0.4);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        let idUserAdmin = responseJSON.idUserAdmin;
                        getDataUserAdmin(idUserAdmin);
                        $("#filterUserAdmin-optionLevelUserAdmin, #filterUserAdmin-searchKeyword").prop("disabled", false);
                        $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', false);
                        showToast('success', jqXHR)
                        break;
                    case 400:
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

userAdminFunc();
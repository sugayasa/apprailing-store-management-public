var baseURLPath     =   baseURL + "pengaturan/daftarPengguna/",
    dataTableContent=   $('#pengaturanDaftarPengguna-cardContent').find('table:first').find('tbody').first(),
    modalEditor     =   $('#pengaturanDaftarPengguna-editor'),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length;

if (pengaturanDaftarPenggunaFunc == null) {
    var pengaturanDaftarPenggunaFunc = function () {
        $(document).ready(function () {
            setOptionHelper('pengaturanDaftarPengguna-level', 'dataUserAdminLevel');
            applyAutoResizeDocHeight(
                '#pengaturanDaftarPengguna-cardContent',
                ['pengaturanDaftarPengguna-header', 'pengaturanDaftarPengguna-hr']
            );
            getDataPengguna();

            $('#btnAddPengguna').on('click', function() {
                modalEditor
                .find('input[name="nama"]').val('').end()
                .find('input[name="email"]').val('').end()
                .find('select[name="level"]').val('').end()
                .find('input[name="username"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="password"]').val('').end()
                .find('input[name="konfirmasiPassword"]').val('').end()
                .find('input[name="idPengguna"]').val('');
                
                $('#pengaturanDaftarPengguna-alertUpdate').addClass('d-none');
                modalEditor.modal('show');
                activateOnSubmitFormEditor();
            });

            $('#pengaturanDaftarPengguna-searchKeyword').off('keydown');
            $('#pengaturanDaftarPengguna-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getDataPengguna();
                }
            });
        });
    }
}

function generateDataTable(pageNumber){
    getDataPengguna(pageNumber);
}

function getDataPengguna(pageNumber = 1) {
    let searchKeyword   =   $('#pengaturanDaftarPengguna-searchKeyword').val(),
        dataSend       =   {
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
            setElemDisabledProperty(['.paginationElem', '#btnAddPengguna', '#pengaturanDaftarPengguna-searchKeyword'], true);
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
                                            '<span><i class="far fa-check-circle text-success fa-fw fa-lg"></i> Aktif</span>' :
                                            '<span><i class="far fa-times-circle text-danger fa-fw fa-lg"></i> Tidak Aktif</span>',
                            btnEdit     =   '<button \
                                                class="btn btn-sm btn-icon btn-outline-primary btn-detail" \
                                                data-bs-toggle="tooltip" \
                                                data-bs-placement="top" \
                                                title="Ubah Data" \
                                                data-id-user="' + arrayData.IDUSERADMIN + '" \
                                                data-id-user-level="' + arrayData.IDUSERADMINLEVEL + '" \
                                                data-nama="' + arrayData.NAME + '" \
                                                data-username="' + arrayData.USERNAME + '" \
                                                data-email="' + arrayData.EMAIL + '" \
                                                data-status="' + arrayData.STATUS + '"\
                                            >\
                                                <i class="fa fa-edit"></i>\
                                            </button>';

                        rows    +=  '<tr>\
                                        <td>' + arrayData.LEVELNAME + '</td>\
                                        <td>' + arrayData.NAME + '</td>\
                                        <td>' + arrayData.USERNAME + '</td>\
                                        <td>' + arrayData.EMAIL + '</td>\
                                        <td>' + arrayData.DATETIMELOGIN + '</td>\
                                        <td>' + arrayData.DATETIMEACTIVITY + '</td>\
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
            setElemDisabledProperty(['.paginationElem', '#btnAddPengguna', '#pengaturanDaftarPengguna-searchKeyword'], false);
            generatePagination('pengaturanDaftarPengguna-paginationInfo', 'pengaturanDaftarPengguna-paginationControl', pageNumber, responseJSON.pageProperty);
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
        let idUser      =   $(this).data('id-user'),
            idUserLevel =   $(this).data('id-user-level'),
            nama        =   $(this).data('nama'),
            username    =   $(this).data('username'),
            email       =   $(this).data('email'),
            status      =   $(this).data('status');

        modalEditor
        .find('input[name="nama"]').val(nama).end()
        .find('input[name="email"]').val(email).end()
        .find('input[name="username"]').val(username).end()
        .find('select[name="level"]').val(idUserLevel).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="password"]').val('').end()
        .find('input[name="konfirmasiPassword"]').val('').end()
        .find('input[name="idPengguna"]').val(idUser).end();

        $('#pengaturanDaftarPengguna-alertUpdate').removeClass('d-none');
        modalEditor.modal('show');
        activateOnSubmitFormEditor();
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
                        getDataPengguna();
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

pengaturanDaftarPenggunaFunc();
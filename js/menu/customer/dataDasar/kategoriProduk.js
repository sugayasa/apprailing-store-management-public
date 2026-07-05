var baseURLPath     =   baseURL + "customer/dataDasar/kategoriProduk/",
    dataTableContent=   $('#customerDataDasarKategoriProduk-cardContent').find('table:first').find('tbody').first(),
    modalEditor     =   $('#customerDataDasarKategoriProduk-editor'),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length;

if (customerDataDasarKategoriProdukFunc == null) {
    var customerDataDasarKategoriProdukFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerDataDasarKategoriProduk-cardContent',
                ['customerDataDasarKategoriProduk-header', 'customerDataDasarKategoriProduk-hr']
            );
            getCustomerDataDasarKategoriProduk();

            $('#btnAddKategoriProduk').on('click', function() {
                modalEditor
                .find('input[name="kategoriProduk"]').val('').end()
                .find('textarea[name="deskripsi"]').val('').end()
                .find('input[name="status"][value="1"]').prop('checked', true).end()
                .find('input[name="idKategoriProduk"]').val('');

                modalEditor.modal('show');
                activateOnSubmitFormEditor();
            });

            $('#customerDataDasarKategoriProduk-searchKeyword').off('keydown');
            $('#customerDataDasarKategoriProduk-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerDataDasarKategoriProduk();
                }
            });
        });
    }
}

function generateDataTable(pageNumber){
    getCustomerDataDasarKategoriProduk(pageNumber);
}

function getCustomerDataDasarKategoriProduk(pageNumber = 1) {
    let searchKeyword   =   $('#customerDataDasarKategoriProduk-searchKeyword').val(),
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
            setElemDisabledProperty(['.paginationElem', '#btnAddKategoriProduk', '#customerDataDasarKategoriProduk-searchKeyword'], true);
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
                                                data-id="' + arrayData.IDKATEGORI + '" \
                                                data-nama-kategori="' + arrayData.NAMAKATEGORI + '" \
                                                data-deskripsi="' + arrayData.DESKRIPSI + '" \
                                                data-status="' + arrayData.STATUS + '"\
                                            >\
                                                <i class="fa fa-edit"></i>\
                                            </button>';

                        rows    +=  '<tr>\
                                        <td>' + arrayData.NAMAKATEGORI + '</td>\
                                        <td>' + arrayData.DESKRIPSI + '</td>\
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
            setElemDisabledProperty(['.paginationElem', '#btnAddKategoriProduk', '#customerDataDasarKategoriProduk-searchKeyword'], false);
            generatePagination('customerDataDasarKategoriProduk-paginationInfo', 'customerDataDasarKategoriProduk-paginationControl', pageNumber, responseJSON.pageProperty);
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
        let idKategori  =   $(this).data('id'),
            namaKategori=   $(this).data('nama-kategori'),
            deskripsi   =   $(this).data('deskripsi'),
            status      =   $(this).data('status');

        modalEditor
        .find('input[name="kategoriProduk"]').val(namaKategori).end()
        .find('textarea[name="deskripsi"]').val(deskripsi).end()
        .find('input[name="status"][value="' + parseInt(status) + '"]').prop('checked', true).end()
        .find('input[name="idKategoriProduk"]').val(idKategori).end()
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
                        getCustomerDataDasarKategoriProduk();
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

customerDataDasarKategoriProdukFunc();
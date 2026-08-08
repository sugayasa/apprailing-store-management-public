var baseURLPath     =   baseURL + "customer/customer/kritikSaran/",
    dataTableContent=   $('#customerKritikSaran-cardContent').find('table:first').find('tbody').first(),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length,
    modalDetail     =   $('#customerKritikSaran-detail');

if (customerKritikSaranFunc == null) {
    var customerKritikSaranFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKritikSaran-cardContent',
                ['customerKritikSaran-header', 'customerKritikSaran-hr', 'customerKritikSaran-statistikRow', 'customerKritikSaran-alert']
            );

            $('#customerKritikSaran-searchKeyword').off('keydown');
            $('#customerKritikSaran-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    getCustomerKritikSaran();
                }
            });

            getCustomerKritikSaran();
        });

        $('#customerKritikSaran-rentangTanggal').datepicker({
            autoclose: true,
            format: 'dd MM yyyy',
            language: 'id',
            todayHighlight: true,
            toggleActive: true
        }).on('changeDate', function (e) {
            getCustomerKritikSaran();
        });

        var today       =   new Date();
        var sixtyDaysAgo=   new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);

        $('#customerKritikSaran-rentangTanggal input[name="tanggalAwal"]').datepicker('setDate', sixtyDaysAgo);
        $('#customerKritikSaran-rentangTanggal input[name="tanggalAkhir"]').datepicker('setDate', today);
    }
}

function generateDataTable(pageNumber){
    getCustomerKritikSaran(pageNumber);
}

function getCustomerKritikSaran(pageNumber = 1) {
    let tanggalAwalVal  =   $('#customerKritikSaran-rentangTanggal input[name="tanggalAwal"]').datepicker('getDate'),
        tanggalAkhirVal =   $('#customerKritikSaran-rentangTanggal input[name="tanggalAkhir"]').datepicker('getDate'),
        tanggalAwal     =   tanggalAwalVal ? formatDateYMDBootstrapDatePicker(tanggalAwalVal) : '',
        tanggalAkhir    =   tanggalAkhirVal ? formatDateYMDBootstrapDatePicker(tanggalAkhirVal) : '',
        searchKeyword   =   $('#customerKritikSaran-searchKeyword').val(),
        dataSend        =   {
            tanggalAwal: tanggalAwal,
            tanggalAkhir: tanggalAkhir,
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
            toggleWindowLoader(true);
            dataTableContent.html("<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON=   jqXHR.responseJSON,
                rows        =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData;

                    $.each(listData, function (index, arrayData) {
                        rows    +=  '<tr class="dataKritikSaran-row" title="Klik untuk melihat detail">\
                                        <td data-tag="input-tanggal-waktu">' + arrayData.INPUTTANGGALWAKTU + '</td>\
                                        <td data-tag="detail-customer">\
                                            <b data-tag="nama">' + arrayData.NAMA + '</b><br>\
                                            <span data-tag="email">' + arrayData.EMAIL + '</span><br>\
                                            <span data-tag="nomor-hp">' + arrayData.NOMORHP + '</span>\
                                        </td>\
                                        <td data-tag="subyek">' + arrayData.SUBYEK + '</td>\
                                        <td data-tag="pesan" data-pesan="' + arrayData.PESAN + '" class="text-truncate">' + arrayData.PESAN + '</td>\
                                    </tr>';
                    });
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            dataTableContent.html(rows);
            generatePagination('customerKritikSaran-paginationInfo', 'customerKritikSaran-paginationControl', pageNumber, responseJSON.pageProperty);
            activateOnClickRowData();
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        toggleWindowLoader(false);
        setUserToken(jqXHR);
    });
}

function activateOnClickRowData() {
    $('.dataKritikSaran-row').off('click');
    $('.dataKritikSaran-row').on('click', function() {
        let prefixDetailElem    =   '#customerKritikSaran-detail-',
            rowData             =   $(this),
            inputTanggalWaktu   =   rowData.find('td[data-tag="input-tanggal-waktu"]').text(),
            detailCustomer      =   rowData.find('td[data-tag="detail-customer"]'),
            namaCustomer        =   detailCustomer.find('b[data-tag="nama"]').text(),
            email               =   detailCustomer.find('span[data-tag="email"]').text(),
            nomorHp             =   detailCustomer.find('span[data-tag="nomor-hp"]').text(),
            subyek              =   rowData.find('td[data-tag="subyek"]').text(),
            pesan               =   rowData.find('td[data-tag="pesan"]').attr('data-pesan');

        $(prefixDetailElem+"nama").html(namaCustomer);
        $(prefixDetailElem+"email").html(email);
        $(prefixDetailElem+"noTelpon").html(nomorHp);
        $(prefixDetailElem+"tanggalWaktu").html(inputTanggalWaktu);
        $(prefixDetailElem+"subyek").html(subyek);
        $(prefixDetailElem+"pesan").html(pesan);
        
        modalDetail.modal('show');
    });
}

customerKritikSaranFunc();
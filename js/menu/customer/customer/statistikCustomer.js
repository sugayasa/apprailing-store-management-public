var baseURLPath                 =   baseURL + "customer/customer/statistikCustomer/",
    grafikKunjunganCanvas       =   $('#customerStatistikCustomer-grafikKunjunganCanvas'),
    defaultEmptyCardContent     =   '<div class="text-center py-4">\
                                        <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                        <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                    </div>',
    arrElemTotalDataKunjungan   =   [
        'totalKunjungan',
        'jumlahPerangkat',
        'jumlahTamu',
        'jumlahRegistrasi',
        'jumlahTeregistrasi',
        'rerataKunjungan'
    ];

if (customerDaftarCustomerFunc == null) {
    var customerDaftarCustomerFunc = function () {
        $(document).ready(function () {
            getCustomerStatistikCustomer();
        });

        $('#customerStatistikCustomer-rentangTanggal').datepicker({
            autoclose: true,
            format: 'dd MM yyyy',
            language: 'id',
            todayHighlight: true,
            toggleActive: true
        });

        var today           =   new Date();
        var thirtyDaysAgo   =   new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAwal"]').datepicker('setDate', thirtyDaysAgo);
        $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAkhir"]').datepicker('setDate', today);
        $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAwal"], #customerStatistikCustomer-rentangTanggal input[name="tanggalAkhir"]').on('change', function () {
            getCustomerStatistikCustomer();
        });
    }
}

function getCustomerStatistikCustomer() {
    let tanggalAwalVal  =   $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAwal"]').datepicker('getDate');
    let tanggalAkhirVal =   $('#customerStatistikCustomer-rentangTanggal input[name="tanggalAkhir"]').datepicker('getDate');
    let tanggalAwal     =   tanggalAwalVal ? formatDateYMDBootstrapDatePicker(tanggalAwalVal) : '';
    let tanggalAkhir    =   tanggalAkhirVal ? formatDateYMDBootstrapDatePicker(tanggalAkhirVal) : '';
    let dataSend        =   {
        tanggalAwal: tanggalAwal,
        tanggalAkhir: tanggalAkhir
    };

    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataStatistik",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true },
        headers: {Authorization: 'Bearer ' + getUserToken()},
        beforeSend: function () {
            Pace.start();
            grafikKunjunganCanvas.html(loaderElem);
            resetTotalDataKunjunganElem();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let jumlahHariPeriode   =   responseJSON.jumlahHariPeriode,
                        arrTanggalPeriode   =   responseJSON.arrTanggalPeriode,
                        dataGrafikKunjungan =   responseJSON.dataGrafikKunjungan,
                        dataKunjunganRekap  =   responseJSON.dataKunjunganRekap;

                    generateChartKunjungan(arrTanggalPeriode, dataGrafikKunjungan);
                    setDataKunjunganElem(jumlahHariPeriode, dataKunjunganRekap);
                    break;
                default:
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function resetTotalDataKunjunganElem() {
    arrElemTotalDataKunjungan.forEach(function (selector) {
        $('#customerStatistikCustomer-'+selector).html('0');
    });
}

function setDataKunjunganElem(jumlahHariPeriode, dataKunjunganRekap) {
    arrElemTotalDataKunjungan.forEach(function (selector) {
        if (selector != 'rerataKunjungan'){
            $('#customerStatistikCustomer-'+selector).html(numberFormat(dataKunjunganRekap[selector] ?? '0'));
        } else {
            let rerataKunjungan = (dataKunjunganRekap['totalKunjungan'] ?? 0) / jumlahHariPeriode;
            $('#customerStatistikCustomer-'+selector).html(numberFormat(rerataKunjungan));
        }
    });
}

function generateChartKunjungan(arrTanggalPeriode, dataGrafikKunjungan) {
    var ctx = document.getElementById('customerStatistikCustomer-grafikKunjunganCanvas');

    dataGrafikKunjungan.forEach(function (dataset) {
        if (dataset.pointBackgroundColor === 'app.color.componentBg') {
            dataset.pointBackgroundColor = 'transparent';
        }
    });

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: arrTanggalPeriode,
            datasets: dataGrafikKunjungan
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0
                }
            }
        }
    });
}

customerDaftarCustomerFunc();
var baseURLPath             =   baseURL + "customer/customer/reviewMarketing/",
    grafikReviewCanvas      =   $('#customerReviewMarketing-grafikReviewCanvas'),
    tableContentPeringkat   =   $('#customerReviewMarketing-cardTabelPeringkat').find('table:first').find('tbody').first(),
    totalColumnsPeringkat   =   tableContentPeringkat.closest('table').find('thead:first').find('th').length,
    tableContentReview      =   $('#customerReviewMarketing-cardTabelReview').find('table:first').find('tbody').first(),
    totalColumnsReview      =   tableContentReview.closest('table').find('thead:first').find('th').length,
    emptyContentElem        =   '<div class="text-center py-4">\
                                    <i class="fa fa-inbox fa-3x text-muted mb-3"></i>\
                                    <p class="text-muted mb-0">Tidak ada data tersedia</p>\
                                </div>'
    pageNumberTableReview   =   1,
    arrElemAutoResizeReducer=   [
        'customerReviewMarketing-header',
        'customerReviewMarketing-hr',
        'customerReviewMarketing-statistikRow'
    ],
    ringkasanReviewElemStr  =   [
        'totalReview',
        'ratingRerata',
        'totalMarketing',
        'rerataHarian'
    ];

if (customerReviewMarketingFunc == null) {
    var customerReviewMarketingFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerReviewMarketing-cardTabelPeringkat',
                [...arrElemAutoResizeReducer, 'customerReviewMarketing-cardTabelPeringkat-header']
            );
            applyAutoResizeDocHeight(
                '#customerReviewMarketing-cardTabelReview',
                [...arrElemAutoResizeReducer, 'customerReviewMarketing-cardTabelReview-header']
            );
        });

        var today       =   new Date();
        var sixtyDaysAgo=   new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);

        $('#customerReviewMarketing-rentangTanggal').datepicker({
            autoclose: true,
            format: 'dd MM yyyy',
            language: 'id',
            todayHighlight: true,
            toggleActive: true
        });

        $('#customerReviewMarketing-rentangTanggal input[name="tanggalAwal"]').datepicker('setDate', sixtyDaysAgo);
        $('#customerReviewMarketing-rentangTanggal input[name="tanggalAkhir"]').datepicker('setDate', today);
        $('#customerReviewMarketing-rentangTanggal').on('changeDate', function (e) {
            getCustomerReviewMarketing();
        });

        getCustomerReviewMarketing();
    }
}

function generateDataTableReviewCustomer(pageNumber){
    getDataTableReviewCustomer(pageNumber);
}

function getCustomerReviewMarketing() {
    let tanggalAwalVal  =   $('#customerReviewMarketing-rentangTanggal input[name="tanggalAwal"]').datepicker('getDate'),
        tanggalAkhirVal =   $('#customerReviewMarketing-rentangTanggal input[name="tanggalAkhir"]').datepicker('getDate'),
        tanggalAwal     =   tanggalAwalVal ? formatDateYMDBootstrapDatePicker(tanggalAwalVal) : '',
        tanggalAkhir    =   tanggalAkhirVal ? formatDateYMDBootstrapDatePicker(tanggalAkhirVal) : '',
        dataSend        =   {
            tanggalAwal: tanggalAwal,
            tanggalAkhir: tanggalAkhir,
            pageNumber: 1
        };
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataStatistik",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
            grafikReviewCanvas.html(loaderElem);
            resetRingkasanReviewElem();
            tableContentPeringkat.html("<tr><td colspan='" + totalColumnsPeringkat + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
            tableContentReview.html("<tr><td colspan='" + totalColumnsReview + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let jumlahHariPeriode   =   responseJSON.jumlahHariPeriode,
                        arrTanggalPeriode   =   responseJSON.arrTanggalPeriode,
                        dataGrafikReview    =   responseJSON.dataGrafikReview,
                        dataRingkasan       =   responseJSON.dataRingkasan,
                        dataPeringkat       =   responseJSON.dataPeringkat,
                        dataTableReview     =   responseJSON.dataTableReview;

                    generateChartReview(arrTanggalPeriode, dataGrafikReview);
                    setRingkasanReviewElem(dataRingkasan);
                    setPeringkatMarketingElem(dataPeringkat);
                    setDataTableReviewElem(dataTableReview);
                    break;
                default:
                    grafikReviewCanvas.html(emptyContentElem);
                    tableContentPeringkat.html("<tr><td colspan='" + totalColumnsPeringkat + "' class='text-center border-bottom-0'>" + emptyContentElem + "</td></tr>");
                    tableContentReview.html("<tr><td colspan='" + totalColumnsReview + "' class='text-center border-bottom-0'>" + emptyContentElem + "</td></tr>");
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        toggleWindowLoader(false);
        setUserToken(jqXHR);
    });
}

function resetRingkasanReviewElem() {
    ringkasanReviewElemStr.forEach(function (selector) {
        $('#customerReviewMarketing-'+selector).html('0');
    });
}

function generateChartReview(arrTanggalPeriode, dataGrafikReview) {
    var ctx = document.getElementById('customerReviewMarketing-grafikReviewCanvas');

    dataGrafikReview.forEach(function (dataset) {
        if (dataset.pointBackgroundColor === 'app.color.componentBg') {
            dataset.pointBackgroundColor = 'transparent';
        }
    });

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: arrTanggalPeriode,
            datasets: dataGrafikReview
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0
                }
            },
            layout: {
                padding: 0
            }
        }
    });
}

function setRingkasanReviewElem(dataRingkasan) {
    ringkasanReviewElemStr.forEach(function (selector) {
        $('#customerReviewMarketing-'+selector).html(numberFormat(dataRingkasan[selector] ?? '0'));
    });
}

function generateStarRating(rating) {
    var r           =   parseFloat(rating) || 0,
        fullStars   =   Math.floor(r),
        hasHalf     =   (r - fullStars) >= 0.5 ? 1 : 0,
        emptyStars  =   5 - fullStars - hasHalf,
        html        =   '';

    for (var i = 0; i < fullStars; i++)  html += '<i class="fa fa-star text-warning" style="font-size:11px;"></i>';
    if (hasHalf)                          html += '<i class="fa fa-star-half text-warning" style="font-size:11px;"></i>';
    for (var i = 0; i < emptyStars; i++) html += '<i class="fa fa-star text-muted" style="font-size:11px;"></i>';

    return '<span class="me-1">' + html + '</span>';
}

function setPeringkatMarketingElem(dataPeringkat) {
    let rowContent = '';

    dataPeringkat.forEach(function (item, index) {
        rowContent  += '<tr>\
                            <td class="text-end fw-600">' + (index + 1) + '</td>\
                            <td>\
                                <div class="d-flex align-items-center gap-2">\
                                    <img src="' + baseURLImageMarketing + (item.IMAGE ?? 'default.jpg') + '" \
                                        class="rounded-circle flex-shrink-0" \
                                        style="width:36px;height:36px;object-fit:cover;border:1px solid #dee2e6;" \
                                        onerror="this.src=\'' + baseURLImageMarketing + 'default.jpg\'">\
                                    <div class="overflow-hidden">\
                                        <div class="fw-600 text-truncate">' + (item.NAMAMARKETING ?? '-') + '</div>\
                                        <div class="fs-12px text-muted text-truncate">' + (item.NAMAREGIONAL ?? '-') + '</div>\
                                    </div>\
                                </div>\
                            </td>\
                            <td><span class="fs-13px fw-600 mb-0">' + (item.RATINGRERATA ?? '0') + '</span><br/>' + generateStarRating(item.RATINGRERATA) + '</td>\
                            <td class="text-end">' + (item.TOTALREVIEW ?? '0') + ' Review</td>\
                        </tr>';
    });
    tableContentPeringkat.html(rowContent);
}

function setDataTableReviewElem(dataTableReview) {
    let dataReview  =   dataTableReview.dataReview,
        pageProperty=   dataTableReview.pageProperty,
        rowContent  =   '';

    dataReview.forEach(function (item) {
        rowContent  += '<tr>\
                            <td class="text-center">' + (item.TANGGAL ?? '-') + '</td>\
                            <td>' + (item.NAMACUSTOMER ?? '-') + '</td>\
                            <td>' + (item.NAMAMARKETING ?? '-') + '</td>\
                            <td>' + generateStarRating(item.RATING) + '</td>\
                            <td>' + (item.KOMENTAR ?? '-') + '</td>\
                        </tr>';
    });

    tableContentReview.html(rowContent);
    generatePagination(
        'customerReviewMarketing-paginationInfo',
        'customerReviewMarketing-paginationControl',
        pageProperty.currentPage,
        pageProperty,
        'comboBoxPagination',
        'generateDataTableReviewCustomer'
    );
}

function generateDataTableReviewCustomer(pageNumber, dataPerPage) {
    let tanggalAwalVal  =   $('#customerReviewMarketing-rentangTanggal input[name="tanggalAwal"]').datepicker('getDate'),
        tanggalAkhirVal =   $('#customerReviewMarketing-rentangTanggal input[name="tanggalAkhir"]').datepicker('getDate'),
        tanggalAwal     =   tanggalAwalVal ? formatDateYMDBootstrapDatePicker(tanggalAwalVal) : '',
        tanggalAkhir    =   tanggalAkhirVal ? formatDateYMDBootstrapDatePicker(tanggalAkhirVal) : '',
        dataSend        =   {
            tanggalAwal: tanggalAwal,
            tanggalAkhir: tanggalAkhir,
            pageNumber: pageNumber
        };
    $.ajax({
        type: 'POST',
        url: baseURLPath + "getDataTableReview",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {withCredentials: true},
        headers: {Authorization: "Bearer " + getUserToken()},
        beforeSend: function () {
            Pace.start();
            toggleWindowLoader(true);
            tableContentReview.html("<tr><td colspan='" + totalColumnsReview + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let dataTableReview     =   responseJSON.dataTableReview;
                    setDataTableReviewElem(dataTableReview);
                    break;
                default:
                    tableContentReview.html("<tr><td colspan='" + totalColumnsReview + "' class='text-center border-bottom-0'>" + emptyContentElem + "</td></tr>");
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        toggleWindowLoader(false);
        setUserToken(jqXHR);
    });
}

customerReviewMarketingFunc();
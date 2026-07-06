var baseURLPath         =   baseURL + "customer/konten/feed/",
    currentPageNumber   =   1,
    totalPageNumber     =   1,
    dataTableContent    =   $('#customerKontenFeed-cardContent').find('table:first').find('tbody').first(),
    totalColumns        =   dataTableContent.closest('table').find('thead:first').find('th').length,
    modalEditor         =   $('#customerKontenFeed-editor'),
    feedVideoContainer  =   $('#customerKontenFeed-feedContainer');

if (customerKontenFeedFunc == null) {
    var customerKontenFeedFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#customerKontenFeed-daftarDetailContainer',
                ['customerKontenFeed-header', 'customerKontenFeed-hr', 'customerKontenFeed-daftarDetailHeader']
            );
            
            applyAutoResizeDocHeight(
                '#customerKontenFeed-feedContainer',
                ['customerKontenFeed-header', 'customerKontenFeed-hr', 'customerKontenFeed-feedHeader', 'customerKontenFeed-feedFooter']
            );
            getCustomerKontenFeed(1);

            $('#btnAddFeed').on('click', function() {
                modalEditor
                .find('input[name="judul"]').val('').end()
                .find('input[name="urlFeed"]').val('').end()
                .find('textarea[name="deskripsi"]').val('').end()
                .find('input[name="idFeed"]').val('');

                modalEditor.modal('show');
                activateOnSubmitFormEditorFeed();
            });

            $('#customerKontenFeed-searchKeyword').off('keydown');
            $('#customerKontenFeed-searchKeyword').on('keydown', function(e) {
                if(e.which === 13){
                    e.preventDefault();
                    currentPageNumber   =   1;
                    getCustomerKontenFeed(1);
                }
            });
        });
    }
}

// Intersection Observer untuk mendeteksi baris terakhir tabel agar hit get data halaman selanjutnya
var lastRowObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            if (currentPageNumber < totalPageNumber) {
                currentPageNumber++;
                getCustomerKontenFeed(currentPageNumber);
            }
        }
    });
}, {
    root: document.getElementById('customerKontenFeed-daftarDetailContainer'),
    threshold: 0.1
});

var observeLastRow = function() {
    lastRowObserver.disconnect();
    var lastRow = dataTableContent.find('tr:last');
    if (lastRow.length) {
        lastRowObserver.observe(lastRow[0]);
    }
};

function generateDataTable(pageNumber){
    getCustomerKontenFeed(pageNumber);
}

function getCustomerKontenFeed(pageNumber = 1) {
    let searchKeyword   =   $('#customerKontenFeed-searchKeyword').val(),
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
            let rowLoaderElem   =   "<tr id='rowLoader'><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>";
            Pace.start();
            setElemDisabledProperty(['.paginationElem', '#btnAddFeed', '#customerKontenFeed-searchKeyword'], true);
            if(pageNumber == 1) dataTableContent.html(rowLoaderElem);
            if(pageNumber != 1) dataTableContent.append(rowLoaderElem);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON    =   jqXHR.responseJSON,
                rows            =   "",
                firstURLFeed    =   "";

            switch (jqXHR.status) {
                case 200:
                    let listData    =   responseJSON.listData,
                        pageProperty=   responseJSON.pageProperty;

                    totalPageNumber =   pageProperty.pageTotal;
                    $.each(listData, function (index, arrayData) {
                        let btnEdit =   '<button \
                                            class="btn btn-sm btn-icon btn-outline-primary btn-detail" \
                                            data-bs-toggle="tooltip" \
                                            data-bs-placement="top" \
                                            title="Ubah Data" \
                                            data-id="' + arrayData.IDFEED + '" \
                                            data-judul="' + arrayData.JUDUL + '" \
                                            data-deskripsi="' + arrayData.DESKRIPSI + '" \
                                            data-url-feed="' + arrayData.URLFEED + '" \
                                        >\
                                            <i class="fa fa-edit"></i>\
                                        </button>';
                        rows        +=  '<tr>\
                                            <td class="text-break">' + arrayData.JUDUL + '</td>\
                                            <td class="text-break">' + arrayData.DESKRIPSI + '</td>\
                                            <td class="text-break">\
                                                <a href="' + arrayData.URLFEED + '" target="_blank">' + arrayData.URLFEED + '</a>\
                                            </td>\
                                            <td class="text-break text-end">' + numberFormat(arrayData.TOTALSUKA) + '</td>\
                                            <td class="text-break text-end">' + numberFormat(arrayData.TOTALSIMPAN) + '</td>\
                                            <td>' + arrayData.INPUTUSER + '<br/>' + arrayData.INPUTTANGGALWAKTUSTR + '</td>\
                                            <td class="text-end">' + btnEdit + '</td>\
                                        </tr>';
                        if(index == 0) firstURLFeed =   arrayData.URLFEED;
                    });
                    break;
                case 404:
                default:
                    rows    =   '<tr><td colspan="'+totalColumns+'" class="text-center">'+getMessageResponse(jqXHR)+'</td></tr>';
                    break;
            }

            if(pageNumber == 1) {
                loadVideoFeed(firstURLFeed);
                dataTableContent.html(rows);
                if(jqXHR.status == 200) dataTableContent.find('tr:first').addClass('table-selected-row');
            }
            if(pageNumber != 1) dataTableContent.append(rows);
            setElemDisabledProperty(['.paginationElem', '#btnAddFeed', '#customerKontenFeed-searchKeyword'], false);

            if(jqXHR.status == 200) {
                observeLastRow();
                activateOnClickBtnDetail();
                activateOnClickRowData();
                activateOnClickNextPrevVideoButton();
            }
        }
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
        $("#rowLoader").remove();
    });
}

function activateOnClickBtnDetail() {
    $('.btn-detail').off('click');
    $('.btn-detail').on('click', function() {
        let idFeed      =   $(this).data('id'),
            judul       =   $(this).data('judul'),
            urlFeed     =   $(this).data('url-feed'),
            deskripsi   =   $(this).data('deskripsi');

        modalEditor
        .find('input[name="judul"]').val(judul).end()
        .find('input[name="urlFeed"]').val(urlFeed).end()
        .find('textarea[name="deskripsi"]').val(deskripsi).end()
        .find('input[name="idFeed"]').val(idFeed);

        modalEditor.modal('show');
        activateOnSubmitFormEditorFeed();
    });
}

function activateOnClickRowData() {
    dataTableContent.find('tr').off('click');
    dataTableContent.find('tr').on('click', function() {
        dataTableContent.find('tr').removeClass('table-selected-row');
        $(this).addClass('table-selected-row');

        var urlFeed = $(this).find('td').eq(2).find('a').attr('href');
        if (urlFeed) loadVideoFeed(urlFeed);
    });
}

function activateOnSubmitFormEditorFeed() {
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
                        customerKontenFeedFunc();
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

function loadVideoFeed(urlFeed) {
    if (!urlFeed) {
        feedVideoContainer.html(
            '<div class="text-center text-muted py-5">\
                <i class="fa fa-fw fa-video-camera fa-3x mb-3 d-block mx-auto"></i>\
                Pilih feed untuk melihat preview video\
            </div>');
        return;
    }

    var videoId =   getYoutubeVideoId(urlFeed);

    if (!videoId) {
        feedVideoContainer.html(
            '<div class="text-center text-muted py-5">URL video tidak valid</div>'
        );
        return;
    }

    feedVideoContainer.html(
        '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&loop=1&playlist=' + videoId + '" '+
        'allowfullscreen ' +
        'allow="autoplay; fullscreen; picture-in-picture" ' +
        'style="border:0; width:100%; height:100%;">' +
        '</iframe>'
    );
}

function activateOnClickNextPrevVideoButton(){
    var $headerBtn  =   $('#customerKontenFeed-feedHeader'),
        $footerBtn  =   $('#customerKontenFeed-feedFooter');

    function updateNavState() {
        var $rows       =   dataTableContent.find('tr'),
            $activeRow  =   $rows.filter('.table-selected-row'),
            activeIndex =   $rows.index($activeRow),
            totalRows   =   $rows.length;

        // Disable header jika di baris pertama
        if (activeIndex <= 0) {
            $headerBtn.addClass('disabled text-muted').css('pointer-events', 'none');
        } else {
            $headerBtn.removeClass('disabled text-muted').css('pointer-events', '');
        }

        // Disable footer jika di baris terakhir
        if (activeIndex >= totalRows - 1 || totalRows === 0) {
            $footerBtn.addClass('disabled text-muted').css('pointer-events', 'none');
        } else {
            $footerBtn.removeClass('disabled text-muted').css('pointer-events', '');
        }
    }

    // Listener header (previous)
    $headerBtn.off('click').on('click', function() {
        var $rows       =   dataTableContent.find('tr'),
            $activeRow  =   $rows.filter('.table-selected-row'),
            activeIndex =   $rows.index($activeRow);

        if (activeIndex > 0) {
            var $prevRow    =   $rows.eq(activeIndex - 1),
                urlFeed     =   $prevRow.find('td').eq(2).find('a').attr('href');

            $rows.removeClass('table-selected-row');
            $prevRow.addClass('table-selected-row');

            if (urlFeed) loadVideoFeed(urlFeed);
            updateNavState();

            // Scroll row ke dalam view
            $prevRow[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // Listener footer (next)
    $footerBtn.off('click').on('click', function() {
        var $rows       =   dataTableContent.find('tr'),
            $activeRow  =   $rows.filter('.table-selected-row'),
            activeIndex =   $rows.index($activeRow);

        if (activeIndex < $rows.length - 1) {
            var $nextRow    =   $rows.eq(activeIndex + 1),
                urlFeed     =   $nextRow.find('td').eq(2).find('a').attr('href');

            $rows.removeClass('table-selected-row');
            $nextRow.addClass('table-selected-row');

            if (urlFeed) loadVideoFeed(urlFeed);
            updateNavState();

            // Scroll row ke dalam view
            $nextRow[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    updateNavState();
}

customerKontenFeedFunc();
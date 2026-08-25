var baseURLPath     =   baseURL + "utilitas/cekOngkosKirim/",
    dataTableContent=   $('#utilitasCekOngkosKirim-tableRate tbody').first(),
    totalColumns    =   dataTableContent.closest('table').find('thead:first').find('th').length,
    rowLoaderElem   =   "<tr><td colspan='" + totalColumns + "' class='text-center border-bottom-0'>" + loaderElem + "</td></tr>";

if (utilitasCekOngkosKirimFunc == null) {
    var utilitasCekOngkosKirimFunc = function () {
        $(document).ready(function () {
            applyAutoResizeDocHeight(
                '#utilitasCekOngkosKirim-cardFormFilterBody',
                ['utilitasCekOngkosKirim-header', 'utilitasCekOngkosKirim-hr', 'utilitasCekOngkosKirim-cardFormFilterHeader', 'utilitasCekOngkosKirim-cardFormFilterFooter']
            );

            applyAutoResizeDocHeight(
                '#utilitasCekOngkosKirim-cardDaftarRateBody',
                ['utilitasCekOngkosKirim-header', 'utilitasCekOngkosKirim-hr', 'utilitasCekOngkosKirim-cardDaftarRateHeader']
            );

            initializeSelect2Wilayah();

            $('#utilitasCekOngkosKirim-detailWilayahAsal, #utilitasCekOngkosKirim-detailWilayahTujuan').off('focus');
            $('#utilitasCekOngkosKirim-detailWilayahAsal, #utilitasCekOngkosKirim-detailWilayahTujuan').on('focus', function() {
                $('#utilitasCekOngkosKirim-modalWilayah').modal('show');
                initializeOptionWilayahModal(this);
            });

            $('#utilitasCekOngkosKirim-formFilter').off('submit').on('submit', function(e) {
                e.preventDefault();
                submitCekOngkosKirim();
            });
        });
    }
}

function initializeSelect2Wilayah() {
    let dropdownParent  =   $('#utilitasCekOngkosKirim-modalWilayah .modal-body');

    $('#utilitasCekOngkosKirim-optionProvinsi').select2({
        theme: 'bootstrap-5',
        width: '100%',
        dropdownParent: dropdownParent,
        placeholder: 'Pilih Provinsi',
        selectionCssClass: 'select2-font-sm',
        dropdownCssClass: 'select2-font-sm',
        language: {
            noResults: function() {
                return 'Data tidak ditemukan';
            }
        }
    });

    $('#utilitasCekOngkosKirim-optionKotaKabupaten').select2({
        theme: 'bootstrap-5',
        width: '100%',
        dropdownParent: dropdownParent,
        placeholder: 'Pilih Kota/Kabupaten',
        selectionCssClass: 'select2-font-sm',
        dropdownCssClass: 'select2-font-sm',
        language: {
            noResults: function() {
                return 'Data tidak ditemukan';
            }
        }
    });

    $('#utilitasCekOngkosKirim-optionKecamatan').select2({
        theme: 'bootstrap-5',
        width: '100%',
        dropdownParent: dropdownParent,
        placeholder: 'Pilih Kecamatan',
        selectionCssClass: 'select2-font-sm',
        dropdownCssClass: 'select2-font-sm',
        language: {
            noResults: function() {
                return 'Data tidak ditemukan';
            }
        }
    });
}

function initializeOptionWilayahModal(element) {
    let jenisWilayah            =   $(element).attr('id') == 'utilitasCekOngkosKirim-detailWilayahAsal' ? 'Asal' : 'Tujuan',
        idWilayahProvinsi       =   $('#utilitasCekOngkosKirim-idProvinsi'+jenisWilayah).val(),
        idWilayahKotaKabupaten  =   $('#utilitasCekOngkosKirim-idKotaKabupaten'+jenisWilayah).val(),
        idWilayahKecamatan      =   $('#utilitasCekOngkosKirim-idKecamatan'+jenisWilayah).val();
    
    $('#utilitasCekOngkosKirim-modalWilayah').data('jenis-wilayah', jenisWilayah);
    setOptionHelper(
        'utilitasCekOngkosKirim-optionProvinsi',
        'dataWilayahProvinsi',
        idWilayahProvinsi == '' ? false : idWilayahProvinsi,
        function() {
            setOptionHelper(
                'utilitasCekOngkosKirim-optionKotaKabupaten',
                'dataWilayahKotaKabupaten',
                idWilayahKotaKabupaten == '' ? false : idWilayahKotaKabupaten,
                function() {
                    setOptionHelper(
                        'utilitasCekOngkosKirim-optionKecamatan',
                        'dataWilayahKecamatan',
                        idWilayahKecamatan == '' ? false : idWilayahKecamatan,
                        false,
                        idWilayahKotaKabupaten
                    );
                },
                idWilayahProvinsi
            );
        }
    );

    $('#utilitasCekOngkosKirim-optionProvinsi').change(function() {
        let idWilayahProvinsi  =   this.value;
        setOptionHelper(
            'utilitasCekOngkosKirim-optionKotaKabupaten',
            'dataWilayahKotaKabupaten',
            idWilayahKotaKabupaten == '' ? false : idWilayahKotaKabupaten,
            function() {
                setOptionHelper(
                    'utilitasCekOngkosKirim-optionKecamatan',
                    'dataWilayahKecamatan',
                    idWilayahKecamatan == '' ? false : idWilayahKecamatan,
                    false,
                    idWilayahKotaKabupaten
                );
            },
            idWilayahProvinsi
        );
    });

    $('#utilitasCekOngkosKirim-optionKotaKabupaten').change(function() {
        let idWilayahKotaKabupaten  =   this.value;
        setOptionHelper(
            'utilitasCekOngkosKirim-optionKecamatan',
            'dataWilayahKecamatan',
            idWilayahKecamatan == '' ? false : idWilayahKecamatan,
            false,
            idWilayahKotaKabupaten
        );
    });
}

$('#utilitasCekOngkosKirim-modalWilayah form').off('submit').on('submit', function(e) {
    e.preventDefault();
    let jenisWilayah            =   $('#utilitasCekOngkosKirim-modalWilayah').data('jenis-wilayah'),
        idWilayahProvinsi       =   $('#utilitasCekOngkosKirim-optionProvinsi').val(),
        idWilayahKotaKabupaten  =   $('#utilitasCekOngkosKirim-optionKotaKabupaten').val(),
        idWilayahKecamatan      =   $('#utilitasCekOngkosKirim-optionKecamatan').val(),
        namaWilayahProvinsi     =   $('#utilitasCekOngkosKirim-optionProvinsi option:selected').text(),
        namaWilayahKotaKabupaten=   $('#utilitasCekOngkosKirim-optionKotaKabupaten option:selected').text(),
        namaWilayahKecamatan    =   $('#utilitasCekOngkosKirim-optionKecamatan option:selected').text();

    $('#utilitasCekOngkosKirim-idProvinsi'+jenisWilayah).val(idWilayahProvinsi);
    $('#utilitasCekOngkosKirim-idKotaKabupaten'+jenisWilayah).val(idWilayahKotaKabupaten);
    $('#utilitasCekOngkosKirim-idKecamatan'+jenisWilayah).val(idWilayahKecamatan);

    let detailWilayahText   =   namaWilayahProvinsi + ' / ' + namaWilayahKotaKabupaten + ' / ' + namaWilayahKecamatan;
    $('#utilitasCekOngkosKirim-detailWilayah'+jenisWilayah).val(detailWilayahText);
    $('#utilitasCekOngkosKirim-modalWilayah').modal('hide');
});

function submitCekOngkosKirim() {
    let isvalidForm =   validateFormCekOngkosKirim();

    if(isvalidForm) {
        let dataForm    =   $('#utilitasCekOngkosKirim-formFilter').serializeArray(),
            dataSend    =   {};

        $.each(dataForm, function(index, field) {
            switch (field.name) {
                case 'berat':
                case 'nilaiBarang':
                case 'panjang':
                case 'lebar':
                case 'tinggi':
                    dataSend[field.name]    =   field.value.replace(/[^\d]/g, '');
                    break;
                case 'idKecamatanAsal':
                case 'idKecamatanTujuan':
                case 'asuransi':
                    dataSend[field.name]    =   field.value;
                    break;
                default:
                    break;
            }
        });

        $.ajax({
            type: 'POST',
            url: baseURLPath + "cekOngkosKirim",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: {withCredentials: true},
            headers: {Authorization: "Bearer " + getUserToken()},
            beforeSend: function () {
                Pace.start();
                toggleWindowLoader(true);
                dataTableContent.html(rowLoaderElem);
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON    =   jqXHR.responseJSON,
                    rows            =   "";

                switch (jqXHR.status) {
                    case 200:
                        let parsingType =   responseJSON.parsingType ?? 'API Co ID',
                            listData    =   responseJSON.listData;

                        $.each(listData, function (index, arrayData) {
                            switch (parsingType) {
                                case 'API Co ID':
                                    let courierImage     =   arrayData.courier_image || '',
                                        courierName      =   arrayData.courier_name || '',
                                        serviceName      =   arrayData.service_name || '-',
                                        serviceType      =   arrayData.service_type || '',
                                        etd              =   arrayData.etd || null,
                                        price            =   arrayData.price || 0,
                                        handlingFee      =   arrayData.handling_fee || 0,
                                        insuranceFee     =   arrayData.insurance_fee || 0,
                                        totalPrice       =   arrayData.total_price || (price + handlingFee + insuranceFee),
                                        badgeKeterangan  =   '',
                                        estimasiTiba     =   (etd != null && etd !== '') ? etd + ' Hari' : '-';

                                    if (arrayData.is_cheapest) badgeKeterangan += '<span class="badge text-bg-warning">Termurah</span> ';
                                    if (arrayData.is_fastest) badgeKeterangan += '<span class="badge text-bg-info">Tercepat</span> ';
                                    if (badgeKeterangan === '') badgeKeterangan = '<span class="text-muted">-</span>';

                                    rows    +=  '<tr>' +
                                                    '<td class="align-middle">' +
                                                        '<img src="' + courierImage + '" alt="' + courierName + '" class="rounded me-2" width="24" height="24">' +
                                                        courierName +
                                                    '</td>' +
                                                    '<td class="align-middle">' +
                                                        serviceName +
                                                        (serviceType !== '' ? '<small class="text-muted d-block">' + serviceType + '</small>' : '') +
                                                    '</td>' +
                                                    '<td class="align-middle">' + estimasiTiba + '</td>' +
                                                    '<td class="align-middle text-end">' + numberFormat(price) + '</td>' +
                                                    '<td class="align-middle text-end">' + numberFormat(handlingFee) + '</td>' +
                                                    '<td class="align-middle text-end">' + numberFormat(insuranceFee) + '</td>' +
                                                    '<td class="align-middle text-end">' + numberFormat(totalPrice) + '</td>' +
                                                    '<td class="align-middle text-end">' + badgeKeterangan + '</td>' +
                                                '</tr>';
                                    break;
                                default:
                                    rows    =  '<tr>\
                                                    <td colspan="'+totalColumns+'" class="text-center">\
                                                        Gagal melakukan parsing data yang berasal dari provider : ' + parsingType + '\
                                                    </td>\
                                                </tr>';
                                    break;
                            }
                        });
                        break;
                    case 404:
                    default:
                        rows    =   '<tr>\
                                        <td colspan="' + totalColumns + '" class="text-center border-bottom-0 pt-5">\
                                            <div class="d-flex flex-column align-items-center justify-content-center gap-2 text-center mb-0">\
                                                <i class="fa fa-info-circle fa-3x opacity-50"></i>\
                                                <span>' + getMessageResponse(jqXHR) + '</span>\
                                            </div>\
                                        </td>\
                                    </tr>';
                        break;
                }

                dataTableContent.html(rows);
            }
        }).always(function (jqXHR, textStatus) {
            Pace.stop();
            setUserToken(jqXHR);
            toggleWindowLoader(false);
        });
    }
}

function validateFormCekOngkosKirim() {
    let isValid = true,
        idWilayahAsal       =   $('#utilitasCekOngkosKirim-idKecamatanAsal').val(),
        idWilayahTujuan     =   $('#utilitasCekOngkosKirim-idKecamatanTujuan').val(),
        beratBarang         =   $('#utilitasCekOngkosKirim-berat').val();

    isValid =   setWarningInputCekOngkosKirim(
                    '#utilitasCekOngkosKirim-detailWilayahAsal',
                    idWilayahAsal === '' || idWilayahAsal === undefined,
                    'Wilayah asal belum dipilih. Harap lengkapi wilayah asal dahulu.'
                ) && isValid;

    isValid =   setWarningInputCekOngkosKirim(
                    '#utilitasCekOngkosKirim-detailWilayahTujuan',
                    idWilayahTujuan === '' || idWilayahTujuan === undefined,
                    'Wilayah tujuan belum dipilih. Harap lengkapi wilayah tujuan dahulu.'
                ) && isValid;

    isValid =   setWarningInputCekOngkosKirim(
                    '#utilitasCekOngkosKirim-berat',
                    !(parseFloat(beratBarang) >= 1),
                    'Berat barang minimal 1 Kg.'
                ) && isValid;

    return isValid;
}

function setWarningInputCekOngkosKirim(inputSelector, isInvalid, message) {
    let $input  =   $(inputSelector),
        $target =   $input.closest('.input-group').length > 0 ? $input.closest('.input-group') : $input;

    $input.toggleClass('is-invalid', isInvalid);
    $target.siblings('.invalid-feedback-cek-ongkir').remove();
    if (isInvalid) {
        $target.after('<div class="invalid-feedback-cek-ongkir text-danger small mt-1">' + message + '</div>');
    }

    return !isInvalid;
}

utilitasCekOngkosKirimFunc();
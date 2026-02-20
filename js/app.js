let tabId;

$(document).ready(function () {

    $(".menu-app-item").on("click", function () {
        hideModalResetActiveMenuLinkSetLoader();

        var alias = $(this).attr("data-alias"),
            url = $(this).attr("data-url");

        setLocalStorageMenuItem(url, alias);
        $(this).closest('.menu-item').addClass('active');
        let $parentMenu= $(this).closest('.menu-item.has-sub');
        if ($parentMenu.length) {
            $parentMenu.addClass('active');
        }

        if (localStorage.getItem("form_" + alias) === null) {
            getViewURL(url, alias);
        } else {
            var responseJSON = localStorage.getItem("form_" + alias);
            renderMainView(JSON.parse(responseJSON));
        }

        if (typeof intervalId !== 'undefined') clearInterval(intervalId);
    });

    $(document).on("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            const activeMenu = $(".nav-link.active").closest('li').attr('id');

            switch (activeMenu) {
                default:
                    break;
            }
            localStorage.setItem('appVisibility', true);
        } else {
            clearInterval(intervalId);
            localStorage.setItem('appVisibility', false);
        }
    });

    $('#modal-userProfile').off('show.bs.modal'),
    $('#modal-userProfile').on('show.bs.modal', function () {
        $.ajax({
            type: 'POST',
            url: baseURL + "access/detailProfileSetting",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(),
            xhrFields: { withCredentials: true },
            headers: { Authorization: "Bearer " + getUserToken() },
            beforeSend: function () {
                Pace.start();
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        let detailUserAdmin = responseJSON.detailUserAdmin;
                        $("#userProfile-name").val(detailUserAdmin.NAME);
                        $("#userProfile-username").val(detailUserAdmin.USERNAME);
                        activatePasswordVisibility();
                        break;
                    case 400:
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            Pace.stop();
            setUserToken(jqXHR);
        });
    });

    $('#form-userProfile').off('submit'),
    $('#form-userProfile').on('submit', function (e) {
        e.preventDefault();
        const name = $('#userProfile-name').val(),
            username = $('#userProfile-username').val(),
            currentPassword = $('#userProfile-oldPassword').val(),
            newPassword = $('#userProfile-newPassword').val(),
            repeatPassword = $('#userProfile-repeatNewPassword').val();
        let dataSend = {
            name: name,
            username: username,
            currentPassword: currentPassword,
            newPassword: newPassword,
            repeatPassword: repeatPassword
        };

        if (name == "" || username == "") {
            showWarning("Name and username is required!");
        } else if ((currentPassword != "" || newPassword != "" || repeatPassword != "") && (currentPassword == "" || newPassword == "" || repeatPassword == "")) {
            showWarning("Untuk mengganti password, harap lengkapi kolom password saat ini, password baru, dan ulangi password baru");
        } else {
            $.ajax({
                type: 'POST',
                url: baseURL + "access/saveDetailProfileSetting",
                contentType: 'application/json',
                dataType: 'json',
                cache: false,
                data: mergeDataSend(dataSend),
                xhrFields: { withCredentials: true },
                headers: { Authorization: "Bearer " + getUserToken() },
                beforeSend: function () {
                    Pace.start();
                    $("#window-loader").modal("show");
                },
                complete: function (jqXHR, textStatus) {
                    var responseJSON = jqXHR.responseJSON;
                    switch (jqXHR.status) {
                        case 200:
                            let relogin = responseJSON.relogin,
                                token = '';

                            try {
                                token = responseJSON.token;
                            } catch (err) {
                                token = jqXHR.token;
                            }

                            $("#userFullName").html(name);
                            $("#modal-userProfile").modal("hide");
                            if (relogin) window.location.replace(MAIN_URL + "/access/logout/" + token);
                            break;
                        case 400:
                        default:
                            generateWarningMessageResponse(jqXHR);
                            break;
                    }
                }
            }).always(function (jqXHR, textStatus) {
                $("#window-loader").modal("hide");
                Pace.stop();
                setUserToken(jqXHR);
            });
        }
    });

    if (typeof arrMediaSound !== 'undefined' && arrMediaSound.length > 0) {
        arrMediaSound.forEach(function (value) {
            let key = value.replace(/\.[^/.]+$/, "");
            if (localStorage.getItem(key) === null) {
                downloadAndStoreMedia(baseURLAssetsSound + value, key);
            }
        });
    }

    $('.menu-app-item').first().click();
    tabId = getTabId();
});

function getTabId() {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
        let ubid = require('ubid');
        ubid.get(function (error, signatureData) {
            if (error) return tabId;
            tabId = signatureData.canvas.signature.toString() + "" + moment().unix();
            sessionStorage.setItem('tabId', 'tab-' + tabId);
        });
    }
    return tabId;
}

function downloadAndStoreMedia(url, key) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                localStorage.setItem(key, reader.result);
            };
        })
        .catch(error => console.error("Download failed : " + url, error));
}

function playStoredAudio(key) {
    let audioData = localStorage.getItem(key);
    if (audioData) {
        let audio = new Audio(audioData);
        audio.play();
    } else {
        console.error("Media file not found! :: " + key);
    }
}

function hideModalResetActiveMenuLinkSetLoader() {
    $(".modal").modal("hide");
    $('div.menu-item').removeClass('active');
    setLoaderContainerContent();
}

function setLoaderContainerContent() {
    $("#content-container").html(loaderElem);
}

function setLocalStorageMenuItem(url, alias) {
    localStorage.setItem("lastUrl", url);
    localStorage.setItem("lastAlias", alias);
}

function getViewURL(url, alias, callback) {
    $.ajax({
        type: "POST",
        url: baseURL + "view/" + url,
        contentType: "application/json",
        dataType: "json",
        cache: true,
        data: mergeDataSend(),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            Pace.start();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    localStorage.setItem("form_" + alias, JSON.stringify(responseJSON));
                    renderMainView(responseJSON);
                    if (typeof callback == "function") callback();
                    break;
                default:
                    $("#content-container").html("<center>" + Object.values(responseJSON.messages)[0] + "</center>");
                    Pace.stop();
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        Pace.stop();
        setUserToken(jqXHR);
    });
}

function renderMainView(responseJSON, callback) {
    $("#modalWarning").off("hidden.bs.modal");
    $("#content-container").html(responseJSON.content);

    let themeType = document.getElementsByTagName("html")[0].getAttribute("data-bs-theme");
    if ($(".input-date-single").length) generateDatePickerElem();
    Pace.stop();

    if (typeof callback == "function") callback();
}

function setOptionHelper(
    elementIDArr,
    table,
    iddata = false,
    callback = false,
    parentValue = false,
    parentValue2 = false
) {
    var arrID = Array.isArray(elementIDArr) ? elementIDArr : [elementIDArr];
    arrID.forEach(function (elementID) {
        if ($("#" + elementID).length) {
            var dataOpt = JSON.parse(localStorage.getItem("optionHelper")),
                options = dataOpt[table];
            $("#" + elementID).empty();

            var options = parentValue2 != false ? options.filter(options => [parentValue2].includes(options.PARENTVALUE2)) : options,
                optionAll = $("#" + elementID).attr("option-all"),
                optionAllVal = $("#" + elementID).attr("option-all-value"),
                optionAllVal = typeof optionAllVal !== typeof undefined && optionAllVal !== false ? optionAllVal : "",
                firstValue = false,
                isOptGroup = typeof options[0] !== 'undefined' ? options[0].hasOwnProperty('IDGROUP') : false,
                arrIdGroup = [],
                lastIndex = parentValue !== false &&
                    parentValue !== 0 &&
                    parentValue !== '' &&
                    typeof parentValue !== 'undefined' &&
                    isOptGroup ? options.filter((obj) => obj.IDGROUP === parentValue).length - 1 : options.length - 1,
                indexElem = 0,
                optGroupElem;

            if (typeof optionAll !== typeof undefined && optionAll !== false) {
                $("#" + elementID).prepend($("<option></option>").val(optionAllVal).html(optionAll)).prop('selected', true);
            }

            var foundIdData = false;
            $("#" + elementID).each(function (i, obj) {
                $.each(options, function (index, array) {
                    var selected = "";
                    if (table == "optionYear") {
                        var thisYear = moment().year();
                        if (array.ID == thisYear) selected = "selected";
                    }

                    if (
                        parentValue === false ||
                        parentValue === '' ||
                        (parentValue !== false &&
                            parentValue !== 0 &&
                            (array.PARENTVALUE == parentValue || array.IDGROUP == parentValue)) ||
                        (parentValue2 !== false &&
                            parentValue2 !== 0 &&
                            (array.PARENTVALUE2 == parentValue2 || array.IDGROUP == parentValue2))
                    ) {
                        var optElem = $("<option " + selected + "></option>").val(array.ID).html(array.VALUE);
                        firstValue = !firstValue ? array.ID : firstValue;
                        if (isOptGroup) {
                            var idGroup = array.IDGROUP,
                                isIdGroupExist = arrIdGroup.includes(idGroup);
                            if (!isIdGroupExist) {
                                if (optGroupElem && optGroupElem != '' && typeof optGroupElem !== 'undefined') $("#" + elementID).append(optGroupElem);
                                optGroupElem = $("<optgroup label='" + array.VALUEGROUP + "'>");
                                arrIdGroup.push(idGroup);
                            }
                            optGroupElem.append(optElem);
                            if (indexElem == lastIndex) $("#" + elementID).append(optGroupElem);
                        } else {
                            $("#" + elementID).append(optElem);
                        }
                        if (iddata && array.ID === iddata) foundIdData = true;
                        indexElem++;
                    }
                });
                if (iddata != false && foundIdData) {
                    $("#" + elementID).val(iddata);
                }
            });
        }

        if (typeof callback == "function") callback(firstValue);
    });
}

function updateDataOptionHelper(arrayName, arrayValue) {
    var dataOptionHelper = JSON.parse(localStorage.getItem("optionHelper"));
    dataOptionHelper[arrayName] = arrayValue;

    localStorage.setItem("optionHelper", JSON.stringify(dataOptionHelper));
}

function getMessageResponse(jqXHR) {
    var responseMessage;
    try {
        var responseJSON = jqXHR.responseJSON,
            responseMessage = responseJSON.message;
        if (typeof responseMessage == 'undefined' && responseMessage == null) responseMessage = Object.values(responseJSON.messages)[0];
    } catch (err) {
        responseMessage =
            jqXHR.messages != "" &&
                jqXHR.messages !== null &&
                jqXHR.messages !== undefined
                ? Object.values(jqXHR.messages)[0]
                : "";
    }
    return responseMessage;
}

function generateWarningMessageResponse(jqXHR) {
    var responseMessage = getMessageResponse(jqXHR);
    showWarning(responseMessage);
}

function showWarning(message) {
    $("#modalWarning").on("show.bs.modal", function () {
        $("#modalWarningBody").html(message);
    });
    $("#modalWarning").modal("show");
}

function openMenuSetCallBack(menuId, callback, parameters) {
    hideModalResetActiveMenuLinkSetLoader();

    let elemMenuList = $("#" + menuId);

    if (elemMenuList.length === 0) {
        showWarning("You can't perform this action. This feature is not available for your account!");
        return;
    } else {
        let alias = elemMenuList.attr("data-alias"),
            url = elemMenuList.attr("data-url");

        setLocalStorageMenuItem(url, alias);
        elemMenuList.find('a.nav-link').addClass('active');

        if (localStorage.getItem("form_" + alias) === null) {
            getViewURL(url, alias, function () {
                if (typeof callback == "function") {
                    callback(parameters);
                }
            });
        } else {
            var responseJSON = localStorage.getItem("form_" + alias);
            renderMainView(JSON.parse(responseJSON), function () {
                if (typeof callback == "function") {
                    callback(parameters);
                }
            });
        }
    }
}

function activateBootstrapTooltip() {
    $('[data-bs-toggle="tooltip"]').each(function () {
        let title = $(this).attr('data-bs-title');
        if (typeof title !== 'undefined' && title !== null) $(this).attr('data-bs-title', title.replace(/\n/g, '<br>'));
        new bootstrap.Tooltip(this);
    });
}

function formatDateTimeZoneString(timeStamp) {
    return moment.unix(timeStamp).tz(timezoneOffset).format('DD MMM YY HH:mm');
}

function activatePasswordVisibility() {
    $('.inputPassword-toggleVisibility').off('click');
    $('.inputPassword-toggleVisibility').on('click', function (e) {
        const passwordInput = $(this).closest('.input-group').find('input.form-control'),
            passwordIcon = $(this).find('.fa-eye, .fa-eye-slash'),
            passwordInputType = passwordInput.attr('type');

        if (passwordInputType === 'password') {
            passwordInput.attr('type', 'text');
            passwordIcon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordInput.attr('type', 'password');
            passwordIcon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });
}

function numberFormat(number) {
    if (number % 1 == 0) {
        number = number ? parseInt(number, 10) : 0;
    }
    return (number === 0 || number === undefined || number === null) ? "0" : number.toLocaleString("en-US");
}

function maskNumberInput(
    minValue = 0,
    maxValue = false,
    elemID = false,
    callback = false
) {
    var $input;

    if (elemID === false) {
        $input = $(".maskNumber");
    } else {
        $input = $("#" + elemID);
    }

    if ($input.val() === "") {
        $input.val(0);
    }
    $input.on("keyup", function (event) {
        var selection = window.getSelection().toString();
        if (selection !== '') return;
        if ($.inArray(event.keyCode, [38, 40, 37, 39]) !== -1) return;

        var $this = $(this);
        var originalVal = $this.val();
        var caretPos = this.selectionStart;

        var rawBeforeCaret = originalVal.substring(0, caretPos).replace(/[^0-9.]/g, "");
        var rawCaretPos = rawBeforeCaret.length;

        var decimalInput = $this.hasClass("decimalInput");
        var showcomma = $this.hasClass("nocomma") ? false : true;
        var showzero = $this.hasClass("nozero") ? false : true;
        var padzeroleft = $this.hasClass("padzeroleft") ? true : false;

        var input = originalVal.replace(/[^0-9.]/g, "");

        if (!decimalInput) {
            var num = parseInt(input, 10);
            if (isNaN(num)) num = minValue;
            num = num < minValue ? minValue : num;
            num = maxValue !== false && num > maxValue ? maxValue : num;
            input = num.toString();
        }

        var formatted;
        if (!decimalInput) {
            if (showcomma) {
                var num = input ? parseInt(input, 10) : 0;
                formatted = showzero ? (num === 0 ? "0" : num.toLocaleString("en-US")) : (num === 0 ? "" : num.toLocaleString("en-US"));
            } else {
                formatted = input;
            }
        } else {
            formatted = input;
        }

        $this.val(formatted);

        var newCaretPos = 0;
        var digitCount = 0;
        for (var i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                digitCount++;
            }
            if (digitCount >= rawCaretPos) {
                newCaretPos = i + 1;
                break;
            }
        }

        if (newCaretPos === 0) {
            newCaretPos = formatted.length;
        }

        this.setSelectionRange(newCaretPos, newCaretPos);

        if (typeof callback === "function") {
            callback(input);
        }
    });
}

function activateCounterFieldEvent() {
    $('.btn-number').off('click');
    $('.input-number').off('focusin change keydown');

    $('.btn-number').click(function (e) {
        e.preventDefault();
        var fieldName = $(this).attr('data-field'),
            type = $(this).attr('data-type'),
            input = $("input[name='" + fieldName + "']"),
            currentVal = parseInt(input.val());

        if (!isNaN(currentVal)) {
            if (type == 'minus') {
                if (currentVal > input.attr('min')) {
                    input.val(currentVal - 1).change();
                }
                if (parseInt(input.val()) == input.attr('min')) {
                    $(this).attr('disabled', true);
                }
            } else if (type == 'plus') {
                if (currentVal < input.attr('max')) {
                    input.val(currentVal + 1).change();
                }
                if (parseInt(input.val()) == input.attr('max')) {
                    $(this).attr('disabled', true);
                }
            }
        } else {
            input.val(0);
        }
    });

    $('.input-number').focusin(function () {
        $(this).data('oldValue', $(this).val());
    });

    $('.input-number').change(function () {
        var minValue = parseInt($(this).attr('min')),
            maxValue = parseInt($(this).attr('max')),
            valueCurrent = parseInt($(this).val()),
            name = $(this).attr('name');

        if (valueCurrent >= minValue) {
            $(".btn-number[data-type='minus'][data-field='" + name + "']").removeAttr('disabled')
        } else {
            $(this).val($(this).data('oldValue'));
        }
        if (valueCurrent <= maxValue) {
            $(".btn-number[data-type='plus'][data-field='" + name + "']").removeAttr('disabled')
        } else {
            $(this).val($(this).data('oldValue'));
        }
    });

    $(".input-number").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }

        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}

function generateDatePickerElem(parentEl = 'body') {
    parentEl = typeof parentEl !== 'undefined' && parentEl != null ? parentEl : 'body';
    $('.input-date-single').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        parentEl: parentEl,
        minYear: 2024,
        maxYear: parseInt(moment().format('YYYY')) + 2,
        locale: {
            format: 'DD-MM-YYYY',
            separator: ' - ',
            daysOfWeek: [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat'
            ],
            monthNames: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            firstDay: 1
        }
    });
}

function resetSelectedOptionFirstValue(elemID) {
    if (typeof elemID === 'undefined' || elemID == null || elemID == '') return;

    let arrElemID = Array.isArray(elemID) ? elemID : [elemID];

    for (let i = 0; i < arrElemID.length; i++) {
        let $input = $("#" + arrElemID[i]);
        if ($input.length > 0) {
            let firstValue = $input.find('option').first().val();
            if (firstValue !== undefined && firstValue !== null) {
                $input.val(firstValue).change();
            }
        }
    }
}

function isValidArray(variable) {
    return Array.isArray(variable) && variable !== undefined && variable !== null && variable.length > 0;
}

window.onload = function () {
    history.pushState(null, null, window.location.href);

    window.onpopstate = function () {
        history.pushState(null, null, window.location.href);
    };
};
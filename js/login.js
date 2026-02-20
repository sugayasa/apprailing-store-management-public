$(document).ready(function () {
    $("#togglePassword").on("click", function () {
        showPassword(this);
    });

    $("#login-form").submit(function (e) {
        e.preventDefault();
        var username = $("#username").val(),
            password = $("#password").val(),
            captcha = $("#captcha").val(),
            userCredentials = { captcha: captcha, username: username, password: password };

        if (captcha == "") {
            var msg = "Masukkan kode captcha yang ditampilkan";
            if ($("#warning-element").length) {
                $("#warning-element")
                    .removeClass("d-none")
                    .find("p")
                    .html(msg)
                    .addClass('animated bounce infinite');
            } else {
                $("#container-warning-element").html(createWarningElement(msg));
            }
            localStorage.setItem("lastMessage", msg);
            return;
        }

        $.ajax({
            type: "POST",
            url: API_URL + "/access/login",
            contentType: "application/json",
            dataType: "json",
            data: mergeDataSend(userCredentials),
            xhrFields: {
                withCredentials: true,
            },
            headers: {
                Authorization: "Bearer " + getUserToken(),
            },
            beforeSend: function () {
                Pace.start();
                clearWarningElement();
                $("#username, #password, #captcha").prop("readonly", true);
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        let optionHelper = responseJSON.optionHelper;
                        localStorage.setItem("optionHelper", JSON.stringify(optionHelper));
                        callMainPage();
                        break;
                    default:
                        if ($("#warning-element").length) {
                            $("#warning-element")
                                .removeClass("d-none")
                                .find("p")
                                .html(Object.values(responseJSON.messages)[0]);
                        } else {
                            $("#container-warning-element").html(createWarningElement(Object.values(responseJSON.messages)[0]));
                        }
                        break;
                }
            },
        }).always(function (jqXHR, textStatus) {
            $("#username, #password, #captcha").prop("readonly", false);
            Pace.stop();
            setUserToken(jqXHR, false);
        });
    });

    $('#clearCacheReloadLink').off('click');
    $('#clearCacheReloadLink').on('click', function (e) {
        e.preventDefault();
        var localStorageKeys = Object.keys(localStorage),
            localStorageIdx = localStorageKeys.length;
        for (var i = 0; i < localStorageIdx; i++) {
            var keyName = localStorageKeys[i];
            localStorage.removeItem(keyName);
        }
        location.reload();
    });
});

function clearWarningElement() {
    $("#warning-element").find('button').click();
}

function showPassword(a) {
    var e = $(a).parent().find("input");
    "password" === e.attr("type")
        ? e.attr("type", "text")
        : e.attr("type", "password");

    "password" === e.attr("type")
        ? $(a).removeClass('fa-eye-slash').addClass('fa-eye')
        : $(a).removeClass('fa-eye').addClass('fa-eye-slash');
}

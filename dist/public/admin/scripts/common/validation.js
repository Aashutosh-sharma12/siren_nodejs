//Not allowed space first time 
function validate(input) {
    if (/^\s/.test(input.value))
        input.value = '';
}

//phone number validation
function mobileNum(phoneNumber) {
    let numberRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!@^#$%&*? "])[a-zA-Z0-9^!@#$*%&?]{6,20}$/;
    if (numberRegex.test(phoneNumber)) {
        document.getElementById("phoneNumber").value = phoneNumber
    } else {
        document.getElementById("numberError").innerHTML = ""
    }
}
$(function () {
    $("input[name='phoneNumber']").on('input', function (e) {
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
    });
});

//second phone number validation
function mobileNum1(mobileNo) {
    let numberRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!@^#$%&*? "])[a-zA-Z0-9^!@#$*%&?]{6,20}$/;
    if (numberRegex.test(mobileNo)) {
        document.getElementById("mobileNo").value = mobileNo
    } else {
        document.getElementById("numberError").innerHTML = ""
    }
}
$(function () {
    $("input[name='mobileNo']").on('input', function (e) {
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
    });
});

//for number and decimal number
function validateNumber(event) {
    const input = event.target;
    let value = input.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        parts.pop(); // Remove the last element (extra decimal parts)
        value = parts.join('.');
    }
    input.value = value;
}

///not allowed quote
function validateInput(inputField) {
    console.log('slslslsls', inputField)
    const forbiddenCharacters = ["'", '"'];

    const inputValue = inputField.value;
    const errorText = document.getElementById("errorText");

    for (const char of forbiddenCharacters) {
        if (inputValue.includes(char)) {
            // errorText.textContent = `Input cannot contain ${char} character.`;
            inputField.value = inputValue.replace(char, "");
        }
    }
}

//appsetting drop down
function appSetting() {
    if (document.getElementById('collapse').className == 'nav nav-second-level collapse')
        document.getElementById('collapse')?.classList.add("in");
    else
        document.getElementById('collapse')?.classList.remove("in");
}

function userdropDown() {
    const arrowIcon = document.querySelector('#users-nav .arrow');
    // Toggle the 'rotate-arrow' class on the arrow icon
    if (document.getElementById('users').className == 'nav nav-second-level collapse') {
        document.getElementById('users')?.classList.add("in");
    } else {
        document.getElementById('users')?.classList.remove("in");
    }
    arrowIcon.classList.toggle('rotate-arrow');
}

function notificationdropDown() {
    const arrowIcon = document.querySelector('#notification-nav .arrow');
    if (document.getElementById('notification').className == 'nav nav-second-level collapse') {
        document.getElementById('notification')?.classList.add("in");
    }
    else {
        document.getElementById('notification')?.classList.remove("in");
    }
    arrowIcon.classList.toggle('rotate-arrow');

}

function appSetting() {
    const arrowIcon = document.querySelector('#setting-nav .arrow');
    if (document.getElementById('collapse').className == 'nav nav-second-level collapse') {
        document.getElementById('collapse')?.classList.add("in");
    }
    else {
        document.getElementById('collapse')?.classList.remove("in");
    }
    arrowIcon.classList.toggle('rotate-arrow');
}

function checkToken() {
    $.ajax({
        url: host + "/api/v1/admin/auth/checkToken",
        type: "get",
        // data: { branchId: vendorId, catId: array },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", token);
        },
    })
        .done(function (data) {
            console.log('success')
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            // If fail
            alert(jqXHR.responseJSON.error);
            localStorage.clear();
            window.location.replace('/admin/login')
        });
}

function capitalize(input) {
    return input.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}
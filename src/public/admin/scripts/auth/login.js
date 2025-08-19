function login() {
    console.log('eneterrere--')
    var button = document.getElementById('addButton');
    button.style.border = "4px solid blue";
    var email = ((document.getElementById('email').value).trim()).toLowerCase();
    var password = document.getElementById('password').value;
    $.ajax({
        type: "POST",
        data: { email, password },
        dataType: 'json',
        url: host + '/api/v1/admin/auth/login',
    }).done(function (data) {
        // If successful
        sessionStorage.setItem("token", data.data.token);
        window.location.replace('/admin/dashboard')
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // If fail
        alert(jqXHR.responseJSON.error)
        button.style.border = null; // Remove border style
    });
}


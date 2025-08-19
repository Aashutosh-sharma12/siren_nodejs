
function changePassword() {
    this.setTimeout(() => {
        document.getElementById('changepassword-nav')?.classList.add("active");
    }, 1500)
    var oldpassword = document.getElementById('oldpass').value;
    var newpassword = document.getElementById('password').value;
    var cpassword = document.getElementById('cpassword').value;
    if (!oldpassword) {
        swal({
            title: "Error",
            text: "Please Fill Old Password"
        });
    } else if (!newpassword) {
        swal({
            title: "Error",
            text: "Please Fill New Password"
        });
    } else if (!cpassword) {
        swal({
            title: "Error",
            text: "Please Fill Confirm Password"
        });
    }
    else if (newpassword !== cpassword) {
        swal({
            title: "Error",
            text: "Confirm Password should be same as new password"
        });
    } else if (newpassword === oldpassword) {
        swal({
            title: "Error",
            text: "New Password should not be same as old password"
        });
    }
    else {
        let obj = {
            "current_password": oldpassword,
            "new_password": newpassword,
            "confirm_new_password": cpassword
        }
        console.l
        $.ajax({
            url: host + '/api/v1/admin/auth/change_password',
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(obj),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', token);
            },
            dataType: 'json',
            success: function (data, status) {

            }
        })
            .done(function (data) {
                if (data.code == 200) {
                    swal({
                        title: "Success",
                        text: "You have changed Password Successfully ! redirecting you to login page...",
                        type: "success"
                    });
                    sessionStorage.removeItem("token");
                    setTimeout(() => {
                        window.location.replace('/admin/login');
                    }, 2000)
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                // alert(jqXHR.responseJSON.error)
                swal({
                    title: "Error",
                    text: jqXHR.responseJSON.error
                });
            })
    }
}

//**********Button Disable Untill Confirm Password not filled*************** */
function success() {
    if (document.getElementById("cpassword").value === "") {
        document.getElementById('button').disabled = true;
    } else {
        document.getElementById('button').disabled = false;
    }
}


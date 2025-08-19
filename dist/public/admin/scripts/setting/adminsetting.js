function app_settingdetails() {
    this.setTimeout(() => {
        const arrowIcon = document.querySelector('#setting-nav .arrow');
        arrowIcon.classList.toggle('rotate-arrow');
        if (document.getElementById('collapse').className == 'nav nav-second-level collapse' || document.getElementById('collapse').className == 'nav nav-second-level collapse in')
            document.getElementById('collapse')?.classList.add("in");
        document.getElementById('app-nav')?.classList.add("active");
        document.getElementById('setting-nav')?.classList.add("active");
    }, 1500)
    $.ajax({
        url: host + '/api/v1/admin/app_setting/app_versionDetails',
        type: 'Get',
        // data: formData,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        contentType: false,
        processData: false,
        success: function (data, status) {
            if (data.code == 200) {
                document.getElementById('user_A').value = data.data.android_user_version;
                document.getElementById('user_I').value = data.data.ios_user_version;
                document.getElementById('serviceBoy_A').value = data.data.android_serviceboy_version;
                document.getElementById('userA_status').value = data.data.android_user_status;
                document.getElementById('userI_status').value = data.data.ios_user_status;
                document.getElementById('serviceBoyA_status').value = data.data.android_serviceboy_status;
            } else {
                alert("Something Wrong Try Again")
            }
        }
    });
}
function update() {
    var obj = {
        "android_user_version": document.getElementById('user_A').value,
        "ios_user_version": document.getElementById('user_I').value,
        "android_serviceboy_version": document.getElementById('serviceBoy_A').value,
        "android_user_status": document.getElementById('userA_status').value,
        'ios_user_status': document.getElementById('userI_status').value,
        'android_serviceboy_status': document.getElementById('serviceBoyA_status').value
    }
    console.log(obj, "lsls")
    $.ajax({
        url: host + '/api/v1/admin/app_setting/updateApp_version',
        type: 'Post',
        contentType: 'application/json',
        data: JSON.stringify(obj),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        }
    }).done(function (data) {
        alert('Update Successfully');
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseJSON.error)
    });
}



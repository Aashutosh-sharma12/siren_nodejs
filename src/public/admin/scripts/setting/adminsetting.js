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
        url: host + '/api/v1/admin/app_setting/getAppVersion',
        type: 'Get',
        // data: formData,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        contentType: false,
        processData: false,
        success: function (data, status) {
            if (data.code == 200) {
                document.getElementById('user_A').value = data.data.androidVersion;
                document.getElementById('user_I').value = data.data.iosVersion;
                document.getElementById('userA_status').value = data.data.androidUpdate_Type;
                document.getElementById('userI_status').value = data.data.iosUpdate_Type;
            } else {
                alert("Something Wrong Try Again")
            }
        }
    });
}
function update() {
    var obj = {
        "androidVersion": document.getElementById('user_A').value,
        "iosVersion": document.getElementById('user_I').value,
        "androidUpdate_Type": document.getElementById('userA_status').value,
        'iosUpdate_Type': document.getElementById('userI_status').value,
    }
    $.ajax({
        url: host + '/api/v1/admin/app_setting/updateApp_version',
        type: 'Post',
        contentType: 'application/json',
        data: JSON.stringify(obj),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        }
    }).done(function (data) {
        if(data.code === 200){
            alert('AppVersion updated successfully')
            window.location.reload(); 
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseJSON.error)
    });
}



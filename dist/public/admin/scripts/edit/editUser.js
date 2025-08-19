var currentLocation = window.location.href;
var url = new URL(currentLocation);
var id = url.searchParams.get("id");

function userDetails() {
    this.setTimeout(() => {
        document.getElementById('user-nav')?.classList.add("active");
    }, 1500);

    $.ajax({
        url: host + '/api/v1/admin/user/userView?userId=' + id,
        type: 'Get',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        }
    }).done(function (data) {
        if (data.code == 200) {
            document.getElementById('name').value = data.data.details.name ? data.data.details.name : ''
            document.getElementById('email').value = data.data.details.email ? data.data.details.email : ''
            document.getElementById('countryCode').value = data.data.details.countryCode
            document.getElementById('phoneNumber').value = data.data.details.phoneNumber
            document.getElementById('blah').src = data.data.details.image ? data.data.details.image : '../../admin/assets/img/user_image1.svg'
            document.getElementById('userId').value = data.data.details._id
            if (data.data.details.member === true) {
                document.getElementById('customerId1').value = data.data.customerId1[0].customerId
                document.getElementById('customerId1').required = true
                document.getElementById('service_requestId').value = data.data.customerId1[0]._id
            } else {
                document.getElementById('customerId1').value = "null"
                document.getElementById('customerId1').required = false
                document.getElementById('customerId1').disabled = true
            }
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // If fail
        alert(jqXHR.responseJSON.error)
    });
}
$(document).ready(function () {
    $("#form").submit(function (e) {
        e.preventDefault();
        const button = document.getElementById('button')
        button.innerHTML = 'Submitting---'
        button.disabled = true
        var formData = new FormData(this);
        // var formData = $(this).serialize();
        if (document.getElementById('customerId1').value != null && document.getElementById('customerId1').value != '') {
            formData.append('customerId', document.getElementById('customerId1').value);
        }
        $.ajax({
            url: host + '/api/v1/admin/user/editUser',
            type: 'PUT',
            data: formData,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', token);
            },
            contentType: false,
            processData: false,
        }).done(function (data) {
            // If successful
            button.innerHTML = 'Submit'
            button.disabled = false
            window.location.replace('/admin/user');
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // If fail
            button.innerHTML = 'Submit'
            button.disabled = false
            alert(jqXHR.responseJSON.error)
        });

    });
});
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            // upload1(e.target.result, input.files[0].type)
            $('#blah')
                .attr('src', e.target.result)
        };
        reader.readAsDataURL(input.files[0]);
    }
}
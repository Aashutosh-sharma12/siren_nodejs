$(document).ready(function () {
    $("#form").submit(function (e) {
        e.preventDefault();
        const button = document.getElementById('button')
        button.innerHTML = 'Submitting---'
        button.disabled = true
        var formData = new FormData(this);
        console.log(formData,"ldld")
        // if (document.getElementById('amount1').value == '') {
        //     formData.append('amount', 0)
        // } else {
        //     formData.append('amount', document.getElementById('amount1').value)
        // }
        $.ajax({
            url: host + '/api/v1/admin/banner/editbanner',
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
            window.location.replace('/admin/banner');
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
var currentLocation = window.location.href;
var url = new URL(currentLocation);
var id = url.searchParams.get("id");
function bannerDetails() {
    this.setTimeout(() => {
        document.getElementById('banner-nav')?.classList.add("active");
    }, 1500);

    $.ajax({
        url: host + '/api/v1/admin/banner/bannerDetails?bannerId=' + id,
        type: 'Get',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        }
    }).done(function (data) {
        if (data.code == 200) {
            const bannerInput = document.getElementById('bannerUrl');
            document.getElementById('title').value = data.data.title
            document.getElementById('type').value = data.data.type
            // if (data.data.type == 'Book') {
            //     document.getElementById('banner').style.display = 'block'
            //     document.getElementById('bannerUrl').value = data.data.bannerUrl
            //     bannerInput.required = true; // Set 'required' attribute
            // } else {
            //     document.getElementById('banner').style.display = 'none'
            //     bannerInput.required = false; // Set 'required' attribute
            // }
            document.getElementById('position').value = data.data.position
            // document.getElementById('amount1').value = data.data.amount ? data.data.amount : 0
            document.getElementById('description').value = data.data.description
            document.getElementById('blah').src = data.data.image ? data.data.image : '../../admin/assets/img/banner_image.svg'
            document.getElementById('bannerId').value = data.data._id
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // If fail
        alert(jqXHR.responseJSON.error)
    });
}
// function checkType(e) {
//     // e.preventDefault();
//     console.log(e.value, "dkdkdkdkd")
//     const bannerInput = document.getElementById('bannerUrl');
//     bannerInput.value=''
//     if (e.value == 'Book') {
//         document.getElementById('banner').style.display = 'block'
//         bannerInput.required = true; // Set 'required' attribute
//     } else {
//         document.getElementById('banner').style.display = 'none'
//         bannerInput.required = false; // Set 'required' attribute
//     }
// }
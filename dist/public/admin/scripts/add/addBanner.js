$(document).ready(function () {
    $("#form").submit(function (e) {
        e.preventDefault();
        const button = document.getElementById('button')
        button.innerHTML = 'Submitting---'
        button.disabled = true
        var formData = new FormData(this);
        // if (document.getElementById('amount1').value == '') {
        //     formData.append('amount', 0)
        // } else {
        //     formData.append('amount', document.getElementById('amount1').value)
        // }
        $.ajax({
            url: host + '/api/v1/admin/banner/addBanner',
            type: 'Post',
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

function classActive() {
    this.setTimeout(() => {
        document.getElementById('banner-nav')?.classList.add("active");
    }, 1500)
}

// function checkType(e) {
//     // e.preventDefault();
//     console.log(e.value, "dkdkdkdkd")
//     const bannerInput = document.getElementById('bannerUrl');
//     if (e.value == 'Book') {
//         document.getElementById('banner').style.display = 'block'
//         bannerInput.required = true; // Set 'required' attribute
//     } else {
//         document.getElementById('banner').style.display = 'none'
//         bannerInput.required = false; // Set 'required' attribute
//     }
// }
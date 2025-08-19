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
            document.getElementById('title').value = data.data.title
            document.getElementById('type').value = data.data.type
            // if (data.data.type == 'Book') {
            //     document.getElementById('banner').style.display = 'block'
            //     document.getElementById('bannerUrl').value = data.data.bannerUrl
            // } else {
            //     document.getElementById('banner').style.display = 'none'
            // }
            document.getElementById('position').value = data.data.position
            // document.getElementById('amount').value = data.data.amount
            document.getElementById('description').value = data.data.description
            document.getElementById('blah').src = data.data.image?data.data.image:'../../admin/assets/img/banner_image.svg'
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // If fail
        alert(jqXHR.responseJSON.error)
    });
}


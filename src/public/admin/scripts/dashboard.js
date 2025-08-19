function dashboardData() {
    this.setTimeout(() => {
        document.getElementById('dashboard-nav')?.classList.add("active");
    }, 1500);
    $.ajax({
        url: `${host}/api/v1/admin/dashboard/dashboardCount`,
        type: 'GET',
        contentType: 'application/json',
        // data: JSON.stringify(obj),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        dataType: 'json',
        success: function (data, status) {
            if (data.code == 200) {
                document.getElementById('total_users').innerHTML = data.data.userCount;
                document.getElementById('Logged-In_Users').innerHTML = data.data.loggedInUserCount;
                document.getElementById('Blocked_Users').innerHTML = data.data.blockedUserCount;
                document.getElementById('Unblocked_Users').innerHTML = data.data.unblockedUserCount;
                document.getElementById('Subscribed_Users').innerHTML = data.data.subscribedUserCount;

                if (data.data.latestRegistered_List.length) {
                    $("#table1").html(' ');
                    //***************Table For latest Users************ */
                    for (var i = 0; i < data.data.latestRegistered_List.length; i++) {
                        if (data.data.latestRegistered_List[i].isActive == true) {
                            var status = '<td><span class="label label-success" style="border-radius:3px;"><strong>' + "Active" + '</strong></span>'
                            var statusButton = '<button type="button" class="btn btn-sm btn-danger ml-2 mb-2" onclick= updateStatus1(' + '\'' + data.data.latestRegistered_List[i]._id + '\'' + "," + '\'' + data.data.latestRegistered_List[i].isActive + '\'' + ')>' + 'Inactive' + '</button>'
                        } else {
                            var status = '<td><span class="label label-danger" style="border-radius:3px;"><strong>' + "Inactive" + '</strong></span>'
                            var statusButton = '<button type="button" class="btn btn-sm btn-success ml-2 mb-2" style="border-color:white" onclick= updateStatus1(' + '\'' + data.data.latestRegistered_List[i]._id + '\'' + "," + '\'' + data.data.latestRegistered_List[i].isActive + '\'' + ')>' + 'Active' + '</button>'
                        }
                        var index = i + 1
                        let imageUrl =  "../../admin/assets/img/profileImage.png"
                        if (data.data.latestRegistered_List[i].image) {
                            let imagePath = data.data.latestRegistered_List[i].image ||" ";
                            let baseUrl = data.data.baseUrl;
                            // Remove any leading slash from imagePath before joining
                            imagePath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
                            // Construct final URL
                            imageUrl = `${baseUrl}/${imagePath}`;
                        }
                        document.getElementById('table1').innerHTML += '<tr>' +
                            '<td><strong>' + index + '</strong>' +
                            '<td>' + `<img src="${imageUrl}" style="height: 50px;width: 65px;border-radius: 6px;object-fit: cover;">` +
                            '<td><strong>' + (data.data.baseUrl + '/' + data.data.latestRegistered_List[i].name ? data.data.latestRegistered_List[i].name : 'N/A') + '</strong>' +
                            '<td><strong>' + (data.data.latestRegistered_List[i].countryCode + " " + data.data.latestRegistered_List[i].phoneNumber) + '</strong>' +
                            '<td><strong>' + (data.data.latestRegistered_List[i].email ? data.data.latestRegistered_List[i].email : 'N/A') + '</strong>' +
                            '<td><strong>' + moment(data.data.latestRegistered_List[i].createdAt).format('YYYY-MM-DD,hh:mm A') + '</strong>' +
                            status +
                            '</tr>'
                    }
                } else {
                    document.getElementById('table112').style.display = 'none'
                    document.getElementById('noData').style.display = 'block'
                }
            } else {
                console.log(status, "Ss;s;s;s;s;s")
            }
        }
    });
}


//********Date picker******/
// var jqOld = jQuery.noConflict();
// jqOld(function () {
//     jqOld("#fromDate").datepicker({
//         dateFormat: 'yy-mm-dd'
//     });
// })
// var jqOld = jQuery.noConflict();
// jqOld(function () {
//     jqOld("#toDate").datepicker({
//         dateFormat: 'yy-mm-dd'
//     });
// })



//*********Listing Table Data**************/

function userList() {
    this.setTimeout(() => {
        document.getElementById('user-nav')?.classList.add("active");
    }, 1500)
    const search = document.getElementById('fog').value
    var obj = {
        'page': 1,
        'perPage': 10,
        'search': '',
    }
    if (search) {
        obj.search = search
    }
    $.ajax({
        url: `${host}/api/v1/admin/user/userList?page=${obj.page}&perPage=${obj.perPage}&search=${obj.search}`,
        type: 'GET',
        contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        dataType: 'json',
        success: function (data, status) {
            if (data.code == 200) {
                document.getElementById('loader1').style.display = 'none'
            }
            if (data.code == 200 && data.data.count > 0) {
                $("#table2").removeClass("hide")
                document.getElementById('noData').style.display = 'none'
                document.getElementById('page1').style.display = 'block'
                var x = data.data.count
                $('#example-1').pagination({
                    total: x,
                    current: 1,
                    length: 10,
                    prev: 'Previous',
                    next: 'Next',
                    click: function (options, $target) {
                        let obj = {
                            'page': options.current,
                            'perPage': options.length,
                            search: '',
                            memberStatus: ''
                        }
                        if (search) {
                            obj.search = search
                        }
                        $.ajax({
                            url: `${host}/api/v1/admin/user/userList?page=${obj.page}&perPage=${obj.perPage}&search=${obj.search}`,
                            type: 'GET',
                            contentType: 'application/json',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', token);
                            },
                            dataType: 'json',
                            success: function (data, status) {
                                if (data.code == 200) {
                                    $("#table").html(' ');
                                    const itemList = data.user_data;
                                    for (let item of itemList) {
                                        const uniqueId = item.uniqueId;
                                        const status = item.isActive;
                                        const name = item.name;
                                        const date = item.createdAt;
                                        const email = item.email;
                                        const phoneNumber = item.countryCode + "" + item.phoneNumber;
                                        const userId = item._id;
                                        const dob = item.dob;
                                        const access = item.loginKey == 2 ? 'Limited Access' : 'Full Access';
                                        const access1 = item.loginKey == 2 ? 'Full Access' : 'Limited Access';
                                        let diable_button = ''
                                        if (item.loginKey == 2) {
                                            diable_button = '<button type="button" class="btn btn-sm btn-success" id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                                        } else {
                                            diable_button = '<button type="button" class="btn btn-sm btn-success" disabled id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                                        }
                                        if (status == true) {
                                            var x = 'Deactive'
                                            var y = 'Active'
                                        } else {
                                            var x = 'Active'
                                            var y = 'Deactive'
                                        }

                                        document.getElementById('table').innerHTML += '<tr >' +
                                            '<td >' + uniqueId +
                                            '<td>' + capitalize(name) +
                                            '<td>' + email +
                                            '<td>' + '<span style="color: #000000; font-weight: 600;">' + phoneNumber + '</span>' +
                                            '<td>' + dob +
                                            '<td>' + dayjs(date).format('MMMM D, YYYY h:mm A') +
                                            '<td><span class="label label-primary">' + access +
                                            '<td><span class="label label-primary">' + y +
                                            '<td> <button type="button" class="btn btn-sm btn-success" id="Action_button" style="margin: 5px;"  data-target="' + status + '" onclick= "updateStatus(' + '\'' + userId + '\'' + ')">' + x + '</button>' +
                                            '<button type="button" class="btn btn-sm btn-info" style="margin: 5px;"  data-toggle="modal" data-target="#myModal2" onclick= View(' + '\'' + userId + '\'' + ')>' + 'View' + '</button>' +
                                            diable_button +
                                            '<button type="button" class="btn btn-sm btn-warning" id="Action_button1" style="margin: 5px;" onclick= deleteUser(' + '\'' + userId + '\'' + ')>' + 'Delete' + '</button>' +
                                            '</tr>'
                                    }
                                }
                            }
                        })
                        $target.next(".show").text('Current: ' + options.current);
                    }
                })
                // capitalize(data.data.data[i].name) 
                $("#table").html(' ');
                const itemList = data.user_data;
                for (let item of itemList) {
                    const uniqueId = item.uniqueId;
                    const status = item.isActive;
                    const name = item.name;
                    const date = item.createdAt;
                    const email = item.email;
                    const phoneNumber = item.countryCode + "" + item.phoneNumber;
                    const userId = item._id;
                    const dob = item.dob;
                    const access = item.loginKey == 2 ? 'Limited Access' : 'Full Access';
                    const access1 = item.loginKey == 2 ? 'Full Access' : 'Limited Access';
                    let diable_button = ''
                    if (item.loginKey == 2) {
                        diable_button = '<button type="button" class="btn btn-sm btn-success" id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                    } else {
                        diable_button = '<button type="button" class="btn btn-sm btn-success" disabled id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                    }
                    if (status == true) {
                        var x = 'Deactive'
                        var y = 'Active'
                    } else {
                        var x = 'Active'
                        var y = 'Deactive'
                    }

                    document.getElementById('table').innerHTML += '<tr >' +
                        '<td >' + uniqueId +
                        '<td>' + capitalize(name) +
                        '<td>' + email +
                        '<td>' + '<span style="color: #000000; font-weight: 600;">' + phoneNumber + '</span>' +
                        '<td>' + dob +
                        '<td>' + dayjs(date).format('MMMM D, YYYY h:mm A') +
                        '<td><span class="label label-primary">' + access +
                        '<td><span class="label label-primary">' + y +
                        '<td> <button type="button" class="btn btn-sm btn-success" id="Action_button" style="margin: 5px;"  data-target="' + status + '" onclick= "updateStatus(' + '\'' + userId + '\'' + ')">' + x + '</button>' +
                        '<button type="button" class="btn btn-sm btn-info" style="margin: 5px;"  data-toggle="modal" data-target="#myModal2" onclick= View(' + '\'' + userId + '\'' + ')>' + 'View' + '</button>' +
                        diable_button +
                        '<button type="button" class="btn btn-sm btn-warning" id="Action_button1" style="margin: 5px;" onclick= deleteUser(' + '\'' + userId + '\'' + ')>' + 'Delete' + '</button>' +
                        '</tr>'
                }
            } else {
                document.getElementById('loader1').style.display = 'none'
                $("#table").html(' ');
                $("#table2").addClass("hide");
                document.getElementById('noData').style.display = 'block'
                $("#page1").hide();
            }
        }
    });
}

function userList() {
    this.setTimeout(() => {
        document.getElementById('user-nav')?.classList.add("active");
    }, 1000)
    var obj = {
        'page': 1,
        'perPage': 10,
        'search': document.getElementById('fog').value,
        // 'toDate': document.getElementById('toDate').value,
        // 'fromDate': document.getElementById('fromDate').value
    }
    $('#ibox1').children('.ibox-content').toggleClass('sk-loading');
    $.ajax({
        // url: `${host}/api/v1/admin/user/list?search=${obj.search}&fromDate=${obj.fromDate}&toDate=${obj.toDate}&page=${obj.page}&perPage=${obj.perPage}`,
        url: `${host}/api/v1/admin/user/list?search=${obj.search}&page=${obj.page}&perPage=${obj.perPage}`,
        type: 'GET',
        contentType: 'application/json',
        data: JSON.stringify(obj),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        dataType: 'json',
        success: function (data, status) {
            if (data.code == 200) {
                document.getElementById('loader1').style.display = 'none'
                $('#ibox1').children('.ibox-content').toggleClass('sk-loading');
            }
            if (data.totalCount == 0 && data.code == 200) {
                $("#noData").addClass("show");
            }
            if (data.code == 200 && data.totalCount > 0) {
                $("#table2").removeClass("hide")
                $("#noData").removeClass("show")
                $("#page1").removeClass("hide")
                document.getElementById('noData').style.display = 'none'
                var x = data.totalCount
                $('#example-1').pagination({
                    total: x,
                    current: 1,
                    length: 10,
                    prev: 'Previous',
                    next: 'Next',
                    click: function (options, $target) {
                        let obj = {
                            'page': options.current,
                            'perPage': options.length,
                            'search': document.getElementById('fog').value,
                            // 'toDate': document.getElementById('toDate').value,
                            // 'fromDate': document.getElementById('fromDate').value
                        }

                        $('#ibox1').children('.ibox-content').toggleClass('sk-loading');
                        $.ajax({
                            // url: `${host}/api/v1/admin/user/list?search=${obj.search}&fromDate=${obj.fromDate}&toDate=${obj.toDate}&page=${obj.page}&perPage=${obj.perPage}`,
                            url: `${host}/api/v1/admin/user/list?search=${obj.search}&page=${obj.page}&perPage=${obj.perPage}`,
                            type: 'GET',
                            contentType: 'application/json',
                            data: JSON.stringify(obj),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', token);
                            },
                            dataType: 'json',
                            success: function (data, status) {
                                if (data.code == 200) {
                                    $('#ibox1').children('.ibox-content').toggleClass('sk-loading');
                                    $("#table").html(' ');
                                    const itemList = data.user_data;
                                    for (let item of itemList) {
                                        const uniqueId = item.uniqueId;
                                        const status = item.isActive;
                                        const name = item.name;
                                        const date = item.createdAt;
                                        const email = item.email;
                                        const phoneNumber = item.countryCode + "" + item.phoneNumber;
                                        const userId = item._id;
                                        const dob = item.dob;
                                        const access = item.loginKey == 2 ? 'Limited Access' : 'Full Access';
                                        const access1 = item.loginKey == 2 ? 'Full Access' : 'Limited Access';
                                        let diable_button = ''
                                        if (item.loginKey == 2) {
                                            diable_button = '<button type="button" class="btn btn-sm btn-success" id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                                        } else {
                                            diable_button = '<button type="button" class="btn btn-sm btn-success" disabled id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                                        }
                                        if (status == true) {
                                            var x = 'Deactive'
                                            var y = 'Active'
                                        } else {
                                            var x = 'Active'
                                            var y = 'Deactive'
                                        }

                                        document.getElementById('table').innerHTML += '<tr >' +
                                            '<td >' + uniqueId +
                                            '<td>' + capitalize(name) +
                                            '<td>' + email +
                                            '<td>' + '<span style="color: #000000; font-weight: 600;">' + phoneNumber + '</span>' +
                                            '<td>' + dob +
                                            '<td>' + dayjs(date).format('MMMM D, YYYY h:mm A') +
                                            '<td><span class="label label-primary">' + access +
                                            '<td><span class="label label-primary">' + y +
                                            '<td> <button type="button" class="btn btn-sm btn-success" id="Action_button" style="margin: 5px;"  data-target="' + status + '" onclick= "updateStatus(' + '\'' + userId + '\'' + ')">' + x + '</button>' +
                                            '<button type="button" class="btn btn-sm btn-info" style="margin: 5px;"  data-toggle="modal" data-target="#myModal2" onclick= View(' + '\'' + userId + '\'' + ')>' + 'View' + '</button>' +
                                            diable_button +
                                            '<button type="button" class="btn btn-sm btn-warning" id="Action_button1" style="margin: 5px;" onclick= deleteUser(' + '\'' + userId + '\'' + ')>' + 'Delete' + '</button>' +
                                            '</tr>'
                                    }
                                }

                            }

                        })
                        $target.next(".show").text('Current: ' + options.current);

                    }
                })
                $("#table").html(' ');
                // for (var i = 0; i < data.data.response.length; i++) {
                const itemList = data.user_data;
                for (let item of itemList) {
                    const uniqueId = item.uniqueId;
                    const status = item.isActive;
                    const name = item.name;
                    const date = item.createdAt;
                    const email = item.email;
                    const phoneNumber = item.countryCode + "" + item.phoneNumber;
                    const userId = item._id;
                    const dob = item.dob;
                    const access = item.loginKey == 2 ? 'Limited Access' : 'Full Access';
                    const access1 = item.loginKey == 2 ? 'Full Access' : 'Limited Access';
                    let diable_button = ''
                    if (item.loginKey == 2) {
                        diable_button = '<button type="button" class="btn btn-sm btn-success" id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                    } else {
                        diable_button = '<button type="button" class="btn btn-sm btn-success" disabled id="Action_button01" style="margin: 5px;"" onclick= "updateUser_access(' + '\'' + userId + '\'' + ')">' + access1 + '</button>'
                    }
                    if (status == true) {
                        var x = 'Deactive'
                        var y = 'Active'
                    } else {
                        var x = 'Active'
                        var y = 'Deactive'
                    }

                    document.getElementById('table').innerHTML += '<tr >' +
                        '<td >' + uniqueId +
                        '<td>' + capitalize(name) +
                        '<td>' + email +
                        '<td>' + '<span style="color: #000000; font-weight: 600;">' + phoneNumber + '</span>' +
                        '<td>' + dob +
                        '<td>' + dayjs(date).format('MMMM D, YYYY h:mm A') +
                        '<td><span class="label label-primary">' + access +
                        '<td><span class="label label-primary">' + y +
                        '<td> <button type="button" class="btn btn-sm btn-success" id="Action_button" style="margin: 5px;"  data-target="' + status + '" onclick= "updateStatus(' + '\'' + userId + '\'' + ')">' + x + '</button>' +
                        '<button type="button" class="btn btn-sm btn-info" style="margin: 5px;"  data-toggle="modal" data-target="#myModal2" onclick= View(' + '\'' + userId + '\'' + ')>' + 'View' + '</button>' +
                        diable_button +
                        '<button type="button" class="btn btn-sm btn-warning" id="Action_button1" style="margin: 5px;" onclick= deleteUser(' + '\'' + userId + '\'' + ')>' + 'Delete' + '</button>' +
                        '</tr>'
                }
            } else {
                document.getElementById('loader1').style.display = 'none'
                $("#table").html(' ');
                $("#table2").addClass("hide");
                document.getElementById('noData').style.display = 'block'
                $("#page1").hide();
            }
        }

    });
}

//**********Satus Update***************/
function updateStatus(user_id) {
    var userId = (user_id)
    $(document).on('click', "#Action_button", function () {
        var a = ($(this).text());
        if (a === 'Active') {
            var status = true
        } else {
            var status = false
        }
        swal({
            title: "Are you sure?",
            text: "Ready to Action!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, update status",
            cancelButtonText: "No, leave pls!",
            closeOnConfirm: false,
            closeOnCancel: true
        },
            function (isConfirm) {
                if (isConfirm) {

                    $.ajax({
                        type: "PATCH",
                        data: { status, userId },
                        dataType: 'json',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', token);
                        },
                        url: `${host}/api/v1/admin/user/updateStatus`,
                    }).done(function (data) {
                        // If successful
                        // alert("Success")
                        window.location.reload();
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        // If fail
                        alert(jqXHR.responseJSON.error)

                    })
                } else {
                    swal("Cancelled", "Your file is safe :");
                }
            });

    })
}

//**********Satus Update***************/
function deleteUser(userId) {
    $(document).on('click', "#Action_button1", function () {
        var a = ($(this).text());
        swal({
            title: "Are you sure?",
            text: "Ready to Action!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete user",
            cancelButtonText: "No, leave pls!",
            closeOnConfirm: false,
            closeOnCancel: true
        },
            function (isConfirm) {
                if (isConfirm) {

                    $.ajax({
                        type: "Delete",
                        dataType: 'json',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', token);
                        },
                        url: `${host}/api/v1/admin/user/deleteUser/${userId}`,
                    }).done(function (data) {
                        // If successful
                        // alert("Success")
                        window.location.reload();
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        // If fail
                        alert(jqXHR.responseJSON.error)

                    })
                } else {
                    swal("Cancelled", "Your file is safe :");
                }
            });

    })
}
//**********Satus Update***************/
function updateUser_access(userId) {
    $(document).on('click', "#Action_button01", function () {
        var a = ($(this).text());
        console.log(a, "aaaaaaaaaaaaa")
        if (a == 'Limited Access') {
            var status = 2
        } else {
            var status = 0
        }
        swal({
            title: "Are you sure?",
            text: "Ready to Action!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No, leave pls!",
            closeOnConfirm: false,
            closeOnCancel: true
        },
            function (isConfirm) {
                if (isConfirm) {
                    $.ajax({
                        type: "GET",
                        dataType: 'json',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', token);
                        },
                        url: `${host}/api/v1/admin/user/updateUser_access/${userId}/${status}`,
                    }).done(function (data) {
                        console.log("ata", data)
                        // If successful
                        // alert("Success")
                        window.location.reload();
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        // If fail
                        alert(jqXHR.responseJSON.error)

                    })
                } else {
                    swal("Cancelled", "Your file is safe :");
                }
            });

    })
}

//************Details View functions************ */
function View(userId) {
    $.ajax({
        type: "get",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        url: `${host}/api/v1/admin/user/details/${userId}`,
    }).done(function (data) {
        // If successful
        document.getElementById('name1').value = data.data.name ? data.data.name : "N/A";
        document.getElementById('email1').value = data.data.email ? data.data.email : "N/A";
        document.getElementById('mobile').value = data.data.phoneNumber ? data.data.phoneNumber : "N/A";
        document.getElementById('countryCode').value = data.data.countryCode;
        document.getElementById('status1').value = data.data.isActive;
        document.getElementById('blah1').src = data.data.image ? data.image_baseUrl + "/" + data.data.image : "../../admin/assets/img/emptyphoto.png";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // If fail
        // alert(jqXHR.responseJSON.error)
        alert("Data Not Found")
        window.location.reload()
    })
}
//*********Capital title***********/
function capitalize(input) {
    return input.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

//*****************Search bar not empty******************/
function fogData() {
    var fog = document.getElementById('fog').value
    var fromDate = document.getElementById('fromDate').value
    var toDate = document.getElementById('toDate').value
    if (fromDate && toDate) {
        if (fromDate > toDate) {
            alert(" To Date should be after From Date")
            return
        }
    }
    if (fog && fromDate && toDate) {
        userList();
        return
    }
    if (fog) {
        if (!fog) {
            alert("Please Write Something in Search bar")
            return
        } else {
            userList()
            return
        }
    } else {
        if (!fromDate) {
            alert("Please Select From Date")
            return
        } else {
            if (!toDate) {
                alert("Please Select To Date")
                return
            } else {
                userList()
                return
            }
        }
    }

}
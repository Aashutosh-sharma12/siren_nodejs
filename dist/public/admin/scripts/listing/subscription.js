//*********Listing Table Data**************/

function subList() {
    this.setTimeout(() => {
        document.getElementById('subscription-nav')?.classList.add("active");
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
        url: `${host}/api/v1/admin/sub/list?page=${obj.page}&perPage=${obj.perPage}&search=${obj.search}`,
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
                            url: `${host}/api/v1/admin/sub/list?page=${obj.page}&perPage=${obj.perPage}&search=${obj.search}`,
                            type: 'GET',
                            contentType: 'application/json',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', token);
                            },
                            dataType: 'json',
                            success: function (data, status) {
                                if (data.data.code == 200) {
                                    $("#table").html(' ');
                                    const itemList = data.data.list;
                                    for (let item of itemList) {
                                        const uniqueId = item.uniqueId;
                                        const status = item.isActive;
                                        const name = item.title;
                                        const date = item.createdAt;
                                        const amount = item.amount;
                                        const sub_type = item.subscriptionType;
                                        const userId = item.uniqueId;
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
                                            '<td>' + amount +
                                            '<td>' + '<span style="color: #000000; font-weight: 600;">' + sub_type + '</span>' +
                                            '<td>' + dayjs(date).format('MMMM D, YYYY h:mm A') +
                                            '<td><span class="label label-primary">' + access +
                                            '<td><span class="label label-primary">' + y +
                                            '<td> <button type="button" class="btn btn-sm btn-success" id="Action_button" style="margin: 5px;"  data-target="' + status + '" onclick= "updateStatus(' + '\'' + userId + '\'' + ')">' + x + '</button>' +
                                            '<button type="button" class="btn btn-sm btn-info" style="margin: 5px;"  data-toggle="modal" data-target="#myModal2" onclick= View(' + '\'' + userId + '\'' + ')>' + 'View' + '</button>' +
                                            // diable_button +
                                            '<button type="button" class="btn btn-sm btn-warning" id="Action_button1" style="margin: 5px;" onclick= deleteSub(' + '\'' + userId + '\'' + ')>' + 'Delete' + '</button>' +
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
                const itemList = data.data.list;
                for (let item of itemList) {
                    const uniqueId = item.uniqueId;
                    const status = item.isActive;
                    const name = item.title;
                    const date = item.createdAt;
                    const amount = item.amount;
                    const sub_type = item.subscriptionType;
                    const userId = item.uniqueId;
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
                        '<td>' + amount +
                        '<td>' + '<span style="color: #000000; font-weight: 600;">' + sub_type + '</span>' +
                        '<td>' + dayjs(date).format('MMMM D, YYYY h:mm A') +
                        '<td><span class="label label-primary">' + y +
                        '<td> <button type="button" class="btn btn-sm btn-success" id="Action_button" style="margin: 5px;"  data-target="' + status + '" onclick= "updateStatus(' + '\'' + userId + '\'' + ')">' + x + '</button>' +
                        '<button type="button" class="btn btn-sm btn-info" style="margin: 5px;"  data-toggle="modal" data-target="#myModal2" onclick= details(' + '\'' + userId + '\'' + ')>' + 'View' + '</button>' +
                        // diable_button +
                        '<button type="button" class="btn btn-sm btn-warning" id="Action_button1" style="margin: 5px;" onclick= deleteSub(' + '\'' + userId + '\'' + ')>' + 'Delete' + '</button>' +
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
function updateStatus(subId) {
    $(document).on('click', "#Action_button", function () {
        var a = ($(this).text());
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
                        type: "GET",
                        dataType: 'json',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', token);
                        },
                        url: `${host}/api/v1/admin/sub/update-status/${subId}`,
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
function details(subId) {

    $.ajax({
        type: "GET",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        url: `${host}/api/v1/admin/sub/details/${subId}`,
    }).done(function (data) {
        // If successful
        // alert("Success")
        window.location.reload();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // If fail
        alert(jqXHR.responseJSON.error)

    })
}


//**********Satus Update***************/
function deleteSub(subId) {
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
                        url: `${host}/api/v1/admin/sub/delete/${subId}`,
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

//************Details View functions************ */
function details(subId) {
    $.ajax({
        type: "get",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        url: `${host}/api/v1/admin/sub/details/${subId}`,
    }).done(function (data) {
        // If successful
        console.log(data.data.title)
        document.getElementById('title').value = data.data.title ? data.data.title : "N/A";
        document.getElementById('amount').value = data.data.amount ? data.data.amount : "N/A";
        document.getElementById('sub_type').value = data.data.subscriptionType ? data.data.subscriptionType : "N/A";
        document.getElementById('features').value = data.data.features;
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
        subList();
        return
    }
    if (fog) {
        if (!fog) {
            alert("Please Write Something in Search bar")
            return
        } else {
            subList()
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
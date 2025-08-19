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
            
            console.log(data.data.baseUrl)
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
                        document.getElementById('table1').innerHTML += '<tr>' +
                            '<td><strong>' + index + '</strong>' +
                            '<td>' + `<img src="${data.data.latestRegistered_List[i].image 
                            ? data.data.baseUrl + '/' + data.data.latestRegistered_List[i].image 
                            : '../../admin/assets/img/user_image1.svg'}"
                            style="height: 50px;width: 65px;border-radius: 6px;object-fit: cover;">`+
                            '<td><strong>' + (data.data.baseUrl + '/' + data.data.latestRegistered_List[i].name ? data.data.latestRegistered_List[i].name : 'N/A') + '</strong>' +
                            '<td><strong>' + (data.data.latestRegistered_List[i].countryCode + " " + data.data.latestRegistered_List[i].phoneNumber) + '</strong>' +
                            '<td><strong>' + (data.data.latestRegistered_List[i].email ? data.data.latestRegistered_List[i].email : 'N/A') + '</strong>' +
                            // '<td><strong>' + moment(data.data.latestUsers[i].createdAt).format('YYYY-MM-DD,hh:mm A') + '</strong>' +
                            '<td><strong>' + moment(data.data.latestRegistered_List[i].updatedAt).format('YYYY-MM-DD,hh:mm A') + '</strong>' +
                            status +
                            // '<td><button type="button" class="btn btn-sm btn-info ml-2 mb-2"  onclick= edit(' + '\'' + data.data.latestRegistered_List[i]._id + '\'' + ')>' + 'Edit' + '</button>' +
                            // '<button type="button" class="btn btn-sm btn-primary ml-2 mb-2"  onclick= userRequestfor_service(' + '\'' + data.data.latestRegistered_List[i]._id + '\'' + ')>' + 'View' + '</button>' +
                            // '<button type="button" class="btn btn-sm btn-info ml-2 mb-2"  onclick= devices(' + '\'' + data.data.latestRegistered_List[i]._id + '\'' + ')>' + 'Devices' + '</button>'
                            // + statusButton +
                            // '<button type="button" class="btn btn-sm btn-danger ml-2 mb-2"  onclick= deleteUser1(' + '\'' + data.data.latestRegistered_List[i]._id + '\'' + ')>' + 'Delete' + '</button>' +
                            '</tr>'
                    }
                } else {
                    document.getElementById('table112').style.display = 'none'
                    document.getElementById('noData').style.display = 'block'
                }
                // if (data.data.latestRequests.length) {
                //     //***************Table For latest Requests************ */
                //     $("#table12").html(' ');
                //     for (var i = 0; i < data.data.latestRequests.length; i++) {
                //         if (data.data.latestRequests[i].status == 'pending') {
                //             var status = '<td><span class="label label-success" style="border-radius:3px;"><strong>' + "Pending" + '</strong></span>'
                //         } else {
                //             var status = '<td><span class="label label-info" style="border-radius:3px;"><strong>' + "Completed" + '</strong></span>'
                //         }
                //         if (data.data.latestRequests[i].assign_service_boy == true) {
                //             var service_boy = '<td><strong>' + (data.data.latestRequests[i].service_boyId.name) + '</strong>' +
                //                 '<td><strong>' + (data.data.latestRequests[i].service_boyId.countryCode + " " + data.data.latestRequests[i].service_boyId.phoneNumber) + '</strong>'
                //             var assign = '<button type="button" class="btn btn-sm btn-info ml-2 mb-2" onclick= serviceRequest_details(' + '\'' + data.data.latestRequests[i]._id + '\'' + ')>' + 'View' + '</button>'
                //         } else {
                //             var assign = '<button type="button" class="btn btn-sm btn-primary ml-2 mb-2" data-toggle="modal" data-target="#myModal5" onclick= assign_toServiceBoyList1(' + '\'' + data.data.latestRequests[i]._id + '\'' + ')>' + 'Assign' + '</button>'
                //             var service_boy = '<td><strong>' + 'N/A' + '</strong>' +
                //                 '<td><strong>' + 'N/A' + '</strong>'
                //         }
                //         if (data.data.latestRequests[i].type && data.data.latestRequests[i].type == 'inquery') {
                //             var deviceType = 'N/A'
                //             var problem = 'N/A'
                //             var address = data.data.latestRequests[i].address
                //         } else {
                //             var deviceType = (data.data.latestRequests[i].user_deviceId.deviceType)
                //             var problem = data.data.latestRequests[i].problem
                //             var address = (data.data.latestRequests[i].user_deviceId.address)
                //         }
                //         document.getElementById('table12').innerHTML += '<tr>' +
                //             '<td><strong>' + "#" + data.data.latestRequests[i].service_requestId + '</strong>' +
                //             '<td><strong>' + deviceType + '</strong>' +
                //             '<td><strong>' + (data.data.latestRequests[i].userId.name ? data.data.latestRequests[i].userId.name : 'N/A') + '</strong>' +
                //             '<td><strong>' + (data.data.latestRequests[i].userId.countryCode + " " + data.data.latestRequests[i].userId.phoneNumber) + '</strong>' +
                //             '<td><strong>' + problem + '</strong>' +
                //             // '<td><strong>' + data.data.latestRequests[i].note + '</strong>' +
                //             '<td><strong>' + address + '</strong>' +
                //             service_boy +
                //             '<td><strong>' + moment(data.data.latestRequests[i].createdAt).format('YYYY-MM-DD,hh:mm A') + '</strong>' +
                //             status +
                //             '<td>' +
                //             assign +
                //             '</tr>'
                //     }
                // } else {
                //     document.getElementById('table12').style.display = 'none'
                //     document.getElementById('noData1').style.display = 'block'

                // }
            } else {
                console.log(status, "Ss;s;s;s;s;s")
            }
        }
    });
}

function updateStatus1(userId, status) {
    if (status == "true") {
        var y = false
    } else {
        var y = true
    }
    $.ajax({
        url: `${host}/api/v1/admin/user/updateStatus?userId=${userId}&status=${y}`,
        type: 'GET',
        // contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', sessionStorage.getItem('token'));
        },
        dataType: 'json',
        success: function (data, status) {
            if (data.code == 200) {
                dashboardData();
                console.log('success')
            } else {
                console.log("error")
                alert("Something Wrong, Try again")
            }
        }
    })
}

function deleteUser1(userId) {
    swal({
        title: "Are you want to remove this user?",
        text: "Ready to Action!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Take Action!",
        cancelButtonText: "No, leave pls!",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: `${host}/api/v1/admin/user/deleteUser/${userId}`,
                    type: 'Delete',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', sessionStorage.getItem('token'));
                    },
                    dataType: 'json',
                }).done(function (data) {
                    swal.close();
                    dashboardData();
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    alert(jqXHR.responseJSON.error)
                    swal.close();
                })
            }
            else {
                swal("Cancelled", "Your file is safe :");
            }
        });
}

$(document).ready(function () {
    $("#addform1").submit(function (e) {
        e.preventDefault();
        const button = document.getElementById('Submit')
        const cancel = document.getElementById('cancel')
        button.innerHTML = 'Submitting---'
        button.disabled = true
        cancel.disabled = true
        const service_boyId = document.getElementById('service_boyId').value
        const service_requestId = document.getElementById('service_requestId').value
        console.log(service_boyId, "kkdd", service_requestId)
        $.ajax({
            url: host + `/api/v1/admin/service_request/assign_toService_boy?service_boyId=${service_boyId}&service_requestId=${service_requestId}`,
            type: 'Get',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', token);
            },
            contentType: false,
            processData: false,
        }).done(function (data) {
            // If successful
            button.innerHTML = 'Submit'
            button.disabled = false
            cancel.disabled = false
            dashboardData();
            // Add the data-dismiss attribute to the button
            button.setAttribute("data-dismiss", "modal");
            button.click();
            // window.location.replace('/admin/dash');
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // If fail
            button.innerHTML = 'Submit'
            button.disabled = false
            cancel.disabled = false
            alert(jqXHR.responseJSON.error)
        });
    });
});
var choicesInstances = {};

// Function to create or update Choices instance
function createOrUpdateChoicesInstance1(selectId, options) {
    // Destroy existing instance if it exists
    if (choicesInstances[selectId]) {
        choicesInstances[selectId].destroy();
    }

    // Create new instance
    choicesInstances[selectId] = new Choices(selectId, options);
}

function assign_toServiceBoyList1(service_requestId) {
    try {
        document.getElementById('service_requestId').value = service_requestId
        $.ajax({
            url: host + '/api/v1/admin/service_request/serviceBoyList_forAssignTime',
            type: 'Get',
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', token);
            },
            dataType: 'json',
            success: function (data, status) {
                if (data.code == 200) {
                    var array = [{
                        "value": '',
                        "label": 'Select an service boy', // Placeholder text
                        "disabled": true,
                        "selected": true,
                        "hidden": true
                    }]
                    if (data.data.length > 0) {
                        for (let i = 0; i < data.data.length; i++) {
                            var obj = {
                                "value": data.data[i]._id,
                                "label": data.data[i].name,
                                "selected": false
                            }
                            array.push(obj);
                        }
                        console.log(array, "llllllll")
                        // var multipleCancelButton = new Choices('#service_boyId', {
                        //     removeItemButton: true,
                        //     choices: array,
                        //     maxItemCount: 100,
                        //     searchResultLimit: 100,
                        //     renderChoiceLimit: 100,
                        //     placeholder: 'Select an option' // Placeholder text
                        // });
                    }
                    var choicesOptions = {
                        removeItemButton: true,
                        choices: array,
                        shouldSort: false // Disable sorting
                        // searchEnabled: true, // Enable search functionality
                        // searchChoices: true // Enable search within the dropdown
                    };
                    createOrUpdateChoicesInstance1('#service_boyId', choicesOptions);
                } else {
                    // document.getElementById('table').innerHTML = ''
                }
            }
        });
    } catch (err) {
        alert(err)
    }
}

function memberList() {
    localStorage.setItem('location', "user_member")
}


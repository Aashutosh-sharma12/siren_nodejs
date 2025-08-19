

function saveLogoutSession() {
  var logoutSession = $("#sessionInput").val();
  if (logoutSession > 60) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Value',
      text: 'Logout Session Time cannot be more than 60 minutes.',
      confirmButtonText: 'OK'
    });
    this.value = logoutSession;
    return;
  }
  $.ajax({
    url: host + "/api/v1/admin/config/lotoutORpaniTime",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      logoutSession: logoutSession
    }),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', token);
    },
    success: function (res) {

      swal("Success", "Logout session updated!", "success");
      // loadLogoutSessions();
      // $("#sessionInput").val("");
    },
    error: function (xhr) {
      swal("Error", xhr.responseJSON?.message || "Something went wrong", "error");
    }
  });
}


function submitPanicTime() {
  var panicDay = $("#panicDay").val();
  var panicHr = $("#panicHour").val();
  var panicMin = $("#panicMinute").val();
  if (panicHr > 24) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Value',
      text: 'Panic hour cannot be grater than 24 hr.',
      confirmButtonText: 'OK'
    });
    this.value = panicHr;
    return;
  }
  if (panicMin > 60) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Value',
      text: 'Panic sec cannot be grater than 60 sec.',
      confirmButtonText: 'OK'
    });
    this.value = panicMin;
    return;
  }
  var data = {};
  if (panicDay) { data.panicDay = panicDay }
  if (panicHr) { data.panicHour = panicHr }
  if (panicMin) { data.panicMinute = panicMin }
  $.ajax({
    url: host + "/api/v1/admin/config/lotoutORpaniTime",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', token);
    },
    success: function (res) {
      swal("Success", "Panic Time Stored Successfully!", "success");
      // loadLogoutSessions();

      // Clear inputs
      // $("#panicDay, #panicHour, #panicMinute").val("");
    },
    error: function (xhr) {
      swal("Error", xhr.responseJSON?.message || "Something went wrong", "error");
    }
  });
}

function loadLastLogoutSession() {
  this.setTimeout(() => {
    document.getElementById('configuration-nav')?.classList.add("active");
  }, 1500)
  $.ajax({
    url: host + '/api/v1/admin/config/lastData',
    type: 'GET',
    dataType: 'json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', token);
    },
    success: function (data) {
      if (data.data && data.data.logoutSession !== undefined) {
        $('#sessionInput').val(data.data.logoutSession);
      }
      if (data.data && data.data.panicTime !== undefined) {
        $('#panicDay').val(data.data.panicTime.panicDay);
        $('#panicHour').val(data.data.panicTime.panicHour);
        $('#panicMinute').val(data.data.panicTime.panicMinute);
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching logout session:', error);
    }
  });
}


// $(document).ready(function () {
//   loadSessions();
// });
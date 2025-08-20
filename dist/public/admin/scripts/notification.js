

function pageLoad(){
    this.setTimeout(() => {
                document.getElementById('notification-nav')?.classList.add("active");
            })
}
function readURL1(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#blah1')
                .attr('src', e.target.result)
                .width(150)
                .height(150);
        };
        reader.readAsDataURL(input.files[0]);
    }
}
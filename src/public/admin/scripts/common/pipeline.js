// this.setTimeout(() => {
//     fetch("views/common/navbar.html")
//         .then(response => {
//             return response.text()
//         })
//         .then(data => {
//             // setTimeout()
//             console.log(data, "slslslsls")
//             document.querySelector("navbar").innerHTML = data ? data : '';
//             document.getElementById('wrapper').style.display = "flex";
//         });

//     fetch("views/common/footer.html")
//         .then(response => {
//             return response.text()
//         })
//         .then(data => {
//             console.log(data, "header")
//             document.querySelector("footer").innerHTML = data;
//         });
// }, 1500)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fetch("views/common/navbar.html")
            .then(response => response.text())
            .then(data => {
                // console.log(data, "navbar");
                document.querySelector("navbar").innerHTML = data || '';
                document.getElementById('wrapper').style.display = "flex";
            });

        fetch("views/common/footer.html")
            .then(response => response.text())
            .then(data => {
                // console.log(data, "footer");
                document.querySelector("footer").innerHTML = data || '';
            });
            // fetch("views/common/header.html")
            // .then(response => response.text())
            // .then(data => {
            //     // console.log(data, "footer");
            //     document.querySelector("bottom").innerHTML = data || '';
            // });
    },100);
});

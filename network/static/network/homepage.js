document.addEventListener('DOMContentLoaded', function (){
    test();
});
function test(){
    const header = document.querySelector("#header");
    header.innerHTML = "javascript loaded test";
}
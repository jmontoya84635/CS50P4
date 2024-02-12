document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#post-submit').addEventListener('click', createPost);
    document.querySelector('#Posts').addEventListener('click', loadPosts);
});

function createPost() {

}

function loadPosts() {
    fetch('posts/main', {
        method: "GET"
    })
        .then(r => r.json())
        .then(result => {
            for (let count = 0; count < result.length; count++) {
                console.log(result[count])
            }
        })
}
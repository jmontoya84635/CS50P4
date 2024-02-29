// noinspection JSValidateTypes
// noinspection JSValidateTypes

let csrftoken;
let isLoggedIn;
let feedType;

document.addEventListener('DOMContentLoaded', function () {
    csrftoken = document.querySelector('[name=csrf-token]').content;
    feedType = document.querySelector('#feedType').value;

    let createPostArea = document.querySelector('#post-text');
    let createCommentArea = document.querySelector('#comment-text');
    let heightLimit = 400;
    isLoggedIn = createPostArea != null;
    if (isLoggedIn) {
        createPostArea.oninput = () => {
            createPostArea.style.height = "";
            createPostArea.style.height = Math.min(createPostArea.scrollHeight, heightLimit) + "px";
        }
        createCommentArea.oninput = () => {
            createCommentArea.style.height = "";
            createCommentArea.style.height = Math.min(createCommentArea.scrollHeight, heightLimit) + "px";
        }
    }
    let offcanvasBottom = document.querySelector('#offcanvasBottom');
    offcanvasBottom.addEventListener('hidden.bs.offcanvas', () => {
        let comments = document.querySelector("#offcanvasBody");
        comments.textContent = '';
        if (isLoggedIn) {
            createCommentArea.value = "";
            createCommentArea.style.height = "";
        }
    });
    offcanvasBottom.addEventListener('shown.bs.offcanvas', () => {
        let commentField = document.querySelector('#comment-text');
        if (isLoggedIn) {
            commentField.focus();
        }
    });

    let createPostButton = document.querySelector('#create-post-submit')
    if (isLoggedIn) {
        createPostButton.addEventListener('click', submitNewPost)

        let createCommentButton = document.querySelector('#create-comment-submit')
        createCommentButton.addEventListener('click', event => {
            let offcanvasBody = document.querySelector('#offcanvasBody')
            let commentSection = offcanvasBody.firstChild;
            let commentPost = commentSection.id.split('commentSection-')[1];
            submitNewComment(event, commentPost)
        })
    }

    loadPosts();
});

function submitNewPost(event) {
    let postTextArea = document.querySelector('#post-text');
    if (postTextArea.value === '') {
        event.preventDefault();
        if (!document.querySelector('#alert')) {
            let alert = document.createElement('div');
            alert.className = 'alert alert-danger mt-4';
            alert.id = 'alert'
            alert.innerHTML = 'Post cannot be blank!';
            alert.style.animation = 'pop 0.5s';
            const bodyDiv = document.querySelector('#body-div');
            bodyDiv.prepend(alert)
        } else {
            let alert = document.querySelector('#alert');
            alert.style.animation = 'none'
            alert.offsetHeight;
            alert.style.animation = 'pop 0.5s'
        }
    } else {
        console.log(`user said:${postTextArea.value}`)
        fetch('/create/post', {
            method: 'POST',
            body: JSON.stringify({
                text: postTextArea.value,
            }),
            headers: {
                "X-CSRFToken": csrftoken,
            }
        }).then(response => response.json())
            .then(result => {
                console.log(result)
            })
    }
}

function submitNewComment(event, postId) {
    let commentTextArea = document.querySelector('#comment-text');
    if (commentTextArea.value === '') {
        event.preventDefault();
        if (!document.querySelector('#alert')) {
            let alert = document.createElement('div');
            alert.className = 'alert alert-danger mt-4';
            alert.id = 'alert'
            alert.innerHTML = 'Post cannot be blank!';
            alert.style.animation = 'pop 0.5s';
            const offcanvasBottom = document.querySelector('#offcanvasBottom');
            offcanvasBottom.prepend(alert)
        } else {
            let alert = document.querySelector('#alert');
            alert.style.animation = 'none'
            alert.offsetHeight;
            alert.style.animation = 'pop 0.5s'
        }
    } else {
        fetch('create/comment', {
            method: 'POST',
            body: JSON.stringify({
                text: commentTextArea.value,
                postId: postId,
            }),
            headers: {
                "X-CSRFToken": csrftoken,
            }
        }).then(response => response.json())
            .then(result => {
                console.log(result)
            })
    }
}

function appendComment(parent, creator, comment, commentTimestamp) {
    let commentCard = document.createElement('div');
    commentCard.className = "card mb-4"

    let commentHeader = document.createElement('a');
    commentHeader.className = "card-header link-primary link-opacity-50-hover link-underline-opacity-0 fs-5";
    commentHeader.href = `/user/${creator}`
    commentHeader.innerHTML = creator;

    let cardBody = document.createElement('div');
    cardBody.className = "card-body";
    cardBody.innerHTML = comment;

    let footer = document.createElement('div');
    footer.className = "card-footer d-flex";

    let timestamp = document.createElement('small');
    timestamp.innerHTML = commentTimestamp;
    timestamp.className = "text-body-secondary";

    parent.append(commentCard)
    commentCard.append(commentHeader);
    commentCard.append(cardBody);
    commentCard.append(footer);
    footer.append(timestamp)
    // TODO: add likes

}

function loadPosts() {
    console.log(feedType)
    fetch(`/posts/${feedType}`, {
        method: "GET"
    })
        .then(r => r.json())
        .then(result => {
                const postsDiv = document.querySelector('#Posts');
                if (result.length) {
                    for (let i = 0; i < result.length; i++) {
                        let child = document.createElement('div');
                        child.className = "card m-4";

                        let header = document.createElement('div');
                        header.className = "card-header d-flex";

                        let title = document.createElement('a');
                        title.innerHTML = result[i]["creator"];
                        title.href = `/user/${result[i]["creator"]}`
                        title.className = "link-primary link-opacity-50-hover link-underline-opacity-0 fs-4"

                        let cardBody = document.createElement('div');
                        cardBody.className = "card-body";

                        let text = document.createElement('p');
                        text.innerHTML = result[i]["content"];

                        let footer = document.createElement('div');
                        footer.className = "card-footer d-flex";

                        let timestamp = document.createElement('small');
                        timestamp.innerHTML = result[i]["timestamp"];
                        timestamp.className = "text-body-secondary";

                        let likeButton = document.createElement('button');
                        likeButton.innerHTML = result[i]["likeCount"];
                        if (result[i]["liked"] === true) {
                            likeButton.className = "ms-auto bi bi-heart-fill";
                        } else {
                            likeButton.className = "ms-auto bi bi-heart";
                        }
                        likeButton.style = "border: none; background-color: transparent; color: red;"
                        if (isLoggedIn) {
                            likeButton.addEventListener('click', function () {
                                let action;
                                if (likeButton.className === "ms-auto bi bi-heart") {
                                    likeButton.className = "ms-auto bi bi-heart-fill";
                                    action = "add";
                                } else {
                                    likeButton.className = "ms-auto bi bi-heart";
                                    action = "remove";
                                }
                                fetch(`like/${result[i]["id"]}/${action}`, {
                                    method: "POST",
                                    headers: {
                                        "X-CSRFToken": csrftoken
                                    }
                                })
                                    .then(r => r.json())
                                    .then(result => {
                                        likeButton.innerHTML = result["likeCount"];
                                    })
                            })
                        }

                        let commentButton = document.createElement('button');
                        commentButton.innerHTML = result[i]["commentCount"];
                        commentButton.className = "bi me-2 bi-chat";
                        commentButton.style = "border: none; background-color: transparent; color: blue;";
                        commentButton.type = "button";
                        commentButton.dataset.bsToggle = "offcanvas";
                        commentButton.dataset.bsTarget = "#offcanvasBottom";
                        commentButton.setAttribute('aria-controls', 'offcanvasBottom');

                        commentButton.addEventListener('click', function () {
                                let offcanvasBody = document.querySelector('#offcanvasBody');
                                let commentSection = document.createElement('div');
                                commentSection.id = `commentSection-${result[i]["id"]}`;
                                offcanvasBody.append(commentSection);
                                if (result[i]["commentCount"] > 0) {
                                    fetch(`comment/${result[i]["id"]}/viewPostReplies`, {
                                        method: "GET"
                                    })
                                        .then(r => r.json())
                                        .then(result2 => {
                                            for (let j = 0; j < result2.length; j++) {
                                                appendComment(commentSection, result2[j]["creator"], result2[j]["text"], result2[j]["timestamp"])
                                            }
                                        })
                                } else {
                                    let title = document.createElement('h3');
                                    title.innerHTML = "No Comments Yet"
                                    title.className = "text-center text-muted"
                                    commentSection.append(title)
                                }
                            }
                        )
                        postsDiv.append(child);

                        child.append(header);
                        header.append(title);

                        child.append(cardBody);
                        cardBody.append(text);

                        child.append(footer);
                        footer.append(timestamp);
                        footer.append(likeButton);
                        footer.append(commentButton)
                    }
                } else {
                    console.log("no posts")
                    let noPosts = document.createElement('h1')
                    noPosts.className = "color-red text-center"
                    noPosts.innerHTML = `No posts in ${feedType} feed`
                    postsDiv.append(noPosts)
                }
            }
        )
}


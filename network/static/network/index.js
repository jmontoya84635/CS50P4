// noinspection JSValidateTypes

let csrftoken;
let isLoggedIn;
let feedType;
let currPage;
let activePage;
let username;

document.addEventListener('DOMContentLoaded', function () {
    csrftoken = document.querySelector('[name=csrf-token]').content;
    feedType = document.querySelector('#feedType').value;
    currPage = document.querySelector("#currPageNumber").value;
    username = document.querySelector('#logged-in-username').innerHTML


    let paginatorNums = document.querySelectorAll('#paginator-page-ul a');
    let paginatorPrevious = document.querySelector("#paginator-page-previous");
    let paginatorNext = document.querySelector("#paginator-page-next");
    let lastPage = document.querySelector('#lastPageNumber').value;
        activePage = document.querySelector(`#paginator-page-${currPage}`);
    if (activePage != null) {
        activePage.className = "page-item active";


        paginationLimits(paginatorPrevious, paginatorNext, lastPage);
        paginatorNums.forEach(link => {
            let number = link.innerHTML;
            link.addEventListener('click', () => {
                activePage.className = "page-item"
                currPage = parseInt(currPage);
                if (number === "Previous" && currPage !== 1) {
                    currPage -= 1;
                    currPage = currPage.toString()
                } else if (number === "Next" && currPage !== lastPage) {
                    currPage += 1;
                    currPage = currPage.toString()
                } else {
                    currPage = number
                }
                loadPosts()
                paginationLimits(paginatorPrevious, paginatorNext, lastPage)
                activePage = document.querySelector(`#paginator-page-${currPage}`)
                activePage.className = "page-item active"
            })
        });
    }

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

function paginationLimits(paginatorPrevious, paginatorNext, lastPage) {
    if (currPage === "1") {
        paginatorPrevious.className = "page-item disabled";
    } else {
        paginatorPrevious.className = "page-item";
    }
    if (parseInt(currPage) === parseInt(lastPage)) {
        paginatorNext.className = "page-item disabled";
    } else {
        paginatorNext.className = "page-item";
    }
}

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
            .then(()=> {
                location.reload();
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
                console.log(result);
                location.reload();
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

    parent.append(commentCard);
    commentCard.append(commentHeader);
    commentCard.append(cardBody);
    commentCard.append(footer);
    footer.append(timestamp);
}

function editPost(cardBody, text, editButtonDiv, editButton, postID) {
    editButtonDiv.textContent = "";
    let cancelButton = document.createElement('button');
    cancelButton.className = "btn btn-danger me-1";
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        cardBody.textContent = '';
        cardBody.append(text);
        editButtonDiv.textContent = '';
        editButtonDiv.append(editButton);
    });
    let confirmButton = document.createElement('button');
    confirmButton.className = "btn btn-success me-1";
    confirmButton.innerHTML = "Confirm";
    confirmButton.addEventListener('click', (event) => {
        event.preventDefault();
        editButtonDiv.textContent = '';
        editButtonDiv.append(editButton);
        cardBody.textContent = '';
        text.innerHTML = textArea.value;
        fetch('/edit', {
            method: "POST",
            body: JSON.stringify({
                "postID": postID,
                "text": text.innerHTML,
            }),
            headers: {
                "X-CSRFToken": csrftoken,
            }
        }).then(response => response.json())
            .then(result => {
                console.log(result["message"]);
                if (result["message"] === "success"){
                    cardBody.append(text);
                }
            })

    })
    editButtonDiv.append(cancelButton, confirmButton);

    let textDiv = document.createElement('div');
    textDiv.className = "form-floating";
    let textArea = document.createElement('textarea');
    textArea.className = "form-control";
    textArea.innerHTML = text.innerHTML;
    textArea.id = "edit-text-area";
    let label = document.createElement('label');
    label.setAttribute("for", "edit-text-area");
    label.innerHTML = "Edit";
    textDiv.append(textArea, label);

    cardBody.textContent = "";
    cardBody.append(textDiv);
    textArea.style.height = textArea.scrollHeight + 'px';
    textArea.oninput = () => {
        textArea.style.height = "";
        textArea.style.height = textArea.scrollHeight + 'px';
    }
}

function loadPosts() {
    fetch(`/posts/${feedType}?page=${currPage}`, {
        method: "GET",
    })
        .then(r => r.json())
        .then(result => {
                const postsDiv = document.querySelector('#Posts');
                postsDiv.textContent = '';
                if (result.length) {
                    for (let i = 0; i < result.length; i++) {
                        let child = document.createElement('div');
                        child.className = "card m-4";
                        child.id = `post-id-${result[i]["id"]}`

                        let header = document.createElement('div');
                        header.className = "card-header d-flex";

                        let title = document.createElement('a');
                        title.innerHTML = result[i]["creator"];
                        title.href = `/user/${result[i]["creator"]}`
                        title.className = "link-primary link-opacity-50-hover link-underline-opacity-0 fs-4"

                        let editButtonDiv = document.createElement('div');

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

                        if (isLoggedIn && (username === title.innerHTML)) {
                            editButtonDiv.id = "edit-button-div"
                            editButtonDiv.className = "ms-auto d-flex";
                            header.append(editButtonDiv);

                            let editButton = document.createElement('button');
                            editButton.className = "me-1 btn btn-primary";
                            editButton.innerHTML = "Edit post";
                            editButton.addEventListener('click', (event) => {
                                event.preventDefault()
                                editPost(cardBody, text, editButtonDiv, editButton, result[i]["id"])
                            })
                            editButtonDiv.append(editButton)
                        }
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


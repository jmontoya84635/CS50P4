// noinspection JSValidateTypes
// noinspection JSValidateTypes

let csrftoken;
document.addEventListener('DOMContentLoaded', function () {
    csrftoken = document.querySelector('[name=csrf-token]').content;
    // document.querySelector('#post-submit').addEventListener('click', createPost);
    loadPosts();
});

// function createPost() {
//
// }

function loadPosts() {
    fetch('posts/main', {
        method: "GET"
    })
        .then(r => r.json())
        .then(result => {
            const postsDiv = document.querySelector('#Posts');
            for (let i = 0; i < result.length; i++) {
                let child = document.createElement('div');
                child.className = "card m-4";

                let header = document.createElement('div');
                header.className = "card-header d-flex";


                let title = document.createElement('h5');
                title.innerHTML = result[i]["creator"];

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
                likeButton.addEventListener('click', function () {
                    let action
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
                let commentButton = document.createElement('button');
                commentButton.innerHTML = result[i]["commentCount"];
                commentButton.className = "bi ms-3 me-2 bi-chat";
                commentButton.style = "border: none; background-color: transparent; color: blue;"
                commentButton.addEventListener('click', function () {
                        if (commentButton.className === "bi ms-3 me-2 bi-chat") {
                            commentButton.className = "bi ms-3 me-2 bi-chat-fill";
                            fetch(`comment/${result[i]["id"]}/view`, {
                                method: "GET"
                            })
                                .then(r => r.json())
                                .then(result2 => {
                                    let commentSection = document.createElement('div');
                                    commentSection.className = "card ms-4 p-2 mt-2 mb-2";
                                    commentSection.id = `commentSection-${result[i]["id"]}`
                                    cardBody.append(commentSection);
                                    for (let j = 0; j < result2.length; j++) {
                                        let comment = document.createElement('div');
                                        let commentCreator = document.createElement('h5');
                                        commentCreator.innerHTML = result2[j]["creator"];
                                        let commentText = document.createElement('p');
                                        commentText.innerHTML = result2[j]["text"];

                                        commentSection.append(comment);
                                        comment.append(commentCreator);
                                        comment.append(commentText);
                                    }
                                })
                        } else {
                            commentButton.className = "bi ms-3 me-2 bi-chat";
                            let commentSection = document.querySelector(`#commentSection-${result[i]["id"]}`);
                            commentSection.remove();

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
        })
}


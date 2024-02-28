let csrftoken;
let username;
document.addEventListener('DOMContentLoaded', function () {
    csrftoken = document.querySelector('[name=csrf-token]').content;
    username = document.querySelector('#username').innerHTML;
    username = username.substring(0, username.length-2)

    let offcanvasBottom = document.querySelector('#offcanvasBottom');
    offcanvasBottom.addEventListener('hidden.bs.offcanvas', () => {
        offCanvasBody.textContent = ''
    });

    let offCanvasLabel = document.querySelector("#offcanvasBottomLabel")
    let offCanvasBody = document.querySelector("#offcanvasBody")
    const followers = document.querySelector('#user-follower-count');
    followers.addEventListener('click', () => {
        followersFunc(offCanvasLabel, offCanvasBody);
    });
    const following = document.querySelector('#user-following-count');
    following.addEventListener('click',  () => {
        followingFunc(offCanvasLabel, offCanvasBody);
    });

    let followButton = document.querySelector('#follow-button')
    let unfollowButton = document.querySelector('#unfollow-button')
    if (followButton != null){
        followButton.addEventListener('click', follow)
    }
    if (unfollowButton != null){
        unfollowButton.addEventListener('click', unfollow)
    }

})

function follow(){

}

function unfollow(){

}

function addUserToCard(parent, cardUsername, postCount, followerCount, followingCount){
    let card = document.createElement('div');
    card.className = "card mb-4";
    let cardHeader = document.createElement('a');
    cardHeader.href = `/user/${cardUsername}`;
    cardHeader.className = "card-header link-primary link-opacity-50-hover link-underline-opacity-0";
    let cardTitle = document.createElement('h2');
    cardTitle.innerHTML = cardUsername;
    cardHeader.append(cardTitle);

    let cardBody = document.createElement('div');
    cardBody.className = "card-body d-flex justify-content-around";
    card.append(cardHeader, cardBody);

    let postCountDiv = document.createElement('div');
    let postCountNum = document.createElement('h4');
    postCountNum.innerHTML = postCount;
    postCountNum.className = "text-center"
    let postCountLabel = document.createElement('h4');
    postCountLabel.className = "text-center"
    if (postCount === 1){
        postCountLabel.innerHTML = "Post"
    } else {
        postCountLabel.innerHTML = "Posts";
    }
    postCountDiv.append(postCountNum, postCountLabel);

    let followerCountDiv = document.createElement('div');
    let followerCountNum = document.createElement('h4');
    followerCountNum.innerHTML = followerCount;
    followerCountNum.className = "text-center";
    let followerCountLabel = document.createElement('h4');
    followerCountLabel.className = "text-center"
    if (followerCount === 1){
        followerCountLabel.innerHTML = "Follower"
    } else {
        followerCountLabel.innerHTML = "Followers";
    }
    followerCountDiv.append(followerCountNum, followerCountLabel);

    let followingCountDiv = document.createElement('div');
    let followingCountNum = document.createElement('h4');
    followingCountNum.innerHTML = followingCount;
    followingCountNum.className = "text-center";
    let followingCountLabel = document.createElement('h4');
    followingCountLabel.className = "text-center"
    followingCountLabel.innerHTML = "Following"
    followingCountDiv.append(followingCountNum, followingCountLabel);

    cardBody.append(postCountDiv, followerCountDiv, followingCountDiv);

    parent.append(card)
}

function followersFunc(header, bodyNode) {
    header.innerHTML = "Followers";
    fetch(`/follow/followers/${username}`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(followerList => {
            if (followerList.length){
                for (let i = 0; i < followerList.length; i++) {
                    addUserToCard(
                        bodyNode,
                        followerList[i]["username"],
                        followerList[i]["postCount"],
                        followerList[i]["followerCount"],
                        followerList[i]["followingCount"],
                    );
                }
            }else {
                let noFollowers = document.createElement('h1');
                noFollowers.className = "text-center mt-4";
                noFollowers.innerHTML = "No followers";
                bodyNode.append(noFollowers);
            }
        });
}

function followingFunc(header, bodyNode) {
    header.innerHTML = "Following";
    fetch(`/follow/following/${username}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(followingList => {
            if (followingList.length){
                for (let i = 0; i < followingList.length; i++) {
                    addUserToCard(
                        bodyNode,
                        followingList[i]["username"],
                        followingList[i]["postCount"],
                        followingList[i]["followerCount"],
                        followingList[i]["followingCount"],
                    );
                }
            }else {
                let noFollowing = document.createElement('h1');
                noFollowing.className = "text-center mt-4";
                noFollowing.innerHTML = "Not Following Anyone";
                bodyNode.append(noFollowing);
            }
        });
}
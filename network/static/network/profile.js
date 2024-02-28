let csrftoken
document.addEventListener('DOMContentLoaded', function () {
    csrftoken = document.querySelector('[name=csrf-token]').content;

    const followers = document.querySelector('#user-follower-count');
    followers.addEventListener('click', followersFunc)
    const following = document.querySelector('#user-following-count');
    following.addEventListener('click', followingFunc)

})

function followersFunc(self) {
    self.style = "border: none; background-color: transparent; color: blue;";
    self.type = "button";
    self.dataset.bsToggle = "offcanvas";
    self.dataset.bsTarget = "#offcanvasBottom";
    self.setAttribute('aria-controls', 'offcanvasBottom');
}

function followingFunc() {
    console.log("clicked following")
}
import json

from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Reaction, Comment, Follow
from django.core.paginator import Paginator
from math import ceil

postPerPage = 10


# API

def feed(request, feed_name):
    page = request.GET.get('page', 1)
    posts = []
    if feed_name == "main":
        posts = Post.objects.all()
    elif request.user.is_authenticated:
        if feed_name == "following":
            userFollowingObjects = request.user.following.all()
            userFollowingUsers = []
            for user in userFollowingObjects:
                userFollowingUsers.append(user.following)
            posts = Post.objects.filter(creator__in=userFollowingUsers)
            if not len(posts):
                return JsonResponse({})
    else:
        return JsonResponse({
            "error": "you must be logged in to see any other feed!"
        })

    posts = posts.order_by("-timestamp").all()
    posts_paginator = Paginator(posts, postPerPage)
    postsOnPage = posts_paginator.page(page).object_list

    return JsonResponse([post.serialize(request.user) for post in postsOnPage], safe=False)


@login_required
def create(request, createType):
    if request.method != "POST":
        return JsonResponse({
            "error": "Must be post response",
        }, status=400)
    data = json.loads(request.body)
    text = data.get("text", "")

    if createType == "post":
        newPost = Post(
            creator=request.user,
            content=text,
        )
        try:
            newPost.save()
        except Exception as e:
            return JsonResponse({"error": e}, status=500)
    elif createType == "comment":
        commentPost = int(data.get("postId", ""))
        newComment = Comment(
            creator=request.user,
            post=Post.objects.get(pk=commentPost),
            text=text,
        )
        try:
            newComment.save()
        except Exception as e:
            return JsonResponse({"error": e}, status=500)
    return JsonResponse({"message": "post created successfully."}, status=201)


def comment(request, Id, action):
    if action == "viewPostReplies":
        post = Post.objects.get(pk=Id)
        comments = post.Comment.all()
        comments = comments.order_by("-timestamp").all()
        return JsonResponse([str_comment.serialize() for str_comment in comments], safe=False)
    elif action == "viewCommentReplies":
        requestedComment = Comment.objects.get(pk=Id)
        replies = requestedComment.replies.all()
        return JsonResponse([str_comment.serialize() for str_comment in replies], safe=False)
    else:
        return JsonResponse({
            "error": "Invalid action."
        }, status=400)


@login_required
def like(request, postId, action):
    if request.method != "POST":
        return JsonResponse({
            "error": "POST request required."
        }, status=400)
    if action == "add":
        post = Post.objects.get(pk=postId)
        reaction = Reaction(creator=request.user, post=post)
        reaction.save()
        return JsonResponse({
            "message": "added like successfully.",
            "likeCount": len(post.likes.all()),
        }, status=201)
    if action == "remove":
        post = Post.objects.get(pk=postId)
        reaction = Reaction.objects.get(creator=request.user, post=post)
        reaction.delete()
        return JsonResponse({
            "message": "removed like successfully.",
            "likeCount": len(post.likes.all()),
        }, status=201)
    else:
        return JsonResponse({
            "error": "Invalid action."
        }, status=400)


def follow(request, listType, user):
    user = User.objects.get(username=user)
    followingList = user.following.all()
    followerList = user.followers.all()

    if request.method == "GET":
        if listType == "following":
            return JsonResponse([followingObj.following.serialize() for followingObj in followingList], safe=False)
        elif listType == "followers":
            return JsonResponse([followerObj.follower.serialize() for followerObj in followerList], safe=False)
        else:
            return JsonResponse({
                "error": "Invalid follow type."
            }, status=400)
    elif request.user.is_authenticated:
        if request.method == "POST":
            if listType == "following":

                newFollow = Follow(
                    follower=request.user,
                    following=user
                )
                newFollow.save()
                return JsonResponse({
                    "message": f'followed {user.username}'
                }, status=200)
            else:
                return JsonResponse({
                    "error": "Invalid follow type."
                }, status=400)
        elif request.method == "PUT":
            if listType == "following":
                currFollow = Follow.objects.filter(follower=request.user, following=user)
                for iterFollow in currFollow:
                    iterFollow.delete()
                return JsonResponse({
                    "message": f'unfollowed {user.username}'
                }, status=200)
            else:
                return JsonResponse({
                    "error": "Invalid follow type."
                }, status=400)
    elif not request.user.is_authenticated:
        return JsonResponse({
            "error": "Must be logged in"
        }, status=400)
    else:
        return JsonResponse({
            "error": "Invalid request type"
        }, status=400)


# VIEWS
def index(request):
    postsNum = len(Post.objects.all())
    pageNum = ceil(postsNum / postPerPage)
    print(range(1, pageNum))
    return render(request, "network/index.html", {
        "feedType": "main",
        "pageNums": range(1, pageNum + 1),
        "pageTotal": pageNum,
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def profile(request, username):
    profileUser = User.objects.get(username=username)
    userFollowers = profileUser.followers.all()
    userFollowing = profileUser.following.all()
    posts = profileUser.Post.all()
    posts = posts.order_by("-timestamp").all()

    isUserProfile = False
    isFollowing = False
    if request.user.is_authenticated:
        if request.user.username == username:
            isUserProfile = True
        else:
            for user in userFollowers:
                if request.user == user.follower:
                    isFollowing = True
                    break

    return render(request, "network/profile.html", {
        "profileUsername": username,
        "followerCount": len(userFollowers),
        "followingCount": len(userFollowing),
        "posts": posts,
        "postCount": len(posts),
        "isUsersPofile": isUserProfile,
        "isFollowing": isFollowing,
    })


@login_required
def following(request):
    posts = []
    userFollowingObjects = request.user.following.all()
    userFollowingUsers = []
    for user in userFollowingObjects:
        userFollowingUsers.append(user.following)
        posts = Post.objects.filter(creator__in=userFollowingUsers)

    if len(posts):
        postsNum = len(posts)
        pageNum = ceil(postsNum / postPerPage)
    else:
        pageNum = 0
    return render(request, "network/index.html", {
        "feedType": "following",
        "pageNums": range(1, pageNum + 1),
        "pageTotal": pageNum,
    })

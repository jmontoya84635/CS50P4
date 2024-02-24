from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Reaction, Comment


# API

def feed(request, feed_name):
    if feed_name == "main":
        posts = Post.objects.all()
    else:
        return JsonResponse({
            "error": "Not a valid feed"
        }, status=400)
    return JsonResponse([post.serialize(request.user) for post in posts], safe=False)


def create_post(request):
    if request.method != "post":
        return JsonResponse({
            "error": "Must be post response",
        }, status=400)


def comment(request, postId, action):
    if action == "view":
        post = Post.objects.get(pk=postId)
        comments = post.Comment.all()
        return JsonResponse([str_comment.serialize() for str_comment in comments], safe=False)


    else:
        return JsonResponse({
            "error": "Invalid action."
        }, status=400)


# VIEWS
def index(request):
    return render(request, "network/index.html")


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


def profile(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    return render(request, "network/profile.html", {
        "username": request.user.username,
    })


def following(request):
    return render(request, "network/following.html")


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

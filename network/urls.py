from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),

    # API
    path("posts/<str:feed_name>", views.feed, name="get feed"),
    path("create/<str:createType>", views.create, name="create post"),
    path("like/<str:postId>/<str:action>", views.like, name="add like"),
    path("comment/<str:Id>/<str:action>", views.comment, name="add comment"),
]

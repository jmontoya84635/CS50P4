from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)

    def serialize(self):
        return {
            "username": self.username,
            "email": self.email,
        }


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')


class Post(models.Model):
    id = models.AutoField(primary_key=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Post")
    content = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self, user=None):
        liked = False
        for like in self.likes.all():
            if like.creator == user:
                liked = True
                break
            else:
                liked = False
        return {
            "id": self.id,
            "creator": self.creator.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likeCount": len(self.likes.all()),
            "liked": liked,
            "commentCount": len(self.Comment.all()),
        }


class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="Comment", null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Comment")
    text = models.CharField(max_length=250)
    # fixme: reply should be its own model because it doesnt need a post!
    comment = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name="replies")
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "text": self.text,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }


class Reaction(models.Model):
    id = models.AutoField(primary_key=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="like")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes", null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes", null=True, blank=True)

    def serialize(self):
        return {
            "id": self.id
        }

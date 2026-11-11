from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class User_Serializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["id", "email", "username", "role", "is_active", "avatar", "avatar_url"]
        read_only_fields = ["id", "email", "role", "is_active", "avatar_url"]
        extra_kwargs = {"avatar": {"write_only":True, "required": False}}
    
    def get_avatar_url(self, obj):
        request= self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None
        
class Signin_Serializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email"),
            role="USER",
        )
        user.set_password(validated_data["password"])
        user.save()
        return user
        
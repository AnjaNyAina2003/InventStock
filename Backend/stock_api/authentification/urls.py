from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import ActUser_View, Logout_View, Signin_View, User_View, EmailLogin_View, Me_View, ChangeMdp_View

urlpatterns = [
    path("refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("login", EmailLogin_View.as_view(), name="user_login"),
    path("signin", Signin_View.as_view(), name="user_signup"),
    path("logout", Logout_View.as_view(), name="user_logout"), 
    path("me", Me_View.as_view(), name="my_profil"),
    path("change-mdp", ChangeMdp_View.as_view(), name="change_mdp"),
    path("user", User_View.as_view(), name="list_user"), 
    path("user/<int:pk>", ActUser_View.as_view(), name="modifier_user")
]
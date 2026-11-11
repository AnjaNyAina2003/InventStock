from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.permissions import BasePermission
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import Signin_Serializer, User_Serializer

User = get_user_model()

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool (request.user and request.user.is_authenticated and request.user.role == "ADMIN")

class Signin_View(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return Signin_Serializer
        return User_Serializer
    
class EmailLogin_View(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email et mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Identifiants invalides"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(username=user_obj.email, password=password)
        if user is None:
            return Response(
                {"detail": "Identifiants invalides"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": User_Serializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
    
class User_View(generics.ListAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminRole]
    serializer_class = User_Serializer
    
class ActUser_View(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminRole]
    serializer_class = User_Serializer
    lookup_field = "pk"
    
class Logout_View(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"Déconnexion réussie"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"Token invalide ou déjà expiré"}, status=status.HTTP_400_BAD_REQUEST)
        
class Me_View(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = User_Serializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ChangeMdp_View(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"detail": "Ancien et nouveau mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(old_password):
            return Response(
                {"detail": "Mot de passe actuel incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save()
        return Response({"detail": "Mot de passe mis à jour"}, status=status.HTTP_200_OK)
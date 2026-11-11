from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response

from commande.models import Commande
from commande.serializers import Commmande_Serializer

class AddCommand(generics.ListCreateAPIView):
    queryset = Commande.objects.all().order_by("-id")
    serializer_class = Commmande_Serializer
    permission_classes = [permissions.IsAuthenticated]
    
class ActCommand(generics.RetrieveUpdateDestroyAPIView):
    queryset = Commande.objects.all()
    serializer_class = Commmande_Serializer
    lookup_field = "pk" 
    permission_classes = [permissions.IsAuthenticated]
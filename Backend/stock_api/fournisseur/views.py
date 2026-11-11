from rest_framework import generics, permissions, filters

from .models import Fournisseur
from .serializers import Fournisseur_Serializer

class AddFournisseur(generics.ListCreateAPIView):
    queryset = Fournisseur.objects.all().order_by('-id')
    serializer_class = Fournisseur_Serializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_fournisseur']
    
class ActFournisseur(generics.RetrieveUpdateDestroyAPIView):
    queryset = Fournisseur.objects.all()
    serializer_class = Fournisseur_Serializer
    lookup_field = "pk"
    permission_classes = [permissions.IsAuthenticated]
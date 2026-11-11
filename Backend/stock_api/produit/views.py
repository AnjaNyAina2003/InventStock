from rest_framework.views import APIView
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from authentification.views import IsAdminRole
from .models import Categorie, MvtProd, Produit, Unite, Devise
from .serializers import AllProduit_Serializer, Categorie_Serializer,  MvtProd_Serializer, NiveauReapprovisionnement_Serializer, Produit_Serializer, Unite_Serializer, Devise_Serializer

# Categorie
class ListCategorie(generics.ListAPIView):
    queryset = Categorie.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Categorie_Serializer
    
class AddCategorie(generics.ListCreateAPIView):
    queryset = Categorie.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Categorie_Serializer
    
class ActCategorie(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categorie.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Categorie_Serializer
    lookup_field = "pk"
    
# Devise
class DeviseView(generics.RetrieveUpdateAPIView):
    serializer_class = Devise_Serializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        obj, _ = Devise.objects.get_or_create(pk=1)
        return obj
    
    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT"):
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]
    
# Unite
class ListUnite(generics.ListAPIView):
    queryset = Unite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Unite_Serializer

class AddUnite(generics.ListCreateAPIView):
    queryset = Unite.objects.all().order_by('-id')
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Unite_Serializer
    
class ActUnite(generics.RetrieveUpdateDestroyAPIView):
    queryset = Unite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Unite_Serializer
    lookup_field = "pk"
    
class UniteByType(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Unite_Serializer
    
    def get_queryset(self):
        type_unite = self.kwargs['type_unite']
        return Unite.objects.filter(types=type_unite)

# Produit
class ListProduit(generics.ListAPIView):
    queryset = Produit.objects.all().order_by('-id')
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AllProduit_Serializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_produit']

class AddProduit(generics.ListCreateAPIView):
    queryset = Produit.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Produit_Serializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(AllProduit_Serializer(instance).data, status=status.HTTP_201_CREATED)
    
class ActProduit(generics.RetrieveUpdateDestroyAPIView):
    queryset = Produit.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = Produit_Serializer
    lookup_field = "pk"
    
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        instance = self.get_object()
        return Response(AllProduit_Serializer(instance).data)
    
class niveauReapprovisionnement(generics.RetrieveUpdateAPIView):
    queryset = Produit.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NiveauReapprovisionnement_Serializer
    lookup_field = "pk"
    
#Entree/Sortie
class EntreeStock(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            produit = Produit.objects.get(pk=pk)
        except Produit.DoesNotExist:
            return Response({"error": "Produit introuvable"}, status=status.HTTP_404_NOT_FOUND)

        quantite_recu = request.data.get("quantite")
        effectue_par = request.data.get("effectue_par")

        if not quantite_recu:
            return Response({"error": "la quantite est requis"}, status=status.HTTP_400_BAD_REQUEST)

        produit.quantite += int(quantite_recu)
        produit.save()
        
        MvtProd.objects.create(
            produit=produit,
            mouvement_type="ENTREE",
            quantite=quantite_recu,
            effectue_par=effectue_par
        )

        return Response(Produit_Serializer(produit).data, status=status.HTTP_200_OK)
    
class SortieStock(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            produit = Produit.objects.get(pk=pk)
        except Produit.DoesNotExist:
            return Response({"error": "Produit introuvable"}, status=status.HTTP_404_NOT_FOUND)

        quantite_delivre = request.data.get("quantite")
        effectue_par = request.data.get("effectue_par")
        beneficiaire = request.data.get("beneficiaire")

        if not quantite_delivre:
            return Response({"error": "quantite_delivre est requis"}, status=status.HTTP_400_BAD_REQUEST)

        if produit.quantite >= int(quantite_delivre):
            produit.quantite -= int(quantite_delivre)
            produit.save()
            
            MvtProd.objects.create(
                produit=produit,
                mouvement_type="SORTIE",
                quantite=quantite_delivre,
                effectue_par=effectue_par,
                beneficiaire=beneficiaire
            )
            
            return Response(Produit_Serializer(produit).data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Stock insuffisant"}, status=status.HTTP_400_BAD_REQUEST)
        
class HistoryMvt(generics.ListAPIView):
    queryset = MvtProd.objects.all().order_by('-date_create')
    serializer_class = MvtProd_Serializer
    permission_classes = [permissions.IsAuthenticated]
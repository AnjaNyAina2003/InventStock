from datetime import timedelta
from rest_framework import serializers
from .models import MvtProd, Produit, Categorie, Unite, Devise

class Categorie_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ["id", "titre"]
        
class Devise_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Devise
        fields = ["id", "devise"]

class Unite_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Unite
        fields = ["id","types", "unite", "brev"]
        
class AllProduit_Serializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.titre', read_only=True)
    unite_nom = serializers.CharField(source='prod_unite.brev', read_only=True)
    fournisseur_nom = serializers.CharField(source='fournisseur.nom_fournisseur', read_only=True)
    unite_type = serializers.CharField(source='prod_unite.types', read_only=True)
    
    class Meta:
        model = Produit
        fields = "__all__"
        
class Produit_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = ["id", "categorie", "nom_produit", "quantite", "prix_unitaire", "prod_unite", "fournisseur"]
        
class NiveauReapprovisionnement_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = ["id", "niveau_reapprovisionnement"]
        
class MvtProd_Serializer(serializers.ModelSerializer):
    produit = Produit_Serializer(read_only=True)
    
    class Meta: 
        model = MvtProd
        fields = "__all__"
        
    def get_date_create(self, obj):
        return obj.date_create - timedelta(hours=1)
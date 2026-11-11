from rest_framework import serializers
from .models import Fournisseur

class Fournisseur_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = ["id", "nom_fournisseur", "type", "adresse", "mail"]
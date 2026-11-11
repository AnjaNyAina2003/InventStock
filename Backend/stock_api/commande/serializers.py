from rest_framework import serializers

from .models import Commande, LigneCommande

class LigneCommmande_Serializer(serializers.ModelSerializer):
    sous_total = serializers.ReadOnlyField()
    produit_nom = serializers.CharField(source='produit.nom_produit', read_only=True)
    unite_nom = serializers.CharField(source='unite.unite', read_only=True)

    class Meta:
        model = LigneCommande
        fields = ["produit", "produit_nom", "quantite", "unite", "unite_nom", "prix_unitaire", "sous_total"]

class Commmande_Serializer(serializers.ModelSerializer):
    lignes = LigneCommmande_Serializer(many=True)
    fournisseur_nom = serializers.CharField(source='fournisseur.nom_fournisseur', read_only=True)
    
    class Meta:
        model = Commande
        fields = ["id", "numero_commande", "fournisseur", "fournisseur_nom", "date_commande", "statut", "montant_total", "lignes"]
        read_only_fields = ["numero_commande", "montant_total", "date_commande"]
        
    def create(self, validated_data):
        lignes_data = validated_data.pop("lignes")
        commande = Commande.objects.create(**validated_data)
        for ligne_data in lignes_data:
            LigneCommande.objects.create(commande=commande, **ligne_data)
        return commande
    
    def update(self, instance, validated_data):
        lignes_data = validated_data.pop("lignes", None)

        instance.fournisseur = validated_data.get("fournisseur", instance.fournisseur)
        instance.statut = validated_data.get("statut", instance.statut)
        instance.save()

        if lignes_data is not None:
            instance.lignes.all().delete()
            for ligne_data in lignes_data:
                LigneCommande.objects.create(commande=instance, **ligne_data)

        return instance
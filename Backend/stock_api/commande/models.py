from django.db import models

from produit.models import Produit, Unite
from fournisseur.models import Fournisseur

class Commande(models.Model):
    STATUT_CHOIX = [
        ('ATTENTE', 'En attente'),
        ('COURS', 'En cours'),
        ('LIVREE', 'Livree'),
        ('ANNULEE', 'Annulee')
    ]
    numero_commande = models.CharField(max_length=20, unique=True, blank=True) 
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.DO_NOTHING)
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=10, choices= STATUT_CHOIX, default="ATTENTE")
    montant_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def save(self, *args, **kwargs):
        if not self.numero_commande:
            last = Commande.objects.all().order_by("id").last()
            if not last:
                self.numero_commande = "CMD-001"
            else:
                last_num = int(last.numero_commande.split("-")[1])
                self.numero_commande = f"CMD-{last_num+1:03d}"
        super().save(*args, **kwargs)
        
        if self.statut == "LIVREE":
            for ligne in self.lignes.all():
                produit = ligne.produit
                produit.quantite += ligne.quantite
                produit.save(update_fields=["quantite"])

    def __str__(self):
        return self.numero_commande
    
class LigneCommande(models.Model):
    commande = models.ForeignKey(Commande, related_name="lignes", on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.DO_NOTHING)
    quantite = models.PositiveIntegerField()
    unite =models.ForeignKey(Unite, on_delete=models.DO_NOTHING)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        total = sum(ligne.sous_total for ligne in self.commande.lignes.all())
        self.commande.montant_total = total
        self.commande.save(update_fields=["montant_total"])
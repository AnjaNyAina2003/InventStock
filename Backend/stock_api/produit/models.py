from datetime import timedelta
from django.db import models

from fournisseur.models import Fournisseur

class Categorie(models.Model):
    titre = models.CharField(max_length=50, blank=True, null=True, unique= True)
    
    def __str__(self):
        return self.titre
    
class Devise(models.Model):
    DEVISE_CHOIX = [
        ('MGA', 'Ariary'),
        ('EUR', 'Euro'),
        ('USD', 'Dollar Americain'),
        ('GBP', 'Livre Sterling')
    ]
    devise = models.CharField(max_length=3, choices=DEVISE_CHOIX, default='MGA')
    
    def __str__(self):
        return self.get_devise_display()
    
    
class Unite(models.Model):
    TYPE_UNITE = [
        ('QUANTITE', 'quantite'),
        ('MASSE', 'masse'),
        ('VOLUME', 'volume'),
        ('LONGUEUR', 'longueur')
    ]
    types = models.CharField(max_length=10, choices= TYPE_UNITE, default="QUANTITE")
    unite = models.CharField(max_length=50, blank=True, null=True, unique= True)
    brev = models.CharField(max_length=50, blank=True, null=True, unique= True)
    
    def __str__(self):
        return self.brev

class Produit(models.Model):
    categorie = models.ForeignKey(Categorie, on_delete=models.DO_NOTHING, default=1)
    nom_produit = models.CharField(max_length = 50, blank = False, null = True)
    quantite = models.IntegerField(default = 0, blank = False, null = True)
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True)
    prod_unite = models.ForeignKey(Unite, on_delete=models.DO_NOTHING)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.DO_NOTHING)
    créer_par = models.CharField(max_length = 50, blank = True, null = True)
    niveau_reapprovisionnement = models.IntegerField(default = 0, blank = True, null = True)
    dernier_Maj = models.DateTimeField(auto_now_add = False, auto_now = True) 
    date_create = models.DateTimeField(auto_now_add = True) 
    
    def save(self, *args, **kwargs):
        if self.dernier_Maj:
            self.dernier_Maj = self.dernier_Maj - timedelta(hours=1)
        super(Produit, self).save(*args, **kwargs)
        
    def __str__(self):
        return self.nom_produit
        
class MvtProd(models.Model):
    MVT_CHOIX = [
        ('ENTREE', 'Entrée'),
        ('SORTIE', 'Sortie')
    ]
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    mouvement_type = models.CharField(max_length=10, choices= MVT_CHOIX, default="Entrée")
    quantite = models.IntegerField(default = 0)
    effectue_par = models.CharField(max_length=50, blank=True, null=True)
    beneficiaire = models.CharField(max_length=50, blank=True, null=True, default="aucun")
    date_create = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
      if self.date_create:
          self.date_create -=  timedelta(hours=1)
      super(MvtProd, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.mouvement_type} le {self.date_create} - {self.produit.nom_produit} ({self.quantite})'
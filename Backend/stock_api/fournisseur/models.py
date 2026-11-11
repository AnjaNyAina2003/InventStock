from django.db import models

class Fournisseur(models.Model):
    
    CHOIX_TYPE = [
        ('direct', 'Direct'),
        ('grossiste', 'Grossiste'),
        ('revendeur', 'Revendeur'),
        ('service', 'Service'),
        ('consommables', 'Consommables'),
    ]
    
    nom_fournisseur = models.CharField(max_length = 50, blank = False, null = True, unique= True)
    type = models.CharField(max_length = 50, blank = False, null = True, choices= CHOIX_TYPE, default='grossiste')
    adresse = models.CharField(max_length = 255, blank = False, null = True)
    mail = models.EmailField(max_length=255, unique=True)
    
    def __str__(self):
        return self.nom_fournisseur

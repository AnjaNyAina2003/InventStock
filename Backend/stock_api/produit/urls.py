from django.urls import path

from produit.views import ListCategorie, ActCategorie, ListUnite, ActUnite, UniteByType, AddCategorie, AddProduit, AddUnite, ActProduit, EntreeStock, HistoryMvt, ListProduit, SortieStock, niveauReapprovisionnement, DeviseView

urlpatterns = [
    path('listCat', ListCategorie.as_view(), name="Liste-Categorie"),
    path('addCat', AddCategorie.as_view(), name="Ajout-Categorie"),
    path('actCat/<int:pk>', ActCategorie.as_view(), name="Modifier-Categorie"),
    path('listUnite', ListUnite.as_view(), name="Liste-Unite"),
    path('addUnite', AddUnite.as_view(), name="Ajout-Unite"),
    path('actUnite/<int:pk>', ActUnite.as_view(), name="Modifier-Unite"),
    path('typeUnite/<str:type_unite>', UniteByType.as_view(), name="Type-Unite"),
    path('listProd', ListProduit.as_view(), name="Liste-Produit"),
    path('addProd', AddProduit.as_view(), name="Ajout-Produit"),
    path('actProd/<int:pk>', ActProduit.as_view(), name="Modifier-Produit"),
    path('nivReappro/<int:pk>', niveauReapprovisionnement.as_view(), name="Niveau-Reapprovisionnement"),
    path('entreeStock/<int:pk>', EntreeStock.as_view(), name="Entree-Stock"),
    path('sortieStock/<int:pk>', SortieStock.as_view(), name="Sortie-Stock"),
    path('historiqueMvt', HistoryMvt.as_view(), name="Liste-Mouvement-Stock"), 
    path('devise', DeviseView.as_view(), name="Devise monetaire"),
]
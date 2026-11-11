from django.urls import path

from fournisseur.views import ActFournisseur, AddFournisseur

urlpatterns = [
    path('addFns', AddFournisseur.as_view(), name="Ajout-Founisseur"),
    path('actFns/<int:pk>', ActFournisseur.as_view(), name="Modifier-Fournisseur"),
]
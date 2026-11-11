from django.urls import path

from .views import ActCommand, AddCommand

urlpatterns = [
    path('addCom', AddCommand.as_view(), name="Ajout-Commande"),
    path('actCom/<int:pk>', ActCommand.as_view(), name="Detail-Commande"),
]
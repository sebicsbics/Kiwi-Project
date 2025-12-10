from django.urls import path
from .views import (
    ContractCreateView,
    ContractListView,
    ContractDetailView,
    ContractLookupView,
    MyTransactionsView
)

urlpatterns = [
    path('', ContractListView.as_view(), name='contract-list'),
    path('create/', ContractCreateView.as_view(), name='contract-create'),
    path('lookup/', ContractLookupView.as_view(), name='contract-lookup'),
    path('my_transactions/', MyTransactionsView.as_view(), name='my-transactions'),
    path('<int:pk>/', ContractDetailView.as_view(), name='contract-detail'),
]
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Contract
from .serializers import ContractCreateSerializer, ContractDetailSerializer, ContractListSerializer, MyTransactionSerializer


class ContractCreateView(generics.CreateAPIView):
    """
    API endpoint to create a new contract
    POST /api/contracts/
    """

    queryset = Contract.objects.all()
    serializer_class = ContractCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {"contract": serializer.data, "message": "Contrato creado exitosamente"},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class ContractListView(generics.ListAPIView):
    """
    API endpoint to list user's contracts (as seller)
    GET /api/contracts/
    """

    serializer_class = ContractListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Contract.objects.filter(seller=self.request.user)


class MyTransactionsView(generics.ListAPIView):
    """
    API endpoint to list all user's transactions (as seller or buyer)
    GET /api/contracts/my_transactions/
    """

    serializer_class = MyTransactionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Contract.objects.filter(Q(seller=user) | Q(buyer=user)).order_by("-created_at")


class ContractDetailView(generics.RetrieveAPIView):
    """
    API endpoint to get contract details by ID
    GET /api/contracts/{id}/

    Auto-assigns buyer if:
    - User is authenticated
    - User is not the seller
    - Contract has no buyer yet
    """

    queryset = Contract.objects.all()
    serializer_class = ContractDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """
        Override to allow access before buyer assignment
        """
        # Get the contract by ID without filtering
        contract_id = self.kwargs.get("pk")
        try:
            contract = Contract.objects.get(pk=contract_id)
        except Contract.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Contrato no encontrado")

        # Auto-assign buyer if conditions are met
        if self.request.user.is_authenticated:
            if contract.seller != self.request.user and contract.buyer is None:
                contract.buyer = self.request.user
                contract.save()

        # Check if user has permission to view (seller or buyer)
        if contract.seller != self.request.user and contract.buyer != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("No tienes permiso para ver este contrato")

        return contract


class ContractLookupView(APIView):
    """
    API endpoint to lookup contract by access code
    GET /api/contracts/lookup/?code={access_code}

    Auto-assigns buyer if:
    - User is authenticated
    - User is not the seller
    - Contract has no buyer yet

    Note: This endpoint is public (AllowAny) to allow unauthenticated users to view contracts
    """

    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        access_code = request.query_params.get("code", "").strip().upper()

        if not access_code:
            return Response({"error": "Código de acceso requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            contract = Contract.objects.get(access_code=access_code)

            # Auto-assign buyer if conditions are met
            if request.user.is_authenticated:
                if contract.seller != request.user and contract.buyer is None:
                    contract.buyer = request.user
                    contract.save()

            serializer = ContractDetailSerializer(contract, context={"request": request})
            return Response(serializer.data)
        except Contract.DoesNotExist:
            return Response({"error": "Contrato no encontrado"}, status=status.HTTP_404_NOT_FOUND)

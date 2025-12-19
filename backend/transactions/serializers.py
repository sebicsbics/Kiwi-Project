from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Contract, ContractPhoto
from .utils import generate_qr_code_base64

User = get_user_model()


class ContractPhotoSerializer(serializers.ModelSerializer):
    """Serializer for contract photos"""
    
    class Meta:
        model = ContractPhoto
        fields = ('id', 'image', 'order', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class SellerSerializer(serializers.ModelSerializer):
    """Minimal seller information"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


class ContractListSerializer(serializers.ModelSerializer):
    """Serializer for listing contracts"""
    seller = SellerSerializer(read_only=True)
    buyer = SellerSerializer(read_only=True)
    photo_count = serializers.SerializerMethodField()
    main_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Contract
        fields = (
            'id', 'title', 'price', 'condition', 'status',
            'access_code', 'seller', 'buyer', 'photo_count', 'main_photo',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'access_code', 'status', 'created_at', 'updated_at')
    
    def get_photo_count(self, obj):
        return obj.photos.count()
    
    def get_main_photo(self, obj):
        main_photo = obj.photos.filter(order=0).first()
        if main_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_photo.image.url)
        return None


class MyTransactionSerializer(serializers.ModelSerializer):
    """Serializer for my transactions list"""
    other_party_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    main_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Contract
        fields = (
            'id', 'title', 'price', 'status', 'role',
            'other_party_name', 'main_photo', 'created_at'
        )
    
    def get_role(self, obj):
        """Determine if current user is seller or buyer"""
        request = self.context.get('request')
        if request and request.user:
            if obj.seller == request.user:
                return 'seller'
            elif obj.buyer == request.user:
                return 'buyer'
        return None
    
    def get_other_party_name(self, obj):
        """Get the name of the other party (seller or buyer)"""
        request = self.context.get('request')
        if not request or not request.user:
            return None
        
        # If current user is seller, return buyer name
        if obj.seller == request.user:
            if obj.buyer:
                if obj.buyer.first_name and obj.buyer.last_name:
                    return f"{obj.buyer.first_name} {obj.buyer.last_name}"
                return obj.buyer.username
            return "Sin comprador"
        
        # If current user is buyer, return seller name
        if obj.buyer == request.user:
            if obj.seller.first_name and obj.seller.last_name:
                return f"{obj.seller.first_name} {obj.seller.last_name}"
            return obj.seller.username
        
        return None
    
    def get_main_photo(self, obj):
        main_photo = obj.photos.filter(order=0).first()
        if main_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_photo.image.url)
        return None


class ContractDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for contract with all information"""
    seller = SellerSerializer(read_only=True)
    buyer = SellerSerializer(read_only=True)
    photos = ContractPhotoSerializer(many=True, read_only=True)
    qr_code_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Contract
        fields = (
            'id', 'title', 'description', 'price', 'condition',
            'access_code', 'qr_code_data', 'qr_code_image',
            'status', 'seller', 'buyer', 'photos',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'access_code', 'qr_code_data', 'qr_code_image',
            'status', 'created_at', 'updated_at'
        )
    
    def get_qr_code_image(self, obj):
        """Generate QR code image as base64"""
        if obj.qr_code_data:
            return generate_qr_code_base64(obj.qr_code_data)
        return None


class ContractCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contracts"""
    photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
        max_length=10
    )
    
    class Meta:
        model = Contract
        fields = (
            'title', 'description', 'price', 'condition', 'photos'
        )
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value
    
    def validate_photos(self, value):
        if len(value) > 10:
            raise serializers.ValidationError("Máximo 10 fotos permitidas")
        
        # Validate file size (max 5MB per image)
        max_size = 5 * 1024 * 1024  # 5MB
        for photo in value:
            if photo.size > max_size:
                raise serializers.ValidationError(
                    f"La foto {photo.name} excede el tamaño máximo de 5MB"
                )
        
        return value
    
    def create(self, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Generate unique access code
        validated_data['access_code'] = Contract.generate_access_code()
        
        # Create contract
        contract = Contract.objects.create(**validated_data)
        
        # Generate QR code data
        contract.qr_code_data = contract.generate_qr_data()
        
        # Publish the contract (move to AWAITING_PAYMENT status)
        contract.publish()
        contract.save()
        
        # Create photos
        for index, photo in enumerate(photos_data):
            ContractPhoto.objects.create(
                contract=contract,
                image=photo,
                order=index
            )
        
        return contract
    
    def to_representation(self, instance):
        """Return detailed representation after creation"""
        return ContractDetailSerializer(instance, context=self.context).data
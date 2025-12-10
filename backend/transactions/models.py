from django.db import models
from django.contrib.auth import get_user_model
from django_fsm import FSMField, transition
import string
import random

User = get_user_model()


class Contract(models.Model):
    """
    Contract/Transaction model for escrow platform
    """
    
    # Status choices for FSM
    STATUS_DRAFT = 'DRAFT'
    STATUS_AWAITING_PAYMENT = 'AWAITING_PAYMENT'
    STATUS_LOCKED = 'LOCKED'
    STATUS_IN_TRANSIT = 'IN_TRANSIT'
    STATUS_RELEASED = 'RELEASED'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_DISPUTED = 'DISPUTED'
    STATUS_REFUNDED = 'REFUNDED'
    
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_AWAITING_PAYMENT, 'Awaiting Payment'),
        (STATUS_LOCKED, 'Locked (In Escrow)'),
        (STATUS_IN_TRANSIT, 'In Transit'),
        (STATUS_RELEASED, 'Released'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_DISPUTED, 'Disputed'),
        (STATUS_REFUNDED, 'Refunded'),
    ]
    
    CONDITION_CHOICES = [
        ('Nuevo', 'Nuevo'),
        ('Usado - como nuevo', 'Usado - como nuevo'),
        ('Usado - buen estado', 'Usado - buen estado'),
        ('Usado - aceptable', 'Usado - aceptable'),
    ]
    
    # Basic fields
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contracts_as_seller')
    buyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contracts_as_buyer')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES)
    
    # Unique identifiers
    access_code = models.CharField(max_length=10, unique=True, db_index=True)
    qr_code_data = models.TextField(help_text='QR code data (deep link format)')
    
    # Status management
    status = FSMField(default=STATUS_DRAFT, choices=STATUS_CHOICES, protected=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contracts'
        verbose_name = 'Contract'
        verbose_name_plural = 'Contracts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.access_code}"
    
    @staticmethod
    def generate_access_code():
        """Generate a unique 6-character alphanumeric access code"""
        # Exclude ambiguous characters: 0, O, I, 1
        chars = string.ascii_uppercase.replace('O', '').replace('I', '') + string.digits.replace('0', '').replace('1', '')
        
        max_attempts = 10
        for _ in range(max_attempts):
            code = ''.join(random.choices(chars, k=6))
            if not Contract.objects.filter(access_code=code).exists():
                return code
        
        # Fallback to longer code if collision persists
        return ''.join(random.choices(chars, k=8))
    
    def generate_qr_data(self):
        """Generate QR code data in deep link format"""
        return f"kiwiapp://product/{self.id}"
    
    # FSM Transitions
    @transition(field=status, source=STATUS_DRAFT, target=STATUS_AWAITING_PAYMENT)
    def publish(self):
        """Publish the contract and generate QR code"""
        if not self.qr_code_data:
            self.qr_code_data = self.generate_qr_data()
    
    @transition(field=status, source=STATUS_AWAITING_PAYMENT, target=STATUS_LOCKED)
    def lock_funds(self):
        """Lock funds in escrow (triggered by payment webhook)"""
        pass
    
    @transition(field=status, source=STATUS_LOCKED, target=STATUS_IN_TRANSIT)
    def mark_in_transit(self):
        """Mark product as in transit"""
        pass
    
    @transition(field=status, source=[STATUS_LOCKED, STATUS_IN_TRANSIT], target=STATUS_RELEASED)
    def release_funds(self):
        """Release funds to seller (buyer confirms receipt)"""
        pass
    
    @transition(field=status, source=STATUS_RELEASED, target=STATUS_COMPLETED)
    def complete(self):
        """Mark transaction as completed (funds transferred)"""
        pass
    
    @transition(field=status, source=[STATUS_LOCKED, STATUS_IN_TRANSIT], target=STATUS_DISPUTED)
    def dispute(self):
        """Mark transaction as disputed"""
        pass
    
    @transition(field=status, source=STATUS_DISPUTED, target=STATUS_REFUNDED)
    def refund(self):
        """Refund to buyer (admin resolves dispute)"""
        pass
    
    @transition(field=status, source=STATUS_DISPUTED, target=STATUS_RELEASED)
    def resolve_dispute_to_seller(self):
        """Resolve dispute in favor of seller"""
        pass


class ContractPhoto(models.Model):
    """
    Photos associated with a contract
    """
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='contracts/%Y/%m/%d/')
    order = models.PositiveIntegerField(default=0, help_text='Display order (0 = main photo)')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'contract_photos'
        verbose_name = 'Contract Photo'
        verbose_name_plural = 'Contract Photos'
        ordering = ['order', 'uploaded_at']
    
    def __str__(self):
        return f"Photo {self.order} for {self.contract.title}"
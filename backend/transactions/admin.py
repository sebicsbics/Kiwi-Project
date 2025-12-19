from django.contrib import admin
from .models import Contract, ContractPhoto


class ContractPhotoInline(admin.TabularInline):
    model = ContractPhoto
    extra = 0
    fields = ("image", "order", "uploaded_at")
    readonly_fields = ("uploaded_at",)


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "seller", "buyer", "price", "status", "access_code", "created_at")
    list_filter = ("status", "condition", "created_at")
    search_fields = ("title", "access_code", "seller__username", "seller__email", "buyer__username", "buyer__email")
    readonly_fields = ("access_code", "qr_code_data", "created_at", "updated_at")
    inlines = [ContractPhotoInline]

    fieldsets = (
        ("Basic Information", {"fields": ("seller", "buyer", "title", "description", "price", "condition")}),
        ("Identifiers", {"fields": ("access_code", "qr_code_data")}),
        ("Status", {"fields": ("status",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ContractPhoto)
class ContractPhotoAdmin(admin.ModelAdmin):
    list_display = ("id", "contract", "order", "uploaded_at")
    list_filter = ("uploaded_at",)
    search_fields = ("contract__title",)

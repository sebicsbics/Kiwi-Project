import qrcode
from io import BytesIO
import base64


def generate_qr_code_base64(data: str) -> str:
    """
    Generate a QR code and return it as a base64 encoded string
    
    Args:
        data: The data to encode in the QR code (e.g., deep link)
    
    Returns:
        Base64 encoded PNG image string
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"
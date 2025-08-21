import secrets
import string

def generate_jwt_secret_key(length=64):
    """
    Generate a cryptographically secure random string for JWT secret key
    
    Args:
        length (int): Length of the secret key (default: 64 characters)
    
    Returns:
        str: Secure random string suitable for JWT secret key
    """
    # Use a combination of letters, digits, and special characters
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Generate cryptographically secure random string
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    return secret_key

def generate_multiple_keys():
    """Generate multiple JWT secret keys of different lengths"""
    print("JWT Secret Key Generator")
    print("=" * 50)
    
    # Generate keys of different lengths
    lengths = [32, 64, 128]
    
    for length in lengths:
        key = generate_jwt_secret_key(length)
        print(f"\n{length}-character JWT Secret Key:")
        print(f"JWT_SECRET_KEY={key}")
    
    print("\n" + "=" * 50)
    print("Choose one of the above keys and add it to your .env file")
    print("Recommended: Use the 64-character key for good security")

if __name__ == "__main__":
    # Generate and display JWT secret keys
    generate_multiple_keys()
    
    # Generate a single recommended key
    print("\n🔐 RECOMMENDED JWT SECRET KEY:")
    recommended_key = generate_jwt_secret_key(64)
    print(f"JWT_SECRET_KEY={recommended_key}")
    
    # Also generate using only URL-safe characters (alternative method)
    print("\n🔗 URL-SAFE JWT SECRET KEY (alternative):")
    url_safe_key = secrets.token_urlsafe(48)  # 48 bytes = 64 characters when base64 encoded
    print(f"JWT_SECRET_KEY={url_safe_key}")
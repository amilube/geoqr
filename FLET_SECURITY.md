# Flet Android App - Security Best Practices

This document outlines security considerations and best practices for the Flet Android application.

## Table of Contents

1. [Security by Design Principles](#security-by-design-principles)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Network Security](#network-security)
5. [Build & Release Security](#build--release-security)
6. [Code Security](#code-security)
7. [Dependency Management](#dependency-management)
8. [Incident Response](#incident-response)

## Security by Design Principles

The Flet Android app implements security by design through:

### 1. Principle of Least Privilege

- **App Permissions**: Request only necessary Android permissions
- **API Access**: Use scoped API tokens with minimal required permissions
- **User Data**: Access only data explicitly required for functionality

### 2. Defense in Depth

Multiple layers of security:
- SSL/TLS for network communication
- Secure token storage in Android KeyStore
- Input validation at multiple levels
- Content Security Policy in WebView

### 3. Fail Securely

- Default to secure configurations
- Graceful degradation when security features unavailable
- Clear error messages without exposing sensitive information

### 4. Secure Defaults

Default configuration is secure:
```python
# In config/settings.py - All secure by default
SECURE_STORAGE = True          # Use Android KeyStore
VERIFY_SSL = True              # Verify SSL certificates
DEBUG = False                  # Disable debug mode
```

## Authentication & Authorization

### Token-Based Authentication

The app uses token-based authentication with the Django backend:

```python
# Secure token storage using Android KeyStore
await auth_service.save_token(token)  # Stored securely
token = await auth_service.get_token()  # Retrieved securely
```

**Security measures:**
- Tokens stored in Android KeyStore (hardware-backed when available)
- Tokens never logged or exposed in error messages
- Automatic token refresh before expiration
- Secure token transmission over HTTPS only

### Session Management

- **Session timeout**: Configurable session expiration
- **Automatic logout**: On token expiration or invalid token
- **Secure logout**: Complete data cleanup on logout

```python
# Logout securely clears all sensitive data
await auth_service.clear_user_data()  # Removes tokens and user data
```

### Best Practices

1. **Never hardcode credentials**
   ```python
   # ❌ BAD
   API_KEY = "sk-1234567890abcdef"
   
   # ✅ GOOD
   API_KEY = os.getenv("API_KEY")
   ```

2. **Validate tokens on each request**
   - Check token expiration
   - Verify token signature
   - Handle invalid tokens gracefully

3. **Implement token refresh**
   - Refresh tokens before expiration
   - Handle refresh failures
   - Secure refresh token storage

## Data Protection

### Sensitive Data Storage

The app implements secure storage for sensitive data:

```python
# Secure storage configuration
SECURE_STORAGE = True  # Use Android KeyStore

# For development/testing only
SECURE_STORAGE = False  # Use standard SharedPreferences (NOT for production)
```

**What is stored securely:**
- Authentication tokens
- User credentials (if cached)
- API keys
- User preferences containing sensitive data

**What is NOT stored:**
- Passwords (never stored locally)
- Payment information
- Unnecessary user data

### Data Encryption

- **In Transit**: All data transmitted over HTTPS/TLS
- **At Rest**: Sensitive data encrypted in Android KeyStore
- **In Memory**: Sensitive data cleared after use

### Data Minimization

Only collect and store necessary data:

```python
# Only store essential user information
user_data = {
    "user_id": user["id"],
    "username": user["username"],
    # Don't store: password, email (unless needed), etc.
}
await auth_service.save_user_data(user_data)
```

### Best Practices

1. **Clear sensitive data on logout**
   ```python
   await auth_service.clear_user_data()
   ```

2. **Don't log sensitive information**
   ```python
   # ❌ BAD
   print(f"Token: {token}")
   
   # ✅ GOOD
   if DEBUG:
       print("Token retrieved successfully")
   ```

3. **Use secure flags for sensitive UI elements**
   ```python
   # Prevent screenshots of sensitive screens
   page.window_prevent_screenshot = True
   ```

## Network Security

### HTTPS/TLS Configuration

**Production configuration:**
```bash
# .envs/.production/.flet
FLET_API_BASE_URL=https://api.yourdomain.com  # Always HTTPS
FLET_VERIFY_SSL=true                           # Always verify
```

**Development configuration:**
```bash
# .envs/.local/.flet
FLET_API_BASE_URL=http://django:8000  # HTTP OK for local
FLET_VERIFY_SSL=false                  # Disable for local testing
```

### Certificate Pinning (Advanced)

For critical applications, implement certificate pinning:

```python
# Example: Add to services/api_client.py
PINNED_CERTIFICATES = [
    "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
]

# Verify certificate matches pinned certificates
def verify_certificate(cert):
    cert_hash = hashlib.sha256(cert).digest()
    cert_hash_b64 = base64.b64encode(cert_hash).decode()
    return f"sha256/{cert_hash_b64}" in PINNED_CERTIFICATES
```

### API Security

1. **Always use HTTPS in production**
2. **Verify SSL certificates**
3. **Implement request timeouts**
4. **Handle network errors gracefully**
5. **Don't expose API errors to users**

```python
# Secure API configuration
API_TIMEOUT = 30  # Reasonable timeout
VERIFY_SSL = True  # Always verify in production

try:
    response = await api_client.get("/endpoint", timeout=API_TIMEOUT)
except Exception as e:
    # Log error securely
    logger.error(f"API request failed: {type(e).__name__}")
    # Show generic error to user
    show_error("Unable to connect. Please try again.")
```

## Build & Release Security

### Keystore Management

**Critical: Protect your Android keystore!**

1. **Generate secure keystore:**
   ```bash
   keytool -genkey -v -keystore keystore.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias geoqr
   ```

2. **Use strong passwords:**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols
   - Store in password manager

3. **Backup keystore securely:**
   - Keep multiple encrypted backups
   - Store in different physical locations
   - Document keystore details securely

4. **Never commit keystore to git:**
   ```bash
   # In .gitignore
   *.jks
   *.keystore
   ```

### Environment Variables Security

**Never commit secrets:**

```bash
# ✅ GOOD - Example file (no secrets)
.envs/.production/.flet.example

# ❌ BAD - Actual file with secrets
.envs/.production/.flet

# Add to .gitignore
.envs/.production/.flet
```

**Use environment variables for secrets:**
```bash
# In CI/CD system, not in code
export KEY_STORE_PASSWORD="secure-password"
export KEY_PASSWORD="secure-password"
```

### Code Obfuscation

Enable ProGuard/R8 for production builds:

```python
# In build configuration (future enhancement)
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }
}
```

### Best Practices

1. **Sign all production releases**
2. **Use different keystores for development and production**
3. **Increment version codes for each release**
4. **Test signed builds before releasing**
5. **Keep build logs secure (may contain paths)**

## Code Security

### Input Validation

Validate all user inputs:

```python
def validate_url(url: str) -> bool:
    """Validate URL before loading in WebView."""
    # Check URL is from allowed domain
    parsed = urlparse(url)
    allowed_domains = ["yourdomain.com", "api.yourdomain.com"]
    return parsed.netloc in allowed_domains
```

### Secure Coding Practices

1. **Use type hints:**
   ```python
   def get_token(self) -> str | None:
       """Type hints prevent type-related vulnerabilities."""
       pass
   ```

2. **Handle exceptions properly:**
   ```python
   try:
       data = await api_call()
   except Exception as e:
       # Log securely
       logger.error(f"Error: {type(e).__name__}")
       # Don't expose details to user
       return None
   ```

3. **Avoid eval() and exec():**
   ```python
   # ❌ NEVER do this
   eval(user_input)
   
   # ✅ Use safe alternatives
   json.loads(user_input)
   ```

4. **Sanitize output:**
   ```python
   # Escape HTML in user-generated content
   from html import escape
   safe_content = escape(user_content)
   ```

### WebView Security

```python
# Secure WebView configuration
webview = ft.WebView(
    url=validated_url,
    javascript_enabled=True,  # Only if needed
    prevent_link=True,  # Prevent navigation to external sites
)
```

**WebView best practices:**
1. Validate URLs before loading
2. Disable JavaScript if not needed
3. Prevent external link navigation
4. Implement content security policy
5. Handle web resource errors

## Dependency Management

### Regular Updates

Keep dependencies updated for security patches:

```bash
# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade flet

# Update all packages (carefully!)
pip install --upgrade -r requirements.txt
```

### Vulnerability Scanning

Scan for known vulnerabilities:

```bash
# Using pip-audit
pip install pip-audit
pip-audit

# Using safety
pip install safety
safety check
```

### Dependency Pinning

Pin dependencies for reproducible builds:

```txt
# requirements.txt
flet==0.25.0  # Pinned version
httpx==0.28.1  # Pinned version
```

### Best Practices

1. **Review dependencies before adding**
2. **Use reputable packages only**
3. **Monitor for security advisories**
4. **Update regularly but test thoroughly**
5. **Document dependency purposes**

## Incident Response

### Security Incident Plan

**If security issue discovered:**

1. **Assess severity:**
   - Critical: Immediate data breach risk
   - High: Potential for exploitation
   - Medium: Limited impact
   - Low: Theoretical risk

2. **Immediate actions:**
   - Document the issue
   - Determine affected versions
   - Assess user impact

3. **Mitigation:**
   - Develop and test fix
   - Prepare security advisory
   - Plan release schedule

4. **Communication:**
   - Notify affected users
   - Publish security advisory
   - Update documentation

5. **Prevention:**
   - Post-mortem analysis
   - Update security practices
   - Additional testing/scanning

### Vulnerability Reporting

Report security vulnerabilities privately:
- Email: security@yourdomain.com
- Provide detailed description
- Include reproduction steps
- Give time for fix before public disclosure

### Security Monitoring

**Monitor for:**
- Failed authentication attempts
- Unusual API usage patterns
- Error rate spikes
- Crash reports
- User feedback about security

**Tools:**
- Google Play Console crash reports
- Backend API logs
- User feedback channels
- Security scanning tools

## Security Checklist

Before each release, verify:

- [ ] All dependencies updated and scanned
- [ ] No hardcoded secrets or credentials
- [ ] HTTPS enforced in production
- [ ] SSL verification enabled
- [ ] Secure storage enabled
- [ ] Debug mode disabled
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive info
- [ ] Keystore and passwords secured
- [ ] Environment files not committed
- [ ] Code review completed
- [ ] Security testing performed
- [ ] Documentation updated

## Additional Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Android Security Best Practices](https://developer.android.com/training/articles/security-tips)
- [Python Security](https://python.readthedocs.io/en/stable/library/security_warnings.html)
- [Flet Security Considerations](https://flet.dev/docs/)

## Questions or Concerns?

For security questions or to report vulnerabilities:
- Review this documentation
- Check with the development team
- Report vulnerabilities privately
- Never disclose vulnerabilities publicly before they're fixed

---

**Remember: Security is everyone's responsibility. When in doubt, choose the more secure option.**

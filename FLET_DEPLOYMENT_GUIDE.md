# Flet Android App - Development and Deployment Guide

This document provides a comprehensive guide for developing and deploying the Flet-based Android frontend for the GeoQR application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Development Workflow](#development-workflow)
5. [Production Build Workflow](#production-build-workflow)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## Overview

The Flet app provides a native Android wrapper around the existing GeoQR Django web application. It uses Flet's WebView component to embed the web application while providing native Android capabilities like push notifications, geolocation, and offline support.

### Key Benefits

- **Native Android Experience**: App appears as a native Android application
- **Code Reuse**: Leverages existing Django web application
- **Easy Updates**: Web application updates are immediately available
- **Cross-Platform**: Same codebase can target iOS, desktop, and web
- **Security**: Implements secure token storage and communication

## Architecture

```
┌─────────────────────────────────────┐
│     Flet Android App Container      │
│  ┌───────────────────────────────┐  │
│  │      Flet Application         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   WebView Component     │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │ Django Web App    │  │  │  │
│  │  │  │                   │  │  │  │
│  │  │  │ - HTML/CSS/JS     │  │  │  │
│  │  │  │ - HTMX            │  │  │  │
│  │  │  │ - REST API        │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                 │  │
│  │  Services:                      │  │
│  │  - Authentication               │  │
│  │  - Secure Storage              │  │
│  │  - API Client                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Django API   │
    │ (Backend)    │
    └──────────────┘
```

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control
- **Make** (optional): For using Makefile commands

### For Manual Builds (Optional)

- **Python**: 3.13 or higher
- **Android Studio**: Latest stable version
- **Android SDK**: API Level 34
- **Java**: OpenJDK 17

### For Production Releases

- **Android Keystore**: For signing release builds
- **Google Play Console**: Access for app distribution

## Development Workflow

### 1. Initial Setup

Clone the repository and set up the development environment:

```bash
# Clone repository
git clone https://github.com/amilube/geoqr.git
cd geoqr

# Verify environment file exists
ls .envs/.local/.flet
```

### 2. Start Development Environment

Start both the Django backend and Flet frontend:

```bash
# Option A: Start everything together
docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml up

# Option B: Start Django first, then Flet
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.flet.local.yml up
```

The services will be available at:
- Django Backend: http://localhost:8000
- Flet Web View: http://localhost:8550

### 3. Development Cycle

The development environment supports hot reload:

1. **Make changes** to files in `apps/flet_app/`
2. **Save the file** - Flet will automatically reload
3. **Test in browser** at http://localhost:8550
4. **Iterate** until satisfied

### 4. Testing Changes

```bash
# Run linting
docker compose -f docker-compose.flet.local.yml run --rm flet ruff check flet_app/

# Run type checking
docker compose -f docker-compose.flet.local.yml run --rm flet mypy flet_app/

# Run tests (when available)
docker compose -f docker-compose.flet.local.yml run --rm flet pytest
```

### 5. Building Development APK

Build an APK for testing on Android devices:

```bash
# Set version (optional)
export BUILD_NUMBER=1
export BUILD_VERSION=0.1.0

# Build APK
docker compose -f docker-compose.flet.local.yml --profile build run --rm flet-build

# APK will be available at: build/flet/apk/app-release.apk
```

Install on device:

```bash
adb install build/flet/apk/app-release.apk
```

### 6. Stopping Development Environment

```bash
# Stop all services
docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml down

# Stop and remove volumes
docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml down -v
```

## Production Build Workflow

### 1. Prerequisites

Before building for production:

1. **Create production environment file**:
   ```bash
   cp .envs/.production/.flet.example .envs/.production/.flet
   # Edit .envs/.production/.flet with production values
   ```

2. **Generate Android keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore keystore.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias geoqr
   
   # Store keystore password and alias securely!
   ```

3. **Set environment variables**:
   ```bash
   export BUILD_NUMBER=1
   export BUILD_VERSION=1.0.0
   export KEYSTORE_PATH=./keystore.jks
   export KEY_STORE_PASSWORD="your-keystore-password"
   export KEY_ALIAS="geoqr"
   export KEY_PASSWORD="your-key-password"
   ```

### 2. Build Production APK

For direct distribution or testing:

```bash
docker compose -f docker-compose.flet.production.yml \
  --profile build-apk \
  run --rm flet-build-apk

# APK available at: build/flet/production/app-release.apk
```

### 3. Build Production AAB (App Bundle)

For Google Play Store distribution:

```bash
docker compose -f docker-compose.flet.production.yml \
  --profile build-release \
  run --rm flet-build-release

# AAB available at: build/flet/production/app-release.aab
```

### 4. Upload to Google Play

1. **Login to Google Play Console**: https://play.google.com/console
2. **Navigate to your app** or create a new app
3. **Go to Release > Production** (or Internal/Alpha/Beta testing)
4. **Create new release**
5. **Upload the AAB file**: `build/flet/production/app-release.aab`
6. **Fill in release notes** and version information
7. **Review and rollout** the release

### 5. Version Management

Update version numbers before each release:

```bash
# In .envs/.production/.flet or as environment variables
BUILD_NUMBER=2  # Increment for each build
BUILD_VERSION=1.0.1  # Semantic versioning
```

## Security Best Practices

### 1. Environment Variables

**NEVER commit sensitive data to version control:**

```bash
# ✅ Good - Using example files
.envs/.production/.flet.example  # Committed (no secrets)
.envs/.production/.flet          # Ignored (contains secrets)

# ❌ Bad - Committing secrets
.envs/.production/.flet with passwords  # Never do this!
```

### 2. Keystore Management

**Protect your Android keystore:**

- Store keystore file in a secure location (NOT in git)
- Use strong passwords (minimum 16 characters)
- Keep backups of keystore in secure locations
- Document keystore details in secure password manager
- Never share keystore credentials in plain text

### 3. API Security

**In production configuration:**

```bash
# Always use HTTPS
FLET_API_BASE_URL=https://api.yourdomain.com  # ✅
FLET_API_BASE_URL=http://api.yourdomain.com   # ❌

# Always verify SSL
FLET_VERIFY_SSL=true  # ✅
FLET_VERIFY_SSL=false # ❌ Only for local development
```

### 4. Build Security

**For production builds:**

- Use signed releases (AAB/APK)
- Enable ProGuard/R8 code obfuscation
- Implement certificate pinning for critical APIs
- Regular security updates for dependencies
- Security scanning of code before release

### 5. Data Protection

- Enable secure storage: `FLET_SECURE_STORAGE=true`
- Encrypt sensitive data before storage
- Clear sensitive data on logout
- Implement session timeout
- Use token-based authentication

## Troubleshooting

### Common Issues

#### 1. Build Fails with "Android SDK not found"

**Solution:**
```bash
# Rebuild the Docker image to ensure SDK is installed
docker compose -f docker-compose.flet.production.yml build --no-cache
```

#### 2. App Shows Blank Screen

**Possible causes:**
- Django backend not running
- Incorrect `FLET_API_BASE_URL`
- Network connectivity issues

**Solution:**
```bash
# Check Django is running
curl http://localhost:8000

# Check Flet configuration
docker compose -f docker-compose.flet.local.yml run --rm flet \
  env | grep FLET_API_BASE_URL

# Check container networking
docker compose -f docker-compose.flet.local.yml run --rm flet \
  ping django
```

#### 3. SSL Certificate Errors

**For local development:**
```bash
# In .envs/.local/.flet
FLET_VERIFY_SSL=false
```

**For production:**
- Verify SSL certificate is valid
- Check certificate chain is complete
- Ensure intermediate certificates are installed

#### 4. APK Won't Install on Device

**Solution:**
```bash
# Uninstall previous version
adb uninstall com.geoqr.app

# Reinstall
adb install build/flet/production/app-release.apk

# Check logcat for errors
adb logcat | grep -i error
```

#### 5. Build Number Conflicts

**Error:** "Version code X has already been used"

**Solution:**
```bash
# Increment build number
export BUILD_NUMBER=$((BUILD_NUMBER + 1))

# Rebuild
docker compose -f docker-compose.flet.production.yml \
  --profile build-release run --rm flet-build-release
```

### Debug Mode

Enable detailed logging:

```bash
# In .envs/.local/.flet
FLET_DEBUG=true

# View logs
docker compose -f docker-compose.flet.local.yml logs -f flet
```

## FAQ

### Q: Can I test the Android app without building an APK?

**A:** Yes! Use the web view during development:
```bash
docker compose -f docker-compose.flet.local.yml up
# Open http://localhost:8550 in your browser
```

### Q: How do I update the app after changes to the Django backend?

**A:** The Flet app uses the Django API directly, so backend updates are automatically available. No rebuild needed unless you change the Flet app code itself.

### Q: What's the difference between APK and AAB?

**A:**
- **APK**: Direct installation file, larger size, good for testing
- **AAB**: App Bundle for Play Store, optimized per-device, required for Play Store

### Q: How often should I increment BUILD_NUMBER?

**A:** Increment for every build uploaded to Play Store, including internal testing tracks.

### Q: Can I build for iOS?

**A:** Yes! Flet supports iOS. You'll need:
- macOS with Xcode
- Apple Developer account
- Modify build scripts for iOS target

### Q: How do I implement push notifications?

**A:** The Django backend already has `django-push-notifications` configured. You'll need to:
1. Add Firebase configuration to the Flet app
2. Implement FCM token handling in `services/`
3. Register device tokens with Django API

### Q: Where should I store API keys and secrets?

**A:**
- Development: `.envs/.local/.flet`
- Production: `.envs/.production/.flet` (not committed)
- CI/CD: Environment variables in your CI system

### Q: How do I rollback a production release?

**A:**
1. Login to Google Play Console
2. Go to Release > Production
3. Select previous release
4. Promote to production
5. Update tracking carefully

### Q: What happens if the backend API changes?

**A:** 
- Minor changes: Usually no rebuild needed
- Breaking changes: Update Flet app to handle new API
- Version the API to maintain backward compatibility

## Additional Resources

- [Flet Documentation](https://flet.dev/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console](https://play.google.com/console)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues or questions:
1. Check this documentation
2. Review [apps/flet_app/README.md](../apps/flet_app/README.md)
3. Search existing GitHub issues
4. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Environment details
   - Relevant logs

## Contributing

When contributing to the Flet app:
1. Follow existing code style and structure
2. Add tests for new features
3. Update documentation
4. Test on multiple Android versions
5. Ensure security best practices
6. Get code review before merging

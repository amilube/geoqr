#!/usr/bin/env python3
"""
Validación de configuración de la flet_app para funcionalidades nativas.

Este script verifica que:
1. pyproject.toml tiene los permisos necesarios
2. settings.py tiene las configuraciones correctas
3. Los archivos de entorno están configurados
"""

import os
import sys
from pathlib import Path

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def check_mark(passed):
    return f"{GREEN}✅{RESET}" if passed else f"{RED}❌{RESET}"

def validate_permissions():
    """Validar que pyproject.toml tiene todos los permisos necesarios."""
    print("\n🔍 Validando permisos de Android en pyproject.toml...")
    
    required_permissions = [
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.INTERNET",
    ]
    
    pyproject_path = Path("pyproject.toml")
    if not pyproject_path.exists():
        print(f"{check_mark(False)} pyproject.toml no encontrado")
        return False
    
    content = pyproject_path.read_text()
    all_found = True
    
    for perm in required_permissions:
        if perm in content:
            print(f"{check_mark(True)} {perm}")
        else:
            print(f"{check_mark(False)} {perm} - FALTA")
            all_found = False
    
    return all_found

def validate_settings():
    """Validar configuración de WebView en settings.py."""
    print("\n🔍 Validando configuración de WebView en settings.py...")
    
    settings_path = Path("config/settings.py")
    if not settings_path.exists():
        print(f"{check_mark(False)} config/settings.py no encontrado")
        return False
    
    content = settings_path.read_text()
    
    checks = {
        "WEBVIEW_JAVASCRIPT_ENABLED": "JavaScript habilitado (necesario para APIs nativas)",
        "WEBVIEW_ALLOW_SERVICE_WORKERS": "Service Workers habilitados (necesario para PWA)",
    }
    
    all_found = True
    for key, description in checks.items():
        if key in content:
            print(f"{check_mark(True)} {key} - {description}")
        else:
            print(f"{check_mark(False)} {key} - FALTA - {description}")
            all_found = False
    
    return all_found

def validate_env_files():
    """Validar archivos de entorno."""
    print("\n🔍 Validando archivos de entorno...")
    
    env_files = [
        ("../.envs/.local/.flet", "Desarrollo"),
        ("../.envs/.production/.flet.example", "Producción (ejemplo)"),
    ]
    
    all_found = True
    for path, desc in env_files:
        env_path = Path(path)
        if env_path.exists():
            content = env_path.read_text()
            # Check for critical settings
            has_js = "WEBVIEW_JAVASCRIPT_ENABLED=true" in content
            has_sw = "WEBVIEW_ALLOW_SERVICE_WORKERS=true" in content
            
            if has_js and has_sw:
                print(f"{check_mark(True)} {desc}: {path}")
            else:
                print(f"{check_mark(False)} {desc}: {path} - Configuración incompleta")
                if not has_js:
                    print(f"   {YELLOW}⚠{RESET}  WEBVIEW_JAVASCRIPT_ENABLED debe ser true")
                if not has_sw:
                    print(f"   {YELLOW}⚠{RESET}  WEBVIEW_ALLOW_SERVICE_WORKERS debe ser true")
                all_found = False
        else:
            print(f"{check_mark(False)} {desc}: {path} - NO ENCONTRADO")
            all_found = False
    
    return all_found

def validate_webview():
    """Validar configuración del componente WebView."""
    print("\n🔍 Validando componente WebView...")
    
    webview_path = Path("views/webview.py")
    if not webview_path.exists():
        print(f"{check_mark(False)} views/webview.py no encontrado")
        return False
    
    content = webview_path.read_text()
    
    checks = [
        ("javascript_enabled=", "JavaScript habilitado en WebView"),
        ("WEBVIEW_JAVASCRIPT_ENABLED", "Usando configuración desde settings"),
        ("Geolocalización API", "Documentación de soporte para geolocalización"),
        ("MediaDevices API", "Documentación de soporte para cámara"),
    ]
    
    all_found = True
    for key, description in checks:
        if key in content:
            print(f"{check_mark(True)} {description}")
        else:
            print(f"{check_mark(False)} {description} - FALTA")
            all_found = False
    
    return all_found

def main():
    """Ejecutar todas las validaciones."""
    print("=" * 70)
    print("VALIDACIÓN DE CONFIGURACIÓN - FLET_APP")
    print("Funcionalidades Nativas: Cámara, Geolocalización, Notificaciones Push")
    print("=" * 70)
    
    results = []
    
    # Determinar el directorio flet_app (donde está este script)
    script_dir = Path(__file__).parent
    
    # Guardar el directorio actual y cambiar temporalmente
    original_dir = Path.cwd()
    try:
        os.chdir(script_dir)
        
        results.append(("Permisos Android", validate_permissions()))
        results.append(("Configuración WebView", validate_settings()))
        results.append(("Archivos de entorno", validate_env_files()))
        results.append(("Componente WebView", validate_webview()))
    finally:
        # Restaurar el directorio original
        os.chdir(original_dir)
    
    # Resumen
    print("\n" + "=" * 70)
    print("RESUMEN DE VALIDACIÓN")
    print("=" * 70)
    
    all_passed = True
    for name, passed in results:
        status = "PASÓ" if passed else "FALLÓ"
        color = GREEN if passed else RED
        print(f"{check_mark(passed)} {name}: {color}{status}{RESET}")
        if not passed:
            all_passed = False
    
    print("=" * 70)
    
    if all_passed:
        print(f"\n{GREEN}✅ TODAS LAS VALIDACIONES PASARON{RESET}")
        print("\nLa configuración está lista para:")
        print("  1. Funcionalidades de cámara (escaneo QR)")
        print("  2. Geolocalización")
        print("  3. Notificaciones push")
        print("\nPróximo paso: Build de APK para pruebas en dispositivo")
        return 0
    else:
        print(f"\n{RED}❌ ALGUNAS VALIDACIONES FALLARON{RESET}")
        print("Por favor revisa los errores arriba y corrige la configuración")
        return 1

if __name__ == "__main__":
    sys.exit(main())

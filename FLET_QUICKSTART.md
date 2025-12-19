# GeoQR - Flet Android App - Inicio Rápido

**Para una sola persona manejando múltiples proyectos: flujo ultra-simplificado.**

## 🚀 Inicio Rápido (3 comandos)

```bash
# 1. Iniciar desarrollo
./flet.sh dev

# 2. Construir APK para probar en dispositivo
./flet.sh build

# 3. Cuando termines
./flet.sh stop
```

¡Eso es todo! 🎉

---

## 📋 Comandos Disponibles

### Desarrollo
```bash
./flet.sh dev          # Inicia Django + Flet (puertos 8000 y 8550)
./flet.sh stop         # Detiene todo
./flet.sh logs         # Ver logs en tiempo real
```

### Construcción
```bash
./flet.sh build        # APK de desarrollo (default: v0.1.0)
./flet.sh build 0.2.0  # APK con versión específica
```

### Producción (cuando estés listo)
```bash
# Configura keystore una vez
export KEY_STORE_PASSWORD='tu-password'
export KEY_ALIAS='geoqr'
export KEY_PASSWORD='tu-password'

# Construye AAB para Google Play
./flet.sh release 1.0.0
```

---

## 🔧 Alternativa: Usando `just`

Si prefieres `just` (ya configurado en el proyecto):

```bash
just all              # Inicia Django + Flet
just flet-build       # Construye APK
just flet-release     # Construye AAB para producción
just down             # Detiene servicios
```

---

## 📁 Estructura Mínima

```
geoqr/
├── flet_app/           # Código de la app Android
├── flet.sh            # ← Script simplificado (úsalo!)
├── justfile           # ← Alternativa con just
└── .envs/
    └── .local/.flet   # Configuración (ya está lista)
```

---

## ⚙️ Configuración (solo primera vez)

### Desarrollo
Ya está configurado en `.envs/.local/.flet` ✓

### Producción (cuando sea necesario)
```bash
cp .envs/.production/.flet.example .envs/.production/.flet
# Edita y cambia la URL por tu dominio de producción
```

---

## 🔑 Generar Keystore (solo primera vez para producción)

```bash
keytool -genkey -v -keystore keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias geoqr

# Guarda las contraseñas en un lugar seguro
```

---

## 🎯 Flujo de Trabajo Típico

### Día a día (Desarrollo)
```bash
./flet.sh dev          # Iniciar
# ... hacer cambios en flet_app/ ...
# Los cambios se recargan automáticamente en http://localhost:8550
./flet.sh stop         # Cuando termines
```

### Probar en dispositivo real
```bash
./flet.sh build        # Construir APK
adb install build/flet/apk/app-release.apk
```

### Publicar en Google Play
```bash
# Configurar keystore (una vez)
export KEY_STORE_PASSWORD='...'
export KEY_ALIAS='geoqr'
export KEY_PASSWORD='...'

# Construir
./flet.sh release 1.0.0

# Subir build/flet/production/app-release.aab a Play Console
```

---

## 🆘 Problemas Comunes

**No se conecta al backend**
→ Asegúrate de que Django esté corriendo: `docker compose logs django`

**Build falla**
→ Limpia y reconstruye: `./flet.sh clean && ./flet.sh build`

**Pantalla en blanco en la app**
→ Revisa que la URL en `.envs/.local/.flet` sea correcta

---

## 📚 Documentación Completa

Solo si necesitas más detalles:

- [Guía de Despliegue](FLET_DEPLOYMENT_GUIDE.md) - Proceso completo
- [Guía de Seguridad](FLET_SECURITY.md) - Mejores prácticas
- [README de Flet](flet_app/README.md) - Detalles técnicos

---

## 💡 Tips para Gestionar Múltiples Proyectos

1. **Usa el script `flet.sh`** - Un comando para todo
2. **Deja servicios corriendo** - `./flet.sh dev` en background
3. **Versiones automáticas** - No te preocupes por BUILD_NUMBER
4. **Documentación inline** - `./flet.sh help` siempre disponible

---

**Eso es todo.** No necesitas leer más para empezar. El resto es opcional. 🚀

# 🚀 Flet - Referencia Rápida

Una sola persona, muchos proyectos. Estos son los comandos que necesitas.

## Comandos Esenciales

```bash
./flet.sh dev       # Iniciar desarrollo
./flet.sh build     # Construir APK
./flet.sh release   # Construir para producción
./flet.sh stop      # Detener todo
./flet.sh help      # Ver todos los comandos
```

## URLs

- Django: http://localhost:8000
- Flet: http://localhost:8550

## Archivos Importantes

- `flet_app/` - Código de la app
- `.envs/.local/.flet` - Config desarrollo (ya configurado)
- `.envs/.production/.flet` - Config producción (copiar de .example)

## Flujo Normal

1. `./flet.sh dev` - Desarrollar y ver cambios en tiempo real
2. `./flet.sh build` - Probar en dispositivo Android
3. `./flet.sh release 1.0.0` - Publicar cuando esté listo

## Producción (Primera Vez)

```bash
# 1. Crear keystore (solo una vez)
keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias geoqr

# 2. Configurar variables (guardar en .bashrc o similar)
export KEY_STORE_PASSWORD='tu-password'
export KEY_ALIAS='geoqr'
export KEY_PASSWORD='tu-password'

# 3. Configurar producción
cp .envs/.production/.flet.example .envs/.production/.flet
nano .envs/.production/.flet  # Cambiar URL de producción

# 4. Construir
./flet.sh release 1.0.0
```

## Problemas?

```bash
./flet.sh clean     # Limpiar builds
./flet.sh logs      # Ver logs
```

Más info: `./flet.sh help` o ver [FLET_QUICKSTART.md](FLET_QUICKSTART.md)

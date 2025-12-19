# 👋 ¡Bienvenido al Frontend Android de GeoQR!

## 🎉 Todo Está Listo

La app Flet Android ha sido implementada y está **lista para usar**.

## 🚀 Empezar en 10 Segundos

```bash
./flet.sh dev
```

Eso es todo. Abre http://localhost:8550 en tu navegador.

## 📖 ¿Primera Vez?

Lee esto en orden:

1. **[FLET_CHEATSHEET.md](FLET_CHEATSHEET.md)** ← Empieza aquí (1 página)
2. **[FLET_QUICKSTART.md](FLET_QUICKSTART.md)** ← Guía completa simplificada
3. **[FLET_README.md](FLET_README.md)** ← Resumen ejecutivo

¿Necesitas más detalles? Hay 3 guías adicionales completas.

## 🎯 Lo Más Importante

### Para Desarrollar
```bash
./flet.sh dev     # Iniciar
./flet.sh stop    # Detener
```

### Para Construir APK
```bash
./flet.sh build
```

### Para Ver Ayuda
```bash
./flet.sh help
```

## 💡 Comandos Alternativos (just)

Si prefieres `just`:
```bash
just all           # Iniciar
just flet-build    # Construir
just down          # Detener
```

## 📁 ¿Dónde Está El Código?

```
flet_app/          ← Aquí está todo el código de la app Android
  ├── main.py      ← Punto de entrada
  ├── config/      ← Configuración
  ├── services/    ← Servicios (auth, etc.)
  └── views/       ← UI (WebView)
```

## ⚙️ Configuración

Ya está configurado para desarrollo en:
```
.envs/.local/.flet
```

No necesitas cambiar nada para empezar.

## 🔐 Seguridad

Todo está configurado de forma segura por defecto:
- ✅ Variables de entorno
- ✅ Almacenamiento seguro
- ✅ Sin secretos en código
- ✅ SSL verificado en producción

## 📱 ¿Cuándo Usar Cada Comando?

| Situación | Comando |
|-----------|---------|
| Desarrollo diario | `./flet.sh dev` |
| Probar en dispositivo | `./flet.sh build` |
| Publicar en Play Store | `./flet.sh release 1.0.0` |
| Ver logs | `./flet.sh logs` |
| Limpiar builds | `./flet.sh clean` |

## 🆘 ¿Algo No Funciona?

```bash
./flet.sh clean    # Limpiar
./flet.sh dev      # Reintentar
./flet.sh logs     # Ver logs
```

Aún no funciona? Ver [FLET_QUICKSTART.md](FLET_QUICKSTART.md) sección "Problemas Comunes".

## 🎓 Arquitectura Rápida

```
┌─────────────┐
│ App Android │ ← Flet (este proyecto)
│  ┌────────┐ │
│  │WebView │ │ ← Muestra Django
│  └────────┘ │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
  ┌─────────┐
  │ Django  │ ← Backend existente
  └─────────┘
```

La app Android es un contenedor que muestra tu web app Django.

## ⏭️ Próximos Pasos

1. **Ahora**: `./flet.sh dev` y empieza a desarrollar
2. **Hoy**: Construye un APK y prueba en tu teléfono
3. **Esta semana**: Lee la documentación completa
4. **Cuando estés listo**: Publica en Google Play

## 📚 Todas Las Guías

**Rápidas** (empieza aquí):
- FLET_CHEATSHEET.md - 1 página
- FLET_QUICKSTART.md - Guía simplificada
- FLET_README.md - Resumen ejecutivo

**Completas** (cuando las necesites):
- FLET_DEPLOYMENT_GUIDE.md - Deploy completo
- FLET_SECURITY.md - Seguridad
- FLET_IMPLEMENTATION.md - Detalles técnicos

## 🎊 ¡Listo!

No necesitas leer más. Solo ejecuta:

```bash
./flet.sh dev
```

Y empieza a trabajar. Todo lo demás es opcional.

---

**¿Dudas?** → `./flet.sh help`

**¿Referencia rápida?** → FLET_CHEATSHEET.md

**¡A construir! 🚀**

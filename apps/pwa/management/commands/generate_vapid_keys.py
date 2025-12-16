"""
Management command para generar claves VAPID para Web Push Notifications.

Uso:
    python manage.py generate_vapid_keys

Las claves generadas deben agregarse al archivo .env:
    WP_PUBLIC_KEY=<clave_publica>
    WP_PRIVATE_KEY=<clave_privada>
"""

import base64

from django.core.management.base import BaseCommand
from django.core.management.base import CommandError

try:
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ec
except Exception as exc:  # pragma: no cover - only runs if cryptography missing
    ec = None
    serialization = None
    _crypto_import_error = exc
else:
    _crypto_import_error = None


class Command(BaseCommand):
    help = "Genera un par de claves VAPID para Web Push Notifications"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("\n🔑 Generando claves VAPID...\n"))

        public_key, private_key = self._generate_keys()

        self.stdout.write(
            self.style.SUCCESS("✅ Claves VAPID generadas exitosamente!\n")
        )
        self.stdout.write(
            self.style.WARNING("📋 Agrega estas líneas a tu archivo .env:\n")
        )
        self.stdout.write("-" * 80)
        self.stdout.write(f"\nWP_PUBLIC_KEY={public_key}")
        self.stdout.write(f"WP_PRIVATE_KEY={private_key}")
        self.stdout.write("WP_VAPID_SUBJECT=mailto:tu-email@example.com")
        self.stdout.write("\n" + "-" * 80)
        self.stdout.write(
            self.style.WARNING(
                "\n⚠️  IMPORTANTE: Guarda estas claves de forma segura.\n"
                "   No compartas la clave privada (WP_PRIVATE_KEY).\n"
            )
        )

    def _generate_keys(self):
        """Genera claves VAPID con py-vapid; si falla, usa cryptography."""
        # Intentar py_vapid primero (backwards compatible con docs previos)
        try:  # pragma: no cover - dependiente de librería externa
            from py_vapid import Vapid

            vapid = Vapid()
            vapid.generate_keys()
            return (
                vapid.public_key.decode("utf-8"),
                vapid.private_key.decode("utf-8"),
            )
        except Exception:
            # Fallback robusto usando cryptography (evita bug TypeError en py_vapid)
            if not ec or not serialization:
                raise CommandError(
                    "No se pudieron importar dependencias criptográficas. "
                    "Instala cryptography o django-push-notifications[WP]."
                ) from _crypto_import_error

            private_key_obj = ec.generate_private_key(ec.SECP256R1())

            # Formato base64-url sin padding según VAPID
            def b64url(data: bytes) -> str:
                return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

            # Private key 32 bytes
            private_value = private_key_obj.private_numbers().private_value
            private_bytes = private_value.to_bytes(32, "big")

            # Public key uncompressed: 0x04 || X || Y (65 bytes)
            public_numbers = private_key_obj.public_key().public_numbers()
            x = public_numbers.x.to_bytes(32, "big")
            y = public_numbers.y.to_bytes(32, "big")
            public_bytes = b"\x04" + x + y

            public_key = b64url(public_bytes)
            private_key = b64url(private_bytes)

            return public_key, private_key

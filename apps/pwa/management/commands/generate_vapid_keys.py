"""
Management command para generar claves VAPID para Web Push Notifications.

Uso:
    python manage.py generate_vapid_keys

Las claves generadas deben agregarse al archivo .env:
    WP_PUBLIC_KEY=<clave_publica>
    WP_PRIVATE_KEY=<clave_privada>
"""

from django.core.management.base import BaseCommand
from django.core.management.base import CommandError


class Command(BaseCommand):
    help = "Genera un par de claves VAPID para Web Push Notifications"

    def handle(self, *args, **options):
        try:
            from py_vapid import Vapid
        except ImportError:
            raise CommandError(
                "py-vapid no está instalado. "
                "Instálalo con: pip install django-push-notifications[WP]"
            )

        self.stdout.write(self.style.WARNING("\n🔑 Generando claves VAPID...\n"))

        vapid = Vapid()
        vapid.generate_keys()

        private_key = vapid.private_key.decode("utf-8")
        public_key = vapid.public_key.decode("utf-8")

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

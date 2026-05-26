from django.apps import AppConfig


class ServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.services'
    verbose_name = 'Услуги и заявки'


    def ready(self):
        import backend.services.signals  # ← ЭТА СТРОКА ДОЛЖНА БЫТЬ
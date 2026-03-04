from django.core.management import BaseCommand, call_command

from projects.models import Project


class Command(BaseCommand):
    help = "Seed featured projects only when the projects table is empty."

    def handle(self, *args, **options):
        if Project.objects.exists():
            self.stdout.write(self.style.WARNING("Projects already exist. Skipping seed."))
            return

        call_command("loaddata", "projects.json")
        self.stdout.write(self.style.SUCCESS("Projects seeded from fixture."))

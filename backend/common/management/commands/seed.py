"""
Master database seeder — runs every registered sub-seeder in order.

Usage:
    python manage.py seed              # all seeders (safe on every deploy)
    python manage.py seed --list       # show registered seeders
    python manage.py seed --only cms_sections
    python manage.py seed --skip volunteer_roles
"""

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from common.seed_registry import SEEDERS, SEEDER_KEYS


class Command(BaseCommand):
    help = 'Run all idempotent database seeders (pass types, volunteer roles, CMS sections, …).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--only',
            nargs='+',
            metavar='KEY',
            help=f'Run only these seeders. Keys: {", ".join(sorted(SEEDER_KEYS))}',
        )
        parser.add_argument(
            '--skip',
            nargs='+',
            metavar='KEY',
            help='Skip these seeders',
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List registered seeders and exit',
        )

    def handle(self, *args, **options):
        if options['list']:
            self._print_list()
            return

        only = set(options['only'] or [])
        skip = set(options['skip'] or [])
        unknown = (only | skip) - SEEDER_KEYS
        if unknown:
            raise CommandError(
                f'Unknown seeder key(s): {", ".join(sorted(unknown))}. '
                f'Valid keys: {", ".join(sorted(SEEDER_KEYS))}'
            )

        to_run = []
        for spec in SEEDERS:
            if only and spec.key not in only:
                continue
            if spec.key in skip:
                continue
            to_run.append(spec)

        if not to_run:
            raise CommandError('No seeders selected. Use --list to see available seeders.')

        self.stdout.write(self.style.MIGRATE_HEADING(f'Running {len(to_run)} seeder(s)…'))
        for spec in to_run:
            self.stdout.write('')
            self.stdout.write(self.style.HTTP_INFO(f'▶ {spec.key}: {spec.description}'))
            call_command(spec.command, verbosity=options.get('verbosity', 1))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('All seeders finished successfully.'))

    def _print_list(self):
        self.stdout.write(self.style.MIGRATE_HEADING('Registered seeders (run in this order):'))
        for i, spec in enumerate(SEEDERS, start=1):
            self.stdout.write(f'  {i}. {spec.key:<18} → manage.py {spec.command}')
            self.stdout.write(f'     {spec.description}')

from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from common.seed_registry import SEEDERS


class SeedCommandTest(TestCase):
    @patch('common.management.commands.seed.call_command')
    def test_seed_runs_all_registered_seeders_in_order(self, mock_call):
        call_command('seed', verbosity=0)
        self.assertEqual(mock_call.call_count, len(SEEDERS))
        called = [c.args[0] for c in mock_call.call_args_list]
        self.assertEqual(called, [s.command for s in SEEDERS])

    @patch('common.management.commands.seed.call_command')
    def test_seed_only_filters(self, mock_call):
        call_command('seed', '--only', 'cms_sections', verbosity=0)
        mock_call.assert_called_once_with('seed_cms_sections', verbosity=0)

    def test_seed_unknown_key_raises(self):
        with self.assertRaises(CommandError) as ctx:
            call_command('seed', '--only', 'not_a_real_seeder', verbosity=0)
        self.assertIn('Unknown seeder', str(ctx.exception))

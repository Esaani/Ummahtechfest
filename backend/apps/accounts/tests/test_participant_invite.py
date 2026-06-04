from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import ParticipantInvite, ParticipantInviteType
from apps.accounts.services.participant_invite import (
    ParticipantInviteError,
    accept_participant_invite,
    create_participant_invite,
)

User = get_user_model()


class ParticipantInviteServiceTest(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@ummahtechfest.com',
            password='adminpass123',
        )

    @patch('apps.accounts.services.participant_invite.send_email_task.delay')
    def test_create_and_accept_speaker_invite(self, mock_email):
        invite, user = create_participant_invite(
            'speaker@example.com',
            ParticipantInviteType.SPEAKER,
            self.admin,
        )
        self.assertEqual(invite.invite_type, ParticipantInviteType.SPEAKER)
        mock_email.assert_called_once()
        raw_token = 'test-token-value'
        invite.token_hash = make_password(raw_token)
        invite.save(update_fields=['token_hash'])
        accepted, accepted_invite = accept_participant_invite(invite.id, raw_token, 'SecurePass123!')
        self.assertEqual(accepted.email, 'speaker@example.com')
        self.assertTrue(accepted.check_password('SecurePass123!'))
        self.assertIsNotNone(accepted_invite.accepted_at)

    @patch('apps.accounts.services.participant_invite.send_email_task.delay')
    def test_duplicate_volunteer_application_blocks_invite(self, mock_email):
        from apps.volunteers.models import VolunteerApplication

        user = User.objects.create_user(email='vol@example.com', password='SecurePass123!')
        VolunteerApplication.objects.create(
            user=user,
            occupation='Student',
            skills_summary='x',
            motivation='y',
            code_of_conduct_accepted=True,
        )
        with self.assertRaises(ParticipantInviteError):
            create_participant_invite('vol@example.com', ParticipantInviteType.VOLUNTEER, self.admin)


class ParticipantInviteAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@ummahtechfest.com',
            password='adminpass123',
        )
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@ummahtechfest.com',
            'password': 'adminpass123',
            'website': '',
        }, format='json')
        self.token = login.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    @patch('apps.accounts.services.participant_invite.send_email_task.delay')
    def test_admin_can_invite_speaker(self, mock_email):
        res = self.client.post('/api/v1/auth/admin/participants/invite/', {
            'email': 'newspeaker@example.com',
            'invite_type': 'speaker',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ParticipantInvite.objects.filter(email='newspeaker@example.com').exists())
        mock_email.assert_called_once()

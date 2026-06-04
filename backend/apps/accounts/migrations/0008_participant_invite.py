# Generated manually

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_rename_password_re_user_id_6a8f2a_idx_password_re_user_id_fe9ce8_idx'),
    ]

    operations = [
        migrations.CreateModel(
            name='ParticipantInvite',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('invite_type', models.CharField(
                    choices=[('speaker', 'Speaker'), ('volunteer', 'Volunteer')],
                    db_index=True,
                    max_length=16,
                )),
                ('token_hash', models.CharField(max_length=128)),
                ('expires_at', models.DateTimeField(db_index=True)),
                ('accepted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('invited_by', models.ForeignKey(
                    blank=True,
                    db_column='invited_by_id',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='participant_invites_sent',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('user', models.ForeignKey(
                    db_column='user_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='participant_invites',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'participant_invites',
                'ordering': ['-created_at'],
            },
        ),
    ]

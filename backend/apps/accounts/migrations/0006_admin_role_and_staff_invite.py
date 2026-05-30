import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_passwordreset'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='admin_role',
            field=models.CharField(
                blank=True,
                choices=[
                    ('content_manager', 'Content manager'),
                    ('submissions_reviewer', 'Submissions reviewer'),
                    ('user_manager', 'User manager'),
                    ('operations', 'Operations (content + submissions)'),
                ],
                db_index=True,
                max_length=32,
                null=True,
            ),
        ),
        migrations.CreateModel(
            name='StaffInvite',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('admin_role', models.CharField(
                    choices=[
                        ('content_manager', 'Content manager'),
                        ('submissions_reviewer', 'Submissions reviewer'),
                        ('user_manager', 'User manager'),
                        ('operations', 'Operations (content + submissions)'),
                    ],
                    max_length=32,
                )),
                ('token_hash', models.CharField(max_length=128)),
                ('expires_at', models.DateTimeField(db_index=True)),
                ('accepted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('invited_by', models.ForeignKey(
                    blank=True,
                    db_column='invited_by_id',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='staff_invites_sent',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('user', models.ForeignKey(
                    db_column='user_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='staff_invites',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'staff_invites',
                'ordering': ['-created_at'],
            },
        ),
    ]

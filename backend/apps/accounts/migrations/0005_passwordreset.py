import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_remove_user_unique_user_email_alive_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='PasswordReset',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('token_hash', models.CharField(max_length=128)),
                ('expires_at', models.DateTimeField(db_index=True)),
                ('used_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='password_resets',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'password_resets',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='passwordreset',
            index=models.Index(fields=['user', '-created_at'], name='password_re_user_id_6a8f2a_idx'),
        ),
    ]

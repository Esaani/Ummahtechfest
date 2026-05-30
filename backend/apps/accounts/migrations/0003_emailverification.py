# Generated manually for EmailVerification model

import uuid

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_deleted_at_user_unique_user_email_alive'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailVerification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('purpose', models.CharField(choices=[('signup', 'Signup')], default='signup', max_length=32)),
                ('otp_hash', models.CharField(max_length=128)),
                ('expires_at', models.DateTimeField()),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('attempt_count', models.PositiveSmallIntegerField(default=0)),
                ('resend_count', models.PositiveSmallIntegerField(default=0)),
                ('last_sent_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'email_verifications',
            },
        ),
        migrations.AddIndex(
            model_name='emailverification',
            index=models.Index(fields=['email', 'purpose', '-created_at'], name='email_verif_email_purpose_idx'),
        ),
    ]

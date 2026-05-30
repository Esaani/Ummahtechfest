# Generated manually

import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('outreach', '0002_remove_speakerapplication_unique_speaker_application_email_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='TicketWaitlist',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('full_name', models.CharField(max_length=200)),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('tier_interest', models.CharField(
                    choices=[
                        ('general', 'General interest'),
                        ('early_bird', 'Early Bird'),
                        ('standard', 'Standard'),
                        ('vip', 'VIP'),
                    ],
                    default='general',
                    max_length=32,
                )),
                ('status', models.CharField(
                    choices=[
                        ('new', 'New'),
                        ('contacted', 'Contacted'),
                        ('converted', 'Converted'),
                        ('closed', 'Closed'),
                    ],
                    db_index=True,
                    default='new',
                    max_length=32,
                )),
            ],
            options={
                'db_table': 'ticket_waitlist',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='ticketwaitlist',
            constraint=models.UniqueConstraint(
                condition=models.Q(('deleted_at__isnull', True)),
                fields=('email',),
                name='unique_ticket_waitlist_email_alive',
            ),
        ),
    ]

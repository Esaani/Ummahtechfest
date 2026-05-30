import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0005_alter_featuredspeaker_created_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScheduleSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('slug', models.SlugField(max_length=120)),
                ('item_type', models.CharField(
                    choices=[('session', 'Session'), ('break', 'Break / intermission')],
                    default='session',
                    max_length=16,
                )),
                ('event_day', models.PositiveSmallIntegerField(db_index=True, default=1)),
                ('day_label', models.CharField(help_text='e.g. 01 or Day 1', max_length=20)),
                ('day_date_label', models.CharField(blank=True, help_text='e.g. Jan 15, 2026', max_length=64)),
                ('starts_at_time', models.CharField(default='09:00', help_text='24h HH:MM for sorting', max_length=8)),
                ('time_label', models.CharField(help_text='e.g. 09:00 AM or LIVE NOW', max_length=80)),
                ('title', models.CharField(max_length=300)),
                ('subtitle', models.CharField(blank=True, max_length=500)),
                ('track', models.CharField(
                    blank=True,
                    choices=[
                        ('main_stage', 'Main Stage'),
                        ('ai_ethics', 'AI & Ethics'),
                        ('fintech', 'Fintech'),
                        ('workshop', 'Hands-on Workshop'),
                        ('community', 'Community'),
                        ('other', 'Other'),
                    ],
                    db_index=True,
                    max_length=32,
                )),
                ('location', models.CharField(blank=True, max_length=200)),
                ('description', models.TextField(blank=True)),
                ('outcomes', models.JSONField(blank=True, default=list)),
                ('speaker_name', models.CharField(blank=True, max_length=200)),
                ('speaker_role', models.CharField(blank=True, max_length=255)),
                ('speaker_image_url', models.URLField(blank=True, max_length=500)),
                ('speaker_quote', models.TextField(blank=True)),
                ('is_live_highlight', models.BooleanField(default=False)),
                ('show_on_home', models.BooleanField(db_index=True, default=False)),
                ('is_published', models.BooleanField(db_index=True, default=True)),
                ('sort_order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'db_table': 'cms_schedule_sessions',
                'ordering': ['event_day', 'sort_order', 'starts_at_time', 'title'],
            },
        ),
        migrations.AddConstraint(
            model_name='schedulesession',
            constraint=models.UniqueConstraint(
                condition=models.Q(('deleted_at__isnull', True)),
                fields=('slug',),
                name='unique_cms_schedule_session_slug_alive',
            ),
        ),
    ]

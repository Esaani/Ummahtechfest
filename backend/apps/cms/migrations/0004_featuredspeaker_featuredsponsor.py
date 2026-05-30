# Generated for featured speakers and sponsors CMS

import uuid

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0003_mediaasset_deleted_at_sitesection_deleted_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeaturedSpeaker',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('name', models.CharField(max_length=200)),
                ('role', models.CharField(help_text='Title / organization line under the name', max_length=255)),
                ('bio', models.TextField(blank=True)),
                ('image_url', models.URLField(blank=True, max_length=500)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_published', models.BooleanField(db_index=True, default=True)),
                ('image_asset', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='featured_speakers', to='cms.mediaasset')),
            ],
            options={
                'db_table': 'cms_featured_speakers',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='FeaturedSponsor',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('name', models.CharField(max_length=200)),
                ('tier', models.CharField(choices=[('global_partner', 'Global partner'), ('sponsor', 'Sponsor')], db_index=True, default='sponsor', max_length=32)),
                ('website', models.URLField(blank=True)),
                ('logo_url', models.URLField(blank=True, max_length=500)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_published', models.BooleanField(db_index=True, default=True)),
                ('logo_asset', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='featured_sponsors', to='cms.mediaasset')),
            ],
            options={
                'db_table': 'cms_featured_sponsors',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]

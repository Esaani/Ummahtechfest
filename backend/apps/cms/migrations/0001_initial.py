import apps.cms.models
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('page', models.CharField(choices=[('home', 'Home'), ('ghana_2026', 'Ghana 2026'), ('global', 'Global (footer, announcements)')], db_index=True, max_length=32)),
                ('label', models.CharField(help_text='Admin display name', max_length=200)),
                ('content', models.JSONField(blank=True, default=dict)),
                ('is_published', models.BooleanField(db_index=True, default=True)),
                ('sort_order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'db_table': 'cms_site_sections',
                'ordering': ['page', 'sort_order', 'slug'],
                'indexes': [models.Index(fields=['page', 'is_published', 'sort_order'], name='cms_site_se_page_8a1f2c_idx')],
            },
        ),
        migrations.CreateModel(
            name='MediaAsset',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(blank=True, max_length=200)),
                ('alt_text', models.CharField(blank=True, max_length=255)),
                ('folder', models.CharField(db_index=True, default='general', max_length=64)),
                ('file', models.FileField(upload_to=apps.cms.models.cms_media_upload_path)),
                ('mime_type', models.CharField(blank=True, max_length=120)),
                ('file_size', models.PositiveIntegerField(default=0)),
                ('uploaded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cms_uploads', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'cms_media_assets',
                'ordering': ['-created_at'],
            },
        ),
    ]

# Generated manually for SponsorshipPackage and SponsorshipBenefitRow

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0006_schedule_session'),
    ]

    operations = [
        migrations.CreateModel(
            name='SponsorshipBenefitRow',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('key', models.SlugField(max_length=80)),
                ('label', models.CharField(max_length=200)),
                ('sort_order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'db_table': 'cms_sponsorship_benefit_rows',
                'ordering': ['sort_order', 'label'],
            },
        ),
        migrations.CreateModel(
            name='SponsorshipPackage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('slug', models.SlugField(max_length=80)),
                ('name', models.CharField(max_length=200)),
                ('tagline', models.CharField(blank=True, help_text='Short line on inquiry form cards', max_length=255)),
                ('price_display', models.CharField(blank=True, help_text='e.g. ₵15,000', max_length=64)),
                ('benefit_values', models.JSONField(blank=True, default=dict, help_text='Map of benefit row key → cell value for comparison table')),
                ('show_on_inquiry_form', models.BooleanField(db_index=True, default=True)),
                ('show_in_comparison_table', models.BooleanField(db_index=True, default=True)),
                ('highlight_column', models.BooleanField(default=False, help_text='Highlight this column in the comparison table (e.g. recommended tier)')),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_published', models.BooleanField(db_index=True, default=True)),
            ],
            options={
                'db_table': 'cms_sponsorship_packages',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.AddConstraint(
            model_name='sponsorshipbenefitrow',
            constraint=models.UniqueConstraint(condition=models.Q(('deleted_at__isnull', True)), fields=('key',), name='unique_sponsorship_benefit_key_alive'),
        ),
        migrations.AddConstraint(
            model_name='sponsorshippackage',
            constraint=models.UniqueConstraint(condition=models.Q(('deleted_at__isnull', True)), fields=('slug',), name='unique_sponsorship_package_slug_alive'),
        ),
    ]

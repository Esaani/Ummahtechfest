# Pass type marketing / signup display fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registrations', '0002_remove_passregistration_unique_pass_registration_per_user_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='passtype',
            name='sort_order',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='passtype',
            name='icon',
            field=models.CharField(default='badge', max_length=64),
        ),
        migrations.AddField(
            model_name='passtype',
            name='tag',
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name='passtype',
            name='features',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='passtype',
            name='cta_label',
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='passtype',
            name='display_color',
            field=models.CharField(default='primary-fixed', max_length=32),
        ),
        migrations.AddField(
            model_name='passtype',
            name='is_outline_style',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='passtype',
            name='show_on_signup',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='passtype',
            name='is_wired',
            field=models.BooleanField(default=True, help_text='When false, signup shows “coming soon” for this pass.'),
        ),
    ]

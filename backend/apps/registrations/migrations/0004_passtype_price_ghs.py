from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registrations', '0003_passtype_display_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='passtype',
            name='price_ghs',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Ticket price in GHS. Falls back to PASS_DEFAULT_PRICES_GHS in settings if empty.',
                max_digits=10,
                null=True,
            ),
        ),
    ]

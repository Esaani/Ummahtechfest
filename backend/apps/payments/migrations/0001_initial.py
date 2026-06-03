import apps.payments.models
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('registrations', '0003_passtype_display_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('reference', models.CharField(default=apps.payments.models.generate_payment_reference, max_length=64, unique=True)),
                ('provider', models.CharField(choices=[('paystack', 'Paystack')], max_length=32)),
                ('provider_reference', models.CharField(blank=True, max_length=128)),
                ('purpose', models.CharField(choices=[('pass_registration', 'Pass registration'), ('donation', 'Donation')], max_length=32)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='GHS', max_length=3)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('failed', 'Failed'), ('abandoned', 'Abandoned')], default='pending', max_length=32)),
                ('email', models.EmailField(max_length=254)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('provider_verified_at', models.DateTimeField(blank=True, null=True)),
                ('pass_registration', models.ForeignKey(blank=True, db_column='pass_registration_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='registrations.passregistration')),
                ('user', models.ForeignKey(blank=True, db_column='user_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'payments',
            },
        ),
        migrations.CreateModel(
            name='Donation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('donor_name', models.CharField(max_length=200)),
                ('donor_email', models.EmailField(max_length=254)),
                ('message', models.TextField(blank=True)),
                ('is_anonymous', models.BooleanField(default=False)),
                ('payment', models.OneToOneField(db_column='payment_id', on_delete=django.db.models.deletion.CASCADE, related_name='donation', to='payments.payment')),
            ],
            options={
                'db_table': 'donations',
            },
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['reference'], name='payments_referen_idx'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['status', 'purpose'], name='payments_status_idx'),
        ),
    ]

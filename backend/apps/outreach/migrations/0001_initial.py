import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SponsorInquiry',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('full_name', models.CharField(max_length=200)),
                ('company_name', models.CharField(max_length=255)),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('tier_interest', models.CharField(choices=[('diamond', 'Diamond Partner'), ('gold', 'Gold Partner'), ('silver', 'Silver Partner'), ('custom', 'Custom Sponsorship')], max_length=32)),
                ('requirements', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('new', 'New'), ('contacted', 'Contacted'), ('closed', 'Closed')], db_index=True, default='new', max_length=32)),
            ],
            options={
                'db_table': 'sponsor_inquiries',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='SpeakerApplication',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('full_name', models.CharField(max_length=200)),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('professional_title', models.CharField(max_length=200)),
                ('organization', models.CharField(max_length=255)),
                ('bio', models.TextField()),
                ('linkedin_url', models.URLField(blank=True)),
                ('twitter_handle', models.CharField(blank=True, max_length=120)),
                ('instagram_handle', models.CharField(blank=True, max_length=120)),
                ('session_title', models.CharField(max_length=300)),
                ('track', models.CharField(choices=[('ethical_ai', 'Ethical AI'), ('ummah_fintech', 'Ummah Fintech'), ('web3_trust', 'Web3 & Trust'), ('social_good', 'Tech for Social Good'), ('global_connectivity', 'Global Connectivity')], max_length=32)),
                ('session_format', models.CharField(choices=[('keynote', 'Keynote'), ('workshop', 'Workshop'), ('panel', 'Panel')], max_length=32)),
                ('target_audience', models.CharField(blank=True, max_length=255)),
                ('abstract', models.TextField()),
                ('key_takeaways', models.TextField()),
                ('tech_requirements', models.TextField(blank=True)),
                ('co_speakers', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('submitted', 'Submitted'), ('under_review', 'Under Review'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], db_index=True, default='submitted', max_length=32)),
            ],
            options={
                'db_table': 'speaker_applications',
                'ordering': ['-created_at'],
                'constraints': [models.UniqueConstraint(fields=('email',), name='unique_speaker_application_email')],
            },
        ),
    ]

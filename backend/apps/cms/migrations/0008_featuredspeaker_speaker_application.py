import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('outreach', '0004_speaker_profile_image'),
        ('cms', '0007_sponsorship_package'),
    ]

    operations = [
        migrations.AddField(
            model_name='featuredspeaker',
            name='speaker_application',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='featured_speaker',
                to='outreach.speakerapplication',
            ),
        ),
    ]

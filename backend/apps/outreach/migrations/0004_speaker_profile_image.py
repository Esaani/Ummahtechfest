import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0007_sponsorship_package'),
        ('outreach', '0003_ticketwaitlist'),
    ]

    operations = [
        migrations.AddField(
            model_name='speakerapplication',
            name='profile_image_asset',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='speaker_applications',
                to='cms.mediaasset',
            ),
        ),
    ]

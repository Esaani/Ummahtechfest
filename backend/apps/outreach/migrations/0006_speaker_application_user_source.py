# Generated manually

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('outreach', '0005_speakerapplication_cv_asset_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='speakerapplication',
            name='user',
            field=models.ForeignKey(
                blank=True,
                db_column='user_id',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='speaker_applications',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='speakerapplication',
            name='source',
            field=models.CharField(
                choices=[('public', 'Public application'), ('invited', 'Admin invite')],
                db_index=True,
                default='public',
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name='speakerapplication',
            name='status',
            field=models.CharField(
                choices=[
                    ('draft', 'Draft'),
                    ('submitted', 'Submitted'),
                    ('under_review', 'Under Review'),
                    ('accepted', 'Accepted'),
                    ('rejected', 'Rejected'),
                ],
                db_index=True,
                default='submitted',
                max_length=32,
            ),
        ),
        migrations.RemoveConstraint(
            model_name='speakerapplication',
            name='unique_speaker_application_email',
        ),
        migrations.AddConstraint(
            model_name='speakerapplication',
            constraint=models.UniqueConstraint(
                condition=models.Q(('deleted_at__isnull', True), ('user__isnull', True)),
                fields=('email',),
                name='unique_speaker_application_email_anon',
            ),
        ),
        migrations.AddConstraint(
            model_name='speakerapplication',
            constraint=models.UniqueConstraint(
                condition=models.Q(('deleted_at__isnull', True), ('user__isnull', False)),
                fields=('user',),
                name='unique_speaker_application_per_user',
            ),
        ),
    ]

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0001_initial'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='volunteerapplication',
            name='unique_active_volunteer_application_per_user',
        ),
        migrations.AddConstraint(
            model_name='volunteerapplication',
            constraint=models.UniqueConstraint(
                fields=('user',),
                name='unique_volunteer_application_per_user',
            ),
        ),
    ]

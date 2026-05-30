from apps.volunteers.models import VolunteerApplicationStatus

# User may withdraw only before staff begins review.
WITHDRAWABLE_STATUSES = (VolunteerApplicationStatus.SUBMITTED,)

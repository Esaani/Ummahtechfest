import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.payments.models import Payment, Donation, FinanceExpense, FinanceBill, WithdrawalRequest
from apps.payments.services import PaymentCacheService

logger = logging.getLogger('ummah_tech_fest')


@receiver([post_save, post_delete], sender=Payment)
@receiver([post_save, post_delete], sender=Donation)
@receiver([post_save, post_delete], sender=FinanceExpense)
@receiver([post_save, post_delete], sender=FinanceBill)
@receiver([post_save, post_delete], sender=WithdrawalRequest)
def invalidate_finance_cache(sender, instance, **kwargs):
    """Invalidate finance overview cache when any related financial model is modified."""
    try:
        PaymentCacheService.invalidate_finance_overview()
    except Exception as e:
        logger.error(f'Failed to invalidate finance cache: {e}')

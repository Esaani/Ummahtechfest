from django.test import TestCase
from django.utils import timezone

from apps.outreach.models import SponsorInquiry, SponsorTierInterest


class SoftDeleteTest(TestCase):
    def test_soft_delete_sets_deleted_at(self):
        inquiry = SponsorInquiry.objects.create(
            full_name='Test',
            company_name='Co',
            email='softdelete@example.com',
            tier_interest=SponsorTierInterest.SILVER,
        )
        inquiry.delete()
        inquiry = SponsorInquiry.all_objects.get(pk=inquiry.pk)
        self.assertIsNotNone(inquiry.deleted_at)

    def test_default_manager_hides_deleted(self):
        inquiry = SponsorInquiry.objects.create(
            full_name='Test',
            company_name='Co',
            email='hidden@example.com',
            tier_interest=SponsorTierInterest.SILVER,
        )
        pk = inquiry.id
        inquiry.delete()
        self.assertFalse(SponsorInquiry.objects.filter(pk=pk).exists())
        self.assertTrue(SponsorInquiry.all_objects.filter(pk=pk).exists())

    def test_restore_clears_deleted_at(self):
        inquiry = SponsorInquiry.objects.create(
            full_name='Test',
            company_name='Co',
            email='restore@example.com',
            tier_interest=SponsorTierInterest.SILVER,
        )
        inquiry.delete()
        inquiry = SponsorInquiry.all_objects.get(pk=inquiry.pk)
        inquiry.restore()
        self.assertIsNone(inquiry.deleted_at)
        self.assertTrue(SponsorInquiry.objects.filter(pk=inquiry.pk).exists())

    def test_queryset_delete_soft_deletes(self):
        SponsorInquiry.objects.create(
            full_name='A',
            company_name='Co',
            email='bulk@example.com',
            tier_interest=SponsorTierInterest.GOLD,
        )
        SponsorInquiry.objects.all().delete()
        self.assertEqual(SponsorInquiry.objects.count(), 0)
        self.assertEqual(SponsorInquiry.all_objects.count(), 1)

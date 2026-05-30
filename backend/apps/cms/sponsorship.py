"""Helpers for sponsorship packages shown on /sponsor and outreach forms."""

from apps.cms.models import SponsorshipBenefitRow, SponsorshipPackage
from apps.outreach.models import SponsorTierInterest


def published_packages(*, inquiry_form=False, comparison_table=False):
    qs = SponsorshipPackage.objects.filter(is_published=True)
    if inquiry_form:
        qs = qs.filter(show_on_inquiry_form=True)
    if comparison_table:
        qs = qs.filter(show_in_comparison_table=True)
    return qs.order_by('sort_order', 'name')


def inquiry_tier_slugs():
    slugs = list(published_packages(inquiry_form=True).values_list('slug', flat=True))
    return slugs if slugs else list(SponsorTierInterest.values)


def inquiry_tier_options():
    packages = published_packages(inquiry_form=True)
    if packages.exists():
        return [
            {'value': p.slug, 'label': p.name, 'description': p.tagline or ''}
            for p in packages
        ]
    return [{'value': v, 'label': label, 'description': ''} for v, label in SponsorTierInterest.choices]


def tier_label_for_slug(slug):
    pkg = SponsorshipPackage.objects.filter(slug=slug).first()
    if pkg:
        return pkg.name
    try:
        return SponsorTierInterest(slug).label
    except ValueError:
        return slug


def build_public_sponsorship_payload():
    all_packages = list(published_packages())
    columns = [p for p in all_packages if p.show_in_comparison_table]
    inquiry_packages = [p for p in all_packages if p.show_on_inquiry_form]
    benefit_rows = list(SponsorshipBenefitRow.objects.all().order_by('sort_order', 'label'))
    table_rows = []
    for row in benefit_rows:
        values = {}
        for col in columns:
            values[col.slug] = (col.benefit_values or {}).get(row.key, '—')
        table_rows.append({'key': row.key, 'label': row.label, 'values': values})

    inquiry_tiers = (
        [{'value': p.slug, 'label': p.name, 'description': p.tagline or ''} for p in inquiry_packages]
        if inquiry_packages
        else [{'value': v, 'label': label, 'description': ''} for v, label in SponsorTierInterest.choices]
    )

    return {
        'packages': [
            {
                'slug': p.slug,
                'name': p.name,
                'tagline': p.tagline,
                'price_display': p.price_display,
                'highlight_column': p.highlight_column,
                'show_on_inquiry_form': p.show_on_inquiry_form,
                'show_in_comparison_table': p.show_in_comparison_table,
            }
            for p in all_packages
        ],
        'comparison_columns': [
            {
                'slug': p.slug,
                'name': p.name,
                'price_display': p.price_display,
                'highlight_column': p.highlight_column,
            }
            for p in columns
        ],
        'comparison_rows': table_rows,
        'inquiry_tiers': inquiry_tiers,
    }

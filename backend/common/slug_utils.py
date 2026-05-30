from django.utils.text import slugify


def unique_slug_for_model(model, name, slug_field='slug', max_length=50):
    """Build a unique URL-safe slug from a display name."""
    base = slugify(name) or 'item'
    base = base[:max_length].strip('-') or 'item'
    slug = base
    counter = 1
    while model.objects.filter(**{slug_field: slug}).exists():
        suffix = f'-{counter}'
        slug = f'{base[: max_length - len(suffix)]}{suffix}'
        counter += 1
    return slug

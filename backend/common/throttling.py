from rest_framework.throttling import SimpleRateThrottle


class ScopedAnonRateThrottle(SimpleRateThrottle):
    """Per-view scoped limits keyed by client IP (anonymous identity)."""

    scope_attr = 'throttle_scope'

    def __init__(self):
        # Rate is resolved in allow_request once the view scope is known.
        pass

    def get_cache_key(self, request, view):
        if not self.scope:
            return None
        ident = self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}

    def allow_request(self, request, view):
        self.scope = getattr(view, self.scope_attr, None)
        if not self.scope:
            return True
        self.rate = self.get_rate()
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)


class ScopedUserRateThrottle(SimpleRateThrottle):
    """Per-view scoped limits keyed by authenticated user id."""

    scope_attr = 'throttle_scope'

    def __init__(self):
        pass

    def get_cache_key(self, request, view):
        if not self.scope:
            return None
        if not request.user or not request.user.is_authenticated:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': request.user.pk}

    def allow_request(self, request, view):
        self.scope = getattr(view, self.scope_attr, None)
        if not self.scope:
            return True
        self.rate = self.get_rate()
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)

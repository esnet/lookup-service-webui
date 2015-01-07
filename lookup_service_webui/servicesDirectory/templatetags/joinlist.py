from django import template
from django.utils import six

register = template.Library()

@register.filter
def joinlist(values, arg):
    if isinstance(values, six.string_types):
        return values
    else:
        return arg.join(values)

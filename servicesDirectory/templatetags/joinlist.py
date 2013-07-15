from django import template

register = template.Library()

@register.filter
def joinlist(values, arg):
    if isinstance(values, basestring):
        return values
    else:
        return arg.join(values)

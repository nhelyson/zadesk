with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

assert 'vertex="1" edge="1"' not in text
assert 'edge="1" vertex="1"' not in text
assert '&laquo;' not in text
assert '&raquo;' not in text
assert '' not in text
print('All integrity assertions PASSED!')


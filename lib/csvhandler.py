'''CSV Handler module.

When loading data from a CSV format we use csvloader to quickly parse the data.
After 'reading' the CSV data we need to translate the data into the correct
series data format and that is what this module does.

:copyright: 2015, Jeroen van der Heijden (Transceptor Technology)
'''

from collections import defaultdict
import csvloader


def _from_table_csv(grid):
    '''Returns series for a table CSV layout.

    Example table CSV layout:

    ,Series 001,Series 002,Series 003
    1440138931,100,,8.0
    1440140932,40,9.3,

    The above will return:
    {
        "Series 001": [ [1440138931, 100], [1440140932, 40] ],
        "Series 002": [ [1440140932, 9.3] ],
        "Series 003": [ [1440138931, 8.0] ]
    }
    '''
    _SERIES_NAMES = grid[0][1:]
    series = defaultdict(list)
    for row in grid[1:]:
        ts, *points = row
        for n, value in enumerate(points):
            if value is None:
                continue
            series[_SERIES_NAMES[n]].append([ts, value])
    return series


def _from_flat_csv(grid):
    '''Returns series for a flat CSV layout.

    Note: the order of the returned series is random and points for one series
          will be combined so each series will only appear once in the result.

    Example table CSV layout:

    Series 001,1440138931,100
    Series 003,1440138931,8.0
    Series 001,1440140932,40
    Series 002,1440140932,9.3

    The above will return:
    {
        "Series 001": [ [1440138931, 100], [1440140932, 40] ],
        "Series 002": [ [1440140932, 9.3] ],
        "Series 003": [ [1440138931, 8.0] ]
    }
    '''
    series = defaultdict(list)
    for row in grid:
        series[row[0]].append([row[1], row[2]])
    return series


def _from_query(grid):
    if not grid or not grid[0]:
        return ''

    col = int(grid[0][0] == 'query')

    return {'query': grid[0][col]}


def loads(content, is_query=False):
    '''Load CSV data from string into a dictionary representing series with
    points.'''
    grid = csvloader.loads(content.strip('\n'))

    if is_query:
        return _from_query(grid)

    if not grid or not grid[0]:
        return []

    return _from_table_csv(grid) if grid[0][0] is None \
        else _from_flat_csv(grid)


def load(fo):
    '''Load CSV data from File Object.'''
    return loads(fo.read())


def escape_csv(val):
    if isinstance(val, str):
        return '"{}"'.format(val.replace('"', '""'))
    if val is None:
        return 'NULL'
    if val is True:
        return 'TRUE'
    if val is False:
        return 'FALSE'
    return str(val)


def _dump_result(data, lines):
    # List
    if 'columns' in data and \
        len(data['columns']) and \
            isinstance(data['columns'][0], str):
        lines.append(','.join(map(escape_csv, data.pop('columns'))))
        lines.extend([
            ','.join(map(escape_csv, row))
            for row in data.popitem()[1]])
        return

    # Count
    for count in (
            'series', 'servers', 'groups', 'shards', 'pools', 'users',
            'servers_received_points', 'series_length', 'shards_size'):
        if count in data and isinstance(data[count], int):
            lines.append('"{}",{}'.format(count, data[count]))
            return

    # Show
    if 'data' in data and \
        len(data['data']) and \
            isinstance(data['data'][0], dict):
        lines.extend([
            '"{}",{}'.format(item['name'], escape_csv(item['value']))
            for item in data['data']])
        return

    # Calc
    if 'calc' in data and isinstance(data['calc'], int):
        lines.append('"timestamp",{}'.format(data['calc']))
        return

    # Success, Error msg
    for msg in ('success_msg', 'error_msg', 'help'):
        if msg in data and isinstance(data[msg], str):
            lines.append('"{}",{}'.format(msg, escape_csv(data[msg])))
            return

    # Help and Motd
    for text in ('help', 'motd'):
        if msg in data and isinstance(data[msg], str):
            lines.append(escape_csv(data[msg]))
            return

    for series, points in data.items():
        name = escape_csv(series)
        for point in points:
            lines.append('{},{},{}'.format(
                name,
                point[0],
                escape_csv(point[1])))


def dumps(data):
    '''Dump SiriDB response to CSV data.'''
    lines = []

    # Timeit
    timeit = data.pop('__timeit__', None)
    if timeit is not None:
        lines.append('"server name","query time"')
        for t in timeit:
            lines.append('"{server}",{time}'.format_map(t))
        lines.append('')

    _dump_result(data, lines)

    return '\n'.join(lines)


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


def loads(content):
    '''Load CSV data from string into a dictionary representing series with
    points.'''
    grid = csvloader.loads(content.strip('\n'))
    if not grid or not grid[0]:
        return []

    return _from_table_csv(grid) if grid[0][0] is None \
        else _from_flat_csv(grid)


def load(fo):
    '''Load CSV data from File Object.'''
    return loads(fo.read())

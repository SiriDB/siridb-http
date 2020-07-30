/*
 * This grammar is generated using the Grammar.export_js() method and
 * should be used with the `jsleri` JavaScript module.
 *
 * Source class: SiriGrammar
 * Created at: 2020-07-30 10:55:51
 */

import { Repeat, Optional, Regex, Token, Sequence, Choice, Tokens, Ref, List, THIS, Keyword, Prio, Grammar } from 'jsleri';

class SiriGrammar extends Grammar {
    static r_float = Regex('^[-+]?[0-9]*\\.?[0-9]+');
    static r_integer = Regex('^[-+]?[0-9]+');
    static r_uinteger = Regex('^[0-9]+');
    static r_time_str = Regex('^[0-9]+[smhdw]');
    static r_singleq_str = Regex('^(?:\'(?:[^\']*)\')+');
    static r_doubleq_str = Regex('^(?:"(?:[^"]*)")+');
    static r_grave_str = Regex('^(?:`(?:[^`]*)`)+');
    static r_uuid_str = Regex('^[0-9a-f]{8}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{12}');
    static r_regex = Regex('^(/[^/\\\\]*(?:\\\\.[^/\\\\]*)*/i?)');
    static r_comment = Regex('^#.*');
    static k_access = Keyword('access');
    static k_active_handles = Keyword('active_handles');
    static k_active_tasks = Keyword('active_tasks');
    static k_address = Keyword('address');
    static k_after = Keyword('after');
    static k_all = Keyword('all');
    static k_alter = Keyword('alter');
    static k_and = Keyword('and');
    static k_as = Keyword('as');
    static k_backup_mode = Keyword('backup_mode');
    static k_before = Keyword('before');
    static k_buffer_size = Keyword('buffer_size');
    static k_buffer_path = Keyword('buffer_path');
    static k_between = Keyword('between');
    static k_count = Keyword('count');
    static k_create = Keyword('create');
    static k_critical = Keyword('critical');
    static k_database = Keyword('database');
    static k_dbname = Keyword('dbname');
    static k_dbpath = Keyword('dbpath');
    static k_debug = Keyword('debug');
    static k_derivative = Keyword('derivative');
    static k_difference = Keyword('difference');
    static k_drop = Keyword('drop');
    static k_drop_threshold = Keyword('drop_threshold');
    static k_duration_log = Keyword('duration_log');
    static k_duration_num = Keyword('duration_num');
    static k_end = Keyword('end');
    static k_error = Keyword('error');
    static k_expression = Keyword('expression');
    static k_false = Keyword('false');
    static k_fifo_files = Keyword('fifo_files');
    static k_filter = Keyword('filter');
    static k_first = Keyword('first');
    static k_float = Keyword('float');
    static k_for = Keyword('for');
    static k_from = Keyword('from');
    static k_full = Keyword('full');
    static k_grant = Keyword('grant');
    static k_group = Keyword('group');
    static k_groups = Keyword('groups');
    static k_help = Choice(
        Keyword('help'),
        Token('?')
    );
    static k_idle_percentage = Keyword('idle_percentage');
    static k_idle_time = Keyword('idle_time');
    static k_inf = Keyword('inf');
    static k_info = Keyword('info');
    static k_ignore_threshold = Keyword('ignore_threshold');
    static k_insert = Keyword('insert');
    static k_integer = Keyword('integer');
    static k_intersection = Choice(
        Token('&'),
        Keyword('intersection')
    );
    static k_ip_support = Keyword('ip_support');
    static k_last = Keyword('last');
    static k_length = Keyword('length');
    static k_libuv = Keyword('libuv');
    static k_limit = Keyword('limit');
    static k_list = Keyword('list');
    static k_list_limit = Keyword('list_limit');
    static k_log = Keyword('log');
    static k_log_level = Keyword('log_level');
    static k_max = Keyword('max');
    static k_max_open_files = Keyword('max_open_files');
    static k_mean = Keyword('mean');
    static k_median = Keyword('median');
    static k_median_high = Keyword('median_high');
    static k_median_low = Keyword('median_low');
    static k_mem_usage = Keyword('mem_usage');
    static k_merge = Keyword('merge');
    static k_min = Keyword('min');
    static k_modify = Keyword('modify');
    static k_name = Keyword('name');
    static k_nan = Keyword('nan');
    static k_ninf = Sequence(
        Token('-'),
        SiriGrammar.k_inf
    );
    static k_now = Keyword('now');
    static k_number = Keyword('number');
    static k_online = Keyword('online');
    static k_open_files = Keyword('open_files');
    static k_or = Keyword('or');
    static k_password = Keyword('password');
    static k_points = Keyword('points');
    static k_pool = Keyword('pool');
    static k_pools = Keyword('pools');
    static k_port = Keyword('port');
    static k_prefix = Keyword('prefix');
    static k_pvariance = Keyword('pvariance');
    static k_read = Keyword('read');
    static k_received_points = Keyword('received_points');
    static k_reindex_progress = Keyword('reindex_progress');
    static k_revoke = Keyword('revoke');
    static k_select = Keyword('select');
    static k_select_points_limit = Keyword('select_points_limit');
    static k_selected_points = Keyword('selected_points');
    static k_series = Keyword('series');
    static k_server = Keyword('server');
    static k_servers = Keyword('servers');
    static k_set = Keyword('set');
    static k_expiration_log = Keyword('expiration_log');
    static k_expiration_num = Keyword('expiration_num');
    static k_shards = Keyword('shards');
    static k_show = Keyword('show');
    static k_sid = Keyword('sid');
    static k_size = Keyword('size');
    static k_start = Keyword('start');
    static k_startup_time = Keyword('startup_time');
    static k_status = Keyword('status');
    static k_stddev = Keyword('stddev');
    static k_string = Keyword('string');
    static k_suffix = Keyword('suffix');
    static k_sum = Keyword('sum');
    static k_symmetric_difference = Choice(
        Token('^'),
        Keyword('symmetric_difference')
    );
    static k_sync_progress = Keyword('sync_progress');
    static k_tag = Keyword('tag');
    static k_tags = Keyword('tags');
    static k_tee_pipe_name = Keyword('tee_pipe_name');
    static k_timeit = Keyword('timeit');
    static k_timezone = Keyword('timezone');
    static k_time_precision = Keyword('time_precision');
    static k_to = Keyword('to');
    static k_true = Keyword('true');
    static k_type = Keyword('type');
    static k_union = Choice(
        Tokens(', |'),
        Keyword('union')
    );
    static k_untag = Keyword('untag');
    static k_uptime = Keyword('uptime');
    static k_user = Keyword('user');
    static k_users = Keyword('users');
    static k_using = Keyword('using');
    static k_uuid = Keyword('uuid');
    static k_variance = Keyword('variance');
    static k_version = Keyword('version');
    static k_warning = Keyword('warning');
    static k_where = Keyword('where');
    static k_who_am_i = Keyword('who_am_i');
    static k_write = Keyword('write');
    static c_difference = Choice(
        Token('-'),
        SiriGrammar.k_difference
    );
    static access_keywords = Choice(
        SiriGrammar.k_read,
        SiriGrammar.k_write,
        SiriGrammar.k_modify,
        SiriGrammar.k_full,
        SiriGrammar.k_select,
        SiriGrammar.k_show,
        SiriGrammar.k_list,
        SiriGrammar.k_count,
        SiriGrammar.k_create,
        SiriGrammar.k_insert,
        SiriGrammar.k_drop,
        SiriGrammar.k_grant,
        SiriGrammar.k_revoke,
        SiriGrammar.k_alter
    );
    static _boolean = Choice(
        SiriGrammar.k_true,
        SiriGrammar.k_false
    );
    static log_keywords = Choice(
        SiriGrammar.k_debug,
        SiriGrammar.k_info,
        SiriGrammar.k_warning,
        SiriGrammar.k_error,
        SiriGrammar.k_critical
    );
    static int_expr = Prio(
        SiriGrammar.r_integer,
        Sequence(
            Token('('),
            THIS,
            Token(')')
        ),
        Sequence(
            THIS,
            Tokens('+ - * % /'),
            THIS
        )
    );
    static string = Choice(
        SiriGrammar.r_singleq_str,
        SiriGrammar.r_doubleq_str
    );
    static time_expr = Prio(
        SiriGrammar.r_time_str,
        SiriGrammar.k_now,
        SiriGrammar.string,
        SiriGrammar.r_integer,
        Sequence(
            Token('('),
            THIS,
            Token(')')
        ),
        Sequence(
            THIS,
            Tokens('+ - * % /'),
            THIS
        )
    );
    static series_columns = List(Choice(
        SiriGrammar.k_name,
        SiriGrammar.k_type,
        SiriGrammar.k_length,
        SiriGrammar.k_start,
        SiriGrammar.k_end,
        SiriGrammar.k_pool
    ), Token(','), 1, undefined, false);
    static shard_columns = List(Choice(
        SiriGrammar.k_sid,
        SiriGrammar.k_pool,
        SiriGrammar.k_server,
        SiriGrammar.k_size,
        SiriGrammar.k_start,
        SiriGrammar.k_end,
        SiriGrammar.k_type,
        SiriGrammar.k_status
    ), Token(','), 1, undefined, false);
    static server_columns = List(Choice(
        SiriGrammar.k_address,
        SiriGrammar.k_buffer_path,
        SiriGrammar.k_buffer_size,
        SiriGrammar.k_dbpath,
        SiriGrammar.k_ip_support,
        SiriGrammar.k_libuv,
        SiriGrammar.k_name,
        SiriGrammar.k_port,
        SiriGrammar.k_uuid,
        SiriGrammar.k_pool,
        SiriGrammar.k_version,
        SiriGrammar.k_online,
        SiriGrammar.k_startup_time,
        SiriGrammar.k_status,
        SiriGrammar.k_active_handles,
        SiriGrammar.k_active_tasks,
        SiriGrammar.k_fifo_files,
        SiriGrammar.k_idle_percentage,
        SiriGrammar.k_idle_time,
        SiriGrammar.k_log_level,
        SiriGrammar.k_max_open_files,
        SiriGrammar.k_mem_usage,
        SiriGrammar.k_open_files,
        SiriGrammar.k_received_points,
        SiriGrammar.k_reindex_progress,
        SiriGrammar.k_selected_points,
        SiriGrammar.k_sync_progress,
        SiriGrammar.k_tee_pipe_name,
        SiriGrammar.k_uptime
    ), Token(','), 1, undefined, false);
    static group_columns = List(Choice(
        SiriGrammar.k_expression,
        SiriGrammar.k_name,
        SiriGrammar.k_series
    ), Token(','), 1, undefined, false);
    static user_columns = List(Choice(
        SiriGrammar.k_name,
        SiriGrammar.k_access
    ), Token(','), 1, undefined, false);
    static tag_columns = List(Choice(
        SiriGrammar.k_name,
        SiriGrammar.k_series
    ), Token(','), 1, undefined, false);
    static pool_props = Choice(
        SiriGrammar.k_pool,
        SiriGrammar.k_servers,
        SiriGrammar.k_series
    );
    static pool_columns = List(SiriGrammar.pool_props, Token(','), 1, undefined, false);
    static bool_operator = Tokens('== !=');
    static int_operator = Tokens('== != <= >= < >');
    static str_operator = Tokens('== != <= >= !~ < > ~');
    static where_group = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                SiriGrammar.k_series,
                SiriGrammar.int_operator,
                SiriGrammar.int_expr
            ),
            Sequence(
                Choice(
                    SiriGrammar.k_expression,
                    SiriGrammar.k_name
                ),
                SiriGrammar.str_operator,
                SiriGrammar.string
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static where_tag = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                SiriGrammar.k_name,
                SiriGrammar.str_operator,
                SiriGrammar.string
            ),
            Sequence(
                SiriGrammar.k_series,
                SiriGrammar.int_operator,
                SiriGrammar.int_expr
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static where_pool = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                SiriGrammar.pool_props,
                SiriGrammar.int_operator,
                SiriGrammar.int_expr
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static where_series = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                Choice(
                    SiriGrammar.k_length,
                    SiriGrammar.k_pool
                ),
                SiriGrammar.int_operator,
                SiriGrammar.int_expr
            ),
            Sequence(
                SiriGrammar.k_name,
                SiriGrammar.str_operator,
                SiriGrammar.string
            ),
            Sequence(
                Choice(
                    SiriGrammar.k_start,
                    SiriGrammar.k_end
                ),
                SiriGrammar.int_operator,
                SiriGrammar.time_expr
            ),
            Sequence(
                SiriGrammar.k_type,
                SiriGrammar.bool_operator,
                Choice(
                    SiriGrammar.k_string,
                    SiriGrammar.k_integer,
                    SiriGrammar.k_float
                )
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static where_server = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                Choice(
                    SiriGrammar.k_active_handles,
                    SiriGrammar.k_active_tasks,
                    SiriGrammar.k_buffer_size,
                    SiriGrammar.k_fifo_files,
                    SiriGrammar.k_idle_percentage,
                    SiriGrammar.k_idle_time,
                    SiriGrammar.k_port,
                    SiriGrammar.k_pool,
                    SiriGrammar.k_startup_time,
                    SiriGrammar.k_max_open_files,
                    SiriGrammar.k_mem_usage,
                    SiriGrammar.k_open_files,
                    SiriGrammar.k_received_points,
                    SiriGrammar.k_selected_points,
                    SiriGrammar.k_uptime
                ),
                SiriGrammar.int_operator,
                SiriGrammar.int_expr
            ),
            Sequence(
                Choice(
                    SiriGrammar.k_address,
                    SiriGrammar.k_buffer_path,
                    SiriGrammar.k_dbpath,
                    SiriGrammar.k_ip_support,
                    SiriGrammar.k_libuv,
                    SiriGrammar.k_name,
                    SiriGrammar.k_uuid,
                    SiriGrammar.k_version,
                    SiriGrammar.k_status,
                    SiriGrammar.k_reindex_progress,
                    SiriGrammar.k_sync_progress,
                    SiriGrammar.k_tee_pipe_name
                ),
                SiriGrammar.str_operator,
                SiriGrammar.string
            ),
            Sequence(
                SiriGrammar.k_online,
                SiriGrammar.bool_operator,
                SiriGrammar._boolean
            ),
            Sequence(
                SiriGrammar.k_log_level,
                SiriGrammar.int_operator,
                SiriGrammar.log_keywords
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static where_shard = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                Choice(
                    SiriGrammar.k_sid,
                    SiriGrammar.k_pool,
                    SiriGrammar.k_size
                ),
                SiriGrammar.int_operator,
                SiriGrammar.int_expr
            ),
            Sequence(
                Choice(
                    SiriGrammar.k_server,
                    SiriGrammar.k_status
                ),
                SiriGrammar.str_operator,
                SiriGrammar.string
            ),
            Sequence(
                Choice(
                    SiriGrammar.k_start,
                    SiriGrammar.k_end
                ),
                SiriGrammar.int_operator,
                SiriGrammar.time_expr
            ),
            Sequence(
                SiriGrammar.k_type,
                SiriGrammar.bool_operator,
                Choice(
                    SiriGrammar.k_number,
                    SiriGrammar.k_log
                )
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static where_user = Sequence(
        SiriGrammar.k_where,
        Prio(
            Sequence(
                SiriGrammar.k_name,
                SiriGrammar.str_operator,
                SiriGrammar.string
            ),
            Sequence(
                SiriGrammar.k_access,
                SiriGrammar.int_operator,
                SiriGrammar.access_keywords
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                SiriGrammar.k_and,
                THIS
            ),
            Sequence(
                THIS,
                SiriGrammar.k_or,
                THIS
            )
        )
    );
    static series_setopr = Choice(
        SiriGrammar.k_union,
        SiriGrammar.c_difference,
        SiriGrammar.k_intersection,
        SiriGrammar.k_symmetric_difference
    );
    static series_parentheses = Sequence(
        Token('('),
        THIS,
        Token(')')
    );
    static series_all = Choice(
        Token('*'),
        SiriGrammar.k_all
    );
    static series_name = Repeat(SiriGrammar.string, 1, 1);
    static group_name = Repeat(SiriGrammar.r_grave_str, 1, 1);
    static tag_name = Repeat(SiriGrammar.r_grave_str, 1, 1);
    static series_re = Repeat(SiriGrammar.r_regex, 1, 1);
    static uuid = Choice(
        SiriGrammar.r_uuid_str,
        SiriGrammar.string
    );
    static group_tag_match = Repeat(SiriGrammar.r_grave_str, 1, 1);
    static series_match = Prio(
        List(Choice(
            SiriGrammar.series_all,
            SiriGrammar.series_name,
            SiriGrammar.group_tag_match,
            SiriGrammar.series_re
        ), SiriGrammar.series_setopr, 1, undefined, false),
        Choice(
            SiriGrammar.series_all,
            SiriGrammar.series_name,
            SiriGrammar.group_tag_match,
            SiriGrammar.series_re
        ),
        SiriGrammar.series_parentheses,
        Sequence(
            THIS,
            SiriGrammar.series_setopr,
            THIS
        )
    );
    static limit_expr = Sequence(
        SiriGrammar.k_limit,
        SiriGrammar.int_expr
    );
    static before_expr = Sequence(
        SiriGrammar.k_before,
        SiriGrammar.time_expr
    );
    static after_expr = Sequence(
        SiriGrammar.k_after,
        SiriGrammar.time_expr
    );
    static between_expr = Sequence(
        SiriGrammar.k_between,
        SiriGrammar.time_expr,
        SiriGrammar.k_and,
        SiriGrammar.time_expr
    );
    static access_expr = List(SiriGrammar.access_keywords, Token(','), 1, undefined, false);
    static prefix_expr = Sequence(
        SiriGrammar.k_prefix,
        SiriGrammar.string
    );
    static suffix_expr = Sequence(
        SiriGrammar.k_suffix,
        SiriGrammar.string
    );
    static f_all = Choice(
        Token('*'),
        SiriGrammar.k_all
    );
    static f_points = Repeat(SiriGrammar.k_points, 1, 1);
    static f_difference = Sequence(
        SiriGrammar.k_difference,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_derivative = Sequence(
        SiriGrammar.k_derivative,
        Token('('),
        List(SiriGrammar.time_expr, Token(','), 0, 2, false),
        Token(')')
    );
    static f_mean = Sequence(
        SiriGrammar.k_mean,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_median = Sequence(
        SiriGrammar.k_median,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_median_low = Sequence(
        SiriGrammar.k_median_low,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_median_high = Sequence(
        SiriGrammar.k_median_high,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_sum = Sequence(
        SiriGrammar.k_sum,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_min = Sequence(
        SiriGrammar.k_min,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_max = Sequence(
        SiriGrammar.k_max,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_count = Sequence(
        SiriGrammar.k_count,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_variance = Sequence(
        SiriGrammar.k_variance,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_pvariance = Sequence(
        SiriGrammar.k_pvariance,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_stddev = Sequence(
        SiriGrammar.k_stddev,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_first = Sequence(
        SiriGrammar.k_first,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_last = Sequence(
        SiriGrammar.k_last,
        Token('('),
        Optional(SiriGrammar.time_expr),
        Token(')')
    );
    static f_filter = Sequence(
        SiriGrammar.k_filter,
        Token('('),
        Optional(SiriGrammar.str_operator),
        Choice(
            SiriGrammar.string,
            SiriGrammar.r_integer,
            SiriGrammar.r_float,
            SiriGrammar.r_regex,
            SiriGrammar.k_nan,
            SiriGrammar.k_inf,
            SiriGrammar.k_ninf
        ),
        Token(')')
    );
    static f_limit = Sequence(
        SiriGrammar.k_limit,
        Token('('),
        SiriGrammar.int_expr,
        Token(','),
        Choice(
            SiriGrammar.k_mean,
            SiriGrammar.k_median,
            SiriGrammar.k_median_high,
            SiriGrammar.k_median_low,
            SiriGrammar.k_sum,
            SiriGrammar.k_min,
            SiriGrammar.k_max,
            SiriGrammar.k_count,
            SiriGrammar.k_variance,
            SiriGrammar.k_pvariance,
            SiriGrammar.k_stddev,
            SiriGrammar.k_first,
            SiriGrammar.k_last
        ),
        Token(')')
    );
    static aggregate_functions = List(Choice(
        SiriGrammar.f_all,
        SiriGrammar.f_limit,
        SiriGrammar.f_mean,
        SiriGrammar.f_sum,
        SiriGrammar.f_median,
        SiriGrammar.f_median_low,
        SiriGrammar.f_median_high,
        SiriGrammar.f_min,
        SiriGrammar.f_max,
        SiriGrammar.f_count,
        SiriGrammar.f_variance,
        SiriGrammar.f_pvariance,
        SiriGrammar.f_stddev,
        SiriGrammar.f_first,
        SiriGrammar.f_last,
        SiriGrammar.f_difference,
        SiriGrammar.f_derivative,
        SiriGrammar.f_filter,
        SiriGrammar.f_points
    ), Token('=>'), 1, undefined, false);
    static select_aggregate = Sequence(
        SiriGrammar.aggregate_functions,
        Optional(SiriGrammar.prefix_expr),
        Optional(SiriGrammar.suffix_expr)
    );
    static select_aggregates = List(SiriGrammar.select_aggregate, Token(','), 1, undefined, false);
    static merge_as = Sequence(
        SiriGrammar.k_merge,
        SiriGrammar.k_as,
        SiriGrammar.string,
        Optional(Sequence(
            SiriGrammar.k_using,
            SiriGrammar.aggregate_functions
        ))
    );
    static set_address = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_address,
        SiriGrammar.string
    );
    static set_tee_pipe_name = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_tee_pipe_name,
        Choice(
            SiriGrammar.k_false,
            SiriGrammar.string
        )
    );
    static set_backup_mode = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_backup_mode,
        SiriGrammar._boolean
    );
    static set_drop_threshold = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_drop_threshold,
        SiriGrammar.r_float
    );
    static set_expression = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_expression,
        SiriGrammar.r_regex
    );
    static set_ignore_threshold = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_ignore_threshold,
        SiriGrammar._boolean
    );
    static set_list_limit = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_list_limit,
        SiriGrammar.r_uinteger
    );
    static set_log_level = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_log_level,
        SiriGrammar.log_keywords
    );
    static set_name = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_name,
        SiriGrammar.string
    );
    static set_password = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_password,
        SiriGrammar.string
    );
    static set_port = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_port,
        SiriGrammar.r_uinteger
    );
    static set_select_points_limit = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_select_points_limit,
        SiriGrammar.r_uinteger
    );
    static set_timezone = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_timezone,
        SiriGrammar.string
    );
    static tag_series = Sequence(
        SiriGrammar.k_tag,
        SiriGrammar.tag_name
    );
    static untag_series = Sequence(
        SiriGrammar.k_untag,
        SiriGrammar.tag_name
    );
    static set_expiration_num = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_expiration_num,
        SiriGrammar.time_expr,
        Optional(SiriGrammar.set_ignore_threshold)
    );
    static set_expiration_log = Sequence(
        SiriGrammar.k_set,
        SiriGrammar.k_expiration_log,
        SiriGrammar.time_expr,
        Optional(SiriGrammar.set_ignore_threshold)
    );
    static alter_database = Sequence(
        SiriGrammar.k_database,
        Choice(
            SiriGrammar.set_drop_threshold,
            SiriGrammar.set_list_limit,
            SiriGrammar.set_select_points_limit,
            SiriGrammar.set_timezone,
            SiriGrammar.set_expiration_num,
            SiriGrammar.set_expiration_log
        )
    );
    static alter_group = Sequence(
        SiriGrammar.k_group,
        SiriGrammar.group_name,
        Choice(
            SiriGrammar.set_expression,
            SiriGrammar.set_name
        )
    );
    static alter_server = Sequence(
        SiriGrammar.k_server,
        SiriGrammar.uuid,
        Choice(
            SiriGrammar.set_log_level,
            SiriGrammar.set_backup_mode,
            SiriGrammar.set_tee_pipe_name,
            SiriGrammar.set_address,
            SiriGrammar.set_port
        )
    );
    static alter_servers = Sequence(
        SiriGrammar.k_servers,
        Optional(SiriGrammar.where_server),
        Choice(
            SiriGrammar.set_log_level,
            SiriGrammar.set_tee_pipe_name
        )
    );
    static alter_user = Sequence(
        SiriGrammar.k_user,
        SiriGrammar.string,
        Choice(
            SiriGrammar.set_password,
            SiriGrammar.set_name
        )
    );
    static alter_series = Sequence(
        SiriGrammar.k_series,
        SiriGrammar.series_match,
        Optional(SiriGrammar.where_series),
        Choice(
            SiriGrammar.tag_series,
            SiriGrammar.untag_series
        )
    );
    static count_groups = Sequence(
        SiriGrammar.k_groups,
        Optional(SiriGrammar.where_group)
    );
    static count_tags = Sequence(
        SiriGrammar.k_tags,
        Optional(SiriGrammar.where_tag)
    );
    static count_pools = Sequence(
        SiriGrammar.k_pools,
        Optional(SiriGrammar.where_pool)
    );
    static count_series = Sequence(
        SiriGrammar.k_series,
        Optional(SiriGrammar.series_match),
        Optional(SiriGrammar.where_series)
    );
    static count_servers = Sequence(
        SiriGrammar.k_servers,
        Optional(SiriGrammar.where_server)
    );
    static count_servers_received = Sequence(
        SiriGrammar.k_servers,
        SiriGrammar.k_received_points,
        Optional(SiriGrammar.where_server)
    );
    static count_servers_selected = Sequence(
        SiriGrammar.k_servers,
        SiriGrammar.k_selected_points,
        Optional(SiriGrammar.where_server)
    );
    static count_shards = Sequence(
        SiriGrammar.k_shards,
        Optional(SiriGrammar.where_shard)
    );
    static count_shards_size = Sequence(
        SiriGrammar.k_shards,
        SiriGrammar.k_size,
        Optional(SiriGrammar.where_shard)
    );
    static count_users = Sequence(
        SiriGrammar.k_users,
        Optional(SiriGrammar.where_user)
    );
    static count_series_length = Sequence(
        SiriGrammar.k_series,
        SiriGrammar.k_length,
        Optional(SiriGrammar.series_match),
        Optional(SiriGrammar.where_series)
    );
    static create_group = Sequence(
        SiriGrammar.k_group,
        SiriGrammar.group_name,
        SiriGrammar.k_for,
        SiriGrammar.r_regex
    );
    static create_user = Sequence(
        SiriGrammar.k_user,
        SiriGrammar.string,
        SiriGrammar.set_password
    );
    static drop_group = Sequence(
        SiriGrammar.k_group,
        SiriGrammar.group_name
    );
    static drop_tag = Sequence(
        SiriGrammar.k_tag,
        SiriGrammar.tag_name
    );
    static drop_series = Sequence(
        SiriGrammar.k_series,
        Optional(SiriGrammar.series_match),
        Optional(SiriGrammar.where_series),
        Optional(SiriGrammar.set_ignore_threshold)
    );
    static drop_shards = Sequence(
        SiriGrammar.k_shards,
        Optional(SiriGrammar.where_shard),
        Optional(SiriGrammar.set_ignore_threshold)
    );
    static drop_server = Sequence(
        SiriGrammar.k_server,
        SiriGrammar.uuid
    );
    static drop_user = Sequence(
        SiriGrammar.k_user,
        SiriGrammar.string
    );
    static grant_user = Sequence(
        SiriGrammar.k_user,
        SiriGrammar.string,
        Optional(SiriGrammar.set_password)
    );
    static list_groups = Sequence(
        SiriGrammar.k_groups,
        Optional(SiriGrammar.group_columns),
        Optional(SiriGrammar.where_group)
    );
    static list_tags = Sequence(
        SiriGrammar.k_tags,
        Optional(SiriGrammar.tag_columns),
        Optional(SiriGrammar.where_tag)
    );
    static list_pools = Sequence(
        SiriGrammar.k_pools,
        Optional(SiriGrammar.pool_columns),
        Optional(SiriGrammar.where_pool)
    );
    static list_series = Sequence(
        SiriGrammar.k_series,
        Optional(SiriGrammar.series_columns),
        Optional(SiriGrammar.series_match),
        Optional(SiriGrammar.where_series)
    );
    static list_servers = Sequence(
        SiriGrammar.k_servers,
        Optional(SiriGrammar.server_columns),
        Optional(SiriGrammar.where_server)
    );
    static list_shards = Sequence(
        SiriGrammar.k_shards,
        Optional(SiriGrammar.shard_columns),
        Optional(SiriGrammar.where_shard)
    );
    static list_users = Sequence(
        SiriGrammar.k_users,
        Optional(SiriGrammar.user_columns),
        Optional(SiriGrammar.where_user)
    );
    static revoke_user = Sequence(
        SiriGrammar.k_user,
        SiriGrammar.string
    );
    static alter_stmt = Sequence(
        SiriGrammar.k_alter,
        Choice(
            SiriGrammar.alter_series,
            SiriGrammar.alter_user,
            SiriGrammar.alter_group,
            SiriGrammar.alter_server,
            SiriGrammar.alter_servers,
            SiriGrammar.alter_database
        )
    );
    static calc_stmt = Repeat(SiriGrammar.time_expr, 1, 1);
    static count_stmt = Sequence(
        SiriGrammar.k_count,
        Choice(
            SiriGrammar.count_groups,
            SiriGrammar.count_pools,
            SiriGrammar.count_series,
            SiriGrammar.count_servers,
            SiriGrammar.count_servers_received,
            SiriGrammar.count_servers_selected,
            SiriGrammar.count_shards,
            SiriGrammar.count_shards_size,
            SiriGrammar.count_users,
            SiriGrammar.count_tags,
            SiriGrammar.count_series_length
        )
    );
    static create_stmt = Sequence(
        SiriGrammar.k_create,
        Choice(
            SiriGrammar.create_group,
            SiriGrammar.create_user
        )
    );
    static drop_stmt = Sequence(
        SiriGrammar.k_drop,
        Choice(
            SiriGrammar.drop_group,
            SiriGrammar.drop_tag,
            SiriGrammar.drop_series,
            SiriGrammar.drop_shards,
            SiriGrammar.drop_server,
            SiriGrammar.drop_user
        )
    );
    static grant_stmt = Sequence(
        SiriGrammar.k_grant,
        SiriGrammar.access_expr,
        SiriGrammar.k_to,
        Choice(
            SiriGrammar.grant_user
        )
    );
    static list_stmt = Sequence(
        SiriGrammar.k_list,
        Choice(
            SiriGrammar.list_series,
            SiriGrammar.list_tags,
            SiriGrammar.list_users,
            SiriGrammar.list_shards,
            SiriGrammar.list_groups,
            SiriGrammar.list_servers,
            SiriGrammar.list_pools
        ),
        Optional(SiriGrammar.limit_expr)
    );
    static revoke_stmt = Sequence(
        SiriGrammar.k_revoke,
        SiriGrammar.access_expr,
        SiriGrammar.k_from,
        Choice(
            SiriGrammar.revoke_user
        )
    );
    static select_stmt = Sequence(
        SiriGrammar.k_select,
        SiriGrammar.select_aggregates,
        SiriGrammar.k_from,
        SiriGrammar.series_match,
        Optional(SiriGrammar.where_series),
        Optional(Choice(
            SiriGrammar.after_expr,
            SiriGrammar.between_expr,
            SiriGrammar.before_expr
        )),
        Optional(SiriGrammar.merge_as)
    );
    static show_stmt = Sequence(
        SiriGrammar.k_show,
        List(Choice(
            SiriGrammar.k_active_handles,
            SiriGrammar.k_active_tasks,
            SiriGrammar.k_buffer_path,
            SiriGrammar.k_buffer_size,
            SiriGrammar.k_dbname,
            SiriGrammar.k_dbpath,
            SiriGrammar.k_drop_threshold,
            SiriGrammar.k_duration_log,
            SiriGrammar.k_duration_num,
            SiriGrammar.k_fifo_files,
            SiriGrammar.k_expiration_log,
            SiriGrammar.k_expiration_num,
            SiriGrammar.k_idle_percentage,
            SiriGrammar.k_idle_time,
            SiriGrammar.k_ip_support,
            SiriGrammar.k_libuv,
            SiriGrammar.k_list_limit,
            SiriGrammar.k_log_level,
            SiriGrammar.k_max_open_files,
            SiriGrammar.k_mem_usage,
            SiriGrammar.k_open_files,
            SiriGrammar.k_pool,
            SiriGrammar.k_received_points,
            SiriGrammar.k_reindex_progress,
            SiriGrammar.k_selected_points,
            SiriGrammar.k_select_points_limit,
            SiriGrammar.k_server,
            SiriGrammar.k_startup_time,
            SiriGrammar.k_status,
            SiriGrammar.k_sync_progress,
            SiriGrammar.k_tee_pipe_name,
            SiriGrammar.k_time_precision,
            SiriGrammar.k_timezone,
            SiriGrammar.k_uptime,
            SiriGrammar.k_uuid,
            SiriGrammar.k_version,
            SiriGrammar.k_who_am_i
        ), Token(','), 0, undefined, false)
    );
    static timeit_stmt = Repeat(SiriGrammar.k_timeit, 1, 1);
    static help_stmt = Ref(Sequence);
    static START = Sequence(
        Optional(SiriGrammar.timeit_stmt),
        Optional(Choice(
            SiriGrammar.select_stmt,
            SiriGrammar.list_stmt,
            SiriGrammar.count_stmt,
            SiriGrammar.alter_stmt,
            SiriGrammar.create_stmt,
            SiriGrammar.drop_stmt,
            SiriGrammar.grant_stmt,
            SiriGrammar.revoke_stmt,
            SiriGrammar.show_stmt,
            SiriGrammar.calc_stmt,
            SiriGrammar.help_stmt
        )),
        Optional(SiriGrammar.r_comment)
    );
    static help_access = Keyword('access');
    static help_alter_database = Keyword('database');
    static help_alter_group = Keyword('group');
    static help_alter_server = Keyword('server');
    static help_alter_servers = Keyword('servers');
    static help_alter_user = Keyword('user');
    static help_alter = Sequence(
        SiriGrammar.k_alter,
        Optional(Choice(
            SiriGrammar.help_alter_database,
            SiriGrammar.help_alter_group,
            SiriGrammar.help_alter_server,
            SiriGrammar.help_alter_servers,
            SiriGrammar.help_alter_user
        ))
    );
    static help_count_groups = Keyword('groups');
    static help_count_pools = Keyword('pools');
    static help_count_series = Keyword('series');
    static help_count_servers = Keyword('servers');
    static help_count_shards = Keyword('shards');
    static help_count_users = Keyword('users');
    static help_count = Sequence(
        SiriGrammar.k_count,
        Optional(Choice(
            SiriGrammar.help_count_groups,
            SiriGrammar.help_count_pools,
            SiriGrammar.help_count_series,
            SiriGrammar.help_count_servers,
            SiriGrammar.help_count_shards,
            SiriGrammar.help_count_users
        ))
    );
    static help_create_group = Keyword('group');
    static help_create_user = Keyword('user');
    static help_create = Sequence(
        SiriGrammar.k_create,
        Optional(Choice(
            SiriGrammar.help_create_group,
            SiriGrammar.help_create_user
        ))
    );
    static help_drop_group = Keyword('group');
    static help_drop_series = Keyword('series');
    static help_drop_server = Keyword('server');
    static help_drop_shards = Keyword('shards');
    static help_drop_user = Keyword('user');
    static help_drop = Sequence(
        SiriGrammar.k_drop,
        Optional(Choice(
            SiriGrammar.help_drop_group,
            SiriGrammar.help_drop_series,
            SiriGrammar.help_drop_server,
            SiriGrammar.help_drop_shards,
            SiriGrammar.help_drop_user
        ))
    );
    static help_functions = Keyword('functions');
    static help_grant = Keyword('grant');
    static help_list_groups = Keyword('groups');
    static help_list_pools = Keyword('pools');
    static help_list_series = Keyword('series');
    static help_list_servers = Keyword('servers');
    static help_list_shards = Keyword('shards');
    static help_list_users = Keyword('users');
    static help_list = Sequence(
        SiriGrammar.k_list,
        Optional(Choice(
            SiriGrammar.help_list_groups,
            SiriGrammar.help_list_pools,
            SiriGrammar.help_list_series,
            SiriGrammar.help_list_servers,
            SiriGrammar.help_list_shards,
            SiriGrammar.help_list_users
        ))
    );
    static help_noaccess = Keyword('noaccess');
    static help_revoke = Keyword('revoke');
    static help_select = Keyword('select');
    static help_show = Keyword('show');
    static help_timeit = Keyword('timeit');
    static help_timezones = Keyword('timezones');

    constructor() {
        super(SiriGrammar.START, '[a-z_]+');
    }
}

SiriGrammar.help_stmt.set(Sequence(
    SiriGrammar.k_help,
    Optional(Choice(
        SiriGrammar.help_access,
        SiriGrammar.help_alter,
        SiriGrammar.help_count,
        SiriGrammar.help_create,
        SiriGrammar.help_drop,
        SiriGrammar.help_functions,
        SiriGrammar.help_grant,
        SiriGrammar.help_list,
        SiriGrammar.help_noaccess,
        SiriGrammar.help_revoke,
        SiriGrammar.help_select,
        SiriGrammar.help_show,
        SiriGrammar.help_timeit,
        SiriGrammar.help_timezones
    ))
));

export default SiriGrammar;

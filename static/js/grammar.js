/* jshint newcap: false */

/*
 * This grammar is generated using the Grammar.export_js() method and
 * should be used with the jsleri JavaScript module.
 *
 * Source class: SiriGrammar
 * Created at: 2016-02-18 09:40:56
 */

'use strict';

(function (
            Optional,
            Rule,
            Tokens,
            Grammar,
            List,
            Token,
            Repeat,
            Sequence,
            THIS,
            Prio,
            Regex,
            Choice,
            Keyword
        ) {
    var r_float = Regex('^[-+]?[0-9]*\\.?[0-9]+');
    var r_integer = Regex('^[0-9]+');
    var r_time_str = Regex('^[0-9]+[smhdw]');
    var r_singleq_str = Regex('^(?:\'(?:[^\']*)\')+');
    var r_doubleq_str = Regex('^(?:"(?:[^"]*)")+');
    var r_grave_str = Regex('^(?:`(?:[^`]*)`)+');
    var r_uuid_str = Regex('^[0-9a-f]{8}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{12}');
    var r_regex = Regex('^(/[^/\\\\]*(?:\\\\.[^/\\\\]*)*/i?)');
    var r_comment = Regex('^#.*');
    var k_access = Keyword('access');
    var k_address = Keyword('address');
    var k_after = Keyword('after');
    var k_aiohttp_server = Keyword('aiohttp_server');
    var k_alter = Keyword('alter');
    var k_and = Keyword('and');
    var k_as = Keyword('as');
    var k_before = Keyword('before');
    var k_buffer_size = Keyword('buffer_size');
    var k_buffer_path = Keyword('buffer_path');
    var k_between = Keyword('between');
    var k_cached = Keyword('cached');
    var k_comment = Keyword('comment');
    var k_contains = Keyword('contains');
    var k_continue = Keyword('continue');
    var k_count = Keyword('count');
    var k_create = Keyword('create');
    var k_database = Keyword('database');
    var k_dbname = Keyword('dbname');
    var k_dbpath = Keyword('dbpath');
    var k_debug = Keyword('debug');
    var k_derivative = Keyword('derivative');
    var k_difference = Keyword('difference');
    var k_drop = Keyword('drop');
    var k_drop_threshold = Keyword('drop_threshold');
    var k_duration_log = Keyword('duration_log');
    var k_duration_num = Keyword('duration_num');
    var k_end = Keyword('end');
    var k_expression = Keyword('expression');
    var k_false = Keyword('false');
    var k_filter = Keyword('filter');
    var k_first = Keyword('first');
    var k_for = Keyword('for');
    var k_from = Keyword('from');
    var k_full = Keyword('full');
    var k_grant = Keyword('grant');
    var k_group = Keyword('group');
    var k_groups = Keyword('groups');
    var k_help = Choice(
        Keyword('help'),
        Token('?')
    );
    var k_ignore_threshold = Keyword('ignore_threshold');
    var k_indexed = Keyword('indexed');
    var k_insert = Keyword('insert');
    var k_intersection = Choice(
        Token('&'),
        Keyword('intersection')
    );
    var k_length = Keyword('length');
    var k_last = Keyword('last');
    var k_license = Keyword('license');
    var k_limit = Keyword('limit');
    var k_list = Keyword('list');
    var k_loglevel = Keyword('loglevel');
    var k_manhole = Keyword('manhole');
    var k_max = Keyword('max');
    var k_max_cache_expressions = Keyword('max_cache_expressions');
    var k_max_open_files = Keyword('max_open_files');
    var k_mean = Keyword('mean');
    var k_median = Keyword('median');
    var k_median_low = Keyword('median_low');
    var k_median_high = Keyword('median_high');
    var k_mem_usage = Keyword('mem_usage');
    var k_merge = Keyword('merge');
    var k_min = Keyword('min');
    var k_modify = Keyword('modify');
    var k_name = Keyword('name');
    var k_network = Keyword('network');
    var k_networks = Keyword('networks');
    var k_now = Keyword('now');
    var k_null = Keyword('null');
    var k_online = Keyword('online');
    var k_open_files = Keyword('open_files');
    var k_optimize_pool = Keyword('optimize_pool');
    var k_optimize_task = Keyword('optimize_task');
    var k_or = Keyword('or');
    var k_password = Keyword('password');
    var k_pause = Keyword('pause');
    var k_points = Choice(
        Token('*'),
        Keyword('points')
    );
    var k_pool = Keyword('pool');
    var k_pools = Keyword('pools');
    var k_port = Keyword('port');
    var k_prefix = Keyword('prefix');
    var k_pvariance = Keyword('pvariance');
    var k_python = Keyword('python');
    var k_query_timeout = Keyword('query_timeout');
    var k_read = Keyword('read');
    var k_received_points = Keyword('received_points');
    var k_reindex_progress = Keyword('reindex_progress');
    var k_reject = Keyword('reject');
    var k_revoke = Keyword('revoke');
    var k_select = Keyword('select');
    var k_series = Keyword('series');
    var k_server = Keyword('server');
    var k_servers = Keyword('servers');
    var k_set = Keyword('set');
    var k_shard = Keyword('shard');
    var k_sharding_buffering = Keyword('sharding_buffering');
    var k_sharding_max_chunk_points = Keyword('sharding_max_chunk_points');
    var k_shards = Keyword('shards');
    var k_show = Keyword('show');
    var k_sid = Keyword('sid');
    var k_size = Keyword('size');
    var k_start = Keyword('start');
    var k_startup_time = Keyword('startup_time');
    var k_status = Keyword('status');
    var k_suffix = Keyword('suffix');
    var k_sum = Keyword('sum');
    var k_symmetric_difference = Choice(
        Token('^'),
        Keyword('symmetric_difference')
    );
    var k_sync_progress = Keyword('sync_progress');
    var k_task_queue = Keyword('task_queue');
    var k_timeit = Keyword('timeit');
    var k_timezone = Keyword('timezone');
    var k_time_precision = Keyword('time_precision');
    var k_to = Keyword('to');
    var k_true = Keyword('true');
    var k_type = Keyword('type');
    var k_union = Choice(
        Tokens(', |'),
        Keyword('union')
    );
    var k_uptime = Keyword('uptime');
    var k_user = Keyword('user');
    var k_users = Keyword('users');
    var k_using = Keyword('using');
    var k_uuid = Keyword('uuid');
    var k_variance = Keyword('variance');
    var k_version = Keyword('version');
    var k_where = Keyword('where');
    var k_who_am_i = Keyword('who_am_i');
    var k_write = Keyword('write');
    var c_difference = Choice(
        Token('-'),
        k_difference
    );
    var access_keywords = Choice(
        k_read,
        k_write,
        k_modify,
        k_full,
        k_select,
        k_show,
        k_list,
        k_count,
        k_create,
        k_insert,
        k_drop,
        k_grant,
        k_revoke,
        k_alter,
        k_pause,
        k_continue
    );
    var int_expr = Prio(
        r_integer,
        Sequence(
            Token('('),
            THIS,
            Token(')')
        ),
        Sequence(
            THIS,
            Tokens('// ** + - * %'),
            THIS
        )
    );
    var string = Choice(
        r_singleq_str,
        r_doubleq_str
    );
    var time_expr = Prio(
        r_time_str,
        k_now,
        string,
        r_integer,
        Sequence(
            Token('('),
            THIS,
            Token(')')
        ),
        Sequence(
            THIS,
            Tokens('// ** + - * %'),
            THIS
        ),
        Sequence(
            Token('-'),
            r_integer
        )
    );
    var series_props = Choice(
        k_name,
        k_type,
        k_length,
        k_start,
        k_end,
        k_first,
        k_last,
        k_pool
    );
    var series_columns = List(series_props, Token(','), 1, undefined, false);
    var shard_props = Choice(
        k_sid,
        k_size,
        k_start,
        k_end,
        k_type
    );
    var shard_columns = List(shard_props, Token(','), 1, undefined, false);
    var server_props = Choice(
        k_address,
        k_name,
        k_port,
        k_uuid,
        k_pool,
        k_version,
        k_online,
        k_status,
        k_buffer_path,
        k_buffer_size,
        k_dbpath,
        k_debug,
        k_loglevel,
        k_manhole,
        k_max_open_files,
        k_mem_usage,
        k_open_files,
        k_optimize_pool,
        k_optimize_task,
        k_received_points,
        k_reindex_progress,
        k_sharding_buffering,
        k_sharding_max_chunk_points,
        k_startup_time,
        k_sync_progress,
        k_task_queue,
        k_uptime
    );
    var server_columns = List(server_props, Token(','), 1, undefined, false);
    var group_props = Choice(
        k_cached,
        k_expression,
        k_indexed,
        k_name,
        k_series
    );
    var group_columns = List(group_props, Token(','), 1, undefined, false);
    var user_props = Choice(
        k_user,
        k_access
    );
    var user_columns = List(user_props, Token(','), 1, undefined, false);
    var network_props = Choice(
        k_network,
        k_access,
        k_comment
    );
    var network_columns = List(network_props, Token(','), 1, undefined, false);
    var pool_props = Choice(
        k_pool,
        k_servers,
        k_series
    );
    var pool_columns = List(pool_props, Token(','), 1, undefined, false);
    var where_operator = Choice(
        Tokens('== != <= >= < >'),
        Keyword('in'),
        Sequence(
            Keyword('not'),
            Keyword('in')
        )
    );
    var where_series_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        k_null,
        series_props
    );
    var where_series_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_series_opts,
                where_operator,
                where_series_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var where_group_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        group_props
    );
    var where_group_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_group_opts,
                where_operator,
                where_group_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var where_pool_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        pool_props
    );
    var where_pool_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_pool_opts,
                where_operator,
                where_pool_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var where_server_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        server_props
    );
    var where_server_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_server_opts,
                where_operator,
                where_server_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var where_user_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        user_props
    );
    var where_user_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_user_opts,
                where_operator,
                where_user_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var where_network_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        network_props
    );
    var where_network_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_network_opts,
                where_operator,
                where_network_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var where_shard_opts = Prio(
        string,
        int_expr,
        time_expr,
        k_false,
        k_true,
        shard_props
    );
    var where_shard_stmt = Sequence(
        k_where,
        Prio(
            Sequence(
                where_shard_opts,
                where_operator,
                where_shard_opts
            ),
            Sequence(
                Token('('),
                THIS,
                Token(')')
            ),
            Sequence(
                THIS,
                k_and,
                THIS
            ),
            Sequence(
                THIS,
                k_or,
                THIS
            )
        )
    );
    var delimiter_match = Choice(
        k_union,
        c_difference,
        k_intersection,
        k_symmetric_difference
    );
    var series_name = Repeat(string, 1, 1);
    var group_name = Repeat(r_grave_str, 1, 1);
    var _boolean = Choice(
        k_true,
        k_false
    );
    var series_re = Repeat(r_regex, 1, 1);
    var uuid = Choice(
        r_uuid_str,
        string
    );
    var group_match = Repeat(r_grave_str, 1, 1);
    var series_match = List(Choice(
        series_name,
        group_match,
        series_re
    ), delimiter_match, 1, undefined, false);
    var limit_expr = Sequence(
        k_limit,
        int_expr
    );
    var before_expr = Sequence(
        k_before,
        time_expr
    );
    var after_expr = Sequence(
        k_after,
        time_expr
    );
    var between_expr = Sequence(
        k_between,
        time_expr,
        k_and,
        time_expr
    );
    var access_expr = List(access_keywords, Token(','), 1, undefined, false);
    var prefix_expr = Sequence(
        k_prefix,
        string
    );
    var suffix_expr = Sequence(
        k_suffix,
        string
    );
    var difference_expr = Sequence(
        k_difference,
        Token('('),
        Optional(time_expr),
        Token(')')
    );
    var derivative_expr = Sequence(
        k_derivative,
        Token('('),
        List(time_expr, Token(','), 0, 2, false),
        Token(')')
    );
    var mean_expr = Sequence(
        k_mean,
        Token('('),
        time_expr,
        Token(')')
    );
    var median_expr = Sequence(
        k_median,
        Token('('),
        time_expr,
        Token(')')
    );
    var median_low_expr = Sequence(
        k_median_low,
        Token('('),
        time_expr,
        Token(')')
    );
    var median_high_expr = Sequence(
        k_median_high,
        Token('('),
        time_expr,
        Token(')')
    );
    var sum_expr = Sequence(
        k_sum,
        Token('('),
        time_expr,
        Token(')')
    );
    var min_expr = Sequence(
        k_min,
        Token('('),
        time_expr,
        Token(')')
    );
    var max_expr = Sequence(
        k_max,
        Token('('),
        time_expr,
        Token(')')
    );
    var count_expr = Sequence(
        k_count,
        Token('('),
        time_expr,
        Token(')')
    );
    var variance_expr = Sequence(
        k_variance,
        Token('('),
        time_expr,
        Token(')')
    );
    var pvariance_expr = Sequence(
        k_pvariance,
        Token('('),
        time_expr,
        Token(')')
    );
    var filter_expr = Sequence(
        k_filter,
        Token('('),
        Optional(Choice(
            k_contains,
            Tokens('== != <= >= < >')
        )),
        Choice(
            string,
            r_float,
            r_integer
        ),
        Token(')')
    );
    var reject_expr = Sequence(
        k_reject,
        Token('('),
        Optional(Choice(
            k_contains,
            Tokens('== != <= >= < >')
        )),
        Choice(
            string,
            r_float,
            r_integer
        ),
        Token(')')
    );
    var aggregate_functions = List(Choice(
        mean_expr,
        sum_expr,
        median_expr,
        median_low_expr,
        median_high_expr,
        min_expr,
        max_expr,
        count_expr,
        variance_expr,
        pvariance_expr,
        difference_expr,
        derivative_expr,
        filter_expr,
        reject_expr
    ), Token('=>'), 1, undefined, false);
    var select_aggregate_expr = Sequence(
        Choice(
            k_points,
            aggregate_functions
        ),
        Optional(prefix_expr),
        Optional(suffix_expr)
    );
    var merge_expr = Sequence(
        k_merge,
        k_as,
        string,
        Optional(Sequence(
            k_using,
            aggregate_functions
        ))
    );
    var set_comment_expr = Sequence(
        k_set,
        k_comment,
        string
    );
    var set_password_expr = Sequence(
        k_set,
        k_password,
        string
    );
    var set_indexed_expr = Sequence(
        k_set,
        k_indexed,
        _boolean
    );
    var set_address_expr = Sequence(
        k_set,
        k_address,
        string
    );
    var set_port_expr = Sequence(
        k_set,
        k_port,
        r_integer
    );
    var set_license_expr = Sequence(
        k_set,
        k_license,
        string
    );
    var set_debug_expr = Sequence(
        k_set,
        k_debug,
        _boolean
    );
    var set_loglevel_expr = Sequence(
        k_set,
        k_loglevel,
        string
    );
    var set_series_name_expr = Sequence(
        k_set,
        k_name,
        string
    );
    var set_ignore_threshold_expr = Sequence(
        k_set,
        k_ignore_threshold,
        _boolean
    );
    var set_drop_threshold_expr = Sequence(
        k_set,
        k_drop_threshold,
        r_float
    );
    var set_query_timeout_expr = Sequence(
        k_set,
        k_query_timeout,
        r_float
    );
    var set_timezone_expr = Sequence(
        k_set,
        k_timezone,
        string
    );
    var set_max_cache_expressions_expr = Sequence(
        k_set,
        k_max_cache_expressions,
        r_integer
    );
    var set_max_open_files_expr = Sequence(
        k_set,
        k_max_open_files,
        r_integer
    );
    var set_expression_expr = Sequence(
        k_set,
        k_expression,
        r_regex
    );
    var for_regex_expr = Sequence(
        k_for,
        r_regex
    );
    var alter_user_stmt = Sequence(
        k_user,
        string,
        set_password_expr
    );
    var alter_network_stmt = Sequence(
        k_network,
        string,
        set_comment_expr
    );
    var alter_group_stmt = Sequence(
        k_group,
        group_name,
        Choice(
            set_expression_expr,
            set_indexed_expr
        )
    );
    var alter_server_stmt = Sequence(
        k_server,
        uuid,
        Choice(
            set_address_expr,
            set_port_expr,
            set_debug_expr,
            set_loglevel_expr
        )
    );
    var alter_database_stmt = Sequence(
        k_database,
        Choice(
            set_license_expr,
            set_drop_threshold_expr,
            set_query_timeout_expr,
            set_timezone_expr,
            set_max_cache_expressions_expr,
            set_max_open_files_expr
        )
    );
    var alter_series_stmt = Sequence(
        k_series,
        series_name,
        set_series_name_expr
    );
    var count_groups_stmt = Sequence(
        k_groups,
        Optional(where_group_stmt)
    );
    var count_groups_props_stmt = Sequence(
        k_groups,
        k_series,
        Optional(where_group_stmt)
    );
    var count_networks_stmt = Sequence(
        k_networks,
        Optional(where_network_stmt)
    );
    var count_pools_stmt = Sequence(
        k_pools,
        Optional(where_pool_stmt)
    );
    var count_pools_props_stmt = Sequence(
        k_pools,
        Choice(
            k_series,
            k_servers
        ),
        Optional(where_pool_stmt)
    );
    var count_series_stmt = Sequence(
        k_series,
        Optional(series_match),
        Optional(where_series_stmt)
    );
    var count_servers_stmt = Sequence(
        k_servers,
        Optional(where_server_stmt)
    );
    var count_servers_props_stmt = Sequence(
        k_servers,
        Choice(
            k_received_points,
            k_mem_usage,
            k_open_files
        ),
        Optional(where_server_stmt)
    );
    var count_shards_stmt = Sequence(
        k_shards,
        Optional(where_shard_stmt)
    );
    var count_shards_props_stmt = Sequence(
        k_shards,
        k_size,
        Optional(where_shard_stmt)
    );
    var count_users_stmt = Sequence(
        k_users,
        Optional(where_user_stmt)
    );
    var count_series_length_stmt = Sequence(
        k_series,
        k_length,
        Optional(series_match),
        Optional(where_series_stmt)
    );
    var create_group_stmt = Sequence(
        k_group,
        group_name,
        for_regex_expr,
        Optional(set_indexed_expr)
    );
    var create_user_stmt = Sequence(
        k_user,
        string,
        set_password_expr
    );
    var create_network_stmt = Sequence(
        k_network,
        string,
        Optional(set_comment_expr)
    );
    var drop_group_stmt = Sequence(
        k_group,
        group_name
    );
    var drop_series_stmt = Sequence(
        k_series,
        Choice(
            series_match,
            where_series_stmt,
            Sequence(
                series_match,
                where_series_stmt
            )
        ),
        Optional(set_ignore_threshold_expr)
    );
    var drop_shard_stmt = Sequence(
        k_shard,
        r_integer
    );
    var drop_shards_stmt = Sequence(
        k_shards,
        Optional(where_shard_stmt),
        Optional(set_ignore_threshold_expr)
    );
    var drop_server_stmt = Sequence(
        k_server,
        uuid
    );
    var drop_user_stmt = Sequence(
        k_user,
        string
    );
    var drop_network_stmt = Sequence(
        k_network,
        string
    );
    var grant_user_stmt = Sequence(
        k_user,
        string,
        Optional(set_password_expr)
    );
    var grant_network_stmt = Sequence(
        k_network,
        string,
        Optional(set_comment_expr)
    );
    var list_groups_stmt = Sequence(
        k_groups,
        Optional(group_columns),
        Optional(where_group_stmt)
    );
    var list_networks_stmt = Sequence(
        k_networks,
        Optional(network_columns),
        Optional(where_network_stmt)
    );
    var list_pools_stmt = Sequence(
        k_pools,
        Optional(pool_columns),
        Optional(where_pool_stmt)
    );
    var list_series_stmt = Sequence(
        k_series,
        Optional(series_columns),
        Optional(series_match),
        Optional(where_series_stmt)
    );
    var list_servers_stmt = Sequence(
        k_servers,
        Optional(server_columns),
        Optional(where_server_stmt)
    );
    var list_shards_stmt = Sequence(
        k_shards,
        Optional(shard_columns),
        Optional(where_shard_stmt)
    );
    var list_users_stmt = Sequence(
        k_users,
        Optional(user_columns),
        Optional(where_user_stmt)
    );
    var revoke_user_stmt = Sequence(
        k_user,
        string
    );
    var revoke_network_stmt = Sequence(
        k_network,
        string
    );
    var alter_stmt = Sequence(
        k_alter,
        Choice(
            alter_user_stmt,
            alter_network_stmt,
            alter_group_stmt,
            alter_server_stmt,
            alter_database_stmt,
            alter_series_stmt
        )
    );
    var calc_stmt = Repeat(time_expr, 1, 1);
    var continue_stmt = Sequence(
        k_continue,
        uuid
    );
    var count_stmt = Sequence(
        k_count,
        Choice(
            count_groups_stmt,
            count_groups_props_stmt,
            count_networks_stmt,
            count_pools_stmt,
            count_pools_props_stmt,
            count_series_stmt,
            count_servers_stmt,
            count_servers_props_stmt,
            count_shards_stmt,
            count_shards_props_stmt,
            count_users_stmt,
            count_series_length_stmt
        )
    );
    var create_stmt = Sequence(
        k_create,
        Choice(
            create_group_stmt,
            create_user_stmt,
            create_network_stmt
        )
    );
    var drop_stmt = Sequence(
        k_drop,
        Choice(
            drop_group_stmt,
            drop_series_stmt,
            drop_shard_stmt,
            drop_shards_stmt,
            drop_server_stmt,
            drop_user_stmt,
            drop_network_stmt
        )
    );
    var grant_stmt = Sequence(
        k_grant,
        access_expr,
        k_to,
        Choice(
            grant_user_stmt,
            grant_network_stmt
        )
    );
    var list_stmt = Sequence(
        k_list,
        Choice(
            list_series_stmt,
            list_users_stmt,
            list_networks_stmt,
            list_shards_stmt,
            list_groups_stmt,
            list_servers_stmt,
            list_pools_stmt
        ),
        Optional(limit_expr)
    );
    var pause_stmt = Sequence(
        k_pause,
        uuid
    );
    var revoke_stmt = Sequence(
        k_revoke,
        access_expr,
        k_from,
        Choice(
            revoke_user_stmt,
            revoke_network_stmt
        )
    );
    var select_stmt = Sequence(
        k_select,
        List(select_aggregate_expr, Token(','), 1, undefined, false),
        k_from,
        series_match,
        Optional(where_series_stmt),
        Optional(Choice(
            after_expr,
            between_expr,
            before_expr
        )),
        Optional(merge_expr)
    );
    var show_props = Choice(
        k_buffer_path,
        k_buffer_size,
        k_dbname,
        k_dbpath,
        k_debug,
        k_drop_threshold,
        k_duration_log,
        k_duration_num,
        k_license,
        k_loglevel,
        k_manhole,
        k_max_cache_expressions,
        k_max_open_files,
        k_mem_usage,
        k_open_files,
        k_optimize_pool,
        k_optimize_task,
        k_pool,
        k_python,
        k_query_timeout,
        k_received_points,
        k_reindex_progress,
        k_server,
        k_sharding_buffering,
        k_sharding_max_chunk_points,
        k_startup_time,
        k_status,
        k_sync_progress,
        k_task_queue,
        k_timezone,
        k_time_precision,
        k_aiohttp_server,
        k_uptime,
        k_uuid,
        k_version,
        k_who_am_i
    );
    var show_stmt = Sequence(
        k_show,
        List(show_props, Token(','), 0, undefined, false)
    );
    var timeit_stmt = Repeat(k_timeit, 1, 1);
    var help_grant = Keyword('grant');
    var help_timeit = Keyword('timeit');
    var help_select = Keyword('select');
    var help_timezones = Keyword('timezones');
    var help_alter_group = Keyword('group');
    var help_alter_network = Keyword('network');
    var help_alter_series = Keyword('series');
    var help_alter_user = Keyword('user');
    var help_alter_database = Keyword('database');
    var help_alter_server = Keyword('server');
    var help_alter = Sequence(
        k_alter,
        Optional(Choice(
            help_alter_group,
            help_alter_network,
            help_alter_series,
            help_alter_user,
            help_alter_database,
            help_alter_server
        ))
    );
    var help_access = Keyword('access');
    var help_noaccess = Keyword('noaccess');
    var help_show = Keyword('show');
    var help_create_group = Keyword('group');
    var help_create_user = Keyword('user');
    var help_create_network = Keyword('network');
    var help_create = Sequence(
        k_create,
        Optional(Choice(
            help_create_group,
            help_create_user,
            help_create_network
        ))
    );
    var help_drop_group = Keyword('group');
    var help_drop_network = Keyword('network');
    var help_drop_shard = Keyword('shard');
    var help_drop_series = Keyword('series');
    var help_drop_user = Keyword('user');
    var help_drop_server = Keyword('server');
    var help_drop = Sequence(
        k_drop,
        Optional(Choice(
            help_drop_group,
            help_drop_network,
            help_drop_shard,
            help_drop_series,
            help_drop_user,
            help_drop_server
        ))
    );
    var help_count_users = Keyword('users');
    var help_count_servers = Keyword('servers');
    var help_count_shards = Keyword('shards');
    var help_count_pools = Keyword('pools');
    var help_count_series = Keyword('series');
    var help_count_networks = Keyword('networks');
    var help_count_groups = Keyword('groups');
    var help_count = Sequence(
        k_count,
        Optional(Choice(
            help_count_users,
            help_count_servers,
            help_count_shards,
            help_count_pools,
            help_count_series,
            help_count_networks,
            help_count_groups
        ))
    );
    var help_functions = Keyword('functions');
    var help_list_networks = Keyword('networks');
    var help_list_series = Keyword('series');
    var help_list_shards = Keyword('shards');
    var help_list_servers = Keyword('servers');
    var help_list_users = Keyword('users');
    var help_list_groups = Keyword('groups');
    var help_list_pools = Keyword('pools');
    var help_list = Sequence(
        k_list,
        Optional(Choice(
            help_list_networks,
            help_list_series,
            help_list_shards,
            help_list_servers,
            help_list_users,
            help_list_groups,
            help_list_pools
        ))
    );
    var help_revoke = Keyword('revoke');
    var help_pause = Keyword('pause');
    var help_continue = Keyword('continue');
    var help = Sequence(
        k_help,
        Optional(Choice(
            help_grant,
            help_timeit,
            help_select,
            help_timezones,
            help_alter,
            help_access,
            help_noaccess,
            help_show,
            help_create,
            help_drop,
            help_count,
            help_functions,
            help_list,
            help_revoke,
            help_pause,
            help_continue
        ))
    );
    var START = Sequence(
        Optional(timeit_stmt),
        Optional(Choice(
            select_stmt,
            list_stmt,
            count_stmt,
            alter_stmt,
            continue_stmt,
            create_stmt,
            drop_stmt,
            grant_stmt,
            pause_stmt,
            revoke_stmt,
            show_stmt,
            calc_stmt,
            help
        )),
        Optional(r_comment)
    );

    window.SiriGrammar = Grammar(START, '[a-z_]+');

})(
    window.jsleri.Optional,
    window.jsleri.Rule,
    window.jsleri.Tokens,
    window.jsleri.Grammar,
    window.jsleri.List,
    window.jsleri.Token,
    window.jsleri.Repeat,
    window.jsleri.Sequence,
    window.jsleri.THIS,
    window.jsleri.Prio,
    window.jsleri.Regex,
    window.jsleri.Choice,
    window.jsleri.Keyword
);

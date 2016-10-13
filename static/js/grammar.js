/* jshint newcap: false */

/*
 * This grammar is generated using the Grammar.export_js() method and
 * should be used with the jsleri JavaScript module.
 *
 * Source class: SiriGrammar
 * Created at: 2016-10-14 00:59:00
 */

'use strict';

(function (
            Keyword,
            List,
            Prio,
            Grammar,
            Choice,
            Token,
            Repeat,
            Optional,
            Sequence,
            THIS,
            Tokens,
            Rule,
            Regex
        ) {
    var r_float = Regex('^[-+]?[0-9]*\\.?[0-9]+');
    var r_integer = Regex('^[-+]?[0-9]+');
    var r_uinteger = Regex('^[0-9]+');
    var r_time_str = Regex('^[0-9]+[smhdw]');
    var r_singleq_str = Regex('^(?:\'(?:[^\']*)\')+');
    var r_doubleq_str = Regex('^(?:"(?:[^"]*)")+');
    var r_grave_str = Regex('^(?:`(?:[^`]*)`)+');
    var r_uuid_str = Regex('^[0-9a-f]{8}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{12}');
    var r_regex = Regex('^(/[^/\\\\]*(?:\\\\.[^/\\\\]*)*/i?)');
    var r_comment = Regex('^#.*');
    var k_access = Keyword('access');
    var k_active_handles = Keyword('active_handles');
    var k_address = Keyword('address');
    var k_after = Keyword('after');
    var k_alter = Keyword('alter');
    var k_and = Keyword('and');
    var k_as = Keyword('as');
    var k_backup_mode = Keyword('backup_mode');
    var k_before = Keyword('before');
    var k_buffer_size = Keyword('buffer_size');
    var k_buffer_path = Keyword('buffer_path');
    var k_between = Keyword('between');
    var k_count = Keyword('count');
    var k_create = Keyword('create');
    var k_critical = Keyword('critical');
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
    var k_error = Keyword('error');
    var k_expression = Keyword('expression');
    var k_false = Keyword('false');
    var k_filter = Keyword('filter');
    var k_float = Keyword('float');
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
    var k_info = Keyword('info');
    var k_ignore_threshold = Keyword('ignore_threshold');
    var k_insert = Keyword('insert');
    var k_integer = Keyword('integer');
    var k_intersection = Choice(
        Token('&'),
        Keyword('intersection')
    );
    var k_length = Keyword('length');
    var k_libuv = Keyword('libuv');
    var k_limit = Keyword('limit');
    var k_list = Keyword('list');
    var k_log = Keyword('log');
    var k_log_level = Keyword('log_level');
    var k_max = Keyword('max');
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
    var k_now = Keyword('now');
    var k_number = Keyword('number');
    var k_online = Keyword('online');
    var k_open_files = Keyword('open_files');
    var k_or = Keyword('or');
    var k_password = Keyword('password');
    var k_points = Keyword('points');
    var k_pool = Keyword('pool');
    var k_pools = Keyword('pools');
    var k_port = Keyword('port');
    var k_prefix = Keyword('prefix');
    var k_pvariance = Keyword('pvariance');
    var k_read = Keyword('read');
    var k_received_points = Keyword('received_points');
    var k_reindex_progress = Keyword('reindex_progress');
    var k_revoke = Keyword('revoke');
    var k_select = Keyword('select');
    var k_series = Keyword('series');
    var k_server = Keyword('server');
    var k_servers = Keyword('servers');
    var k_set = Keyword('set');
    var k_sid = Keyword('sid');
    var k_shards = Keyword('shards');
    var k_show = Keyword('show');
    var k_size = Keyword('size');
    var k_start = Keyword('start');
    var k_startup_time = Keyword('startup_time');
    var k_status = Keyword('status');
    var k_string = Keyword('string');
    var k_suffix = Keyword('suffix');
    var k_sum = Keyword('sum');
    var k_symmetric_difference = Choice(
        Token('^'),
        Keyword('symmetric_difference')
    );
    var k_sync_progress = Keyword('sync_progress');
    var k_timeit = Keyword('timeit');
    var k_timezone = Keyword('timezone');
    var k_time_precision = Keyword('time_precision');
    var k_to = Keyword('to');
    var k_true = Keyword('true');
    var k_type = Keyword('type');
    var k_union = Choice(
        Tokens('{}'),
        Keyword('union')
    );
    var k_uptime = Keyword('uptime');
    var k_user = Keyword('user');
    var k_users = Keyword('users');
    var k_using = Keyword('using');
    var k_uuid = Keyword('uuid');
    var k_variance = Keyword('variance');
    var k_version = Keyword('version');
    var k_warning = Keyword('warning');
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
        k_alter
    );
    var _boolean = Choice(
        k_true,
        k_false
    );
    var log_keywords = Choice(
        k_debug,
        k_info,
        k_warning,
        k_error,
        k_critical
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
            Tokens('{}'),
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
            Tokens('{}'),
            THIS
        )
    );
    var series_columns = List(Choice(
        k_name,
        k_type,
        k_length,
        k_start,
        k_end,
        k_pool
    ), Token(','), 1, undefined, false);
    var shard_columns = List(Choice(
        k_sid,
        k_pool,
        k_server,
        k_size,
        k_start,
        k_end,
        k_type,
        k_status
    ), Token(','), 1, undefined, false);
    var server_columns = List(Choice(
        k_address,
        k_buffer_path,
        k_buffer_size,
        k_dbpath,
        k_libuv,
        k_name,
        k_port,
        k_uuid,
        k_pool,
        k_version,
        k_online,
        k_startup_time,
        k_status,
        k_active_handles,
        k_log_level,
        k_max_open_files,
        k_mem_usage,
        k_open_files,
        k_received_points,
        k_reindex_progress,
        k_sync_progress,
        k_uptime
    ), Token(','), 1, undefined, false);
    var group_columns = List(Choice(
        k_expression,
        k_name,
        k_series
    ), Token(','), 1, undefined, false);
    var user_columns = List(Choice(
        k_name,
        k_access
    ), Token(','), 1, undefined, false);
    var pool_props = Choice(
        k_pool,
        k_servers,
        k_series
    );
    var pool_columns = List(pool_props, Token(','), 1, undefined, false);
    var bool_operator = Tokens('{}');
    var int_operator = Tokens('{}');
    var str_operator = Tokens('{}');
    var where_group = Sequence(
        k_where,
        Prio(
            Sequence(
                k_series,
                int_operator,
                int_expr
            ),
            Sequence(
                Choice(
                    k_expression,
                    k_name
                ),
                str_operator,
                string
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
    var where_pool = Sequence(
        k_where,
        Prio(
            Sequence(
                pool_props,
                int_operator,
                int_expr
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
    var where_series = Sequence(
        k_where,
        Prio(
            Sequence(
                Choice(
                    k_length,
                    k_pool
                ),
                int_operator,
                int_expr
            ),
            Sequence(
                k_name,
                str_operator,
                string
            ),
            Sequence(
                Choice(
                    k_start,
                    k_end
                ),
                int_operator,
                time_expr
            ),
            Sequence(
                k_type,
                bool_operator,
                Choice(
                    k_string,
                    k_integer,
                    k_float
                )
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
    var where_server = Sequence(
        k_where,
        Prio(
            Sequence(
                Choice(
                    k_active_handles,
                    k_buffer_size,
                    k_port,
                    k_pool,
                    k_startup_time,
                    k_max_open_files,
                    k_mem_usage,
                    k_open_files,
                    k_received_points,
                    k_uptime
                ),
                int_operator,
                int_expr
            ),
            Sequence(
                Choice(
                    k_address,
                    k_buffer_path,
                    k_dbpath,
                    k_libuv,
                    k_name,
                    k_uuid,
                    k_version,
                    k_status,
                    k_reindex_progress,
                    k_sync_progress
                ),
                str_operator,
                string
            ),
            Sequence(
                k_online,
                bool_operator,
                _boolean
            ),
            Sequence(
                k_log_level,
                int_operator,
                log_keywords
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
    var where_shard = Sequence(
        k_where,
        Prio(
            Sequence(
                Choice(
                    k_sid,
                    k_pool,
                    k_size
                ),
                int_operator,
                int_expr
            ),
            Sequence(
                Choice(
                    k_server,
                    k_status
                ),
                str_operator,
                string
            ),
            Sequence(
                Choice(
                    k_start,
                    k_end
                ),
                int_operator,
                time_expr
            ),
            Sequence(
                k_type,
                bool_operator,
                Choice(
                    k_number,
                    k_log
                )
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
    var where_user = Sequence(
        k_where,
        Prio(
            Sequence(
                k_name,
                str_operator,
                string
            ),
            Sequence(
                k_access,
                int_operator,
                access_keywords
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
    var series_sep = Choice(
        k_union,
        c_difference,
        k_intersection,
        k_symmetric_difference
    );
    var series_name = Repeat(string, 1, 1);
    var group_name = Repeat(r_grave_str, 1, 1);
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
    ), series_sep, 1, undefined, false);
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
    var f_points = Choice(
        Token('*'),
        k_points
    );
    var f_difference = Sequence(
        k_difference,
        Token('('),
        Optional(time_expr),
        Token(')')
    );
    var f_derivative = Sequence(
        k_derivative,
        Token('('),
        List(time_expr, Token(','), 0, 2, false),
        Token(')')
    );
    var f_mean = Sequence(
        k_mean,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_median = Sequence(
        k_median,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_median_low = Sequence(
        k_median_low,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_median_high = Sequence(
        k_median_high,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_sum = Sequence(
        k_sum,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_min = Sequence(
        k_min,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_max = Sequence(
        k_max,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_count = Sequence(
        k_count,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_variance = Sequence(
        k_variance,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_pvariance = Sequence(
        k_pvariance,
        Token('('),
        time_expr,
        Token(')')
    );
    var f_filter = Sequence(
        k_filter,
        Token('('),
        Optional(str_operator),
        Choice(
            string,
            r_integer,
            r_float
        ),
        Token(')')
    );
    var aggregate_functions = List(Choice(
        f_points,
        f_mean,
        f_sum,
        f_median,
        f_median_low,
        f_median_high,
        f_min,
        f_max,
        f_count,
        f_variance,
        f_pvariance,
        f_difference,
        f_derivative,
        f_filter
    ), Token('=>'), 1, undefined, false);
    var select_aggregate = Sequence(
        aggregate_functions,
        Optional(prefix_expr),
        Optional(suffix_expr)
    );
    var merge_as = Sequence(
        k_merge,
        k_as,
        string,
        Optional(Sequence(
            k_using,
            aggregate_functions
        ))
    );
    var set_address = Sequence(
        k_set,
        k_address,
        string
    );
    var set_backup_mode = Sequence(
        k_set,
        k_backup_mode,
        _boolean
    );
    var set_drop_threshold = Sequence(
        k_set,
        k_drop_threshold,
        r_float
    );
    var set_expression = Sequence(
        k_set,
        k_expression,
        r_regex
    );
    var set_ignore_threshold = Sequence(
        k_set,
        k_ignore_threshold,
        _boolean
    );
    var set_log_level = Sequence(
        k_set,
        k_log_level,
        log_keywords
    );
    var set_name = Sequence(
        k_set,
        k_name,
        string
    );
    var set_password = Sequence(
        k_set,
        k_password,
        string
    );
    var set_port = Sequence(
        k_set,
        k_port,
        r_uinteger
    );
    var set_timezone = Sequence(
        k_set,
        k_timezone,
        string
    );
    var alter_database = Sequence(
        k_database,
        Choice(
            set_drop_threshold,
            set_timezone
        )
    );
    var alter_group = Sequence(
        k_group,
        group_name,
        Choice(
            set_expression,
            set_name
        )
    );
    var alter_server = Sequence(
        k_server,
        uuid,
        Choice(
            set_log_level,
            set_backup_mode,
            set_address,
            set_port
        )
    );
    var alter_user = Sequence(
        k_user,
        string,
        Choice(
            set_password,
            set_name
        )
    );
    var count_groups = Sequence(
        k_groups,
        Optional(where_group)
    );
    var count_pools = Sequence(
        k_pools,
        Optional(where_pool)
    );
    var count_series = Sequence(
        k_series,
        Optional(series_match),
        Optional(where_series)
    );
    var count_servers = Sequence(
        k_servers,
        Optional(where_server)
    );
    var count_servers_received = Sequence(
        k_servers,
        k_received_points,
        Optional(where_server)
    );
    var count_shards = Sequence(
        k_shards,
        Optional(where_shard)
    );
    var count_shards_size = Sequence(
        k_shards,
        k_size,
        Optional(where_shard)
    );
    var count_users = Sequence(
        k_users,
        Optional(where_user)
    );
    var count_series_length = Sequence(
        k_series,
        k_length,
        Optional(series_match),
        Optional(where_series)
    );
    var create_group = Sequence(
        k_group,
        group_name,
        k_for,
        r_regex
    );
    var create_user = Sequence(
        k_user,
        string,
        set_password
    );
    var drop_group = Sequence(
        k_group,
        group_name
    );
    var drop_series = Sequence(
        k_series,
        Choice(
            series_match,
            where_series,
            Sequence(
                series_match,
                where_series
            )
        ),
        Optional(set_ignore_threshold)
    );
    var drop_shards = Sequence(
        k_shards,
        Optional(where_shard),
        Optional(set_ignore_threshold)
    );
    var drop_server = Sequence(
        k_server,
        uuid
    );
    var drop_user = Sequence(
        k_user,
        string
    );
    var grant_user = Sequence(
        k_user,
        string,
        Optional(set_password)
    );
    var list_groups = Sequence(
        k_groups,
        Optional(group_columns),
        Optional(where_group)
    );
    var list_pools = Sequence(
        k_pools,
        Optional(pool_columns),
        Optional(where_pool)
    );
    var list_series = Sequence(
        k_series,
        Optional(series_columns),
        Optional(series_match),
        Optional(where_series)
    );
    var list_servers = Sequence(
        k_servers,
        Optional(server_columns),
        Optional(where_server)
    );
    var list_shards = Sequence(
        k_shards,
        Optional(shard_columns),
        Optional(where_shard)
    );
    var list_users = Sequence(
        k_users,
        Optional(user_columns),
        Optional(where_user)
    );
    var revoke_user = Sequence(
        k_user,
        string
    );
    var alter_stmt = Sequence(
        k_alter,
        Choice(
            alter_user,
            alter_group,
            alter_server,
            alter_database
        )
    );
    var calc_stmt = Repeat(time_expr, 1, 1);
    var count_stmt = Sequence(
        k_count,
        Choice(
            count_groups,
            count_pools,
            count_series,
            count_servers,
            count_servers_received,
            count_shards,
            count_shards_size,
            count_users,
            count_series_length
        )
    );
    var create_stmt = Sequence(
        k_create,
        Choice(
            create_group,
            create_user
        )
    );
    var drop_stmt = Sequence(
        k_drop,
        Choice(
            drop_group,
            drop_series,
            drop_shards,
            drop_server,
            drop_user
        )
    );
    var grant_stmt = Sequence(
        k_grant,
        access_expr,
        k_to,
        Choice(
            grant_user
        )
    );
    var list_stmt = Sequence(
        k_list,
        Choice(
            list_series,
            list_users,
            list_shards,
            list_groups,
            list_servers,
            list_pools
        ),
        Optional(limit_expr)
    );
    var revoke_stmt = Sequence(
        k_revoke,
        access_expr,
        k_from,
        Choice(
            revoke_user
        )
    );
    var select_stmt = Sequence(
        k_select,
        List(select_aggregate, Token(','), 1, undefined, false),
        k_from,
        series_match,
        Optional(where_series),
        Optional(Choice(
            after_expr,
            between_expr,
            before_expr
        )),
        Optional(merge_as)
    );
    var show_stmt = Sequence(
        k_show,
        List(Choice(
            k_active_handles,
            k_buffer_path,
            k_buffer_size,
            k_dbname,
            k_dbpath,
            k_drop_threshold,
            k_duration_log,
            k_duration_num,
            k_libuv,
            k_log_level,
            k_max_open_files,
            k_mem_usage,
            k_open_files,
            k_pool,
            k_received_points,
            k_reindex_progress,
            k_server,
            k_startup_time,
            k_status,
            k_sync_progress,
            k_time_precision,
            k_timezone,
            k_uptime,
            k_uuid,
            k_version,
            k_who_am_i
        ), Token(','), 0, undefined, false)
    );
    var timeit_stmt = Repeat(k_timeit, 1, 1);
    var help_count_series = Keyword('series');
    var help_count_groups = Keyword('groups');
    var help_count_users = Keyword('users');
    var help_count_pools = Keyword('pools');
    var help_count_servers = Keyword('servers');
    var help_count_networks = Keyword('networks');
    var help_count_shards = Keyword('shards');
    var help_count = Sequence(
        k_count,
        Optional(Choice(
            help_count_series,
            help_count_groups,
            help_count_users,
            help_count_pools,
            help_count_servers,
            help_count_networks,
            help_count_shards
        ))
    );
    var help_access = Keyword('access');
    var help_drop_server = Keyword('server');
    var help_drop_series = Keyword('series');
    var help_drop_network = Keyword('network');
    var help_drop_group = Keyword('group');
    var help_drop_user = Keyword('user');
    var help_drop_shard = Keyword('shard');
    var help_drop = Sequence(
        k_drop,
        Optional(Choice(
            help_drop_server,
            help_drop_series,
            help_drop_network,
            help_drop_group,
            help_drop_user,
            help_drop_shard
        ))
    );
    var help_timezones = Keyword('timezones');
    var help_grant = Keyword('grant');
    var help_alter_network = Keyword('network');
    var help_alter_group = Keyword('group');
    var help_alter_user = Keyword('user');
    var help_alter_series = Keyword('series');
    var help_alter_server = Keyword('server');
    var help_alter_database = Keyword('database');
    var help_alter = Sequence(
        k_alter,
        Optional(Choice(
            help_alter_network,
            help_alter_group,
            help_alter_user,
            help_alter_series,
            help_alter_server,
            help_alter_database
        ))
    );
    var help_pause = Keyword('pause');
    var help_create_user = Keyword('user');
    var help_create_group = Keyword('group');
    var help_create_network = Keyword('network');
    var help_create = Sequence(
        k_create,
        Optional(Choice(
            help_create_user,
            help_create_group,
            help_create_network
        ))
    );
    var help_functions = Keyword('functions');
    var help_timeit = Keyword('timeit');
    var help_noaccess = Keyword('noaccess');
    var help_show = Keyword('show');
    var help_select = Keyword('select');
    var help_continue = Keyword('continue');
    var help_revoke = Keyword('revoke');
    var help_list_series = Keyword('series');
    var help_list_shards = Keyword('shards');
    var help_list_users = Keyword('users');
    var help_list_pools = Keyword('pools');
    var help_list_networks = Keyword('networks');
    var help_list_servers = Keyword('servers');
    var help_list_groups = Keyword('groups');
    var help_list = Sequence(
        k_list,
        Optional(Choice(
            help_list_series,
            help_list_shards,
            help_list_users,
            help_list_pools,
            help_list_networks,
            help_list_servers,
            help_list_groups
        ))
    );
    var help = Sequence(
        k_help,
        Optional(Choice(
            help_count,
            help_access,
            help_drop,
            help_timezones,
            help_grant,
            help_alter,
            help_pause,
            help_create,
            help_functions,
            help_timeit,
            help_noaccess,
            help_show,
            help_select,
            help_continue,
            help_revoke,
            help_list
        ))
    );
    var START = Sequence(
        Optional(timeit_stmt),
        Optional(Choice(
            select_stmt,
            list_stmt,
            count_stmt,
            alter_stmt,
            create_stmt,
            drop_stmt,
            grant_stmt,
            revoke_stmt,
            show_stmt,
            calc_stmt,
            help
        )),
        Optional(r_comment)
    );

    window.SiriGrammar = Grammar(START, '[a-z_]+');

})(
    window.jsleri.Keyword,
    window.jsleri.List,
    window.jsleri.Prio,
    window.jsleri.Grammar,
    window.jsleri.Choice,
    window.jsleri.Token,
    window.jsleri.Repeat,
    window.jsleri.Optional,
    window.jsleri.Sequence,
    window.jsleri.THIS,
    window.jsleri.Tokens,
    window.jsleri.Rule,
    window.jsleri.Regex
);

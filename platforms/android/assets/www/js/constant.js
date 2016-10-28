xpos
.constant("DB_CONFIG", {
    name: "xpos.db",
    tables: [
        {
            name: "shop_info",
            columns: [
                {name: "shop_name", type: "TEXT NOT NULL"},
                {name: "mobile", type: "TEXT"},
                {name: "tel", type: "TEXT"},
                {name: "fax", type: "TEXT"},
                {name: "user_name", type: "TEXT"},
                {name: "address", type: "TEXT"}
            ]
        },
        {
            name: "payment",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "lookup_idx", type: "INTEGER NOT NULL"},
                {name: "lookup_type", type: "TEXT NOT NULL"},
                {name: "pay_type", type: "TEXT"},
                {name: "pay_amount", type: "INTEGER DEFAULT 0"},
                {name: "code", type: "TEXT"},
                {name: "ret_code", type: "TEXT"},
                {name: "success_code", type: "TEXT"},
                {name: "success_date", type: "TEXT"},
                {name: "regdate", type: "INTEGER"},
                {name: "cancel_date", type: "INTEGER"},
                {name: "is_cancel", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "month",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "start_date", type: "INTEGER NOT NULL"},
                {name: "end_date", type: "INTEGER"},
                {name: "amount", type: "INTEGER DEFAULT 0"},
                {name: "car_num", type: "TEXT"},
                {name: "car_name", type: "TEXT"},
                {name: "car_type_title", type: "TEXT"},
                {name: "user_name", type: "TEXT"},
                {name: "mobile", type: "TEXT"},
                {name: "regdate", type: "INTEGER"},
                {name: "is_stop", type: "TEXT NOT NULL DEFAULT 'N'"},
                {name: "stop_date", type: "INTEGER"}
            ]
        },
        {
            name: "garage",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "start_date", type: "INTEGER NOT NULL"},
                {name: "end_date", type: "INTEGER"},
                {name: "car_num", type: "TEXT"},
                {name: "car_type_title", type: "TEXT"},
                {name: "minute_unit", type: "INTEGER DEFAULT 0"},
                {name: "minute_free", type: "INTEGER DEFAULT 0"},
                {name: "amount_unit", type: "INTEGER DEFAULT 0"},
                {name: "basic_amount", type: "INTEGER DEFAULT 0"},
                {name: "basic_minute", type: "INTEGER DEFAULT 0"},
                {name: "month_idx", type: "INTEGER DEFAULT 0"},
                {name: "cooper_idx", type: "INTEGER DEFAULT 0"},
                {name: "discount_cooper", type: "INTEGER DEFAULT 0"},
                {name: "discount_self", type: "INTEGER DEFAULT 0"},
                {name: "total_amount", type: "INTEGER DEFAULT 0"},
                {name: "is_out", type: "TEXT NOT NULL DEFAULT 'N'"},
                {name: "is_cancel", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "cooper",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "coop_title", type: "TEXT NOT NULL"},
                {name: "coop_tel", type: "TEXT"},
                {name: "coop_address", type: "TEXT"},
                {name: "coop_user_name", type: "TEXT"},
                {name: "minute_unit", type: "INTEGER DEFAULT 0"},
                {name: "minute_max", type: "INTEGER DEFAULT 0"},
                {name: "amount_unit", type: "INTEGER DEFAULT 0"},
                {name: "regdate", type: "INTEGER"},
                {name: "is_end", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "car_type",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "car_type_title", type: "TEXT NOT NULL"},
                {name: "minute_unit", type: "INTEGER DEFAULT 0"},
                {name: "minute_free", type: "INTEGER DEFAULT 0"},
                {name: "amount_unit", type: "INTEGER DEFAULT 0"},
                {name: "basic_amount", type: "INTEGER DEFAULT 0"},
                {name: "basic_minute", type: "INTEGER DEFAULT 0"},
                {name: "is_daycar", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        }

    ]
});
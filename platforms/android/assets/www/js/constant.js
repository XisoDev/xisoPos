xpos
.constant("DB_CONFIG", {
    name: "xpos.db",
    tables: [
        {
            name: "shop_info",
            columns: [
                {name: "shop_name", type: "TEXT NOT NULL"},
                {name: "mobile", type: "TEXT NOT NULL"},
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
                {name: "pay_amount", type: "INTEGER"},
                {name: "return_data", type: "TEXT"},
                {name: "regdate", type: "TEXT"},
                {name: "is_cancel", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "month",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "start_date", type: "TEXT NOT NULL"},
                {name: "end_date", type: "TEXT"},
                {name: "amount", type: "INTEGER"},
                {name: "car_num", type: "TEXT"},
                {name: "car_name", type: "TEXT"},
                {name: "car_type_title", type: "TEXT"},
                {name: "user_name", type: "TEXT"},
                {name: "mobile", type: "TEXT"},
                {name: "regdate", type: "TEXT"},
                {name: "is_end", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "garage",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "start_date", type: "TEXT NOT NULL"},
                {name: "end_date", type: "TEXT"},
                {name: "car_num", type: "TEXT"},
                {name: "car_name", type: "TEXT"},
                {name: "car_type_title", type: "TEXT"},
                {name: "minute_unit", type: "INTEGER"},
                {name: "minute_free", type: "INTEGER"},
                {name: "minute_unit", type: "INTEGER"},
                {name: "amount_unit", type: "INTEGER"},
                {name: "basic_amount", type: "INTEGER"},
                {name: "basic_minute", type: "INTEGER"},
                {name: "user_name", type: "TEXT"},
                {name: "mobile", type: "TEXT"},
                {name: "month_idx", type: "INTEGER"},
                {name: "cooper_idx", type: "INTEGER"},
                {name: "discount_cooper", type: "INTEGER"},
                {name: "discount_self", type: "INTEGER"},
                {name: "regdate", type: "TEXT"},
                {name: "is_out", type: "TEXT NOT NULL DEFAULT 'N'"}
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
                {name: "minute_unit", type: "INTEGER"},
                {name: "minute_free", type: "INTEGER"},
                {name: "minute_max", type: "INTEGER"},
                {name: "amount_unit", type: "INTEGER"},
                {name: "regdate", type: "TEXT"},
                {name: "is_end", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "car_type",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "car_type_title", type: "TEXT NOT NULL"},
                {name: "minute_unit", type: "INTEGER"},
                {name: "minute_free", type: "INTEGER"},
                {name: "amount_unit", type: "INTEGER"},
                {name: "basic_amount", type: "INTEGER"},
                {name: "basic_minute", type: "INTEGER"}
            ]
        }

    ]
});
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
                {name: "pay_type", type: "INTEGER"},
                {name: "pay_amount", type: "INTEGER"},
                {name: "regdate", type: "TEXT"},
                {name: "return_data", type: "TEXT"},
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
                {name: "car_type_idx", type: "INTEGER"},
                {name: "user_name", type: "TEXT"},
                {name: "mobile", type: "TEXT"},
                {name: "is_stop", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        },
        {
            name: "garage",
            columns: [
                {name: "idx", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT"},
                {name: "start_date", type: "TEXT NOT NULL"},
                {name: "end_date", type: "TEXT"},
                {name: "car_num", type: "INTEGER"},
                {name: "car_name", type: "TEXT"},
                {name: "car_type_idx", type: "TEXT"},
                {name: "minute_unit", type: "INTEGER"},
                {name: "user_name", type: "TEXT"},
                {name: "mobile", type: "TEXT"},
                {name: "is_stop", type: "TEXT NOT NULL DEFAULT 'N'"}
            ]
        }

    ]
});
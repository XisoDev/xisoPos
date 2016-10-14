BEGIN TRANSACTION;
 CREATE TABLE IF NOT EXISTS  "shop_info" (
	`shop_name`	TEXT NOT NULL,
	`mobile`	TEXT NOT NULL,
	`tel`	TEXT,
	`fax`	TEXT,
	`user_name`	TEXT,
	`address`	TEXT
);
 CREATE TABLE IF NOT EXISTS  "payment" (
	`idx`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`lookup_idx`	INTEGER NOT NULL,
	`lookup_type`	TEXT NOT NULL,
	`pay_type`	INTEGER,
	`pay_amount`	INTEGER,
	`regdate`	TEXT,
	`return_data`	TEXT,
	`is_cancel`	TEXT NOT NULL DEFAULT 'N'
);
 CREATE TABLE IF NOT EXISTS  "month" (
	`idx`	INTEGER NOT NULL,
	`start_date`	TEXT NOT NULL,
	`end_date`	TEXT NOT NULL,
	`amount`	INTEGER,
	`car_num`	TEXT,
	`car_name`	TEXT,
	`car_type`	TEXT,
	`user_name`	INTEGER,
	`mobile`	INTEGER,
	`is_stop`	TEXT NOT NULL DEFAULT 'N',
	PRIMARY KEY(`idx`)
);
 CREATE TABLE IF NOT EXISTS  "garage" (
	`idx`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`start_date`	TEXT,
	`end_date`	TEXT,
	`car_num`	TEXT NOT NULL,
	`car_name`	TEXT,
	`car_type_title`	TEXT,
	`minute_unit`	INTEGER,
	`minute_free`	INTEGER,
	`amount_unit`	INTEGER,
	`user_name`	TEXT,
	`mobile`	TEXT,
	`month_idx`	INTEGER,
	`cooper_idx`	INTEGER,
	`discount_month`	INTEGER,
	`discount_cooper`	INTEGER,
	`discount_self`	INTEGER,
	`is_out`	TEXT NOT NULL DEFAULT 'N'
);
 CREATE TABLE IF NOT EXISTS  "cooper" (
	`idx`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`coop_title`	TEXT NOT NULL,
	`coop_tel`	TEXT NOT NULL,
	`coop_address`	TEXT NOT NULL,
	`coop_user_name`	TEXT NOT NULL,
	`minute_unit`	INTEGER NOT NULL DEFAULT 30,
	`minute_free`	INTEGER NOT NULL DEFAULT 0,
	`minute_max`	INTEGER NOT NULL DEFAULT 120,
	`amount_unit`	INTEGER NOT NULL DEFAULT 0,
	`is_stop`	TEXT NOT NULL DEFAULT 'N'
);
 CREATE TABLE IF NOT EXISTS  "car_type" (
	`idx`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`car_type_title`	TEXT NOT NULL,
	`minute_unit`	INTEGER NOT NULL DEFAULT 30,
	`minute_free`	INTEGER NOT NULL DEFAULT 0,
	`amount_unit`	INTEGER,
	`basic_amount`	INTEGER,
	`basic_minute`	INTEGER
);
COMMIT;

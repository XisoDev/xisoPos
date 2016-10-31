xpos.factory('DB', function($q, DB_CONFIG, $cordovaSQLite) {
	var self = this;
	self.db = {};
	self.db.transaction = function(blank){ blank = true; };

	self.init = function() {
		// Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
		if (window.cordova) {
			self.db = $cordovaSQLite.openDB({ name: DB_CONFIG.name, iosDatabaseLocation:'default'});
		}else{
			self.db = window.openDatabase(DB_CONFIG.name, '1', 'database', -1);
		}
		angular.forEach(DB_CONFIG.tables, function(table) {
			var columns = [];

			angular.forEach(table.columns, function(column) {
				columns.push(column.name + ' ' + column.type);
			});

			var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
			self.query(query);
			// console.log('Table ' + table.name + ' initialized');
		});

		// 상점 정보가 없으면 기본 세팅
		self.query('SELECT * FROM shop_info').then(function(res1){
			var res2 = self.fetchAll(res1);
			if(res2.length <= 0){
				self.query("insert into shop_info (shop_name,tel,address) values('화진 S', '051-333-5646', '중구 부평동 3가 62-2.7.8')").then(function(res3){
					console.log('insert shop_info complete!!');
				},function(err){ console.log(err); });
			}
		});

		// 임시
		// self.query("delete from payment");
	};

	self.query = function(query, bindings) {
		bindings = typeof bindings !== 'undefined' ? bindings : [];
		var deferred = $q.defer();

		self.db.transaction(function(transaction) {
			transaction.executeSql(query, bindings, function(transaction, result) {
				deferred.resolve(result);
			}, function(transaction, error) {
				deferred.reject(error);
			});
		});

		return deferred.promise;
	};

	self.fetchAll = function(result) {
		var output = [];

		for (var i = 0; i < result.rows.length; i++) {
			output.push(result.rows.item(i));
		}

		return output;
	};

	self.fetchAllgdate = function(result) {
		var output = [];

		for (var i = 0; i < result.rows.length; i++) {
			output[result.rows.item(i).gdate] = result.rows.item(i);
		}

		return output;
	};

	self.fetch = function(result) {
		if(result.rows.length == 0) return false;
		return result.rows.item(0);
	};

	return self;
})

.factory('ShopInfo', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query('SELECT * FROM shop_info')
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.delete = function() {
		return DB.query('DELETE FROM shop_info');
	};

	self.insert = function(params) {
		return DB.query('INSERT INTO shop_info (shop_name,mobile,tel,fax,user_name,address) VALUES(?,?,?,?,?,?)', [params.shop_name, params.mobile, params.tel, params.fax, params.user_name, params.address]);
	};

	return self;
})

.factory('CarType', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query("SELECT * FROM car_type WHERE is_daycar = 'N'")
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.allDayCar = function(){
		return DB.query("SELECT * FROM car_type WHERE is_daycar = 'Y'")
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.getByIdx = function(idx){
		return DB.query('SELECT * FROM car_type WHERE idx = ?',[idx])
			.then(function(result){
				return DB.fetch(result);
			});
	};

	self.insert = function(params) {
		return DB.query("INSERT INTO car_type (car_type_title,minute_unit,minute_free,amount_unit,basic_amount,basic_minute,is_daycar) VALUES(?,?,?,?,?,?,?)",
			[params.car_type_title, params.minute_unit, params.minute_free, params.amount_unit, params.basic_amount, params.basic_minute, params.is_daycar]);
	};

	self.update = function(params) {
		return DB.query('UPDATE car_type SET car_type_title = ?,minute_unit = ?,minute_free = ?,amount_unit = ?,basic_amount = ?,basic_minute = ? WHERE idx = ?',
			[params.car_type_title, params.minute_unit, params.minute_free, params.amount_unit, params.basic_amount, params.basic_minute, params.idx]);
	};

	self.delete = function(idx) {
		return DB.query('DELETE FROM car_type WHERE idx = ?', [idx]);
	};

	return self;
})

.factory('Garage', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query('SELECT * FROM garage')
			.then(function(result){
				return DB.fetchAll(result);
			});
	};
	
	self.allForHistory = function(limit, offset) {
		var qry = "SELECT gar.*," +
			" (SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = gar.idx AND lookup_type='garage' AND is_cancel = 'N') as pay_amount " +
			" FROM garage gar ORDER BY idx DESC LIMIT ? OFFSET ?";
		return DB.query(qry, [limit, offset])
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.allForCurrent = function(limit, offset) {
		return DB.query("SELECT gar.*, (SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = gar.idx AND lookup_type='garage' AND is_cancel = 'N') as pay_amount FROM garage gar WHERE gar.is_out = 'N' AND gar.is_cancel = 'N' LIMIT ? OFFSET ?",
			[limit, offset])
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.allForCooper = function(params){
		if(params.end_date) {
			return DB.query("SELECT g.*, (select coop_title from cooper where idx=g.cooper_idx) as coop_title FROM garage g WHERE g.is_out = 'Y' AND g.is_cancel = 'N' AND g.start_date >= ? AND g.end_date <= ? AND g.cooper_idx > 0",
				[getStartDate(params.start_date), getEndDate(params.end_date)])
				.then(function (result) {return DB.fetchAll(result);});
		}else{
			return DB.query("SELECT g.*, (select coop_title from cooper where idx=g.cooper_idx) as coop_title FROM garage g WHERE g.is_out = 'Y' AND g.is_cancel = 'N' AND g.start_date >= ? AND g.start_date <= ? and g.cooper_idx > 0",
				[getStartDate(params.start_date), getEndDate(params.start_date)])
				.then(function (result) {return DB.fetchAll(result);});
		}
	};

	self.getInCount = function(params){
		var qry =
		"select date(substr(gar.start_date,1,10), 'unixepoch', 'localtime') as gdate, " +
			"count(*) as inCnt " +
		"from garage gar " +
			"WHERE gar.is_cancel = 'N' " +
			"AND gar.start_date >= ? " +
			// "AND gar.end_date <= ? " +
			"AND gar.month_idx == 0 " +
		"group by date(substr(gar.start_date,1,10), 'unixepoch', 'localtime')";
		return DB.query(qry, [params.start_date])
			.then(function (result) {
				return DB.fetchAllgdate(result);
			});
	};

	self.allForCal = function(params){
		//입차, 출차, 총 매출, 총 할인, 총 미수금
		var qry =
		"SELECT " +
			"count(*) as outCnt, " +
			"date(substr(gar.end_date,1,10), 'unixepoch', 'localtime') as gdate, " +
			"(SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = gar.idx AND lookup_type='garage' AND is_cancel = 'N') as pay_amounts, " +
			"IFNULL(sum(gar.total_amount), 0) as total_amounts, " +
			"IFNULL(sum(gar.discount_cooper), 0) as dc_coopers, " +
			"IFNULL(sum(gar.discount_self), 0) as dc_selfs " +
		"FROM garage gar " +
		"WHERE gar.is_cancel = 'N' " +
			"AND gar.start_date >= ? " +
			"AND gar.end_date <= ? " +
			"AND gar.month_idx == 0 " +
		"GROUP BY date(substr(gar.end_date,1,10), 'unixepoch', 'localtime')";

		return DB.query(qry,[params.start_date, params.end_date])
			.then(function (result) {
				return DB.fetchAllgdate(result);
			});
	};

	self.allTotCal = function(params){
		var qry =
			"SELECT " +
			"(SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_type='month' AND regdate BETWEEN ? AND ? AND is_cancel = 'N') as month_amounts, " +
			"(SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = gar.idx AND lookup_type='garage' AND is_cancel = 'N') as pay_amounts, " +
			"IFNULL(sum(gar.total_amount), 0) as total_amounts, " +
			"IFNULL(sum(gar.discount_cooper), 0) as dc_coopers, " +
			"IFNULL(sum(gar.discount_self), 0) as dc_selfs " +
			"FROM garage gar " +
			"WHERE gar.is_cancel = 'N' " +
			"AND gar.start_date >= ? " +
			"AND gar.end_date <= ? " +
			"AND gar.month_idx == 0 ";
		return DB.query(qry,[params.start_date, params.end_date, params.start_date, params.end_date])
			.then(function (result) {
				return DB.fetch(result);
			});
	};

	//panel 출차목록 및 열람
	self.getCurrentByCarNum = function(car_num) {
		return DB.query("SELECT * FROM garage WHERE is_out = 'N' AND car_num like ?" ,[car_num]).then(function(result){
			return DB.fetchAll(result);
		});
	};

	//출차
	self.outCar = function(garage) {
		return DB.query("UPDATE garage SET is_out = 'Y', end_date = ?, cooper_idx = ?, discount_cooper = ?, discount_self = ?, total_amount = ? WHERE idx = ?",
			[garage.end_date, garage.cooper_idx, garage.discount_cooper, garage.discount_self, garage.total_amount, garage.idx]);
	};

	//입차취소
	self.cancelCar = function(garage) {
		return DB.query("UPDATE garage SET is_cancel = 'Y', is_out = 'Y', end_date = ?, total_amount = 0 WHERE idx = ?",
			[new Date().getTime(), garage.idx]);
	};

	//출차취소
	self.cancelOutCar = function(garage) {
		return DB.query("UPDATE garage SET is_out = 'N', end_date = null, total_amount = 0, cooper_idx = 0, discount_cooper = 0, discount_self = 0 WHERE idx = ?",
			[garage.idx]);
	};


	self.getByIdx = function(idx){
		return DB.query("SELECT gar.*, (SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = gar.idx AND lookup_type='garage' AND is_cancel = 'N') as pay_amount FROM garage gar WHERE gar.idx = ?",[idx])
			.then(function(result){
				return DB.fetch(result);
			});
	};

	self.getByCarNum = function(car_num){
		return DB.query("SELECT * FROM garage WHERE car_num = ? AND is_out = 'N' AND is_cancel = 'N'",[car_num])
			.then(function(result){
				return DB.fetch(result);
			});
	};

	self.insert = function(params) {
		return DB.query('INSERT INTO garage (start_date,car_num,car_type_title,minute_unit,minute_free,amount_unit,basic_amount,basic_minute,month_idx,cooper_idx,discount_cooper,discount_self) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
			[params.start_date, params.car_num, params.car_type_title, params.minute_unit, params.minute_free, params.amount_unit, params.basic_amount, params.basic_minute, params.month_idx, params.cooper_idx, params.discount_cooper, params.discount_self]);
	};
	
	self.updateDayCar = function(garage) {
		return DB.query("UPDATE garage SET car_type_title=?, minute_unit=?, minute_free=?, amount_unit=?, basic_amount=?, basic_minute=? WHERE idx = ?",
			[garage.car_type_title, garage.minute_unit, garage.minute_free, garage.amount_unit, garage.basic_amount, garage.basic_minute, garage.idx]);
	};

	return self;
})

.factory('Month', function(DB) {
	var self = this;

	self.all = function(limit, offset) {
		return DB.query("SELECT mon.*, (SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = mon.idx AND lookup_type='month' AND is_cancel = 'N') as pay_amount FROM month mon ORDER BY idx DESC LIMIT ? OFFSET ?",
		[limit ? limit : 1000, offset ? offset : 0])
			.then(function(result){
				return DB.fetchAll(result);
			});
	};
	self.allPositive = function() {
		return DB.query("SELECT mon.*, (SELECT IFNULL(sum(pay_amount), 0) FROM payment WHERE lookup_idx = mon.idx AND lookup_type='month' AND is_cancel = 'N') as pay_amount FROM month mon WHERE is_stop = 'N' AND end_date > ?", [new Date().getTime()])
			.then(function(result){
				return DB.fetchAll(result);
			});
	};
	self.allForCalendar = function(start, end) {
		var qry = "SELECT * FROM month WHERE (start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?)";
		return DB.query(qry, [Number(start), Number(end), Number(start), Number(end)])
			.then(function(result){
				return DB.fetchAll(result);
			});
	};
	self.getByIdx = function(idx){
		return DB.query('SELECT * FROM month WHERE idx = ?',[idx])
			.then(function(result){
				return DB.fetch(result);
			});
	};

	self.getByCarNum = function(car_num) {
		return DB.query("SELECT * FROM month WHERE car_num like ? AND is_stop='N' AND end_date > ? AND start_date < ?", [car_num+'%', new Date().getTime(), new Date().getTime()])
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.insert = function(params) {
		return DB.query('INSERT INTO month (start_date,end_date,amount,car_num,car_name,car_type_title,user_name,mobile,regdate) VALUES(?,?,?,?,?,?,?,?,?)',
			[params.start_date, params.end_date, params.amount, params.car_num, params.car_name, params.car_type_title, params.user_name, params.mobile, new Date().getTime()]);
	};

	self.update = function(params) {
		// console.log(params);
		return DB.query("UPDATE month SET start_date=?, end_date=?, amount=?, car_num=?, car_name=?, car_type_title=?, user_name=?, mobile=?, is_stop=?, stop_date=? WHERE idx = ?",
			[params.start_date, params.end_date, params.amount, params.car_num, params.car_name, params.car_type_title, params.user_name, params.mobile, params.is_stop, params.stop_date, params.idx]);
	};

	return self;
})

.factory('Cooper', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query('SELECT * FROM cooper')
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.current = function() {
		return DB.query("SELECT * FROM cooper WHERE is_end = 'N'")
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.getByIdx = function(idx){
		return DB.query('SELECT * FROM cooper WHERE idx = ?',[idx])
			.then(function(result){
				return DB.fetch(result);
			});
	};

	self.insert = function(params) {
		return DB.query('INSERT INTO cooper (coop_title, coop_tel, coop_address, coop_user_name, minute_unit, minute_max, amount_unit, regdate) VALUES(?,?,?,?,?,?,?,?)',
			[params.coop_title, params.coop_tel, params.coop_address, params.coop_user_name, params.minute_unit, params.minute_max, params.amount_unit, new Date().getTime()]);
	};

	self.update = function(params) {
		// console.log(params);
		return DB.query("UPDATE cooper SET coop_title=?, coop_tel=?, coop_address=?, coop_user_name=?, minute_unit=?, minute_max=?, amount_unit=?, is_end=? WHERE idx = ?",
			[params.coop_title, params.coop_tel, params.coop_address, params.coop_user_name, params.minute_unit, params.minute_max, params.amount_unit, params.is_end, params.idx]);
	};

	return self;
})
.factory('Payment', function(DB) {
	var self = this;

	self.all = function () {
		return DB.query('SELECT * FROM payment')
			.then(function (result) {
				return DB.fetchAll(result);
			});
	};

	self.allForGarage = function (garage) {
		return DB.query("SELECT * FROM payment WHERE lookup_idx = ? AND lookup_type = 'garage' AND is_cancel = 'N' ORDER BY idx DESC", [garage.idx])
			.then(function (result) {
				return DB.fetchAll(result);
			});
	};

	self.allForMonth = function (month) {
		return DB.query("SELECT * FROM payment WHERE lookup_idx = ? AND lookup_type = 'month' AND is_cancel = 'N' ORDER BY idx DESC", [month.idx])
			.then(function (result) {
				return DB.fetchAll(result);
			});
	};

	self.allForTemp = function () {
		// 최근 20 개만 보여줌
		return DB.query("SELECT * FROM payment WHERE lookup_type = 'temp' AND is_cancel = 'N' ORDER BY idx DESC LIMIT 20 OFFSET 0")
			.then(function (result) {
				return DB.fetchAll(result);
			});
	};

	self.getMonthPayMoney = function(month) {
		return DB.query("SELECT sum(pay_amount) as pay_amount FROM payment WHERE lookup_idx = ? AND lookup_type = 'month' AND is_cancel = 'N' ORDER BY idx DESC", [month.idx])
			.then(function (result) {
				return DB.fetchAll(result);
			});
	};

	self.getByIdx = function (idx) {
		return DB.query('SELECT * FROM payment WHERE idx = ?', [idx])
			.then(function (result) {
				return DB.fetch(result);
			});
	};

	self.insert = function (params) {
		// lookup_type : garage, month, cooper / pay_type : cash, card
		return DB.query('INSERT INTO payment (lookup_idx, lookup_type, pay_type, pay_amount, regdate) VALUES(?,?,?,?,?)',
			[params.lookup_idx, params.lookup_type, params.pay_type, params.pay_amount, new Date().getTime()]);
	};
	
	// 최초로 결제 생성
	self.insertFirst = function(pay) {
		return DB.query("INSERT INTO payment (lookup_idx, lookup_type, pay_type, is_cancel) VALUES(?,?,?,'Y')",
			[pay.lookup_idx, pay.lookup_type, pay.pay_type]);
	};

	// 결제 성공시 업데이트
	self.update = function (params) {
		return DB.query('UPDATE payment SET lookup_idx=?, lookup_type=?, pay_type=?, pay_amount=?, code=?, ret_code=?, success_code=?, success_date=?, is_cancel=?, regdate=? WHERE idx = ?',
			[params.lookup_idx, params.lookup_type, params.pay_type, params.pay_amount, params.code, params.ret_code, params.success_code, params.success_date, params.is_cancel, new Date().getTime(), params.idx ]);
	};

	// 결제 취소시 업데이트
	self.cancelPay = function(pay){
		return DB.query("UPDATE payment SET is_cancel = 'Y', cancel_date = ? WHERE idx = ?",
			[new Date().getTime(), Number(pay.idx)]);
	};

	return self;
});
xpos.factory('DB', function($q, DB_CONFIG, $cordovaSQLite) {
	var self = this;
	self.db = null;

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
			console.log('Table ' + table.name + ' initialized');
		});
		// var qry = 'delete from garage where car_num = "7778"';
		// var qry = 'delete from cooper';
		// self.query(qry);
		// var times = new Date().getTime() - (1000 * 60 * 60 * 2 + 1000 * 60 * 1);
		// var qry = 'update garage set `start_date` = '+times+ ' where car_num="7976"';
		// self.query(qry);
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
		return DB.query('SELECT * FROM car_type')
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
		return DB.query('INSERT INTO car_type (car_type_title,minute_unit,minute_free,amount_unit,basic_amount,basic_minute) VALUES(?,?,?,?,?,?)',
			[params.car_type_title, params.minute_unit, params.minute_free, params.amount_unit, params.basic_amount, params.basic_minute]);
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
	
	self.allForHistory = function() {
		return DB.query("SELECT gar.*, (SELECT sum(pay_amount) FROM payment WHERE lookup_idx = gar.idx AND is_cancel = 'N') as pay_amount FROM garage gar")
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	self.current = function() {
		return DB.query("SELECT * FROM garage WHERE is_out = 'N' AND is_cancel = 'N'")
			.then(function(result){
				return DB.fetchAll(result);
			});
	};

	//출차
	self.outCar = function(garage) {
		return DB.query("UPDATE garage SET is_out = 'Y', end_date = ?, total_amount = ? WHERE idx = ?",
			[garage.end_date, garage.total_amount, garage.idx]);
	};

	//입차취소
	self.cancelCar = function(garage) {
		return DB.query("UPDATE garage SET is_cancel = 'Y', is_out = 'Y', end_date = ?, total_amount = 0 WHERE idx = ?",
			[garage.end_date, garage.idx]);
	};


	self.getByIdx = function(idx){
		return DB.query('SELECT * FROM garage WHERE idx = ?',[idx])
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

	// self.update = function(params) {
	// 	return DB.query('UPDATE car_type SET car_type_title = ?,minute_unit = ?,minute_free = ?,amount_unit = ?,basic_amount = ?,basic_minute = ? WHERE idx = ?',
	// 		[params.car_type_title, params.minute_unit, params.minute_free, params.amount_unit, params.basic_amount, params.basic_minute, params.idx]);
	// };
    //
	// self.delete = function(idx) {
	// 	return DB.query('DELETE FROM car_type WHERE idx = ?', [idx]);
	// };

	return self;
})

.factory('Month', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query('SELECT * FROM month')
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

	self.insert = function(params) {
		return DB.query('INSERT INTO month (start_date,end_date,amount,car_num,car_name,car_type_title,user_name,mobile,regdate) VALUES(?,?,?,?,?,?,?,?,?)',
			[params.start_date, params.end_date, params.amount, params.car_num, params.car_name, params.car_type_title, params.user_name, params.mobile, new Date().getTime()]);
	};

	self.update = function(params) {
		console.log(params);
		return DB.query("UPDATE month SET start_date=?, end_date=?, amount=?, car_num=?, car_name=?, car_type_title=?, user_name=?, mobile=? WHERE idx = ?",
			[params.start_date, params.end_date, params.amount, params.car_num, params.car_name, params.car_type_title, params.user_name, params.mobile, params.idx]);
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

	self.getByIdx = function(idx){
		return DB.query('SELECT * FROM cooper WHERE idx = ?',[idx])
			.then(function(result){
				return DB.fetch(result);
			});
	};

	self.insert = function(params) {
		return DB.query('INSERT INTO cooper (coop_title, coop_tel, coop_address, coop_user_name, minute_unit, minute_free, minute_max, amount_unit, regdate) VALUES(?,?,?,?,?,?,?,?,?)',
			[params.coop_title, params.coop_tel, params.coop_address, params.coop_user_name, params.minute_unit, params.minute_free, params.minute_max, params.amount_unit, new Date().getTime()]);
	};

	self.update = function(params) {
		console.log(params);
		return DB.query("UPDATE cooper SET coop_title=?, coop_tel=?, coop_address=?, coop_user_name=?, minute_unit=?, minute_free=?, minute_max=?, amount_unit=?, is_end=? WHERE idx = ?",
			[params.coop_title, params.coop_tel, params.coop_address, params.coop_user_name, params.minute_unit, params.minute_free, params.minute_max, params.amount_unit, params.is_end, params.idx]);
	};

	return self;
});
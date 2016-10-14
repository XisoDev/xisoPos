xpos.factory('DB', function($q, DB_CONFIG, $cordovaSQLite) {
		var self = this;
		self.db = null;

		self.init = function() {
			// Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
				if (window.cordova) {
					self.db = $cordovaSQLite.openDB(DB_CONFIG.name);
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
			return result.rows.item(0);
		};

		return self;
	})
	// Resource service example
	.factory('Document', function(DB) {
		var self = this;

		self.all = function() {
			return DB.query('SELECT * FROM documents')
				.then(function(result){
					return DB.fetchAll(result);
				});
		};

		self.getById = function(id) {
			return DB.query('SELECT * FROM documents WHERE id = ?', [id])
				.then(function(result){
					return DB.fetch(result);
				});
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
	});
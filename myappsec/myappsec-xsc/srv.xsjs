var cmd = $.request.parameters.get('cmd');
var conn;
var query;
var results;
switch (cmd) {
	case "user":
		if ($.session.hasAppPrivilege("myappsec::user")) {
			$.response.setBody($.session.getUsername());
			$.response.status = $.net.http.OK;
		} else {
			$.response.setBody("Forbidden");
			$.response.status = $.net.http.FORBIDDEN;
		}
		break;
	case "salesorders":
		if ($.session.hasAppPrivilege("myappsec::user")) {
			var dest = $.net.http.readDestination("myappsec", "s4hc");
			var client = new $.net.http.Client();
			var req = new $.web.WebRequest($.net.http.GET,
				"/s4hanacloud/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder" +
				"?$top=3" +
				"&$select=SalesOrder,LastChangeDate,IncotermsLocation1,TotalNetAmount,to_Item/Material,to_Item/NetAmount" +
				"&$filter=TotalNetAmount%20gt%202000" +
				"&$orderby=LastChangeDate%20desc" +
				"&$expand=to_Item"
				);
			req.headers.set("APIKey", "MxCaGtLAykQFybXn3Frf2iWs1HmZyIUU");
			req.headers.set("Accept", "application/json");
			client.request(req, dest);
			var response = client.getResponse();
			$.response.setBody(response.body.asString());
			$.response.status = $.net.http.OK;
		} else {
			$.response.setBody("Forbidden");
			$.response.status = $.net.http.FORBIDDEN;
		}
		break;
	case "sales":
		if ($.session.hasAppPrivilege("myappsec::user")) {
			conn = $.hdb.getConnection();
			query = 'SELECT * FROM "myappsec.db::sales"';
			results = conn.executeQuery(query);
			conn.close();
			$.response.contentType = "text/json";
			$.response.setBody(JSON.stringify(results));
			$.response.status = $.net.http.OK;
		} else {
			$.response.setBody("Forbidden");
			$.response.status = $.net.http.FORBIDDEN;
		}
		break;
	case "session":
		if ($.session.hasAppPrivilege("myappsec::admin")) {
			conn = $.hdb.getConnection();
			query = 'SELECT * FROM M_SESSION_CONTEXT';
			results = conn.executeQuery(query);
			conn.close();
			$.response.contentType = "text/json";
			$.response.setBody(JSON.stringify(results));
			$.response.status = $.net.http.OK;
		} else {
			$.response.setBody("Forbidden");
			$.response.status = $.net.http.FORBIDDEN;
		}
		break;
	case "db":
		if ($.session.hasAppPrivilege("myappsec::admin")) {
			conn = $.hdb.getConnection();
			query = 'SELECT SYSTEM_ID, DATABASE_NAME, HOST, VERSION, USAGE FROM M_DATABASE';
			results = conn.executeQuery(query);
			conn.close();
			$.response.contentType = "text/json";
			$.response.setBody(JSON.stringify(results));
			$.response.status = $.net.http.OK;
		} else {
			$.response.setBody("Forbidden");
			$.response.status = $.net.http.FORBIDDEN;
		}
		break;
	default:
		$.response.setBody('Invalid Command: ' + cmd);
		$.response.status = $.net.http.OK;
}
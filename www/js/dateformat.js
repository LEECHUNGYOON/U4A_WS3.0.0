(function(){
	"use strict";
	
	String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
	String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
	Number.prototype.zf = function (len) { return this.toString().zf(len); };

	Date.prototype.format = function (f) {

		if (!this.valueOf()) return " ";

		var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
			weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"],
			weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			d = this;

		return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
			
			var h = "";
			
			switch ($1) {
				
				case "yyyy": return d.getFullYear(); // 년 (4자리)

				case "yy": return (d.getFullYear() % 1000).zf(2); // 년 (2자리)

				case "MM": return (d.getMonth() + 1).zf(2); // 월 (2자리)

				case "dd": return d.getDate().zf(2); // 일 (2자리)

				case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)

				case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)

				case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)

				case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)

				case "HH": return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)

				case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)

				case "mm": return d.getMinutes().zf(2); // 분 (2자리)

				case "ss": return d.getSeconds().zf(2); // 초 (2자리)

				case "a/p": return d.getHours() < 12 ? "AM" : "PM"; // 오전/오후 구분

				default: return $1;

			}

		});

};

})();
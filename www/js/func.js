var weeks = new Array('일', '월', '화', '수', '목', '금', '토');
var weeksLong = new Array('일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일');

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function formatted_date(date)
{
    // date = createDateAsUTC(date);

    var result="";
    result += date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate() +
        " "+ pad(date.getHours(),2)+ ":" +pad(date.getMinutes(),2)+":"+
        pad(date.getSeconds(),2);
    return result;
}

function cal_garage(garage) {
    var result_charge = 0;

    var oneSecond = 1000;
    var oneMinute = oneSecond * 60;

    // ((최종 차량 주차시간 - 최초 무료시간 - 기본시간) / 추가요금단위_올림) * 추가요금 + 기본요금
    var park_min = Math.floor((garage.end_date - garage.start_date) / oneMinute);  // 주차한 시간 (분)
    var free_min = onum(garage.minute_free); // 최초 무료시간 (분)
    var basic_min = onum(garage.basic_minute); // 기본시간 (분)

    // 무료시간을 초과했으면
    if(park_min - free_min > 0){

        //기본 시간을 초과했으면 추가 요금도 부과한다 : (이용시간 / 추가요금 단위) * 추가요금 + 기본료
        if(park_min - free_min - basic_min > 0){
            //추가 시간을 추가요금 단위로 나눈다
            var added_min = Math.ceil((park_min - free_min - basic_min) / onum(garage.minute_unit));
            result_charge = onum(garage.basic_amount) + (added_min * onum(garage.amount_unit));
        }
        //기본 시간 이내에 나갈경우
        else{
            //기본 요금만 부과한다
            result_charge = onum(garage.basic_amount);
        }
    }

    return result_charge;
}

function cal_cooper(garage, cooper) {
    var result = {
        total_amount : 0,
        discount_cooper : 0
    };

    var oneSecond = 1000;
    var oneMinute = oneSecond * 60;

    var park_min = Math.floor((garage.end_date - garage.start_date) / oneMinute);  // 주차한 시간 (분)
    var max_min = cooper.minute_max;

    var garageCharge = 0;

    // 주차한 시간이 업체에서 제공하는 시간을 넘으면
    if(park_min > max_min){
        // 40분일때 30분당 500원 ( 40 / 30 * 500)
        result.discount_cooper = Math.ceil(onum(cooper.minute_max) / onum(cooper.minute_unit)) * onum(cooper.amount_unit);
        result.total_amount = result.discount_cooper;

        park_min = park_min - onum(cooper.minute_max);  // 주차한 시간 = 주차한 시간 - 최대제공시간
        result.total_amount += (Math.ceil(park_min / onum(garage.minute_unit)) * onum(garage.amount_unit));
    }else{
        result.discount_cooper = Math.ceil(onum(park_min) / onum(cooper.minute_unit)) * onum(cooper.amount_unit);
        result.total_amount = result.discount_cooper;
    }

    return result;
}

function getStartDate(dt){
    // dt = createDateAsUTC(dt);
    var month = dt.getMonth()+1;
    var day = dt.getDate();
    var year = dt.getFullYear();

    return new Date(month+'-'+day+'-'+year).getTime();  //00시 00분 00초로 맞춤
}
function getEndDate(dt){
    // dt = createDateAsUTC(dt);
    var oneSecond = 1000;
    var oneMinute = oneSecond * 60;
    var oneHour = oneMinute * 60;

    var month = dt.getMonth()+1;
    var day = dt.getDate();
    var year = dt.getFullYear();

    var last_date = new Date(month+'-'+day+'-'+year).getTime();
    last_date = last_date + (oneHour * 23) + (oneMinute * 59) + (oneSecond * 59) + 999;   //23시 59분 59초로 맞춤

    return last_date;
}

function getStartEndDate(dt){
    // dt = createDateAsUTC(dt);
    if(!dt) dt = new Date();
    var result = {};
    result.start_date = new Date(dt.getFullYear(), dt.getMonth(), 1);
    var temp_ed = new Date(dt.getFullYear(), dt.getMonth()+1, 0);
    result.end_date = new Date(getEndDate(temp_ed));

    return result;
}

function getHanDate(millisec){
    var date = new Date(millisec);
    var result = date.getFullYear() +"년 "+ pad((date.getMonth()+1), 2) +"월 "+ pad(date.getDate(),2) + "일 "+ weeksLong[date.getDay()];
    return result;
}

function getHanTime(millisec){
    var date = new Date(millisec);
    var result = pad(date.getHours(),2)+ "시 " +pad(date.getMinutes(),2)+ "분";
    return result;

}

function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}

function convertDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

function onum(str){
    var result = Number(str);
    if(isNaN(result)) result = 0;
    return result;
}

// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.num_format = function(){
    if(this==0) return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.num_format = function(){
    var num = parseFloat(this);
    if( isNaN(num) ) return "0";

    return num.num_format();
};
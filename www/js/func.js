function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function formatted_date(date)
{
    var result="";
    result += date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate() +
        " "+ date.getHours()+":"+date.getMinutes()+":"+
        date.getSeconds();
    return result;
}

function cal_garage(garage) {
    var result_charge = 0;

    var oneSecond = 1000;
    var oneMinute = oneSecond * 60;

    // ((최종 차량 주차시간 - 최초 무료시간 - 기본시간) / 추가요금단위_올림) * 추가요금 + 기본요금
    var park_min = Math.floor((garage.end_date - garage.start_date) / oneMinute);  // 주차한 시간 (분)
    var free_min = Number(garage.minute_free); // 최초 무료시간 (분)
    var basic_min = Number(garage.basic_minute); // 기본시간 (분)

    // 무료시간을 초과했으면
    if(park_min - free_min > 0){

        //기본 시간을 초과했으면 추가 요금도 부과한다 : (이용시간 / 추가요금 단위) * 추가요금 + 기본료
        if(park_min - free_min - basic_min > 0){
            //추가 시간을 추가요금 단위로 나눈다
            var added_min = Math.ceil((park_min - free_min - basic_min) / Number(garage.minute_unit));
            result_charge = Number(garage.basic_amount) + (added_min * Number(garage.amount_unit));
        }
        //기본 시간 이내에 나갈경우
        else{
            //기본 요금만 부과한다
            result_charge = Number(garage.basic_amount);
        }
    }

    return result_charge;
}

function getStartDate(dt){
    var month = dt.getMonth()+1;
    var day = dt.getDate();
    var year = dt.getFullYear();

    return new Date(month+'-'+day+'-'+year).getTime();  //00시 00분 00초로 맞춤
}
function getEndDate(dt){
    var oneSecond = 1000;
    var oneMinute = oneSecond * 60;
    var oneHour = oneMinute * 60;

    var month = dt.getMonth()+1;
    var day = dt.getDate();
    var year = dt.getFullYear();

    var last_date = new Date(month+'-'+day+'-'+year).getTime();
    last_date = last_date + (oneHour * 23) + (oneMinute * 59) + (oneSecond * 59);   //23시 59분 59초로 맞춤

    return last_date;
}
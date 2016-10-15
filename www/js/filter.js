xpos
.filter('millSecondsToTimeString', function() {
    return function(millseconds) {
        var oneSecond = 1000;
        var oneMinute = oneSecond * 60;
        var oneHour = oneMinute * 60;
        var oneDay = oneHour * 24;

        var seconds = Math.floor((millseconds % oneMinute) / oneSecond);
        var minutes = Math.floor((millseconds % oneHour) / oneMinute);
        var hours = Math.floor((millseconds % oneDay) / oneHour);
        var days = Math.floor(millseconds / oneDay);

        var timeString = '';
        if (days !== 0) {
            timeString += days + ' 일 ';
        }
        if (hours !== 0) {
            timeString += hours + ' 시간 ';
        }
        if (minutes !== 0) {
            timeString += minutes + ' 분 ';
        }
        if (seconds !== 0 || millseconds < 1000) {
            timeString += seconds + ' 초 ';
        }
        // if (days !== 0) {
        //     timeString += (days !== 1) ? (days + ' days ') : (days + ' day ');
        // }
        // if (hours !== 0) {
        //     timeString += (hours !== 1) ? (hours + ' hours ') : (hours + ' hour ');
        // }
        // if (minutes !== 0) {
        //     timeString += (minutes !== 1) ? (minutes + ' minutes ') : (minutes + ' minute ');
        // }
        // if (seconds !== 0 || millseconds < 1000) {
        //     timeString += (seconds !== 1) ? (seconds + ' seconds ') : (seconds + ' second ');
        // }

        return timeString;
    };
})
.filter('passTime', function() {
    return function(millseconds) {

        var parkSeconds = new Date().getTime() - millseconds;

        var oneSecond = 1000;
        var oneMinute = oneSecond * 60;
        var oneHour = oneMinute * 60;
        var oneDay = oneHour * 24;

        var seconds = Math.floor((parkSeconds % oneMinute) / oneSecond);
        var minutes = Math.floor((parkSeconds % oneHour) / oneMinute);
        var hours = Math.floor((parkSeconds % oneDay) / oneHour);
        var days = Math.floor(parkSeconds / oneDay);

        var timeString = '';
        if (days !== 0) {
            timeString += days + ' 일 ';
        }
        if (hours !== 0) {
            timeString += hours + ' 시간 ';
        }
        if (minutes !== 0) {
            timeString += minutes + ' 분 ';
        }
        // if (seconds !== 0 || curSeconds < 1000) {
        //     timeString += seconds + ' 초 ';
        // }

        return timeString;
    };
})
.filter('calcu', function() {
    return function(garage) {
        var result_charge = 0;

        var oneSecond = 1000;
        var oneMinute = oneSecond * 60;

        // ((최종 차량 주차시간 - 최초 무료시간 - 기본시간) / 추가요금단위_올림) * 추가요금 + 기본요금
        var park_min = Math.floor((new Date().getTime() - garage.start_date) / oneMinute);  // 주차한 시간 (분)
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
    };
});
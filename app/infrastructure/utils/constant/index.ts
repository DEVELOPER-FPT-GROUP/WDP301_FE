export const EVENT_SCOPE = {
    PRIVATE: 'PRIVATE',
    HOUSE_HOLD: 'HOUSE_HOLD',
    BRANCH: 'BRANCH',
    FAMILY: 'FAMILY',
}

export const EVENT_TYPE = {
    BIRTHDAY: 'BIRTHDAY',
    DEATH: 'DEATH',
    MARRIAGE: 'MARRIAGE',
    PARTY: 'PARTY',
    MEETING: 'MEETING',
    ANNIVERSARY: 'ANNIVERSARY',
    OTHER: 'OTHER',
}

export const convertStatus = (status: string) => {
    switch (status) {
        case 'Accepted': return {
            color: 'green',
            text: 'Đã xác nhận',
        };
        case 'Declined': return {
            color: 'red',
            text: 'Từ chối'
        };
        case 'Pending': return {
            color: 'yellow',
            text: 'Đang đợi'
        };
        default: return {
            color: 'gray',
            text: 'Không'
        };
    }
}

export const convertRecurrence = (recurrence: string) => {
    switch (recurrence) {
        case 'YEARLY': return 'Năm';
        case 'MONTHLY': return 'Tháng';
        case 'WEEKLY': return 'Tuan';
        case 'DAILY': return 'Ngày';
        default: return 'Không';
    }
}
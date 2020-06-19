const redisKeyPrefix = 'purr:metrics';

const prefix = 'purr_';
const names = {
  checksScheduled: 'checks_scheduled',
  checksSuccessfulTotal: 'checks_successful_total',
  checksFailedTotal: 'checks_failed_total',
  checkDurationSeconds: 'check_duration_seconds',
  checkWaitTimeSeconds: 'check_wait_time_seconds',

  reportCheckSuccess: `report_check_success`,
  reportCheckForbiddenCookies: `report_check_forbidden_cookies`,
  reportCheckStart: `report_check_start_date`,
  reportCheckEnd: `report_check_end_date`,
  reportCheckLastStep: `report_check_last_step`,
};

module.exports = { prefix, names, redisKeyPrefix };

import { environment } from '../../environments/environment'
// export const API_DOMAIN = 'http://10.0.100.129:8090';
export const API_DOMAIN = environment.url;

export const DASHBOARD_STATS = '/api/v1/dashboard/stats';

//User's auth apis
export const USER_LOGIN = '/api/v1/login';
export const USER_REGISTER = '/api/v1/register';
export const USER_LOGOUT = '/api/v1/logout';
export const REGISTER_COMPANY = '/api/v1/register_companies';
export const FORGOT_PASSWORD = API_DOMAIN + '/api/v1/password/forgot';
export const VERIFY_PASSWORD_TOKEN = API_DOMAIN + '/api/v1/password/verifyToken';
export const RESET_PASSWORD_TOKEN = API_DOMAIN + '/api/v1/password/reset';
export const CHANGE_PASSWORD = API_DOMAIN + '/api/v1/changePassword';
export const TICKETS = API_DOMAIN + '/api/v1/tickets';

//User's CRD apis
export const CREATE_USER = '/api/v1/users';
export const DELETE_USER = '/api/v1/users';
export const GET_USERS = '/api/v1/users';
export const SHOW_USER = '/api/v1/users';

//Subscriptions's CRD apis
export const DELETE_SUBSCRIPTIONS = '/api/v1/subscriptions-manage';
export const GET_SUBSCRIPTIONS = '/api/v1/subscriptions-manage';
export const SHOW_SUBSCRIPTIONS = '/api/v1/subscriptions-manage';

//Sub-User's CRD apis
export const CREATE_SUB_USER = '/api/v1/sub_users';
export const DELETE_SUB_USER = '/api/v1/sub_users';
export const GET_SUB_USERS = '/api/v1/sub_users';
export const SHOW_SUB_USER = '/api/v1/sub_users';

//Company's CRUD apis
export const CREATE_COMPANY = '/api/v1/companies';
export const DELETE_COMPANY = '/api/v1/companies';
export const SHOW_COMPANY = '/api/v1/companies';
export const GET_COMPANIES = '/api/v1/companies';
export const UPDATE_COMPANY = '/api/v1/companies';
export const COMPANY_USER_URL = '/api/v1/companies/:id/users';
export const COMPANY_OFFICES_URL = '/api/v1/companies/:id/offices';

//Office's CRUD apis
export const OFFICE_URL = '/api/v1/offices';

//Zone's CRUD apis
export const ZONE_URL = '/api/v1/zones';

//Lock's CRUD apis
export const LOCK_URL = '/api/v1/locks';
export const LOCKED_DEVICES_URL = '/api/v1/companies/:id/devices/locked';
export const UNLOCKED_DEVICES_URL = '/api/v1/companies/:id/devices/unlocked';
export const HUB_LOCKS_URL = '/api/v1/getHubLocks/';
export const CAMERA_CHANGE_NAME = '/api/v1/updateCameraName';
export const SCHEDULE_USER_URL = '/api/v1/getScheduleUser'
export const DEFAULT_LOCK_URL = '/api/v1/setLockDefault'

//Vendor's CRUD apis
export const VENDOR_URL = '/api/v1/vendors';

//Device's CRUD apis
export const DEVICE_URL = '/api/v1/devices';

//Assign Device api
export const ASSIGN_DEVICE_URL = '/api/v1/company_devices';

//Device User CRUD apis
export const DEVICE_USER_URL = '/api/v1/device_users';
export const GENERATE_DEVICE_USER_ID_URL = '/api/v1/generateDeviceUserId';
export const SHARE_CREDENTIAL_URL = '/api/v1/shareCredential';
export const ENROLL_DEVICE_USER_URL = '/api/v1/enrollDeviceUser';
export const ZONE_LOCKS = '/api/v1/zoneDevicesHavingLocks/';
//Unlock door Apis
export const COMPANIES_HAVING_LOCKS = '/api/v1/companiesHavingLocks';
export const COMPANY_OFFICES_HAVING_LOCKS = '/api/v1/companyOfficesHavingLocks/';
export const OFFICE_ZONES_HAVING_LOCKS = '/api/v1/officeZonesHavingLocks/';
export const ZONE_DEVICES_HAVING_LOCKS = '/api/v1/zoneDevicesHavingLocks/';
export const LIST_DEVICES_MAC = '/api/v1/listDevicesMacs';

export const USER_URL = '/api/v1/users';
export const USER_PROFILE_URL = API_DOMAIN + '/api/v1/updateProfile';
export const COMPANY_USER_SEARCH_URL = '/api/v1/companies/:id/users';


//Groups CRUD api
export const CREATE_GROUP = '/api/v1/groups';
export const DELETE_GROUP = '/api/v1/groups';
export const GET_GROUPS = '/api/v1/groups';
export const SHOW_GROUP = '/api/v1/groups';

//Packages CRUD api
export const CREATE_PACKAGES = '/api/v1/packages';
export const DELETE_PACKAGES = '/api/v1/packages';
export const GET_PACKAGES = '/api/v1/packages';
export const SHOW_PACKAGES = '/api/v1/packages';
export const GET_LICENSE_PRICE = '/api/v1/license_price/get';
export const GET_SUBSCRIPTION_PACKAGES = '/api/v1/getPackagesForSubscription';
export const UPDATE_LICENSE_PRICE = '/api/v1/license_price/update';

//Subscription api
export const ADD_PAYPAL_PLAN = '/api/v1/addPaypalPlan';
export const ADD_SUBSCRIPTION = '/api/v1/addSubscription';
export const ADD_SCHEDULE = '/api/v1/addForteSchedule';

//sCHEDULES CRUD api
export const CREATE_SCHEDULE = '/api/v1/schedules';
export const DELETE_SCHEDULE = '/api/v1/schedules';
export const GET_SCHEDULES = '/api/v1/schedules';
export const SHOW_SCHEDULE = '/api/v1/schedules';

//Permissions
export const PERMISSIONS = '/api/v1/roles/:id/permissions';

//ScheduleUserDevice
export const SCHEDULE_USER_DEVICE_URL = '/api/v1/schedule_user_device';
export const SCHEDULE_LOCK_URL = '/api/v1/schedule_lock';

//History
export const GET_HISTORY = '/api/v1/history';
export const ADD_HISTORY = '/api/v1/history/add';
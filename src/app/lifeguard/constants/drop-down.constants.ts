export const COMPANIES = [
    {"id":1,"name":"Neosoft"},
    {"id":2,"name":"Microsoft"},
    {"id":3,"name":"Google"},
    {"id":4,"name":"Oracle"},
    {"id":5,"name":"LNT"},
    {"id":6,"name":"Apple"},
    {"id":7,"name":"Oneplus"},
    {"id":8,"name":"TCS"},
    {"id":9,"name":"Dell"},
    {"id":10,"name":"Acer"}
];

export const OFFICES =  [
    {"id":1,"name":"Rabale"},
    {"id":2,"name":"Airoli"},
    {"id":3,"name":"Dadar"},
    {"id":4,"name":"Malad"},
    {"id":5,"name":"Thane"},
    {"id":6,"name":"Mahape"},
    {"id":7,"name":"Andheri"},
    {"id":8,"name":"Bandra"},
];

export const LOCKS = [
    {"id":1,"name":"Lock1"},
    {"id":2,"name":"Lock2"},
    {"id":3,"name":"Lock3"},
    {"id":4,"name":"Lock4"},
    {"id":5,"name":"Lock5"},
    {"id":6,"name":"Lock6"},
];

export const ZONES = [
    {"id":1,"name":"php"},
    {"id":2,"name":"ror"},
    {"id":3,"name":"designer"},
    {"id":4,"name":"zone1"},
    {"id":5,"name":"zone2"},
    {"id":6,"name":"zone3"},
];

export const ROLES = [
  {"id":1,"name":"Super Admin"},
  {"id":2,"name":"System Admin"},
  {"id":3,"name":"Company User"}
];
export const LOCK_TYPES = [
    {"id":1,"name":"Normal"},
    {"id":2,"name":"Enrollment"},
]

export const LOCK_TYPE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Type",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No Type Found.'
};

export const COMPANY_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Company",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No Company Found.'
};

export const PACKAGE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Package",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No Package Found.'
};

export const SCHEDULE_TYPE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Schedule Type",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No Type Found.'
};

export const VENDOR_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text: "Select Vendor",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No Vendor Found.'
};

export const LOCK_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Lock",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Lock Found.'
};

export const LOCK_DROPDOWN_MULTI_SETINGS = {
    singleSelection: false,
    labelKey:'device_name',
    text:"Select Lock",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:10,
    noDataLabel: 'No Lock Found.'
};

export const GROUP_DROPDOWN_MULTI_SETTINGS = {
    singleSelection: false,
    labelKey:'name',
    text:"Select Group",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:10,
    noDataLabel: 'No Group Found.'
};

export const OFFICE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Office",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Office Found.'
};

export const MULTI_OFFICE_DROPDOWN_SETINGS = {
    singleSelection: false,
    labelKey:'name',
    text:"Select Offices",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:10,
    noDataLabel: 'No Office Found.'
};


export const DEVICE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'device_name',
    text:"Select Device",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Device Found.'
};
export const ENROLL_DEVICE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'device_name',
    text:"Select Enrollment Device",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Device Found.'
};
export const DEVICE_DROPDOWN_MODEL_SETINGS = {
    singleSelection: true,
    labelKey:'model_name',
    text:"Select Device",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Device Found.'
};

export const MANAGE_DEVICE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'mac',
    text:"Select Device",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Device Found.'
};

export const ZONE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Zone",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Zone Found.'
};

export const MULTI_ZONE_DROPDOWN_SETINGS = {
    singleSelection: false,
    labelKey:'name',
    text:"Select Zone",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:10,
    noDataLabel: 'No Zone Found.'
};

export const ENROLL_MODE_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'label',
    text:"Select Enroll Mode",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3,
    noDataLabel: 'No Enroll Mode Found.'
};

export const ENROLL_FINGER_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'label',
    text:"Select Finger Count",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    badgeShowLimit:3
};

export const PERMISSION_DROPDOWN_SETTINGS = {
    singleSelection: false,
    labelKey:'name',
    text:"Select Permissions",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
};

export const GROUP_USER_DROPDOWN_SETTINGS = {
    singleSelection: false,
    labelKey:'name',
    text:"Select Users",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
};
export const ROLE_SETTINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Role",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,
};

export const DEVICE_TYPE_SETTINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Device Type",
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,
};

export const USER_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select User",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No User Found.'
};

export const Reader_DROPDOWN_SETINGS = {
    singleSelection: true,
    labelKey:'name',
    text:"Select Config",
    enableSearchFilter: true,
    classes:"myclass custom-class",
    // badgeShowLimit:3,,
    noDataLabel: 'No Config Found.'
};
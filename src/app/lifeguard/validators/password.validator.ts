import { AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

export function ValidateUrl(userFormGroup: FormGroup) {
    let password = userFormGroup.controls.password.value;
    let repeatPassword = userFormGroup.controls.repeatPassword.value;

    if (repeatPassword.length <= 0) {
        return null;
    }

    if (repeatPassword !== password) {
        return {
            doesMatchPassword: true
        };
    }

    return null;
}
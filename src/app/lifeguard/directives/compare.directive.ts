// https://medium.com/front-end-hacking/how-to-implement-custom-validator-confirm-password-in-angular2-rc-3-622288ba809d
import { Directive, Attribute } from '@angular/core';
import { Validator, NG_VALIDATORS, FormControl } from '@angular/forms';

@Directive({
  selector: '[compare]',
  providers: [{ provide: NG_VALIDATORS, useExisting: CompareDirective, multi: true }]
})
export class CompareDirective implements Validator {

  constructor(@Attribute('compare') public comparer: string,
    @Attribute('reverse') public reverse: string) { }

  validate(c: FormControl): { [key: string]: any } {
    const e = c.root.get(this.comparer);

    // value not equal in verify control
    if (e && c.value !== e.value && !this.isReverse) {
      return { 'compare': false };
    }

    // user typing in password and match
    if (e && c.value === e.value && this.isReverse) {
      if (e.errors) {
        delete e.errors['compare'];
        delete c.errors['compare'];
        if (!Object.keys(e.errors).length) { e.setErrors(null); }
        if (!Object.keys(c.errors).length) { c.setErrors(null); }
      }
    }

    // user typing in password and mismatch
    if (e && c.value !== e.value && this.isReverse) {
      e.setErrors({ 'compare': true });
    }
  }

  private get isReverse() {
    if (!this.reverse) {
      return false;
    }

    return this.reverse === 'true' ? true : false;
  }

}

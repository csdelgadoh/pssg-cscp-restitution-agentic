import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FormBase } from './form-base';

@Component({
  selector: 'app-address-host',
  template: `<span id="addr" [innerHTML]="html"></span>`,
  standalone: false
})
class AddressHostComponent extends FormBase {
  html = '';
}

describe('Address rendering through [innerHTML] (VULN-001-AC3)', () => {
  const fields = ['line1', 'line2', 'city', 'province', 'country', 'postalCode'];

  fields.forEach((field) => {
    it(`shows <b>x</b> typed in ${field} as text, not as markup`, () => {
      TestBed.configureTestingModule({ declarations: [AddressHostComponent] });
      const fixture = TestBed.createComponent(AddressHostComponent);
      const host = fixture.componentInstance;

      const group: Record<string, UntypedFormControl> = {};
      fields.forEach((f) => (group[f] = new UntypedFormControl('x')));
      group[field].setValue('<b>x</b>');
      host.form = new UntypedFormGroup({ address: new UntypedFormGroup(group) });

      host.html = host.displayMailingSubAddress('address');
      fixture.detectChanges();

      const span: HTMLElement = fixture.nativeElement.querySelector('#addr');
      expect(span.querySelector('b')).toBeNull();
      expect(span.textContent).toContain('<b>x</b>');
    });
  });
});

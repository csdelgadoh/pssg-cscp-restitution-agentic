import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FormBase } from './form-base';

describe('FormBase.displayMailingSubAddress', () => {
  const fields = ['line1', 'line2', 'city', 'province', 'country', 'postalCode'];

  function build(values: Record<string, string>): FormBase {
    const base = new FormBase();
    const group: Record<string, UntypedFormControl> = {};
    fields.forEach((f) => (group[f] = new UntypedFormControl(values[f] ?? '')));
    base.form = new UntypedFormGroup({ address: new UntypedFormGroup(group) });
    return base;
  }

  const tagsIn = (html: string) => html.match(/<[^>]*>/g) ?? [];

  fields.forEach((field) => {
    it(`encodes HTML typed in ${field} (VULN-001-AC1, AC2)`, () => {
      const values: Record<string, string> = {};
      fields.forEach((f) => (values[f] = 'x'));
      values[field] = '<b>x</b>';

      const out = build(values).displayMailingSubAddress('address');

      expect(out).toContain('&lt;b&gt;x&lt;/b&gt;');
      expect(tagsIn(out).every((t) => t === '<br />')).toBe(true);
    });
  });

  it('encodes quotes and ampersands (VULN-001-AC1)', () => {
    const out = build({ line1: `"a" & 'b'` }).displayMailingSubAddress('address');
    expect(out).toContain('&quot;a&quot; &amp; &#39;b&#39;');
  });

  it('keeps a normal address and skips empty fields (VULN-001-AC5)', () => {
    const out = build({
      line1: '123 Main St',
      city: 'Victoria',
      province: 'BC',
      country: 'Canada',
      postalCode: 'V8V 1A1'
    }).displayMailingSubAddress('address');

    expect(out).toBe('123 Main St<br />Victoria<br />BC<br />Canada<br />V8V 1A1');
  });
});

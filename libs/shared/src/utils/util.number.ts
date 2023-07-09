import _ from 'lodash';

export class NumberUtils {
  static toMoney(text = 0, digit = 0) {
    // format number to money format (ex: 1000000 => 1,000,000)
    const re = '\\d(?=(\\d{3})+' + (digit > 0 ? '\\.' : '$') + ')';

    return text
      .toFixed(Math.max(0, ~~digit))
      .replace(new RegExp(re, 'g'), '$&,');
  }

  static abbreviateNumber(values: number[]) {
    const max = _.max(values) || 0;
    let min = max / 6;

    const suffixes = ['', `${'Ngàn'}`, `${'Triệu'}`, `${'Tỷ'}`, `${'Ngàn tỷ'}`];
    let suffixNum = 0;
    while (min >= 1000) {
      min /= 1000;
      suffixNum++;
    }

    const result =
      suffixNum > 0
        ? values.map((d) => {
            return (d / Math.pow(1000, suffixNum)).toPrecision(3);
          })
        : values;

    return { data: result, suffix: suffixes[suffixNum] };
  }
}

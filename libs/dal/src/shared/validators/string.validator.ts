import {
  isAlphanumeric,
  isEmail,
  isPhoneNumber,
  isStrongPassword,
  matches,
} from 'class-validator';

export namespace StringValidator {
  export const code = (message = 'Mã không hợp lệ') => {
    return {
      validator: function (v: string) {
        return isAlphanumeric(v);
      },
      message: message,
    };
  };

  export const username = (message = 'Tên đăng nhập không hợp lệ') => {
    return {
      validator: function (v: string) {
        return matches(
          v,
          /^(?=.{5,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
        );
      },
      message: message,
    };
  };

  export const password = (message = 'Mật khẩu không hợp lệ') => {
    return {
      validator: function (v: string) {
        return isStrongPassword(v, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        });
      },
      message: message,
    };
  };

  export const email = (message = 'Email không hợp lệ') => {
    return {
      validator: function (v: string) {
        return isEmail(v);
      },
      message: message,
    };
  };

  export const phone = (message = 'Số điện thoại không hợp lệ') => {
    return {
      validator: function (v: string) {
        return isPhoneNumber(v, 'VN');
      },
      message: message,
    };
  };
}

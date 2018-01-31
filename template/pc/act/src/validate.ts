class Validation {
    /**
     * 检验输入值是否为空
     * @param {string} val 
     */
    checkEmpty(val: string): boolean {
        const reg: RegExp = /\S/;
        return !reg.test(val) ? false : true;
    }

    /**
     * 检验手机号
     * @param {string} val - {
     * 移动号段：
     * 134 135 136 137 138 139 147 150 151 152 157 158 159 172 178 182 183 184 187 188
     * 联通号段：
     * 130 131 132 145 155 156 171 175 176 185 186
     * 电信号段：
     * 133 149 153 173 177 180 181 189
     * 虚拟运营商:
     * 170
     * }
     */
    checkPhone(val: string): boolean {
        const reg: RegExp = /^(13[0-9]|14[579]|15[0-35-9]|17[01235678]|18[0-9])[0-9]{8}$/;
        return !reg.test(val) ? false : true;
    }

    /**
     * 检验是否为纯数字
     * @param {string} val 
     */
    checkPureNum(val: string): boolean {
        let reg: RegExp = /^[0-9]*$/;
        return !reg.test(val) ? false : true;
    }

    /**
     * 大于等于0的整数或者小数
     * @param {any} val 
     */
    checkAmountNum(val) {
        let reg = /^(0|0\.\d+|[1-9](\.\d+)?(\d+)?(\.\d+)?)$/g;
        return !reg.test(val) ? false : true;
    }

    /**
     * 检验val的值的长度是否与len相等
     * @param {string} val - 值
     * @param {number} len - 长度
     */
    checkLengthEqual(val: string, len: number): boolean {
        return val.length !== len ? false : true;
    }

    /**
     * 检验val的长度是否在min和max之间
     * @param {string} val - 值
     * @param {number} min - 最小长度
     * @param {number} max - 最大长度
     */
    checkLength(val: string, min: number, max: number): boolean {
        if (max === undefined) {
            return (val.length < min) ? false : true;
        }
        return (val.length < min || val.length > max) ? false : true;
    }

    /**
     * 格式化千分位
     * @param {number} val - 值
     */
    formatThousandth(val: string): string {
        let reg: RegExp = /(\d)(?=(\d{3})+(?:\.\d+)?$)/g;
        if (!!val) {
            return val.replace(reg, '$1,');
        } else {
            return val;
        }
    }

    /**
     * 将千分位的','去掉
     * @param {number} val - 值
     */
    parseThousandth(val: string): string {
        return val.replace(/,/g, '');
    }

    /**
     * 检验身份证号
     * @param {number} val - 值
     */
    checkCardID(val: string): boolean {
        let reg: RegExp = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        return !reg.test(val) ? false : true;
    }

    /**
     * 校验银行卡号
     * @param {number} val - 银行卡 
     */
    checkBankCard(val: string): boolean {
        let reg: RegExp = /^\d{16}|\d{19}$/;
        return !reg.test(val) ? false : true;
    }

    /**
     * 校验邮箱
     * @param val 邮箱
     */
    checkEmail(val: string): boolean {
        let reg: RegExp = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return !reg.test(val) ? false : true;
    }

    /**
     * 检验密码
     * @param {string} val - 密码字符串，由6-16位的数字和字母混合组成
     */

    checkPassword(val: string): boolean {
        let reg: RegExp = /^(?![^a-zA-Z]+$)(?!\D+$).{6,16}$/g;
        return !reg.test(val) ? false : true;
    }

    /**
     * 校验中文名
     * @param val 中文
     */
    checkUserName(val: string): boolean {
        let reg: RegExp = /^[\u4E00-\u9FA5\·\.]+$/g;
        return reg.test(val) ? true : false;
    }

}

const validate = new Validation;

export { validate };
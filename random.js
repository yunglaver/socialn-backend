import crypto from 'crypto';

export function randomNumber(length) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, x => (x % 10)).join('');
}

export function randomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

export function hash(password) {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
}



declare module 'crypto-js' {
  namespace crypto {
    export interface WordArray {
      words: number[];
      sigBytes: number;
      toString(encoder?: Encoder): string;
      concat(wordArray: WordArray): WordArray;
      clamp(): void;
      clone(): WordArray;
    }

    export interface Encoder {
      stringify(wordArray: WordArray): string;
      parse(str: string): WordArray;
    }

    export interface Hasher {
      reset(): Hasher;
      update(messageUpdate: WordArray | string): Hasher;
      finalize(messageUpdate?: WordArray | string): WordArray;
    }

    export interface Cipher {
      encrypt(message: WordArray | string, key: WordArray | string, cfg?: CipherOption): CipherParams;
      decrypt(ciphertext: CipherParams, key: WordArray | string, cfg?: CipherOption): WordArray;
    }

    export interface CipherParams {
      ciphertext: WordArray;
      key: WordArray;
      iv: WordArray;
      salt?: WordArray;
      algorithm?: Object;
      mode?: Object;
      padding?: Object;
      blockSize?: number;
      formatter?: Object;
    }

    export interface CipherOption {
      iv?: WordArray | string;
      mode?: Object;
      padding?: Object;
      blockSize?: number;
      formatter?: Object;
    }

    export interface Library {
      WordArray: {
        create(words?: number[] | ArrayBuffer, sigBytes?: number): WordArray;
        random(nBytes: number): WordArray;
      };
      CipherParams: {
        create(cipherParams: any): CipherParams;
      };
    }
  }

  export const lib: crypto.Library;
  
  // Fix the encoder definitions by providing proper types
  export const enc: {
    Hex: {
      stringify(wordArray: crypto.WordArray): string;
      parse(hexStr: string): crypto.WordArray;
    };
    Latin1: {
      stringify(wordArray: crypto.WordArray): string;
      parse(latin1Str: string): crypto.WordArray;
    };
    Utf8: {
      stringify(wordArray: crypto.WordArray): string;
      parse(utf8Str: string): crypto.WordArray;
    };
    Utf16: {
      stringify(wordArray: crypto.WordArray): string;
      parse(utf16Str: string): crypto.WordArray;
    };
    Utf16LE: {
      stringify(wordArray: crypto.WordArray): string;
      parse(utf16Str: string): crypto.WordArray;
    };
    Utf16BE: {
      stringify(wordArray: crypto.WordArray): string;
      parse(utf16Str: string): crypto.WordArray;
    };
    Base64: {
      stringify(wordArray: crypto.WordArray): string;
      parse(base64Str: string): crypto.WordArray;
    };
  };
  
  export const algo: {
    AES: Object;
    DES: Object;
    TripleDES: Object;
    RC4: Object;
    RC4Drop: Object;
    Rabbit: Object;
    RabbitLegacy: Object;
    HMAC: Object;
    PBKDF2: Object;
    SHA1: Object;
    SHA256: Object;
    SHA224: Object;
    SHA512: Object;
    SHA384: Object;
    SHA3: Object;
    RIPEMD160: Object;
    MD5: Object;
  };
  export const mode: {
    CBC: Object;
    CFB: Object;
    CTR: Object;
    ECB: Object;
    OFB: Object;
  };
  export const pad: {
    Pkcs7: Object;
    AnsiX923: Object;
    Iso10126: Object;
    Iso97971: Object;
    ZeroPadding: Object;
    NoPadding: Object;
  };
  export const format: {
    OpenSSL: Object;
    Hex: Object;
  };

  export function AES(
    message: crypto.WordArray | string,
    key: crypto.WordArray | string,
    cfg?: crypto.CipherOption
  ): crypto.CipherParams;

  export namespace AES {
    export function encrypt(
      message: crypto.WordArray | string,
      key: crypto.WordArray | string,
      cfg?: crypto.CipherOption
    ): crypto.CipherParams;
    export function decrypt(
      ciphertext: crypto.CipherParams | string,
      key: crypto.WordArray | string,
      cfg?: crypto.CipherOption
    ): crypto.WordArray;
  }

  export function PBKDF2(
    password: crypto.WordArray | string,
    salt: crypto.WordArray | string,
    cfg?: { keySize?: number; iterations?: number; hasher?: Object }
  ): crypto.WordArray;

  export function randomBytes(nBytes: number): crypto.WordArray;
  export function enc(data: crypto.WordArray): string;
}

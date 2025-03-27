
declare module 'crypto-js' {
  namespace lib {
    interface WordArray {
      words: number[];
      sigBytes: number;
      toString(encoder?: any): string;
      concat(wordArray: WordArray): WordArray;
      clamp(): void;
      clone(): WordArray;
      slice(start?: number, end?: number): WordArray;
    }

    interface CipherParams {
      ciphertext: WordArray;
      key: WordArray;
      iv: WordArray;
      salt?: WordArray;
      algorithm?: any;
      mode?: any;
      padding?: any;
      blockSize?: number;
      formatter?: any;
    }

    namespace WordArray {
      function create(words?: number[] | ArrayBuffer, sigBytes?: number): WordArray;
      function random(nBytes: number): WordArray;
    }

    namespace CipherParams {
      function create(cipherParams: any): CipherParams;
    }
  }

  interface Encoder {
    stringify(wordArray: lib.WordArray): string;
    parse(str: string): lib.WordArray;
  }

  namespace enc {
    const Hex: Encoder;
    const Latin1: Encoder;
    const Utf8: Encoder;
    const Utf16: Encoder;
    const Utf16LE: Encoder;
    const Utf16BE: Encoder;
    const Base64: Encoder;
  }

  namespace mode {
    const CBC: any;
    const CFB: any;
    const CTR: any;
    const ECB: any;
    const OFB: any;
  }

  namespace pad {
    const Pkcs7: any;
    const AnsiX923: any;
    const Iso10126: any;
    const Iso97971: any;
    const ZeroPadding: any;
    const NoPadding: any;
  }

  namespace format {
    const OpenSSL: any;
    const Hex: any;
  }

  namespace algo {
    const AES: any;
    const DES: any;
    const TripleDES: any;
    const RC4: any;
    const RC4Drop: any;
    const Rabbit: any;
    const RabbitLegacy: any;
    const HMAC: any;
    const PBKDF2: any;
    const SHA1: any;
    const SHA256: any;
    const SHA224: any;
    const SHA512: any;
    const SHA384: any;
    const SHA3: any;
    const RIPEMD160: any;
    const MD5: any;
  }

  function AES(
    message: lib.WordArray | string,
    key: lib.WordArray | string,
    cfg?: any
  ): lib.CipherParams;

  namespace AES {
    function encrypt(
      message: lib.WordArray | string,
      key: lib.WordArray | string,
      cfg?: any
    ): lib.CipherParams;
    function decrypt(
      ciphertext: lib.CipherParams | string,
      key: lib.WordArray | string,
      cfg?: any
    ): lib.WordArray;
  }

  function PBKDF2(
    password: lib.WordArray | string,
    salt: lib.WordArray | string,
    cfg?: { keySize?: number; iterations?: number; hasher?: any }
  ): lib.WordArray;
}

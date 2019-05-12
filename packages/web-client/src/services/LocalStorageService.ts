import { Concrete } from "../types/Concrete";

/**
 * @class LocalStorageServiceImpl
 * @description
 * Service for interacting with local storage in the browser.
 */
export class LocalStorageServiceImpl {
  private localStorage: Storage;

  /**
   * @constructor
   * Create a new local storage service using the default provider.
   */
  constructor(provider: Storage) {
    this.localStorage = provider;
  }

  /**
   * Fetch a value from local storage.
   * @param {String} key - The key of the value to fetch.
   */
  get(key: string) {
    return this.deserialize(this.localStorage.getItem(key));
  }

  /**
   * Write/overwrite a key/value pair to local storage.
   * @param {String} key
   * @param {any} val - Note that val will be reduced to a JSON representation
   *    in between fetches, and so certain information will be lost including
   *    any functions, its identity, and its prototype.
   */
  put(key: string, val: Concrete) {
    return this.localStorage.setItem(key, this.serialize(val));
  }

  /**
   * Remove a local storage key.
   * @param key
   */
  remove(key: string) {
    return this.localStorage.removeItem(key);
  }

  /**
   * Serialize the value for use in local storage.
   * @param {any} val - The value to serialize.
   * @return {String} The serialized value.
   */
  private serialize(val: null): null;
  private serialize(val: Concrete): string;
  private serialize(val: any): string | null {
    if (val === null) {
      return null;
    }
    return JSON.stringify(val);
  }
  /**
   * Deserialize a value previously serialized for local storage.
   * @param {String} val - The serialized value.
   * @return {any} The deserialized value.
   */
  private deserialize(val: string | null): any | null {
    if (val === null) {
      return null;
    }
    return JSON.parse(val);
  }
}

export let LocalStorageService = new LocalStorageServiceImpl(
  window.localStorage
);

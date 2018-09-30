import {
  LocalStorageService,
  LocalStorageServiceImpl
} from "./LocalStorageService";

interface ILocalStorageServiceImplMocks {
  // Mock storage provider
  provider?: Storage;
  key?: string;
  values?: {
    string?: string;
    object?: object;
  };
  originalStorage?: Storage;
}

interface ILocalStorageServiceImplSuite {
  // Store used by mock storage provider
  store?: {
    [key: string]: string;
  };
}

describe("service:LocalStorageService", function() {
  let mocks: ILocalStorageServiceImplMocks;
  let suite: ILocalStorageServiceImplSuite;

  describe("default service", function() {
    it("uses the local storage service impl", function() {
      // TODO: We should really test what provider is being used here.
      expect(LocalStorageService).toBeInstanceOf(LocalStorageServiceImpl);
    });
  });
  describe("class:LocalStorageServiceImpl", function() {
    let svc: LocalStorageServiceImpl;
    beforeEach(() => {
      suite = {
        store: {}
      };

      // Mocks
      mocks = {
        key: "some key",
        values: {
          object: {
            bar: 123,
            foo: "bar"
          },
          string: "some value"
        }
      };
      // Mock storage provider
      mocks.provider = {} as Storage;
      mocks.provider.prototype = Storage.prototype;

      // Stubs
      mocks.provider.setItem = jest.fn((k, v) => (suite.store[k] = v));
      mocks.provider.getItem = jest.fn(
        k => (suite.store.hasOwnProperty(k) ? suite.store[k] : null)
      );

      // Default service
      svc = new LocalStorageServiceImpl(mocks.provider);
    });

    afterEach(() => {
      svc = null;
      mocks = null;
      suite = null;
    });
    it("stores values as json in local storage", () => {
      const key = mocks.key;
      const val = mocks.values.object;
      const valJSON = JSON.stringify(val);
      svc.put(key, val);
      expect(mocks.provider.setItem).toHaveBeenCalledWith(key, valJSON);
    });

    it("reads and deserializes JSON from local storage", () => {
      const key = mocks.key;
      const val = mocks.values.object;

      // Mock a previously stored value
      suite.store[key] = JSON.stringify(val);

      const result = svc.get(key);
      expect(result).toEqual(val);
    });

    it("stores strings as JSON", () => {
      const key = mocks.key;
      const val = mocks.values.string;
      svc.put(key, val);
      expect(suite.store[key]).toEqual(JSON.stringify(val));
    });
  });
});

import { createDeferred, flushPromises } from "./test/testUtils";
import { settlePromises } from "./PromiseUtils";

describe("PromiseUtils", () => {
  describe("settlePromises", () => {
    it("resolves after all promises resolve/reject with an array of results", async () => {
      const deferreds = [createDeferred(), createDeferred(), createDeferred()];
      const settlePromise = makeQueryablePromise(
        settlePromises(deferreds.map(d => d.promise))
      );
      await flushPromises();
      expect(settlePromise.isPending).toBe(true);

      deferreds[0].resolve("lol");
      await flushPromises();
      expect(settlePromise.isPending).toBe(true);

      // it doesn't short circuit
      deferreds[1].reject("kek");
      await flushPromises();
      expect(settlePromise.isPending).toBe(true);

      const lastResult = {};
      deferreds[2].resolve(lastResult);
      await flushPromises();
      expect(settlePromise.isFulfilled).toBe(true);

      const result = await settlePromise;

      expect(result[0].isFulfilled).toBe(true);
      expect(result[0].isRejected).toBe(false);
      expect(result[0].reason()).toBeUndefined();
      expect(result[0].value()).toBe("lol");

      expect(result[1].isRejected).toBe(true);
      expect(result[1].isFulfilled).toBe(false);
      expect(result[1].reason()).toBe("kek");
      expect(result[1].value()).toBeUndefined();

      expect(result[2].isFulfilled).toBe(true);
      expect(result[2].isRejected).toBe(false);
      expect(result[2].reason()).toBeUndefined();
      expect(result[2].value()).toBe(lastResult);
    });
  });

  interface QueryablePromise<T> extends Promise<T> {
    isFulfilled: boolean;
    isRejected: boolean;
    isPending: boolean;
  }

  function makeQueryablePromise<T>(
    promise: PromiseLike<T>
  ): QueryablePromise<T> {
    const resultPromise = promise.then(
      result => {
        queryablePromise.isFulfilled = true;
        queryablePromise.isPending = false;
        return result;
      },
      reason => {
        queryablePromise.isRejected = true;
        queryablePromise.isPending = false;
        return Promise.reject(reason);
      }
    );
    const queryablePromise = resultPromise as QueryablePromise<T>;

    queryablePromise.isFulfilled = false;
    queryablePromise.isRejected = false;
    queryablePromise.isPending = true;
    return queryablePromise;
  }
});

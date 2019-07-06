export async function settlePromises<T>(
  promises: PromiseLike<T>[]
): Promise<SettledPromise<T>[]> {
  const results: SettledPromise<T>[] = [];
  for (const promise of promises) {
    results.push(await settlePromise(promise));
  }
  return results;
}

export async function settlePromise<T>(
  promise: PromiseLike<T>
): Promise<SettledPromise<T>> {
  let didReject = false;
  let resolvedValue: T | undefined;
  let rejectReason: any;
  try {
    resolvedValue = await promise;
  } catch (e) {
    didReject = true;
    rejectReason = e;
  }
  return {
    isFulfilled: !didReject,
    isRejected: didReject,
    reason: () => rejectReason,
    value: () => resolvedValue
  } as any;
}

export type SettledPromise<T> =
  | {
      isFulfilled: true;
      isRejected: false;
      value: () => T;
      reason: () => undefined;
    }
  | {
      isFulfilled: false;
      isRejected: true;
      value: () => undefined;
      reason: () => any;
    };

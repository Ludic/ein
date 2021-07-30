/** Move an async function into its own thread.
 *  @param {Function} asyncFunction  An (async) function to run in a Worker.
 *  @public
 */
export function greenlet(asyncFunction: any) {
	// A simple counter is used to generate worker-global unique ID's for RPC:
	let currentId = 0;

	// Outward-facing promises store their "controllers" (`[request, reject]`) here:
	const promises = {};

	// Use a data URI for the worker's src. It inlines the target function and an RPC handler:
	const script = '$$='+asyncFunction+';onmessage='+((e: any) => {
		/* global $$ */

		// Invoking within then() captures exceptions in the supplied async function as rejections
		Promise.resolve(e.data[1]).then(
      // @ts-ignore
			v => $$.apply($$, v)
		).then(
			// success handler - callback(id, SUCCESS(0), result)
			// if `d` is transferable transfer zero-copy

			d => {
				postMessage([e.data[0], 0, d], [d].filter(x => (
					(x instanceof ArrayBuffer) ||
					  (x instanceof MessagePort) ||
            // @ts-ignore
					  (self.ImageBitmap && x instanceof ImageBitmap)
				)));
			},
			// error handler - callback(id, ERROR(1), error)
			er => { postMessage([e.data[0], 1, '' + er]); }
		);
	});
	const workerURL = URL.createObjectURL(new Blob([script]));
	// Create an "inline" worker (1:1 at definition time)
	const worker = new Worker(workerURL);

	/** Handle RPC results/errors coming back out of the worker.
	 *  Messages coming from the worker take the form `[id, status, result]`:
	 *    id     - counter-based unique ID for the RPC call
	 *    status - 0 for success, 1 for failure
	 *    result - the result or error, depending on `status`
	 */
	worker.onmessage = (e: any) => {
		// invoke the promise's resolve() or reject() depending on whether there was an error.
    // @ts-ignore
		promises[e.data[0]][e.data[1]](e.data[2]);

		// ... then delete the promise controller
    // @ts-ignore
		promises[e.data[0]] = null;
	};

	// Return a proxy function that forwards calls to the worker & returns a promise for the result.
	return function(args: any): Promise<any> {
		args = [].slice.call(arguments);
		return new Promise(function () {
			// Add the promise controller to the registry
      // @ts-ignore
			promises[++currentId] = arguments;

			// Send an RPC call to the worker - call(id, params)
			// The filter is to provide a list of transferables to send zero-copy
			worker.postMessage([currentId, args], args.filter((x: any)=>(
				(x instanceof ArrayBuffer) ||
				  (x instanceof MessagePort) ||
          // @ts-ignore
				  (self.ImageBitmap && x instanceof ImageBitmap)
			)));
		});
	};
}


const toString = Object.prototype.toString
const hasOwnProperty = Object.prototype.hasOwnProperty

export function isObject(val: any): val is object {
  return val !== null && typeof val === 'object'
}

export const isArray = Array.isArray

export const isSymbol = (val: any): val is symbol => typeof val == 'symbol'

export function getType(val: any): string {
  return toString.call(val).slice(8, -1)
}

export function hasOwn(val: object, key: string | symbol): key is keyof typeof val {
  return hasOwnProperty.call(val, key)
}

export function hasChanged(value: any, oldValue: any): boolean {
  return value !== oldValue && (value === value || oldValue === oldValue)
}

export function setIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  // TEMP: use spread when this when vue bug is fixed https://github.com/vuejs/vue-next/issues/1210
  // return new Set([...setA].filter(i => setB.has(i)))
  let a = new Set<T>()
  setA.forEach(i => setB.has(i) ? a.add(i) : null)
  return a
}

export function setDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter(i => !setB.has(i)))
}

export function bitShift(count: number){
  return 1 << count
}

export function bitSet(num: number, bit: number){
  return num | bit
}

export function bitDel(num: number, bit: number){
  return num & ~bit
}

export function bitMask(num1: number, num2: number){
  return num1 & num2
}


/**
 * Type Utils
 */

// https://stackoverflow.com/a/52473108
// https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
type IfEquals<X, Y, A, B> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

// Alternatively:
/*
type IfEquals<X, Y, A, B> =
    [2] & [0, 1, X] extends [2] & [0, 1, Y] & [0, infer W, unknown]
    ? W extends 1 ? B : A
    : B;
*/

export type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P,
        never
      >
}[keyof T];
export type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

export type ExcludeFunctionProps<T> = Omit<T, { [K in keyof T]-?: T[K] extends (...any: [])=>any ? K : never }[keyof T]>


let perf = typeof window === 'undefined' ? undefined : window?.performance

if(typeof perf === 'undefined' && typeof require !== 'undefined'){
  perf = require('perf_hooks').performance
}

export const performance = perf as Performance

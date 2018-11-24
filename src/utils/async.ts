/*
 * types
 */
type AsyncMap = (args: any[], iterator: Function) => Promise<any>[];

type AsyncMapLimit = (
  args: any[],
  limit: number,
  iterator: Function,
  acc: any[]
) => Promise<any[]>;

type AsyncAwaitMap = (args: any[], iterator: Function) => Promise<any[]>;

/*
 * helper
 */
const asyncMap: AsyncMap = (args, iterator) => {
  return args.map(arg => {
    return new Promise((resolve, reject) => {
      resolve(iterator(arg));
    });
  });
};

export const asyncMapLimit: AsyncMapLimit = async (
  args,
  limit,
  iterator,
  acc
) => {
  const chunk = args.slice(0, limit);

  if (!chunk.length) return acc;

  return asyncMapLimit(args.slice(limit), limit, iterator, [
    ...acc,
    ...(await asyncAwaitMap(chunk, iterator))
  ]);
};

export const asyncAwaitMap: AsyncAwaitMap = async (args, iterator) => {
  const promises = asyncMap(args, iterator);

  return await Promise.all(promises).then(result => result);
};

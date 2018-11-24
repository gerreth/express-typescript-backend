export const merge = (arr: any[][]): any[] => {
  return [].concat(...arr);
};

export const removeDuplicates = (arr: any[], key: string) => {
  return arr.filter(
    (itam, index, self) => index === self.findIndex(t => t[key] === itam[key])
  );
};

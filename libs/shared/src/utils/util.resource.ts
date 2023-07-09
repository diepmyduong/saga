// wrapper for subject to add __subject property
export function Subject(type: string, data: any) {
  return {
    ...data,
    __subject: type,
  };
}

export const generateSlug = (name) => {
  return `${name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
};

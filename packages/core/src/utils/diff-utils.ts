/**
 * Deep difference and patching utility for JSON-serializable objects.
 */

export interface JsonDiff {
  type: "ADDED" | "REMOVED" | "UPDATED" | "ARRAY";
  path: string[];
  oldValue?: any;
  newValue?: any;
}

/**
 * Calculates the deep difference between two objects.
 */
export function calculateDeepDiff(
  oldObj: any,
  newObj: any,
  path: string[] = [],
): JsonDiff[] {
  const diffs: JsonDiff[] = [];

  if (oldObj === newObj) return diffs;

  if (typeof oldObj !== typeof newObj || oldObj === null || newObj === null) {
    diffs.push({ type: "UPDATED", path, oldValue: oldObj, newValue: newObj });
    return diffs;
  }

  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    // For simplicity, we treat arrays as updated if they change
    // A more complex implementation would do element-wise diffing
    if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
      diffs.push({ type: "ARRAY", path, oldValue: oldObj, newValue: newObj });
    }
    return diffs;
  }

  if (typeof oldObj === "object") {
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);

    // Added or Updated
    newKeys.forEach((key) => {
      if (!(key in oldObj)) {
        diffs.push({
          type: "ADDED",
          path: [...path, key],
          newValue: newObj[key],
        });
      } else {
        diffs.push(
          ...calculateDeepDiff(oldObj[key], newObj[key], [...path, key]),
        );
      }
    });

    // Removed
    oldKeys.forEach((key) => {
      if (!(key in newObj)) {
        diffs.push({
          type: "REMOVED",
          path: [...path, key],
          oldValue: oldObj[key],
        });
      }
    });
  } else {
    diffs.push({ type: "UPDATED", path, oldValue: oldObj, newValue: newObj });
  }

  return diffs;
}

/**
 * Applies a list of patches to an object to recreate a previous or next state.
 */
export function applyPatches(obj: any, patches: JsonDiff[]): any {
  const result = JSON.parse(JSON.stringify(obj)); // Deep clone

  patches.forEach((patch) => {
    let current = result;
    for (let i = 0; i < patch.path.length - 1; i++) {
      current = current[patch.path[i]];
    }

    const lastKey = patch.path[patch.path.length - 1];
    if (patch.type === "REMOVED") {
      delete current[lastKey];
    } else {
      current[lastKey] = patch.newValue;
    }
  });

  return result;
}

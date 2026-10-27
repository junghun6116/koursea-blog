import assert from 'node:assert/strict';
import { categoriesForTags, beautyShoppingPriority } from '../src/lib/category-hubs.ts';
assert.deepEqual(categoriesForTags(['post office', 'EMS', 'international shipping', 'shipping Korea cosmetics']).map(c => c.slug), ['travel']);
assert.ok(categoriesForTags(['Olive Young', 'cosmetics']).some(c => c.slug === 'healthcare'));
assert.ok(categoriesForTags(['skin clinic', 'Seoul']).some(c => c.slug === 'healthcare'));
assert.ok(beautyShoppingPriority(['Olive Young', 'shopping']) < beautyShoppingPriority(['skin clinic', 'beauty']));
assert.ok(categoriesForTags(['BTS', 'Seoul']).some(c => c.slug === 'kpop'));
console.log('Category regression tests passed (5 cases)');
